import { NextRequest, NextResponse } from "next/server";

const GROQ_KEY = process.env.GROQ_API_KEY ?? "";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * POST /api/courses/theory
 * Body: { moduleTitle, moduleDescription, courseTitle, courseCategory }
 * Returns: structured AI-generated course notes for the module
 */
export async function POST(req: NextRequest) {
  const { moduleTitle, moduleDescription, courseTitle, courseCategory } =
    await req.json().catch(() => ({}));

  if (!GROQ_KEY) {
    return NextResponse.json({ error: "GROQ_API_KEY not set" }, { status: 503 });
  }

  const prompt = `You are an expert instructor creating structured course notes for a learner.

Course: "${courseTitle}" (${courseCategory})
Module: "${moduleTitle}"
Context: ${moduleDescription || "No additional context provided."}

Write professional, beginner-friendly course notes for this module. Format as JSON only:

{
  "summary": "2-3 sentence overview of what this module covers",
  "concepts": [
    { "title": "Concept name", "explanation": "Clear explanation in plain English" }
  ],
  "steps": [
    "Step 1: ...",
    "Step 2: ..."
  ],
  "keyTakeaways": [
    "Takeaway 1",
    "Takeaway 2",
    "Takeaway 3"
  ],
  "practicalInsight": "One real-world application or pro tip relevant to this module"
}

Rules:
- Maximum 4 concepts, 5 steps, 4 takeaways
- Use plain language a beginner understands
- Be specific to the module topic
- No filler or generic advice
- Return valid JSON only, no markdown`;

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 800,
        temperature: 0.3,
        messages: [
          { role: "system", content: "Return valid JSON only. No markdown, no preamble." },
          { role: "user", content: prompt },
        ],
      }),
    });

    const data = await res.json();
    const raw  = data?.choices?.[0]?.message?.content ?? "{}";
    const clean = raw.replace(/```json|```/g, "").trim();
    const notes = JSON.parse(clean);

    return NextResponse.json({ notes }, {
      headers: { "Cache-Control": "s-maxage=86400" }, // cache 24h — same module = same notes
    });
  } catch (e) {
    return NextResponse.json({ error: "Theory generation failed", detail: String(e) }, { status: 500 });
  }
}
