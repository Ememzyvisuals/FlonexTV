import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, HAS_SUPABASE } from "@/lib/supabase";

// Fallback static courses when DB not configured
const STATIC_COURSES = [
  {
    id: "course-web-dev", slug: "web-dev-beginners",
    title: "Web Development for Beginners",
    description: "Learn HTML, CSS, and JavaScript from scratch. Build your first website.",
    thumbnail: "https://img.youtube.com/vi/UB1O30fR-EE/hqdefault.jpg",
    category: "technology", level: "beginner", language: "en",
    duration_min: 120, total_modules: 8, is_free: true,
    modules: [
      { id:"m1", position:1, title:"Introduction to HTML",        youtube_id:"UB1O30fR-EE", duration_min:15 },
      { id:"m2", position:2, title:"CSS Styling & Layout",        youtube_id:"yfoY53QXEnI", duration_min:18 },
      { id:"m3", position:3, title:"Flexbox & CSS Grid",          youtube_id:"JJSoEo8JSnc", duration_min:20 },
      { id:"m4", position:4, title:"JavaScript Basics",           youtube_id:"PkZNo7MFNFg", duration_min:25 },
      { id:"m5", position:5, title:"DOM Manipulation",            youtube_id:"y17RuWkWdn8", duration_min:20 },
      { id:"m6", position:6, title:"Building a Project",          youtube_id:"PlxWf493en4", duration_min:22 },
      { id:"m7", position:7, title:"Responsive Design",           youtube_id:"srvUrASNj0s", duration_min:15 },
      { id:"m8", position:8, title:"Publishing Your Website",     youtube_id:"NqsTm9L3jGw", duration_min:12 },
    ],
  },
  {
    id: "course-python", slug: "python-programming",
    title: "Python Programming Fundamentals",
    description: "Master Python basics — variables, loops, functions, and OOP.",
    thumbnail: "https://img.youtube.com/vi/rfscVS0vtbw/hqdefault.jpg",
    category: "technology", level: "beginner", language: "en",
    duration_min: 90, total_modules: 6, is_free: true,
    modules: [
      { id:"p1", position:1, title:"Python Setup & First Program",youtube_id:"rfscVS0vtbw", duration_min:15 },
      { id:"p2", position:2, title:"Variables & Data Types",       youtube_id:"KgAGf8TJfCE", duration_min:18 },
      { id:"p3", position:3, title:"Control Flow",                 youtube_id:"DZwmZ8Usvnk", duration_min:20 },
      { id:"p4", position:4, title:"Functions & Modules",          youtube_id:"9Os0o3wzS_I", duration_min:22 },
      { id:"p5", position:5, title:"Lists, Dicts & Tuples",        youtube_id:"9OeznAkyQMs", duration_min:20 },
      { id:"p6", position:6, title:"Final Project: Calculator",    youtube_id:"Y6_O_9mMKWg", duration_min:18 },
    ],
  },
  {
    id: "course-business", slug: "business-success",
    title: "Building a Successful Business",
    description: "Practical guide to starting and growing a profitable business.",
    thumbnail: "https://img.youtube.com/vi/IrKn5CnDI90/hqdefault.jpg",
    category: "business", level: "beginner", language: "en",
    duration_min: 60, total_modules: 5, is_free: true,
    modules: [
      { id:"b1", position:1, title:"Finding Your Business Idea",   youtube_id:"IrKn5CnDI90", duration_min:12 },
      { id:"b2", position:2, title:"Business Plan Basics",         youtube_id:"sDPk3e4jdME", duration_min:14 },
      { id:"b3", position:3, title:"Marketing on a Budget",        youtube_id:"nU-IIXBWlS4", duration_min:13 },
      { id:"b4", position:4, title:"Managing Finances",            youtube_id:"5k_GnEPKrks", duration_min:12 },
      { id:"b5", position:5, title:"Scaling Your Business",        youtube_id:"J4e5OKqMKHk", duration_min:14 },
    ],
  },
  {
    id: "course-faith", slug: "christian-leadership",
    title: "Christian Leadership Principles",
    description: "Biblical foundations of leadership, character, and purpose-driven living.",
    thumbnail: "https://img.youtube.com/vi/eHWCFBCXxIs/hqdefault.jpg",
    category: "faith", level: "beginner", language: "en",
    duration_min: 75, total_modules: 6, is_free: true,
    modules: [
      { id:"f1", position:1, title:"The Heart of a Leader",        youtube_id:"eHWCFBCXxIs", duration_min:13 },
      { id:"f2", position:2, title:"Servant Leadership",           youtube_id:"Tc1IQCnzX6I", duration_min:12 },
      { id:"f3", position:3, title:"Vision & Purpose",             youtube_id:"j3n5fHGBKl0", duration_min:14 },
      { id:"f4", position:4, title:"Building Strong Teams",        youtube_id:"8u4-H4gFIXs", duration_min:13 },
      { id:"f5", position:5, title:"Overcoming Challenges",        youtube_id:"mgmVOuLgFB0", duration_min:12 },
      { id:"f6", position:6, title:"Legacy & Impact",              youtube_id:"0tqq66zwa68", duration_min:11 },
    ],
  },
  {
    id: "course-marketing", slug: "digital-marketing",
    title: "Digital Marketing Masterclass",
    description: "Social media, SEO, content marketing, and paid ads — complete guide.",
    thumbnail: "https://img.youtube.com/vi/nU-IIXBWlS4/hqdefault.jpg",
    category: "business", level: "beginner", language: "en",
    duration_min: 100, total_modules: 7, is_free: true,
    modules: [
      { id:"dm1", position:1, title:"Digital Marketing Overview",  youtube_id:"nU-IIXBWlS4", duration_min:14 },
      { id:"dm2", position:2, title:"Social Media Strategy",       youtube_id:"2cmF3fBaQpY", duration_min:16 },
      { id:"dm3", position:3, title:"SEO Fundamentals",            youtube_id:"xsVTqzratPs", duration_min:15 },
      { id:"dm4", position:4, title:"Content Marketing",           youtube_id:"iim7mMU30_g", duration_min:14 },
      { id:"dm5", position:5, title:"Email Marketing",             youtube_id:"Qhy1H4CuJjk", duration_min:13 },
      { id:"dm6", position:6, title:"Paid Advertising (Ads)",      youtube_id:"1MiyokSB0Q0", duration_min:15 },
      { id:"dm7", position:7, title:"Analytics & Measurement",     youtube_id:"WlGLX5lKAcc", duration_min:14 },
    ],
  },
  {
    id: "course-health", slug: "mental-health-wellness",
    title: "Mental Health & Wellness",
    description: "Understanding mental health, managing stress, anxiety, and building resilience.",
    thumbnail: "https://img.youtube.com/vi/rkZl2gsLUp4/hqdefault.jpg",
    category: "health", level: "beginner", language: "en",
    duration_min: 80, total_modules: 6, is_free: true,
    modules: [
      { id:"h1", position:1, title:"Understanding Mental Health",  youtube_id:"rkZl2gsLUp4", duration_min:13 },
      { id:"h2", position:2, title:"Managing Stress",              youtube_id:"0QXmaC8EqEA", duration_min:14 },
      { id:"h3", position:3, title:"Dealing with Anxiety",         youtube_id:"ZidGozDhOjg", duration_min:14 },
      { id:"h4", position:4, title:"Building Resilience",          youtube_id:"XRii0ZkCE3s", duration_min:13 },
      { id:"h5", position:5, title:"Healthy Sleep Habits",         youtube_id:"nm1TxQj9IsQ", duration_min:12 },
      { id:"h6", position:6, title:"Daily Wellness Practices",     youtube_id:"Fh0OUJFiXe0", duration_min:14 },
    ],
  },
  // ── TECH: Frontend Development ────────────────────────────────────
  {
    id: "course-frontend", slug: "frontend-development-basics",
    title: "Frontend Development Basics",
    description: "Master HTML, CSS, JavaScript, and React to build modern, responsive websites from scratch.",
    thumbnail: "https://img.youtube.com/vi/G3e-cpL7ofc/hqdefault.jpg",
    category: "technology", level: "beginner", language: "en",
    duration_min: 110, total_modules: 7, is_free: true,
    modules: [
      { id:"fe1", position:1, title:"HTML Structure & Semantics",   youtube_id:"G3e-cpL7ofc", duration_min:16 },
      { id:"fe2", position:2, title:"CSS Fundamentals",             youtube_id:"1Rs2ND1ryYc", duration_min:17 },
      { id:"fe3", position:3, title:"CSS Flexbox Mastery",          youtube_id:"phWxA89Dy94", duration_min:14 },
      { id:"fe4", position:4, title:"JavaScript for the Web",       youtube_id:"W6NZfCO5SIk", duration_min:16 },
      { id:"fe5", position:5, title:"DOM & Events",                  youtube_id:"0ik6X4DJKCc", duration_min:15 },
      { id:"fe6", position:6, title:"React Basics",                  youtube_id:"SqcY0GlETPk", duration_min:18 },
      { id:"fe7", position:7, title:"Build & Deploy a Website",      youtube_id:"O5cmLDVTgAs", duration_min:14 },
    ],
  },
  // ── TECH: Backend Development ─────────────────────────────────────
  {
    id: "course-backend", slug: "backend-development-basics",
    title: "Backend Development Basics",
    description: "Learn Node.js, Express, REST APIs, and databases to power web applications.",
    thumbnail: "https://img.youtube.com/vi/Oe421EPjeBE/hqdefault.jpg",
    category: "technology", level: "beginner", language: "en",
    duration_min: 100, total_modules: 6, is_free: true,
    modules: [
      { id:"be1", position:1, title:"How the Web Works (HTTP)",     youtube_id:"TNQsmPf24go", duration_min:14 },
      { id:"be2", position:2, title:"Node.js Introduction",         youtube_id:"TlB_eWDSMt4", duration_min:18 },
      { id:"be3", position:3, title:"Express.js & Routing",         youtube_id:"L72fhGm1tfE", duration_min:17 },
      { id:"be4", position:4, title:"REST API Design",              youtube_id:"lsMQRaeKNDk", duration_min:18 },
      { id:"be5", position:5, title:"Databases: SQL vs NoSQL",      youtube_id:"Tk1t3WKK-ZY", duration_min:15 },
      { id:"be6", position:6, title:"Deploy Your API",              youtube_id:"ysEN5RaKOlA", duration_min:18 },
    ],
  },
  // ── TECH: Git & GitHub ────────────────────────────────────────────
  {
    id: "course-git", slug: "git-and-github",
    title: "Git & GitHub for Beginners",
    description: "Learn version control with Git and collaboration with GitHub — essential for every developer.",
    thumbnail: "https://img.youtube.com/vi/RGOj5yH7evk/hqdefault.jpg",
    category: "technology", level: "beginner", language: "en",
    duration_min: 60, total_modules: 5, is_free: true,
    modules: [
      { id:"git1", position:1, title:"What is Version Control?",    youtube_id:"RGOj5yH7evk", duration_min:12 },
      { id:"git2", position:2, title:"Git Install & First Commit",  youtube_id:"HVsySz-h9r4", duration_min:14 },
      { id:"git3", position:3, title:"Branches & Merging",          youtube_id:"QV0kVNvkMxc", duration_min:12 },
      { id:"git4", position:4, title:"GitHub: Push & Pull",         youtube_id:"nhNq2kIvi9s", duration_min:11 },
      { id:"git5", position:5, title:"Pull Requests & Workflows",   youtube_id:"For9VtrQx58", duration_min:11 },
    ],
  },
  // ── BUSINESS: Freelancing ─────────────────────────────────────────
  {
    id: "course-freelance", slug: "freelancing-for-beginners",
    title: "Freelancing for Beginners",
    description: "Start earning online with freelancing. Set up your profile, land clients, and get paid.",
    thumbnail: "https://img.youtube.com/vi/i6_RuZKBNUo/hqdefault.jpg",
    category: "business", level: "beginner", language: "en",
    duration_min: 65, total_modules: 5, is_free: true,
    modules: [
      { id:"fl1", position:1, title:"Freelancing 101 — Getting Started", youtube_id:"i6_RuZKBNUo", duration_min:13 },
      { id:"fl2", position:2, title:"Choose Your Niche & Services",       youtube_id:"JmAom2j_Yzg", duration_min:14 },
      { id:"fl3", position:3, title:"Fiverr & Upwork Profile Setup",      youtube_id:"0XdRSqPqZwY", duration_min:13 },
      { id:"fl4", position:4, title:"Writing Winning Proposals",          youtube_id:"MkLhQ0sAIg0", duration_min:12 },
      { id:"fl5", position:5, title:"Pricing & Getting Paid",             youtube_id:"bEQ5xhgIZt0", duration_min:13 },
    ],
  },
  // ── BUSINESS: Personal Branding ───────────────────────────────────
  {
    id: "course-branding", slug: "personal-branding",
    title: "Personal Branding Masterclass",
    description: "Build a strong personal brand online that attracts clients, jobs, and opportunities.",
    thumbnail: "https://img.youtube.com/vi/hm6ZSdpCKkk/hqdefault.jpg",
    category: "business", level: "beginner", language: "en",
    duration_min: 55, total_modules: 5, is_free: true,
    modules: [
      { id:"pb1", position:1, title:"What Is Personal Branding?",   youtube_id:"hm6ZSdpCKkk", duration_min:11 },
      { id:"pb2", position:2, title:"Define Your Unique Value",      youtube_id:"Qy2A_yJH5k0", duration_min:12 },
      { id:"pb3", position:3, title:"LinkedIn Profile Optimisation", youtube_id:"BQkFvKJj82g", duration_min:11 },
      { id:"pb4", position:4, title:"Content Strategy for Growth",   youtube_id:"f4Dn9kIQN1c", duration_min:11 },
      { id:"pb5", position:5, title:"Consistency & Long-Term Growth",youtube_id:"IrKn5CnDI90", duration_min:10 },
    ],
  },
  // ── CREATIVE: Video Editing ───────────────────────────────────────
  {
    id: "course-video-edit", slug: "video-editing-basics",
    title: "Video Editing Basics",
    description: "Learn video editing from scratch using free tools. Create professional-looking videos.",
    thumbnail: "https://img.youtube.com/vi/u15ZRXS4Vek/hqdefault.jpg",
    category: "creative", level: "beginner", language: "en",
    duration_min: 75, total_modules: 6, is_free: true,
    modules: [
      { id:"ve1", position:1, title:"Video Editing Fundamentals",   youtube_id:"u15ZRXS4Vek", duration_min:13 },
      { id:"ve2", position:2, title:"DaVinci Resolve Free Setup",   youtube_id:"63Ln33O4p4c", duration_min:13 },
      { id:"ve3", position:3, title:"Cutting & Trimming Clips",     youtube_id:"sS5EFyNkblI", duration_min:12 },
      { id:"ve4", position:4, title:"Adding Music & Sound Effects", youtube_id:"FxAd_JGphe8", duration_min:12 },
      { id:"ve5", position:5, title:"Colour Grading Basics",        youtube_id:"pnbdpD8TGRY", duration_min:13 },
      { id:"ve6", position:6, title:"Export for YouTube & Social",  youtube_id:"AiHHiMFl8tI", duration_min:12 },
    ],
  },
  // ── CREATIVE: Content Creation ────────────────────────────────────
  {
    id: "course-content", slug: "content-creation",
    title: "Content Creation for Beginners",
    description: "Learn to create content for YouTube, Instagram, and TikTok that grows an audience.",
    thumbnail: "https://img.youtube.com/vi/iim7mMU30_g/hqdefault.jpg",
    category: "creative", level: "beginner", language: "en",
    duration_min: 70, total_modules: 6, is_free: true,
    modules: [
      { id:"cc1", position:1, title:"What Makes Content Go Viral?",  youtube_id:"iim7mMU30_g", duration_min:12 },
      { id:"cc2", position:2, title:"Choosing Your Platform",        youtube_id:"2cmF3fBaQpY", duration_min:12 },
      { id:"cc3", position:3, title:"Planning & Scripting Content",  youtube_id:"f4Dn9kIQN1c", duration_min:12 },
      { id:"cc4", position:4, title:"Filming with Your Phone",       youtube_id:"2AUvVOl8jSY", duration_min:12 },
      { id:"cc5", position:5, title:"Writing Captions & Hooks",      youtube_id:"Qhy1H4CuJjk", duration_min:11 },
      { id:"cc6", position:6, title:"Growing & Monetising",          youtube_id:"WlGLX5lKAcc", duration_min:11 },
    ],
  },

  {
    id: "course-ai-ml", slug: "ai-machine-learning",
    title: "AI & Machine Learning Basics",
    description: "Learn the fundamentals of Artificial Intelligence and Machine Learning. Understand how AI works, build your first ML model, and learn to use tools like Python, scikit-learn, and modern AI APIs.",
    category: "technology",
    thumbnail: "https://img.youtube.com/vi/GwIo3gDZCVQ/maxresdefault.jpg",
    duration_min: 110, total_modules: 7, is_free: true,
    modules: [
      { id:"ai1", position:1, title:"What is AI & Machine Learning?",       youtube_id:"GwIo3gDZCVQ", duration_min:16 },
      { id:"ai2", position:2, title:"Python for Data Science",               youtube_id:"rfscVS0vtbw", duration_min:18 },
      { id:"ai3", position:3, title:"Data & Datasets Explained",             youtube_id:"zeat3VGDfc0", duration_min:14 },
      { id:"ai4", position:4, title:"Training Your First ML Model",          youtube_id:"i_LwzRVP7bg", duration_min:17 },
      { id:"ai5", position:5, title:"Neural Networks Simplified",            youtube_id:"aircAruvnKk", duration_min:16 },
      { id:"ai6", position:6, title:"Using OpenAI & Groq APIs",              youtube_id:"1bUy-1hGZpI", duration_min:15 },
      { id:"ai7", position:7, title:"Build an AI Chatbot with Python",       youtube_id:"pJSITl_KBQY", duration_min:14 },
    ],
  },
  {
    id: "course-data-science", slug: "data-science-beginners",
    title: "Data Science for Beginners",
    description: "Understand how to collect, clean, analyse and visualise data. Learn pandas, numpy, and matplotlib to turn raw data into meaningful insights. Perfect for beginners with no prior experience.",
    category: "technology",
    thumbnail: "https://img.youtube.com/vi/ua-CiDNNj30/maxresdefault.jpg",
    duration_min: 95, total_modules: 6, is_free: true,
    modules: [
      { id:"ds1", position:1, title:"What is Data Science?",                 youtube_id:"ua-CiDNNj30", duration_min:14 },
      { id:"ds2", position:2, title:"Python & Jupyter Notebooks",            youtube_id:"7eh4d9ejbtY", duration_min:16 },
      { id:"ds3", position:3, title:"Data Cleaning with Pandas",             youtube_id:"bDhvCp3_lYw", duration_min:18 },
      { id:"ds4", position:4, title:"Data Visualisation with Matplotlib",    youtube_id:"DAQNHzOcO5A", duration_min:16 },
      { id:"ds5", position:5, title:"Statistics for Data Science",           youtube_id:"xxpc-HPKN28", duration_min:16 },
      { id:"ds6", position:6, title:"Your First Data Analysis Project",      youtube_id:"r-uOLxNrNk8", duration_min:15 },
    ],
  },
  {
    id: "course-prompt-engineering", slug: "prompt-engineering",
    title: "Prompt Engineering & AI Tools",
    description: "Master the skill of writing effective prompts for ChatGPT, Claude, Midjourney and other AI tools. Learn prompt patterns, chain-of-thought reasoning, and how to build AI-powered workflows.",
    category: "technology",
    thumbnail: "https://img.youtube.com/vi/1bUy-1hGZpI/maxresdefault.jpg",
    duration_min: 70, total_modules: 5, is_free: true,
    modules: [
      { id:"pe1", position:1, title:"Introduction to Prompt Engineering",    youtube_id:"1bUy-1hGZpI", duration_min:13 },
      { id:"pe2", position:2, title:"Writing Effective Prompts",             youtube_id:"pJSITl_KBQY", duration_min:15 },
      { id:"pe3", position:3, title:"Chain-of-Thought & Few-Shot Prompting", youtube_id:"sRSAMCMQDCI", duration_min:14 },
      { id:"pe4", position:4, title:"AI Image Generation Prompts",           youtube_id:"oi3TUbGlh5s", duration_min:13 },
      { id:"pe5", position:5, title:"Building AI Workflows & Automations",   youtube_id:"ZNqB65E8YMI", duration_min:15 },
    ],
  },
  {
    id: "course-freelancing", slug: "freelancing-nigeria",
    title: "Freelancing & Remote Work",
    description: "Learn how to get clients, price your services, and build a sustainable freelance career. Covers Upwork, Fiverr, LinkedIn outreach, proposals, contracts, and getting paid internationally.",
    category: "business",
    thumbnail: "https://img.youtube.com/vi/oBrNpDmjZXo/maxresdefault.jpg",
    duration_min: 80, total_modules: 6, is_free: true,
    modules: [
      { id:"fl1", position:1, title:"Starting Your Freelance Career",        youtube_id:"oBrNpDmjZXo", duration_min:13 },
      { id:"fl2", position:2, title:"Setting Up Upwork & Fiverr Profile",    youtube_id:"DlF5yOhNLdg", duration_min:14 },
      { id:"fl3", position:3, title:"Writing Winning Proposals",             youtube_id:"F3P_kSJCFBg", duration_min:13 },
      { id:"fl4", position:4, title:"Pricing Your Services",                 youtube_id:"Qhy1H4CuJjk", duration_min:12 },
      { id:"fl5", position:5, title:"Getting Paid — Payoneer, Wise & Paystack",youtube_id:"5k_GnEPKrks", duration_min:13 },
      { id:"fl6", position:6, title:"Scaling to $1000/month",                youtube_id:"J4e5OKqMKHk", duration_min:15 },
    ],
  },
  {
    id: "course-video-editing", slug: "video-editing",
    title: "Video Editing for Content Creators",
    description: "Learn video editing from scratch using free tools like DaVinci Resolve. Create YouTube videos, Reels, TikToks and professional content. Covers cuts, transitions, colour grading, subtitles and exports.",
    category: "creative",
    thumbnail: "https://img.youtube.com/vi/ySLdNu9xk_0/maxresdefault.jpg",
    duration_min: 90, total_modules: 6, is_free: true,
    modules: [
      { id:"ve1", position:1, title:"DaVinci Resolve Setup & Interface",     youtube_id:"ySLdNu9xk_0", duration_min:15 },
      { id:"ve2", position:2, title:"Importing & Organising Footage",        youtube_id:"63Ln33O4p4c", duration_min:14 },
      { id:"ve3", position:3, title:"Cuts, Transitions & Timing",            youtube_id:"TG1HrloKLEg", duration_min:16 },
      { id:"ve4", position:4, title:"Colour Grading Basics",                 youtube_id:"KnT4HzajcQk", duration_min:15 },
      { id:"ve5", position:5, title:"Adding Subtitles & Text",               youtube_id:"iim7mMU30_g", duration_min:14 },
      { id:"ve6", position:6, title:"Export for YouTube, Reels & TikTok",    youtube_id:"WlGLX5lKAcc", duration_min:16 },
    ],
  },

];


