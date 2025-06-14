"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Info } from "lucide-react"
import TextInput from "@/components/text-input"
import SignOutput from "@/components/sign-output"
import LoadingSpinner from "@/components/loading-spinner"
import { generateSignLanguage, type SignLanguageResult } from "@/lib/sign-language-api"

export default function TextToSignPage() {
  const [inputText, setInputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [signResult, setSignResult] = useState<SignLanguageResult | null>(null)
  const [error, setError] = useState("")

  const handleConvert = async () => {
    if (!inputText.trim()) return

    setIsLoading(true)
    setError("")

    try {
      const result = await generateSignLanguage(inputText.trim())
      setSignResult(result)

      // Announce completion for accessibility
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(
          `Sign language conversion complete for: ${inputText}. ${result.words.length} signs generated.`,
        )
        utterance.rate = 0.8
        window.speechSynthesis.speak(utterance)
      }
    } catch (err) {
      console.error("Sign language generation error:", err)
      setError("Failed to generate sign language. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewConversion = () => {
    setSignResult(null)
    setError("")
    setInputText("")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
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

          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">Text to Sign Language Converter</h1>
          <p className="text-lg text-slate-600 mb-4">
            Convert any text into American Sign Language (ASL) with visual demonstrations and gloss notation.
          </p>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-blue-800">
              <p className="font-medium mb-1">How it works:</p>
              <p className="text-sm">
                Enter your text, and we'll break it down into individual signs with visual representations and ASL gloss
                notation. Each word shows the proper hand movements and positioning.
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Input Section */}
          {!signResult && (
            <TextInput
              value={inputText}
              onChange={setInputText}
              onSubmit={handleConvert}
              isLoading={isLoading}
              placeholder="Type any sentence here... (e.g., 'Hello, how are you?')"
            />
          )}

          {/* Loading State */}
          {isLoading && <LoadingSpinner message="Generating sign language..." size="lg" />}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full mx-auto flex items-center justify-center mb-4">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <h3 className="text-red-800 font-semibold mb-2">Conversion Failed</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={handleConvert}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Results Section */}
          {signResult && !isLoading && (
            <div className="space-y-6">
              <SignOutput
                words={signResult.words}
                originalText={signResult.originalText}
                onReplay={() => console.log("Replay signs")}
              />

              {/* New Conversion Button */}
              <div className="text-center">
                <button
                  onClick={handleNewConversion}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2"
                >
                  Convert New Text
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <span className="text-2xl">🤟</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Visual Signs</h3>
            <p className="text-slate-600 text-sm">
              Each word is converted to its corresponding ASL sign with clear visual demonstrations.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Gloss Notation</h3>
            <p className="text-slate-600 text-sm">
              Professional ASL gloss notation shows the grammatical structure of sign language.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Interactive Playback</h3>
            <p className="text-slate-600 text-sm">
              Control playback speed, replay individual signs, and navigate through the sequence.
            </p>
          </div>
        </div>

        {/* Educational Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">About ASL Gloss Notation</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-slate-800 mb-3">What is Gloss?</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                ASL gloss is a written system used to represent American Sign Language. It uses English words in capital
                letters to represent signs, but follows ASL grammar and structure rather than English grammar.
              </p>
              <h3 className="font-semibold text-slate-800 mb-3">Example:</h3>
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-sm">
                  <strong>English:</strong> "How are you?"
                </p>
                <p className="text-sm">
                  <strong>ASL Gloss:</strong> HOW YOU
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 mb-3">Key Features:</h3>
              <ul className="text-slate-600 text-sm space-y-2">
                <li>• Capital letters represent signs</li>
                <li>• Word order follows ASL grammar</li>
                <li>• Facial expressions and body language noted</li>
                <li>• Fingerspelling shown with dashes</li>
                <li>• Classifiers and spatial references included</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
