import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      allocations: { orderBy: { year: "desc" } },
      requests: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  return NextResponse.json(employee);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { name, email, department, position, startDate, active } = body;

  const employee = await prisma.employee.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(email && { email }),
      ...(department && { department }),
      ...(position && { position }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(active !== undefined && { active }),
    },
    include: { allocations: true },
  });

  return NextResponse.json(employee);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await prisma.employee.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
