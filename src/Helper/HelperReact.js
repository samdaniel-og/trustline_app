import React from "react";
import { Routes, Route } from "react-router-dom";

import HomeH from "./HomeH";
import AboutH from "./AboutH";
import ComplaintH from "./ComplaintH";
import ChatH from "./ChatH";

import SignIn from "../Defualt/SignIn";

function HelperReact() {
  return (
    <Routes>
      <Route path="/homeH" element={<HomeH />} />
      <Route path="/aboutH" element={<AboutH />} />
      <Route path="/complaintH" element={<ComplaintH />} />
      <Route path="/chatH" element={<ChatH />} />
      <Route path="/signin" element={<SignIn />} />
    </Routes>
  );
}

export default HelperReact;
