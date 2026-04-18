import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const { id, type, quantity } = await req.json();

    const item = await prisma.item.update({
      where: { id },
      data: {
        stock:
          type === "increase"
            ? { increment: quantity }
            : { decrement: quantity },
      },
    });

    return NextResponse.json(item);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Stock update failed" },
      { status: 500 }
    );
  }
}