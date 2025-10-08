import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const materials = await prisma.material.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(materials);
  } catch (error) {
    console.error("Error fetching materials:", error);
    return NextResponse.json({ error: "Không thể tải danh sách vật liệu" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      name, 
      sku, 
      costCents = 0, 
      quantity = 0, 
      unit = "PCS", 
      quantityScale = 1,
      description, 
      category,
      supplier,
      isActive = true 
    } = body;

    if (!name) {
      return NextResponse.json({ error: "Tên vật liệu là bắt buộc" }, { status: 400 });
    }

    const created = await prisma.material.create({
      data: { 
        name, 
        sku, 
        costCents, 
        quantity, 
        unit, 
        quantityScale,
        description, 
        category,
        supplier,
        isActive 
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating material:", error);
    return NextResponse.json({ error: "Không thể tạo vật liệu" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ error: "ID là bắt buộc" }, { status: 400 });
    }

    const updated = await prisma.material.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating material:", error);
    return NextResponse.json({ error: "Không thể cập nhật vật liệu" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ error: "ID là bắt buộc" }, { status: 400 });
    }

    await prisma.material.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting material:", error);
    return NextResponse.json({ error: "Không thể xóa vật liệu" }, { status: 500 });
  }
}

