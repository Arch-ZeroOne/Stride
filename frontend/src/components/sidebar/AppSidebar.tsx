import React, { useState } from "react";
import Logo from "../icons/image/stride-logo.png";
import { NavLink, Outlet, useLocation } from "react-router";
import {
  Package,
  ReceiptText,
  GitBranch,
  Users,
  ChevronLeft,
  Bell,
  Search,
  Settings,
} from "lucide-react";

// ─── Nav config ────────────────────────────────────────────────────────────────
const navItems = [
  { label: "Products", icon: Package, to: "/admin/productlist" },
  { label: "Expenses", icon: ReceiptText, to: "/admin/expenses" },
  { label: "Branches", icon: GitBranch, to: "/admin/branches" },
  { label: "Sellers", icon: Users, to: "/admin/sellers" },
];

// Maps any pathname segment → human label + icon for the topbar breadcrumb
const routeMeta = {
  products: { label: "Products", icon: Package },
  expenses: { label: "Expenses", icon: ReceiptText },
  branches: { label: "Branches", icon: GitBranch },
  sellers: { label: "Sellers", icon: Users },
  settings: { label: "Settings", icon: Settings },
};

// ─── Breadcrumb helper ─────────────────────────────────────────────────────────
function Breadcrumb() {
  const { pathname } = useLocation();

  // Build segments, skip empty strings
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return (
      <span className="text-slate-700 font-semibold text-[14px]">Home</span>
    );
  }

  return (
    <nav className="flex items-center gap-1.5 text-sm">
      {segments.map((seg: any, i: any) => {
        const meta: any = routeMeta[seg];
        const isLast = i === segments.length - 1;
        const Icon = meta?.icon;

        return (
          <React.Fragment key={seg}>
            {i > 0 && <span className="text-slate-300 select-none">/</span>}
            <span
              className={`flex items-center gap-1.5 ${
                isLast
                  ? "text-slate-700 font-semibold"
                  : "text-slate-400 font-medium"
              }`}
            >
              {Icon && (
                <Icon
                  size={13}
                  className={isLast ? "text-green-500" : "text-slate-400"}
                />
              )}
              {meta?.label ?? seg.charAt(0).toUpperCase() + seg.slice(1)}
            </span>
          </React.Fragment>
        );
      })}
    </nav>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────
function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/* ══ SIDEBAR ══════════════════════════════════════════════════════════ */}
      <aside
        className={`
          relative flex flex-col h-full bg-[#0d1f12]
          border-r border-[#1a3320] flex-shrink-0
          transition-[width] duration-300 ease-in-out overflow-hidden
          ${collapsed ? "w-[72px]" : "w-60"}
        `}
      >
        {/* Right-edge glow */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-green-700/30 to-transparent" />

        {/* ── Logo ── */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-[#1a3320] flex-shrink-0">
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-lg shadow-green-900/40">
            <img
              src={Logo}
              alt="Stride"
              className="w-5 h-5 object-contain brightness-200"
            />
          </div>
          <span
            className={`font-bold text-[17px] tracking-tight text-green-50 whitespace-nowrap
              transition-all duration-200
              ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}
          >
            Stride<span className="text-green-400">.</span>
          </span>
        </div>

        {/* ── Section label ── */}
        <p
          className={`px-4 pt-5 pb-1 text-[10px] font-semibold tracking-[0.12em] uppercase
            text-green-800 select-none whitespace-nowrap overflow-hidden
            transition-all duration-200
            ${collapsed ? "opacity-0 h-0 pt-0 pb-0" : "opacity-100"}`}
        >
          Main Menu
        </p>

        {/* ── Nav links ── */}
        <nav className="flex flex-col gap-1 px-3 pt-2 flex-1 overflow-y-auto overflow-x-hidden">
          {navItems.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl",
                  "text-[13.5px] font-medium transition-all duration-150 no-underline",
                  isActive
                    ? "bg-green-500/15 text-green-400 shadow-[inset_0_0_0_1px_rgba(74,222,128,0.18)]"
                    : "text-slate-500 hover:bg-white/5 hover:text-slate-300",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[55%] rounded-r-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.7)]" />
                  )}

                  <Icon
                    size={17}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    className={`flex-shrink-0 transition-colors duration-150 ${
                      isActive
                        ? "text-green-400"
                        : "text-slate-500 group-hover:text-slate-300"
                    }`}
                  />

                  <span
                    className={`whitespace-nowrap transition-all duration-200 ${
                      collapsed
                        ? "opacity-0 w-0 overflow-hidden"
                        : "opacity-100"
                    }`}
                  >
                    {label}
                  </span>

                  {/* Collapsed-mode active dot */}
                  {isActive && collapsed && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── Bottom: Settings + Collapse ── */}
        <div className="px-3 pb-5 pt-3 flex flex-col gap-1 border-t border-[#1a3320] flex-shrink-0">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              [
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl",
                "text-[13.5px] font-medium transition-all duration-150 no-underline",
                isActive
                  ? "bg-green-500/15 text-green-400 shadow-[inset_0_0_0_1px_rgba(74,222,128,0.18)]"
                  : "text-slate-600 hover:bg-white/5 hover:text-slate-400",
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[55%] rounded-r-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.7)]" />
                )}
                <Settings
                  size={17}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  className="flex-shrink-0"
                />
                <span
                  className={`whitespace-nowrap transition-all duration-200 ${
                    collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                  }`}
                >
                  Settings
                </span>
              </>
            )}
          </NavLink>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600
              hover:bg-white/5 hover:text-slate-400 transition-all duration-150
              w-full text-left text-[13.5px] font-medium"
          >
            <ChevronLeft
              size={17}
              strokeWidth={1.8}
              className={`flex-shrink-0 transition-transform duration-300 ${
                collapsed ? "rotate-180" : "rotate-0"
              }`}
            />
            <span
              className={`whitespace-nowrap transition-all duration-200 ${
                collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
              }`}
            >
              Collapse
            </span>
          </button>
        </div>
      </aside>

      {/* ══ MAIN AREA ════════════════════════════════════════════════════════ */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* ── Topbar ── */}
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200/80 flex-shrink-0 z-10">
          {/* Dynamic breadcrumb */}
          <Breadcrumb />

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg
              bg-slate-100 border border-slate-200 text-slate-400 text-[13px]
              cursor-text hover:border-slate-300 transition-colors select-none"
            >
              <Search size={13} />
              <span>Search…</span>
              <kbd className="ml-1 text-[10px] bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-400 font-mono">
                ⌘K
              </kbd>
            </div>

            {/* Bell */}
            <button
              className="relative w-9 h-9 rounded-xl border border-slate-200 bg-white
              flex items-center justify-center text-slate-500
              hover:bg-green-50 hover:border-green-200 hover:text-green-600 transition-all duration-150"
            >
              <Bell size={16} strokeWidth={1.8} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-green-400 border border-white" />
            </button>

            <div className="w-px h-6 bg-slate-200" />

            {/* Avatar + name */}
            <button className="flex items-center gap-2.5 group">
              <div
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-green-700
                flex items-center justify-center text-white text-[13px] font-bold
                shadow-md shadow-green-200 group-hover:shadow-green-300 transition-shadow"
              >
                JD
              </div>
              <div className="hidden md:flex flex-col leading-tight text-left">
                <span className="text-[13px] font-semibold text-slate-700">
                  Jane Doe
                </span>
                <span className="text-[11px] text-slate-400">Admin</span>
              </div>
            </button>
          </div>
        </header>

        {/* ── Outlet — fills ALL remaining height, scrolls independently ── */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
          {/*
            The Outlet renders whatever child route is active.
            It sits in a fully flexible, scrollable container so any
            page — short cards, long tables, full-bleed heroes — fills
            naturally without breaking the chrome.
          */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppSidebar;
