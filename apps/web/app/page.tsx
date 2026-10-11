"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

const GOAL = "Launch my MVP in 8 weeks";

const TASKS = [
  { id: 1, title: "Define MVP scope and feature list", week: "Week 1", done: true },
  { id: 2, title: "Set up monorepo and tech stack", week: "Week 1", done: true },
  { id: 3, title: "Build authentication and user profiles", week: "Week 2–3", done: false },
  { id: 4, title: "Implement task and project management", week: "Week 3–4", done: false },
  { id: 5, title: "Integrate AI breakdown endpoint", week: "Week 5", done: false },
  { id: 6, title: "Internal testing and bug fixes", week: "Week 6–7", done: false },
  { id: 7, title: "Deploy to production and launch", week: "Week 8", done: false },
];

const WEEK_COLORS: Record<string, string> = {
  "Week 1":   "bg-amber-900/40 text-amber-300",
  "Week 2–3": "bg-purple-900/40 text-purple-300",
  "Week 3–4": "bg-purple-900/40 text-purple-300",
  "Week 5":   "bg-teal-900/40 text-teal-300",
  "Week 6–7": "bg-teal-900/40 text-teal-300",
  "Week 8":   "bg-rose-900/40 text-rose-300",
};

const HEADLINE_LINE_1 = "Stop managing tasks.";
const HEADLINE_LINE_2 = "Start executing goals.";
const FLOW_STEPS = ["Goals", "Plans", "Tasks", "Progress"];

