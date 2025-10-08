import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate') || '2024-01-01';
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];

    console.log("Profit report API called with dates:", { startDate, endDate });

    // Lấy dữ liệu từ các API hiện có
    const [invoicesResponse, purchasesResponse] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/invoices`),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/purchases`)
    ]);

    if (!invoicesResponse.ok || !purchasesResponse.ok) {
      throw new Error("Failed to fetch data from APIs");
    }

    const invoices = await invoicesResponse.json();
    const purchases = await purchasesResponse.json();

    console.log("Fetched data:", { invoicesCount: invoices.length, purchasesCount: purchases.length });

    // Lọc dữ liệu theo ngày
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Lọc hóa đơn đã thanh toán trong khoảng thời gian
    const revenueData = invoices.filter((invoice: any) => {
      if (invoice.status !== 'PAID' || !invoice.paidAt) return false;
      const paidAt = new Date(invoice.paidAt);
      return paidAt >= start && paidAt <= end;
    });

    // Lọc phiếu nhập hàng trong khoảng thời gian
    const costData = purchases.filter((purchase: any) => {
      const createdAt = new Date(purchase.createdAt);
      return createdAt >= start && createdAt <= end;
    });

    console.log("Filtered data:", { revenueCount: revenueData.length, costCount: costData.length });

    // Tính tổng doanh thu
    const totalRevenue = revenueData.reduce((sum: number, invoice: any) => sum + (invoice.totalCents || 0), 0);

    // Tính tổng chi phí
    const totalCost = costData.reduce((sum: number, purchase: any) => sum + (purchase.totalCents || 0), 0);

    // Tính lợi nhuận
    const profit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    console.log("Calculated totals:", { totalRevenue, totalCost, profit, profitMargin });

    // Dữ liệu theo tháng
    const monthlyData = [];
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);

      const monthRevenue = revenueData
        .filter((invoice: any) => {
          if (!invoice.paidAt) return false;
          const paidAt = new Date(invoice.paidAt);
          return paidAt >= monthStart && paidAt <= monthEnd;
        })
        .reduce((sum: number, invoice: any) => sum + (invoice.totalCents || 0), 0);

      const monthCost = costData
        .filter((purchase: any) => {
          const createdAt = new Date(purchase.createdAt);
          return createdAt >= monthStart && createdAt <= monthEnd;
        })
        .reduce((sum: number, purchase: any) => sum + (purchase.totalCents || 0), 0);

      const monthProfit = monthRevenue - monthCost;
      const monthProfitMargin = monthRevenue > 0 ? (monthProfit / monthRevenue) * 100 : 0;

      monthlyData.push({
        month: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`,
        monthName: currentDate.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long' }),
        revenue: monthRevenue,
        cost: monthCost,
        profit: monthProfit,
        profitMargin: monthProfitMargin
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Top sản phẩm có lợi nhuận cao (đơn giản hóa)
    const topProducts = [];

    // Thống kê tổng quan
    const summary = {
      totalRevenue,
      totalCost,
      profit,
      profitMargin,
      totalInvoices: revenueData.length,
      totalPurchases: costData.length,
      averageOrderValue: revenueData.length > 0 ? totalRevenue / revenueData.length : 0,
      averagePurchaseValue: costData.length > 0 ? totalCost / costData.length : 0
    };

    console.log("Returning data:", { summary, monthlyDataCount: monthlyData.length });

    return NextResponse.json({
      summary,
      monthlyData,
      topProducts,
      dateRange: {
        start: startDate,
        end: endDate
      }
    });

  } catch (error) {
    console.error("Error in profit report API:", error);
    return NextResponse.json({ 
      error: "Không thể tải báo cáo lợi nhuận",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}