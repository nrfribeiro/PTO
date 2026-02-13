import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requests = await prisma.pTORequest.findMany({
    include: { employee: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(requests);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { employeeId, startDate, endDate, days, reason } = body;

  if (!employeeId || !startDate || !endDate || !days) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const year = new Date(startDate).getFullYear();
  const allocation = await prisma.pTOAllocation.findUnique({
    where: { employeeId_year: { employeeId, year } },
  });

  if (!allocation) {
    return NextResponse.json(
      { error: "No PTO allocation found for this year. Please set up the allocation first." },
      { status: 400 }
    );
  }

  const remaining = allocation.totalDays - allocation.usedDays;
  if (days > remaining) {
    return NextResponse.json(
      { error: `Not enough PTO days. Only ${remaining} days remaining.` },
      { status: 400 }
    );
  }

  const request = await prisma.pTORequest.create({
    data: {
      employeeId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      days,
      reason,
      status: "pending",
    },
    include: { employee: true },
  });

  return NextResponse.json(request, { status: 201 });
}
