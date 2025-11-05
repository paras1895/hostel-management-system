"use client";

import Link from "next/link";
import SmallThemeToggle from "./SmallThemeToggle";

export default function Navbar() {
  return (
    <nav className="navbar fixed bg-base-100 shadow-md px-6 flex items-center">
      <div className="flex-1">
        <Link href="/" className="text-xl font-bold">
        <div className="flex items-center">
          <img src="/hostel-logo.png" alt="logo" className="w-10 pr-3" />
           Hostel Management System
        </div>
        </Link>
      </div>
      <div className="">
        <ul className="flex items-center gap-6">
          <li>
            <Link href="/login" className="font-medium">
              Login
            </Link>
          </li>
          <li>
            <Link href="/signup" className="font-medium">
              Sign Up
            </Link>
          </li>
          <li>
            <SmallThemeToggle />
          </li>
        </ul>
      </div>
    </nav>
  );
}
