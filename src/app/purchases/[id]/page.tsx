"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

export default function PurchaseDetailPage() {
  const params = useParams();
  const purchaseId = params.id as string;
  
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPurchase = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/purchases/${purchaseId}`);
        if (!res.ok) {
          throw new Error('Không thể tải thông tin phiếu nhập hàng');
        }
        const data = await res.json();
        setPurchase(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };

    if (purchaseId) {
      loadPurchase();
    }
  }, [purchaseId]);

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold">Chi tiết phiếu nhập hàng</h1>
        <Loading text="Đang tải thông tin..." />
      </div>
    );
  }

  if (error || !purchase) {
    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold">Chi tiết phiếu nhập hàng</h1>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <div className="text-red-800 font-medium">Lỗi tải dữ liệu</div>
          <div className="text-red-600 text-sm mt-1">{error || 'Không tìm thấy phiếu nhập hàng'}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Chi tiết phiếu nhập hàng</h1>
        <a 
          href="/purchases" 
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          ← Quay lại
        </a>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="border rounded p-4">
            <h2 className="text-lg font-semibold mb-3">Thông tin phiếu</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Mã phiếu:</span>
                <span className="font-medium">{purchase.code || purchase.id.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nhà cung cấp:</span>
                <span className="font-medium">{purchase.supplier || "Không có"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trạng thái:</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  purchase.status === "COMPLETED" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {purchase.status === "COMPLETED" ? "Hoàn thành" : purchase.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ngày nhập:</span>
                <span className="font-medium">
                  {new Date(purchase.purchasedAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ngày tạo:</span>
                <span className="font-medium">
                  {new Date(purchase.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              {purchase.notes && (
                <div className="mt-3">
                  <span className="text-gray-600">Ghi chú:</span>
                  <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
                    {purchase.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border rounded p-4">
            <h2 className="text-lg font-semibold mb-3">Tổng kết</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính:</span>
                <span className="font-medium">{purchase.subtotalCents.toLocaleString()} VND</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Giảm giá:</span>
                <span className="font-medium text-red-600">-{purchase.discountCents.toLocaleString()} VND</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thuế:</span>
                <span className="font-medium text-blue-600">+{purchase.taxCents.toLocaleString()} VND</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-semibold">Tổng cộng:</span>
                  <span className="font-bold text-lg text-green-600">
                    {purchase.totalCents.toLocaleString()} VND
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Danh sách vật liệu</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-3">Vật liệu</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Số lượng</th>
                <th className="p-3">Đơn giá</th>
                <th className="p-3">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {purchase.items.length === 0 ? (
                <tr>
                  <td className="p-3 text-center text-gray-500" colSpan={5}>
                    Không có vật liệu nào
                  </td>
                </tr>
              ) : (
                purchase.items.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium">{item.material.name}</div>
                      {item.material.category && (
                        <div className="text-gray-500 text-xs mt-1">
                          {item.material.category}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-gray-600">
                      {item.material.sku || "-"}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <span>{item.quantity.toLocaleString()}</span>
                        <span className="text-gray-500 text-xs">
                          {item.material.unit || "PCS"}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      {item.unitCostCents.toLocaleString()} VND
                    </td>
                    <td className="p-3 font-semibold">
                      {item.lineTotalCents.toLocaleString()} VND
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