export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") ?? "";
  const userId   = req.nextUrl.searchParams.get("userId")   ?? "";

  if (!HAS_SUPABASE) {
    const filtered = category
      ? STATIC_COURSES.filter(c => c.category === category)
      : STATIC_COURSES;
    return NextResponse.json({ courses: filtered, source: "static" }, { headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" } });
  }

  // Fetch from Supabase
  let query = supabaseAdmin()
    .from("courses")
    .select("*, course_modules(*)")
    .eq("is_published", true)
    .order("created_at", { ascending: true });

  if (category) query = query.eq("category", category);

  const { data: courses, error } = await query;
  // Fallback to static if DB error OR empty (schema not seeded yet)
  if (error || !courses || courses.length === 0) {
    return NextResponse.json({ courses: STATIC_COURSES, source: "static_fallback" }, { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=3600" } });
  }

  // Optionally attach user progress
  let progressMap: Record<string, any> = {};
  if (userId) {
    const { data: progRows } = await supabaseAdmin()
      .from("course_progress")
      .select("*")
      .eq("user_id", userId);
    (progRows ?? []).forEach(p => { progressMap[p.course_id] = p; });
  }

  const enriched = (courses ?? STATIC_COURSES).map((c: any) => ({
    ...c,
    modules: (c.course_modules ?? []).sort((a: any, b: any) => a.position - b.position),
    userProgress: progressMap[c.id] ?? null,
  }));

  return NextResponse.json({ courses: enriched, source: "supabase" },
    { headers: { "Cache-Control": "s-maxage=300" } });
}
