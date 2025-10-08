import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
	const products = await prisma.product.findMany({
		orderBy: { createdAt: "desc" },
	});
	return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
	const body = await req.json();
	const { name, sku, priceCents, costCents = 0, quantity = 0, description, isActive = true, unit = "PCS", quantityScale = 1 } = body ?? {};
	if (!name || typeof priceCents !== "number") {
		return NextResponse.json({ error: "name and priceCents are required" }, { status: 400 });
	}
	const created = await prisma.product.create({
		data: { name, sku, priceCents, costCents, quantity, description, isActive, unit, quantityScale },
	});
	return NextResponse.json(created, { status: 201 });
}

export async function PUT(req: NextRequest) {
	const body = await req.json();
	const { id, ...updates } = body ?? {};
	if (!id) {
		return NextResponse.json({ error: "id is required" }, { status: 400 });
	}
	const updated = await prisma.product.update({
		where: { id },
		data: updates,
	});
	return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const id = searchParams.get("id");
	if (!id) {
		return NextResponse.json({ error: "id query param is required" }, { status: 400 });
	}
	await prisma.product.delete({ where: { id } });
	return NextResponse.json({ ok: true });
}
