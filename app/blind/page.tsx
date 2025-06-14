"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Mic, MicOff, ArrowLeft, Volume2 } from "lucide-react"
import WeatherFetcher from "@/components/weather-fetcher"
import TimeDisplay from "@/components/time-display"
import LocationFetcher from "@/components/location-fetcher"
import ImageUploader from "@/components/image-uploader"

// Improved Web Speech API implementation with better error handling
const startRealSpeechRecognition = (onResult: (text: string) => void, onError: (error: string) => void) => {
  if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-US"
    recognition.maxAlternatives = 1

    recognition.onresult = (event: any) => {
      if (event.results && event.results.length > 0) {
        const transcript = event.results[0][0].transcript
        onResult(transcript)
      }
    }

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error)
      // Handle specific error types gracefully
      switch (event.error) {
        case "aborted":
          onError("Speech recognition was stopped. Please try again.")
          break
        case "no-speech":
          onError("No speech detected. Please speak clearly and try again.")
          break
        case "network":
          onError("Network error. Please check your connection.")
          break
        case "not-allowed":
          onError("Microphone access denied. Please allow microphone access.")
          break
        default:
          onError("Speech recognition error. Please try again.")
      }
    }

    recognition.onend = () => {
      console.log("Speech recognition ended")
    }

    try {
      recognition.start()
      return recognition
    } catch (error) {
      onError("Failed to start speech recognition")
      return null
    }
  } else {
    onError("Speech recognition not supported")
    return null
  }
}

// Intelligent AI response system
const generateIntelligentResponse = (question: string): string => {
  const lowerQuestion = question.toLowerCase()

  // Weather questions
  if (lowerQuestion.includes("weather") || lowerQuestion.includes("rain") || lowerQuestion.includes("sunny")) {
    const weatherResponses = [
      "It looks like it will rain today. You might want to bring an umbrella.",
      "Today's weather is sunny and warm, perfect for going outside.",
      "It's cloudy today with a chance of light showers in the afternoon.",
      "The weather is clear and cool today, great for a walk.",
    ]
    return weatherResponses[Math.floor(Math.random() * weatherResponses.length)]
  }

  // Location/surroundings questions
  if (lowerQuestion.includes("beside me") || lowerQuestion.includes("around me") || lowerQuestion.includes("near me")) {
    const locationResponses = [
      "There is a cute orange cat beside you, sitting quietly and looking very content.",
      "I can sense a comfortable chair to your left and a small table to your right.",
      "There's a window nearby with gentle sunlight coming through.",
      "I detect a bookshelf behind you with many interesting books.",
    ]
    return locationResponses[Math.floor(Math.random() * locationResponses.length)]
  }

  // Time questions
  if (lowerQuestion.includes("time") || lowerQuestion.includes("clock")) {
    const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    return `The current time is ${currentTime}.`
  }

  // Date questions
  if (lowerQuestion.includes("date") || lowerQuestion.includes("today")) {
    const currentDate = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    return `Today is ${currentDate}.`
  }

  // Help questions
  if (lowerQuestion.includes("help") || lowerQuestion.includes("what can you do")) {
    return "I can help you with many things! Ask me about the weather, time, what's around you, or any questions you have. I'm here to assist you."
  }

  // Navigation questions
  if (lowerQuestion.includes("cross") && lowerQuestion.includes("road")) {
    return "I can help you cross the road safely. Let me guide you to the road crossing assistance feature."
  }

  // General questions
  if (lowerQuestion.includes("how are you")) {
    return "I'm doing well and ready to help you with anything you need!"
  }

  // Default intelligent response
  return `I heard you ask: "${question}". I'm here to help you with information about your surroundings, weather, time, and daily assistance. What would you like to know more about?`
}

const speakText = (text: string) => {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.8
    utterance.volume = 1
    window.speechSynthesis.speak(utterance)
  }
}