export default function Home() {
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [phase, setPhase] = useState<"line1" | "line2" | "done">("line1");
  const [charIndex, setCharIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [visibleCount, setVisibleCount] = useState(TASKS.length); // all visible by default

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (phase === "line1") {
      if (charIndex < HEADLINE_LINE_1.length) {
        const t = setTimeout(() => {
          setLine1((p) => p + HEADLINE_LINE_1[charIndex]);
          setCharIndex((p) => p + 1);
        }, 50);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => { setPhase("line2"); setCharIndex(0); }, 300);
        return () => clearTimeout(t);
      }
    }
    if (phase === "line2") {
      if (charIndex < HEADLINE_LINE_2.length) {
        const t = setTimeout(() => {
          setLine2((p) => p + HEADLINE_LINE_2[charIndex]);
          setCharIndex((p) => p + 1);
        }, 50);
        return () => clearTimeout(t);
      } else {
        setPhase("done");
      }
    }
  }, [charIndex, phase, mounted]);

  const doneCount = TASKS.filter((t) => t.done).length;

  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-hidden">

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #C8A96E 0%, transparent 70%)", animation: "orb 8s ease-in-out infinite" }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #C8A96E 0%, transparent 70%)", animation: "orb 12s ease-in-out infinite reverse" }} />
      </div>

      <style>{`
        @keyframes orb {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.1); opacity: 0.25; }
        }
      `}</style>

      <nav className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#C8A96E] flex items-center justify-center shadow-lg shadow-[#C8A96E]/20">
            <span className="text-black font-bold text-sm">P</span>
          </div>
          <span className="font-semibold text-white text-lg tracking-tight">ProductivityOS</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="text-white/40 font-medium hover:text-white transition text-sm">Sign In</Link>
          <Link href="/sign-up" className="bg-[#C8A96E] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[#d4b87a] transition text-sm shadow-lg shadow-[#C8A96E]/20">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/40 text-xs font-medium px-4 py-2 rounded-full mb-8 tracking-widest uppercase">
              <span className="w-1.5 h-1.5 bg-[#C8A96E] rounded-full" />
              AI-powered productivity
            </div>

            <h1 className="text-5xl xl:text-6xl font-bold leading-tight mb-6">
              <span className="block text-white">{HEADLINE_LINE_1}</span>
              <span className="block text-[#C8A96E]">{HEADLINE_LINE_2}</span>
            </h1>

            <p className="text-lg text-white/40 leading-relaxed mb-10 max-w-md">
              Replace your scattered tools with one system built to help you finish what you start.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/sign-up" className="bg-[#C8A96E] text-black px-7 py-3.5 rounded-xl font-bold hover:bg-[#d4b87a] transition shadow-xl shadow-[#C8A96E]/20 text-sm">
                Build my first plan
              </Link>
              <Link href="/sign-in" className="border border-white/10 text-white/50 px-7 py-3.5 rounded-xl font-semibold hover:bg-white/5 hover:text-white transition text-sm">
                Sign in
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-3 flex-wrap">
              {FLOW_STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-white/60 tracking-wide">{step}</span>
                  {i < FLOW_STEPS.length - 1 && <span className="text-[#C8A96E] text-base">→</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Right — AI Panel */}
          <div className="relative mt-8 lg:mt-0">
            <div className="absolute inset-0 bg-[#C8A96E]/5 rounded-3xl blur-2xl scale-105" />
            <div className="relative bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">

              <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <span className="ml-3 text-white/20 text-xs font-mono">ai-planner.tsx</span>
              </div>

              <div className="p-5 flex flex-col gap-4">
                <p className="text-white/30 text-xs font-mono uppercase tracking-widest">— AI Planner</p>

                <div className="flex gap-2">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/80 text-sm font-mono flex items-center min-w-0">
                    <span className="truncate">{GOAL}</span>
                    <span className="inline-block w-[2px] h-[14px] bg-[#C8A96E] animate-pulse ml-2 shrink-0" />
                  </div>
                  <button className="bg-[#C8A96E] text-black px-4 py-3 rounded-lg font-bold text-sm hover:bg-[#d4b87a] transition shadow-lg shadow-[#C8A96E]/20 shrink-0">
                    Run
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-white/25 font-mono whitespace-nowrap">{TASKS.length} milestones generated</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <div className="flex flex-col gap-2">
                  {TASKS.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 border ${
                        task.done ? "bg-white/[0.02] border-white/5" : "bg-white/[0.05] border-white/10"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        task.done ? "bg-[#C8A96E] border-[#C8A96E]" : "border-white/20"
                      }`}>
                        {task.done && (
                          <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span className={`flex-1 font-mono text-xs sm:text-sm ${task.done ? "text-white/25 line-through" : "text-white/70"}`}>
                        {task.title}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-mono shrink-0 ${WEEK_COLORS[task.week] ?? "bg-white/10 text-white/40"}`}>
                        {task.week}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <span className="text-xs text-white/25 font-mono">{doneCount} of {TASKS.length} complete</span>
                  <button className="text-xs text-[#C8A96E] hover:text-[#d4b87a] transition font-mono">+ Add to workspace →</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature strip */}
        <div className="mt-16 pt-16 border-t border-white/5">
          <p className="text-center text-white/20 text-xs uppercase tracking-widest mb-10">Everything you need to execute</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { num: "01", title: "Task Management", desc: "Create, prioritize, and complete tasks with subtasks, due dates, and smart filters." },
              { num: "02", title: "Project Tracking", desc: "Organise work into projects. See progress at a glance and never miss a deadline." },
              { num: "03", title: "AI Planning", desc: "Describe a goal and let AI break it into actionable tasks instantly." },
            ].map((f) => (
              <div key={f.num} className="group bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:border-[#C8A96E]/30 hover:bg-white/[0.04] transition duration-300">
                <div className="w-9 h-9 bg-[#C8A96E]/10 border border-[#C8A96E]/20 rounded-xl flex items-center justify-center mb-4 group-hover:border-[#C8A96E]/40 transition">
                  <span className="text-[#C8A96E] text-xs font-bold">{f.num}</span>
                </div>
                <h3 className="font-semibold text-white/80 text-base mb-2">{f.title}</h3>
                <p className="text-white/30 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="relative z-10 text-center py-8 text-white/15 text-xs border-t border-white/5 tracking-widest uppercase">
        &copy; 2026 ProductivityOS — Built to execute
      </footer>
    </div>
  );
}