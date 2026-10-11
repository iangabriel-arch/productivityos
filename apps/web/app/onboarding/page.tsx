"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const STEPS = ["goal", "task", "done"] as const;
type Step = typeof STEPS[number];

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState<Step>("goal");
  const [goal, setGoal] = useState("");
  const [task, setTask] = useState("");
  const [loading, setLoading] = useState(false);

  const firstName = user?.firstName ?? "there";

  const handleGoalNext = () => {
    if (!goal.trim()) return;
    setStep("task");
  };

  const handleFinish = async () => {
    if (!task.trim()) return;
    setLoading(true);
    try {
      // Create goal
      const goalRes = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: goal.trim() }),
      });
      const goalData = await goalRes.json();

      // Create first task linked to goal
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: task.trim(),
          priority: "HIGH",
          goalId: goalData.id,
        }),
      });

      // Mark onboarded
      localStorage.setItem(`onboarded_${user?.id}`, "true");

      setStep("done");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (e) {
      console.error("Onboarding failed:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center px-6">

      {/* Ambient orb */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #C8A96E 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative w-full max-w-lg flex flex-col gap-8">

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#C8A96E] flex items-center justify-center shadow-lg shadow-[#C8A96E]/20">
            <span className="text-black font-bold text-sm">P</span>
          </div>
          <span className="font-semibold text-white text-lg tracking-tight">ProductivityOS</span>
        </div>

        {/* Step — Goal */}
        {step === "goal" && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Step 1 of 2</p>
              <h1 className="text-3xl font-bold text-white leading-tight">
                Welcome, {firstName}. 👋
              </h1>
              <p className="text-white/40 text-base mt-3 leading-relaxed">
                Let's start with one goal. What do you want to achieve?
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGoalNext()}
                placeholder="e.g. Launch my MVP in 8 weeks"
                autoFocus
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-5 py-4 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#C8A96E]/50 transition-all"
              />
              <button
                onClick={handleGoalNext}
                disabled={!goal.trim()}
                className="w-full bg-[#C8A96E] text-black py-4 rounded-xl font-bold text-sm hover:bg-[#d4b87a] transition-all shadow-xl shadow-[#C8A96E]/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            </div>

            <p className="text-xs text-white/20 text-center">
              You can always add more goals later.
            </p>
          </div>
        )}

        {/* Step — Task */}
        {step === "task" && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs text-white/30 uppercase tracking-widest mb-3">Step 2 of 2</p>
              <h1 className="text-3xl font-bold text-white leading-tight">
                Good. Now, what&apos;s the first step?
              </h1>
              <p className="text-white/40 text-base mt-3 leading-relaxed">
                Every goal starts with one action. What will you do first toward{" "}
                <span className="text-white/70 font-medium">&ldquo;{goal}&rdquo;</span>?
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFinish()}
                placeholder="e.g. Define the core features"
                autoFocus
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-5 py-4 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#C8A96E]/50 transition-all"
              />
              <button
                onClick={handleFinish}
                disabled={!task.trim() || loading}
                className="w-full bg-[#C8A96E] text-black py-4 rounded-xl font-bold text-sm hover:bg-[#d4b87a] transition-all shadow-xl shadow-[#C8A96E]/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? "Setting up your workspace..." : "Let's go →"}
              </button>
              <button
                onClick={() => setStep("goal")}
                className="text-xs text-white/20 hover:text-white/40 transition text-center"
              >
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* Step — Done */}
        {step === "done" && (
          <div className="flex flex-col items-center gap-6 text-center py-8">
            <div className="w-16 h-16 rounded-full bg-[#C8A96E]/10 border border-[#C8A96E]/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#C8A96E]" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">You&apos;re all set.</h1>
              <p className="text-white/40 text-base mt-2">Taking you to your dashboard...</p>
            </div>
          </div>
        )}

        {/* Progress dots */}
        {step !== "done" && (
          <div className="flex items-center justify-center gap-2">
            <span className={`w-2 h-2 rounded-full transition-all ${step === "goal" ? "bg-[#C8A96E]" : "bg-white/20"}`} />
            <span className={`w-2 h-2 rounded-full transition-all ${step === "task" ? "bg-[#C8A96E]" : "bg-white/20"}`} />
          </div>
        )}
      </div>
    </div>
  );
}