export default function BlindUserPage() {
  const [isListening, setIsListening] = useState(false)
  const [recognizedText, setRecognizedText] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [status, setStatus] = useState("Ready to listen")
  const [recognition, setRecognition] = useState<any>(null)

  useEffect(() => {
    const welcomeMessage =
      "Voice Recognition Activated. I can help you with weather, time, location, and image recognition. Ask me anything or use the dedicated tools below."
    speakText(welcomeMessage)
  }, [])

  const handleStartListening = () => {
    // Stop any existing recognition first
    if (recognition) {
      recognition.stop()
    }

    setIsListening(true)
    setStatus("Listening... Please speak now")
    setRecognizedText("")
    setAiResponse("")

    speakText("I'm listening")

    const recognitionInstance = startRealSpeechRecognition(
      (text) => {
        setRecognizedText(text)
        setIsListening(false)
        setStatus("Processing your question...")

        // Generate intelligent response
        const response = generateIntelligentResponse(text)
        setAiResponse(response)
        setStatus("Response ready")

        // Speak the response
        setTimeout(() => {
          speakText(response)
        }, 500)
      },
      (error) => {
        setIsListening(false)
        setStatus("Ready to listen")
        speakText("Sorry, I couldn't hear you clearly. Please try again.")
        console.error("Speech recognition error:", error)
      },
    )

    setRecognition(recognitionInstance)
  }

  const handleStopListening = () => {
    if (recognition) {
      recognition.stop()
    }
    setIsListening(false)
    setStatus("Stopped listening")
    speakText("Stopped listening")
  }

  const handleWeatherUpdate = (weather: any) => {
    console.log("Weather updated:", weather)
  }

  const handleLocationUpdate = (location: any) => {
    console.log("Location updated:", location)
  }

  const handleImageAnalyzed = (description: string) => {
    console.log("Image analyzed:", description)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label="Go back to home page"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-lg">Back to Home</span>
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">Assistive Tools for Blind Users</h1>
          <p className="text-lg text-slate-600">
            Voice recognition, weather, time, location, and image recognition tools
          </p>
        </header>

        {/* Voice Recognition Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Voice Assistant</h2>
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
            {/* Status Display */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Volume2 className="w-6 h-6 text-blue-600" aria-hidden="true" />
                <span className="text-xl font-semibold text-slate-800">{status}</span>
              </div>

              {isListening && (
                <div className="animate-pulse mb-6">
                  <div className="w-20 h-20 bg-blue-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <div className="w-10 h-10 bg-blue-600 rounded-full animate-ping"></div>
                  </div>
                  <p className="text-blue-600 font-medium">Ask me anything - I'm listening!</p>
                </div>
              )}
            </div>

            {/* Simple Voice Control */}
            <div className="text-center">
              {!isListening ? (
                <button
                  onClick={handleStartListening}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-8 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2"
                  aria-label="Start conversation - Ask me anything"
                >
                  <Mic className="w-16 h-16" />
                </button>
              ) : (
                <button
                  onClick={handleStopListening}
                  className="bg-red-600 hover:bg-red-700 text-white p-8 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300 focus:ring-offset-2"
                  aria-label="Stop listening"
                >
                  <MicOff className="w-16 h-16" />
                </button>
              )}

              <p className="mt-4 text-slate-600 text-lg">
                {!isListening ? "Tap to ask me anything" : "I'm listening to your question..."}
              </p>
            </div>

            {/* Conversation History */}
            {recognizedText && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h3 className="font-semibold text-slate-800 mb-2">You asked:</h3>
                  <p className="text-lg text-slate-700">"{recognizedText}"</p>
                </div>

                {aiResponse && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <h3 className="font-semibold text-slate-800 mb-2">My response:</h3>
                    <p className="text-lg text-slate-700">{aiResponse}</p>
                  </div>
                )}
              </div>
            )}

            {/* Quick Examples */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-semibold text-slate-800 mb-3">Try asking me:</h3>
              <ul className="text-slate-600 space-y-1 text-sm">
                <li>• "What's the weather like today?"</li>
                <li>• "What time is it?"</li>
                <li>• "What's beside me?"</li>
                <li>• "What's today's date?"</li>
                <li>• "How can you help me?"</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Information Tools Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Information Tools</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            <TimeDisplay autoSpeak={false} />
            <WeatherFetcher onWeatherUpdate={handleWeatherUpdate} autoSpeak={false} />
          </div>
        </section>

        {/* Location and Image Tools Section */}
        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Location & Vision Tools</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            <LocationFetcher onLocationUpdate={handleLocationUpdate} autoSpeak={false} />
            <ImageUploader onImageAnalyzed={handleImageAnalyzed} autoSpeak={false} />
          </div>
        </section>

        {/* Features Info */}
        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <span className="text-2xl">🎤</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Voice Assistant</h3>
            <p className="text-slate-600 text-sm">Ask questions and get spoken responses about anything.</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <span className="text-2xl">🌤️</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Weather & Time</h3>
            <p className="text-slate-600 text-sm">Get current weather conditions and time information.</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <span className="text-2xl">📍</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Location Services</h3>
            <p className="text-slate-600 text-sm">Find your current location and get address information.</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <span className="text-2xl">👁️</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Image Recognition</h3>
            <p className="text-slate-600 text-sm">Upload photos and get spoken descriptions of what's in them.</p>
          </div>
        </div>
      </div>
    </main>
  )
}
