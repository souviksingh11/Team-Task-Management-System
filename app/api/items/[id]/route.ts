import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ✅ UPDATE ITEM
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ FIX
    const itemId = Number(id);

    const body = await req.json();

    const existing = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.item.update({
      where: { id: itemId },
      data: {
        name: body.name,
        price: Number(body.price),
        stock: Number(body.stock),
        categoryId: Number(body.categoryId),
        subcategoryId: Number(body.subcategoryId),
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

// ✅ DELETE ITEM
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ FIX
    const itemId = Number(id);

    await prisma.item.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ message: "Deleted" });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

// ✅ GET SINGLE ITEM
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ FIX
    const itemId = Number(id);

    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        category: true,
        subcategory: true,
      },
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