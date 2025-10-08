import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Không thể tải danh sách người dùng" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, name, password, role, isActive } = await req.json();

    if (!email || !name || !password) {
      return NextResponse.json({ error: "Email, tên và mật khẩu là bắt buộc" }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email đã tồn tại" }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password, // In production, hash this password
        role: role || "USER",
        isActive: isActive !== false
      }
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Không thể tạo người dùng" }, { status: 500 });
  }
}

