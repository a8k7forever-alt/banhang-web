import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // In production, invalidate the session/token
    return NextResponse.json({ message: "Đăng xuất thành công" });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Có lỗi xảy ra khi đăng xuất" }, { status: 500 });
  }
}

