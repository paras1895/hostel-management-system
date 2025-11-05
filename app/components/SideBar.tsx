"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import ThemeWatcher from "./ThemeWatcher";

export default function Sidebar({ role }: { role: "student" | "warden" }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, isDark } = ThemeWatcher();
  const profileLink = role === "warden" ? "/warden/profile" : "/profile";

  const linkClass = (path: string) =>
    `rounded-lg px-3 py-2 transition-colors ${
      pathname === path
        ? isDark
          ? "bg-blue-500 text-white"
          : "bg-blue-100 text-blue-800"
        : "hover:bg-white-200"
    }`;

  return (
    <aside className="w-64 bg-base-100 p-5 flex flex-col justify-between shadow-lg">
      <div>
        <h2 className="text-xl font-bold mb-6">
          {role === "warden" ? "🏢 Warden" : "🎓 Student"}
        </h2>
        <ul className="menu bg-base-100 rounded-box">
          <li>
            <Link href="/dashboard" className={linkClass("/dashboard")}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link href={profileLink} className={linkClass("/profile")}>
              Profile
            </Link>
          </li>

          {role === "warden" ? (
            <>
              <li>
                <Link
                  href="/warden/complaints"
                  className={linkClass("/warden/complaints")}
                >
                  Manage Complaints
                </Link>
              </li>
              <li>
                <Link
                  href="/warden/rooms"
                  className={linkClass("/warden/rooms")}
                >
                  Manage Rooms
                </Link>
              </li>
              <li>
                <Link
                  href="/warden/students"
                  className={linkClass("/warden/students")}
                >
                  Students
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  href="/complaints"
                  className={linkClass("/complaints")}
                >
                  Complaints
                </Link>
              </li>
              <li>
                <Link
                  href="/preferences"
                  className={linkClass("/preferences")}
                >
                  Room Preferences
                </Link>
              </li>
              <li>
                <Link
                  href="/roommates"
                  className={linkClass("/roommates")}
                >
                  Roommates
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>

      <div>
        <ThemeToggle />
        <div className="flex">
          <div>
            <div>
            </div>
            <div>
              <div>
              </div>
              <div>
              </div>
            </div>
          </div>
        </div>
        <button
          className="btn btn-error mt-6 text-white w-full"
          onClick={async () => {
            await fetch("/api/logout");
            router.replace("/login");
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
