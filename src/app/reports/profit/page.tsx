"use client";

import { useEffect, useState } from "react";

type ProfitSummary = {
  totalRevenue: number;
  totalCost: number;
  profit: number;
  profitMargin: number;
  totalInvoices: number;
  totalPurchases: number;
  averageOrderValue: number;
  averagePurchaseValue: number;
};

type MonthlyData = {
  month: string;
  monthName: string;
  revenue: number;
  cost: number;
  profit: number;
  profitMargin: number;
};

type TopProduct = {
  name: string;
  revenue: number;
  cost: number;
  profit: number;
  profitMargin: number;
  quantity: number;
};

type ProfitReport = {
  summary: ProfitSummary;
  monthlyData: MonthlyData[];
  topProducts: TopProduct[];
  dateRange: {
    start: string;
    end: string;
  };
};

export default function ProfitReportPage() {
  const [report, setReport] = useState<ProfitReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start: '2024-01-01',
    end: new Date().toISOString().split('T')[0]
  });

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        startDate: dateRange.start,
        endDate: dateRange.end
      });
      
      const response = await fetch(`/api/reports/profit?${params}`);
      if (!response.ok) {
        throw new Error("Không thể tải báo cáo lợi nhuận");
      }
      
      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [dateRange]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(cents);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải báo cáo lợi nhuận...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Lỗi tải dữ liệu</p>
          <p>{error}</p>
          <button
            onClick={loadReport}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="text-center text-gray-600">
          <p>Không có dữ liệu báo cáo</p>
        </div>
      </div>
    );
  }

  const { summary, monthlyData, topProducts } = report;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        {/* Header với gradient đẹp */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative px-8 py-12">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  <span className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    📊
                  </span>
                  Báo cáo lợi nhuận
                </h1>
                <p className="text-blue-100 text-lg">Phân tích hiệu quả kinh doanh và xu hướng tài chính</p>
              </div>
              <div className="flex gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <label className="block text-white text-sm font-medium mb-2">Từ ngày</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="px-4 py-2 bg-white/90 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-800"
                  />
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <label className="block text-white text-sm font-medium mb-2">Đến ngày</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="px-4 py-2 bg-white/90 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-800"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tổng quan với thiết kế đẹp */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Doanh thu */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="text-right">
                  <p className="text-emerald-100 text-sm font-medium">Tổng doanh thu</p>
                  <p className="text-3xl font-bold text-white">
                    {formatCurrency(summary.totalRevenue)}
                  </p>
                </div>
              </div>
              <div className="flex items-center text-emerald-100 text-sm">
                <span className="w-2 h-2 bg-emerald-300 rounded-full mr-2"></span>
                Thu nhập từ bán hàng
              </div>
            </div>
          </div>

          {/* Chi phí */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                <div className="text-right">
                  <p className="text-red-100 text-sm font-medium">Tổng chi phí</p>
                  <p className="text-3xl font-bold text-white">
                    {formatCurrency(summary.totalCost)}
                  </p>
                </div>
              </div>
              <div className="flex items-center text-red-100 text-sm">
                <span className="w-2 h-2 bg-red-300 rounded-full mr-2"></span>
                Chi phí nhập hàng
              </div>
            </div>
          </div>

          {/* Lợi nhuận */}
          <div className={`group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${
            summary.profit >= 0 
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
              : 'bg-gradient-to-br from-orange-500 to-amber-600'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="text-right">
                  <p className="text-white/80 text-sm font-medium">Lợi nhuận</p>
                  <p className="text-3xl font-bold text-white">
                    {formatCurrency(summary.profit)}
                  </p>
                </div>
              </div>
              <div className="flex items-center text-white/80 text-sm">
                <span className={`w-2 h-2 rounded-full mr-2 ${summary.profit >= 0 ? 'bg-blue-300' : 'bg-orange-300'}`}></span>
                {summary.profit >= 0 ? 'Lãi' : 'Lỗ'}
              </div>
            </div>
          </div>

          {/* Tỷ suất lợi nhuận */}
          <div className={`group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${
            summary.profitMargin >= 0 
              ? 'bg-gradient-to-br from-purple-500 to-violet-600' 
              : 'bg-gradient-to-br from-yellow-500 to-orange-500'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="text-right">
                  <p className="text-white/80 text-sm font-medium">Tỷ suất lợi nhuận</p>
                  <p className="text-3xl font-bold text-white">
                    {formatPercent(summary.profitMargin)}
                  </p>
                </div>
              </div>
              <div className="flex items-center text-white/80 text-sm">
                <span className={`w-2 h-2 rounded-full mr-2 ${summary.profitMargin >= 0 ? 'bg-purple-300' : 'bg-yellow-300'}`}></span>
                Hiệu quả kinh doanh
              </div>
            </div>
          </div>
        </div>

        {/* Thống kê bổ sung với thiết kế đẹp */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Số hóa đơn</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalInvoices}</p>
              </div>
            </div>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Số phiếu nhập</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalPurchases}</p>
              </div>
            </div>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Giá trị TB/đơn</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.averageOrderValue)}</p>
              </div>
            </div>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Chi phí TB/nhập</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.averagePurchaseValue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Biểu đồ xu hướng theo tháng với thiết kế đẹp */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="p-2 bg-white/20 rounded-lg">
                📈
              </span>
              Xu hướng lợi nhuận theo tháng
            </h2>
            <p className="text-indigo-100 mt-2">Theo dõi biến động doanh thu và chi phí theo thời gian</p>
          </div>
          <div className="p-8">
            <div className="space-y-6">
              {monthlyData.map((month, index) => (
                <div key={month.month} className="group relative overflow-hidden bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-gray-400">#{String(index + 1).padStart(2, '0')}</span>
                          <h3 className="text-xl font-bold text-gray-900">{month.monthName}</h3>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          month.profit >= 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {month.profit >= 0 ? '📈 Lãi' : '📉 Lỗ'}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                          <div>
                            <p className="text-sm text-gray-600">Doanh thu</p>
                            <p className="text-lg font-bold text-emerald-600">{formatCurrency(month.revenue)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div>
                            <p className="text-sm text-gray-600">Chi phí</p>
                            <p className="text-lg font-bold text-red-600">{formatCurrency(month.cost)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${month.profit >= 0 ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                          <div>
                            <p className="text-sm text-gray-600">Lợi nhuận</p>
                            <p className={`text-lg font-bold ${month.profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                              {formatCurrency(month.profit)}
                            </p>
                            <p className={`text-sm ${month.profitMargin >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                              {formatPercent(month.profitMargin)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-8">
                      <div className="w-48 h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${
                            month.profit >= 0 
                              ? 'bg-gradient-to-r from-blue-400 to-blue-600' 
                              : 'bg-gradient-to-r from-orange-400 to-orange-600'
                          }`}
                          style={{ 
                            width: `${Math.min(100, Math.max(5, Math.abs(month.profitMargin)))}%` 
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Tỷ suất lợi nhuận: {formatPercent(month.profitMargin)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {monthlyData.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Chưa có dữ liệu</h3>
                  <p className="text-gray-500">Không có dữ liệu trong khoảng thời gian đã chọn</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top sản phẩm có lợi nhuận cao với thiết kế đẹp */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="p-2 bg-white/20 rounded-lg">
                🏆
              </span>
              Top sản phẩm có lợi nhuận cao
            </h2>
            <p className="text-amber-100 mt-2">Phân tích hiệu quả từng sản phẩm trong kinh doanh</p>
          </div>
          <div className="p-8">
            {topProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Xếp hạng</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Sản phẩm</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Doanh thu</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Chi phí</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Lợi nhuận</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Tỷ suất</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Số lượng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {topProducts.map((product, index) => (
                      <tr key={product.name} className="group hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300">
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0 ? 'bg-yellow-100 text-yellow-800' :
                              index === 1 ? 'bg-gray-100 text-gray-800' :
                              index === 2 ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {index + 1}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-4">
                              {product.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                            <span className="text-sm font-semibold text-emerald-600">{formatCurrency(product.revenue)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                            <span className="text-sm font-semibold text-red-600">{formatCurrency(product.cost)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${product.profit >= 0 ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                            <span className={`text-sm font-bold ${product.profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                              {formatCurrency(product.profit)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            product.profitMargin >= 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {formatPercent(product.profitMargin)}
                          </span>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{product.quantity}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Chưa có dữ liệu sản phẩm</h3>
                <p className="text-gray-500">Không có dữ liệu sản phẩm để phân tích</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
