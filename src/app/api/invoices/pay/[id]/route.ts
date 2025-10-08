import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	try {
		const result = await prisma.$transaction(async (tx) => {
			const inv = await tx.invoice.findUnique({ where: { id } });
			if (!inv) throw new Error("Invoice not found");
			if (inv.status !== "PAID") {
				await tx.invoice.update({ where: { id }, data: { status: "PAID", paidAt: new Date() } });
				await tx.cashFlow.create({
					data: {
						type: "INCOME",
						amountCents: inv.totalCents,
						category: "Thanh toán hóa đơn",
						note: inv.code ?? undefined,
						invoiceId: inv.id,
					},
				});
			}
			return await tx.invoice.findUnique({ where: { id }, include: { items: { include: { product: true } }, customer: true } });
		});
		return NextResponse.json(result);
	} catch (e: unknown) {
		return NextResponse.json({ error: e instanceof Error ? e.message : "failed" }, { status: 400 });
	}
}




