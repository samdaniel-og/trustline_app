import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import * as bootstrap from "bootstrap"; // ✅ import bootstrap object
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./styleD.css";
import { Link } from "react-router-dom";

// Logo image
import logo from "../assets/trustlineLOGO.PNG";

function About() {
  // Bootstrap tooltip setup
  useEffect(() => {
    const tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.map((tooltipTriggerEl) => {
      return new bootstrap.Tooltip(tooltipTriggerEl); // ✅ correct bootstrap usage
    });
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
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>

            <li className="nav-item">
              <a
                className="nav-link locked"
                href="#"
                data-bs-toggle="tooltip"
                data-bs-placement="bottom"
                title="Sign In first to access this"
              >
                Complain
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link locked"
                href="#"
                data-bs-toggle="tooltip"
                data-bs-placement="bottom"
                title="Sign In first to access this"
              >
                Chat
              </a>
            </li>

            <li className="nav-item">
              <Link className="nav-link active" to="/about">
                About
              </Link>
            </li>
          </ul>

          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="btn btn-warning text-dark fw-bold" to="/signin">
                Sign In
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* About Content */}
      <div className="about-container">
        <h1>Welcome to Trust Line</h1>
        <p className="intro">
          Trust Line is a safe and anonymous platform where anyone can report
          complaints without revealing their identity. Your complaint is handled
          seriously, and your privacy is always protected.
        </p>

        <section className="section">
          <h2>Rules & Regulations</h2>
          <ul>
            <li>
              You must provide a valid Aadhar card number to verify your
              identity. This is only for verification purposes.
            </li>
            <li>
              Your identity will never be revealed to anyone, including the
              person handling the complaint.
            </li>
            <li>
              If your complaint is found to be false or fake, you may face fines
              or legal consequences, including jail.
            </li>
            <li>
              By submitting a complaint, you agree to all the rules and
              regulations listed here.
            </li>
          </ul>
        </section>

        <section className="section">
          <h2>Privacy Policy</h2>
          <p>
            Trust Line respects your privacy. Your personal information,
            including Aadhar number, is used solely for verification and will
            not be shared or misused. We maintain strict confidentiality for all
            complaints.
          </p>
        </section>

        <section className="section">
          <h2>Terms of Service</h2>
          <p>
            By using Trust Line, you acknowledge and agree that all complaints
            are subject to verification. False complaints can lead to legal
            action. You also accept that the platform maintains anonymity for
            complainants and ensures fairness in complaint handling.
          </p>
        </section>
      </div>
    </>
  );
}

export default About;
