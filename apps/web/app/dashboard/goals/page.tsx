"use client";

import { useEffect, useState } from "react";

interface Goal {
  id: string;
  title: string;
  description: string | null;
  status: string;
  dueDate: string | null;
  tasks: { id: string; status: string }[];
}

const STATUS_STYLES: Record<string, string> = {
  IN_PROGRESS: "bg-teal-900/30 text-teal-300 border border-teal-800/40",
  ACHIEVED:    "bg-emerald-900/30 text-emerald-300 border border-emerald-800/40",
  ABANDONED:   "bg-white/10 text-white/40 border border-white/10",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchGoals = async () => {
    try {
      const res = await fetch("/api/goals");
      const data = await res.json();
      setGoals(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch goals:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setCreating(true);
    try {
      await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          dueDate: dueDate || undefined,
        }),
      });
      setTitle("");
      setDescription("");
      setDueDate("");
      setShowForm(false);
      await fetchGoals();
    } catch (e) {
      console.error("Failed to create goal:", e);
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetch(`/api/goals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await fetchGoals();
    } catch (e) {
      console.error("Failed to update goal:", e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/goals/${id}`, { method: "DELETE" });
      await fetchGoals();
    } catch (e) {
      console.error("Failed to delete goal:", e);
    }
  };

  return (
    <div className="px-10 py-8 max-w-6xl mx-auto w-full flex flex-col gap-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Goals</h2>
          <p className="text-white/30 text-sm mt-1">
            {loading ? "Loading..." : `${goals.filter(g => g.status === "IN_PROGRESS").length} active goal${goals.filter(g => g.status === "IN_PROGRESS").length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#C8A96E] text-black text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-[#d4b87a] transition shadow-lg shadow-[#C8A96E]/20 active:scale-95"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          New Goal
        </button>
      </div>

      {/* New goal form */}
      {showForm && (
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-6 flex flex-col gap-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you want to achieve?"
            autoFocus
            className="bg-white/[0.03] border border-white/[0.07] rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C8A96E]/40 transition-all"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Why does this matter? (optional)"
            rows={2}
            className="bg-white/[0.03] border border-white/[0.07] rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C8A96E]/40 transition-all resize-none"
          />
          <div className="flex items-center gap-3">
            <label className="text-xs text-white/30">Target date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-white/[0.03] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C8A96E]/40 transition-all"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="text-sm text-white/40 hover:text-white/70 transition px-4 py-2"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={creating || !title.trim()}
              className="bg-[#C8A96E] text-black px-5 py-2 rounded-lg font-bold text-sm hover:bg-[#d4b87a] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? "..." : "Create Goal"}
            </button>
          </div>
        </div>
      )}

      {/* Goals list */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-36 bg-white/[0.03] border border-white/[0.06] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] border border-white/[0.05] rounded-xl gap-3">
          <p className="text-white/20 text-sm">No goals yet.</p>
          <p className="text-white/10 text-xs">Set a goal to start working toward something meaningful.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {goals.map((goal) => {
            const total = goal.tasks.length;
            const done = goal.tasks.filter((t) => t.status === "DONE").length;
            const percent = total > 0 ? Math.round((done / total) * 100) : 0;

            return (
              <div
                key={goal.id}
                className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-6 flex flex-col gap-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold text-white">{goal.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                        STATUS_STYLES[goal.status] ?? STATUS_STYLES.IN_PROGRESS
                      }`}>
                        {goal.status.replace("_", " ")}
                      </span>
                    </div>
                    {goal.description && (
                      <p className="text-sm text-white/30">{goal.description}</p>
                    )}
                    {goal.dueDate && (
                      <p className="text-xs text-white/20">Target: {formatDate(goal.dueDate)}</p>
                    )}
                  </div>
                  <span className="text-2xl font-bold text-[#C8A96E] shrink-0">{percent}%</span>
                </div>

                {/* Progress */}
                <div className="flex flex-col gap-2">
                  <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        background: "linear-gradient(90deg, #C8A96E, #d4b87a)",
                        boxShadow: "0 0 12px rgba(200,169,110,0.4)",
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/20">{done} of {total} tasks complete</span>
                    <span className="text-xs text-white/20">{total - done} remaining</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-1 border-t border-white/[0.06]">
                  {goal.status === "IN_PROGRESS" && (
                    <button
                      onClick={() => handleStatusChange(goal.id, "ACHIEVED")}
                      className="text-xs text-emerald-400 hover:text-emerald-300 transition font-medium"
                    >
                      Mark achieved ✓
                    </button>
                  )}
                  {goal.status !== "ABANDONED" && (
                    <button
                      onClick={() => handleStatusChange(goal.id, "ABANDONED")}
                      className="text-xs text-white/20 hover:text-white/40 transition"
                    >
                      Abandon
                    </button>
                  )}
                  {goal.status === "ABANDONED" && (
                    <button
                      onClick={() => handleStatusChange(goal.id, "IN_PROGRESS")}
                      className="text-xs text-[#C8A96E] hover:text-[#d4b87a] transition"
                    >
                      Reactivate
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-xs text-rose-400/50 hover:text-rose-400 transition ml-auto"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}