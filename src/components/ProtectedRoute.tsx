"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
        return;
      }
      
      if (requireAdmin && !user.isAdmin) {
        router.push("/");
        return;
      }
    }
  }, [user, loading, requireAdmin, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requireAdmin && !user.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Không có quyền truy cập</h1>
          <p className="mt-2 text-gray-600">Bạn cần quyền quản trị viên để truy cập trang này.</p>
          <a href="/" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Về trang chủ
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

