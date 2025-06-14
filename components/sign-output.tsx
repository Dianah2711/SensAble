"use client"

import { useState } from "react"
import { Play, Pause, RotateCcw, Download, Share } from "lucide-react"

interface SignWord {
  word: string
  signImage: string
  gloss: string
  description: string
}

interface SignOutputProps {
  words: SignWord[]
  originalText: string
  onReplay?: () => void
}

export default function SignOutput({ words, originalText, onReplay }: SignOutputProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    // In a real implementation, this would control video/animation playback
  }

  const handleReplay = () => {
    setCurrentWordIndex(0)
    setIsPlaying(false)
    onReplay?.()
  }

  const handleWordClick = (index: number) => {
    setCurrentWordIndex(index)
    setIsPlaying(false)
  }

  const handleDownload = () => {
    // Placeholder for downloading sign language video/images
    console.log("Download sign language content")
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Sign Language Translation",
          text: `Sign language translation for: "${originalText}"`,
          url: window.location.href,
        })
      } catch (err) {
        console.log("Share failed:", err)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`Sign language translation for: "${originalText}"`)
    }
  }

  if (!words.length) return null

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Sign Language Translation</h3>
            <p className="text-sm text-slate-600 mt-1">"{originalText}"</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePlayPause}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
              aria-label={isPlaying ? "Pause playback" : "Play signs"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={handleReplay}
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
              aria-label="Replay from beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-300"
              aria-label="Download sign language content"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300"
              aria-label="Share translation"
            >
              <Share className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Sign Display */}
      <div className="p-6">
        <div className="bg-slate-900 rounded-xl p-8 mb-6 text-center">
          <div className="w-64 h-48 mx-auto bg-slate-800 rounded-lg flex items-center justify-center mb-4">
            {/* Placeholder for sign image/video */}
            <div className="text-center">
              <div className="text-6xl mb-2">🤟</div>
              <p className="text-white text-lg font-medium">{words[currentWordIndex]?.word}</p>
              <p className="text-slate-300 text-sm mt-1">{words[currentWordIndex]?.description}</p>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center space-x-4 mb-4">
            <button
              onClick={() => setCurrentWordIndex(Math.max(0, currentWordIndex - 1))}
              disabled={currentWordIndex === 0}
              className="p-2 text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              aria-label="Previous word"
            >
              ⏮️
            </button>
            <button
              onClick={handlePlayPause}
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setCurrentWordIndex(Math.min(words.length - 1, currentWordIndex + 1))}
              disabled={currentWordIndex === words.length - 1}
              className="p-2 text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              aria-label="Next word"
            >
              ⏭️
            </button>
          </div>

          {/* Speed Control */}
          <div className="flex items-center justify-center space-x-2">
            <span className="text-white text-sm">Speed:</span>
            {[0.5, 1, 1.5, 2].map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-2 py-1 rounded text-sm transition-colors ${
                  playbackSpeed === speed
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:text-white hover:bg-slate-700"
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Word Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          {words.map((word, index) => (
            <button
              key={index}
              onClick={() => handleWordClick(index)}
              className={`p-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                index === currentWordIndex
                  ? "border-blue-600 bg-blue-50 text-blue-800"
                  : "border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
              aria-label={`Show sign for word: ${word.word}`}
            >
              <div className="text-2xl mb-1">🤟</div>
              <div className="text-sm font-medium">{word.word}</div>
              <div className="text-xs text-slate-500 mt-1">{word.gloss}</div>
            </button>
          ))}
        </div>

        {/* Full Gloss Display */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <h4 className="font-semibold text-slate-800 mb-2">Sign Language Gloss:</h4>
          <p className="text-slate-700 font-mono text-sm">{words.map((word) => word.gloss).join(" ")}</p>
          <p className="text-xs text-slate-500 mt-2">
            Gloss notation represents the structure and grammar of sign language
          </p>
        </div>
      </div>
    </div>
  )
}
