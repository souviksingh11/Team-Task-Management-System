import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ✅ UPDATE
export async function PUT(req: Request, context: any) {
  try {
    const { id } = await context.params; // ✅ FIX HERE
    const body = await req.json();

    const updated = await prisma.category.update({
      where: { id: Number(id) },
      data: {
        name: body.name,
        description: body.description,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { message: "Update failed" },
      { status: 500 }
    );
  }
}

// ✅ DELETE
export async function DELETE(req: Request, context: any) {
  try {
    const { id } = await context.params; // ✅ FIX HERE

    await prisma.category.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Delete failed" },
      { status: 500 }
    );
  }
}