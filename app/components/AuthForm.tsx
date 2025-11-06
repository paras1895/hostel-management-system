"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ThemeWatcher from "@/components/ThemeWatcher";

interface AuthFormProps {
  type: "login" | "signup";
}

type YearEnum = "FY" | "SY" | "TY" | "BE";
type GenderEnum = "MALE" | "FEMALE" | "OTHER";

interface FormData {
  name: string;
  mis: number | ""; // we'll convert on submit
  year: YearEnum | "";
  gender: GenderEnum | "";
  cgpa: number | ""; // we'll convert on submit
  email: string;
  password: string;
}

const YEAR_OPTIONS: { value: YearEnum; label: string }[] = [
  { value: "FY", label: "F.Y." },
  { value: "SY", label: "S.Y." },
  { value: "TY", label: "T.Y." },
  { value: "BE", label: "B.Tech" },
];

const GENDER_OPTIONS: { value: GenderEnum; label: string }[] = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

export default function AuthForm({ type }: AuthFormProps) {
  const { isDark } = ThemeWatcher();
  const router = useRouter();

  const [form, setForm] = useState<FormData>({
    name: "",
    mis: "",
    year: "",
    gender: "",
    cgpa: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // basic client-side validation for signup
      if (type === "signup") {
        if (form.mis === "" || isNaN(Number(form.mis))) {
          setError("Please enter a valid MIS number");
          setLoading(false);
          return;
        }
        if (form.cgpa === "" || isNaN(Number(form.cgpa))) {
          setError("Please enter a valid CGPA");
          setLoading(false);
          return;
        }
        if (!form.year) {
          setError("Please select your year");
          setLoading(false);
          return;
        }
        if (!form.gender) {
          setError("Please select your gender");
          setLoading(false);
          return;
        }
      }

      const payload = {
        ...form,
        mis: form.mis === "" ? null : Number(form.mis),
        cgpa: form.cgpa === "" ? null : Number(form.cgpa),
      };

      const res = await fetch(`/api/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Something went wrong");
        return;
      }

      if (type === "signup") {
        router.push("/login?message=Account created successfully!");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`${
        isDark ? "bg-gray-800" : "bg-white"
      } w-full max-w-sm shadow-lg p-6 space-y-4`}
    >
      <h2 className="text-2xl font-bold text-center">
        {type === "login" ? "Login" : "Create Account"}
      </h2>

      {type === "signup" && (
        <>
          {/* Name */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Full Name</span>
            </label>
            <input
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input input-bordered"
              required
            />
          </div>

          {/* MIS */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">MIS</span>
            </label>
            <input
              type="number"
              placeholder="MIS"
              value={form.mis}
              onChange={(e) =>
                setForm({
                  ...form,
                  mis:
                    e.target.value === "" ? "" : parseInt(e.target.value, 10),
                })
              }
              className="input input-bordered no-spinner"
              required
            />
          </div>

          {/* Year (send enum values, show pretty labels) */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Year</span>
            </label>
            <select
              value={form.year}
              onChange={(e) =>
                setForm({ ...form, year: e.target.value as YearEnum })
              }
              className="select select-bordered"
              required
            >
              <option disabled value="">
                Select your year
              </option>
              {YEAR_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Gender */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Gender</span>
            </label>
            <select
              value={form.gender}
              onChange={(e) =>
                setForm({ ...form, gender: e.target.value as GenderEnum })
              }
              className="select select-bordered"
              required
            >
              <option disabled value="">
                Select your gender
              </option>
              {GENDER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* CGPA */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">CGPA</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="10"
              placeholder="Enter CGPA (0 - 10)"
              value={form.cgpa === "" ? "" : form.cgpa}
              onChange={(e) => {
                const value = e.target.value;
                // Allow empty value or up to 2 decimal places
                if (value === "" || /^\d{0,2}(\.\d{0,2})?$/.test(value)) {
                  setForm({ ...form, cgpa: value === "" ? "" : Number(value) });
                }
              }}
              className="input input-bordered no-spinner"
              required
            />
          </div>
        </>
      )}

      {/* Email */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Email</span>
        </label>
        <input
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="input input-bordered"
          required
        />
      </div>

      {/* Password */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Password</span>
        </label>
        <input
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="input input-bordered"
          required
        />
      </div>

      {error && <p className="text-error text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary w-full mt-4"
      >
        {loading ? "Please wait..." : type === "login" ? "Login" : "Sign Up"}
      </button>

      <p className="text-sm text-center mt-3">
        {type === "login" ? (
          <>
            Don't have an account?{" "}
            <a href={"/signup"} className="link link-primary">
              Sign Up
            </a>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <a href={"/login"} className="link link-primary">
              Login
            </a>
          </>
        )}
      </p>
    </form>
  );
}
