"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Mic, MicOff } from "lucide-react"
import ImageGenerator from "@/components/image-generator"

// Real voice-to-text for image prompts
const captureVoicePrompt = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = "en-US"

      recognition.onresult = (event: any) => {
        if (event.results && event.results.length > 0) {
          const transcript = event.results[0][0].transcript
          resolve(transcript)
        }
      }

      recognition.onerror = (event: any) => {
        reject(`Speech recognition error: ${event.error}`)
      }

      recognition.start()
    } else {
      reject("Speech recognition not supported")
    }
  })
}

export default function ImageGeneratorPage() {
  const [prompt, setPrompt] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])

  const handleVoiceInput = async () => {
    setIsListening(true)

    try {
      const voicePrompt = await captureVoicePrompt()
      setPrompt(voicePrompt)
    } catch (error) {
      console.error("Voice input error:", error)
    } finally {
      setIsListening(false)
    }
  }

  const handleImageGenerated = (imageUrl: string) => {
    setGeneratedImages((prev) => [imageUrl, ...prev.slice(0, 4)]) // Keep last 5 images
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
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

          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">AI Image Generator</h1>
          <p className="text-lg text-slate-600">
            Create images from voice descriptions using DALL-E and Stable Diffusion
          </p>
        </header>

        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Describe Your Image</h2>

          <div className="space-y-4">
            {/* Text Input */}
            <div>
              <label htmlFor="image-prompt" className="block text-sm font-medium text-slate-700 mb-2">
                Image Description:
              </label>
              <textarea
                id="image-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to generate... (e.g., 'a cute orange cat sitting in a garden')"
                className="w-full p-3 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                rows={3}
              />
            </div>

            {/* Voice Input */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleVoiceInput}
                disabled={isListening}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300 ${
                  isListening
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-purple-600 hover:bg-purple-700 text-white"
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isListening ? "Listening..." : "Voice Input"}
              </button>

              <span className="text-sm text-slate-500">
                {isListening ? "Speak your image description now..." : "Click to describe your image with voice"}
              </span>
            </div>
          </div>
        </div>

        {/* Image Generator */}
        {prompt && (
          <div className="mb-6">
            <ImageGenerator prompt={prompt} onImageGenerated={handleImageGenerated} />
          </div>
        )}

        {/* Recent Images Gallery */}
        {generatedImages.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Recent Generations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedImages.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imageUrl || "/placeholder.svg"}
                    alt={`Generated image ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Example Prompts */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Example Prompts:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "An individual is engaged in a virtual reality experience using a modern VR headset while seated comfortably on a carpeted floor.",
              "The logo of 'Kids Paradise' features playful typography, silhouettes of children, and a vibrant tree symbolizing growth and learning",
              "A compact Canon digital camera with a rear display and multiple control buttons is placed on a textured surface, ready for capturing moments.",
              "
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => setPrompt(example)}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 p-3 rounded-lg text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
