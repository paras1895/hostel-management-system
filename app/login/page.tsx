// app/login/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import AuthForm from "@/components/AuthForm";
import AlertBanner from "@/components/AlertBanner";

export default function LoginPage() {
  const sp = useSearchParams() ?? new URLSearchParams();

  return (
    <>
      <Navbar />
      <div className="flex flex-col justify-center items-center min-h-screen bg-base-200 space-y-4 p-4">
        <AlertBanner message={sp.get("message") ?? ""} error={sp.get("error") ?? ""} />
        <AuthForm type="login" />
      </div>
    </>
  );
}