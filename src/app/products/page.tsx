"use client";

import { useEffect, useState } from "react";
import Loading from "@/components/Loading";

type Product = {
  id: string;
  name: string;
  sku?: string | null;
  priceCents: number;
  costCents: number;
  quantity: number;
  description?: string | null;
  isActive: boolean;
  unit?: "PCS" | "M2";
  quantityScale?: number;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", sku: "", priceCents: "", costCents: "", quantity: "", unit: "PCS", quantityScale: "1" });
  const [search, setSearch] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; sku: string; priceCents: string; costCents: string; quantity: string; description?: string; isActive: boolean; unit: "PCS" | "M2"; quantityScale: string }>({ name: "", sku: "", priceCents: "", costCents: "", quantity: "", description: "", isActive: true, unit: "PCS", quantityScale: "1" });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/products");
      if (!res.ok) {
        throw new Error('Không thể tải danh sách sản phẩm');
      }
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim() || undefined,
        priceCents: Number(form.priceCents || 0),
        costCents: Number(form.costCents || 0),
        quantity: Number(form.quantity || 0),
        unit: form.unit,
        quantityScale: Number(form.quantityScale || 1),
      };
      
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Không thể tạo sản phẩm');
      }

      setForm({ name: "", sku: "", priceCents: "", costCents: "", quantity: "", unit: "PCS", quantityScale: "1" });
      await fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Sản phẩm</h1>

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
          placeholder="Tìm kiếm theo tên hoặc SKU"
          className="border rounded px-3 py-2 w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-8 gap-3 items-end">
        <div className="flex flex-col">
          <label className="text-sm">Tên</label>
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
          <label className="text-sm">Giá bán (VND)</label>
          <input
            type="number"
            min={0}
            className="border rounded px-3 py-2"
            value={form.priceCents}
            onChange={(e) => setForm((f) => ({ ...f, priceCents: e.target.value }))}
            placeholder="Ví dụ: 100000 (VND)"
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm">Chi phí (VND)</label>
          <input
            type="number"
            min={0}
            className="border rounded px-3 py-2"
            value={form.costCents}
            onChange={(e) => setForm((f) => ({ ...f, costCents: e.target.value }))}
            placeholder="Ví dụ: 50000 (VND)"
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
              const unit = e.target.value as "PCS" | "M2";
              setForm((f) => ({ 
                ...f, 
                unit, 
                quantityScale: unit === "M2" ? "100" : "1" 
              }));
            }}
          >
            <option value="PCS">PCS</option>
            <option value="M2">M2</option>
          </select>
        </div>
        {form.unit === "M2" && (
          <div className="flex flex-col">
            <label className="text-sm">Tỷ lệ</label>
            <input
              type="number"
              min={1}
              className="border rounded px-3 py-2"
              value={form.quantityScale ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, quantityScale: e.target.value }))}
              placeholder="VD: 100 cho m²"
            />
          </div>
        )}
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
          Thêm
        </button>
      </form>

      <div className="border rounded">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-2">Tên</th>
              <th className="p-2">SKU</th>
              <th className="p-2">Giá bán</th>
              <th className="p-2">Chi phí</th>
              <th className="p-2">Lợi nhuận</th>
              <th className="p-2">Tồn kho</th>
              <th className="p-2">Đơn vị</th>
              <th className="p-2 w-40">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-2" colSpan={8}>
                  <Loading text="Đang tải sản phẩm..." size="sm" />
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td className="p-2" colSpan={8} className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl">📦</span>
                    <span>Chưa có sản phẩm nào</span>
                    <span className="text-sm">Hãy thêm sản phẩm đầu tiên của bạn</span>
                  </div>
                </td>
              </tr>
            ) : (
              products
                .filter((p) => {
                  const q = search.trim().toLowerCase();
                  if (!q) return true;
                  return (
                    p.name.toLowerCase().includes(q) || (p.sku ?? "").toLowerCase().includes(q)
                  );
                })
                .map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="p-2">
                      {editingId === p.id ? (
                        <input className="border rounded px-2 py-1 w-full" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
                      ) : (
                        p.name
                      )}
                    </td>
                    <td className="p-2">
                      {editingId === p.id ? (
                        <input className="border rounded px-2 py-1 w-full" value={editForm.sku} onChange={(e) => setEditForm((f) => ({ ...f, sku: e.target.value }))} />
                      ) : (
                        p.sku ?? "-"
                      )}
                    </td>
                    <td className="p-2">
                      {editingId === p.id ? (
                        <input type="number" min={0} className="border rounded px-2 py-1 w-32" value={editForm.priceCents} onChange={(e) => setEditForm((f) => ({ ...f, priceCents: e.target.value }))} />
                      ) : (
                        `${p.priceCents.toLocaleString()} VND`
                      )}
                    </td>
                    <td className="p-2">
                      {editingId === p.id ? (
                        <input type="number" min={0} className="border rounded px-2 py-1 w-32" value={editForm.costCents} onChange={(e) => setEditForm((f) => ({ ...f, costCents: e.target.value }))} />
                      ) : (
                        `${(p.costCents || 0).toLocaleString()} VND`
                      )}
                    </td>
                    <td className="p-2">
                      <span className={`${p.priceCents - (p.costCents || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(p.priceCents - (p.costCents || 0)).toLocaleString()} VND
                      </span>
                    </td>
                    <td className="p-2">
                      {editingId === p.id ? (
                        <input type="number" min={0} className="border rounded px-2 py-1 w-24" value={editForm.quantity} onChange={(e) => setEditForm((f) => ({ ...f, quantity: e.target.value }))} />
                      ) : (
                        p.unit === "M2" ? `${(p.quantity / (p.quantityScale || 1)).toLocaleString()} m²` : p.quantity
                      )}
                    </td>
                    <td className="p-2">
                      {editingId === p.id ? (
                        <div className="flex flex-col gap-1">
                          <select 
                            className="border rounded px-1 py-1 w-20 text-xs" 
                            value={editForm.unit} 
                            onChange={(e) => {
                              const unit = e.target.value as "PCS" | "M2";
                              setEditForm((f) => ({ 
                                ...f, 
                                unit, 
                                quantityScale: unit === "M2" ? "100" : "1" 
                              }));
                            }}
                          >
                            <option value="PCS">PCS</option>
                            <option value="M2">M2</option>
                          </select>
                          {editForm.unit === "M2" && (
                            <input
                              type="number"
                              min={1}
                              className="border rounded px-1 py-1 w-20 text-xs"
                              value={editForm.quantityScale ?? ""}
                              onChange={(e) => setEditForm((f) => ({ ...f, quantityScale: e.target.value }))}
                              placeholder="100"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="text-xs">
                          {p.unit ?? "PCS"}
                          {p.unit === "M2" && (
                            <div className="text-gray-500">Tỷ lệ: {p.quantityScale ?? 1}</div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-2">
                      {editingId === p.id ? (
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1 rounded bg-green-600 text-white"
                            onClick={async () => {
                              const payload = {
                                id: p.id,
                                name: editForm.name.trim(),
                                sku: editForm.sku.trim() || undefined,
                                priceCents: Number(editForm.priceCents || 0),
                                costCents: Number(editForm.costCents || 0),
                                quantity: Number(editForm.quantity || 0),
                                unit: editForm.unit,
                                quantityScale: Number(editForm.quantityScale || 1),
                              };
                              console.log("Updating product with payload:", payload);
                              await fetch('/api/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                              setEditingId(null);
                              fetchProducts();
                            }}
                          >Lưu</button>
                          <button className="px-3 py-1 rounded border" onClick={() => setEditingId(null)}>Hủy</button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1 rounded border"
                            onClick={() => {
                              setEditingId(p.id);
                              setEditForm({
                                name: p.name,
                                sku: p.sku ?? "",
                                priceCents: String(p.priceCents),
                                costCents: String(p.costCents || 0),
                                quantity: String(p.quantity),
                                description: p.description ?? "",
                                isActive: p.isActive,
                                unit: p.unit ?? "PCS",
                                quantityScale: String(p.quantityScale ?? 1),
                              });
                            }}
                          >Sửa</button>
                          <button
                            className="px-3 py-1 rounded border text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
                            onClick={async () => {
                              if (!confirm(`Bạn có chắc muốn xóa sản phẩm "${p.name}"?\n\nHành động này không thể hoàn tác!`)) return;
                              
                              try {
                                setLoading(true);
                                const url = new URL('/api/products', window.location.origin);
                                url.searchParams.set('id', p.id);
                                const response = await fetch(url.toString(), { method: 'DELETE' });
                                
                                if (!response.ok) {
                                  const errorData = await response.json();
                                  throw new Error(errorData.error || 'Không thể xóa sản phẩm');
                                }
                                
                                await fetchProducts();
                              } catch (err) {
                                setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa sản phẩm');
                              } finally {
                                setLoading(false);
                              }
                            }}
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


