import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const { id, type, quantity } = await req.json();

    // 🔍 Get current item
    const item = await prisma.item.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    let newStock =
      type === "increase"
        ? item.stock + quantity
        : item.stock - quantity;

    // ❌ BLOCK NEGATIVE STOCK
    if (newStock < 0) {
      return NextResponse.json(
        { error: "Stock cannot be negative" },
        { status: 400 }
      );
    }

    // ✅ UPDATE SAFE
    const updated = await prisma.item.update({
      where: { id },
      data: { stock: newStock },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Stock update failed" },
      { status: 500 }
    );
  }
}