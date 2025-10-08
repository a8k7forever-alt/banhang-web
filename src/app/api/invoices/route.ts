import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
	const invoices = await prisma.invoice.findMany({
		orderBy: { createdAt: "desc" },
		include: { items: true, customer: true },
	});
	return NextResponse.json(invoices);
}

export async function POST(req: NextRequest) {
	const body = await req.json();
	const { customer, items, discountCents = 0, taxCents = 0, paid = false } = body ?? {};

	if (!Array.isArray(items) || items.length === 0) {
		return NextResponse.json({ error: "items required" }, { status: 400 });
	}

	for (const it of items) {
		// Kiểm tra sản phẩm thường (có productId) hoặc sản phẩm tạm thời (có product object)
		const hasProductId = it.productId && !it.product;
		const hasTempProduct = !it.productId && it.product && it.product.name && it.product.priceCents;
		
		if (!hasProductId && !hasTempProduct) {
			return NextResponse.json({ error: "invalid item - must have productId or product object" }, { status: 400 });
		}
		
		if (typeof it.quantity !== "number" || it.quantity <= 0) {
			return NextResponse.json({ error: "invalid quantity" }, { status: 400 });
		}
	}

	try {
		const created = await prisma.$transaction(async (tx) => {
			let customerId: string;
			if (customer?.id) {
				customerId = customer.id as string;
			} else {
				const c = await tx.customer.create({
					data: {
						name: customer?.name ?? "Khách lẻ",
						phone: customer?.phone ?? null,
						email: customer?.email ?? null,
						address: customer?.address ?? null,
						notes: customer?.notes ?? null,
					},
				});
				customerId = c.id;
			}

			// Tách sản phẩm thường và sản phẩm tạm thời
			const regularItems = items.filter((i: any) => i.productId && !i.product);
			const tempItems = items.filter((i: any) => !i.productId && i.product);
			
			// Xử lý sản phẩm thường
			const productIds = regularItems.map((i: any) => i.productId);
			const products = productIds.length > 0 ? await tx.product.findMany({ where: { id: { in: productIds } } }) : [];
			const productMap = new Map(products.map((p) => [p.id, p]));

			let subtotalCents = 0;
			const lineItemsData: Array<{ productId: string; quantity: number; unitPriceCents: number; lineTotalCents: number }> = [];

			// Xử lý sản phẩm thường
			for (const it of regularItems) {
				const p = productMap.get(it.productId);
				if (!p) throw new Error("Product not found");
				if (p.quantity < it.quantity) throw new Error(`Not enough stock for ${p.name}`);
				const unit = p.priceCents;
				const line = unit * it.quantity;
				subtotalCents += line;
				lineItemsData.push({ productId: p.id, quantity: it.quantity, unitPriceCents: unit, lineTotalCents: line });
			}

			// Xử lý sản phẩm tạm thời - tạo sản phẩm mới
			for (const it of tempItems) {
				const tempProduct = it.product;
				// Tạo sản phẩm mới cho sản phẩm tạm thời
				const newProduct = await tx.product.create({
					data: {
						name: tempProduct.name,
						priceCents: tempProduct.priceCents,
						quantity: 0, // Sản phẩm tạm thời không có tồn kho
						unit: tempProduct.unit || 'PCS',
						quantityScale: tempProduct.quantityScale || 1
					}
				});
				
				const unit = tempProduct.priceCents;
				const line = unit * it.quantity;
				subtotalCents += line;
				lineItemsData.push({ productId: newProduct.id, quantity: it.quantity, unitPriceCents: unit, lineTotalCents: line });
			}

			const totalCents = Math.max(0, subtotalCents - (discountCents ?? 0) + (taxCents ?? 0));

			// Generate daily incremental code: INV-YYYYMMDD-####
			const today = new Date();
			const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
			const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
			const countToday = await tx.invoice.count({ where: { createdAt: { gte: start, lt: end } } });
			const seq = countToday + 1;
			const yyyy = String(today.getFullYear());
			const mm = String(today.getMonth() + 1).padStart(2, "0");
			const dd = String(today.getDate()).padStart(2, "0");
			const code = `INV-${yyyy}${mm}${dd}-${String(seq).padStart(4, "0")}`;

			const invoice = await tx.invoice.create({
				data: {
					code,
					status: paid ? "PAID" : "DRAFT",
					customerId,
					subtotalCents,
					discountCents: discountCents ?? 0,
					taxCents: taxCents ?? 0,
					totalCents,
					paidAt: paid ? new Date() : null,
					items: {
						createMany: { data: lineItemsData },
					},
				},
				include: { items: true, customer: true },
			});

			// Chỉ cập nhật tồn kho cho sản phẩm thường
			for (const it of regularItems) {
				await tx.product.update({
					where: { id: it.productId },
					data: { quantity: { decrement: it.quantity } },
				});
			}

			return invoice;
		});

		return NextResponse.json(created, { status: 201 });
	} catch (e: any) {
		return NextResponse.json({ error: e?.message ?? "failed" }, { status: 400 });
	}
}
