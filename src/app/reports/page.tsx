"use client";

import { useEffect, useState } from "react";
import Loading from "@/components/Loading";

type Summary = { 
  products: number; 
  customers: number; 
  invoices: number; 
  purchases: number; 
  materials: number;
  income: number; 
  expense: number; 
  balance: number 
};

export default function ReportsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
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
        setSummary(data);
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
        <h1 className="text-2xl font-semibold">Báo cáo & Thống kê</h1>
        <Loading text="Đang tải dữ liệu..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold">Báo cáo & Thống kê</h1>
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Báo cáo & Thống kê</h1>
        <a 
          href="/" 
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          ← Trang chủ
        </a>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded p-4 hover:shadow-md transition-shadow">
          <div className="text-sm text-gray-600">Vật liệu</div>
          <div className="text-2xl font-semibold">{summary?.materials ?? 0}</div>
        </div>
        <div className="bg-white border rounded p-4 hover:shadow-md transition-shadow">
          <div className="text-sm text-gray-600">Sản phẩm</div>
          <div className="text-2xl font-semibold">{summary?.products ?? 0}</div>
        </div>
        <div className="bg-white border rounded p-4 hover:shadow-md transition-shadow">
          <div className="text-sm text-gray-600">Nhập hàng</div>
          <div className="text-2xl font-semibold">{summary?.purchases ?? 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded p-4 hover:shadow-md transition-shadow">
          <div className="text-sm text-gray-600">Khách hàng</div>
          <div className="text-2xl font-semibold">{summary?.customers ?? 0}</div>
        </div>
        <div className="bg-white border rounded p-4 hover:shadow-md transition-shadow">
          <div className="text-sm text-gray-600">Hóa đơn</div>
          <div className="text-2xl font-semibold">{summary?.invoices ?? 0}</div>
        </div>
        <div className="bg-white border rounded p-4 hover:shadow-md transition-shadow">
          <div className="text-sm text-gray-600">Số dư</div>
          <div className={`text-2xl font-semibold ${(summary?.balance ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {(summary?.balance ?? 0).toLocaleString()} VND
          </div>
        </div>
      </div>

      {/* Quick Access to Main Reports */}
      <div className="bg-gradient-to-r from-blue-50 to-orange-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-center">📊 Báo cáo chính</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a 
            href="/reports/purchases" 
            className="bg-orange-600 text-white px-6 py-4 rounded-lg hover:bg-orange-700 text-center font-medium text-lg shadow-md hover:shadow-lg transition-all"
          >
            📥 Báo cáo nhập hàng
          </a>
          <a 
            href="/reports/materials" 
            className="bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 text-center font-medium text-lg shadow-md hover:shadow-lg transition-all"
          >
            📦 Báo cáo tồn kho
          </a>
          <a 
            href="/reports/revenue" 
            className="bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 text-center font-medium text-lg shadow-md hover:shadow-lg transition-all"
          >
            💰 Báo cáo doanh thu
          </a>
          <a 
            href="/reports/profit" 
            className="bg-purple-600 text-white px-6 py-4 rounded-lg hover:bg-purple-700 text-center font-medium text-lg shadow-md hover:shadow-lg transition-all"
          >
            📈 Báo cáo lợi nhuận
          </a>
        </div>
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Financial Reports */}
        <div className="bg-white border rounded p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">💰</span>
            <h2 className="text-xl font-semibold">Báo cáo tài chính</h2>
          </div>
          <p className="text-gray-600 text-sm mb-4">Theo dõi doanh thu, chi phí và lợi nhuận</p>
          <div className="space-y-2">
            <a 
              href="/reports/revenue" 
              className="block w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center font-medium"
            >
              📈 Xem báo cáo doanh thu
            </a>
            <a 
              href="/reports/profit" 
              className="block w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-center font-medium"
            >
              📊 Xem báo cáo lợi nhuận
            </a>
            <a 
              href="/cashflow" 
              className="block w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-center"
            >
              Dòng tiền
            </a>
          </div>
        </div>

        {/* Inventory Reports */}
        <div className="bg-white border rounded p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">📦</span>
            <h2 className="text-xl font-semibold">Báo cáo tồn kho</h2>
          </div>
          <p className="text-gray-600 text-sm mb-4">Quản lý vật liệu và sản phẩm</p>
          <div className="space-y-2">
            <a 
              href="/reports/materials" 
              className="block w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-center font-medium"
            >
              📦 Xem báo cáo tồn kho vật liệu
            </a>
            <a 
              href="/products" 
              className="block w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-center"
            >
              Tồn kho sản phẩm
            </a>
          </div>
        </div>

        {/* Operations Reports */}
        <div className="bg-white border rounded p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">📥</span>
            <h2 className="text-xl font-semibold">Báo cáo nhập hàng</h2>
          </div>
          <p className="text-gray-600 text-sm mb-4">Theo dõi chi phí nhập hàng và nhà cung cấp</p>
          <div className="space-y-2">
            <a 
              href="/reports/purchases" 
              className="block w-full bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 text-center font-medium"
            >
              📊 Xem báo cáo nhập hàng
            </a>
          </div>
        </div>

        {/* Sales Reports */}
        <div className="bg-white border rounded p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">📈</span>
            <h2 className="text-xl font-semibold">Báo cáo bán hàng</h2>
          </div>
          <p className="text-gray-600 text-sm mb-4">Phân tích hiệu quả bán hàng</p>
          <div className="space-y-2">
            <a 
              href="/invoices" 
              className="block w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-center"
            >
              Danh sách hóa đơn
            </a>
            <a 
              href="/customers" 
              className="block w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-center"
            >
              Khách hàng
            </a>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border rounded p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">⚡</span>
            <h2 className="text-xl font-semibold">Thao tác nhanh</h2>
          </div>
          <p className="text-gray-600 text-sm mb-4">Các chức năng thường dùng</p>
          <div className="space-y-2">
            <a 
              href="/invoices/new" 
              className="block w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-center"
            >
              Tạo hóa đơn mới
            </a>
            <a 
              href="/purchases" 
              className="block w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center"
            >
              Nhập hàng
            </a>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white border rounded p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">📊</span>
            <h2 className="text-xl font-semibold">Trạng thái hệ thống</h2>
          </div>
          <p className="text-gray-600 text-sm mb-4">Tổng quan hoạt động</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Tổng doanh thu</span>
              <span className="font-semibold text-green-600">
                {(summary?.income ?? 0).toLocaleString()} VND
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Tổng chi phí</span>
              <span className="font-semibold text-red-600">
                {(summary?.expense ?? 0).toLocaleString()} VND
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Lợi nhuận</span>
              <span className={`font-semibold ${(summary?.balance ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(summary?.balance ?? 0).toLocaleString()} VND
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
