"use client";

import { useEffect, useState } from "react";

export default function ThemeWatcher() {
  const [theme, setTheme] = useState<string>("corporate"); // default light
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const getTheme = () =>
      document.documentElement.getAttribute("data-theme") ||
      document.body.getAttribute("data-theme") ||
      "corporate";

    const darkThemes = ["night", "dark", "black", "dracula"];

    const currentTheme = getTheme();
    setTheme(currentTheme);
    setIsDark(darkThemes.includes(currentTheme));

    const observer = new MutationObserver(() => {
      const newTheme = getTheme();
      setTheme(newTheme);
      setIsDark(darkThemes.includes(newTheme));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return { theme, isDark };
}
