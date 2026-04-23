import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 5;
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // 🔥 WHERE
    const where = search
      ? {
          name: {
            contains: search,
          },
        }
      : {};

    const total = await prisma.category.count({ where });

    const categories = await prisma.category.findMany({
      where,
      skip,
      take: limit,
      include: {
        subcategories: true,
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json({
      data: categories,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Validation
    if (!body.name || !body.description) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name: body.name,
        description: body.description,
      },
    });

    return NextResponse.json(category);
  } catch (error: any) {
    // ✅ Handle duplicate error
    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "Category already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Failed to create category" },
      { status: 500 }
    );
  }
}