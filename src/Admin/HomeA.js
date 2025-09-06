import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./styleA.css";
import { Link, useNavigate } from "react-router-dom";

// Import images
import logo from "../assets/trustlineLOGO.PNG";
import img1 from "../assets/financialfraud.jpeg";
import img2 from "../assets/onlineharassment.jpeg";
import img3 from "../assets/identitytheft.jpg";
import img4 from "../assets/onlineblackmail.avif";

function HomeA() {
  const navigate = useNavigate();
  const [solvedCasesCount, setSolvedCasesCount] = useState(0);

  // Load solved cases count from localStorage
  useEffect(() => {
    // Load solved cases count from localStorage
    const loadSolvedCasesCount = () => {
      try {
        // Get all complaints from localStorage
        const complaints = JSON.parse(localStorage.getItem("complaints")) || [];
        
        // Count solved cases
        const solvedCount = complaints.filter(complaint => 
          complaint.status === "solved"
        ).length;
        
        setSolvedCasesCount(solvedCount);
        
        // Update the counter display with animation
        animateCounter(solvedCount);
      } catch (error) {
        console.error("Error loading solved cases count:", error);
      }
    };

    // Function to animate the counter
    const animateCounter = (targetCount) => {
      const counterElement = document.getElementById("cases-solved");
      if (!counterElement) return;
      
      let currentCount = 0;
      const duration = 2000; // Animation duration in milliseconds
      const frameDuration = 1000 / 60; // 60 frames per second
      const totalFrames = Math.round(duration / frameDuration);
      const increment = targetCount / totalFrames;
      
      const counter = setInterval(() => {
        currentCount += increment;
        if (currentCount >= targetCount) {
          currentCount = targetCount;
          clearInterval(counter);
        }
        counterElement.textContent = Math.floor(currentCount);
      }, frameDuration);
    };

    loadSolvedCasesCount();

    // Listen for storage events to update the counter in real-time
    const handleStorageChange = () => {
      loadSolvedCasesCount();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup event listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Handle Sign Out → go to Default SignIn
  const handleSignOut = () => {
    localStorage.removeItem("currentUser"); // Clear localStorage
    // Force a reload by dispatching a storage event
    window.dispatchEvent(new Event('storage'));
    navigate("/signin");
  };

  return (
    <>
      <div>
        {/* Navbar */}
        <nav className="navbar navbar-expand-lg navbar-dark bg-custom px-4">
          <Link className="navbar-brand d-flex align-items-center" to="/homeA">
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
                <Link className="nav-link active" to="/homeA">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/complaintA">
                  Complaint
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/chatA">
                  Chat
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/aboutA">
                  About
                </Link>
              </li>
            </ul>

            <ul className="navbar-nav">
              <li className="nav-item">
                <button
                  className="btn btn-danger fw-bold"
                  onClick={handleSignOut}
                >
                  Sign Out
                </button>
              </li>
            </ul>
          </div>
        </nav>

        {/* Cases Solved Section */}
        <section className="cases-section">
          <div className="cases-overlay">
            <h1 id="cases-solved">{solvedCasesCount}</h1>
            <p className="cases-text">Cases Solved</p>
          </div>
        </section>

        {/* Complaint Section */}
        <div className="complaint-section">
          <div className="complaint-box">
            <img src={img1} alt="Financial Fraud" />
            <p className="crime-type">Financial Fraud</p>
            <Link className="complaint-btn" to="/complaintA">
              Give Complaint
            </Link>
          </div>
          <div className="complaint-box">
            <img src={img2} alt="Online Harassment" />
            <p className="crime-type">Online Harassment</p>
            <Link className="complaint-btn" to="/complaintA">
              Give Complaint
            </Link>
          </div>
          <div className="complaint-box">
            <img src={img3} alt="Identity Theft" />
            <p className="crime-type">Identity Theft</p>
            <Link className="complaint-btn" to="/complaintA">
              Give Complaint
            </Link>
          </div>
          <div className="complaint-box">
            <img src={img4} alt="Online Blackmail" />
            <p className="crime-type">Online Blackmail</p>
            <Link className="complaint-btn" to="/complaintA">
              Give Complaint
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-container">
            <div className="footer-about">
              <h2>Trust Line</h2>
              <p>
                A safe and anonymous platform to report complaints without
                sharing personal information.
              </p>
            </div>

            <div className="footer-links">
              <h3>Quick Links</h3>
              <ul>
                <li><Link to="/homeA">Home</Link></li>
                <li><a href="#">How It Works</a></li>
                <li><a href="#">FAQ</a></li>
                <li><a href="#">Terms & Conditions</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>

            <div className="footer-contact">
              <h3>Contact & Support</h3>
              <p>
                Email:{" "}
                <a href="mailto:support@trustline.com">
                  support@trustline.com
                </a>
              </p>
              <p>🔒 100% Anonymous – Your identity is never stored</p>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2025 Trust Line. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}

export default HomeA;