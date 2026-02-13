import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const employees = await prisma.employee.findMany({
    include: {
      allocations: { orderBy: { year: "desc" } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(employees);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, email, department, position, startDate, totalDays } = body;

  if (!name || !email || !department || !position || !startDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const currentYear = new Date().getFullYear();
  const days = totalDays ?? 25;

  const employee = await prisma.employee.create({
    data: {
      name,
      email,
      department,
      position,
      startDate: new Date(startDate),
      allocations: {
        create: {
          year: currentYear,
          totalDays: days,
          usedDays: 0,
        },
      },
    },
    include: { allocations: true },
  });

  return NextResponse.json(employee, { status: 201 });
}
