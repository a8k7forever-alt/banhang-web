import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { items: { include: { product: true } }, customer: true },
    });
    if (!invoice) return NextResponse.json({ error: "Không tìm thấy hóa đơn" }, { status: 404 });
    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json({ error: "Không thể tải thông tin hóa đơn" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { customerId, status, items } = body;

    if (!customerId || !status || !items || items.length === 0) {
      return NextResponse.json({ error: "Thông tin hóa đơn không đầy đủ" }, { status: 400 });
    }

    // Sử dụng transaction để đảm bảo tính nhất quán
    const updatedInvoice = await prisma.$transaction(async (tx) => {
      // Lấy hóa đơn hiện tại để hoàn tác tồn kho
      const currentInvoice = await tx.invoice.findUnique({
        where: { id },
        include: { items: true }
      });

      if (!currentInvoice) {
        throw new Error("Không tìm thấy hóa đơn");
      }

      // Hoàn tác tồn kho sản phẩm cũ
      for (const item of currentInvoice.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: {
              increment: item.quantity
            }
          }
        });
      }

      // Xóa các invoice items cũ
      await tx.invoiceItem.deleteMany({
        where: { invoiceId: id }
      });

      // Tính tổng tiền mới
      const totalCents = items.reduce((sum: number, item: { quantity: number; unitPriceCents?: number; priceCents?: number }) => 
        sum + (item.quantity * (item.unitPriceCents || item.priceCents || 0)), 0
      );

      // Cập nhật hóa đơn
      const updatedInvoice = await tx.invoice.update({
        where: { id },
        data: {
          customerId,
          status,
          totalCents
        }
      });

      // Tạo invoice items mới
      for (const item of items) {
        await tx.invoiceItem.create({
          data: {
            invoiceId: id,
            productId: item.productId,
            quantity: item.quantity,
            unitPriceCents: item.unitPriceCents || item.priceCents,
            lineTotalCents: item.quantity * (item.unitPriceCents || item.priceCents)
          }
        });

        // Cập nhật tồn kho sản phẩm mới
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: {
              decrement: item.quantity
            }
          }
        });
      }

      // Cập nhật cash flow entry
      await tx.cashFlow.updateMany({
        where: { invoiceId: id },
        data: {
          amountCents: totalCents,
          note: `Hóa đơn ${updatedInvoice.code || updatedInvoice.id.slice(-8)} - ${status === 'PAID' ? 'Đã thanh toán' : 'Chờ thanh toán'}`
        }
      });

      return updatedInvoice;
    });

    // Lấy hóa đơn đã cập nhật với đầy đủ thông tin
    const invoiceWithDetails = await prisma.invoice.findUnique({
      where: { id },
      include: { items: { include: { product: true } }, customer: true }
    });

    return NextResponse.json(invoiceWithDetails);
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Không thể cập nhật hóa đơn" 
    }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Sử dụng transaction để đảm bảo tính nhất quán
    await prisma.$transaction(async (tx) => {
      // Lấy thông tin hóa đơn để hoàn tác tồn kho
      const invoice = await tx.invoice.findUnique({
        where: { id },
        include: { items: true }
      });

      if (!invoice) {
        throw new Error("Không tìm thấy hóa đơn");
      }

      // Hoàn tác tồn kho sản phẩm
      for (const item of invoice.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: {
              increment: item.quantity
            }
          }
        });
      }

      // Xóa cash flow entry liên quan
      await tx.cashFlow.deleteMany({
        where: {
          invoiceId: id
        }
      });

      // Xóa invoice items trước
      await tx.invoiceItem.deleteMany({
        where: { invoiceId: id }
      });

      // Xóa invoice
      await tx.invoice.delete({ where: { id } });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Không thể xóa hóa đơn" 
    }, { status: 500 });
  }
}
