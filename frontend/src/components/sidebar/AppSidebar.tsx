import React, { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import {
  Package,
  ChevronLeft,
  Settings,
  ShoppingBag,
  LayoutDashboard,
  User,
  LogOut,
} from "lucide-react";
import Swal from "sweetalert2";

// ─── Nav config ────────────────────────────────────────────────────────────────
const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/admin/dashboard" },
  { label: "Sellers", icon: User, to: "/admin/sellers" },
  { label: "Products", icon: Package, to: "/admin/productlist" },
];

const routeMeta: Record<string, { label: string; icon: any }> = {
  dashboard: { label: "Dashboard", icon: LayoutDashboard },
  productlist: { label: "Products", icon: Package },
  sellers: { label: "Manage Seller Profiles", icon: User },
  manageproduct: { label: "Manage Product", icon: Package },
  settings: { label: "Settings", icon: Settings },
};

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
function Breadcrumb() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0)
    return (
      <span className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>
        Home
      </span>
    );

  return (
    <nav className="flex items-center gap-1.5 text-sm">
      {segments.map((seg, i) => {
        const meta = routeMeta[seg];
        const isLast = i === segments.length - 1;
        const Icon = meta?.icon;
        return (
          <React.Fragment key={seg}>
            {i > 0 && (
              <span
                style={{ color: "#334155" }}
                className="select-none text-xs"
              >
                /
              </span>
            )}
            <span
              className="flex items-center gap-1.5 text-xs font-semibold"
              style={{ color: isLast ? "#e2e8f0" : "#475569" }}
            >
              {Icon && (
                <Icon
                  size={12}
                  style={{ color: isLast ? "#10b981" : "#475569" }}
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
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: "Log Out?",
      text: "You will be returned to the sign in page.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, log out",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#1e293b",
      background: "#111827",
      color: "#e2e8f0",
    }).then((result) => {
      if (result.isConfirmed) {
        // Clear any stored auth tokens here if needed
        // localStorage.removeItem("token");
        navigate("/signin");
      }
    });
  };

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{
        fontFamily: "'Sora', 'DM Sans', sans-serif",
        background: "#0f1117",
      }}
    >
      {/* ══ SIDEBAR ══ */}
      <aside
        className={`
          relative flex flex-col h-full flex-shrink-0
          transition-[width] duration-300 ease-in-out overflow-hidden
          ${collapsed ? "w-[68px]" : "w-56"}
        `}
        style={{
          background: "#111827",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Right-edge glow */}
        <div
          className="pointer-events-none absolute right-0 top-0 h-full w-px"
          style={{
            background:
              "linear-gradient(to bottom, transparent, rgba(16,185,129,0.2), transparent)",
          }}
        />

        {/* ── Logo ── */}
        <div
          className="flex items-center gap-3 px-4 py-5 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              boxShadow: "0 4px 16px rgba(16,185,129,0.35)",
            }}
          >
            <ShoppingBag size={17} className="text-white" />
          </div>
          <span
            className={`font-bold text-base tracking-tight text-white whitespace-nowrap transition-all duration-200 ${
              collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
            }`}
          >
            Swift<span style={{ color: "#10b981" }}>POS</span>
          </span>
        </div>

        {/* ── Section label ── */}
        <p
          className={`px-4 pt-5 pb-1 text-[10px] font-bold tracking-[0.14em] uppercase select-none whitespace-nowrap overflow-hidden transition-all duration-200 ${
            collapsed ? "opacity-0 h-0 pt-0 pb-0" : "opacity-100"
          }`}
          style={{ color: "#1e293b" }}
        >
          Main Menu
        </p>

        {/* ── Nav links ── */}
        <nav className="flex flex-col gap-1 px-2 pt-2 flex-1 overflow-y-auto overflow-x-hidden">
          {navItems.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={to}
              to={to}
              className="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 no-underline"
              style={({ isActive }) =>
                isActive
                  ? {
                      background: "rgba(16,185,129,0.12)",
                      color: "#10b981",
                      border: "1px solid rgba(16,185,129,0.2)",
                    }
                  : {
                      color: "#475569",
                      border: "1px solid transparent",
                    }
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[55%] rounded-r-full"
                      style={{
                        background: "#10b981",
                        boxShadow: "0 0 8px rgba(16,185,129,0.7)",
                      }}
                    />
                  )}
                  <Icon
                    size={16}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    className="flex-shrink-0 transition-colors duration-150"
                    style={{ color: isActive ? "#10b981" : "#475569" }}
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
                  {isActive && collapsed && (
                    <span
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                      style={{
                        background: "#10b981",
                        boxShadow: "0 0 6px rgba(16,185,129,0.8)",
                      }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── Bottom: Settings + Collapse + Logout ── */}
        <div
          className="px-2 pb-4 pt-3 flex flex-col gap-1 flex-shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* Settings */}
          <NavLink
            to="/settings"
            className="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 no-underline"
            style={({ isActive }) =>
              isActive
                ? {
                    background: "rgba(16,185,129,0.12)",
                    color: "#10b981",
                    border: "1px solid rgba(16,185,129,0.2)",
                  }
                : {
                    color: "#334155",
                    border: "1px solid transparent",
                  }
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[55%] rounded-r-full"
                    style={{
                      background: "#10b981",
                      boxShadow: "0 0 8px rgba(16,185,129,0.7)",
                    }}
                  />
                )}
                <Settings
                  size={16}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  className="flex-shrink-0"
                  style={{ color: isActive ? "#10b981" : "#334155" }}
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

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left text-[13px] font-medium transition-all duration-150"
            style={{ color: "#334155", border: "1px solid transparent" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(255,255,255,0.04)";
              (e.currentTarget as HTMLElement).style.color = "#64748b";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "#334155";
            }}
          >
            <ChevronLeft
              size={16}
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

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left text-[13px] font-medium transition-all duration-150"
            style={{
              color: "#ef4444",
              border: "1px solid transparent",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(239,68,68,0.08)";
              (e.currentTarget as HTMLElement).style.border =
                "1px solid rgba(239,68,68,0.15)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.border =
                "1px solid transparent";
            }}
          >
            <LogOut
              size={16}
              strokeWidth={1.8}
              className="flex-shrink-0"
              style={{ color: "#ef4444" }}
            />
            <span
              className={`whitespace-nowrap transition-all duration-200 ${
                collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
              }`}
            >
              Log Out
            </span>
          </button>
        </div>
      </aside>

      {/* ══ MAIN AREA ══ */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* ── Topbar ── */}
        <header
          className="flex items-center justify-between h-14 px-6 flex-shrink-0 z-10"
          style={{
            background: "#111827",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Breadcrumb />

          {/* Avatar only */}
          <button className="flex items-center gap-2.5 group">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold"
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                boxShadow: "0 2px 8px rgba(16,185,129,0.3)",
              }}
            >
              RX
            </div>
            <div className="hidden md:flex flex-col leading-tight text-left">
              <span
                className="text-xs font-semibold"
                style={{ color: "#e2e8f0" }}
              >
                Rex Admin
              </span>
              <span className="text-[10px]" style={{ color: "#475569" }}>
                Business Owner
              </span>
            </div>
          </button>
        </header>

        {/* ── Outlet ── */}
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden min-h-0"
          style={{ background: "#0f1117" }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppSidebar;
