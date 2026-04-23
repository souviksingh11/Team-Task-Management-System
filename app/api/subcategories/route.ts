import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ✅ GET ALL SUBCATEGORIES
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 5;
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId");

    const skip = (page - 1) * limit;

    // 🔥 WHERE CONDITION
    const where: any = {};

    if (categoryId) {
      where.categoryId = Number(categoryId);
    }

    if (search) {
      where.name = {
        contains: search,
      };
    }

    const total = await prisma.subcategory.count({ where });

    const subcategories = await prisma.subcategory.findMany({
      where,
      skip,
      take: limit,
      include: {
        category: true,
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json({
      data: subcategories,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch subcategories" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const body = await req.json();

  const sub = await prisma.subcategory.create({
    data: {
      name: body.name,
      description: body.description,
      categoryId: body.categoryId,
    },
  });

  return NextResponse.json(sub);
}