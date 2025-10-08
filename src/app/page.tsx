"use client";

import { useEffect, useState } from "react";
import Loading from "@/components/Loading";

type Summary = { products: number; customers: number; invoices: number; purchases: number; materials: number; income: number; expense: number; balance: number };

export default function Home() {
  const [sum, setSum] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/summary");
        if (!response.ok) {
          throw new Error('Không thể tải dữ liệu tổng quan');
        }
        const data = await response.json();
        setSum(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold">Tổng quan</h1>
        <Loading text="Đang tải dữ liệu..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold">Tổng quan</h1>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <div className="text-red-800 font-medium">Lỗi tải dữ liệu</div>
          <div className="text-red-600 text-sm mt-1">{error}</div>
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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold">Tổng quan</h1>

      <div className="grid md:grid-cols-5 gap-3">
        <div className="border rounded p-4 hover:shadow-md transition-shadow">
          <div className="text-sm text-gray-600">Vật liệu</div>
          <div className="text-2xl font-semibold">{sum?.materials ?? 0}</div>
        </div>
        <div className="border rounded p-4 hover:shadow-md transition-shadow">
          <div className="text-sm text-gray-600">Sản phẩm</div>
          <div className="text-2xl font-semibold">{sum?.products ?? 0}</div>
        </div>
        <div className="border rounded p-4 hover:shadow-md transition-shadow">
          <div className="text-sm text-gray-600">Nhập hàng</div>
          <div className="text-2xl font-semibold">{sum?.purchases ?? 0}</div>
        </div>
        <div className="border rounded p-4 hover:shadow-md transition-shadow">
          <div className="text-sm text-gray-600">Khách hàng</div>
          <div className="text-2xl font-semibold">{sum?.customers ?? 0}</div>
        </div>
        <div className="border rounded p-4 hover:shadow-md transition-shadow">
          <div className="text-sm text-gray-600">Hóa đơn</div>
          <div className="text-2xl font-semibold">{sum?.invoices ?? 0}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <div className="border rounded p-4 hover:shadow-md transition-shadow">
          <div className="text-sm text-gray-600">Thu</div>
          <div className="text-2xl font-semibold text-green-600">{(sum?.income ?? 0).toLocaleString()} VND</div>
        </div>
        <div className="border rounded p-4 hover:shadow-md transition-shadow">
          <div className="text-sm text-gray-600">Chi</div>
          <div className="text-2xl font-semibold text-red-600">{(sum?.expense ?? 0).toLocaleString()} VND</div>
        </div>
        <div className="border rounded p-4 hover:shadow-md transition-shadow">
          <div className="text-sm text-gray-600">Số dư</div>
          <div className={`text-2xl font-semibold ${(sum?.balance ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {(sum?.balance ?? 0).toLocaleString()} VND
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-8 gap-3">
        <a href="/materials" className="border rounded p-4 hover:bg-gray-50 hover:shadow-md transition-all flex items-center justify-center text-center">
          <span>🧱 Vật liệu</span>
        </a>
        <a href="/products" className="border rounded p-4 hover:bg-gray-50 hover:shadow-md transition-all flex items-center justify-center text-center">
          <span>📦 Sản phẩm</span>
        </a>
        <a href="/invoices/new" className="border rounded p-4 hover:bg-gray-50 hover:shadow-md transition-all flex items-center justify-center text-center">
          <span>📝 Tạo hóa đơn</span>
        </a>
        <a href="/invoices" className="border rounded p-4 hover:bg-gray-50 hover:shadow-md transition-all flex items-center justify-center text-center">
          <span>🧾 Danh sách hóa đơn</span>
        </a>
        <a href="/purchases" className="border rounded p-4 hover:bg-gray-50 hover:shadow-md transition-all flex items-center justify-center text-center">
          <span>📥 Nhập hàng</span>
        </a>
        <a href="/customers" className="border rounded p-4 hover:bg-gray-50 hover:shadow-md transition-all flex items-center justify-center text-center">
          <span>👥 Khách hàng</span>
        </a>
        <a href="/cashflow" className="border rounded p-4 hover:bg-gray-50 hover:shadow-md transition-all flex items-center justify-center text-center">
          <span>💰 Nguồn tiền</span>
        </a>
        <a href="/reports" className="border rounded p-4 hover:bg-gray-50 hover:shadow-md transition-all flex items-center justify-center text-center">
          <span>📊 Báo cáo</span>
        </a>
      </div>
    </div>
  );
}
