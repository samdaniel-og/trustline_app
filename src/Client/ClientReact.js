import React from "react";
import { Routes, Route } from "react-router-dom";

import HomeC from "./HomeC";
import AboutC from "./AboutC";
import ComplaintC from "./ComplaintC";
import ChatC from "./ChatC";
import Home from "../Defualt/Home";

// ✅ Use shared SignIn from Default folder
import SignIn from "../Defualt/SignIn";

function ClientReact() {
  return (
    <Routes>
      <Route path="/homeC" element={<HomeC />} />
      <Route path="/aboutC" element={<AboutC />} />
      <Route path="/complaintC" element={<ComplaintC />} />
      <Route path="/chatC" element={<ChatC />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/" element={< Home/>} />
    </Routes>
  );
}

export default ClientReact;
