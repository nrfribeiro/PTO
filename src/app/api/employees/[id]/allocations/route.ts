import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { year, totalDays } = body;

  if (!year) {
    return NextResponse.json({ error: "Year is required" }, { status: 400 });
  }

  const allocation = await prisma.pTOAllocation.upsert({
    where: { employeeId_year: { employeeId: id, year } },
    update: { totalDays: totalDays ?? 25 },
    create: {
      employeeId: id,
      year,
      totalDays: totalDays ?? 25,
      usedDays: 0,
    },
  });

  return NextResponse.json(allocation, { status: 201 });
}
