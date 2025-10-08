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
  description?: string | null;
  category?: string | null;
  supplier?: string | null;
  isActive: boolean;
};

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ 
    name: "", 
    sku: "", 
    costCents: "", 
    quantity: "", 
    unit: "PCS", 
    quantityScale: "1",
    description: "",
    category: "",
    supplier: ""
  });
  const [search, setSearch] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Material | null>(null);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/materials");
      if (!res.ok) {
        throw new Error('Không thể tải danh sách vật liệu');
      }
      const data = await res.json();
      setMaterials(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim() || undefined,
        costCents: Number(form.costCents || 0),
        quantity: Number(form.quantity || 0),
        unit: form.unit,
        quantityScale: Number(form.quantityScale || 1),
        description: form.description.trim() || undefined,
        category: form.category.trim() || undefined,
        supplier: form.supplier.trim() || undefined,
      };
      
      const response = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Không thể tạo vật liệu');
      }

      setForm({ 
        name: "", 
        sku: "", 
        costCents: "", 
        quantity: "", 
        unit: "PCS", 
        quantityScale: "1",
        description: "",
        category: "",
        supplier: ""
      });
      await fetchMaterials();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const updateMaterial = async (id: string, updates: Partial<Material>) => {
    try {
      setLoading(true);
      const response = await fetch("/api/materials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Không thể cập nhật vật liệu');
      }

      setEditingId(null);
      await fetchMaterials();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const deleteMaterial = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa vật liệu này?")) return;
    
    try {
      setLoading(true);
      const url = new URL('/api/materials', window.location.origin);
      url.searchParams.set('id', id);
      const response = await fetch(url.toString(), { method: 'DELETE' });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Không thể xóa vật liệu');
      }
      
      await fetchMaterials();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa vật liệu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Quản lý vật liệu</h1>

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

      <div className="flex items-center justify-between gap-3">
        <input
          placeholder="Tìm kiếm theo tên, SKU hoặc danh mục"
          className="border rounded px-3 py-2 w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
        <div className="flex flex-col">
          <label className="text-sm">Tên vật liệu *</label>
          <input
            className="border rounded px-3 py-2"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm">SKU</label>
          <input
            className="border rounded px-3 py-2"
            value={form.sku}
            onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm">Giá nhập (VND)</label>
          <input
            type="number"
            min={0}
            className="border rounded px-3 py-2"
            value={form.costCents}
            onChange={(e) => setForm((f) => ({ ...f, costCents: e.target.value }))}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm">Tồn kho</label>
          <input
            type="number"
            min={0}
            className="border rounded px-3 py-2"
            value={form.quantity}
            onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm">Đơn vị</label>
          <select 
            className="border rounded px-3 py-2" 
            value={form.unit} 
            onChange={(e) => {
              const unit = e.target.value;
              setForm((f) => ({ 
                ...f, 
                unit, 
                quantityScale: unit === "M2" ? "100" : "1" 
              }));
            }}
          >
            <option value="PCS">PCS</option>
            <option value="KG">KG</option>
            <option value="M2">M2</option>
            <option value="L">L</option>
            <option value="M">M</option>
          </select>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
          Thêm
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex flex-col">
          <label className="text-sm">Danh mục</label>
          <input
            className="border rounded px-3 py-2"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            placeholder="VD: Nguyên liệu, Phụ liệu, Bao bì"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm">Nhà cung cấp</label>
          <input
            className="border rounded px-3 py-2"
            value={form.supplier}
            onChange={(e) => setForm((f) => ({ ...f, supplier: e.target.value }))}
            placeholder="Tên nhà cung cấp"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm">Mô tả</label>
          <input
            className="border rounded px-3 py-2"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Mô tả vật liệu"
          />
        </div>
      </div>

      <div className="border rounded">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-2">Tên</th>
              <th className="p-2">SKU</th>
              <th className="p-2">Danh mục</th>
              <th className="p-2">Nhà cung cấp</th>
              <th className="p-2">Giá nhập</th>
              <th className="p-2">Tồn kho</th>
              <th className="p-2">Đơn vị</th>
              <th className="p-2 w-40">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-2" colSpan={8}>
                  <Loading text="Đang tải vật liệu..." size="sm" />
                </td>
              </tr>
            ) : materials.length === 0 ? (
              <tr>
                <td className="p-2 text-center py-8 text-gray-500" colSpan={8}>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl">📦</span>
                    <span>Chưa có vật liệu nào</span>
                    <span className="text-sm">Hãy thêm vật liệu đầu tiên của bạn</span>
                  </div>
                </td>
              </tr>
            ) : (
              materials
                .filter((m) => {
                  const q = search.trim().toLowerCase();
                  if (!q) return true;
                  return (
                    m.name.toLowerCase().includes(q) || 
                    (m.sku ?? "").toLowerCase().includes(q) ||
                    (m.category ?? "").toLowerCase().includes(q)
                  );
                })
                .map((m) => (
                  <tr key={m.id} className="border-t">
                    <td className="p-2">
                      {editingId === m.id ? (
                        <input 
                          className="border rounded px-2 py-1 w-full" 
                          value={editForm?.name || ""} 
                          onChange={(e) => setEditForm(prev => prev ? {...prev, name: e.target.value} : null)} 
                        />
                      ) : (
                        <div>
                          <div className="font-medium">{m.name}</div>
                          {m.description && (
                            <div className="text-xs text-gray-500">{m.description}</div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-2">
                      {editingId === m.id ? (
                        <input 
                          className="border rounded px-2 py-1 w-full" 
                          value={editForm?.sku || ""} 
                          onChange={(e) => setEditForm(prev => prev ? {...prev, sku: e.target.value} : null)} 
                        />
                      ) : (
                        m.sku ?? "-"
                      )}
                    </td>
                    <td className="p-2">
                      {editingId === m.id ? (
                        <input 
                          className="border rounded px-2 py-1 w-full" 
                          value={editForm?.category || ""} 
                          onChange={(e) => setEditForm(prev => prev ? {...prev, category: e.target.value} : null)} 
                        />
                      ) : (
                        m.category ?? "-"
                      )}
                    </td>
                    <td className="p-2">
                      {editingId === m.id ? (
                        <input 
                          className="border rounded px-2 py-1 w-full" 
                          value={editForm?.supplier || ""} 
                          onChange={(e) => setEditForm(prev => prev ? {...prev, supplier: e.target.value} : null)} 
                        />
                      ) : (
                        m.supplier ?? "-"
                      )}
                    </td>
                    <td className="p-2">
                      {editingId === m.id ? (
                        <input 
                          type="number" 
                          min={0} 
                          className="border rounded px-2 py-1 w-32" 
                          value={editForm?.costCents || 0} 
                          onChange={(e) => setEditForm(prev => prev ? {...prev, costCents: Number(e.target.value)} : null)} 
                        />
                      ) : (
                        `${m.costCents.toLocaleString()} VND`
                      )}
                    </td>
                    <td className="p-2">
                      {editingId === m.id ? (
                        <input 
                          type="number" 
                          min={0} 
                          className="border rounded px-2 py-1 w-24" 
                          value={editForm?.quantity || 0} 
                          onChange={(e) => setEditForm(prev => prev ? {...prev, quantity: Number(e.target.value)} : null)} 
                        />
                      ) : (
                        m.unit === "M2" ? `${(m.quantity / (m.quantityScale || 1)).toLocaleString()} m²` : m.quantity
                      )}
                    </td>
                    <td className="p-2">
                      {editingId === m.id ? (
                        <select 
                          className="border rounded px-1 py-1 w-20 text-xs" 
                          value={editForm?.unit || "PCS"} 
                          onChange={(e) => setEditForm(prev => prev ? {...prev, unit: e.target.value} : null)}
                        >
                          <option value="PCS">PCS</option>
                          <option value="KG">KG</option>
                          <option value="M2">M2</option>
                          <option value="L">L</option>
                          <option value="M">M</option>
                        </select>
                      ) : (
                        <div className="text-xs">
                          {m.unit ?? "PCS"}
                          {m.unit === "M2" && (
                            <div className="text-gray-500">Tỷ lệ: {m.quantityScale ?? 1}</div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-2">
                      {editingId === m.id ? (
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1 rounded bg-green-600 text-white"
                            onClick={() => {
                              if (editForm) {
                                updateMaterial(m.id, editForm);
                              }
                            }}
                          >Lưu</button>
                          <button 
                            className="px-3 py-1 rounded border" 
                            onClick={() => {
                              setEditingId(null);
                              setEditForm(null);
                            }}
                          >Hủy</button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1 rounded border"
                            onClick={() => {
                              setEditingId(m.id);
                              setEditForm(m);
                            }}
                          >Sửa</button>
                          <button
                            className="px-3 py-1 rounded border text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
                            onClick={() => deleteMaterial(m.id)}
                          >🗑️ Xóa</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

