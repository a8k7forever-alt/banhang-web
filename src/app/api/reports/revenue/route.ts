import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toYMD(date: Date) {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

function toYM(date: Date) {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	return `${y}-${m}`;
}

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const from = searchParams.get("from");
	const to = searchParams.get("to");
	const group = (searchParams.get("group") || "day").toLowerCase(); // 'day' | 'month'

	const fromDate = from ? new Date(from) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
	const toDate = to ? new Date(to) : new Date();
	const toExclusive = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate() + 1);

	const invoices = await prisma.invoice.findMany({
		where: {
			status: "PAID",
			createdAt: { gte: fromDate, lt: toExclusive },
		},
		include: {
			items: {
				include: {
					product: true,
				},
			},
		},
		orderBy: { createdAt: "asc" },
	});

	const buckets = new Map<string, { revenue: number; cost: number; profit: number }>();
	for (const inv of invoices) {
		const key = group === "month" ? toYM(inv.createdAt) : toYMD(inv.createdAt);
		
		if (!buckets.has(key)) {
			buckets.set(key, { revenue: 0, cost: 0, profit: 0 });
		}
		
		const bucket = buckets.get(key)!;
		bucket.revenue += inv.totalCents;
		
		// Calculate cost from invoice items
		inv.items.forEach((item) => {
			const quantity = item.product.unit === "M2" 
				? item.quantity / (item.product.quantityScale || 1)
				: item.quantity;
			const itemCost = quantity * item.product.costCents;
			bucket.cost += itemCost;
		});
		
		bucket.profit = bucket.revenue - bucket.cost;
	}

	// Emit sorted result by key
	const result = Array.from(buckets.entries())
		.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
		.map(([period, data]) => ({ 
			period, 
			totalCents: data.revenue,
			costCents: data.cost,
			profitCents: data.profit
		}));

	const totals = Array.from(buckets.values()).reduce(
		(acc, data) => ({
			revenue: acc.revenue + data.revenue,
			cost: acc.cost + data.cost,
			profit: acc.profit + data.profit,
		}),
		{ revenue: 0, cost: 0, profit: 0 }
	);

	return NextResponse.json({ 
		from: fromDate.toISOString(), 
		to: toDate.toISOString(), 
		group, 
		totalCents: totals.revenue,
		costCents: totals.cost,
		profitCents: totals.profit,
		data: result 
	});
}


