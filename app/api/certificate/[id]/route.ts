import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, HAS_SUPABASE } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!HAS_SUPABASE) return NextResponse.json({ error: "DB not configured." }, { status: 503 });

  const { data, error } = await supabaseAdmin()
    .from("certificates")
    .select("*, courses(title, category)")
    .eq("id", id)
    .single();

  if (error || !data) return NextResponse.json({ error: "Certificate not found." }, { status: 404 });

  return NextResponse.json({
    id:               data.id,
    userName:         data.user_name,
    courseTitle:      data.course_title,
    issuedAt:         data.issued_at,
    verificationCode: data.verification_code,
    category:         data.courses?.category ?? "general",
    issuedBy:         "FlonexTV Learning Platform",
    verifyUrl:        `${req.nextUrl.origin}/api/certificate/${id}`,
  });
}
