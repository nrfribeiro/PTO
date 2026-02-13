"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  startDate: string;
  active: boolean;
  allocations: { year: number; totalDays: number; usedDays: number }[];
}

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetch(`/api/employees/${params.id}`)
      .then((r) => r.json())
      .then(setEmployee);
  }, [params.id]);

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
      active: form.get("active") === "true",
    };

    try {
      const res = await fetch(`/api/employees/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to update employee");
        return;
      }

      const totalDays = Number(form.get("totalDays"));
      if (totalDays) {
        await fetch(`/api/employees/${params.id}/allocations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ year: currentYear, totalDays }),
        });
      }

      router.push(`/employees/${params.id}`);
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const currentAlloc = employee.allocations?.find(
    (a) => a.year === currentYear
  );

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <Link
          href={`/employees/${params.id}`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft size={14} />
          Back to employee
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Edit Employee</h1>
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
              defaultValue={employee.name}
              className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
              defaultValue={employee.email}
              className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
              defaultValue={employee.department}
              className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
              defaultValue={employee.position}
              className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
              defaultValue={
                new Date(employee.startDate).toISOString().split("T")[0]
              }
              className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              PTO Days ({currentYear})
            </label>
            <input
              name="totalDays"
              type="number"
              defaultValue={currentAlloc?.totalDays ?? 25}
              min={0}
              max={365}
              className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              name="active"
              defaultValue={employee.active ? "true" : "false"}
              className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-6">
          <Link
            href={`/employees/${params.id}`}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-sm shadow-primary/25 transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
