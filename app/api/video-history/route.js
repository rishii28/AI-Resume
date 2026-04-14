import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch user's video history (newest first)
    const history = await db.generatedVideo.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 30, // Limit to last 30 videos
    });

    return NextResponse.json({ 
      success: true, 
      history 
    });

  } catch (error) {
    console.error("Error fetching video history:", error);
    return NextResponse.json({ 
      error: "Failed to fetch history" 
    }, { status: 500 });
  }
}