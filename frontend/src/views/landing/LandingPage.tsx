import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  ShoppingBag,
  BarChart2,
  Package,
  Zap,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Shield,
  Clock,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast POS",
    desc: "Process sales in seconds with our optimized checkout flow and barcode scanning.",
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
  },
  {
    icon: Package,
    title: "Smart Inventory",
    desc: "Real-time stock tracking with automatic out-of-stock detection and alerts.",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.1)",
  },
  {
    icon: BarChart2,
    title: "Sales Analytics",
    desc: "Deep insights into revenue trends, top products, and seller performance.",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    desc: "Separate admin and seller roles with granular permission controls.",
    color: "#ec4899",
    bg: "rgba(236,72,153,0.1)",
  },
  {
    icon: TrendingUp,
    title: "Growth Tracking",
    desc: "Monitor business growth with period-over-period comparison dashboards.",
    color: "#14b8a6",
    bg: "rgba(20,184,166,0.1)",
  },
  {
    icon: Clock,
    title: "24/7 Uptime",
    desc: "Cloud-hosted on reliable infrastructure so your store never stops selling.",
    color: "#f97316",
    bg: "rgba(249,115,22,0.1)",
  },
];

const stats = [
  { value: "10k+", label: "Transactions" },
  { value: "99.9%", label: "Uptime" },
  { value: "< 1s", label: "Checkout Speed" },
  { value: "3x", label: "Faster Than Manual" },
];

const perks = [
  "Real-time inventory sync",
  "Barcode scanning support",
  "Multi-branch management",
  "Expense tracking",
  "Detailed sales reports",
  "Seller performance metrics",
];

