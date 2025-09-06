import React, { useEffect, useState, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import * as bootstrap from "bootstrap";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./styleD.css";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/trustlineLOGO.PNG";
import { AuthContext } from '../App'; // ADD THIS IMPORT

function SignIn() {
  const navigate = useNavigate();
  const { setCurrentUser } = useContext(AuthContext); // ADD THIS LINE

  // ---------- STATE ----------
  const [step, setStep] = useState("signin"); // signin | aadhar | signup
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("client");
  const [aadhar, setAadhar] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [helperKey, setHelperKey] = useState("");

  // ---------- INIT PREMADE USERS ----------
  useEffect(() => {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    const premade = [
      { username: "client", password: "1234", aadhar: "111122223333", code: "CL001", role: "client" },
      { username: "helper", password: "1234", aadhar: "444455556666", code: "HL001", role: "helper" },
      { username: "admin",  password: "1234", aadhar: "001122334455", code: "AD001", role: "admin" },
    ];
    premade.forEach(p => {
      if (!users.find(u => u.username === p.username)) {
        users.push(p);
      }
    });
    localStorage.setItem("users", JSON.stringify(users));
  }, []);

  // ---------- HANDLE SIGN IN ----------
  const handleSignIn = (e) => {
    e.preventDefault();
    let users = JSON.parse(localStorage.getItem("users")) || [];
    let found = users.find(u => u.username === username && u.password === password);

    if (!found) {
      alert("❌ Invalid credentials!");
      return;
    }

    // Save currentUser using context (this will update App.js state)
    setCurrentUser(found); // CHANGED THIS LINE

    // Premade users skip Aadhaar → direct redirect
    if (
      (found.username === "client" && found.password === "1234") ||
      (found.username === "helper" && found.password === "1234") ||
      (found.username === "admin" && found.password === "1234")
    ) {
      if (found.role === "client") navigate("/homeC");
      else if (found.role === "helper") navigate("/homeH");
      else if (found.role === "admin") navigate("/homeA");
      return;
    }

    // Otherwise Aadhaar check
    setStep("aadhar");
  };

  // ---------- FORMAT AADHAAR ----------
  const handleAadharChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // keep digits only
    if (value.length > 12) value = value.slice(0, 12); // max 12 digits
    let formatted = value.replace(/(.{4})/g, "$1 ").trim(); // insert space every 4 digits
    setAadhar(formatted);
  };

  // ---------- VERIFY AADHAAR ----------
  const verifyAadhar = () => {
    const cleanAadhar = aadhar.replace(/\s/g, "");
    if (cleanAadhar.length !== 12) {
      alert("⚠️ Enter valid 12-digit Aadhaar!");
      return;
    }
    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      let users = JSON.parse(localStorage.getItem("users")) || [];
      let found = users.find(u => u.aadhar === cleanAadhar);

      if (found) {
        setCurrentUser(found); // CHANGED THIS LINE
        if (found.role === "client") navigate("/homeC");
        else if (found.role === "helper") navigate("/homeH");
        else if (found.role === "admin") navigate("/homeA");
      } else {
        setStep("signup");
      }
    }, 3000);
  };

  // ---------- HANDLE SIGN UP ----------
  const handleSignUp = (e) => {
    e.preventDefault();
    let users = JSON.parse(localStorage.getItem("users")) || [];

    if (password !== confirmPassword) {
      alert("⚠️ Passwords do not match!");
      return;
    }
    if (users.find(u => u.username === username)) {
      alert("⚠️ Username already exists!");
      return;
    }
    if (role === "helper" && helperKey !== "12345678") {
      alert("⚠️ Invalid Helper Key!");
      return;
    }

    let prefix = role === "client" ? "CL" : "HL";
    let existingCodes = users
      .filter(u => u.role === role)
      .map(u => parseInt(u.code.replace(prefix, "")));

    let nextNum = (existingCodes.length ? Math.max(...existingCodes) : 0) + 1;
    let newCode = prefix + String(nextNum).padStart(3, "0");

    let newUser = { username, password, aadhar: aadhar.replace(/\s/g, ""), code: newCode, role };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    setCurrentUser(newUser); // CHANGED THIS LINE

    alert(`✅ Account created! Your code: ${newCode}`);

    if (role === "client") navigate("/homeC");
    else if (role === "helper") navigate("/homeH");
  };

  // ---------- TOOLTIP INIT ----------
  useEffect(() => {
    const tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.map((el) => new bootstrap.Tooltip(el));
  }, []);

  return (
    <>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-custom px-4">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img src={logo} alt="Logo" className="navbar-logo" />
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto ms-3">
            <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
            <li className="nav-item">
              <a className="nav-link locked" href="#" data-bs-toggle="tooltip" title="Sign In first to access this">Complain</a>
            </li>
            <li className="nav-item">
              <a className="nav-link locked" href="#" data-bs-toggle="tooltip" title="Sign In first to access this">Chat</a>
            </li>
            <li className="nav-item"><Link className="nav-link" to="/about">About</Link></li>
          </ul>
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="btn btn-warning text-dark fw-bold" to="/signin">Sign In</Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Body */}
      <section className="signin-body">
        <div className="signin-container">

          {/* Sign In */}
          {step === "signin" && (
            <form onSubmit={handleSignIn} autoComplete="off">
              <h2 className="signin-title">Sign In</h2>
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input type="text" className="form-control" autoComplete="off"
                  value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" autoComplete="new-password"
                  value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-warning w-100 mb-2">Sign In</button>
              <p className="text-center">
                Don&apos;t have an account?{" "}
                <a href="#" onClick={(e) => { e.preventDefault(); setStep("aadhar"); }}>
                  Sign Up
                </a>
              </p>
            </form>
          )}

          {/* Aadhaar Step */}
          {step === "aadhar" && (
            <div>
              <button type="button" className="btn btn-link text-secondary mb-2"
                onClick={() => setStep("signin")}>
                ← Back
              </button>
              <h2 className="signin-title">Verify Aadhaar</h2>
              <input type="text" className="form-control mb-3"
                placeholder="1234 5678 9012"
                value={aadhar} onChange={handleAadharChange} />
              {!loading && (
                <button onClick={verifyAadhar} className="btn btn-warning w-100">Verify</button>
              )}
              {loading && (
                <div className="text-center">
                  <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p>Verifying...</p>
                </div>
              )}
            </div>
          )}

          {/* Signup Step */}
          {step === "signup" && (
            <form onSubmit={handleSignUp} autoComplete="off">
              <button type="button" className="btn btn-link text-secondary mb-2"
                onClick={() => setStep("signin")}>
                ← Back
              </button>
              <h2 className="signin-title">Sign Up</h2>
              <div className="form-check form-switch mb-3">
                <input className="form-check-input" type="checkbox"
                  checked={role === "helper"}
                  onChange={() => setRole(role === "client" ? "helper" : "client")} />
                <label className="form-check-label">
                  {role === "client" ? "Client" : "Helper"}
                </label>
              </div>
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input type="text" className="form-control" autoComplete="off"
                  value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input type="password" className="form-control" autoComplete="new-password"
                  value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Confirm Password</label>
                <input type="password" className="form-control" autoComplete="new-password"
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
              {role === "helper" && (
                <div className="mb-3">
                  <label className="form-label">Helper Key</label>
                  <input type="password" className="form-control" autoComplete="off"
                    value={helperKey} onChange={(e) => setHelperKey(e.target.value)} required />
                </div>
              )}
              <button type="submit" className="btn btn-warning w-100">Create Account</button>
            </form>
          )}

        </div>
      </section>
    </>
  );
}
export default SignIn;