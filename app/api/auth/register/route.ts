import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, HAS_SUPABASE } from "@/lib/supabase";
import { sendWelcomeEmail, HAS_EMAIL } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json().catch(() => ({}));

  if (!email?.includes("@") || !password || !name?.trim()) {
    return NextResponse.json({ error: "email, password, and name are required." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  if (!HAS_SUPABASE) {
    // Fallback: no DB, still send welcome email if key exists
    const sent = await sendWelcomeEmail(email, name);
    return NextResponse.json({ success: true, method: "local", emailSent: sent });
  }

  // Create Supabase Auth user
  const { data: authData, error: authErr } = await supabaseAdmin().auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { full_name: name },
  });

  if (authErr) {
    const msg = authErr.message.includes("already registered")
      ? "This email is already registered. Please sign in."
      : authErr.message;
    return NextResponse.json({ error: msg }, { status: 409 });
  }

  // Send welcome email — await so we can report status
  let emailSent = false;
  try { emailSent = await sendWelcomeEmail(email, name); } catch {}

  return NextResponse.json({
    success:   true,
    userId:    authData.user?.id,
    emailSent,
  });
}
