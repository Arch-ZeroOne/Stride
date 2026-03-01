import React, { useState } from "react";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { ShoppingBag, User, ArrowRight, Sparkles } from "lucide-react";
import client from "../../axiosClient";

function Login() {
  const [firstname, setFirstname] = useState<string>("");
  const [lastname, setLastname] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = () => {
    if (!firstname.trim() || !lastname.trim()) {
      Swal.fire({
        title: "Missing Fields",
        text: "Please enter both your first and last name.",
        icon: "error",
        background: "#111827",
        color: "#e2e8f0",
        confirmButtonColor: "#10b981",
      });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);

      // Admin bypass
      if (
        firstname.toLowerCase() === "admin" &&
        lastname.toLowerCase() === "123"
      ) {
        Swal.fire({
          title: `Welcome, Admin`,
          text: "Would you like to proceed to the dashboard?",
          icon: "success",
          showCancelButton: true,
          confirmButtonColor: "#10b981",
          cancelButtonColor: "#334155",
          confirmButtonText: "Go to Dashboard",
          background: "#111827",
          color: "#e2e8f0",
        }).then(() => {
          let timerInterval: number;
          Swal.fire({
            title: "You are being redirected please wait!",
            html: "I will close in <b></b> milliseconds.",
            timer: 2000,
            timerProgressBar: true,
            didOpen: () => {
              Swal.showLoading();
              const timer = Swal.getPopup()?.querySelector("b");
              timerInterval = setInterval(() => {
                if (!timer) return;
                timer.textContent = `${Swal.getTimerLeft()}`;
              }, 100);
            },
            willClose: () => {
              clearInterval(timerInterval);
            },
          }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
              navigate("/admin");
            }
          });
          localStorage.setItem("Logged", JSON.stringify("Logged"));
        });
        return;
      }

      // Seller login
      Swal.fire({
        title: `Welcome, ${firstname}!`,
        text: "Proceed to the POS page?",
        icon: "success",
        showCancelButton: true,
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#334155",
        confirmButtonText: "Go to POS",
        background: "#111827",
        color: "#e2e8f0",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const response = await client.post(`/sellers/login`, {
              firstname,
              lastname,
            });
            const { logged, message } = response.data;

            console.log(response);

            if (logged) {
              let timerInterval: number;
              Swal.fire({
                title: "You are being redirected please wait!",
                html: "I will close in <b></b> milliseconds.",
                timer: 2000,
                timerProgressBar: true,
                didOpen: () => {
                  Swal.showLoading();
                  const timer = Swal.getPopup()?.querySelector("b");
                  timerInterval = setInterval(() => {
                    if (!timer) return;
                    timer.textContent = `${Swal.getTimerLeft()}`;
                  }, 100);
                },
                willClose: () => {
                  clearInterval(timerInterval);
                },
              }).then((result) => {
                if (result.dismiss === Swal.DismissReason.timer) {
                  navigate("/seller");
                }
              });
              localStorage.setItem("Logged", JSON.stringify("Logged"));
            } else {
              Swal.fire({
                title: "Error Logging In",
                text: `${message}`,
                icon: "error",
                background: "#111827",
                color: "#e2e8f0",
                confirmButtonColor: "#10b981",
              });
            }
          } catch {
            Swal.fire({
              title: "Not Found",
              text: "Seller account not found. Please check your name.",
              icon: "error",
              background: "#111827",
              color: "#e2e8f0",
              confirmButtonColor: "#10b981",
            });
          }
        }
      });
    }, 700);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#1a2035",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "12px",
    padding: "12px 14px 12px 40px",
    fontSize: "13px",
    color: "#e2e8f0",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
    fontFamily: "'Sora', 'DM Sans', sans-serif",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#475569",
    marginBottom: "6px",
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
      {/* ── Background glows ── */}
      <div
        style={{
          position: "absolute",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 65%)",
          top: "-160px",
          left: "-160px",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 65%)",
          bottom: "-120px",
          right: "-120px",
          pointerEvents: "none",
        }}
      />
      {/* Subtle grid texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />

      {/* ── Card ── */}
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          margin: "0 16px",
          background: "#111827",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "28px",
          padding: "44px 40px",
          boxShadow:
            "0 32px 72px rgba(0,0,0,0.5), 0 0 0 1px rgba(16,185,129,0.04)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "20%",
            right: "20%",
            height: "2px",
            borderRadius: "0 0 8px 8px",
            background:
              "linear-gradient(90deg, transparent, #10b981, transparent)",
          }}
        />

        {/* ── Logo section ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "40px",
          }}
        >
          {/* Icon with ring */}
          <div style={{ position: "relative", marginBottom: "18px" }}>
            <div
              style={{
                position: "absolute",
                inset: "-6px",
                borderRadius: "24px",
                background:
                  "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)",
              }}
            />
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "18px",
                background: "linear-gradient(135deg, #10b981, #059669)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 28px rgba(16,185,129,0.4)",
                position: "relative",
              }}
            >
              <ShoppingBag size={27} color="#fff" />
            </div>
          </div>

          <h1
            style={{
              color: "#fff",
              fontSize: "24px",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            Swift<span style={{ color: "#10b981" }}>POS</span>
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "8px",
            }}
          >
            <div
              style={{
                height: "1px",
                width: "28px",
                background: "rgba(255,255,255,0.06)",
              }}
            />
            <p
              style={{
                color: "#334155",
                fontSize: "11px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              Internal Access
            </p>
            <div
              style={{
                height: "1px",
                width: "28px",
                background: "rgba(255,255,255,0.06)",
              }}
            />
          </div>
        </div>

        {/* ── Welcome text ── */}
        <div style={{ marginBottom: "28px" }}>
          <h2
            style={{
              color: "#e2e8f0",
              fontSize: "16px",
              fontWeight: 700,
              margin: "0 0 4px 0",
            }}
          >
            Good to see you 👋
          </h2>
          <p
            style={{
              color: "#475569",
              fontSize: "12px",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Enter your name to sign in to your account
          </p>
        </div>

        {/* ── Fields ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* First Name */}
          <div>
            <label style={labelStyle}>First Name</label>
            <div style={{ position: "relative" }}>
              <User
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
                placeholder="e.g. Juan"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                onKeyDown={handleKeyDown}
                style={inputStyle}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")
                }
              />
            </div>
          </div>

          {/* Last Name */}
          <div>
            <label style={labelStyle}>Last Name</label>
            <div style={{ position: "relative" }}>
              <User
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
                placeholder="e.g. Dela Cruz"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                onKeyDown={handleKeyDown}
                style={inputStyle}
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

        {/* ── Sign in button ── */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            marginTop: "28px",
            padding: "14px",
            borderRadius: "14px",
            border: "none",
            background: loading
              ? "rgba(16,185,129,0.4)"
              : "linear-gradient(135deg, #10b981, #059669)",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 700,
            fontFamily: "inherit",
            letterSpacing: "0.02em",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "0 4px 20px rgba(16,185,129,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "box-shadow 0.2s",
          }}
          onMouseEnter={(e) => {
            if (!loading)
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 8px 32px rgba(16,185,129,0.5)";
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
              Signing in…
            </>
          ) : (
            <>
              Sign In
              <ArrowRight size={15} />
            </>
          )}
        </button>

        {/* ── Footer ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            marginTop: "24px",
          }}
        >
          <Sparkles size={11} style={{ color: "#1e293b" }} />
          <p style={{ fontSize: "11px", color: "#1e293b", margin: 0 }}>
            SwiftPOS — Internal Access Only
          </p>
          <Sparkles size={11} style={{ color: "#1e293b" }} />
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #334155; }
      `}</style>
    </div>
  );
}

export default Login;
