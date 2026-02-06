import React from "react";

function Register() {
  return (
    <div className="flex mt-30 justify-center">
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4 items-center">
        <legend className="fieldset-legend">Login</legend>
        <div>
          <label className="label">Enter Email</label>
          <input type="email" className="input" placeholder="Email" />
        </div>
        <div>
          <label className="label">Enter Firstname</label>
          <input type="text" className="input" placeholder="Firstname" />
        </div>
        <div>
          <label className="label">Enter Middlename</label>
          <input type="text" className="input" placeholder="Middlename" />
        </div>
        <div>
          <label className="label">Enter Password</label>
          <input type="password" className="input" placeholder="Password" />
        </div>
        <div>
          <label className="label">Enter Username</label>
          <input type="text" className="input" placeholder="Username" />
        </div>
        <div>
          <label className="label">Enter Password</label>
          <input type="password" className="input" placeholder="Password" />
        </div>

        <button className="btn btn-neutral mt-4 ">Login</button>
      </fieldset>
    </div>
  );
}

export default Register;
