"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function ThemeToggle() {
  const lightTheme = "corporate";
  const darkTheme = "night";
  type ThemeType = typeof lightTheme | typeof darkTheme;

  const [theme, setTheme] = useState<ThemeType>(lightTheme);

  useEffect(() => {
    const saved = localStorage.getItem("theme") as ThemeType | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const initial = saved || (prefersDark ? darkTheme : lightTheme);
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === lightTheme ? darkTheme : lightTheme;
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      title="Toggle light/dark theme"
      aria-label="Toggle theme"
      className="relative btn btn-circle btn-ghost flex items-center justify-center overflow-hidden"
    >
      <Image
        src="/moon.svg"
        alt="Light mode"
        width={24}
        height={24}
        className={`absolute transition-all duration-500 transform ${
          theme === "corporate"
            ? "opacity-100 scale-100 rotate-0"
            : "opacity-0 scale-0 rotate-90"
        }`}
        priority
      />

      <Image
        src="/sun-white.svg"
        alt="Dark mode"
        width={24}
        height={24}
        className={`absolute transition-all duration-500 transform ${
          theme === "night"
            ? "opacity-100 scale-100 rotate-0"
            : "opacity-0 scale-0 -rotate-90"
        }`}
        priority
      />
    </button>
  );
}
