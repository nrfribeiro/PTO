import { prisma } from "@/lib/prisma";
import {
  Users,
  CalendarDays,
  CalendarCheck,
  CalendarClock,
} from "lucide-react";
import Link from "next/link";

async function getStats() {
  const currentYear = new Date().getFullYear();

  const [employeeCount, allocations, pendingRequests, approvedRequests] =
    await Promise.all([
      prisma.employee.count({ where: { active: true } }),
      prisma.pTOAllocation.findMany({
        where: { year: currentYear },
        include: { employee: true },
      }),
      prisma.pTORequest.count({ where: { status: "pending" } }),
      prisma.pTORequest.count({
        where: {
          status: "approved",
          startDate: { gte: new Date(currentYear, 0, 1) },
        },
      }),
    ]);

  const totalDaysUsed = allocations.reduce((sum, a) => sum + a.usedDays, 0);
  const totalDaysAvailable = allocations.reduce(
    (sum, a) => sum + a.totalDays,
    0
  );

  return {
    employeeCount,
    totalDaysUsed,
    totalDaysAvailable,
    pendingRequests,
    approvedRequests,
    allocations,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const statCards = [
    {
      label: "Active Employees",
      value: stats.employeeCount,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Days Used (This Year)",
      value: stats.totalDaysUsed,
      icon: CalendarCheck,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Pending Requests",
      value: stats.pendingRequests,
      icon: CalendarClock,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      label: "Approved Requests",
      value: stats.approvedRequests,
      icon: CalendarDays,
      color: "text-accent",
      bg: "bg-accent/10",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of your team&apos;s PTO for {new Date().getFullYear()}
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl border border-border bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}
                >
                  <Icon size={20} className={card.color} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {card.value}
                  </p>
                  <p className="text-xs text-slate-500">{card.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Employee PTO Balances — {new Date().getFullYear()}
          </h2>
          <Link
            href="/employees"
            className="text-sm font-medium text-primary hover:text-primary-dark"
          >
            View all employees →
          </Link>
        </div>
        {stats.allocations.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Users size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm text-slate-500">
              No employees found. Add employees to get started.
            </p>
            <Link
              href="/employees/new"
              className="mt-3 inline-block text-sm font-medium text-primary hover:text-primary-dark"
            >
              + Add your first employee
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3">Employee</th>
                  <th className="px-6 py-3">Total Days</th>
                  <th className="px-6 py-3">Used</th>
                  <th className="px-6 py-3">Remaining</th>
                  <th className="px-6 py-3">Usage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.allocations.map((alloc) => {
                  const remaining = alloc.totalDays - alloc.usedDays;
                  const percentage =
                    alloc.totalDays > 0
                      ? Math.round((alloc.usedDays / alloc.totalDays) * 100)
                      : 0;
                  return (
                    <tr key={alloc.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {alloc.employee.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {alloc.employee.department}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {alloc.totalDays}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {alloc.usedDays}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-sm font-semibold ${
                            remaining <= 5
                              ? "text-danger"
                              : remaining <= 10
                                ? "text-warning"
                                : "text-success"
                          }`}
                        >
                          {remaining}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full transition-all ${
                                percentage > 80
                                  ? "bg-danger"
                                  : percentage > 60
                                    ? "bg-warning"
                                    : "bg-success"
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500">
                            {percentage}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
