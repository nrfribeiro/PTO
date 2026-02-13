import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { year } = body;

  if (!year) {
    return NextResponse.json({ error: "Year is required" }, { status: 400 });
  }

  const employees = await prisma.employee.findMany({
    where: { active: true },
  });

  const results = await Promise.all(
    employees.map((emp) =>
      prisma.pTOAllocation.upsert({
        where: { employeeId_year: { employeeId: emp.id, year } },
        update: {},
        create: {
          employeeId: emp.id,
          year,
          totalDays: 25,
          usedDays: 0,
        },
      })
    )
  );

  return NextResponse.json({
    message: `Renewed PTO allocations for ${results.length} employees for ${year}`,
    count: results.length,
  });
}
