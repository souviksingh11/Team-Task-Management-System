import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { customerName, items } = await req.json();

    // 🔥 1. FETCH REAL STOCK FROM DB
    const dbItems = await prisma.item.findMany({
      where: {
        id: { in: items.map((i: any) => i.id) },
      },
    });

    // 🔥 2. VALIDATE STOCK
    for (const item of items) {
      const dbItem = dbItems.find((i) => i.id === item.id);

      if (!dbItem) {
        return NextResponse.json(
          { error: `Item not found` },
          { status: 400 }
        );
      }

      if (item.quantity > dbItem.stock) {
        return NextResponse.json(
          {
            error: `${dbItem.name} has only ${dbItem.stock} in stock`,
          },
          { status: 400 }
        );
      }
    }

    // ✅ calculate total
    let total = 0;
    for (const item of items) {
      total += item.price * item.quantity;
    }

    // ✅ TRANSACTION
    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ create order
      const order = await tx.order.create({
        data: {
          customerName,
          totalAmount: total,
        },
      });

      // 2️⃣ create order items
      await tx.orderItem.createMany({
        data: items.map((item: any) => ({
          orderId: order.id,
          itemId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      // 3️⃣ update stock (SAFE NOW)
      for (const item of items) {
        await tx.item.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return order;
    });

    return NextResponse.json({
      message: "Order placed successfully ✅",
      order: result,
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Order failed ❌" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 5;

    const skip = (page - 1) * limit;

    // 🔥 total count
    const total = await prisma.order.count();

    // 🔥 paginated data
    const orders = await prisma.order.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
