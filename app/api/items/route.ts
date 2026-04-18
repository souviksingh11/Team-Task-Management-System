import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

// ✅ GET ALL ITEMS
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category")?.trim();
    const price = searchParams.get("price");

    let where: any = {};

    // ✅ SAFE CATEGORY FILTER
    if (category) {
      where.category = {
        contains: category,
      };
    }

    // ✅ SAFE PRICE FILTER
    if (price) {
      where.price = {
        lte: Number(price),
      };
    }

    const items = await prisma.item.findMany({
      where,
      orderBy: { id: "desc" },
    });

    return NextResponse.json(items);
  } catch (err) {
    console.error("🔥 ERROR:", err); // 👈 VERY IMPORTANT
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

// ✅ CREATE ITEM
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    let decoded: any;

    try {
      decoded = jwt.verify(token, SECRET);
    } catch {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const item = await prisma.item.create({
      data: {
        ...body,
        createdBy: decoded.userId,
      },
    });

    return NextResponse.json(item);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}