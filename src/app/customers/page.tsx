"use client";

import { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import ActionButtons from "@/components/ActionButtons";
import ProtectedRoute from "@/components/ProtectedRoute";

type Customer = { id: string; name: string; phone?: string | null; email?: string | null; address?: string | null; notes?: string | null };

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", notes: "" });
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/customers");
      if (!res.ok) {
        throw new Error('Không thể tải danh sách khách hàng');
      }
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        notes: form.notes.trim() || undefined,
      };
      
      const url = editingCustomer ? `/api/customers/${editingCustomer.id}` : "/api/customers";
      const method = editingCustomer ? "PUT" : "POST";
      
      const response = await fetch(url, { 
        method, 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(payload) 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Không thể ${editingCustomer ? 'cập nhật' : 'tạo'} khách hàng`);
      }

      setForm({ name: "", phone: "", email: "", address: "", notes: "" });
      setEditingCustomer(null);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setForm({
      name: customer.name,
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
      notes: customer.notes || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/customers/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Không thể xóa khách hàng");
      }

      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi xóa");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({ name: "", phone: "", email: "", address: "", notes: "" });
    setEditingCustomer(null);
    setShowForm(false);
  };

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Khách hàng</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showForm ? "Hủy" : "Thêm khách hàng"}
          </button>
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

      {showForm && (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingCustomer ? "Sửa khách hàng" : "Thêm khách hàng mới"}
          </h2>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên khách hàng *
                </label>
                <input 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Tên khách hàng" 
                  value={form.name} 
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Số điện thoại" 
                  value={form.phone} 
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Email" 
                  value={form.email} 
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ
                </label>
                <input 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Địa chỉ" 
                  value={form.address} 
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú
              </label>
              <textarea 
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Ghi chú" 
                value={form.notes} 
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <button 
                type="submit" 
                disabled={loading} 
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Đang lưu..." : (editingCustomer ? "Cập nhật" : "Thêm")}
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

      <div className="border rounded">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-2">Tên</th>
              <th className="p-2">Điện thoại</th>
              <th className="p-2">Email</th>
              <th className="p-2">Địa chỉ</th>
              <th className="p-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-2" colSpan={5}>
                  <Loading text="Đang tải khách hàng..." size="sm" />
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td className="p-2" colSpan={5} className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl">👥</span>
                    <span>Chưa có khách hàng nào</span>
                    <span className="text-sm">Hãy thêm khách hàng đầu tiên của bạn</span>
                  </div>
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="p-2 font-medium">{c.name}</td>
                  <td className="p-2">{c.phone ?? "-"}</td>
                  <td className="p-2">{c.email ?? "-"}</td>
                  <td className="p-2">{c.address ?? "-"}</td>
                  <td className="p-2">
                    <ActionButtons
                      onEdit={() => handleEdit(c)}
                      onDelete={() => handleDelete(c.id)}
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




