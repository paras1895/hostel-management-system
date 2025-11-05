// app/signup/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import AuthForm from "@/components/AuthForm";
import AlertBanner from "@/components/AlertBanner";

export default function SignupPage() {
  const sp = useSearchParams() ?? new URLSearchParams();

  return (
    <>
      <Navbar />
      <main className="flex flex-col justify-center items-center min-h-[calc(100vh-4rem)] bg-base-200 space-y-4 p-4 pt-20">
        <AlertBanner message={sp.get("message") ?? ""} error={sp.get("error") ?? ""} />
        <AuthForm type="signup" />
      </main>
    </>
  );
}