import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail, HAS_EMAIL } from "@/lib/email";

export async function GET(req: NextRequest) {
  const to = req.nextUrl.searchParams.get("to") ?? "";

  const config = {
    hasApiKey:  HAS_EMAIL(),
    apiKeyLen:  (process.env.RESEND_API_KEY ?? "").length,
    fromEmail:  process.env.EMAIL_FROM ?? "(not set — default: FlonexTV <onboarding@resend.dev>)",
    recipient:  to || "(no ?to= provided)",
  };

  if (!to.includes("@")) {
    return NextResponse.json({
      status: "config_check", config,
      nextStep: !HAS_EMAIL()
        ? "⚠️ RESEND_API_KEY is missing. Set it in Vercel → Settings → Environment Variables → Redeploy."
        : "✅ Key found. Add ?to=your@email.com to this URL to send a test email.",
    });
  }

  try {
    const sent = await sendWelcomeEmail(to, "Test User");
    return NextResponse.json({ status: sent ? "✅ Email sent!" : "❌ Send failed", config });
  } catch (e) {
    return NextResponse.json({ status: "❌ Error", error: String(e), config }, { status: 500 });
  }
}
