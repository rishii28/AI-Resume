"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function ImageGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setLoading(true);
    setError(null);
    setImageUrl(null);
    
    try {
      console.log("📤 Sending request to generate image...");
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      console.log("📥 Response status:", response.status);
      
      const data = await response.json();

      if (!response.ok) {
        toast.error("Image generation service temporarily unavailable");
        return;
      }

      if (data.imageUrl && typeof data.imageUrl === 'string' && data.imageUrl.startsWith('data:image')) {
        setImageUrl(data.imageUrl);
        toast.success("Image generated successfully!");
      } else {
        console.error("❌ Invalid image format:", data);
        toast.error("Failed to generate image");
      }
    } catch (err) {
      console.error("❌ Generation error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async () => {
    if (!imageUrl) return;
    
    try {
      setDownloading(true);
      
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `sensa-ai-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Image downloaded!");
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download image");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c1f] via-[#1a1b3b] to-[#2a1e3c] py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        
        {/* Header with floating elements */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-4 pt-10 bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">
            AI Image Generator
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Turn your imagination into stunning visuals with AI
          </p>
          
        </div>

        {/* Main Card - Glassmorphism */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl opacity-20 group-hover:opacity-30 blur transition duration-1000"></div>
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
            
            {/* Input Section */}
            <div className="space-y-4 mb-8">
              <label className="text-sm font-medium text-purple-300 tracking-wide uppercase">
                ✨ Enter your prompt
              </label>
              <div className="relative">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A beautiful sunset over mountains, digital art style, highly detailed..."
                  className="min-h-[120px] bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all rounded-xl"
                  disabled={loading}
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                  {prompt.length}/500
                </div>
              </div>
              
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={generateImage} 
                  disabled={loading || !prompt.trim()}
                  className="relative group/btn px-8 py-6 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 hover:from-purple-700 hover:via-pink-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
                  size="lg"
                >
                  <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 blur-xl opacity-50 group-hover/btn:opacity-75 transition-opacity"></span>
                  <span className="relative flex items-center">
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        <span>Generating magic...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        <span>Generate Image</span>
                      </>
                    )}
                  </span>
                </Button>
              </div>
            </div>

            {/* No error display - we use toast notifications only */}

            {/* Generated Image Display */}
            {imageUrl && (
              <div className="space-y-6">
                <div className="relative group/image">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl opacity-20 group-hover/image:opacity-30 blur transition duration-500"></div>
                  <div className="relative aspect-square w-full max-w-2xl mx-auto rounded-xl overflow-hidden bg-black/40 backdrop-blur-sm border border-white/10">
                    <img 
                      src={imageUrl} 
                      alt={prompt}
                      className="w-full h-full object-contain"
                      onLoad={() => console.log("✅ Image loaded successfully")}
                      onError={(e) => {
                        console.error("❌ Image failed to load");
                        toast.error("Failed to display image");
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
                
                <div className="flex justify-center gap-4">
                  <Button 
                    onClick={downloadImage} 
                    variant="outline"
                    className="border-white/10 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl px-6 py-5 transition-all"
                    disabled={downloading}
                  >
                    {downloading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download Image
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={() => {
                      setPrompt("");
                      setImageUrl(null);
                    }} 
                    variant="ghost"
                    className="text-gray-400 hover:text-white hover:bg-white/5 rounded-xl px-6 py-5"
                  >
                    Create New
                  </Button>
                </div>
              </div>
            )}

            {/* Tips Section */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <h3 className="text-sm font-medium text-purple-300 mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Tips for better results
              </h3>
              <ul className="text-sm text-gray-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span>Be descriptive and specific with your vision</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400">•</span>
                  <span>Mention lighting and composition details</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Advanced styles improve visual accuracy</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400">•</span>
                  <span>Download or refine your image in seconds</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}