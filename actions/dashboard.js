"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "models/gemini-2.5-flash",
});

export const generateAIInsights = async (industry) => {
  const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "High" | "Medium" | "Low",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "Positive" | "Neutral" | "Negative",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const content = response.text();
    const cleanedText = content.replace(/```(?:json)?\n?/g, "").trim();

    try {
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error("JSON Parse Error:", cleanedText);
      throw new Error("Failed to parse AI response");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Return fallback data if API fails
    return {
      salaryRanges: [
        { role: "Junior Developer", min: 50000, max: 80000, median: 65000, location: "US" },
        { role: "Software Engineer", min: 70000, max: 110000, median: 90000, location: "US" },
        { role: "Senior Developer", min: 100000, max: 150000, median: 125000, location: "US" },
        { role: "Lead Engineer", min: 130000, max: 180000, median: 155000, location: "US" },
        { role: "Engineering Manager", min: 150000, max: 220000, median: 185000, location: "US" }
      ],
      growthRate: 8,
      demandLevel: "High",
      topSkills: ["JavaScript", "Python", "React", "Node.js", "SQL"],
      marketOutlook: "Positive",
      keyTrends: ["AI Integration", "Remote Work", "Cloud Computing", "Cybersecurity", "DevOps"],
      recommendedSkills: ["TypeScript", "Python", "AWS", "Docker", "GraphQL"]
    };
  }
};

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  if (!user.industryInsight) {
    const insights = await generateAIInsights(user.industry);

    const industryInsight = await db.industryInsight.create({
      data: {
        industry: user.industry,
        ...insights,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return industryInsight;
  }

  return user.industryInsight;
}