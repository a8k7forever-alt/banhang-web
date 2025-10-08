"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import ActionButtons from "@/components/ActionButtons";
import Loading from "@/components/Loading";

type User = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "USER";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    role: "USER" as "ADMIN" | "USER",
    isActive: true
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        setError("Không thể tải danh sách người dùng");
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingUser ? `/api/admin/users/${editingUser.id}` : "/api/admin/users";
      const method = editingUser ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadUsers();
        setShowForm(false);
        setEditingUser(null);
        setFormData({ email: "", name: "", password: "", role: "USER", isActive: true });
      } else {
        const error = await response.json();
        setError(error.error || "Có lỗi xảy ra");
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi lưu dữ liệu");
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      password: "",
      role: user.role,
      isActive: user.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
    
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        await loadUsers();
      } else {
        setError("Không thể xóa người dùng");
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi xóa");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({ email: "", name: "", password: "", role: "USER", isActive: true });
  };

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Quản lý người dùng</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showForm ? "Hủy" : "Thêm người dùng"}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {showForm && (
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingUser ? "Sửa người dùng" : "Thêm người dùng mới"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu {editingUser ? "(để trống nếu không đổi)" : "*"}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vai trò
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as "ADMIN" | "USER" })}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USER">Người dùng</option>
                    <option value="ADMIN">Quản trị viên</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Tài khoản hoạt động
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  {editingUser ? "Cập nhật" : "Tạo mới"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Tên</th>
                <th className="p-3 text-left">Vai trò</th>
                <th className="p-3 text-left">Trạng thái</th>
                <th className="p-3 text-left">Ngày tạo</th>
                <th className="p-3 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="p-3" colSpan={6}>
                    <Loading text="Đang tải danh sách người dùng..." size="sm" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td className="p-3 text-center py-8 text-gray-500" colSpan={6}>
                    Chưa có người dùng nào
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{user.email}</td>
                    <td className="p-3">{user.name}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.role === "ADMIN" 
                          ? "bg-red-100 text-red-800" 
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {user.role === "ADMIN" ? "Quản trị viên" : "Người dùng"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.isActive 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {user.isActive ? "Hoạt động" : "Tạm khóa"}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <ActionButtons
                        onEdit={() => handleEdit(user)}
                        onDelete={() => handleDelete(user.id)}
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

