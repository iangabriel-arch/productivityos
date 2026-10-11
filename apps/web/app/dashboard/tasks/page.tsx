"use client";

import { useEffect, useState } from "react";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  createdAt: string;
  project?: { id: string; name: string; color: string | null } | null;
}

const PRIORITY_STYLES: Record<string, string> = {
  HIGH:   "bg-rose-900/30 text-rose-300 border border-rose-800/40",
  MEDIUM: "bg-amber-900/30 text-amber-300 border border-amber-800/40",
  LOW:    "bg-teal-900/30 text-teal-300 border border-teal-800/40",
  URGENT: "bg-purple-900/30 text-purple-300 border border-purple-800/40",
};

const FILTERS = ["All", "Today", "Pending", "Completed"] as const;
type Filter = typeof FILTERS[number];

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

const DUE_STYLES: Record<string, string> = {
  Today:   "text-[#C8A96E]",
  Overdue: "text-rose-400",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("All");
  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch tasks:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    setAdding(true);
    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTask.trim(), priority, dueDate: dueDate || undefined }),
      });
      setNewTask("");
      setDueDate("");
      setPriority("MEDIUM");
      setShowForm(false);
      await fetchTasks();
    } catch (e) {
      console.error("Failed to create task:", e);
    } finally {
      setAdding(false);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await fetch(`/api/tasks/${id}`, { method: "POST" });
      await fetchTasks();
    } catch (e) {
      console.error("Failed to complete task:", e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      await fetchTasks();
    } catch (e) {
      console.error("Failed to delete task:", e);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredTasks = tasks.filter((task) => {
    if (filter === "Today") {
      if (!task.dueDate) return false;
      const due = new Date(task.dueDate);
      due.setHours(0, 0, 0, 0);
      return due.getTime() === today.getTime();
    }
    if (filter === "Pending") return task.status !== "DONE";
    if (filter === "Completed") return task.status === "DONE";
    return true;
  });

  const counts = {
    All:       tasks.length,
    Today:     tasks.filter(t => { if (!t.dueDate) return false; const d = new Date(t.dueDate); d.setHours(0,0,0,0); return d.getTime() === today.getTime(); }).length,
    Pending:   tasks.filter(t => t.status !== "DONE").length,
    Completed: tasks.filter(t => t.status === "DONE").length,
  };

  return (
    <div className="px-10 py-8 max-w-4xl mx-auto w-full flex flex-col gap-8">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Tasks</h2>
          <p className="text-white/30 text-sm mt-1">{counts.Pending} pending · {counts.Completed} completed</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#C8A96E] text-black text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-[#d4b87a] transition shadow-lg shadow-[#C8A96E]/20 active:scale-95"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          New Task
        </button>
      </div>

      {showForm && (
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-5 flex flex-col gap-4">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
            placeholder="What needs to be done?"
            autoFocus
            className="bg-white/[0.03] border border-white/[0.07] rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C8A96E]/40 transition-all"
          />
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-xs text-white/30">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{ colorScheme: "dark" }}
                className="bg-[#1a1a1a] border border-white/[0.07] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#C8A96E]/40 transition-all"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-white/30">Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{ colorScheme: "dark" }}
                className="bg-[#1a1a1a] border border-white/[0.07] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#C8A96E]/40 transition-all"
              />
            </div>
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => setShowForm(false)}
                className="text-sm text-white/40 hover:text-white/70 transition px-3 py-1.5"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                disabled={adding || !newTask.trim()}
                className="bg-[#C8A96E] text-black px-5 py-1.5 rounded-lg font-bold text-sm hover:bg-[#d4b87a] transition disabled:opacity-50"
              >
                {adding ? "..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-1 border-b border-white/[0.06]">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2.5 text-sm font-medium transition-all relative ${
              filter === f ? "text-white" : "text-white/30 hover:text-white/60"
            }`}
          >
            {f}
            <span className="ml-1.5 text-xs opacity-60">({counts[f]})</span>
            {filter === f && (
              <span className="absolute bottom-0 left-0 right-0 h-px bg-[#C8A96E]" />
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-white/[0.03] border border-white/[0.06] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white/[0.02] border border-white/[0.05] rounded-xl gap-3">
          <p className="text-white/20 text-sm">
            {filter === "Today" ? "No tasks due today." :
             filter === "Completed" ? "No completed tasks yet." :
             filter === "Pending" ? "No pending tasks. You're all caught up! 🎉" :
             "No tasks yet."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredTasks.map((task) => {
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
                  <span className="text-xs text-white/20 hidden sm:flex items-center gap-1.5 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.project.color ?? "#C8A96E" }} />
                    {task.project.name}
                  </span>
                )}
                {due && (
                  <span className={`text-xs font-medium shrink-0 ${DUE_STYLES[due] ?? "text-white/30"}`}>{due}</span>
                )}
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.MEDIUM}`}>
                  {task.priority}
                </span>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-rose-400 transition-all shrink-0"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.7 7.5h6.6L11 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
