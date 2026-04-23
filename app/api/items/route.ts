import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

// ✅ GET ALL ITEMS (WITH FILTER)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 5;
    const search = searchParams.get("search") || "";

    const categoryId = searchParams.get("categoryId");
    const subcategoryId = searchParams.get("subcategoryId");
    const price = searchParams.get("price");

    const skip = (page - 1) * limit;

    let where: any = {};

    // ✅ SEARCH
    if (search) {
      where.name = {
        contains: search,
      };
    }

    // ✅ CATEGORY FILTER
    if (categoryId) {
      where.categoryId = Number(categoryId);
    }

    // ✅ SUBCATEGORY FILTER
    if (subcategoryId) {
      where.subcategoryId = Number(subcategoryId);
    }

    // ✅ PRICE FILTER
    if (price) {
      where.price = {
        lte: Number(price),
      };
    }

    // ✅ TOTAL COUNT (VERY IMPORTANT)
    const total = await prisma.item.count({ where });

    // ✅ PAGINATED DATA
    const items = await prisma.item.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: "desc" },
      include: {
        category: true,
        subcategory: true,
      },
    });

    return NextResponse.json({
      data: items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("🔥 ERROR:", err);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 },
    );
  }
}

// ✅ CREATE ITEM (RELATIONAL)
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    let decoded: any;

    try {
      decoded = jwt.verify(token, SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();

    // ✅ VALIDATION
    if (
      !body.name ||
      body.price === null ||
      body.stock === null ||
      !body.categoryId ||
      !body.subcategoryId
    ) {
      return NextResponse.json(
        { error: "All fields required" },
        { status: 400 },
      );
    }

    const item = await prisma.item.create({
      data: {
        name: body.name,
        price: Number(body.price),
        stock: Number(body.stock),
        categoryId: Number(body.categoryId),
        subcategoryId: Number(body.subcategoryId),
        createdBy: decoded.userId,
      },
    });

    return NextResponse.json(item);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 },
    );
  }
}
