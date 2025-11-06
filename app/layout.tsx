import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hostel Management System",
  description:
    "A comprehensive Hostel Management System for managing student admissions, room allocations, complaints, and hostel records efficiently. Includes features for handling student details, tracking maintenance requests, and streamlining hostel administration.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Pick a safe SSR default; client script below will adjust instantly.
  const LIGHT = "corporate";
  const DARK = "night";
  const SSR_DEFAULT = DARK;

  return (
    <html lang="en" data-theme={SSR_DEFAULT} suppressHydrationWarning>
      <head>
        {/* Snap to saved/system theme BEFORE React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  var LIGHT = "${LIGHT}";
  var DARK = "${DARK}";
  try {
    var saved = localStorage.getItem("theme");
    var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = saved || (prefersDark ? DARK : LIGHT);
    var el = document.documentElement;
    if (el.getAttribute("data-theme") !== theme) el.setAttribute("data-theme", theme);
    // Keep other tabs/windows in sync:
    window.addEventListener("storage", function (e) {
      if (e.key === "theme" && e.newValue) el.setAttribute("data-theme", e.newValue);
    });
  } catch (e) {}
})();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}