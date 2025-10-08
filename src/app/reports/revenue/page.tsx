"use client";

import { useEffect, useState } from "react";

type Row = { period: string; totalCents: number; costCents: number; profitCents: number };

export default function RevenueReportPage() {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
  const end = new Date().toISOString().slice(0, 10);

  const [from, setFrom] = useState<string>(start);
  const [to, setTo] = useState<string>(end);
  const [group, setGroup] = useState<"day" | "month">("day");
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState<{ revenue: number; cost: number; profit: number }>({ revenue: 0, cost: 0, profit: 0 });

  const load = async () => {
    const url = new URL("/api/reports/revenue", window.location.origin);
    url.searchParams.set("from", from);
    url.searchParams.set("to", to);
    url.searchParams.set("group", group);
    const res = await fetch(url.toString());
    const data = await res.json();
    setRows(data.data);
    setTotal({ 
      revenue: data.totalCents, 
      cost: data.costCents, 
      profit: data.profitCents 
    });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Báo cáo doanh thu</h1>
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col">
          <label className="text-sm">Từ ngày</label>
          <input type="date" className="border rounded px-3 py-2" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="flex flex-col">
          <label className="text-sm">Đến ngày</label>
          <input type="date" className="border rounded px-3 py-2" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="flex flex-col">
          <label className="text-sm">Nhóm theo</label>
          <select className="border rounded px-3 py-2" value={group} onChange={(e) => setGroup(e.target.value as "day" | "month")}>
            <option value="day">Ngày</option>
            <option value="month">Tháng</option>
          </select>
        </div>
        <button onClick={load} className="bg-blue-600 text-white px-4 py-2 rounded">Xem</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="text-2xl font-bold text-blue-600">{total.revenue.toLocaleString()} VND</div>
          <div className="text-sm text-gray-600">Tổng doanh thu</div>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="text-2xl font-bold text-red-600">{total.cost.toLocaleString()} VND</div>
          <div className="text-sm text-gray-600">Tổng chi phí</div>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className={`text-2xl font-bold ${total.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {total.profit.toLocaleString()} VND
          </div>
          <div className="text-sm text-gray-600">Tổng lợi nhuận</div>
        </div>
      </div>

      <div className="border rounded">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-2">Kỳ</th>
              <th className="p-2">Doanh thu</th>
              <th className="p-2">Chi phí</th>
              <th className="p-2">Lợi nhuận</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td className="p-2" colSpan={4}>Không có dữ liệu</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.period} className="border-t">
                  <td className="p-2">{r.period}</td>
                  <td className="p-2">{r.totalCents.toLocaleString()} VND</td>
                  <td className="p-2">{r.costCents.toLocaleString()} VND</td>
                  <td className="p-2">
                    <span className={r.profitCents >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {r.profitCents.toLocaleString()} VND
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="text-right font-semibold">
        Tổng doanh thu: {total.revenue.toLocaleString()} VND | 
        Tổng chi phí: {total.cost.toLocaleString()} VND | 
        <span className={total.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
          Tổng lợi nhuận: {total.profit.toLocaleString()} VND
        </span>
      </div>
    </div>
  );
}




