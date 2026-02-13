import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Mail, Building2 } from "lucide-react";
import DeleteEmployeeButton from "./DeleteEmployeeButton";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  const currentYear = new Date().getFullYear();

  const employees = await prisma.employee.findMany({
    include: {
      allocations: {
        where: { year: currentYear },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your team members and their PTO allocations
          </p>
        </div>
        <Link
          href="/employees/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-primary/25 transition-colors hover:bg-primary-dark"
        >
          <Plus size={16} />
          Add Employee
        </Link>
      </div>

      {employees.length === 0 ? (
        <div className="rounded-xl border border-border bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <Building2 size={24} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            No employees yet
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Get started by adding your first team member.
          </p>
          <Link
            href="/employees/new"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-primary/25 transition-colors hover:bg-primary-dark"
          >
            <Plus size={16} />
            Add Employee
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {employees.map((employee) => {
            const allocation = employee.allocations[0];
            const used = allocation?.usedDays ?? 0;
            const total = allocation?.totalDays ?? 25;
            const remaining = total - used;
            const percentage = total > 0 ? Math.round((used / total) * 100) : 0;

            return (
              <div
                key={employee.id}
                className="group rounded-xl border border-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <Link
                      href={`/employees/${employee.id}`}
                      className="text-base font-semibold text-slate-900 hover:text-primary"
                    >
                      {employee.name}
                    </Link>
                    <p className="text-sm text-slate-500">
                      {employee.position}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      employee.active
                        ? "bg-success/10 text-success"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {employee.active ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
                  <Building2 size={12} />
                  {employee.department}
                </div>
                <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
                  <Mail size={12} />
                  {employee.email}
                </div>

                {allocation && (
                  <div className="rounded-lg bg-surface-alt p-3">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        PTO {currentYear}
                      </span>
                      <span className="font-medium text-slate-700">
                        {used}/{total} days used
                      </span>
                    </div>
                    <div className="mb-1 h-2 overflow-hidden rounded-full bg-slate-200">
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
                    <p className="text-xs text-slate-500">
                      <span
                        className={`font-semibold ${
                          remaining <= 5
                            ? "text-danger"
                            : remaining <= 10
                              ? "text-warning"
                              : "text-success"
                        }`}
                      >
                        {remaining}
                      </span>{" "}
                      days remaining
                    </p>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
                  <Link
                    href={`/employees/${employee.id}`}
                    className="flex-1 rounded-lg bg-slate-100 px-3 py-1.5 text-center text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/employees/${employee.id}/edit`}
                    className="flex-1 rounded-lg bg-primary/10 px-3 py-1.5 text-center text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                  >
                    Edit
                  </Link>
                  <DeleteEmployeeButton id={employee.id} name={employee.name} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
