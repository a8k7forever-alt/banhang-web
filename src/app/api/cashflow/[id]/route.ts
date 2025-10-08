import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const entry = await prisma.cashFlow.findUnique({
      where: { id },
      include: { invoice: true }
    });

    if (!entry) {
      return NextResponse.json({ error: "Không tìm thấy giao dịch" }, { status: 404 });
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Error fetching cashflow entry:", error);
    return NextResponse.json({ error: "Không thể tải thông tin giao dịch" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { type, amountCents, category, note, occurredAt } = body;

    if (!type || typeof amountCents !== "number" || !category) {
      return NextResponse.json({ error: "type, amountCents, category required" }, { status: 400 });
    }

    const updated = await prisma.cashFlow.update({
      where: { id },
      data: {
        type,
        amountCents,
        category,
        note: note ?? null,
        occurredAt: occurredAt ? new Date(occurredAt) : undefined,
      },
      include: { invoice: true }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating cashflow entry:", error);
    return NextResponse.json({ error: "Không thể cập nhật giao dịch" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const entry = await prisma.cashFlow.findUnique({
      where: { id }
    });

    if (!entry) {
      return NextResponse.json({ error: "Không tìm thấy giao dịch" }, { status: 404 });
    }

    // Không cho phép xóa giao dịch liên quan đến hóa đơn
    if (entry.invoiceId) {
      return NextResponse.json({ 
        error: "Không thể xóa giao dịch liên quan đến hóa đơn. Vui lòng xóa hóa đơn trước." 
      }, { status: 400 });
    }

    await prisma.cashFlow.delete({
      where: { id }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting cashflow entry:", error);
    return NextResponse.json({ error: "Không thể xóa giao dịch" }, { status: 500 });
  }
}

