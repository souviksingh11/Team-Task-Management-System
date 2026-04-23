import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// UPDATE
export async function PUT(req: Request, context: any) {
  const { id } = await context.params;
  const body = await req.json();

  const updated = await prisma.customer.update({
    where: { id: Number(id) },
    data: body,
  });

  return NextResponse.json(updated);
}

// DELETE
export async function DELETE(req: Request, context: any) {
  const { id } = await context.params;

  await prisma.customer.delete({
    where: { id: Number(id) },
  });

  return NextResponse.json({ message: "Deleted" });
}