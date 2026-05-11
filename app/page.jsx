"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import LandingPage from "@/components/LandingPage";
import Login from "@/components/Login";
import Footer from "@/components/Footer";

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <main>
      {!showLogin && <Navbar />}
      {showLogin ? (
        <Login onClose={() => setShowLogin(false)} />
      ) : (
        <LandingPage onLoginClick={() => setShowLogin(true)} />
      )}
      <Footer />
    </main>
  );
}
