"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  color: string | null;
  tasks: Task[];
}

const PRIORITY_STYLES: Record<string, string> = {
  HIGH:   "bg-rose-900/30 text-rose-300 border border-rose-800/40",
  MEDIUM: "bg-amber-900/30 text-amber-300 border border-amber-800/40",
  LOW:    "bg-teal-900/30 text-teal-300 border border-teal-800/40",
  URGENT: "bg-purple-900/30 text-purple-300 border border-purple-800/40",
};

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setProject(data);
    } catch (e) {
      console.error("Failed to fetch project:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    setAdding(true);
    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTask.trim(), priority: "MEDIUM", projectId: id }),
      });
      setNewTask("");
      await fetchProject();
    } catch (e) {
      console.error("Failed to create task:", e);
    } finally {
      setAdding(false);
    }
  };

  const handleComplete = async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, { method: "POST" });
      await fetchProject();
    } catch (e) {
      console.error("Failed to complete task:", e);
    }
  };

  if (loading) {
    return (
      <div className="px-10 py-8 max-w-5xl mx-auto w-full flex flex-col gap-6">
        <div className="h-8 w-48 bg-white/[0.03] rounded-lg animate-pulse" />
        <div className="h-32 bg-white/[0.03] rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="px-10 py-8 max-w-5xl mx-auto w-full flex flex-col items-center justify-center gap-3 py-20">
        <p className="text-white/30 text-sm">Project not found.</p>
        <Link href="/dashboard/projects" className="text-xs text-[#C8A96E] hover:text-[#d4b87a] transition">
          ← Back to projects
        </Link>
      </div>
    );
  }

  const total = project.tasks.length;
  const done = project.tasks.filter((t) => t.status === "DONE").length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="px-10 py-8 max-w-5xl mx-auto w-full flex flex-col gap-8">

      <Link href="/dashboard/projects" className="text-xs text-white/30 hover:text-white/60 transition flex items-center gap-1.5 w-fit">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M7.5 2.5L3 6l4.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        All Projects
      </Link>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: project.color ?? "#C8A96E" }} />
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{project.name}</h2>
            {project.description && (
              <p className="text-white/30 text-sm mt-1">{project.description}</p>
            )}
          </div>
        </div>
        <span className="text-2xl font-bold text-[#C8A96E]">{percent}%</span>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 flex flex-col gap-3">
        <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${percent}%`,
              backgroundColor: project.color ?? "#C8A96E",
              boxShadow: `0 0 12px ${project.color ?? "#C8A96E"}66`,
            }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/20">{done} of {total} tasks complete</span>
          <span className="text-xs text-white/20">{total - done} remaining</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Tasks ({total})</h3>

        {project.tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white/[0.02] border border-white/[0.05] rounded-xl gap-2">
            <p className="text-white/20 text-sm">No tasks in this project yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {project.tasks.map((task) => (
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
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
                  PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.MEDIUM
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pb-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
          placeholder={`Add a task to ${project.name}...`}
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
