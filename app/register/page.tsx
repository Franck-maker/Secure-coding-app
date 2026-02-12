// app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "", username: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess("Account created! Redirecting to login...");
        setTimeout(() => router.push("/login"), 1500);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Server error.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-950">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border-t-4 border-rose-500">
        
        <div className="text-center mb-8">
          {/* FIX: p tag is OUTSIDE h1 tag to prevent hydration error */}
          <h1 className="text-3xl font-bold text-blue-900">
            Secure<span className="text-rose-500">Bank</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2">Create your secure account</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-blue-900 mb-1">Username</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-rose-500 outline-none text-blue-900"
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              value={formData.username}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-blue-900 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-rose-500 outline-none text-blue-900"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              value={formData.email}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-blue-900 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-rose-500 outline-none text-blue-900"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              value={formData.password}
            />
          </div>

          {error && <div className="bg-rose-50 text-rose-600 text-sm p-3 rounded-lg border border-rose-100">⚠️ {error}</div>}
          {success && <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg border border-green-100">✅ {success}</div>}

          {/* FIX: w-full ensures the button does not shrink */}
          <button type="submit" className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl shadow-lg transition">
            Create Account
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Already have an account? <Link href="/login" className="text-rose-500 font-bold hover:underline">Login</Link>
        </div>
      </div>
    </div>
  );
}