import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            material: true
          }
        }
      }
    });

    if (!purchase) {
      return NextResponse.json({ error: "Không tìm thấy phiếu nhập hàng" }, { status: 404 });
    }

    return NextResponse.json(purchase);
  } catch (error) {
    console.error("Error fetching purchase:", error);
    return NextResponse.json({ error: "Không thể tải thông tin phiếu nhập hàng" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { ...updates } = body;

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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Sử dụng transaction để đảm bảo tính nhất quán
    await prisma.$transaction(async (tx) => {
      // Lấy thông tin purchase để hoàn tác tồn kho
      const purchase = await tx.purchase.findUnique({
        where: { id },
        include: {
          items: true
        }
      });

      if (!purchase) {
        throw new Error("Không tìm thấy phiếu nhập hàng");
      }

      // Hoàn tác tồn kho
      for (const item of purchase.items) {
        await tx.material.update({
          where: { id: item.materialId },
          data: {
            quantity: {
              decrement: item.quantity
            }
          }
        });
      }

      // Xóa cash flow entry liên quan
      await tx.cashFlow.deleteMany({
        where: {
          category: "Nhập hàng",
          note: {
            contains: purchase.code || purchase.id
          }
        }
      });

      // Xóa purchase items trước
      await tx.purchaseItem.deleteMany({
        where: { purchaseId: id }
      });

      // Xóa purchase
      await tx.purchase.delete({ where: { id } });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting purchase:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Không thể xóa phiếu nhập hàng" 
    }, { status: 500 });
  }
}
