import React, { useState } from "react";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { ShoppingBag, Mail, Lock, ArrowRight } from "lucide-react";

function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRole = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (email && email === "admin_123" && password === "password123") {
        setEmail("");
        setPassword("");
        Swal.fire({
          title: "Welcome Admin",
          text: "Welcome Admin 123 Would you like to proceed?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#10b981",
          cancelButtonColor: "#ef4444",
          confirmButtonText: "Navigate me to dashboard",
        }).then((result) => {
          if (result.isConfirmed) navigate("/admin");
        });
      } else {
        Swal.fire({
          title: "Welcome Seller",
          text: "Would you like to proceed?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#10b981",
          cancelButtonColor: "#ef4444",
          confirmButtonText: "Navigate me to POS Page",
        }).then((result) => {
          if (result.isConfirmed) navigate("/seller");
        });
      }
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleRole();
  };

  return (
    <div
      style={{
        fontFamily: "'Sora', 'DM Sans', sans-serif",
        background: "#0f1117",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow blobs */}
      <div
        style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
          top: "-100px",
          left: "-100px",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)",
          bottom: "-80px",
          right: "-80px",
          pointerEvents: "none",
        }}
      />

      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          margin: "0 16px",
          background: "#111827",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "24px",
          padding: "40px 36px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "36px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #10b981, #059669)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 24px rgba(16,185,129,0.35)",
              marginBottom: "16px",
            }}
          >
            <ShoppingBag size={26} color="#fff" />
          </div>
          <h1
            style={{
              color: "#fff",
              fontSize: "22px",
              fontWeight: "800",
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            SwiftPOS
          </h1>
          <p
            style={{
              color: "#475569",
              fontSize: "12px",
              marginTop: "4px",
              letterSpacing: "0.04em",
            }}
          >
            Sign in to your account
          </p>
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Email */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: "600",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#475569",
                marginBottom: "6px",
              }}
            >
              Username / Email
            </label>
            <div style={{ position: "relative" }}>
              <Mail
                size={14}
                style={{
                  position: "absolute",
                  left: "13px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#334155",
                  pointerEvents: "none",
                }}
              />
              <input
                type="text"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                  width: "100%",
                  background: "#1a2035",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "12px",
                  padding: "11px 14px 11px 38px",
                  fontSize: "13px",
                  color: "#e2e8f0",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")
                }
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: "600",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#475569",
                marginBottom: "6px",
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={14}
                style={{
                  position: "absolute",
                  left: "13px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#334155",
                  pointerEvents: "none",
                }}
              />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                  width: "100%",
                  background: "#1a2035",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "12px",
                  padding: "11px 14px 11px 38px",
                  fontSize: "13px",
                  color: "#e2e8f0",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")
                }
              />
            </div>
          </div>
        </div>

        {/* Login button */}
        <button
          onClick={handleRole}
          disabled={loading}
          style={{
            width: "100%",
            marginTop: "28px",
            padding: "13px",
            borderRadius: "14px",
            border: "none",
            background: loading
              ? "rgba(16,185,129,0.4)"
              : "linear-gradient(135deg, #10b981, #059669)",
            color: "#fff",
            fontSize: "14px",
            fontWeight: "700",
            fontFamily: "inherit",
            letterSpacing: "0.02em",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "0 4px 20px rgba(16,185,129,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "box-shadow 0.2s, opacity 0.2s",
          }}
          onMouseEnter={(e) => {
            if (!loading)
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 6px 28px rgba(16,185,129,0.5)";
          }}
          onMouseLeave={(e) => {
            if (!loading)
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 4px 20px rgba(16,185,129,0.35)";
          }}
        >
          {loading ? (
            <>
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                  animation: "spin 0.7s linear infinite",
                }}
              />
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight size={15} />
            </>
          )}
        </button>

        {/* Footer hint */}
        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "11px",
            color: "#1e293b",
          }}
        >
          Stride POS — Internal Access Only
        </p>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input::placeholder { color: #334155; }
      `}</style>
    </div>
  );
}

export default Login;
