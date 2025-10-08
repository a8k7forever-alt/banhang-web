import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const purchases = await prisma.purchase.findMany({
      include: {
        items: {
          include: {
            material: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(purchases);
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json({ error: "Không thể tải danh sách nhập hàng" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      code, 
      supplier, 
      items, 
      subtotalCents, 
      discountCents = 0, 
      taxCents = 0, 
      totalCents, 
      notes 
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Danh sách sản phẩm không được để trống" }, { status: 400 });
    }

    // Tạo purchase order
    const purchase = await prisma.purchase.create({
      data: {
        code,
        supplier,
        status: "COMPLETED",
        subtotalCents,
        discountCents,
        taxCents,
        totalCents,
        notes,
        items: {
          create: items.map((item: any) => ({
            materialId: item.materialId,
            quantity: item.quantity,
            unitCostCents: item.unitCostCents,
            lineTotalCents: item.lineTotalCents
          }))
        }
      },
      include: {
        items: {
          include: {
            material: true
          }
        }
      }
    });

    // Cập nhật tồn kho cho từng vật liệu
    for (const item of items) {
      await prisma.material.update({
        where: { id: item.materialId },
        data: {
          quantity: {
            increment: item.quantity
          },
          costCents: item.unitCostCents // Cập nhật giá nhập mới nhất
        }
      });
    }

    // Tạo cash flow entry cho chi phí nhập hàng
    await prisma.cashFlow.create({
      data: {
        type: "EXPENSE",
        amountCents: totalCents,
        category: "Nhập hàng",
        note: `Nhập hàng từ ${supplier || 'Nhà cung cấp'} - Mã: ${code || purchase.id}`,
        occurredAt: new Date()
      }
    });

    return NextResponse.json(purchase, { status: 201 });
  } catch (error) {
    console.error("Error creating purchase:", error);
    return NextResponse.json({ error: "Không thể tạo phiếu nhập hàng" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ error: "ID là bắt buộc" }, { status: 400 });
    }

    const updated = await prisma.purchase.update({
      where: { id },
      data: updates,
      include: {
        items: {
          include: {
            material: true
          }
        }
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating purchase:", error);
    return NextResponse.json({ error: "Không thể cập nhật phiếu nhập hàng" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ error: "ID là bắt buộc" }, { status: 400 });
    }

    // Lấy thông tin purchase để hoàn tác tồn kho
    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        items: true
      }
    });

    if (!purchase) {
      return NextResponse.json({ error: "Không tìm thấy phiếu nhập hàng" }, { status: 404 });
    }

    // Hoàn tác tồn kho
    for (const item of purchase.items) {
      await prisma.material.update({
        where: { id: item.materialId },
        data: {
          quantity: {
            decrement: item.quantity
          }
        }
      });
    }

    // Xóa cash flow entry liên quan
    await prisma.cashFlow.deleteMany({
      where: {
        category: "Nhập hàng",
        note: {
          contains: purchase.code || purchase.id
        }
      }
    });

    // Xóa purchase
    await prisma.purchase.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting purchase:", error);
    return NextResponse.json({ error: "Không thể xóa phiếu nhập hàng" }, { status: 500 });
  }
}
