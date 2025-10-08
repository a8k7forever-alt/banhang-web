import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Test basic connection
    await prisma.$connect();
    
    // Test simple query
    const productCount = await prisma.product.count();
    
    return NextResponse.json({ 
      success: true, 
      message: "Database connected successfully",
      productCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
