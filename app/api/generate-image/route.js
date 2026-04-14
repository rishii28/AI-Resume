import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { HfInference } from '@huggingface/inference';
import { db } from "@/lib/prisma";

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    console.log("🎨 Generating image with Hugging Face for prompt:", prompt);
    console.log("🔑 API Key:", process.env.HUGGINGFACE_API_KEY ? "✅ Present" : "❌ Missing");

    
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const imageBlob = await hf.textToImage({
      inputs: prompt,
      model: "black-forest-labs/FLUX.1-schnell",
      parameters: {
        negative_prompt: "blurry, bad quality, distorted, ugly",
        num_inference_steps: 4,
        guidance_scale: 3.5,
      },
    });

    console.log("✅ Image generated successfully");

    const buffer = Buffer.from(await imageBlob.arrayBuffer());
    const base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`;

    const generatedImage = await db.generatedImage.create({
      data: {
        userId: user.id,
        prompt: prompt,
        imageUrl: base64Image,
      },
    });

    console.log("✅ Image saved to database with ID:", generatedImage.id);

    return NextResponse.json({
      success: true,
      imageUrl: base64Image,
      imageId: generatedImage.id,
      format: "base64"
    });

  } catch (error) {
    console.error("❌ Hugging Face error:", error);
    
    // Check for specific error types
    if (error.message?.includes("402") || error.message?.includes("payment")) {
      return NextResponse.json({ 
        error: "Hugging Face API limit reached. The free tier has usage limits. Please try again later or add payment method." 
      }, { status: 429 });
    }
    
    return NextResponse.json({ 
      error: "Failed to generate image: " + (error.message || "Unknown error")
    }, { status: 500 });
  }
}