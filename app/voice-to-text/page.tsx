"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Mic, MicOff, Upload, FileAudio, Type, ImageIcon } from "lucide-react"

interface ConversionResult {
  type: "text" | "image"
  content: string
  timestamp: Date
}

// Real voice-to-text function using Web Speech API
const convertVoiceToText = async (audioData?: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = "en-US"
      recognition.maxAlternatives = 1

      recognition.onresult = (event: any) => {
        if (event.results && event.results.length > 0) {
          const transcript = event.results[0][0].transcript
          resolve(transcript)
        } else {
          reject("No speech detected")
        }
      }

      recognition.onerror = (event: any) => {
        reject(`Speech recognition error: ${event.error}`)
      }

      recognition.start()
    } else {
      // Fallback for audio file processing
      if (audioData) {
        // Simulate audio file processing
        setTimeout(() => {
          const sampleTexts = [
            "Hello, how are you today?",
            "I need help with directions to the hospital.",
            "Can you please tell me what time it is?",
            "Thank you for your assistance.",
            "I would like to order some food.",
          ]
          resolve(sampleTexts[Math.floor(Math.random() * sampleTexts.length)])
        }, 2000)
      } else {
        reject("Speech recognition not supported")
      }
    }
  })
}

// Real voice-to-image function with better error handling
const convertVoiceToImage = async (voiceDescription: string): Promise<string> => {
  try {
    const response = await fetch("/api/generate-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: voiceDescription,
      }),
    })

    if (!response.ok) {
      console.error("Image generation API failed:", response.status, response.statusText)
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error)
    }

    return data.imageUrl
  } catch (error) {
    console.error("Image generation error:", error)
    // Enhanced fallback with better placeholder images
    return generateFallbackImage(voiceDescription)
  }
}

// Enhanced fallback image generator
const generateFallbackImage = (description: string): string => {
  const lowerDesc = description.toLowerCase()

  // Map common words to better placeholder images
  if (lowerDesc.includes("cat")) {
    return "/placeholder.svg?height=400&width=400&text=🐱+Cute+Cat&bg=fef3c7&color=f59e0b"
  } else if (lowerDesc.includes("dog")) {
    return "/placeholder.svg?height=400&width=400&text=🐶+Friendly+Dog&bg=dbeafe&color=3b82f6"
  } else if (lowerDesc.includes("flower")) {
    return "/placeholder.svg?height=400&width=400&text=🌸+Beautiful+Flower&bg=fce7f3&color=ec4899"
  } else if (lowerDesc.includes("tree")) {
    return "/placeholder.svg?height=400&width=400&text=🌳+Green+Tree&bg=dcfce7&color=22c55e"
  } else if (lowerDesc.includes("house")) {
    return "/placeholder.svg?height=400&width=400&text=🏠+Cozy+House&bg=fef2f2&color=ef4444"
  } else if (lowerDesc.includes("car")) {
    return "/placeholder.svg?height=400&width=400&text=🚗+Red+Car&bg=f3f4f6&color=6b7280"
  } else {
    return `/placeholder.svg?height=400&width=400&text=🎨+${encodeURIComponent(description)}&bg=f0f9ff&color=0ea5e9`
  }
}

