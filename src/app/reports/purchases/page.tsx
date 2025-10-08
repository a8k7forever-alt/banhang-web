"use client";

import { useEffect, useState } from "react";
import Loading from "@/components/Loading";

type Material = {
  id: string;
  name: string;
  sku?: string | null;
  category?: string | null;
  supplier?: string | null;
};

type PurchaseItem = {
  id: string;
  materialId: string;
  quantity: number;
  unitCostCents: number;
  lineTotalCents: number;
  material: Material;
};

type Purchase = {
  id: string;
  code?: string | null;
  supplier?: string | null;
  status: string;
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  notes?: string | null;
  purchasedAt: string;
  createdAt: string;
  items: PurchaseItem[];
};

type PurchaseSummary = {
  totalPurchases: number;
  totalAmount: number;
  totalItems: number;
  averageOrderValue: number;
  topSuppliers: Array<{ supplier: string; count: number; amount: number }>;
  topMaterials: Array<{ material: string; quantity: number; amount: number }>;
  monthlyData: Array<{ month: string; count: number; amount: number }>;
};

export default function PurchaseReportsPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [summary, setSummary] = useState<PurchaseSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start: '2024-01-01', // Start from beginning of 2024
    end: new Date().toISOString().split('T')[0]
  });

  const loadPurchases = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/purchases");
      if (!res.ok) {
        throw new Error('Không thể tải danh sách nhập hàng');
      }
      const data = await res.json();
      console.log('Loaded purchases data:', data.length, data);
      setPurchases(data);
      calculateSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (data: Purchase[]) => {
    console.log('Calculating summary for:', data.length, 'purchases');
    console.log('Date range:', dateRange);
    console.log('All purchases:', data.map(p => ({ id: p.id, purchasedAt: p.purchasedAt, totalCents: p.totalCents })));
    
    const filteredData = data.filter(p => {
      const purchaseDate = new Date(p.purchasedAt);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      
      // Add time to end date to include the entire day
      endDate.setHours(23, 59, 59, 999);
      
      const isInRange = purchaseDate >= startDate && purchaseDate <= endDate;
      console.log(`Purchase ${p.id} on ${p.purchasedAt}: ${isInRange ? 'IN' : 'OUT'} range (${startDate.toISOString()} to ${endDate.toISOString()})`);
      return isInRange;
    });
    
    console.log('Filtered data:', filteredData.length, 'purchases');

    const totalPurchases = filteredData.length;
    const totalAmount = filteredData.reduce((sum, p) => sum + p.totalCents, 0);
    const totalItems = filteredData.reduce((sum, p) => sum + p.items.length, 0);
    const averageOrderValue = totalPurchases > 0 ? totalAmount / totalPurchases : 0;

    // Top suppliers
    const supplierMap = new Map<string, { count: number; amount: number }>();
    filteredData.forEach(p => {
      const supplier = p.supplier || 'Không xác định';
      const existing = supplierMap.get(supplier) || { count: 0, amount: 0 };
      supplierMap.set(supplier, {
        count: existing.count + 1,
        amount: existing.amount + p.totalCents
      });
    });

    const topSuppliers = Array.from(supplierMap.entries())
      .map(([supplier, data]) => ({ supplier, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Top materials
    const materialMap = new Map<string, { quantity: number; amount: number }>();
    filteredData.forEach(p => {
      p.items.forEach(item => {
        const material = item.material.name;
        const existing = materialMap.get(material) || { quantity: 0, amount: 0 };
        materialMap.set(material, {
          quantity: existing.quantity + item.quantity,
          amount: existing.amount + item.lineTotalCents
        });
      });
    });

    const topMaterials = Array.from(materialMap.entries())
      .map(([material, data]) => ({ material, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Monthly data
    const monthlyMap = new Map<string, { count: number; amount: number }>();
    filteredData.forEach(p => {
      const month = new Date(p.purchasedAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'short' });
      const existing = monthlyMap.get(month) || { count: 0, amount: 0 };
      monthlyMap.set(month, {
        count: existing.count + 1,
        amount: existing.amount + p.totalCents
      });
    });

    const monthlyData = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    const summaryData = {
      totalPurchases,
      totalAmount,
      totalItems,
      averageOrderValue,
      topSuppliers,
      topMaterials,
      monthlyData
    };
    
    console.log('Setting summary:', summaryData);
    setSummary(summaryData);
  };

  useEffect(() => {
    loadPurchases();
  }, []);

  useEffect(() => {
    if (purchases.length > 0) {
      calculateSummary(purchases);
    }
  }, [dateRange]);

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold">Báo cáo nhập hàng</h1>
        <Loading text="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Báo cáo nhập hàng</h1>
        <div className="text-sm text-gray-600">
          Cập nhật lần cuối: {new Date().toLocaleString('vi-VN')}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <div className="text-red-800 font-medium">Lỗi</div>
          <div className="text-red-600 text-sm mt-1">{error}</div>
          <button 
            onClick={() => setError(null)} 
            className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Date Range Filter */}
      <div className="bg-white border rounded p-4">
        <h2 className="text-lg font-semibold mb-3">Bộ lọc thời gian</h2>
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Từ ngày</label>
            <input
              type="date"
              className="border rounded px-3 py-2"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Đến ngày</label>
            <input
              type="date"
              className="border rounded px-3 py-2"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
          <button
            onClick={() => loadPurchases()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Lọc
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded p-4">
          <div className="text-sm text-gray-600">Tổng phiếu nhập</div>
          <div className="text-2xl font-semibold">{summary?.totalPurchases ?? 0}</div>
        </div>
        <div className="bg-white border rounded p-4">
          <div className="text-sm text-gray-600">Tổng giá trị</div>
          <div className="text-2xl font-semibold text-green-600">
            {(summary?.totalAmount ?? 0).toLocaleString()} VND
          </div>
        </div>
        <div className="bg-white border rounded p-4">
          <div className="text-sm text-gray-600">Tổng mặt hàng</div>
          <div className="text-2xl font-semibold">{summary?.totalItems ?? 0}</div>
        </div>
        <div className="bg-white border rounded p-4">
          <div className="text-sm text-gray-600">Giá trị TB/phiếu</div>
          <div className="text-2xl font-semibold text-blue-600">
            {Math.round(summary?.averageOrderValue ?? 0).toLocaleString()} VND
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Suppliers */}
        <div className="bg-white border rounded p-4">
          <h3 className="text-lg font-semibold mb-3">Top nhà cung cấp</h3>
          <div className="space-y-2">
            {(summary?.topSuppliers ?? []).map((supplier, index) => (
              <div key={supplier.supplier} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">#{index + 1} {supplier.supplier}</div>
                  <div className="text-sm text-gray-500">{supplier.count} phiếu</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{supplier.amount.toLocaleString()} VND</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Materials */}
        <div className="bg-white border rounded p-4">
          <h3 className="text-lg font-semibold mb-3">Top vật liệu nhập</h3>
          <div className="space-y-2">
            {(summary?.topMaterials ?? []).map((material, index) => (
              <div key={material.material} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">#{index + 1} {material.material}</div>
                  <div className="text-sm text-gray-500">{material.quantity.toLocaleString()} đơn vị</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{material.amount.toLocaleString()} VND</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="bg-white border rounded p-4">
        <h3 className="text-lg font-semibold mb-3">Biểu đồ theo tháng</h3>
        <div className="space-y-2">
          {(summary?.monthlyData ?? []).map((month) => (
            <div key={month.month} className="flex items-center gap-4">
              <div className="w-20 text-sm font-medium">{month.month}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                <div 
                  className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                  style={{ 
                    width: `${(summary?.monthlyData ?? []).length > 0 ? (month.amount / Math.max(...(summary?.monthlyData ?? []).map(m => m.amount))) * 100 : 0}%` 
                  }}
                >
                  <span className="text-white text-xs font-medium">
                    {month.count} phiếu
                  </span>
                </div>
              </div>
              <div className="w-24 text-right text-sm font-medium">
                {month.amount.toLocaleString()} VND
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white border rounded">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Chi tiết phiếu nhập hàng</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-3">Mã phiếu</th>
                <th className="p-3">Nhà cung cấp</th>
                <th className="p-3">Ngày nhập</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3">Tổng tiền</th>
                <th className="p-3">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {purchases.length === 0 ? (
                <tr>
                  <td className="p-3 text-center text-gray-500" colSpan={6}>
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                purchases.map((purchase) => (
                  <tr key={purchase.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">
                        {purchase.code || purchase.id.slice(-8)}
                      </div>
                    </td>
                    <td className="p-3 text-gray-600">
                      {purchase.supplier || "-"}
                    </td>
                    <td className="p-3">
                      {new Date(purchase.purchasedAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        purchase.status === "COMPLETED" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {purchase.status === "COMPLETED" ? "Hoàn thành" : purchase.status}
                      </span>
                    </td>
                    <td className="p-3 font-semibold">
                      {purchase.totalCents.toLocaleString()} VND
                    </td>
                    <td className="p-3 text-gray-600">
                      {purchase.notes || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}