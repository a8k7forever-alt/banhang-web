import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
	const [products, customers, invoices, purchases, materials, incomeSum, expenseSum] = await Promise.all([
		prisma.product.count(),
		prisma.customer.count(),
		prisma.invoice.count(),
		prisma.purchase.count(),
		prisma.material.count(),
		prisma.cashFlow.aggregate({ _sum: { amountCents: true }, where: { type: "INCOME" } }),
		prisma.cashFlow.aggregate({ _sum: { amountCents: true }, where: { type: "EXPENSE" } }),
	]);
	const income = incomeSum._sum.amountCents ?? 0;
	const expense = expenseSum._sum.amountCents ?? 0;
	return NextResponse.json({ products, customers, invoices, purchases, materials, income, expense, balance: income - expense });
}


