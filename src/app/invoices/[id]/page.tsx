"use client";

import { use, useEffect, useState } from "react";

type Item = { id: string; quantity: number; unitPriceCents: number; lineTotalCents: number; product: { name: string } };

type Invoice = { id: string; code?: string | null; createdAt: string; subtotalCents: number; discountCents: number; taxCents: number; totalCents: number; status: string; customer?: { name: string } | null; items: Item[] };

export default function InvoiceDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    fetch(`/api/invoices/${id}`).then(async (r) => setInvoice(await r.json()));
  }, [id]);

  if (!invoice) return <div className="p-6">Đang tải...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4 print:p-0">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Hóa đơn {invoice.code ?? ""}</h1>
        <div className="flex gap-2 print:hidden">
          {invoice.status === "DRAFT" && (
            <button
              onClick={async () => {
                const res = await fetch(`/api/invoices/pay/${invoice.id}`, { method: 'POST' });
                if (res.ok) {
                  const updated = await res.json();
                  setInvoice(updated);
                  alert('Đã thanh toán');
                } else {
                  const text = await res.text();
                  try {
                    const e = text ? JSON.parse(text) : undefined;
                    alert(`Lỗi thanh toán (${res.status}): ${(e?.error ?? text) || ''}`);
                  } catch {
                    alert(`Lỗi thanh toán (${res.status}): ${text || ''}`);
                  }
                }
              }}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >Thanh toán</button>
          )}
          <button onClick={() => window.print()} className="bg-gray-800 text-white px-4 py-2 rounded">In</button>
        </div>
      </div>

      <div className="border rounded p-3">
        <div><span className="text-gray-600">Khách hàng: </span>{invoice.customer?.name ?? "Khách lẻ"}</div>
        <div><span className="text-gray-600">Thời gian: </span>{new Date(invoice.createdAt).toLocaleString()}</div>
        <div><span className="text-gray-600">Trạng thái: </span>{invoice.status}</div>
      </div>

      <div className="border rounded">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-2">Sản phẩm</th>
              <th className="p-2">Đơn giá</th>
              <th className="p-2">SL</th>
              <th className="p-2">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((it) => (
              <tr key={it.id} className="border-t">
                <td className="p-2">{it.product.name}</td>
                <td className="p-2">{it.unitPriceCents.toLocaleString()} VND</td>
                <td className="p-2">{it.quantity}</td>
                <td className="p-2">{it.lineTotalCents.toLocaleString()} VND</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-end gap-1">
        <div>Tạm tính: {(invoice.subtotalCents).toLocaleString()} VND</div>
        <div>Giảm giá: {(invoice.discountCents).toLocaleString()} VND</div>
        <div>Thuế: {(invoice.taxCents).toLocaleString()} VND</div>
        <div className="text-lg font-semibold">Tổng: {(invoice.totalCents).toLocaleString()} VND</div>
      </div>
    </div>
  );
}