function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      style={{
        fontFamily: "'Sora', 'DM Sans', sans-serif",
        background: "#0f1117",
        color: "#e2e8f0",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(17,24,39,0.95)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled
            ? "1px solid rgba(255,255,255,0.06)"
            : "1px solid transparent",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                boxShadow: "0 4px 14px rgba(16,185,129,0.4)",
              }}
            >
              <ShoppingBag size={17} className="text-white" />
            </div>
            <span className="font-bold text-base text-white tracking-tight">
              Swift<span style={{ color: "#10b981" }}>POS</span>
            </span>
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate("/admin/login")}
            className="btn btn-sm"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              border: "none",
              color: "#fff",
              fontFamily: "inherit",
              fontWeight: 700,
              fontSize: "13px",
              borderRadius: "10px",
              boxShadow: "0 2px 12px rgba(16,185,129,0.3)",
            }}
          >
            Get Started
            <ArrowRight size={13} />
          </button>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16">
        {/* Background blobs */}
        <div
          className="pointer-events-none absolute"
          style={{
            width: "700px",
            height: "700px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 65%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
        <div
          className="pointer-events-none absolute"
          style={{
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 65%)",
            top: "10%",
            right: "5%",
          }}
        />
        <div
          className="pointer-events-none absolute"
          style={{
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 65%)",
            bottom: "10%",
            left: "5%",
          }}
        />

        {/* Badge */}
        <div
          className="badge badge-outline mb-6 gap-2 px-4 py-3 text-xs font-semibold"
          style={{
            borderColor: "rgba(16,185,129,0.35)",
            color: "#10b981",
            background: "rgba(16,185,129,0.08)",
          }}
        >
          <Zap size={11} fill="#10b981" />
          Modern Point-of-Sale System
        </div>

        {/* Headline */}
        <h1
          className="font-black leading-tight mb-5"
          style={{
            fontSize: "clamp(2.6rem, 6vw, 4.5rem)",
            letterSpacing: "-0.03em",
            maxWidth: "820px",
            lineHeight: 1.1,
          }}
        >
          The POS that moves as fast
          <br />
          <span
            style={{
              background: "linear-gradient(90deg, #10b981, #34d399)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            as your business.
          </span>
        </h1>

        <p
          className="mb-10 leading-relaxed"
          style={{
            color: "#64748b",
            fontSize: "clamp(1rem, 2vw, 1.15rem)",
            maxWidth: "520px",
          }}
        >
          SwiftPOS gives your team real-time inventory control, fast checkout,
          and powerful analytics — all in one dark, modern interface.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
          <button
            onClick={() => navigate("/admin/login")}
            className="btn btn-lg"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              border: "none",
              color: "#fff",
              fontFamily: "inherit",
              fontWeight: 700,
              borderRadius: "14px",
              boxShadow: "0 6px 28px rgba(16,185,129,0.38)",
              fontSize: "15px",
              padding: "0 28px",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.boxShadow =
                "0 8px 36px rgba(16,185,129,0.55)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.boxShadow =
                "0 6px 28px rgba(16,185,129,0.38)")
            }
          >
            Get Started
            <ArrowRight size={16} />
          </button>
          <button
            className="btn btn-lg btn-ghost"
            style={{
              color: "#64748b",
              fontFamily: "inherit",
              fontWeight: 600,
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.08)",
              fontSize: "15px",
            }}
          >
            See Demo
          </button>
        </div>

        {/* Stats row */}
        <div
          className="flex flex-wrap justify-center gap-px rounded-2xl overflow-hidden"
          style={{
            border: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              className="flex flex-col items-center px-8 py-4"
              style={{
                borderRight:
                  i < stats.length - 1
                    ? "1px solid rgba(255,255,255,0.06)"
                    : "none",
              }}
            >
              <span
                className="font-black text-2xl"
                style={{ color: "#10b981", letterSpacing: "-0.02em" }}
              >
                {s.value}
              </span>
              <span className="text-xs mt-0.5" style={{ color: "#475569" }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <div
              className="badge badge-outline mb-4 px-4 py-2.5 text-xs font-bold gap-1.5"
              style={{
                borderColor: "rgba(99,102,241,0.35)",
                color: "#6366f1",
                background: "rgba(99,102,241,0.08)",
              }}
            >
              <BarChart2 size={11} />
              Everything you need
            </div>
            <h2
              className="font-black mb-4"
              style={{
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                letterSpacing: "-0.03em",
              }}
            >
              Built for modern retail
            </h2>
            <p
              style={{
                color: "#475569",
                maxWidth: "440px",
                margin: "0 auto",
                fontSize: "15px",
              }}
            >
              From the first scan to the final report, SwiftPOS handles every
              part of your sales workflow.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, desc, color, bg }, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 transition-all duration-200 group"
                style={{
                  background: "#111827",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    `${color}40`;
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateY(-3px)";
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    `0 12px 32px ${color}18`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(255,255,255,0.06)";
                  (e.currentTarget as HTMLElement).style.transform =
                    "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: bg }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                <h3
                  className="font-bold text-sm mb-2"
                  style={{ color: "#e2e8f0" }}
                >
                  {title}
                </h3>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "#475569" }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Perks strip ────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div
          className="max-w-6xl mx-auto rounded-3xl p-10 md:p-14 grid md:grid-cols-2 gap-10 items-center"
          style={{
            background: "#111827",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div>
            <div
              className="badge badge-outline mb-4 px-3 py-2 text-xs font-bold gap-1.5"
              style={{
                borderColor: "rgba(16,185,129,0.35)",
                color: "#10b981",
                background: "rgba(16,185,129,0.08)",
              }}
            >
              <CheckCircle2 size={11} />
              What's included
            </div>
            <h2
              className="font-black mb-4"
              style={{
                fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
              }}
            >
              Everything in one
              <br />
              <span style={{ color: "#10b981" }}>clean dashboard.</span>
            </h2>
            <p
              className="text-sm leading-relaxed mb-8"
              style={{ color: "#475569", maxWidth: "360px" }}
            >
              No bloat. No steep learning curve. Just the tools your team
              actually uses every single day.
            </p>
            <button
              onClick={() => navigate("/admin/login")}
              className="btn"
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                border: "none",
                color: "#fff",
                fontFamily: "inherit",
                fontWeight: 700,
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(16,185,129,0.3)",
                fontSize: "14px",
              }}
            >
              Get Started Free
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {perks.map((perk, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 rounded-xl px-4 py-3"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <CheckCircle2
                  size={14}
                  style={{ color: "#10b981", flexShrink: 0 }}
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: "#cbd5e1" }}
                >
                  {perk}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div
          className="max-w-3xl mx-auto text-center rounded-3xl py-16 px-8 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.06))",
            border: "1px solid rgba(16,185,129,0.2)",
          }}
        >
          {/* Glow */}
          <div
            className="pointer-events-none absolute"
            style={{
              width: "400px",
              height: "400px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 65%)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
            }}
          />

          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              boxShadow: "0 8px 28px rgba(16,185,129,0.45)",
              position: "relative",
            }}
          >
            <ShoppingBag size={28} className="text-white" />
          </div>

          <h2
            className="font-black mb-4"
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              letterSpacing: "-0.03em",
              position: "relative",
            }}
          >
            Ready to run a smarter store?
          </h2>
          <p
            className="mb-8 text-sm leading-relaxed"
            style={{
              color: "#64748b",
              maxWidth: "400px",
              margin: "0 auto 32px",
              position: "relative",
            }}
          >
            Join businesses already using SwiftPOS to sell faster, track
            smarter, and grow confidently.
          </p>
          <button
            onClick={() => navigate("/admin/login")}
            className="btn btn-lg"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              border: "none",
              color: "#fff",
              fontFamily: "inherit",
              fontWeight: 700,
              borderRadius: "14px",
              boxShadow: "0 6px 28px rgba(16,185,129,0.45)",
              fontSize: "15px",
              position: "relative",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.boxShadow =
                "0 8px 36px rgba(16,185,129,0.6)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.boxShadow =
                "0 6px 28px rgba(16,185,129,0.45)")
            }
          >
            Get Started
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer
        className="py-8 px-6 text-center text-xs"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          color: "#1e293b",
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
          >
            <ShoppingBag size={12} className="text-white" />
          </div>
          <span className="font-bold" style={{ color: "#334155" }}>
            SwiftPOS
          </span>
        </div>
        <p>© {new Date().getFullYear()} SwiftPOS. Internal use only.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
