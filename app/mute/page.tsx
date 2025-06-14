"use client"

import { useState } from "react"
import Link from "next/link"
import { Volume2, ArrowLeft, Play, Square } from "lucide-react"

// Enhanced text-to-speech function with consistent speed but different emotions
const convertTextToSpeech = (text: string, emotion = "neutral") => {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)

    // Consistent speed (1.0) for all emotions, but different pitch and volume
    utterance.rate = 1.0 // Same speed for all emotions

    switch (emotion) {
      case "happy":
        utterance.pitch = 1.5
        utterance.volume = 1.0
        // Add exclamation to make it sound happier
        utterance.text = text + "!"
        break
      case "sad":
        utterance.pitch = 0.7
        utterance.volume = 0.7
        // Add pauses to make it sound sadder
        utterance.text = text.replace(/\./g, "... ")
        break
      case "excited":
        utterance.pitch = 1.7
        utterance.volume = 1.0
        // Add emphasis
        utterance.text = text.toUpperCase() + "!!!"
        break
      case "scared":
        utterance.pitch = 1.6
        utterance.volume = 0.8
        // Add trembling effect with pauses
        utterance.text = text.replace(/\s/g, "... ")
        break
      case "nervous":
        utterance.pitch = 1.2
        utterance.volume = 0.7
        // Add hesitation
        utterance.text = text.replace(/,/g, "... um,").replace(/\./g, "... uh.")
        break
      default: // neutral
        utterance.pitch = 1.0
        utterance.volume = 1.0
        utterance.text = text
    }

    return new Promise<void>((resolve) => {
      utterance.onend = () => resolve()
      window.speechSynthesis.speak(utterance)
    })
  }
  return Promise.resolve()
}

export default function MuteUserPage() {
  const [inputText, setInputText] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [lastSpokenText, setLastSpokenText] = useState("")
  const [selectedEmotion, setSelectedEmotion] = useState<string>("neutral")

  const handleConvertToSpeech = async () => {
    if (!inputText.trim()) return

    setIsPlaying(true)
    setLastSpokenText(inputText)

    try {
      await convertTextToSpeech(inputText, selectedEmotion)
    } catch (error) {
      console.error("Speech synthesis error:", error)
    } finally {
      setIsPlaying(false)
    }
  }

  const handleStopSpeech = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
    setIsPlaying(false)
  }

  const quickPhrases = [
    "Hello, how are you?",
    "Thank you very much",
    "I need help, please",
    "Excuse me",
    "Yes, please",
    "No, thank you",
    "I'm sorry",
    "Have a good day",
  ]

  const handleQuickPhrase = (phrase: string) => {
    setInputText(phrase)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
            aria-label="Go back to home page"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-lg">Back to Home</span>
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">Text-to-Speech Converter</h1>
          <p className="text-lg text-slate-600">Type your message and convert it to speech</p>
        </header>

        {/* Text Input and Conversion */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6 mb-6">
          {/* Text Input */}
          <div>
            <label htmlFor="speech-text" className="block text-lg font-semibold text-slate-800 mb-3">
              Enter text to convert to speech:
            </label>
            <textarea
              id="speech-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message here..."
              className="w-full p-4 border border-slate-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent text-lg"
              rows={4}
              aria-describedby="speech-text-help"
            />
            <p id="speech-text-help" className="text-sm text-slate-500 mt-2">
              Enter the text you want to convert to speech
            </p>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-4 justify-center">
            {!isPlaying ? (
              <button
                onClick={handleConvertToSpeech}
                disabled={!inputText.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white px-6 py-3 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2 flex items-center gap-2"
                aria-label="Convert text to speech"
              >
                <Play className="w-5 h-5" />
                Convert to Speech
              </button>
            ) : (
              <button
                onClick={handleStopSpeech}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2 flex items-center gap-2"
                aria-label="Stop speech"
              >
                <Square className="w-5 h-5" />
                Stop Speech
              </button>
            )}
          </div>

          {/* Status Display */}
          {isPlaying && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Volume2 className="w-5 h-5 text-purple-600 animate-pulse" />
                <span className="font-semibold text-purple-800">Speaking with {selectedEmotion} emotion...</span>
              </div>
              <p className="text-purple-700">{lastSpokenText}</p>
            </div>
          )}
        </div>

        {/* Quick Phrases */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Phrases:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickPhrases.map((phrase, index) => (
              <button
                key={index}
                onClick={() => handleQuickPhrase(phrase)}
                className="bg-slate-100 hover:bg-slate-200 p-3 rounded-xl text-left transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300"
                aria-label={`Use quick phrase: ${phrase}`}
              >
                <span className="text-slate-800">{phrase}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Emotion Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Choose Speech Emotion:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { emotion: "neutral", emoji: "😐", label: "Neutral" },
              { emotion: "happy", emoji: "😊", label: "Happy" },
              { emotion: "sad", emoji: "😢", label: "Sad" },
              { emotion: "excited", emoji: "🤩", label: "Excited" },
              { emotion: "scared", emoji: "😨", label: "Scared" },
              { emotion: "nervous", emoji: "😰", label: "Nervous" },
            ].map(({ emotion, emoji, label }) => (
              <button
                key={emotion}
                onClick={() => setSelectedEmotion(emotion)}
                className={`p-4 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-purple-300 ${
                  selectedEmotion === emotion
                    ? "border-purple-600 bg-purple-50 text-purple-800"
                    : "border-slate-200 hover:border-slate-300 text-slate-700"
                }`}
                aria-label={`Select ${label} emotion for speech`}
              >
                <div className="text-2xl mb-1">{emoji}</div>
                <div className="text-sm font-medium">{label}</div>
              </button>
            ))}
          </div>
          <p className="text-sm text-slate-600 mt-3 text-center">
            Selected emotion: <span className="font-semibold text-purple-600">{selectedEmotion}</span>
          </p>
        </div>
      </div>
    </main>
  )
}
