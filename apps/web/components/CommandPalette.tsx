"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  group: string;
}

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const NavIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const TaskIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5.5 8l2 2 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GoalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="8" cy="8" r="1" fill="currentColor" />
  </svg>
);

const ProjectIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 4a1 1 0 011-1h3.5L8 5h6a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const NoteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setSelectedIndex(0);
  }, []);

  // Open with Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [close]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const commands: Command[] = [
    {
      id: "nav-dashboard",
      label: "Go to Dashboard",
      icon: <NavIcon />,
      action: () => { router.push("/dashboard"); close(); },
      group: "Navigate",
    },
    {
      id: "nav-tasks",
      label: "Go to Tasks",
      icon: <NavIcon />,
      action: () => { router.push("/dashboard/tasks"); close(); },
      group: "Navigate",
    },
    {
      id: "nav-projects",
      label: "Go to Projects",
      icon: <NavIcon />,
      action: () => { router.push("/dashboard/projects"); close(); },
      group: "Navigate",
    },
    {
      id: "nav-goals",
      label: "Go to Goals",
      icon: <NavIcon />,
      action: () => { router.push("/dashboard/goals"); close(); },
      group: "Navigate",
    },
    {
      id: "nav-notes",
      label: "Go to Notes",
      icon: <NavIcon />,
      action: () => { router.push("/dashboard/notes"); close(); },
      group: "Navigate",
    },
    {
      id: "new-task",
      label: "New Task",
      description: "Create a new task",
      icon: <TaskIcon />,
      action: () => { router.push("/dashboard/tasks"); close(); },
      group: "Create",
    },
    {
      id: "new-project",
      label: "New Project",
      description: "Create a new project",
      icon: <ProjectIcon />,
      action: () => { router.push("/dashboard/projects"); close(); },
      group: "Create",
    },
    {
      id: "new-goal",
      label: "New Goal",
      description: "Set a new goal",
      icon: <GoalIcon />,
      action: () => { router.push("/dashboard/goals"); close(); },
      group: "Create",
    },
    {
      id: "new-note",
      label: "New Note",
      description: "Create a new note",
      icon: <NoteIcon />,
      action: () => { router.push("/dashboard/notes"); close(); },
      group: "Create",
    },
  ];

  const filtered = query.trim()
    ? commands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.description?.toLowerCase().includes(query.toLowerCase()) ||
          c.group.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  // Group commands
  const groups = filtered.reduce<Record<string, Command[]>>((acc, cmd) => {
    if (!acc[cmd.group]) acc[cmd.group] = [];
    acc[cmd.group].push(cmd);
    return acc;
  }, {});

  // Flat list for keyboard nav
  const flatFiltered = filtered;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, flatFiltered.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      flatFiltered[selectedIndex]?.action();
    }
  };

  if (!open) return null;

  let flatIndex = 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
      onClick={close}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-lg mx-4 bg-[#111111] border border-white/[0.1] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.06]">
          <span className="text-white/30 shrink-0">
            <SearchIcon />
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands..."
            className="flex-1 bg-transparent text-sm text-white placeholder-white/25 focus:outline-none"
          />
          <kbd className="text-xs text-white/20 border border-white/10 rounded px-1.5 py-0.5 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-white/20">
              No results for &quot;{query}&quot;
            </div>
          ) : (
            Object.entries(groups).map(([group, cmds]) => (
              <div key={group}>
                <div className="px-4 py-1.5">
                  <span className="text-xs font-semibold text-white/20 uppercase tracking-widest">
                    {group}
                  </span>
                </div>
                {cmds.map((cmd) => {
                  const currentIndex = flatIndex++;
                  const isSelected = selectedIndex === currentIndex;
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      onMouseEnter={() => setSelectedIndex(currentIndex)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${
                        isSelected
                          ? "bg-[#C8A96E]/10 text-white"
                          : "text-white/50 hover:text-white"
                      }`}
                    >
                      <span className={isSelected ? "text-[#C8A96E]" : "text-white/25"}>
                        {cmd.icon}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{cmd.label}</span>
                        {cmd.description && (
                          <span className="text-xs text-white/30">{cmd.description}</span>
                        )}
                      </div>
                      {isSelected && (
                        <kbd className="ml-auto text-xs text-white/30 border border-white/10 rounded px-1.5 py-0.5 font-mono">
                          ↵
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-white/[0.06]">
          <span className="flex items-center gap-1 text-xs text-white/20">
            <kbd className="border border-white/10 rounded px-1 py-0.5 font-mono">↑↓</kbd>
            navigate
          </span>
          <span className="flex items-center gap-1 text-xs text-white/20">
            <kbd className="border border-white/10 rounded px-1 py-0.5 font-mono">↵</kbd>
            select
          </span>
          <span className="flex items-center gap-1 text-xs text-white/20">
            <kbd className="border border-white/10 rounded px-1 py-0.5 font-mono">ESC</kbd>
            close
          </span>
        </div>
      </div>
    </div>
  );
}