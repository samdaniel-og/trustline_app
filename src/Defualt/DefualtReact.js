import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./Home";
import About from "./About";
import SignIn from "./SignIn";

function DefualtReact() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About/>} />
      <Route path="/signin" element={<SignIn />} />
    </Routes>
  );
}

export default DefualtReact;
