import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import Link from "next/link";
import { Plus, CalendarDays } from "lucide-react";
import RequestActions from "./RequestActions";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const requests = await prisma.pTORequest.findMany({
    include: { employee: true },
    orderBy: { createdAt: "desc" },
  });

  const pending = requests.filter((r) => r.status === "pending");
  const resolved = requests.filter((r) => r.status !== "pending");

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">PTO Requests</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review and manage employee time-off requests
          </p>
        </div>
        <Link
          href="/requests/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-primary/25 transition-colors hover:bg-primary-dark"
        >
          <Plus size={16} />
          New Request
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-xl border border-border bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <CalendarDays size={24} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            No requests yet
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Create a PTO request for an employee.
          </p>
          <Link
            href="/requests/new"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-primary/25 transition-colors hover:bg-primary-dark"
          >
            <Plus size={16} />
            New Request
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div className="rounded-xl border border-border bg-white shadow-sm">
              <div className="border-b border-border px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  Pending Requests
                  <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-warning/15 px-1.5 text-xs font-bold text-warning">
                    {pending.length}
                  </span>
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      <th className="px-6 py-3">Employee</th>
                      <th className="px-6 py-3">Period</th>
                      <th className="px-6 py-3">Days</th>
                      <th className="px-6 py-3">Reason</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {pending.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-slate-900">
                            {req.employee.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {req.employee.department}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {format(new Date(req.startDate), "MMM d")} –{" "}
                          {format(new Date(req.endDate), "MMM d, yyyy")}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {req.days}
                        </td>
                        <td className="max-w-xs truncate px-6 py-4 text-sm text-slate-500">
                          {req.reason || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <RequestActions id={req.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {resolved.length > 0 && (
            <div className="rounded-xl border border-border bg-white shadow-sm">
              <div className="border-b border-border px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  Resolved Requests
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      <th className="px-6 py-3">Employee</th>
                      <th className="px-6 py-3">Period</th>
                      <th className="px-6 py-3">Days</th>
                      <th className="px-6 py-3">Reason</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {resolved.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-slate-900">
                            {req.employee.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {req.employee.department}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {format(new Date(req.startDate), "MMM d")} –{" "}
                          {format(new Date(req.endDate), "MMM d, yyyy")}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {req.days}
                        </td>
                        <td className="max-w-xs truncate px-6 py-4 text-sm text-slate-500">
                          {req.reason || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              req.status === "approved"
                                ? "bg-success/10 text-success"
                                : "bg-danger/10 text-danger"
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
