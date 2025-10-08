"use client";

import { useEffect, useMemo, useState } from "react";

type Product = { id: string; name: string; priceCents: number; quantity: number; unit?: "PCS" | "M2"; quantityScale?: number };
type Customer = { id: string; name: string };

export default function NewInvoicePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Array<{ productId: string; quantity: number; widthM?: number; heightM?: number }>>([]);
  const [discountCents, setDiscountCents] = useState<number>(0);
  const [taxCents, setTaxCents] = useState<number>(0);
  const [customerName, setCustomerName] = useState<string>("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    priceCents: 0,
    quantity: 0,
    unit: 'PCS' as 'PCS' | 'M2',
    quantityScale: 1
  });
  const [showTempProductForm, setShowTempProductForm] = useState(false);
  const [tempProduct, setTempProduct] = useState({
    name: '',
    priceCents: 0,
    unit: 'PCS' as 'PCS' | 'M2',
    quantityScale: 1
  });
  const [tempProducts, setTempProducts] = useState<Array<{ id: string; name: string; priceCents: number; unit: 'PCS' | 'M2'; quantityScale: number }>>([]);

  useEffect(() => {
    fetch("/api/products").then(async (r) => {
      const data = await r.json();
      console.log("All products:", data);
      setProducts(data);
    });
    fetch("/api/customers").then(async (r) => setCustomers(await r.json()));
  }, []);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, ci) => {
      const p = products.find((x) => x.id === ci.productId);
      const tempP = tempProducts.find((x) => x.id === ci.productId);
      const product = p || tempP;
      if (!product) return sum;
      return sum + product.priceCents * ci.quantity;
    }, 0);
  }, [cart, products, tempProducts]);

  const total = Math.max(0, subtotal - discountCents + taxCents);

  const addToCart = (productId: string) => {
    setCart((c) => {
      const found = c.find((x) => x.productId === productId);
      if (found) {
        return c.map((x) => (x.productId === productId ? { ...x, quantity: x.quantity + 1 } : x));
      }
      const p = products.find((x) => x.id === productId);
      if (p?.unit === "M2") {
        // default 1m x 1m => 1 m²
        const scale = p.quantityScale || 1;
        return [...c, { productId, quantity: 1 * scale, widthM: 1, heightM: 1 }];
      }
      return [...c, { productId, quantity: 1 }];
    });
  };

  const addTempProductToCart = (tempProductId: string) => {
    setCart((c) => {
      const found = c.find((x) => x.productId === tempProductId);
      if (found) {
        return c.map((x) => (x.productId === tempProductId ? { ...x, quantity: x.quantity + 1 } : x));
      }
      const p = tempProducts.find((x) => x.id === tempProductId);
      if (p?.unit === "M2") {
        // default 1m x 1m => 1 m²
        const scale = p.quantityScale || 1;
        return [...c, { productId: tempProductId, quantity: 1 * scale, widthM: 1, heightM: 1 }];
      }
      return [...c, { productId: tempProductId, quantity: 1 }];
    });
  };

  const createNewProduct = async () => {
    if (!newProduct.name || newProduct.priceCents <= 0) {
      alert("Vui lòng điền đầy đủ thông tin sản phẩm");
      return;
    }

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProduct),
      });

      if (response.ok) {
        const createdProduct = await response.json();
        setProducts(prev => [...prev, createdProduct]);
        setNewProduct({ name: '', priceCents: 0, quantity: 0, unit: 'PCS', quantityScale: 1 });
        setShowNewProductForm(false);
        
        // Tự động thêm sản phẩm mới vào giỏ hàng
        addToCart(createdProduct.id);
      } else {
        const error = await response.json();
        alert(error.error || "Không thể tạo sản phẩm mới");
      }
    } catch (err) {
      alert("Có lỗi xảy ra khi tạo sản phẩm mới");
    }
  };

  const cancelNewProduct = () => {
    setNewProduct({ name: '', priceCents: 0, quantity: 0, unit: 'PCS', quantityScale: 1 });
    setShowNewProductForm(false);
  };

  const createTempProduct = () => {
    if (!tempProduct.name || tempProduct.priceCents <= 0) {
      alert("Vui lòng điền đầy đủ thông tin sản phẩm");
      return;
    }

    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTempProduct = {
      id: tempId,
      name: tempProduct.name,
      priceCents: tempProduct.priceCents,
      unit: tempProduct.unit,
      quantityScale: tempProduct.quantityScale
    };

    setTempProducts(prev => [...prev, newTempProduct]);
    setTempProduct({ name: '', priceCents: 0, unit: 'PCS', quantityScale: 1 });
    setShowTempProductForm(false);
    
    // Tự động thêm sản phẩm tạm thời vào giỏ hàng
    addTempProductToCart(tempId);
  };

  const cancelTempProduct = () => {
    setTempProduct({ name: '', priceCents: 0, unit: 'PCS', quantityScale: 1 });
    setShowTempProductForm(false);
  };

  const setQty = (productId: string, qty: number) => {
    setCart((c) => c.map((x) => (x.productId === productId ? { ...x, quantity: Math.max(0, qty) } : x)).filter((x) => x.quantity > 0));
  };

  const save = async () => {
    setSaving(true);
    
    // Chuyển đổi sản phẩm tạm thời thành sản phẩm thực
    const processedItems = cart.map(ci => {
      const tempP = tempProducts.find((x) => x.id === ci.productId);
      if (tempP) {
        // Sản phẩm tạm thời - gửi thông tin đầy đủ
        return {
          ...ci,
          product: {
            name: tempP.name,
            priceCents: tempP.priceCents,
            unit: tempP.unit,
            quantityScale: tempP.quantityScale
          }
        };
      }
      // Sản phẩm thường - chỉ gửi ID
      return ci;
    });

    const body = {
      customer: selectedCustomerId ? { id: selectedCustomerId } : (customerName ? { name: customerName } : undefined),
      items: processedItems,
      discountCents,
      taxCents,
      paid: false,
    };
    
    const res = await fetch("/api/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) {
      setCart([]);
      setTempProducts([]);
      setCustomerName("");
      setDiscountCents(0);
      setTaxCents(0);
      alert("Đã lưu hóa đơn");
    } else {
      const e = await res.json();
      alert(e?.error ?? "Lỗi lưu hóa đơn");
    }
    setSaving(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold">Tạo hóa đơn</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="border rounded">
            <div className="p-3 border-b font-medium flex items-center justify-between">
              <span>Chọn sản phẩm</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowTempProductForm(true)}
                  className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700"
                >
                  + Sản phẩm tạm thời
                </button>
                <button
                  onClick={() => setShowNewProductForm(true)}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  + Tạo sản phẩm mới
                </button>
              </div>
            </div>
            <div className="p-3 grid md:grid-cols-3 gap-3">
              {/* Sản phẩm thường */}
              {products.map((p) => (
                <button key={p.id} onClick={() => addToCart(p.id)} className="text-left border rounded p-3 hover:bg-gray-50">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-gray-600">{p.priceCents.toLocaleString()} VND</div>
                </button>
              ))}
              
              {/* Sản phẩm tạm thời */}
              {tempProducts.map((p) => (
                <button key={p.id} onClick={() => addTempProductToCart(p.id)} className="text-left border rounded p-3 hover:bg-orange-50 border-orange-200">
                  <div className="font-medium flex items-center gap-1">
                    {p.name}
                    <span className="text-xs bg-orange-100 text-orange-800 px-1 py-0.5 rounded">Tạm thời</span>
                  </div>
                  <div className="text-sm text-gray-600">{p.priceCents.toLocaleString()} VND</div>
                </button>
              ))}
            </div>
          </div>

          {showNewProductForm && (
            <div className="border rounded p-4 bg-gray-50">
              <h3 className="font-medium mb-3">Tạo sản phẩm mới</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tên sản phẩm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VND)</label>
                  <input
                    type="number"
                    min="0"
                    value={newProduct.priceCents}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, priceCents: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập giá sản phẩm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng tồn kho</label>
                  <input
                    type="number"
                    min="0"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập số lượng tồn kho"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị</label>
                  <select
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, unit: e.target.value as 'PCS' | 'M2' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PCS">Cái (PCS)</option>
                    <option value="M2">Mét vuông (M²)</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={createNewProduct}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Tạo và thêm vào giỏ
                </button>
                <button
                  onClick={cancelNewProduct}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}

          {showTempProductForm && (
            <div className="border rounded p-4 bg-orange-50">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <span className="text-orange-600">Tạo sản phẩm tạm thời</span>
                <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded">Chỉ cho đơn hàng này</span>
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                  <input
                    type="text"
                    value={tempProduct.name}
                    onChange={(e) => setTempProduct(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Nhập tên sản phẩm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VND)</label>
                  <input
                    type="number"
                    min="0"
                    value={tempProduct.priceCents}
                    onChange={(e) => setTempProduct(prev => ({ ...prev, priceCents: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Nhập giá sản phẩm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị</label>
                  <select
                    value={tempProduct.unit}
                    onChange={(e) => setTempProduct(prev => ({ ...prev, unit: e.target.value as 'PCS' | 'M2' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="PCS">Cái (PCS)</option>
                    <option value="M2">Mét vuông (M²)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tỷ lệ quy đổi (M²)</label>
                  <input
                    type="number"
                    min="1"
                    value={tempProduct.quantityScale}
                    onChange={(e) => setTempProduct(prev => ({ ...prev, quantityScale: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="1"
                    disabled={tempProduct.unit === 'PCS'}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={createTempProduct}
                  className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                >
                  Tạo và thêm vào giỏ
                </button>
                <button
                  onClick={cancelTempProduct}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}

          <div className="border rounded">
            <div className="p-3 border-b font-medium">Giỏ hàng</div>
            <div className="p-3">
              {cart.length === 0 ? (
                <div className="text-sm text-gray-600">Chưa có sản phẩm</div>
              ) : (
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
                    {cart.map((ci) => {
                      const p = products.find((x) => x.id === ci.productId);
                      const tempP = tempProducts.find((x) => x.id === ci.productId);
                      const product = p || tempP;
                      const isTemp = !!tempP;
                      console.log("Product:", product?.name, "Unit:", product?.unit, "Is M2:", product?.unit === "M2", "Is Temp:", isTemp);
                      return (
                        <tr key={ci.productId} className="border-t">
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <span>{product?.name}</span>
                              {isTemp && (
                                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded">Tạm thời</span>
                              )}
                            </div>
                          </td>
                          <td className="p-2">{product?.priceCents.toLocaleString()} VND</td>
                          <td className="p-2 w-24">
                            {product?.unit === "M2" ? (
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    placeholder="Dài"
                                    className="border rounded px-1 py-1 w-16 text-xs"
                                    value={ci.widthM ?? ""}
                                    onChange={(e) => {
                                      const widthM = Number(e.target.value || 0);
                                      const heightM = ci.heightM ?? 0;
                                      const area = widthM * heightM;
                                      const scaled = Math.round(area * (product.quantityScale || 1));
                                      setCart((c) => c.map((x) => x.productId === ci.productId ? { ...x, widthM, quantity: scaled } : x));
                                    }}
                                  />
                                  <span className="text-xs">×</span>
                                  <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    placeholder="Rộng"
                                    className="border rounded px-1 py-1 w-16 text-xs"
                                    value={ci.heightM ?? ""}
                                    onChange={(e) => {
                                      const heightM = Number(e.target.value || 0);
                                      const widthM = ci.widthM ?? 0;
                                      const area = widthM * heightM;
                                      const scaled = Math.round(area * (product.quantityScale || 1));
                                      setCart((c) => c.map((x) => x.productId === ci.productId ? { ...x, heightM, quantity: scaled } : x));
                                    }}
                                  />
                                  <span className="text-xs">m</span>
                                </div>
                                <div className="text-xs text-gray-600">
                                  {((ci.quantity) / (product.quantityScale || 1)).toFixed(2)} m²
                                </div>
                              </div>
                            ) : (
                              <input
                                type="number"
                                min={0}
                                className="border rounded px-2 py-1 w-24"
                                value={ci.quantity}
                                onChange={(e) => setQty(ci.productId, Number(e.target.value || 0))}
                              />
                            )}
                          </td>
                          <td className="p-2">{((product?.priceCents || 0) * (ci.quantity)).toLocaleString()} VND</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border rounded p-3 space-y-3">
            <div className="flex flex-col gap-2">
              <label className="text-sm">Khách hàng</label>
              <select
                className="border rounded px-3 py-2"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                <option value="">-- Khách lẻ / Tạo mới --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {!selectedCustomerId && (
                <input className="border rounded px-3 py-2" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Tên khách (nếu tạo mới)" />
              )}
              <a href="/customers" className="text-blue-600 text-sm hover:underline">Quản lý khách hàng</a>
            </div>
            <div className="flex items-center justify-between">
              <span>Tạm tính</span>
              <span>{subtotal.toLocaleString()} VND</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Giảm giá</span>
              <input
                type="number"
                min={0}
                className="border rounded px-2 py-1 w-32 text-right"
                value={discountCents}
                onChange={(e) => setDiscountCents(Number(e.target.value || 0))}
              />
            </div>
            <div className="flex items-center justify-between">
              <span>Thuế</span>
              <input
                type="number"
                min={0}
                className="border rounded px-2 py-1 w-32 text-right"
                value={taxCents}
                onChange={(e) => setTaxCents(Number(e.target.value || 0))}
              />
            </div>
            <div className="flex items-center justify-between font-semibold">
              <span>Tổng</span>
              <span>{total.toLocaleString()} VND</span>
            </div>
            <button onClick={save} disabled={saving || cart.length === 0} className="w-full bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50">
              {saving ? "Đang lưu..." : "Lưu hóa đơn"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


