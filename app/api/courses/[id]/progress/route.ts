import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, HAS_SUPABASE } from "@/lib/supabase";
import { sendMilestoneEmail, sendCertificateEmail } from "@/lib/email";

/**
 * POST /api/courses/[id]/progress
 * Body: { userId, modulePosition, totalModules, userName, userEmail, courseTitle }
 *
 * 1. Updates completed_modules array
 * 2. Recalculates percent_complete
 * 3. If newly reached 50% or 75% → sends progress email
 * 4. If 100% → issues certificate + sends certificate email
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: courseId } = await params;
  const body = await req.json().catch(() => ({}));
  const { userId, modulePosition, totalModules, userName, userEmail, courseTitle } = body;

  if (!userId || !modulePosition) {
    return NextResponse.json({ error: "userId and modulePosition are required." }, { status: 400 });
  }

  const pos    = Number(modulePosition);
  const total  = Number(totalModules) || 1;

  // ── LocalStorage mode (no Supabase) ──────────────────────────────────────
  if (!HAS_SUPABASE) {
    const percent = Math.round((pos / total) * 100);
    const complete = percent >= 100;
    return NextResponse.json({ percent, isCompleted: complete, source: "local" });
  }

  // ── Supabase mode ────────────────────────────────────────────────────────
  // Fetch or create progress record
  const { data: existing } = await supabaseAdmin()
    .from("course_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  const prevCompleted: number[] = existing?.completed_modules ?? [];
  const alreadyDone = prevCompleted.includes(pos);

  // Add module to completed set
  const completedSet = new Set([...prevCompleted, pos]);
  const completedArr = Array.from(completedSet).sort((a, b) => a - b);
  const percent      = Math.round((completedArr.length / total) * 100);
  const isCompleted  = percent >= 100;
  const wasCompleted = existing?.is_completed ?? false;

  // Upsert progress
  await supabaseAdmin().from("course_progress").upsert({
    user_id:           userId,
    course_id:         courseId,
    completed_modules: completedArr,
    percent_complete:  percent,
    is_completed:      isCompleted,
    last_watched_at:   new Date().toISOString(),
    ...(isCompleted && !wasCompleted ? { completed_at: new Date().toISOString() } : {}),
  }, { onConflict: "user_id,course_id" });

  let certificateId = existing?.certificate_id ?? null;

  // ── Certificate + email on completion ────────────────────────────────────
  if (isCompleted && !wasCompleted && userName && userEmail && courseTitle) {
    const { data: cert } = await supabaseAdmin()
      .from("certificates")
      .upsert({
        user_id:      userId,
        course_id:    courseId,
        user_name:    userName,
        course_title: courseTitle,
      }, { onConflict: "user_id,course_id" })
      .select("id, verification_code")
      .single();

    if (cert) {
      certificateId = cert.id;
      const dateStr = new Date().toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" });
      sendCertificateEmail(userEmail, userName, courseTitle, cert.id).catch(() => {});
    }
  }

  // ── Progress milestone emails (50% and 75%) ───────────────────────────────
  if (!alreadyDone && userEmail && userName && courseTitle) {
    const prevPct = Math.round((prevCompleted.length / total) * 100);
    const milestones = [50, 75];
    for (const m of milestones) {
      if (prevPct < m && percent >= m && !isCompleted) {
        sendMilestoneEmail(userEmail, userName, courseTitle, percent).catch(() => {});
        break;
      }
    }
  }

  return NextResponse.json({
    percent, isCompleted, certificateId,
    completedModules: completedArr,
  });
}

/**
 * GET /api/courses/[id]/progress?userId=xxx
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: courseId } = await params;
  const userId = req.nextUrl.searchParams.get("userId") ?? "";
  if (!userId || !HAS_SUPABASE) return NextResponse.json({ percent:0, completedModules:[], isCompleted:false });

  const { data } = await supabaseAdmin()
    .from("course_progress")
    .select("*, certificates(id, verification_code)")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  return NextResponse.json({
    percent:          data?.percent_complete ?? 0,
    completedModules: data?.completed_modules ?? [],
    isCompleted:      data?.is_completed ?? false,
    certificateId:    data?.certificates?.[0]?.id ?? null,
    verificationCode: data?.certificates?.[0]?.verification_code ?? null,
  });
}
