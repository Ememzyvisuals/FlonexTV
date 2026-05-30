import { NextRequest, NextResponse } from "next/server";

const GROQ_KEY = process.env.GROQ_API_KEY ?? "";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const TASK_TEMPLATES: Record<string, { title:string; description:string; placeholder:string }> = {
  technology: {
    title:"Build a Webpage",
    description:"Create a simple personal profile page using HTML and CSS. Must include: a heading with your name, a short bio paragraph, a list of 3 skills, and basic styling (colors, fonts, spacing). Paste the complete HTML below.",
    placeholder:"Paste your complete HTML here (include CSS inside a <style> tag)...",
  },
  business: {
    title:"Write a Business Plan Summary",
    description:"Write a 1-page business plan for a small business of your choice. Cover: the problem it solves, target audience, product/service, and 3 revenue streams.",
    placeholder:"Write your business plan here (minimum 200 words)...",
  },
  creative: {
    title:"Write a 60-Second Video Script",
    description:"Write a script for a YouTube Short or TikTok on any topic you're passionate about. Include: a hook (first 3 seconds), the main content, and a call-to-action at the end.",
    placeholder:"Write your video script here...",
  },
  faith: {
    title:"Leadership Reflection Essay",
    description:"Write a 300-word reflection on what servant leadership means to you. Include one real example of how you would apply it in your community or workplace.",
    placeholder:"Write your reflection here (minimum 200 words)...",
  },
  health: {
    title:"Design a 7-Day Wellness Plan",
    description:"Create a practical 7-day personal wellness plan with: a daily exercise routine (min 20 min), a sleep schedule, 3 healthy meal ideas, and one mindfulness practice per day.",
    placeholder:"Write your 7-day wellness plan here...",
  },
};

function getTask(cat: string, title: string) {
  const k = (cat||"").toLowerCase();
  for (const key of Object.keys(TASK_TEMPLATES)) {
    if (k.includes(key) || (title||"").toLowerCase().includes(key)) return TASK_TEMPLATES[key];
  }
  return {
    title:"Practical Application Task",
    description:`Apply what you learned in "${title}": write a 300-word explanation of the 3 most important concepts from this course and how you would use them in real life.`,
    placeholder:"Write your response here (minimum 200 words)...",
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { action, courseTitle, courseCategory, submission } = body;

  if (!GROQ_KEY) return NextResponse.json({ error:"GROQ_API_KEY not set" }, { status:503 });

  if (action === "generate") {
    return NextResponse.json({ task: getTask(courseCategory, courseTitle) });
  }

  if (action === "review") {
    if (!submission || submission.trim().length < 30) {
      return NextResponse.json({ error:"Submission too short — please complete the task fully." }, { status:400 });
    }
    const task = getTask(courseCategory, courseTitle);
    const prompt = `You are an expert instructor reviewing a student's practical assignment.

Course: "${courseTitle}" (${courseCategory})
Task: "${task.title}" — ${task.description}

Student submission:
"""
${submission.slice(0,4000)}
"""

Review honestly and constructively. Return JSON only:
{
  "passed": boolean,
  "score": 0-100,
  "verdict": "Excellent"|"Good"|"Needs Improvement"|"Incomplete",
  "strengths": ["str1","str2"],
  "improvements": ["imp1","imp2"],
  "overall": "2-3 sentence assessment",
  "certifiable": boolean
}

Pass if score >= 65. certifiable = passed. Max 3 items each in strengths/improvements. JSON only.`;

    try {
      const res = await fetch(GROQ_URL, {
        method:"POST",
        headers:{ Authorization:`Bearer ${GROQ_KEY}`, "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"llama-3.3-70b-versatile", max_tokens:600, temperature:0.2,
          messages:[
            { role:"system", content:"Return valid JSON only. No markdown." },
            { role:"user",   content:prompt },
          ],
        }),
      });
      const data  = await res.json();
      const raw   = data?.choices?.[0]?.message?.content ?? "{}";
      const clean = raw.replace(/```json|```/g,"").trim();
      const review = JSON.parse(clean);
      return NextResponse.json({ review }, { headers:{"Cache-Control":"no-store"} });
    } catch(e) {
      return NextResponse.json({ error:"Review failed", detail:String(e) }, { status:500 });
    }
  }

  return NextResponse.json({ error:"Invalid action" }, { status:400 });
}
