import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Building2,
  Briefcase,
  CalendarDays,
} from "lucide-react";
import { format } from "date-fns";

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const currentYear = new Date().getFullYear();

  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      allocations: { orderBy: { year: "desc" } },
      requests: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!employee) notFound();

  const currentAlloc = employee.allocations.find((a) => a.year === currentYear);
  const used = currentAlloc?.usedDays ?? 0;
  const total = currentAlloc?.totalDays ?? 25;
  const remaining = total - used;

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/employees"
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft size={14} />
        Back to employees
      </Link>

      <div className="mb-6 rounded-xl border border-border bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {employee.name}
            </h1>
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Briefcase size={14} className="text-slate-400" />
                {employee.position}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Building2 size={14} className="text-slate-400" />
                {employee.department}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail size={14} className="text-slate-400" />
                {employee.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CalendarDays size={14} className="text-slate-400" />
                Started {format(new Date(employee.startDate), "MMMM d, yyyy")}
              </div>
            </div>
          </div>
          <Link
            href={`/employees/${employee.id}/edit`}
            className="rounded-xl bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
          >
            Edit Employee
          </Link>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Total Days
          </p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{total}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Days Used
          </p>
          <p className="mt-1 text-3xl font-bold text-primary">{used}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Remaining
          </p>
          <p
            className={`mt-1 text-3xl font-bold ${
              remaining <= 5
                ? "text-danger"
                : remaining <= 10
                  ? "text-warning"
                  : "text-success"
            }`}
          >
            {remaining}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent PTO Requests
          </h2>
        </div>
        {employee.requests.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            No PTO requests yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3">Period</th>
                  <th className="px-6 py-3">Days</th>
                  <th className="px-6 py-3">Reason</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {employee.requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3 text-sm text-slate-700">
                      {format(new Date(req.startDate), "MMM d")} –{" "}
                      {format(new Date(req.endDate), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-700">
                      {req.days}
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-500">
                      {req.reason || "—"}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          req.status === "approved"
                            ? "bg-success/10 text-success"
                            : req.status === "rejected"
                              ? "bg-danger/10 text-danger"
                              : "bg-warning/10 text-warning"
                        }`}
                      >
                        {req.status.charAt(0).toUpperCase() +
                          req.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
