"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Employee {
  id: string;
  name: string;
  department: string;
  allocations: { year: number; totalDays: number; usedDays: number }[];
}

export default function NewRequestPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [days, setDays] = useState<number>(1);

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetch("/api/employees")
      .then((r) => r.json())
      .then(setEmployees);
  }, []);

  const selected = employees.find((e) => e.id === selectedEmployee);
  const currentAlloc = selected?.allocations?.find(
    (a) => a.year === currentYear
  );
  const remaining = currentAlloc
    ? currentAlloc.totalDays - currentAlloc.usedDays
    : null;

  function calculateBusinessDays(start: string, end: string): number {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    let count = 0;
    const current = new Date(s);
    while (current <= e) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  }

  useEffect(() => {
    if (startDate && endDate) {
      setDays(calculateBusinessDays(startDate, endDate));
    }
  }, [startDate, endDate]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const data = {
      employeeId: form.get("employeeId"),
      startDate: form.get("startDate"),
      endDate: form.get("endDate"),
      days,
      reason: form.get("reason"),
    };

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to create request");
        return;
      }

      router.push("/requests");
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
          href="/requests"
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft size={14} />
          Back to requests
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">New PTO Request</h1>
        <p className="mt-1 text-sm text-slate-500">
          Submit a time-off request for an employee
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

        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Employee *
            </label>
            <select
              name="employeeId"
              required
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select an employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} — {emp.department}
                </option>
              ))}
            </select>
            {remaining !== null && (
              <p className="mt-1.5 text-xs text-slate-500">
                Available balance:{" "}
                <span
                  className={`font-semibold ${
                    remaining <= 5
                      ? "text-danger"
                      : remaining <= 10
                        ? "text-warning"
                        : "text-success"
                  }`}
                >
                  {remaining} days
                </span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Start Date *
              </label>
              <input
                name="startDate"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                End Date *
              </label>
              <input
                name="endDate"
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {days > 0 && (
            <div className="rounded-lg bg-primary/5 px-4 py-3">
              <p className="text-sm text-slate-700">
                Business days:{" "}
                <span className="font-bold text-primary">{days}</span>
              </p>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Reason
            </label>
            <textarea
              name="reason"
              rows={3}
              className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Vacation, personal leave, etc."
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-6">
          <Link
            href="/requests"
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || days === 0}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-sm shadow-primary/25 transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </div>
  );
}
