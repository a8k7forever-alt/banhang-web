"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  if (!user) {
    return (
      <a 
        href="/login" 
        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
      >
        Đăng nhập
      </a>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 text-sm hover:bg-gray-100 px-3 py-1 rounded"
      >
        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <span>{user.name}</span>
        {user.isAdmin && (
          <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded">
            Admin
          </span>
        )}
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50">
          <div className="p-3 border-b">
            <div className="text-sm font-medium">{user.name}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
            {user.isAdmin && (
              <div className="text-xs text-red-600 font-medium">Quản trị viên</div>
            )}
          </div>
          <div className="p-1">
            {user.isAdmin && (
              <a
                href="/admin"
                className="block w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                onClick={() => setShowMenu(false)}
              >
                Quản lý Admin
              </a>
            )}
            <button
              onClick={() => {
                logout();
                setShowMenu(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
