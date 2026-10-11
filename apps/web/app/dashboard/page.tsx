"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getTasks, createTask, completeTask } from "@/lib/api";
import Link from "next/link";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  project?: { name: string } | null;
}

interface Goal {
  id: string;
  title: string;
  description: string | null;
  status: string;
  dueDate: string | null;
  tasks: { id: string; status: string }[];
}

const PRIORITY_STYLES: Record<string, string> = {
  HIGH:   "bg-rose-900/30 text-rose-300 border border-rose-800/40",
  MEDIUM: "bg-amber-900/30 text-amber-300 border border-amber-800/40",
  LOW:    "bg-teal-900/30 text-teal-300 border border-teal-800/40",
  URGENT: "bg-purple-900/30 text-purple-300 border border-purple-800/40",
};

const DUE_STYLES: Record<string, string> = {
  Today:   "text-[#C8A96E]",
  Overdue: "text-rose-400",
};

function formatDue(dueDate: string | null): string {
  if (!dueDate) return "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  if (due.getTime() === today.getTime()) return "Today";
  if (due < today) return "Overdue";
  return new Date(dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function DashboardPage() {
  const { user } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentGoal, setCurrentGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState("");
  const [adding, setAdding] = useState(false);

  const firstName = user?.firstName ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const fetchData = async () => {
    try {
      const [taskData, goalData] = await Promise.all([
        getTasks(),
        fetch("/api/goals").then(r => r.json()),
      ]);
      setTasks(Array.isArray(taskData) ? taskData : []);
      const activeGoals = Array.isArray(goalData)
        ? goalData.filter((g: Goal) => g.status === "IN_PROGRESS")
        : [];
      setCurrentGoal(activeGoals[0] ?? null);
    } catch (e) {
      console.error("Failed to fetch data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    setAdding(true);
    try {
      await createTask({ title: newTask.trim(), priority: "MEDIUM" });
      setNewTask("");
      await fetchData();
    } catch (e) {
      console.error("Failed to create task:", e);
    } finally {
      setAdding(false);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await completeTask(id);
      await fetchData();
    } catch (e) {
      console.error("Failed to complete task:", e);
    }
  };

  const done = tasks.filter((t) => t.status === "DONE").length;
  const total = tasks.length;
  const remaining = total - done;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  const goalDone = currentGoal?.tasks.filter(t => t.status === "DONE").length ?? 0;
  const goalTotal = currentGoal?.tasks.length ?? 0;
  const goalPercent = goalTotal > 0 ? Math.round((goalDone / goalTotal) * 100) : 0;

  const nextTask = tasks.find(t => t.status !== "DONE");

  return (
    <div className="px-10 py-8 max-w-6xl mx-auto w-full flex flex-col gap-8">

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {greeting}, {firstName} 👋
          </h2>
          <p className="text-white/30 text-sm mt-1">
            {loading ? "Loading your tasks..." : (
              <>You have <span className="text-white/60 font-medium">{remaining} tasks</span> remaining today.</>
            )}
          </p>
        </div>
        <p className="text-xs text-white/20 uppercase tracking-widest">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Open Tasks",  value: loading ? "—" : `${remaining}`, sub: "not yet done",     accent: false },
          { label: "Completed",   value: loading ? "—" : `${done}`,      sub: "total done",       accent: false },
          { label: "Progress",    value: loading ? "—" : `${percent}%`,  sub: "of all tasks",     accent: true  },
          { label: "Due Today",   value: loading ? "—" : `${tasks.filter(t => formatDue(t.dueDate) === "Today").length}`, sub: "need attention", accent: false },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-xl p-5 border flex flex-col gap-3 ${
              s.accent ? "bg-[#C8A96E]/5 border-[#C8A96E]/20" : "bg-white/[0.03] border-white/[0.06]"
            }`}
          >
            <p className="text-xs text-white/30 uppercase tracking-widest font-medium">{s.label}</p>
            <p className={`text-3xl font-bold tracking-tight ${s.accent ? "text-[#C8A96E]" : "text-white"}`}>
              {s.value}
            </p>
            <p className="text-xs text-white/20">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 flex flex-col gap-5">
          {currentGoal ? (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-widest font-medium mb-1">Current Goal</p>
                  <h3 className="text-base font-semibold text-white">{currentGoal.title}</h3>
                  {currentGoal.dueDate && (
                    <p className="text-xs text-white/30 mt-1">Target: {formatDate(currentGoal.dueDate)}</p>
                  )}
                  {currentGoal.description && (
                    <p className="text-xs text-white/20 mt-1">{currentGoal.description}</p>
                  )}
                </div>
                <span className="text-2xl font-bold text-[#C8A96E]">{goalPercent}%</span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${goalPercent}%`,
                      background: "linear-gradient(90deg, #C8A96E, #d4b87a)",
                      boxShadow: "0 0 12px rgba(200,169,110,0.4)",
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/20">{goalDone} of {goalTotal} tasks complete</span>
                  <Link href="/dashboard/goals" className="text-xs text-[#C8A96E] hover:text-[#d4b87a] transition">
                    All goals →
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 gap-3 py-4">
              <p className="text-white/20 text-sm">No active goal.</p>
              <Link href="/dashboard/goals" className="text-xs text-[#C8A96E] hover:text-[#d4b87a] transition">
                Set a goal →
              </Link>
            </div>
          )}
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 flex flex-col gap-4">
          <p className="text-xs text-white/30 uppercase tracking-widest font-medium">Next Up</p>
          {loading ? (
            <p className="text-sm text-white/20">Loading...</p>
          ) : nextTask ? (
            <div className="flex-1 flex flex-col gap-2">
              <p className="text-sm font-semibold text-white leading-snug">{nextTask.title}</p>
              {nextTask.dueDate && (
                <span className="text-xs text-[#C8A96E] font-medium">{formatDue(nextTask.dueDate)}</span>
              )}
              <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06] mt-auto">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  nextTask.priority === "HIGH" ? "bg-rose-400" :
                  nextTask.priority === "URGENT" ? "bg-purple-400" : "bg-amber-400"
                }`} />
                <span className="text-xs text-white/30">{nextTask.priority} priority</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-white/20">All tasks complete 🎉</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest">
            {loading ? "Loading tasks..." : `All Tasks (${total})`}
          </h3>
          <Link href="/dashboard/tasks" className="text-xs text-[#C8A96E] hover:text-[#d4b87a] transition font-medium">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-white/[0.03] border border-white/[0.06] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white/[0.02] border border-white/[0.05] rounded-xl gap-3">
            <p className="text-white/20 text-sm">No tasks yet.</p>
            <p className="text-white/10 text-xs">Add one below to get started.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {tasks.slice(0, 8).map((task) => {
              const due = formatDue(task.dueDate);
              return (
                <div
                  key={task.id}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all duration-150 group ${
                    task.status === "DONE"
                      ? "bg-white/[0.01] border-white/[0.04] opacity-40"
                      : "bg-white/[0.03] border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.05]"
                  }`}
                >
                  <button
                    onClick={() => task.status !== "DONE" && handleComplete(task.id)}
                    className={`w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-all ${
                      task.status === "DONE"
                        ? "bg-[#C8A96E] border-[#C8A96E] task-check-animate"
                        : "border-white/20 group-hover:border-white/40 hover:border-[#C8A96E]/60 cursor-pointer"
                    }`}
                  >
                    {task.status === "DONE" && (
                      <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <span className={`flex-1 text-sm font-medium ${
                    task.status === "DONE" ? "text-white/20 line-through" : "text-white/75"
                  }`}>
                    {task.title}
                  </span>
                  {task.project && (
                    <span className="text-xs text-white/20 hidden sm:block shrink-0">{task.project.name}</span>
                  )}
                  {due && (
                    <span className={`text-xs font-medium shrink-0 ${DUE_STYLES[due] ?? "text-white/30"}`}>
                      {due}
                    </span>
                  )}
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
                    PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.MEDIUM
                  }`}>
                    {task.priority}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex gap-3 pb-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
          placeholder="Quick add a task... (press Enter)"
          className="flex-1 bg-white/[0.03] border border-white/[0.07] rounded-xl px-5 py-3.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C8A96E]/40 focus:bg-white/[0.05] transition-all"
        />
        <button
          onClick={handleAddTask}
          disabled={adding || !newTask.trim()}
          className="bg-[#C8A96E] text-black px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-[#d4b87a] transition-all shadow-lg shadow-[#C8A96E]/15 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {adding ? "..." : "Add"}
        </button>
      </div>
    </div>
  );
}
