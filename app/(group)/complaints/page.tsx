"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Complaint = {
  id: number;
  message: string;
  status: string;
  createdAt: string;
};

export default function ComplaintPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const getTheme = () =>
      document.documentElement.getAttribute("data-theme") ||
      document.body.getAttribute("data-theme") ||
      "corporate"; // default light theme

    const darkThemes = ["night", "dark", "black", "dracula"]; // DaisyUI dark modes
    setIsDark(darkThemes.includes(getTheme() || ""));

    const observer = new MutationObserver(() => {
      const newTheme = getTheme();
      setIsDark(darkThemes.includes(newTheme || ""));
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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/me");
        if (res.status === 401) {
          router.replace(
            "/login?message=Please log in to access your dashboard"
          );
          return;
        }
        await fetchComplaints();
      } catch (err) {
        console.error(err);
        router.replace("/login");
      }
    };

    const fetchComplaints = async () => {
      try {
        const res = await fetch("/api/complaints");
        if (res.ok) {
          const data = await res.json();
          setComplaints(data);
        }
      } catch (error) {
        console.error("Error loading complaints:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [complaints]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (res.ok) {
        const newComplaint = await res.json();
        setComplaints((prev) => [...prev, newComplaint]);
        setMessage("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <p className="text-center mt-10 text-lg font-semibold">Loading...</p>
    );

  return (
    <div className="flex flex-col h-[90vh] bg-base-200 overflow-hidden">
      {/* Header */}
      <header className="pb-4 shrink-0 flex items-center gap-3">
        {isDark ? (
          <img src="/complaint-light.svg" alt="icon" className="w-6 h-6" />
        ) : (
          <img src="/complaint-dark.svg" alt="icon" className="w-6 h-6" />
        )}
        <h1 className="text-2xl font-bold">Complaints Chat</h1>
      </header>

      {/* Chat container */}
      <main className="flex-1 flex flex-col h-10 overflow-hidden">
        {/* Scrollable messages */}
        <div className={`${isDark ? "bg-gray-800" : "bg-white"} flex-1 bg-base-100 rounded-lg shadow-lg p-4 overflow-y-auto space-y-4`}>
          {complaints.length === 0 ? (
            <p className="text-center text-gray-500 mt-20">
              No complaints yet. Start by sending one below 👇
            </p>
          ) : (
            complaints.map((c) => (
              <div
                key={c.id}
                className={`chat ${
                  c.status === "Resolved" ? "chat-end" : "chat-start"
                }`}
              >
                <div className="chat-bubble bg-base-300 text-base-content">
                  <p>{c.message}</p>
                  <div className="mt-1 text-xs opacity-70">
                    <span className="block">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                    <span
                      className={`block font-semibold mt-1 ${
                        c.status === "Resolved"
                          ? "text-green-500"
                          : "text-red-500 animate-pulse"
                      }`}
                    >
                      {c.status === "Resolved" ? "✅ Resolved" : "⏳ Pending"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input box (stays visible at bottom) */}
        <form
          onSubmit={handleSubmit}
          className="shrink-0 mt-4 rounded-lg shadow-lg flex gap-2"
        >
          <input
            type="text"
            placeholder="Type your complaint..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="input input-bordered flex-1"
          />
          <button className="btn btn-primary rounded-lg" type="submit">
            Send
          </button>
        </form>
      </main>
    </div>
  );
}
