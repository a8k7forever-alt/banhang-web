import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Không thể tải thông tin người dùng" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { email, name, password, role, isActive } = await req.json();

    if (!email || !name) {
      return NextResponse.json({ error: "Email và tên là bắt buộc" }, { status: 400 });
    }

    // Check if email already exists (excluding current user)
    const existingUser = await prisma.user.findFirst({
      where: { 
        email,
        id: { not: id }
      }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email đã tồn tại" }, { status: 400 });
    }

    const updateData: any = {
      email,
      name,
      role: role || "USER",
      isActive: isActive !== false
    };

    // Only update password if provided
    if (password && password.trim() !== "") {
      updateData.password = password; // In production, hash this password
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Không thể cập nhật người dùng" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
    }

    // Prevent deleting the last admin
    if (user.role === "ADMIN") {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN" }
      });

      if (adminCount <= 1) {
        return NextResponse.json({ error: "Không thể xóa quản trị viên cuối cùng" }, { status: 400 });
      }
    }

    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Người dùng đã được xóa" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Không thể xóa người dùng" }, { status: 500 });
  }
}

