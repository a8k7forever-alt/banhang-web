"use client";

import { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import ActionButtons from "@/components/ActionButtons";
import ProtectedRoute from "@/components/ProtectedRoute";

type InvoiceItem = {
  id: string;
  quantity: number;
  priceCents: number;
  product: {
    id: string;
    name: string;
    priceCents: number;
  };
};

type Invoice = { 
  id: string; 
  code?: string | null; 
  totalCents: number; 
  status: string; 
  createdAt: string; 
  customer?: { id: string; name: string };
  items?: InvoiceItem[];
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string; priceCents: number; quantity: number }[]>([]);
  const [editFormData, setEditFormData] = useState({
    customerId: '',
    status: '',
    items: [] as Array<{ productId: string; quantity: number; priceCents: number }>
  });

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/invoices");
      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
      } else {
        setError("Không thể tải danh sách hóa đơn");
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await fetch("/api/customers");
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (err) {
      console.error("Error loading customers:", err);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Error loading products:", err);
    }
  };

  const loadInvoiceDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/invoices/${id}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (err) {
      console.error("Error loading invoice details:", err);
    }
    return null;
  };

  const handleEdit = async (invoice: Invoice) => {
    try {
      setLoading(true);
      const invoiceDetails = await loadInvoiceDetails(invoice.id);
      if (invoiceDetails) {
        setEditingInvoice(invoiceDetails);
        setEditFormData({
          customerId: invoiceDetails.customer?.id || '',
          status: invoiceDetails.status,
          items: invoiceDetails.items?.map((item: InvoiceItem) => ({
            productId: item.product.id,
            quantity: item.quantity,
            priceCents: item.priceCents
          })) || []
        });
        setShowEditForm(true);
      }
    } catch (err) {
      setError("Không thể tải chi tiết hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingInvoice(null);
    setShowEditForm(false);
    setEditFormData({ customerId: '', status: '', items: [] });
  };

  const addItem = () => {
    setEditFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1, priceCents: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    setEditFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setEditFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateTotal = () => {
    return editFormData.items.reduce((total, item) => 
      total + (item.quantity * item.priceCents), 0
    );
  };

  const handleUpdateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;

    try {
      setLoading(true);
      
      // Validate form data
      if (!editFormData.customerId) {
        setError("Vui lòng chọn khách hàng");
        return;
      }
      if (editFormData.items.length === 0) {
        setError("Vui lòng thêm ít nhất một sản phẩm");
        return;
      }

      const response = await fetch(`/api/invoices/${editingInvoice.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: editFormData.customerId,
          status: editFormData.status,
          items: editFormData.items
        }),
      });

      if (response.ok) {
        await loadInvoices();
        setShowEditForm(false);
        setEditingInvoice(null);
        setEditFormData({ customerId: '', status: '', items: [] });
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Không thể cập nhật hóa đơn");
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi cập nhật");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa hóa đơn này?")) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/invoices/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        await loadInvoices();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Không thể xóa hóa đơn");
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi xóa");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
    loadCustomers();
    loadProducts();
  }, []);

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Hóa đơn</h1>
          <a href="/invoices/new" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Tạo hóa đơn</a>
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

        {showEditForm && editingInvoice && (
          <div className="bg-white border rounded p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Chỉnh sửa hóa đơn</h2>
            <form onSubmit={handleUpdateInvoice} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã hóa đơn</label>
                  <input 
                    type="text" 
                    value={editingInvoice.code || editingInvoice.id.slice(-8)} 
                    disabled 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Khách hàng</label>
                  <select
                    value={editFormData.customerId}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, customerId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chọn khách hàng</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>{customer.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select 
                    value={editFormData.status}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PENDING">Chờ thanh toán</option>
                    <option value="PAID">Đã thanh toán</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tổng tiền</label>
                  <input 
                    type="text" 
                    value={`${calculateTotal().toLocaleString()} VND`} 
                    disabled 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Sản phẩm</h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Thêm sản phẩm
                  </button>
                </div>
                
                {editFormData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3 p-3 border rounded">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Sản phẩm</label>
                      <select
                        value={item.productId}
                        onChange={(e) => {
                          const product = products.find(p => p.id === e.target.value);
                          updateItem(index, 'productId', e.target.value);
                          if (product) {
                            updateItem(index, 'priceCents', product.priceCents);
                          }
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="">Chọn sản phẩm</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} ({product.priceCents.toLocaleString()} VND)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Số lượng</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Giá (VND)</label>
                      <input
                        type="number"
                        min="0"
                        value={item.priceCents}
                        onChange={(e) => updateItem(index, 'priceCents', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Đang cập nhật..." : "Cập nhật"}
                </button>
                <button 
                  type="button" 
                  onClick={handleCancelEdit}
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
              <th className="p-2">Mã</th>
              <th className="p-2">Khách hàng</th>
              <th className="p-2">Trạng thái</th>
              <th className="p-2">Tổng</th>
              <th className="p-2">Ngày</th>
              <th className="p-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-2" colSpan={6}>
                  <Loading text="Đang tải danh sách hóa đơn..." size="sm" />
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td className="p-2 text-center py-8 text-gray-500" colSpan={6}>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl">🧾</span>
                    <span>Chưa có hóa đơn nào</span>
                    <span className="text-sm">Hãy tạo hóa đơn đầu tiên</span>
                  </div>
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="border-t hover:bg-gray-50">
                  <td className="p-2 font-medium">
                    <a className="text-blue-600 hover:underline" href={`/invoices/${inv.id}`}>
                      {inv.code ?? inv.id.slice(-8)}
                    </a>
                  </td>
                  <td className="p-2">{inv.customer?.name ?? "Khách lẻ"}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      inv.status === "PAID" 
                        ? "bg-green-100 text-green-800" 
                        : inv.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {inv.status === "PAID" ? "Đã thanh toán" : 
                       inv.status === "PENDING" ? "Chờ thanh toán" : inv.status}
                    </span>
                  </td>
                  <td className="p-2 font-semibold">{inv.totalCents.toLocaleString()} VND</td>
                  <td className="p-2">{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td className="p-2">
                    <ActionButtons
                      onView={() => window.open(`/invoices/${inv.id}`, '_blank')}
                      onEdit={() => handleEdit(inv)}
                      onDelete={() => handleDelete(inv.id)}
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


