/**
 * FlonexTV Email System — Resend
 * FROM: set EMAIL_FROM=FlonexTV <onboarding@resend.dev> in Vercel env vars
 *       (use onboarding@resend.dev until your domain is verified in Resend)
 */

const RESEND_API = "https://api.resend.com/emails";
const RESEND_KEY = process.env.RESEND_API_KEY ?? "";
const FROM_EMAIL = process.env.EMAIL_FROM ?? "FlonexTV <onboarding@resend.dev>";
const SITE       = "https://flonextv.vercel.app";
const RED        = "#E50914";
const DARK       = "#0F0F0F";

export const HAS_EMAIL = () => RESEND_KEY.length > 8;

async function send(to: string, subject: string, html: string): Promise<boolean> {
  if (!HAS_EMAIL()) { console.warn("[email] RESEND_API_KEY not set"); return false; }
  try {
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("[email] Resend error:", res.status, err);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[email] send failed:", e);
    return false;
  }
}

/* ─── Shared layout ──────────────────────────────────────────── */
function layout(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>FlonexTV</title></head>
<body style="margin:0;padding:0;background:#111;font-family:'Helvetica Neue',Arial,sans-serif;color:#E5E5E5;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#111;padding:32px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#161616;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;">
  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#1a0000,#160303);padding:32px 40px 24px;border-bottom:3px solid ${RED};">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><table cellpadding="0" cellspacing="0"><tr>
        <td style="background:${RED};border-radius:50%;width:38px;height:38px;text-align:center;vertical-align:middle;">
          <span style="color:#fff;font-size:18px;font-weight:900;">▶</span>
        </td>
        <td style="padding-left:12px;vertical-align:middle;">
          <span style="font-size:24px;font-weight:900;color:#E5E5E5;letter-spacing:-.03em;">Flonex<span style="color:${RED};">TV</span></span>
        </td>
      </tr></table></td>
    </tr></table>
  </td></tr>
  <!-- Body -->
  <tr><td style="padding:32px 40px;">
    ${content}
  </td></tr>
  <!-- Footer -->
  <tr><td style="padding:20px 40px 28px;border-top:1px solid #222;text-align:center;">
    <p style="font-size:12px;color:#555;margin:0 0 6px;">FlonexTV · Free legal streaming & learning</p>
    <p style="font-size:11px;color:#444;margin:0;">
      <a href="${SITE}" style="color:#666;text-decoration:none;">${SITE}</a>
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

function btn(text: string, url: string, bg = RED) {
  return `<table cellpadding="0" cellspacing="0"><tr><td style="border-radius:8px;background:${bg};">
    <a href="${url}" style="display:inline-block;padding:12px 28px;color:#fff;font-weight:800;font-size:14px;text-decoration:none;border-radius:8px;">${text}</a>
  </td></tr></table>`;
}

function featureRow(icon: string, title: string, desc: string) {
  return `<tr><td style="padding:10px 0;border-bottom:1px solid #222;">
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="width:40px;height:40px;background:#1e0000;border-radius:8px;text-align:center;vertical-align:middle;font-size:18px;">${icon}</td>
      <td style="padding-left:14px;vertical-align:middle;">
        <p style="margin:0 0 2px;font-weight:800;font-size:14px;color:#E5E5E5;">${title}</p>
        <p style="margin:0;font-size:12px;color:#888;">${desc}</p>
      </td>
    </tr></table>
  </td></tr>`;
}

/* ─── 1. WELCOME EMAIL (on registration) ─────────────────────── */
export async function sendWelcomeEmail(to: string, name: string): Promise<boolean> {
  const displayName = name?.trim() || "there";
  const html = layout(`
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;letter-spacing:-.02em;">
      Welcome to FlonexTV, ${displayName}! 🎉
    </h1>
    <p style="margin:0 0 24px;font-size:14px;color:#888;line-height:1.6;">
      Your free account is ready. Here's everything FlonexTV gives you — completely free, forever.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      ${featureRow("🎬","Stream Free Movies","Nollywood, Bollywood, Hollywood & Korean films — legally free, no subscription.")}
      ${featureRow("📱","Comedy Shorts","Swipe through verified Nigerian creators: Mark Angel, Broda Shaggi, Taaooma & more.")}
      ${featureRow("🎓","Free Certified Courses","Tech, Business, Creative & more. Complete, pass the AI exam, earn real certificates.")}
      ${featureRow("🤖","AI-Powered Learning","AI generates your course notes, exam questions, and reviews your practical tasks.")}
      ${featureRow("🌍","9 Languages","Switch the full UI to Yoruba, Hausa, Igbo, French, Hindi, Korean & more.")}
      ${featureRow("✅","Zero Piracy","All content is legal: public domain, YouTube embeds, or Archive.org.")}
    </table>

    <p style="margin:0 0 16px;font-size:14px;font-weight:800;color:#E5E5E5;">Ready to start?</p>
    ${btn("▶ Start Watching Now", SITE)}

    <p style="margin:20px 0 0;font-size:13px;color:#666;line-height:1.6;">
      Start a course and earn your first certificate today. It's completely free — no credit card, no subscription.
    </p>
  `);
  return send(to, `Welcome to FlonexTV, ${displayName}! Your free account is ready 🎬`, html);
}

/* ─── 2. COURSE ENROLLED EMAIL ───────────────────────────────── */
export async function sendEnrolledEmail(to: string, name: string, courseTitle: string): Promise<boolean> {
  const html = layout(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:900;">Course Started! 📚</h1>
    <p style="margin:0 0 20px;font-size:14px;color:#888;">
      Hey ${name||"there"}, you just enrolled in:
    </p>
    <div style="background:#1a1a1a;border-left:4px solid ${RED};border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:24px;">
      <p style="margin:0;font-size:18px;font-weight:900;color:#E5E5E5;">${courseTitle}</p>
    </div>
    <p style="margin:0 0 20px;font-size:13px;color:#888;line-height:1.6;">
      Complete all modules → Take the AI exam → Submit a practical task → Get your certificate.
      Your progress is saved automatically.
    </p>
    ${btn("Continue Learning →", `${SITE}/#courses`)}
  `);
  return send(to, `You started: ${courseTitle} — FlonexTV`, html);
}

/* ─── 3. MILESTONE EMAIL (50% / 75%) ─────────────────────────── */
export async function sendMilestoneEmail(to: string, name: string, courseTitle: string, percent: number): Promise<boolean> {
  const isAlmost = percent >= 75;
  const html = layout(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:900;">
      ${isAlmost ? "Almost there!" : "Great progress!"} ${isAlmost ? "🏁" : "💪"}
    </h1>
    <p style="margin:0 0 20px;font-size:14px;color:#888;">
      Hey ${name||"there"} — you're <strong style="color:#E5E5E5;">${percent}% through</strong> <em>${courseTitle}</em>.
    </p>
    <div style="background:#1a1a1a;border-radius:8px;padding:16px;margin-bottom:24px;">
      <div style="background:#2a2a2a;border-radius:4px;height:8px;">
        <div style="background:${isAlmost ? "#22c55e" : RED};width:${percent}%;height:8px;border-radius:4px;"></div>
      </div>
      <p style="margin:8px 0 0;font-size:12px;color:#666;text-align:right;">${percent}% complete</p>
    </div>
    <p style="margin:0 0 20px;font-size:13px;color:#888;line-height:1.6;">
      ${isAlmost
        ? "You're so close to earning your certificate! Finish the remaining modules and take the exam."
        : "You're halfway there. Keep going — your certificate is waiting at the finish line."}
    </p>
    ${btn(isAlmost ? "Finish & Earn Certificate →" : "Keep Learning →", `${SITE}/#courses`)}
  `);
  return send(to, `${percent}% done: ${courseTitle} — FlonexTV`, html);
}

/* ─── 4. CERTIFICATE EMAIL ──────────────────────────────────────── */
export async function sendCertificateEmail(to: string, name: string, courseTitle: string, certId: string): Promise<boolean> {
  const html = layout(`
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:56px;margin-bottom:8px;">🏆</div>
      <h1 style="margin:0 0 6px;font-size:24px;font-weight:900;">Certificate Earned!</h1>
      <p style="margin:0;font-size:14px;color:#888;">Congratulations, ${name||"there"}</p>
    </div>

    <div style="background:linear-gradient(135deg,#1a0a00,#1a1a00);border:1px solid rgba(255,215,0,.2);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:11px;color:rgba(255,215,0,.6);text-transform:uppercase;letter-spacing:.1em;">Certificate of Completion</p>
      <p style="margin:0 0 8px;font-size:20px;font-weight:900;color:#FFD700;">${courseTitle}</p>
      <p style="margin:0;font-size:12px;color:#888;">Awarded to <strong style="color:#E5E5E5;">${name||"FlonexTV Student"}</strong></p>
      ${certId ? `<p style="margin:8px 0 0;font-size:10px;color:#555;">Certificate ID: ${certId}</p>` : ""}
    </div>

    <p style="margin:0 0 20px;font-size:13px;color:#888;line-height:1.6;">
      Your certificate is verifiable on FlonexTV. Share it on LinkedIn, add it to your portfolio, or use it to prove your skills to employers.
    </p>
    ${btn("View My Certificate 🏆", `${SITE}/#courses`)}

    <p style="margin:20px 0 0;font-size:13px;color:#666;">
      Ready for your next challenge? Explore more free courses on FlonexTV.
    </p>
  `);
  return send(to, `🏆 Certificate Earned: ${courseTitle} — FlonexTV`, html);
}

/* ─── 5. RE-ENGAGEMENT EMAIL (missed you) ────────────────────── */
/* Call this from a cron job or from /api/auth/register tracking */
export async function sendReEngagementEmail(to: string, name: string, daysSince: number): Promise<boolean> {
  const urgent = daysSince >= 14;
  const html = layout(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:900;">
      ${urgent ? "We miss you on FlonexTV 👋" : `It's been a while, ${name||"there"} 👋`}
    </h1>
    <p style="margin:0 0 20px;font-size:14px;color:#888;line-height:1.6;">
      Hey ${name||"there"}, you haven't visited FlonexTV in <strong style="color:#E5E5E5;">${daysSince} days</strong>.
      Here's what's waiting for you:
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      ${featureRow("🎬","New movies added","Fresh Nollywood, Bollywood & Korean films every week.")}
      ${featureRow("😂","Latest comedy shorts","New clips from Mark Angel, Broda Shaggi & friends.")}
      ${featureRow("🎓","Your courses await", urgent ? "Do not let your progress reset — keep going." : "Pick up your courses where you left off.")}
    </table>

    ${btn("▶ Return to FlonexTV", SITE)}

    <p style="margin:20px 0 0;font-size:12px;color:#555;">
      FlonexTV is always free. No subscription needed — just visit and enjoy.
    </p>
  `);
  const subj = urgent ? "We miss you 👋 — New content is waiting" : "Come back to FlonexTV — New content is waiting";
  return send(to, subj, html);
}
