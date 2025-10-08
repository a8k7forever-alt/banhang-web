import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email và mật khẩu là bắt buộc" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: "Email hoặc mật khẩu không đúng" }, { status: 401 });
    }

    // In production, use bcrypt to compare hashed passwords
    if (user.password !== password) {
      return NextResponse.json({ error: "Email hoặc mật khẩu không đúng" }, { status: 401 });
    }

    // Create session (in production, use JWT or session management)
    const session = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isAdmin: user.role === "ADMIN"
    };

    return NextResponse.json({
      message: "Đăng nhập thành công",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isAdmin: user.role === "ADMIN"
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Có lỗi xảy ra khi đăng nhập" }, { status: 500 });
  }
}

