import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
	const list = await prisma.cashFlow.findMany({ orderBy: { occurredAt: "desc" }, include: { invoice: true } });
	const sum = await prisma.cashFlow.groupBy({ by: ["type"], _sum: { amountCents: true } });
	return NextResponse.json({ list, summary: sum });
}

export async function POST(req: NextRequest) {
	const body = await req.json();
	const { type, amountCents, category, note, occurredAt, invoiceId } = body ?? {};
	if (!type || typeof amountCents !== "number" || !category) {
		return NextResponse.json({ error: "type, amountCents, category required" }, { status: 400 });
	}
	const created = await prisma.cashFlow.create({
		data: {
			type,
			amountCents,
			category,
			note: note ?? null,
			occurredAt: occurredAt ? new Date(occurredAt) : undefined,
			invoiceId: invoiceId ?? null,
		},
	});
	return NextResponse.json(created, { status: 201 });
}


