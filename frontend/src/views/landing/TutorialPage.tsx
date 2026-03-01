import React from "react";
import { useNavigate } from "react-router";
import {
  ShoppingBag,
  User,
  Shield,
  CheckCircle2,
  ArrowRight,
  Clock,
  UserCheck,
  Settings,
} from "lucide-react";

type Step = {
  icon: React.ElementType;
  title: string;
  desc: string;
};

const sellerSteps: Step[] = [
  {
    icon: User,
    title: "Request Registration",
    desc: "Contact your store's Super Admin and request a seller account.",
  },
  {
    icon: Clock,
    title: "Wait for Approval",
    desc: "Your account must be reviewed and approved before access.",
  },
  {
    icon: UserCheck,
    title: "Log In",
    desc: "Once approved, sign in using your credentials.",
  },
  {
    icon: ShoppingBag,
    title: "Start Using POS",
    desc: "Process sales, scan items, and track transactions.",
  },
];

const adminSteps: Step[] = [
  {
    icon: Shield,
    title: "Full Business Control",
    desc: "Manage sellers, inventory, reports, and permissions.",
  },
  {
    icon: Settings,
    title: "System Configuration",
    desc: "Customize pricing, store settings, and roles.",
  },
  {
    icon: CheckCircle2,
    title: "Subscription Ready",
    desc: "Soon, Super Admin registration will support subscriptions.",
  },
];

const TutorialPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        fontFamily: "'Sora','DM Sans',sans-serif",
        background: "#0f1117",
        color: "#e2e8f0",
        minHeight: "100vh",
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(17,24,39,0.95)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg,#10b981,#059669)",
              }}
            >
              <ShoppingBag size={17} className="text-white" />
            </div>
            <span className="font-bold text-base text-white">
              Swift<span style={{ color: "#10b981" }}>POS</span>
            </span>
          </div>

          <button
            onClick={() => navigate("/")}
            className="btn btn-sm"
            style={{
              background: "linear-gradient(135deg,#10b981,#059669)",
              border: "none",
              color: "#fff",
              fontWeight: 700,
              borderRadius: "10px",
            }}
          >
            Back Home
          </button>
        </div>
      </nav>

      {/* Header */}
      <section className="py-20 px-6 text-center">
        <h1
          className="font-black mb-4"
          style={{ fontSize: "clamp(2rem,5vw,3rem)" }}
        >
          How to Access <br />
          <span style={{ color: "#10b981" }}>SwiftPOS</span>
        </h1>
        <p style={{ color: "#64748b", maxWidth: 520, margin: "0 auto" }}>
          Follow the steps below depending on your role.
        </p>
      </section>

      {/* Seller Steps */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h2
            className="font-bold mb-10"
            style={{ fontSize: "1.6rem", color: "#10b981" }}
          >
            Seller Guide
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {sellerSteps.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={i}
                className="rounded-2xl p-6"
                style={{
                  background: "#111827",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <Icon size={20} style={{ color: "#10b981" }} />
                <h3 className="font-bold mt-3">{title}</h3>
                <p className="text-sm" style={{ color: "#64748b" }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admin Steps */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h2
            className="font-bold mb-10"
            style={{ fontSize: "1.6rem", color: "#6366f1" }}
          >
            Super Admin Guide
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {adminSteps.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={i}
                className="rounded-2xl p-6"
                style={{
                  background: "#111827",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <Icon size={20} style={{ color: "#6366f1" }} />
                <h3 className="font-bold mt-3">{title}</h3>
                <p className="text-sm" style={{ color: "#64748b" }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <button
          onClick={() => navigate("/signin")}
          className="btn btn-lg"
          style={{
            background: "linear-gradient(135deg,#10b981,#059669)",
            border: "none",
            color: "#fff",
            fontWeight: 700,
            borderRadius: "14px",
          }}
        >
          Go to Sign In
          <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
};

export default TutorialPage;
