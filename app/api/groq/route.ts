import { NextRequest, NextResponse } from "next/server";

const KEY   = process.env.GROQ_API_KEY ?? "";
const GROQ  = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export async function POST(req: NextRequest) {
  const { type, payload } = await req.json().catch(() => ({}));
  const PROMPTS: Record<string, { system: string; user: string }> = {
    recommend: {
      system: `You are FlonexTV AI. Given a mood or genre, recommend 5 movies/shows.
Numbered list ONLY. Each: **Title (Year)** — one sentence reason. No preamble.`,
      user: payload?.query ?? "",
    },
    similar: {
      system: `You are FlonexTV AI. List 5 movies/shows similar to the title given.
Numbered list. **Title (Year)** — one sentence reason.`,
      user: `Similar to: ${payload?.title ?? ""}`,
    },
    synopsis: {
      system: `You are FlonexTV AI. Write a punchy 2-sentence synopsis that hooks the viewer. No spoilers.`,
      user: `Title: ${payload?.title} (${payload?.year}). Genres: ${payload?.genres}. Plot: ${payload?.overview}`,
    },
    trivia: {
      system: `You are FlonexTV AI. Share 3 interesting behind-the-scenes facts. Each 1-2 sentences. Numbered list.`,
      user: `Movie: ${payload?.title} (${payload?.year})`,
    },
  };
  const prompt = PROMPTS[type];
  if (!prompt) return NextResponse.json({ text: "Unknown request type." });
  if (!KEY) return NextResponse.json({ text: "⚠️ GROQ_API_KEY not set in environment variables." });
  try {
    const res = await fetch(GROQ, {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model:MODEL, messages:[
        {role:"system",content:prompt.system},
        {role:"user",  content:prompt.user},
      ], max_tokens:600, temperature:0.75 }),
    });
    const data = await res.json();
    return NextResponse.json({ text: data?.choices?.[0]?.message?.content ?? "No response." });
  } catch { return NextResponse.json({ text: "AI temporarily unavailable." }); }
}
