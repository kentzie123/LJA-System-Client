"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("lja-dark");

  // Toggle function
  const toggleTheme = () => {
    const newTheme = theme === "lja-dark" ? "lja-light" : "lja-dark";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("hris-theme", newTheme); // Save preference
  };

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("hris-theme") || "lja-dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-ghost btn-circle text-gray-400 hover:text-white"
    >
      {/* DaisyUI Swap Component logic */}
      {theme === "lja-dark" ? (
        <Sun size={20} className="text-yellow-400" /> // Sun icon for Dark mode
      ) : (
        <Moon size={20} className="text-blue-600" /> // Moon icon for Light mode
      )}
    </button>
  );
}
