import { NextRequest, NextResponse } from "next/server";

const GROQ_KEY = process.env.GROQ_API_KEY ?? "";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * POST /api/courses/exam
 * Body: { courseTitle, courseCategory, modules: [{title, description}], action: "generate"|"grade" }
 *
 * action=generate → returns 5 multiple-choice questions as JSON
 * action=grade    → also needs { questions, answers } → returns score + pass/fail
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { courseTitle, courseCategory, modules = [], action, questions, answers } = body;

  if (!GROQ_KEY) {
    return NextResponse.json({ error: "GROQ_API_KEY not configured." }, { status: 503 });
  }

  // ── Generate exam questions ─────────────────────────────────────
  if (action === "generate") {
    const moduleList = modules.slice(0, 8)
      .map((m: any, i: number) => `${i + 1}. ${m.title}`)
      .join("\n");

    const prompt = `You are an exam creator for the "${courseTitle}" (${courseCategory}) course.

Course modules covered:
${moduleList}

Generate exactly 10 multiple-choice exam questions that test knowledge from these topics.

STRICT JSON format — respond with ONLY this JSON, no other text:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correct": "A",
      "explanation": "Brief explanation of why A is correct."
    }
  ]
}

Requirements:
- Questions must be relevant to the course modules listed
- One clearly correct answer per question
- Options must be labelled A, B, C, D
- Mix difficulty: 3 easy, 4 medium, 3 hard
- Include concept-based and applied/practical questions
- No trick questions
- Each question must target a different concept`;

    try {
      const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model:       "llama-3.3-70b-versatile",
          max_tokens:  2000,
          temperature: 0.4,
          messages: [
            { role: "system", content: "You are an expert educator. Always respond with valid JSON only." },
            { role: "user",   content: prompt },
          ],
        }),
      });

      const data = await res.json();
      const raw  = data?.choices?.[0]?.message?.content ?? "{}";

      // Parse JSON — strip markdown fences if present
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      return NextResponse.json({ questions: parsed.questions ?? [] });
    } catch (e) {
      return NextResponse.json({ error: "Failed to generate exam questions.", detail: String(e) }, { status: 500 });
    }
  }

  // ── Grade exam answers ──────────────────────────────────────────
  if (action === "grade") {
    if (!questions?.length || !answers) {
      return NextResponse.json({ error: "questions and answers are required." }, { status: 400 });
    }

    let correct = 0;
    const results = questions.map((q: any) => {
      const userAnswer = answers[q.id];
      const isCorrect  = userAnswer === q.correct;
      if (isCorrect) correct++;
      return {
        id:          q.id,
        question:    q.question,
        userAnswer,
        correct:     q.correct,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const score   = Math.round((correct / questions.length) * 100);
    const passed  = score >= 70; // 70% pass threshold

    return NextResponse.json({ score, passed, correct, total: questions.length, results });
  }

  return NextResponse.json({ error: "Invalid action. Use generate or grade." }, { status: 400 });
}
