"use client"

import { useState, useEffect } from "react"

interface SignLanguageVideoProps {
  text: string
  onVideoReady?: () => void
}

// Placeholder sign language video generator
const generateSignLanguageVideo = async (text: string): Promise<string> => {
  // Simulate video generation delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // In a real implementation, this would call an AI service to generate sign language video
  // For now, we'll return a placeholder video URL based on the text
  const videoId = Math.random().toString(36).substring(7)
  return `/placeholder-sign-video-${videoId}.mp4`
}

export default function SignLanguageVideo({ text, onVideoReady }: SignLanguageVideoProps) {
  const [videoUrl, setVideoUrl] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    if (text.trim()) {
      generateVideo()
    }
  }, [text])

  const generateVideo = async () => {
    setIsGenerating(true)
    setError("")

    try {
      const url = await generateSignLanguageVideo(text)
      setVideoUrl(url)
      onVideoReady?.()
    } catch (err) {
      setError("Failed to generate sign language video")
    } finally {
      setIsGenerating(false)
    }
  }

  if (isGenerating) {
    return (
      <div className="bg-slate-100 rounded-xl p-6 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-600">Generating sign language video...</p>
        <p className="text-sm text-slate-500 mt-2">Converting: "{text}"</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-red-600">{error}</p>
        <button onClick={generateVideo} className="mt-2 text-red-600 hover:text-red-700 underline">
          Try again
        </button>
      </div>
    )
  }

  if (videoUrl) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h3 className="font-semibold text-slate-800 mb-3">Sign Language Video:</h3>
        <div className="bg-slate-900 rounded-lg aspect-video flex items-center justify-center mb-3">
          {/* Placeholder for actual video */}
          <div className="text-center text-white">
            <div className="text-4xl mb-2">🤟</div>
            <p className="text-sm">Sign Language Video</p>
            <p className="text-xs text-slate-300 mt-1">"{text}"</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">▶️ Play</button>
          <button className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm">⏸️ Pause</button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm">🔄 Replay</button>
        </div>
      </div>
    )
  }

  return null
}
