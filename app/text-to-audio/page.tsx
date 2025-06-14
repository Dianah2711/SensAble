"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Volume2, Play, Square, Download, Settings } from "lucide-react"

interface AudioSettings {
  speed: number // Corresponds to OpenAI's speed
  voice: string // Corresponds to OpenAI's voice (e.g., "alloy", "nova")
}

const OPENAI_VOICES = [
  { label: "Alloy", value: "alloy" },
  { label: "Echo", value: "echo" },
  { label: "Fable", value: "fable" },
  { label: "Onyx", value: "onyx" },
  { label: "Nova", value: "nova" },
  { label: "Shimmer", value: "shimmer" },
]

export default function TextToAudioPage() {
  const [inputText, setInputText] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    speed: 1.0,
    voice: "alloy", // Default OpenAI voice
  })
  const [savedTexts, setSavedTexts] = useState<string[]>([])
  const [audioUrl, setAudioUrl] = useState<string | null>(null) // To store the generated audio URL
  const audioElementRef = useRef<HTMLAudioElement>(null)

  const generateAndPlayAudio = async () => {
    if (!inputText.trim()) return

    setIsPlaying(true)
    try {
      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText,
          voice: audioSettings.voice,
          speed: audioSettings.speed,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch audio from API")
      }

      const data = await response.json()

      // Check if we got a fallback response
      if (data.fallback) {
        // Use browser's built-in speech synthesis as fallback
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel()
          const utterance = new SpeechSynthesisUtterance(inputText)
          utterance.rate = audioSettings.speed
          utterance.volume = 1

          // Try to find a matching voice
          const voices = window.speechSynthesis.getVoices()
          const selectedVoice = voices.find((v) => v.name.toLowerCase().includes(audioSettings.voice.toLowerCase()))
          if (selectedVoice) {
            utterance.voice = selectedVoice
          }

          utterance.onend = () => setIsPlaying(false)
          utterance.onerror = () => setIsPlaying(false)

          window.speechSynthesis.speak(utterance)
          alert(
            "Using browser's built-in text-to-speech. For enhanced audio features, please configure OpenAI API key.",
          )
        } else {
          throw new Error("Text-to-speech not supported in this browser")
        }
      } else if (data.audioData) {
        // Use OpenAI generated audio
        if (audioElementRef.current) {
          audioElementRef.current.src = data.audioData
          audioElementRef.current.play()
          audioElementRef.current.onended = () => setIsPlaying(false)
          setAudioUrl(data.audioData)
        }
      } else {
        throw new Error("No audio data received")
      }
    } catch (error) {
      console.error("Audio generation/playback error:", error)

      // Final fallback to browser speech synthesis
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel()
          const utterance = new SpeechSynthesisUtterance(inputText)
          utterance.rate = audioSettings.speed
          utterance.volume = 1
          utterance.onend = () => setIsPlaying(false)
          utterance.onerror = () => setIsPlaying(false)
          window.speechSynthesis.speak(utterance)
          alert("Using browser's built-in text-to-speech as fallback.")
        } catch (fallbackError) {
          alert(`Error generating audio: ${error instanceof Error ? error.message : String(error)}`)
          setIsPlaying(false)
        }
      } else {
        alert(`Error generating audio: ${error instanceof Error ? error.message : String(error)}`)
        setIsPlaying(false)
      }
    }
  }

  const handleStopAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause()
      audioElementRef.current.currentTime = 0 // Reset playback to start
    }
    setIsPlaying(false)
  }

  const handleSaveText = () => {
    if (inputText.trim() && !savedTexts.includes(inputText)) {
      setSavedTexts((prev) => [inputText, ...prev.slice(0, 9)]) // Keep last 10
    }
  }

  const handleLoadSavedText = (text: string) => {
    setInputText(text)
    setAudioUrl(null) // Clear previous audio when loading new text
  }

  const handleDownloadAudio = () => {
    if (audioUrl) {
      const link = document.createElement("a")
      link.href = audioUrl
      link.download = "sensable_audio.mp3"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      alert("No audio generated to download yet. Please play audio first.")
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 mb-4 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
            aria-label="Go back to home page"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-lg">Back to Home</span>
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">Advanced Text-to-Audio</h1>
          <p className="text-lg text-slate-600">Convert text to speech with customizable voice settings</p>
        </header>

        {/* Main Interface */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6 mb-6">
          {/* Text Input */}
          <div>
            <label htmlFor="audio-text" className="block text-lg font-semibold text-slate-800 mb-3">
              Enter text to convert to audio:
            </label>
            <textarea
              id="audio-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type or paste your text here..."
              className="w-full p-4 border border-slate-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent text-lg"
              rows={6}
              aria-describedby="audio-text-help"
            />
            <p id="audio-text-help" className="text-sm text-slate-500 mt-2">
              Enter the text you want to convert to speech
            </p>
          </div>

          {/* Control Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            {!isPlaying ? (
              <button
                onClick={generateAndPlayAudio}
                disabled={!inputText.trim()}
                className="bg-pink-600 hover:bg-pink-700 disabled:bg-slate-300 text-white px-6 py-3 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2 flex items-center gap-2"
                aria-label="Play audio"
              >
                <Play className="w-5 h-5" />
                Play Audio
              </button>
            ) : (
              <button
                onClick={handleStopAudio}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 flex items-center gap-2"
                aria-label="Stop audio"
              >
                <Square className="w-5 h-5" />
                Stop Audio
              </button>
            )}

            <button
              onClick={handleSaveText}
              disabled={!inputText.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-6 py-3 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
              aria-label="Save text"
            >
              Save Text
            </button>

            <button
              onClick={handleDownloadAudio}
              disabled={!audioUrl} // Only enable if audio has been generated
              className="bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white px-6 py-3 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2 flex items-center gap-2"
              aria-label="Download audio"
            >
              <Download className="w-5 h-5" />
              Download
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 flex items-center gap-2"
              aria-label="Toggle settings"
            >
              <Settings className="w-5 h-5" />
              Settings
            </button>
          </div>

          {/* Status Display */}
          {isPlaying && (
            <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Volume2 className="w-5 h-5 text-pink-600 animate-pulse" />
                <span className="font-semibold text-pink-800">Playing Audio...</span>
              </div>
              <p className="text-pink-700 text-sm">
                Voice: {audioSettings.voice} | Speed: {audioSettings.speed}x
              </p>
            </div>
          )}
        </div>

        {/* Audio Settings */}
        {showSettings && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Audio Settings</h3>
            <div className="space-y-6">
              {/* Speech Rate */}
              <div>
                <label htmlFor="speed-slider" className="block text-sm font-medium text-slate-700 mb-2">
                  Speech Speed: {audioSettings.speed}x
                </label>
                <input
                  id="speed-slider"
                  type="range"
                  min="0.25" // OpenAI supports 0.25 to 4.0
                  max="4.0"
                  step="0.05"
                  value={audioSettings.speed}
                  onChange={(e) => setAudioSettings((prev) => ({ ...prev, speed: Number.parseFloat(e.target.value) }))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-300"
                  aria-label="Adjust speech speed"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Slow</span>
                  <span>Normal</span>
                  <span>Fast</span>
                </div>
              </div>

              {/* Voice Selection */}
              <div>
                <label htmlFor="voice-select" className="block text-sm font-medium text-slate-700 mb-2">
                  Voice:
                </label>
                <select
                  id="voice-select"
                  value={audioSettings.voice}
                  onChange={(e) => setAudioSettings((prev) => ({ ...prev, voice: e.target.value }))}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent text-base"
                  aria-label="Select voice"
                >
                  {OPENAI_VOICES.map((voice) => (
                    <option key={voice.value} value={voice.value}>
                      {voice.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Saved Texts */}
        {savedTexts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Saved Texts</h3>
            <div className="space-y-3">
              {savedTexts.map((text, index) => (
                <div
                  key={index}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start justify-between gap-4"
                >
                  <p className="text-slate-700 flex-1 text-sm">
                    {text.length > 100 ? `${text.substring(0, 100)}...` : text}
                  </p>
                  <button
                    onClick={() => handleLoadSavedText(text)}
                    className="bg-pink-600 hover:bg-pink-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-pink-300"
                    aria-label={`Load saved text: ${text.substring(0, 50)}`}
                  >
                    Load
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Hidden audio element to play generated audio */}
      <audio ref={audioElementRef} className="hidden" />
    </main>
  )
}
