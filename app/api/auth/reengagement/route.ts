import { NextRequest, NextResponse } from "next/server";
import { sendReEngagementEmail, HAS_EMAIL } from "@/lib/email";
import { supabaseAdmin, HAS_SUPABASE } from "@/lib/supabase";

/**
 * POST /api/auth/reengagement
 * Called by a Vercel Cron Job (vercel.json) daily.
 * Finds users who haven't visited in 7+ days and emails them.
 *
 * Also:
 * POST with { userId, action:"ping" } — user visited, update last_seen
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  // ── Ping: user just visited — update last_seen ──────────────
  if (body.action === "ping" && body.userId) {
    if (HAS_SUPABASE) {
      try {
        await supabaseAdmin()
          .from("profiles")
          .update({ last_seen: new Date().toISOString() })
          .eq("id", body.userId);
      } catch {}
    }
    return NextResponse.json({ ok: true });
  }

  // ── Cron: find inactive users and re-engage ─────────────────
  // Verify cron secret to prevent abuse
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET ?? "flonextv-cron"}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!HAS_SUPABASE || !HAS_EMAIL()) {
    return NextResponse.json({ error: "Supabase or Email not configured" }, { status: 503 });
  }

  const sevenDaysAgo  = new Date(Date.now() - 7  * 86400000).toISOString();
  const fourteenDays  = new Date(Date.now() - 14 * 86400000).toISOString();

  try {
    // Users inactive 7-13 days
    const { data: week } = await supabaseAdmin()
      .from("profiles")
      .select("id, email, name, last_seen")
      .lt("last_seen", sevenDaysAgo)
      .gte("last_seen", fourteenDays)
      .eq("re_engaged_7d", false)
      .limit(50);

    // Users inactive 14+ days
    const { data: two_weeks } = await supabaseAdmin()
      .from("profiles")
      .select("id, email, name, last_seen")
      .lt("last_seen", fourteenDays)
      .eq("re_engaged_14d", false)
      .limit(50);

    let sent = 0;
    for (const user of [...(week||[]), ...(two_weeks||[])]) {
      if (!user.email) continue;
      const days = Math.round((Date.now() - new Date(user.last_seen).getTime()) / 86400000);
      const ok   = await sendReEngagementEmail(user.email, user.name, days);
      if (ok) {
        sent++;
        // Mark as re-engaged so we don't spam
        const flag = days >= 14 ? "re_engaged_14d" : "re_engaged_7d";
        await supabaseAdmin().from("profiles").update({ [flag]: true }).eq("id", user.id);
      }
    }
    return NextResponse.json({ sent, week: week?.length, two_weeks: two_weeks?.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
