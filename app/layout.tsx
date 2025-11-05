import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hostel Management System",
  description:
    "A comprehensive Hostel Management System for managing student admissions, room allocations, complaints, and hostel records efficiently. Includes features for handling student details, tracking maintenance requests, and streamlining hostel administration.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  var light = "corporate";
  var dark = "night";
  try {
    var saved = localStorage.getItem("theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = saved || (prefersDark ? dark : light);
    document.documentElement.setAttribute("data-theme", theme);
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
