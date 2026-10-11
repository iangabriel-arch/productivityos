"use client";

import Link from "next/link";
import CommandPalette from '@/components/CommandPalette';
import { usePathname, useRouter } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="1" y="1" width="5.5" height="5.5" rx="1.5" fill="currentColor" />
        <rect x="8.5" y="1" width="5.5" height="5.5" rx="1.5" fill="currentColor" />
        <rect x="1" y="8.5" width="5.5" height="5.5" rx="1.5" fill="currentColor" />
        <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Goals",
    href: "/dashboard/goals",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="7.5" cy="7.5" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="7.5" cy="7.5" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Tasks",
    href: "/dashboard/tasks",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M2 4.5h11M2 7.5h7M2 10.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Projects",
    href: "/dashboard/projects",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M1.5 3.5a1 1 0 011-1H6l1.5 2H13a1 1 0 011 1v6a1 1 0 01-1 1H2.5a1 1 0 01-1-1v-8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Notes",
    href: "/dashboard/notes",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="1.5" y="1.5" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4.5 5.5h6M4.5 8h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checking, setChecking] = useState(true);

  const currentLabel = NAV_ITEMS.find((n) => n.href === pathname)?.label ?? "Dashboard";

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      setChecking(false);
      return;
    }
    const onboarded = localStorage.getItem(`onboarded_${user.id}`);
    if (!onboarded) {
      router.push("/onboarding");
    } else {
      setChecking(false);
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-[#C8A96E]/20 border-t-[#C8A96E] animate-spin" />
      </div>
    );
  }

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-white/[0.06] shrink-0">
        <div className="w-7 h-7 rounded-lg bg-[#C8A96E] flex items-center justify-center shadow-lg shadow-[#C8A96E]/20">
          <span className="text-black font-bold text-xs">P</span>
        </div>
        <span className="font-semibold text-white text-sm tracking-tight">ProductivityOS</span>
      </div>

      <nav className="flex-1 px-2 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 group ${
                isActive
                  ? "bg-[#C8A96E]/10 text-[#C8A96E]"
                  : "text-white/35 hover:text-white/70 hover:bg-white/[0.04]"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#C8A96E] rounded-r-full shadow-[0_0_8px_#C8A96E]" />
              )}
              <span className={`shrink-0 ${isActive ? "text-[#C8A96E]" : "text-white/25 group-hover:text-white/50"}`}>
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/[0.06] flex items-center gap-3 shrink-0">
        <UserButton afterSignOutUrl="/" />
        <span className="text-xs text-white/40 font-medium truncate">My workspace</span>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#080808] text-white overflow-hidden">

      <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-white/[0.06] bg-[#0a0a0a]">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 flex flex-col border-r border-white/[0.06] bg-[#0a0a0a] z-10">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between px-4 lg:px-8 h-14 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <h1 className="text-sm font-semibold text-white/50 tracking-wide">{currentLabel}</h1>
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            <button
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))}
              className="hidden lg:flex items-center gap-1.5 text-xs text-white/20 hover:text-white/40 transition border border-white/[0.06] rounded-lg px-3 py-2"
            >
              <kbd className="font-mono">Ctrl</kbd>
              <span>+</span>
              <kbd className="font-mono">K</kbd>
            </button>
            <button className="flex items-center gap-2 bg-[#C8A96E] text-black text-xs font-bold px-3 lg:px-3.5 py-2 rounded-lg hover:bg-[#d4b87a] transition-all shadow-lg shadow-[#C8A96E]/20 active:scale-95">
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="hidden sm:inline">New Task</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <CommandPalette />
    </div>
  );
}
