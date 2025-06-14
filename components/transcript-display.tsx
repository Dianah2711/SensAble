"use client"

import { useState, useEffect } from "react"
import { Copy, Download, Trash2, Volume2, Mic } from "lucide-react"

interface TranscriptDisplayProps {
  transcript: string
  isProcessing: boolean
  error?: string
  onClear?: () => void
}

export default function TranscriptDisplay({ transcript, isProcessing, error, onClear }: TranscriptDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!transcript) return

    try {
      await navigator.clipboard.writeText(transcript)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text:", err)
    }
  }

  const handleDownload = () => {
    if (!transcript) return

    const blob = new Blob([transcript], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transcript-${new Date().toISOString().slice(0, 10)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleSpeak = () => {
    if (!transcript || typeof window === "undefined" || !("speechSynthesis" in window)) return

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(transcript)
    utterance.rate = 0.8
    utterance.volume = 1
    window.speechSynthesis.speak(utterance)
  }

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [copied])

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Transcription Result</h3>
            {transcript && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSpeak}
                  className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
                  aria-label="Read transcript aloud"
                  title="Read aloud"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCopy}
                  className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-300"
                  aria-label="Copy transcript to clipboard"
                  title={copied ? "Copied!" : "Copy"}
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300"
                  aria-label="Download transcript as text file"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={onClear}
                  className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
                  aria-label="Clear transcript"
                  title="Clear"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isProcessing && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-200 rounded-full mx-auto flex items-center justify-center mb-4">
                  <div className="w-6 h-6 bg-blue-600 rounded-full animate-ping"></div>
                </div>
                <p className="text-slate-600 font-medium">Processing speech...</p>
                <p className="text-sm text-slate-500 mt-1">Converting your audio to text</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                </div>
                <div className="ml-3">
                  <h4 className="text-red-800 font-medium">Transcription Error</h4>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                  <p className="text-red-600 text-xs mt-2">Please try again or check your microphone permissions.</p>
                </div>
              </div>
            </div>
          )}

          {transcript && !isProcessing && !error && (
            <div className="space-y-4">
              <div
                className="bg-slate-50 border border-slate-200 rounded-xl p-6 min-h-[200px]"
                role="region"
                aria-label="Transcribed text"
              >
                <p className="text-slate-800 text-lg leading-relaxed whitespace-pre-wrap">{transcript}</p>
              </div>

              {/* Word count and character count */}
              <div className="flex items-center justify-between text-sm text-slate-500">
                <div className="flex items-center space-x-4">
                  <span>Words: {transcript.trim().split(/\s+/).length}</span>
                  <span>Characters: {transcript.length}</span>
                </div>
                {copied && <span className="text-green-600 font-medium">Copied to clipboard!</span>}
              </div>
            </div>
          )}

          {!transcript && !isProcessing && !error && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto flex items-center justify-center mb-4">
                <Mic className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 text-lg">No transcript yet</p>
              <p className="text-slate-400 text-sm mt-1">Start recording to see your speech converted to text</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