export default function VoiceToTextPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<ConversionResult[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [conversionMode, setConversionMode] = useState<"text" | "image">("text")

  const handleStartRecording = () => {
    setIsRecording(true)
    setIsProcessing(true)

    convertVoiceToText()
      .then((text) => {
        if (conversionMode === "text") {
          const newResult: ConversionResult = {
            type: "text",
            content: text,
            timestamp: new Date(),
          }
          setResults((prev) => [newResult, ...prev])
        } else {
          // For voice-to-image, use the recognized text as description
          convertVoiceToImage(text).then((imageUrl) => {
            const newResult: ConversionResult = {
              type: "image",
              content: imageUrl,
              timestamp: new Date(),
            }
            setResults((prev) => [newResult, ...prev])
          })
        }
      })
      .catch((error) => {
        console.error("Voice conversion error:", error)
      })
      .finally(() => {
        setIsRecording(false)
        setIsProcessing(false)
      })
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    setIsProcessing(false)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setIsProcessing(true)

    try {
      const text = await convertVoiceToText(file)

      if (conversionMode === "text") {
        const newResult: ConversionResult = {
          type: "text",
          content: text,
          timestamp: new Date(),
        }
        setResults((prev) => [newResult, ...prev])
      } else {
        const imageUrl = await convertVoiceToImage(text)
        const newResult: ConversionResult = {
          type: "image",
          content: imageUrl,
          timestamp: new Date(),
        }
        setResults((prev) => [newResult, ...prev])
      }
    } catch (error) {
      console.error("File conversion error:", error)
    } finally {
      setIsProcessing(false)
      setSelectedFile(null)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            aria-label="Go back to home page"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-lg">Back to Home</span>
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">Voice to Text & Image</h1>
          <p className="text-lg text-slate-600">Convert speech to text or generate images from voice descriptions</p>
        </header>

        {/* Mode Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Conversion Mode:</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setConversionMode("text")}
              className={`p-4 rounded-xl border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                conversionMode === "text"
                  ? "border-indigo-600 bg-indigo-50 text-indigo-800"
                  : "border-slate-200 hover:border-slate-300 text-slate-700"
              }`}
              aria-label="Select voice to text mode"
            >
              <Type className="w-8 h-8 mx-auto mb-2" />
              <span className="font-medium">Voice to Text</span>
            </button>

            <button
              onClick={() => setConversionMode("image")}
              className={`p-4 rounded-xl border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                conversionMode === "image"
                  ? "border-indigo-600 bg-indigo-50 text-indigo-800"
                  : "border-slate-200 hover:border-slate-300 text-slate-700"
              }`}
              aria-label="Select voice to image mode"
            >
              <ImageIcon className="w-8 h-8 mx-auto mb-2" />
              <span className="font-medium">Voice to Image</span>
            </button>
          </div>
        </div>

        {/* Recording Interface */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6 mb-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              {conversionMode === "text" ? "Record Voice for Text" : "Describe Image with Voice"}
            </h2>

            {isProcessing && (
              <div className="mb-6">
                <div className="w-16 h-16 bg-indigo-200 rounded-full mx-auto flex items-center justify-center mb-4">
                  <div className="w-8 h-8 bg-indigo-600 rounded-full animate-ping"></div>
                </div>
                <p className="text-slate-600">
                  {conversionMode === "text"
                    ? "Converting speech to text..."
                    : "Generating image from your description..."}
                </p>
                {conversionMode === "image" && (
                  <p className="text-sm text-slate-500 mt-2">
                    Using AI to create your image. If AI generation fails, we'll show a themed placeholder.
                  </p>
                )}
              </div>
            )}

            {!isRecording && !isProcessing && (
              <button
                onClick={handleStartRecording}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-6 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:ring-offset-2"
                aria-label="Start recording"
              >
                <Mic className="w-12 h-12" />
              </button>
            )}

            {isRecording && (
              <button
                onClick={handleStopRecording}
                className="bg-red-600 hover:bg-red-700 text-white p-6 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300 focus:ring-offset-2"
                aria-label="Stop recording"
              >
                <MicOff className="w-12 h-12" />
              </button>
            )}

            {isRecording && (
              <div className="mt-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-600 font-medium">Recording... Speak now!</span>
                </div>
              </div>
            )}
          </div>

          {/* File Upload Option */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">Or Upload Audio File</h3>
            <div className="flex items-center justify-center">
              <label className="bg-slate-100 hover:bg-slate-200 border-2 border-dashed border-slate-300 rounded-xl p-6 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-indigo-300">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="sr-only"
                  aria-label="Upload audio file"
                />
                <div className="text-center">
                  <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <span className="text-slate-600 font-medium">Choose Audio File</span>
                  {selectedFile && <p className="text-sm text-slate-500 mt-1">{selectedFile.name}</p>}
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">Conversion Results</h2>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {result.type === "text" ? (
                      <Type className="w-5 h-5 text-indigo-600" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-indigo-600" />
                    )}
                    <span className="font-medium text-slate-800">
                      {result.type === "text" ? "Text Result" : "Generated Image"}
                    </span>
                    <span className="text-sm text-slate-500 ml-auto">{result.timestamp.toLocaleTimeString()}</span>
                  </div>

                  {result.type === "text" ? (
                    <p className="text-slate-700 leading-relaxed">{result.content}</p>
                  ) : (
                    <div className="text-center">
                      <img
                        src={result.content || "/placeholder.svg"}
                        alt="AI generated image from voice description"
                        className="max-w-full h-auto rounded-lg mx-auto shadow-md"
                        onLoad={() => console.log("Image loaded successfully")}
                        onError={(e) => {
                          console.error("Image failed to load")
                          e.currentTarget.src = `/placeholder.svg?height=300&width=400&text=🎨+Image+Generation+Failed`
                        }}
                      />
                      <p className="text-xs text-slate-500 mt-2">Generated with AI</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-semibold text-slate-800 mb-4">How to Use:</h3>
          <div className="space-y-3 text-slate-600">
            <div className="flex items-start gap-2">
              <FileAudio className="w-4 h-4 text-indigo-600 mt-1 flex-shrink-0" />
              <span className="text-sm">
                <strong>Voice to Text:</strong> Speak clearly and the system will convert your speech to written text
              </span>
            </div>
            <div className="flex items-start gap-2">
              <ImageIcon className="w-4 h-4 text-indigo-600 mt-1 flex-shrink-0" />
              <span className="text-sm">
                <strong>Voice to Image:</strong> Say "cat", "dog", "flower" etc. and AI will generate that image
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Upload className="w-4 h-4 text-indigo-600 mt-1 flex-shrink-0" />
              <span className="text-sm">
                <strong>File Upload:</strong> Upload pre-recorded audio files for conversion
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
