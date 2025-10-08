"use client";

import { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import ActionButtons from "@/components/ActionButtons";
import ProtectedRoute from "@/components/ProtectedRoute";

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
  items: PurchaseItem[];
};

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    supplier: "",
    notes: "",
    discountCents: "",
    taxCents: "",
    items: [] as Array<{
      materialId: string;
      quantity: number;
      unitCostCents: number;
    }>
  });

  useEffect(() => {
    loadPurchases();
    loadMaterials();
  }, []);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/purchases");
      if (response.ok) {
        const data = await response.json();
        setPurchases(data);
      } else {
        setError("Không thể tải danh sách nhập hàng");
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const loadMaterials = async () => {
    try {
      const response = await fetch("/api/materials");
      if (response.ok) {
        const data = await response.json();
        setMaterials(data);
      }
    } catch (err) {
      console.error("Error loading materials:", err);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { materialId: "", quantity: 1, unitCostCents: 0 }]
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitCostCents), 0);
    const discount = parseInt(formData.discountCents) || 0;
    const tax = parseInt(formData.taxCents) || 0;
    const total = subtotal - discount + tax;
    return { subtotal, discount, tax, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      setError("Vui lòng thêm ít nhất một vật liệu");
      return;
    }

    try {
      setLoading(true);
      const { subtotal, discount, tax, total } = calculateTotals();
      
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          subtotalCents: subtotal,
          discountCents: discount,
          taxCents: tax,
          totalCents: total
        })
      });

      if (response.ok) {
        setFormData({
          code: "",
          supplier: "",
          notes: "",
          discountCents: "",
          taxCents: "",
          items: []
        });
        setShowForm(false);
        await loadPurchases();
      } else {
        const error = await response.json();
        setError(error.error || 'Có lỗi xảy ra');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa phiếu nhập hàng này?")) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/purchases/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        await loadPurchases();
      } else {
        const error = await response.json();
        setError(error.error || "Không thể xóa phiếu nhập hàng");
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi xóa");
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, discount, tax, total } = calculateTotals();

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Quản lý nhập hàng</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {showForm ? "Hủy" : "Thêm phiếu nhập hàng"}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {showForm && (
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Thông tin phiếu nhập hàng</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã phiếu
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tự động tạo nếu để trống"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nhà cung cấp
                  </label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giảm giá (VND)
                  </label>
                  <input
                    type="number"
                    value={formData.discountCents}
                    onChange={(e) => setFormData({ ...formData, discountCents: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thuế (VND)
                  </label>
                  <input
                    type="number"
                    value={formData.taxCents}
                    onChange={(e) => setFormData({ ...formData, taxCents: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-md font-medium">Vật liệu</h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Thêm vật liệu
                  </button>
                </div>
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2 p-3 border rounded">
                    <div>
                      <select
                        value={item.materialId}
                        onChange={(e) => updateItem(index, "materialId", e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Chọn vật liệu</option>
                        {materials.map((material) => (
                          <option key={material.id} value={material.id}>
                            {material.name} ({material.sku || "N/A"})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Số lượng"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Đơn giá (VND)"
                        value={item.unitCostCents}
                        onChange={(e) => updateItem(index, "unitCostCents", parseInt(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {(item.quantity * item.unitCostCents).toLocaleString()} VND
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <div className="flex justify-between text-sm">
                  <span>Tạm tính:</span>
                  <span>{subtotal.toLocaleString()} VND</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Giảm giá:</span>
                  <span>-{discount.toLocaleString()} VND</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Thuế:</span>
                  <span>+{tax.toLocaleString()} VND</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Tổng cộng:</span>
                  <span>{total.toLocaleString()} VND</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? "Đang lưu..." : "Lưu phiếu nhập hàng"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2">Mã phiếu</th>
                <th className="p-2">Nhà cung cấp</th>
                <th className="p-2">Trạng thái</th>
                <th className="p-2">Tổng tiền</th>
                <th className="p-2">Ngày nhập</th>
                <th className="p-2">Vật liệu</th>
                <th className="p-2">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="p-2" colSpan={7}>
                    <Loading text="Đang tải danh sách nhập hàng..." size="sm" />
                  </td>
                </tr>
              ) : purchases.length === 0 ? (
                <tr>
                  <td className="p-2" colSpan={7} className="text-center py-8 text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl">📦</span>
                      <span>Chưa có phiếu nhập hàng nào</span>
                      <span className="text-sm">Hãy tạo phiếu nhập hàng đầu tiên</span>
                    </div>
                  </td>
                </tr>
              ) : (
                purchases.map((purchase) => (
                  <tr key={purchase.id} className="border-t hover:bg-gray-50">
                    <td className="p-2 font-medium">
                      <a 
                        href={`/purchases/${purchase.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {purchase.code || purchase.id.slice(-8)}
                      </a>
                    </td>
                    <td className="p-2">{purchase.supplier || "-"}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        purchase.status === "COMPLETED" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {purchase.status === "COMPLETED" ? "Hoàn thành" : purchase.status}
                      </span>
                    </td>
                    <td className="p-2 font-semibold">
                      {purchase.totalCents.toLocaleString()} VND
                    </td>
                    <td className="p-2">
                      {new Date(purchase.purchasedAt).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      <div className="text-xs">
                        {purchase.items.length} vật liệu
                        <div className="text-gray-500">
                          {purchase.items.slice(0, 2).map(item => item.material.name).join(", ")}
                          {purchase.items.length > 2 && "..."}
                        </div>
                      </div>
                    </td>
                    <td className="p-2">
                      <ActionButtons
                        onView={() => window.open(`/purchases/${purchase.id}`, '_blank')}
                        onEdit={() => {/* TODO: Implement edit */}}
                        onDelete={() => handleDelete(purchase.id)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedRoute>
  );
}