"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewEmployeePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name"),
      email: form.get("email"),
      department: form.get("department"),
      position: form.get("position"),
      startDate: form.get("startDate"),
      totalDays: Number(form.get("totalDays")),
    };

    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to create employee");
        return;
      }

      router.push("/employees");
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <Link
          href="/employees"
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft size={14} />
          Back to employees
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Add Employee</h1>
        <p className="mt-1 text-sm text-slate-500">
          Add a new team member and set their PTO allocation
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-border bg-white p-6 shadow-sm"
      >
        {error && (
          <div className="mb-6 rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Full Name *
            </label>
            <input
              name="name"
              type="text"
              required
              className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Email *
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="john@company.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Department *
            </label>
            <input
              name="department"
              type="text"
              required
              className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Engineering"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Position *
            </label>
            <input
              name="position"
              type="text"
              required
              className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Software Engineer"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Start Date *
            </label>
            <input
              name="startDate"
              type="date"
              required
              className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              PTO Days ({new Date().getFullYear()})
            </label>
            <input
              name="totalDays"
              type="number"
              defaultValue={25}
              min={0}
              max={365}
              className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="mt-1 text-xs text-slate-400">
              Default: 25 days (22 legal + 3 extra)
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-6">
          <Link
            href="/employees"
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-sm shadow-primary/25 transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? "Creating..." : "Add Employee"}
          </button>
        </div>
      </form>
    </div>
  );
}
