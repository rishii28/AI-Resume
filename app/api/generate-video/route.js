import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import RunwayML from '@runwayml/sdk';

const client = new RunwayML({
  apiKey: process.env.RUNWAY_API_SECRET,
});

async function pollForTaskCompletion(taskId) {
  const maxAttempts = 60;
  const initialInterval = 5000;
  let attempt = 0;
  
  while (attempt < maxAttempts) {
    const delay = initialInterval * Math.pow(1.2, attempt) + Math.random() * 2000;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    try {
      const taskStatus = await client.tasks.retrieve(taskId);
      console.log(`⏳ Attempt ${attempt + 1}/${maxAttempts} - Status:`, taskStatus.status);

      if (taskStatus.status === "SUCCEEDED") {
        return taskStatus;
      } else if (taskStatus.status === "FAILED") {
        throw new Error(taskStatus.error?.message || "Video generation failed");
      }
    } catch (pollError) {
      console.log(`⚠️ Status check error: ${pollError.message}`);
    }
    
    attempt++;
  }
  throw new Error(`Task timed out after ${maxAttempts} attempts`);
}

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt, model = "gen4.5", duration = 5, aspectRatio = "1280:720" } = await req.json();
    
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    console.log("🎬 Generating video with RunwayML for prompt:", prompt);
    console.log("Model:", model, "Duration:", duration);

        const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    
    const task = await client.textToVideo.create({
      model: model,
      promptText: prompt,
      ratio: aspectRatio,
      duration: duration,
    });

    console.log("✅ Video task submitted with ID:", task.id);

    const completedTask = await pollForTaskCompletion(task.id);

    console.log("✅ Video generated successfully");

    const videoUrl = completedTask.output?.video_url || 
                     completedTask.video_url ||
                     (completedTask.output && completedTask.output[0]) ||
                     null;

    if (!videoUrl) {
      console.error("No video URL in response:", JSON.stringify(completedTask, null, 2));
      return NextResponse.json({ 
        error: "Invalid response from RunwayML" 
      }, { status: 500 });
    }

    const videoResponse = await fetch(videoUrl);
    let base64Video = videoUrl; 
    
    if (videoResponse.ok) {
      const videoBlob = await videoResponse.blob();
      const buffer = Buffer.from(await videoBlob.arrayBuffer());
      base64Video = `data:video/mp4;base64,${buffer.toString('base64')}`;
    }

    const savedVideo = await db.generatedVideo.create({
      data: {
        userId: user.id,
        prompt: prompt,
        videoUrl: base64Video,
        model: model,
        duration: duration,
      },
    });

    console.log("✅ Video saved to database with ID:", savedVideo.id);

    return NextResponse.json({
      success: true,
      videoUrl: base64Video,
      model: model,
      taskId: task.id,
      videoId: savedVideo.id,
    });

  } catch (error) {
    console.error("❌ RunwayML error:", error);
    
    if (error.status === 401 || error.status === 403) {
      return NextResponse.json({ 
        error: "Invalid API key or permissions. Check your RunwayML credentials." 
      }, { status: 401 });
    }
    
    if (error.status === 429) {
      return NextResponse.json({ 
        error: "Rate limit exceeded. Please try again later." 
      }, { status: 429 });
    }
    
    if (error.status === 400) {
      return NextResponse.json({ 
        error: error.message || "Invalid request parameters"
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: error.message || "Failed to generate video"
    }, { status: 500 });
  }
}