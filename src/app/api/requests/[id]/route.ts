import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { status } = body;

  if (!status || !["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const request = await prisma.pTORequest.findUnique({
    where: { id },
  });

  if (!request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (request.status !== "pending") {
    return NextResponse.json(
      { error: "Only pending requests can be updated" },
      { status: 400 }
    );
  }

  const updated = await prisma.pTORequest.update({
    where: { id },
    data: { status },
    include: { employee: true },
  });

  if (status === "approved") {
    const year = new Date(request.startDate).getFullYear();
    await prisma.pTOAllocation.update({
      where: {
        employeeId_year: { employeeId: request.employeeId, year },
      },
      data: { usedDays: { increment: request.days } },
    });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const request = await prisma.pTORequest.findUnique({ where: { id } });
  if (!request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (request.status === "approved") {
    const year = new Date(request.startDate).getFullYear();
    await prisma.pTOAllocation.update({
      where: {
        employeeId_year: { employeeId: request.employeeId, year },
      },
      data: { usedDays: { decrement: request.days } },
    });
  }

  await prisma.pTORequest.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
