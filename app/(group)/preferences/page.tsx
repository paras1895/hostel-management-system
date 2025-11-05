// app/(group)/preferences/page.tsx
"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";

type DayKey = "Monday"|"Tuesday"|"Wednesday"|"Thursday"|"Friday"|"Saturday"|"Sunday"; // not used, just here if you reuse utils

function parsePreferenceInput(raw: string): string[] {
  // Accept comma/space/newline separated values like: "C-203, A-105\nB-312"
  return raw
    .split(/[\s,]+/)
    .map((s) => s.trim().toUpperCase())
    .filter((s) => /^[ABC]-\d{3}$/.test(s)); // matches A-101 etc.
}

export default function PreferencesPage() {
  const [text, setText] = useState("");
  const [submitting, start] = useTransition();
  const [message, setMessage] = useState<{ ok?: boolean; text: string } | null>(null);

  const preview = useMemo(() => parsePreferenceInput(text), [text]);

  const submit = () => {
    start(async () => {
      setMessage(null);
      const prefs = parsePreferenceInput(text);
      if (prefs.length === 0) {
        setMessage({ ok: false, text: "Please enter at least one valid room code (e.g., A-105, B-203, C-312)." });
        return;
      }
      try {
        const res = await fetch("/api/admission/preferences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ preferences: prefs }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setMessage({ ok: false, text: data?.error || "Failed to submit preferences." });
          return;
        }
        setMessage({ ok: true, text: `Saved ${data?.count ?? prefs.length} preferences for your group.` });
      } catch {
        setMessage({ ok: false, text: "Network error." });
      }
    });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Submit Room Preferences</h1>

      <div className="alert">
        <div>
          Only <b>one member</b> of your provisional (TEMP) group should submit the list.
          Use room codes like <code>A-105</code>, <code>B-203</code>, <code>C-312</code>.
          The same weekly admission run will honor your order.
        </div>
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body space-y-3">
          <label className="label">
            <span className="label-text">Enter preferences (comma or newline separated):</span>
          </label>
          <textarea
            className="textarea textarea-bordered h-40"
            placeholder="C-203, A-105, B-312, A-121"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="text-sm opacity-70">
            Example: <code>C-203, A-105, B-312</code>
          </div>

          <div>
            <div className="font-semibold mb-1">Preview ({preview.length}):</div>
            {preview.length ? (
              <div className="flex flex-wrap gap-2">
                {preview.map((p, i) => (
                  <span key={`${p}-${i}`} className="badge badge-outline">{p}</span>
                ))}
              </div>
            ) : (
              <div className="opacity-60">Nothing to preview.</div>
            )}
          </div>

          {message && (
            <div className={`text-sm ${message.ok ? "text-success" : "text-error"}`}>
              {message.text}
            </div>
          )}

          <div className="card-actions justify-end">
            <button className="btn btn-primary" onClick={submit} disabled={submitting}>
              {submitting ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </div>
      </div>

      <div className="text-sm opacity-70">
        After the warden runs the allocation, you’ll see your assigned room on the dashboard.
      </div>
    </div>
  );
}