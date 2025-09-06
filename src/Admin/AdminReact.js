import React from "react";
import { Routes, Route } from "react-router-dom";

import HomeA from "./HomeA";
import AboutA from "./AboutA";
import ComplaintA from "./ComplaintA";
import ChatA from "./ChatA";

import SignIn from "../Defualt/SignIn";

function AdminReact() {
  return (
    <Routes>
      <Route path="/homeA" element={<HomeA />} />
      <Route path="/aboutA" element={<AboutA />} />
      <Route path="/complaintA" element={<ComplaintA />} />
      <Route path="/chatA" element={<ChatA />} />
      <Route path="/signin" element={<SignIn />} />
    </Routes>
  );
}

export default AdminReact;
