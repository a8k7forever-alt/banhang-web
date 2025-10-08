import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import UserMenu from "@/components/UserMenu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bán hàng",
  description: "Quản lý bán hàng, hóa đơn, nguồn tiền",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <header className="border-b">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
              <a href="/" className="font-semibold">Bán hàng</a>
              <div className="flex items-center gap-4">
                <nav className="flex gap-4 text-sm">
                  <a className="hover:underline" href="/materials">Vật liệu</a>
                  <a className="hover:underline" href="/products">Sản phẩm</a>
                  <a className="hover:underline" href="/customers">Khách hàng</a>
                  <a className="hover:underline" href="/invoices">Hóa đơn</a>
                  <a className="hover:underline" href="/invoices/new">Tạo hóa đơn</a>
                  <a className="hover:underline" href="/purchases">Nhập hàng</a>
                  <a className="hover:underline" href="/cashflow">Nguồn tiền</a>
                  <a className="hover:underline" href="/reports">Báo cáo</a>
                  <a className="hover:underline text-red-600 font-medium" href="/admin">Admin</a>
                </nav>
                <UserMenu />
              </div>
            </div>
          </header>
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
