// components/AlertBanner.tsx
"use client";
import { useEffect, useState } from "react";

export default function AlertBanner({ message = "", error = "" }: { message?: string; error?: string }) {
  const [show, setShow] = useState(Boolean(message || error));

  useEffect(() => {
    if (message || error) {
      const t = setTimeout(() => setShow(false), 4000);
      return () => clearTimeout(t);
    }
  }, [message, error]);

  if (!show || (!message && !error)) return null;

  return (
    <div role="alert" className={`alert shadow-lg w-full max-w-md ${message ? "alert-success" : "alert-error"}`}>
      <span>{message || error}</span>
    </div>
  );
}