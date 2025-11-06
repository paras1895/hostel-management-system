"use client";

import { useState, useTransition } from "react";
import ThemeWatcher from "@/app/components/ThemeWatcher";

export default function StudentUpdateForm({
  initialData,
}: {
  initialData: any;
}) {
  const [form, setForm] = useState({
    name: initialData.name || "",
    email: initialData.email || "",
    gender: initialData.gender || "OTHER",
    cgpa: initialData.cgpa || 0,
    preference: initialData.preference || "",
  });

  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      const res = await fetch("/api/student/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Update failed");
      alert("Profile updated successfully");
      window.location.reload();
    });
  };

  const { isDark } = ThemeWatcher();

  return (
    <div className={`${
              isDark ? "bg-gray-800" : "bg-white"
            } p-5 card bg-base-200 shadow p-6"`}>
      <h2 className="text-xl font-bold mb-4">Update Profile</h2>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          className="input input-bordered w-full"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          className="input input-bordered w-full"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <select
          className="select select-bordered w-full"
          value={form.gender}
          onChange={(e) => setForm({ ...form, gender: e.target.value })}
        >
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="OTHER">Other</option>
        </select>
        <input
          type="number"
          step="0.01"
          min="0"
          max="10"
          placeholder="CGPA"
          value={form.cgpa}
          className="input input-bordered w-full"
          onChange={(e) =>
            setForm({ ...form, cgpa: parseFloat(e.target.value) })
          }
        />
        <textarea
          placeholder="Preference (Optional)"
          value={form.preference}
          className="textarea textarea-bordered w-full"
          onChange={(e) => setForm({ ...form, preference: e.target.value })}
        />
        <button
          className="btn btn-primary mt-2"
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
