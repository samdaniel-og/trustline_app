// App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// ---------- Default ----------
import DefualtHome from "./Defualt/Home";
import DefualtAbout from "./Defualt/About";
import SignIn from "./Defualt/SignIn";

// ---------- Client ----------
import HomeC from "./Client/HomeC";
import AboutC from "./Client/AboutC";
import ComplaintC from "./Client/ComplaintC";
import ChatC from "./Client/ChatC";

// ---------- Helper ----------
import HomeH from "./Helper/HomeH";
import AboutH from "./Helper/AboutH";
import ComplaintH from "./Helper/ComplaintH";
import ChatH from "./Helper/ChatH";

// ---------- Admin ----------
import HomeA from "./Admin/HomeA";
import AboutA from "./Admin/AboutA";
import ComplaintA from "./Admin/ComplaintA";
import ChatA from "./Admin/ChatA";

// Create Auth Context
export const AuthContext = React.createContext();

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize user from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser")) || null;
    setCurrentUser(user);
    setLoading(false);
  }, []);

  // Update localStorage and state when user changes
  const updateUser = (userData) => {
    if (userData) {
      localStorage.setItem("currentUser", JSON.stringify(userData));
    } else {
      localStorage.removeItem("currentUser");
    }
    setCurrentUser(userData);
  };

  // Listen for storage events to sync across tabs
  useEffect(() => {
    const handleStorageChange = () => {
      const user = JSON.parse(localStorage.getItem("currentUser")) || null;
      setCurrentUser(user);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Show loading while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser: updateUser }}>
      <Router>
        <Routes>
          {/* ---------- Default (no login) ---------- */}
          {!currentUser && (
            <>
              <Route path="/" element={<DefualtHome />} />
              <Route path="/about" element={<DefualtAbout />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}

          {/* ---------- Client ---------- */}
          {currentUser?.role === "client" && (
            <>
              <Route path="/" element={<HomeC />} />
              <Route path="/homeC" element={<HomeC />} />
              <Route path="/aboutC" element={<AboutC />} />
              <Route path="/complaintC" element={<ComplaintC />} />
              <Route path="/chatC" element={<ChatC />} />
              <Route path="*" element={<Navigate to="/homeC" replace />} />
            </>
          )}

          {/* ---------- Helper ---------- */}
          {currentUser?.role === "helper" && (
            <>
              <Route path="/" element={<HomeH />} />
              <Route path="/homeH" element={<HomeH />} />
              <Route path="/aboutH" element={<AboutH />} />
              <Route path="/complaintH" element={<ComplaintH />} />
              <Route path="/chatH" element={<ChatH />} />
              <Route path="*" element={<Navigate to="/homeH" replace />} />
            </>
          )}

          {/* ---------- Admin ---------- */}
          {currentUser?.role === "admin" && (
            <>
              <Route path="/" element={<HomeA />} />
              <Route path="/homeA" element={<HomeA />} />
              <Route path="/aboutA" element={<AboutA />} />
              <Route path="/complaintA" element={<ComplaintA />} />
              <Route path="/chatA" element={<ChatA />} />
              <Route path="*" element={<Navigate to="/homeA" replace />} />
            </>
          )}
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;