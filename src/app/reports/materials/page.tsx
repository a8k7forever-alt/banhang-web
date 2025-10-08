"use client";

import { useEffect, useState } from "react";
import Loading from "@/components/Loading";

type Material = {
  id: string;
  name: string;
  sku?: string | null;
  costCents: number;
  quantity: number;
  unit?: string;
  quantityScale?: number;
  category?: string | null;
  supplier?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type MaterialSummary = {
  totalMaterials: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  categoryBreakdown: Array<{ category: string; count: number; value: number }>;
  supplierBreakdown: Array<{ supplier: string; count: number; value: number }>;
  lowStockItems: Array<{ material: string; current: number; unit: string; value: number }>;
  recentPurchases: Array<{ material: string; quantity: number; cost: number; date: string }>;
};

export default function MaterialReportsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [summary, setSummary] = useState<MaterialSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/materials");
      if (!res.ok) {
        throw new Error('Không thể tải danh sách vật liệu');
      }
      const data = await res.json();
      setMaterials(data);
      calculateSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (data: Material[]) => {
    const activeMaterials = data.filter(m => m.isActive);
    const totalMaterials = activeMaterials.length;
    const totalValue = activeMaterials.reduce((sum, m) => sum + (m.costCents * m.quantity), 0);
    
    const lowStockCount = activeMaterials.filter(m => m.quantity <= lowStockThreshold && m.quantity > 0).length;
    const outOfStockCount = activeMaterials.filter(m => m.quantity === 0).length;

    // Category breakdown
    const categoryMap = new Map<string, { count: number; value: number }>();
    activeMaterials.forEach(m => {
      const category = m.category || 'Không phân loại';
      const existing = categoryMap.get(category) || { count: 0, value: 0 };
      categoryMap.set(category, {
        count: existing.count + 1,
        value: existing.value + (m.costCents * m.quantity)
      });
    });

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.value - a.value);

    // Supplier breakdown
    const supplierMap = new Map<string, { count: number; value: number }>();
    activeMaterials.forEach(m => {
      const supplier = m.supplier || 'Không xác định';
      const existing = supplierMap.get(supplier) || { count: 0, value: 0 };
      supplierMap.set(supplier, {
        count: existing.count + 1,
        value: existing.value + (m.costCents * m.quantity)
      });
    });

    const supplierBreakdown = Array.from(supplierMap.entries())
      .map(([supplier, data]) => ({ supplier, ...data }))
      .sort((a, b) => b.value - a.value);

    // Low stock items
    const lowStockItems = activeMaterials
      .filter(m => m.quantity <= lowStockThreshold)
      .map(m => ({
        material: m.name,
        current: m.quantity,
        unit: m.unit || 'PCS',
        value: m.costCents * m.quantity
      }))
      .sort((a, b) => a.current - b.current);

    // Recent purchases (simulated - would need purchase data)
    const recentPurchases = activeMaterials
      .filter(m => m.quantity > 0)
      .slice(0, 5)
      .map(m => ({
        material: m.name,
        quantity: m.quantity,
        cost: m.costCents,
        date: new Date(m.updatedAt).toLocaleDateString('vi-VN')
      }));

    setSummary({
      totalMaterials,
      totalValue,
      lowStockCount,
      outOfStockCount,
      categoryBreakdown,
      supplierBreakdown,
      lowStockItems,
      recentPurchases
    });
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  useEffect(() => {
    if (materials.length > 0) {
      calculateSummary(materials);
    }
  }, [lowStockThreshold]);

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold">Báo cáo tồn kho vật liệu</h1>
        <Loading text="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Báo cáo tồn kho vật liệu</h1>
        <a 
          href="/reports" 
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          ← Quay lại
        </a>
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

      {/* Low Stock Threshold */}
      <div className="bg-white border rounded p-4">
        <h2 className="text-lg font-semibold mb-3">Cài đặt cảnh báo</h2>
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Ngưỡng tồn kho thấp</label>
            <input
              type="number"
              min="0"
              className="border rounded px-3 py-2"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(Number(e.target.value))}
            />
          </div>
          <div className="text-sm text-gray-600">
            Vật liệu có số lượng ≤ {lowStockThreshold} sẽ được cảnh báo
          </div>
        </div>
      </div>

      {summary && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border rounded p-4">
              <div className="text-sm text-gray-600">Tổng vật liệu</div>
              <div className="text-2xl font-semibold">{summary.totalMaterials}</div>
            </div>
            <div className="bg-white border rounded p-4">
              <div className="text-sm text-gray-600">Tổng giá trị</div>
              <div className="text-2xl font-semibold text-green-600">
                {summary.totalValue.toLocaleString()} VND
              </div>
            </div>
            <div className="bg-white border rounded p-4">
              <div className="text-sm text-gray-600">Tồn kho thấp</div>
              <div className="text-2xl font-semibold text-yellow-600">
                {summary.lowStockCount}
              </div>
            </div>
            <div className="bg-white border rounded p-4">
              <div className="text-sm text-gray-600">Hết hàng</div>
              <div className="text-2xl font-semibold text-red-600">
                {summary.outOfStockCount}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <div className="bg-white border rounded p-4">
              <h3 className="text-lg font-semibold mb-3">Phân bổ theo danh mục</h3>
              <div className="space-y-2">
                {summary.categoryBreakdown.map((category) => (
                  <div key={category.category} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{category.category}</div>
                      <div className="text-sm text-gray-500">{category.count} vật liệu</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{category.value.toLocaleString()} VND</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Supplier Breakdown */}
            <div className="bg-white border rounded p-4">
              <h3 className="text-lg font-semibold mb-3">Phân bổ theo nhà cung cấp</h3>
              <div className="space-y-2">
                {summary.supplierBreakdown.map((supplier) => (
                  <div key={supplier.supplier} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{supplier.supplier}</div>
                      <div className="text-sm text-gray-500">{supplier.count} vật liệu</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{supplier.value.toLocaleString()} VND</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Low Stock Alert */}
          {summary.lowStockItems.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <h3 className="text-lg font-semibold mb-3 text-yellow-800">⚠️ Cảnh báo tồn kho thấp</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {summary.lowStockItems.map((item, index) => (
                  <div key={index} className="bg-white border border-yellow-300 rounded p-3">
                    <div className="font-medium text-yellow-800">{item.material}</div>
                    <div className="text-sm text-yellow-600">
                      Còn lại: {item.current} {item.unit}
                    </div>
                    <div className="text-sm text-gray-600">
                      Giá trị: {item.value.toLocaleString()} VND
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Table */}
          <div className="bg-white border rounded">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Chi tiết tồn kho vật liệu</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="p-3">Vật liệu</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Danh mục</th>
                    <th className="p-3">Nhà cung cấp</th>
                    <th className="p-3">Tồn kho</th>
                    <th className="p-3">Đơn giá</th>
                    <th className="p-3">Tổng giá trị</th>
                    <th className="p-3">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {materials
                    .filter(m => m.isActive)
                    .sort((a, b) => a.quantity - b.quantity)
                    .map((material) => {
                      const totalValue = material.costCents * material.quantity;
                      const isLowStock = material.quantity <= lowStockThreshold && material.quantity > 0;
                      const isOutOfStock = material.quantity === 0;
                      
                      return (
                        <tr key={material.id} className={`border-t hover:bg-gray-50 ${
                          isOutOfStock ? 'bg-red-50' : isLowStock ? 'bg-yellow-50' : ''
                        }`}>
                          <td className="p-3">
                            <div className="font-medium">{material.name}</div>
                            {material.description && (
                              <div className="text-xs text-gray-500">{material.description}</div>
                            )}
                          </td>
                          <td className="p-3 text-gray-600">
                            {material.sku || "-"}
                          </td>
                          <td className="p-3">
                            {material.category || "-"}
                          </td>
                          <td className="p-3">
                            {material.supplier || "-"}
                          </td>
                          <td className="p-3">
                            <div className={`font-semibold ${
                              isOutOfStock ? 'text-red-600' : isLowStock ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {material.quantity.toLocaleString()} {material.unit || 'PCS'}
                            </div>
                          </td>
                          <td className="p-3">
                            {material.costCents.toLocaleString()} VND
                          </td>
                          <td className="p-3 font-semibold">
                            {totalValue.toLocaleString()} VND
                          </td>
                          <td className="p-3">
                            {isOutOfStock ? (
                              <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">
                                Hết hàng
                              </span>
                            ) : isLowStock ? (
                              <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                                Tồn kho thấp
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                                Đủ hàng
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

