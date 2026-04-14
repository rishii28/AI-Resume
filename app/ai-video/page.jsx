"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Download, Video, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function VideoGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const generateVideo = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setLoading(true);
    setError(null);
    setVideoUrl(null);
    
    try {
      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt,
          model: "gen4.5", // Using the best quality model
          duration: 5,
          aspectRatio: "1280:720"
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors specially
        if (data.error?.includes("Valid models")) {
          toast.error("Model configuration error. Please try again.");
          console.error("Model error:", data.error);
        } else {
          toast.error(data.error || "Video generation service temporarily unavailable");
        }
        setError(null);
        return;
      }

      setVideoUrl(data.videoUrl);
      toast.success("Video generated successfully!");
    } catch (err) {
      console.error("Generation error:", err);
      toast.error("Something went wrong. Please try again.");
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const downloadVideo = async () => {
    if (!videoUrl) return;
    
    try {
      setDownloading(true);
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `runway-video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Video downloaded!");
    } catch (err) {
      toast.error("Failed to download video");
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
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-4 pt-10 bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">
            AI Video Generator
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Create stunning short videos from text descriptions
          </p>
          
        </div>

        {/* Main Card - Glassmorphism */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-20 group-hover:opacity-30 blur transition duration-1000"></div>
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
            
            {/* Input Section */}
            <div className="space-y-4 mb-8">
              <label className="text-sm font-medium text-purple-300 tracking-wide uppercase">
                ✨ Describe your video
              </label>
              <div className="relative">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A serene mountain lake at sunrise with mist rising, cinematic style, 4k quality..."
                  className="min-h-[120px] bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all rounded-xl"
                  disabled={loading}
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                  {prompt.length}/500
                </div>
              </div>
              
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={generateVideo} 
                  disabled={loading || !prompt.trim()}
                  className="relative group/btn px-8 py-6 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 hover:from-purple-700 hover:via-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
                  size="lg"
                >
                  <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 blur-xl opacity-50 group-hover/btn:opacity-75 transition-opacity"></span>
                  <span className="relative flex items-center">
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        <span>Generating video... (30-60 sec)</span>
                      </>
                    ) : (
                      <>
                        <Video className="h-5 w-5 mr-2" />
                        <span>Generate Video</span>
                      </>
                    )}
                  </span>
                </Button>
              </div>
            </div>

            {/* No error display - we use toast notifications only */}

            {/* Generated Video Display */}
            {videoUrl && (
              <div className="space-y-6">
                <div className="relative group/video">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-20 group-hover/video:opacity-30 blur transition duration-500"></div>
                  <div className="relative aspect-video w-full max-w-2xl mx-auto rounded-xl overflow-hidden bg-black/40 backdrop-blur-sm border border-white/10">
                    <video 
                      src={videoUrl} 
                      controls
                      className="w-full h-full"
                      onError={(e) => {
                        console.error("Video playback error");
                        toast.error("Failed to play video");
                      }}
                    />
                  </div>
                </div>
                
                <div className="flex justify-center gap-4">
                  <Button 
                    onClick={downloadVideo} 
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
                        Download Video
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={() => {
                      setPrompt("");
                      setVideoUrl(null);
                      setError(null);
                    }} 
                    variant="ghost"
                    className="text-gray-400 hover:text-white hover:bg-white/5 rounded-xl px-6 py-5"
                  >
                    Create New
                  </Button>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4">
                <h3 className="text-sm font-medium text-purple-300 mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  About Video Generation
                </h3>
                <ul className="text-sm text-gray-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Generate high-quality AI videos in under a minute</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-400">•</span>
                    <span>5-10 second videos at 720p/1080p</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Create short cinematic clips from simple text prompts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-400">•</span>
                    <span>Perfect for creators, marketers, and innovators</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Use detailed, cinematic descriptions for best results</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-400">•</span>
                    <span>Instantly preview and download your videos</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}