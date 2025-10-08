import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
	const customers = await prisma.customer.findMany({ orderBy: { createdAt: "desc" } });
	return NextResponse.json(customers);
}

export async function POST(req: NextRequest) {
	const body = await req.json();
	const { name, phone, email, address, notes } = body ?? {};
	if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
	const created = await prisma.customer.create({ data: { name, phone, email, address, notes } });
	return NextResponse.json(created, { status: 201 });
}

export async function PUT(req: NextRequest) {
	const body = await req.json();
	const { id, ...updates } = body ?? {};
	if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
	const updated = await prisma.customer.update({ where: { id }, data: updates });
	return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const id = searchParams.get("id");
	if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
	await prisma.customer.delete({ where: { id } });
	return NextResponse.json({ ok: true });
}


