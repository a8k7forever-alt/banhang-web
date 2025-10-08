"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import ActionButtons from "@/components/ActionButtons";

type Entry = { id: string; type: "INCOME" | "EXPENSE"; amountCents: number; category: string; note?: string | null; occurredAt: string; invoiceId?: string | null };

export default function CashFlowPage() {
  const [list, setList] = useState<Entry[]>([]);
  const [type, setType] = useState<"INCOME" | "EXPENSE">("INCOME");
  const [amountCents, setAmountCents] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cashflow");
      if (!res.ok) {
        throw new Error("Không thể tải danh sách giao dịch");
      }
      const data = await res.json();
      setList(data.list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totalIncome = useMemo(() => list.filter((x) => x.type === "INCOME").reduce((s, x) => s + x.amountCents, 0), [list]);
  const totalExpense = useMemo(() => list.filter((x) => x.type === "EXPENSE").reduce((s, x) => s + x.amountCents, 0), [list]);
  const balance = totalIncome - totalExpense;

  const resetForm = () => {
    setType("INCOME");
    setAmountCents("");
    setCategory("");
    setNote("");
    setEditingEntry(null);
    setShowForm(false);
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const payload = { 
        type, 
        amountCents: Number(amountCents || 0), 
        category: category.trim(), 
        note: note.trim() || undefined 
      };
      
      const method = editingEntry ? "PUT" : "POST";
      const url = editingEntry ? `/api/cashflow/${editingEntry.id}` : "/api/cashflow";
      
      const res = await fetch(url, { 
        method, 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(payload) 
      });
      
      if (res.ok) {
        resetForm();
        await load();
      } else {
        const errorData = await res.json();
        setError(errorData?.error ?? "Có lỗi xảy ra");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entry: Entry) => {
    setEditingEntry(entry);
    setType(entry.type);
    setAmountCents(entry.amountCents.toString());
    setCategory(entry.category);
    setNote(entry.note || "");
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa giao dịch này?")) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/cashflow/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        await load();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Không thể xóa giao dịch");
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi xóa");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
  };

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Nguồn tiền</h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showForm ? "Hủy" : "Thêm giao dịch mới"}
          </button>
        </div>

        {error && <div className="bg-red-100 text-red-800 p-3 rounded">{error}</div>}

        {showForm && (
          <div className="border rounded p-6 bg-white">
            <h2 className="text-xl font-semibold mb-4">
              {editingEntry ? "Chỉnh sửa giao dịch" : "Thêm giao dịch mới"}
            </h2>
            <form onSubmit={add} className="space-y-4">
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setType("INCOME")} 
                  className={`px-3 py-1 rounded border ${type === "INCOME" ? "bg-green-600 text-white" : ""}`}
                >
                  Thu
                </button>
                <button 
                  type="button" 
                  onClick={() => setType("EXPENSE")} 
                  className={`px-3 py-1 rounded border ${type === "EXPENSE" ? "bg-red-600 text-white" : ""}`}
                >
                  Chi
                </button>
              </div>
              <input 
                className="border rounded px-3 py-2 w-full" 
                placeholder="Số tiền (VND)" 
                value={amountCents} 
                onChange={(e) => setAmountCents(e.target.value)} 
                type="number" 
                min={0} 
                required 
              />
              <input 
                className="border rounded px-3 py-2 w-full" 
                placeholder="Danh mục (vd: Bán hàng, Nhập hàng)" 
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                required 
              />
              <input 
                className="border rounded px-3 py-2 w-full" 
                placeholder="Ghi chú" 
                value={note} 
                onChange={(e) => setNote(e.target.value)} 
              />
              <div className="flex gap-2">
                <button 
                  type="submit" 
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  disabled={loading}
                >
                  {loading ? "Đang lưu..." : "Lưu"}
                </button>
                <button 
                  type="button" 
                  onClick={handleCancel}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-6">

          <div className="grid grid-cols-3 gap-3">
            <div className="border rounded p-3">
              <div className="text-sm text-gray-600">Thu</div>
              <div className="text-lg font-semibold">{totalIncome.toLocaleString()} VND</div>
            </div>
            <div className="border rounded p-3">
              <div className="text-sm text-gray-600">Chi</div>
              <div className="text-lg font-semibold">{totalExpense.toLocaleString()} VND</div>
            </div>
            <div className="border rounded p-3">
              <div className="text-sm text-gray-600">Số dư</div>
              <div className="text-lg font-semibold">{balance.toLocaleString()} VND</div>
            </div>
          </div>

          <div className="border rounded">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="p-2">Loại</th>
                  <th className="p-2">Số tiền</th>
                  <th className="p-2">Danh mục</th>
                  <th className="p-2">Thời gian</th>
                  <th className="p-2">Ghi chú</th>
                  <th className="p-2">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading && list.length === 0 ? (
                  <tr>
                    <td className="p-2 text-center" colSpan={6}>
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Đang tải...</span>
                      </div>
                    </td>
                  </tr>
                ) : list.length === 0 ? (
                  <tr>
                    <td className="p-2 text-center text-gray-500" colSpan={6}>
                      Chưa có giao dịch nào
                    </td>
                  </tr>
                ) : (
                  list.map((e) => (
                    <tr key={e.id} className="border-t hover:bg-gray-50">
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          e.type === "INCOME" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {e.type === "INCOME" ? "Thu" : "Chi"}
                        </span>
                      </td>
                      <td className="p-2 font-medium">{e.amountCents.toLocaleString()} VND</td>
                      <td className="p-2">{e.category}</td>
                      <td className="p-2">{new Date(e.occurredAt).toLocaleString()}</td>
                      <td className="p-2">{e.note ?? ""}</td>
                      <td className="p-2">
                        <ActionButtons
                          onEdit={() => handleEdit(e)}
                          onDelete={e.invoiceId ? undefined : () => handleDelete(e.id)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
