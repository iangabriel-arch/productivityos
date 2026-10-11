"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  color: string | null;
  tasks: { id: string; status: string }[];
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:    "bg-teal-900/30 text-teal-300 border border-teal-800/40",
  COMPLETED: "bg-emerald-900/30 text-emerald-300 border border-emerald-800/40",
  ON_HOLD:   "bg-amber-900/30 text-amber-300 border border-amber-800/40",
  ARCHIVED:  "bg-white/10 text-white/40 border border-white/10",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const COLORS = ["#C8A96E", "#7C9EFF", "#5DCAA5", "#E07B7B", "#C77FE0"];
  const [color, setColor] = useState(COLORS[0]);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch projects:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined, color }),
      });
      setName("");
      setDescription("");
      setColor(COLORS[0]);
      setShowForm(false);
      await fetchProjects();
    } catch (e) {
      console.error("Failed to create project:", e);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="px-10 py-8 max-w-6xl mx-auto w-full flex flex-col gap-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Projects</h2>
          <p className="text-white/30 text-sm mt-1">
            {loading ? "Loading..." : `${projects.length} project${projects.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#C8A96E] text-black text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-[#d4b87a] transition shadow-lg shadow-[#C8A96E]/20 active:scale-95"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          New Project
        </button>
      </div>

      {/* New project form */}
      {showForm && (
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-6 flex flex-col gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name..."
            autoFocus
            className="bg-white/[0.03] border border-white/[0.07] rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C8A96E]/40 transition-all"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)..."
            rows={2}
            className="bg-white/[0.03] border border-white/[0.07] rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#C8A96E]/40 transition-all resize-none"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-all ${color === c ? "ring-2 ring-offset-2 ring-offset-[#0a0a0a] ring-white/40 scale-110" : "opacity-50 hover:opacity-80"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="text-sm text-white/40 hover:text-white/70 transition px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !name.trim()}
                className="bg-[#C8A96E] text-black px-5 py-2 rounded-lg font-bold text-sm hover:bg-[#d4b87a] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? "..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project grid */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-white/[0.03] border border-white/[0.06] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] border border-white/[0.05] rounded-xl gap-3">
          <p className="text-white/20 text-sm">No projects yet.</p>
          <p className="text-white/10 text-xs">Create one to start organizing your work.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const total = project.tasks.length;
            const done = project.tasks.filter((t) => t.status === "DONE").length;
            const percent = total > 0 ? Math.round((done / total) * 100) : 0;

            return (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-5 flex flex-col gap-4 hover:border-white/[0.14] hover:bg-white/[0.05] transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: project.color ?? "#C8A96E" }}
                    />
                    <h3 className="text-sm font-semibold text-white group-hover:text-white">
                      {project.name}
                    </h3>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                    STATUS_STYLES[project.status] ?? STATUS_STYLES.ACTIVE
                  }`}>
                    {project.status}
                  </span>
                </div>

                {project.description && (
                  <p className="text-xs text-white/30 leading-relaxed line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="flex flex-col gap-2 mt-auto">
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: project.color ?? "#C8A96E",
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/20">{done}/{total} tasks</span>
                    <span className="text-xs text-white/20">{percent}%</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}