import React, { useState } from "react";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
function Login() {
  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();
  const navigate = useNavigate();
  const handleRole = () => {
    if (email && email === "admin_123" && password === "password123") {
      setEmail("");
      setPassword("");

      Swal.fire({
        title: "Welcome Admin",
        text: "Welcome Admin 123 Would you like to proceed?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Navigate me to dashboard",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/admin");
        }
      });
    } else {
      Swal.fire({
        title: "Welcome Seller",
        text: "Would you like to proceed?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Navigate me to POS Page",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/seller");
        }
      });
    }
  };
  return (
    <div className="flex justify-center items-center h-screen">
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
        <legend className="fieldset-legend">Login to Stride</legend>

        <label className="label">Email</label>
        <input
          type="email"
          className="input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="label">Password</label>
        <input
          type="password"
          className="input"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn btn-success mt-4" onClick={() => handleRole()}>
          Login
        </button>
      </fieldset>
    </div>
  );
}

export default Login;
