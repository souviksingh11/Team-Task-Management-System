import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ✅ UPDATE ITEM
export async function PUT(req: Request, context: any) {
  try {
    const params = await context.params;
    const id = Number(params.id);

    const body = await req.json();

    const existing = await prisma.item.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    const item = await prisma.item.update({
      where: { id },
      data: {
        name: body.name,
        category: body.category,
        subcategory: body.subcategory,
        price: Number(body.price),
        stock: Number(body.stock),
        createdBy: existing.createdBy,
      },
    });

    return NextResponse.json(item);
  } catch (err: any) {
    console.error("ERROR 👉", err.message);

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

// ✅ DELETE ITEM
export async function DELETE(req: Request, context: any) {
  try {
    const params = await context.params;
    const id = Number(params.id);

    await prisma.item.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Deleted" });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request, context: any) {
  try {
    const params = await context.params;
    const id = Number(params.id);

    const item = await prisma.item.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}