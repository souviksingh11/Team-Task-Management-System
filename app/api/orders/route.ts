import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { customerName, items } = await req.json();

    // ✅ calculate total
    let total = 0;
    for (const item of items) {
      total += item.price * item.quantity;
    }

    // ✅ TRANSACTION (important)
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

      // 3️⃣ update stock
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

