"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Volume2, Eye, Ear, MessageSquare, Mic, MicOff } from "lucide-react"

// Modified text-to-speech function with callback
const speakText = (text: string, onEnd?: () => void) => {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.8
    utterance.volume = 1

    if (onEnd) {
      utterance.onend = onEnd
    }

    window.speechSynthesis.speak(utterance)
  } else {
    if (onEnd) onEnd() // immediately call onEnd if TTS not supported
  }
}

// Web Speech API implementation
const startVoiceRecognition = (onResult: (text: string) => void, onError: (error: string) => void) => {
  if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-US"
    recognition.maxAlternatives = 1

    recognition.onresult = (event: any) => {
      if (event.results && event.results.length > 0) {
        const transcript = event.results[0][0].transcript.toLowerCase().trim()
        console.log("Voice recognition result:", transcript)
        onResult(transcript)
      }
    }

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error)
      onError(`Speech recognition error: ${event.error}`)
    }

    recognition.onend = () => {
      console.log("Speech recognition ended")
    }

    try {
      recognition.start()
      return recognition
    } catch (error) {
      console.error("Failed to start recognition:", error)
      onError("Failed to start speech recognition")
      return null
    }
  } else {
    onError("Speech recognition not supported in this browser")
    return null
  }
}

export default function WelcomePage() {
  const [isListening, setIsListening] = useState(false)
  const [hasSpokenWelcome, setHasSpokenWelcome] = useState(false)
  const [recognizedCommand, setRecognizedCommand] = useState("")
  const [recognition, setRecognition] = useState<any>(null)
  const [isReadyToSpeak, setIsReadyToSpeak] = useState(false)

  const handleVoiceCommand = (transcript: string) => {
    setRecognizedCommand(transcript)
    console.log("Processing voice command:", transcript)

    if (
      transcript.includes("cannot see") ||
      transcript.includes("can't see") ||
      transcript.includes("blind") ||
      transcript.includes("i can not see") ||
      transcript.includes("i can't see") ||
      transcript.includes("unable to see") ||
      transcript.includes("i cannot see")
    ) {
      speakText("Navigating to voice assistance for blind users")
      setTimeout(() => (window.location.href = "/blind"), 1500)
    } else if (
      transcript.includes("cannot hear") ||
      transcript.includes("can't hear") ||
      transcript.includes("deaf") ||
      transcript.includes("i can not hear") ||
      transcript.includes("i can't hear") ||
      transcript.includes("unable to hear") ||
      transcript.includes("i cannot hear")
    ) {
      speakText("Navigating to text communication for deaf users")
      setTimeout(() => (window.location.href = "/deaf"), 1500)
    } else if (
      transcript.includes("cannot talk") ||
      transcript.includes("can't talk") ||
      transcript.includes("mute") ||
      transcript.includes("i can not talk") ||
      transcript.includes("i can't talk") ||
      transcript.includes("unable to talk") ||
      transcript.includes("i cannot talk")
    ) {
      speakText("Navigating to text-to-speech for mute users")
      setTimeout(() => (window.location.href = "/mute"), 1500)
    } else {
      speakText("I heard: " + transcript + ". Please say 'I cannot see', 'I cannot hear', or 'I cannot talk'")
      setIsListening(false)
      setIsReadyToSpeak(false)
    }
  }

  const startListening = () => {
    if (recognition) {
      recognition.stop()
    }

    setIsListening(false)
    setRecognizedCommand("")

    // Speak first, then only start recognition after TTS finishes
    speakText("I'm listening. Please say your choice now.", () => {
      const recognitionInstance = startVoiceRecognition(
        (transcript) => {
          handleVoiceCommand(transcript)
          setIsListening(false)
        },
        (error) => {
          console.error("Voice recognition error:", error)
          speakText("Sorry, I couldn't hear you clearly. Please try the button again.")
          setIsListening(false)
          setIsReadyToSpeak(false)
        },
      )

      setRecognition(recognitionInstance)
      setIsListening(true)
    })
  }

  const handleReadyToSpeak = () => {
    setIsReadyToSpeak(true)
    startListening()
  }

  const stopListening = () => {
    if (recognition) {
      recognition.stop()
    }
    setIsListening(false)
    setIsReadyToSpeak(false)
    speakText("Voice recognition stopped")
  }

  useEffect(() => {
    if (!hasSpokenWelcome) {
      const welcomeMessage =
        "Welcome to SensAble. Press the 'Ready to Speak' button, then say 'I cannot see', 'I cannot hear', or 'I cannot talk' to navigate."
      speakText(welcomeMessage)
      setHasSpokenWelcome(true)
    }
  }, [hasSpokenWelcome])

  const handleOptionClick = (option: string) => {
    speakText(`You selected: ${option}`)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center space-y-8">
        <header className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-800 tracking-tight">SensAble</h1>
          <div className="flex items-center justify-center gap-2 text-slate-600">
            <Volume2 className="w-6 h-6" aria-hidden="true" />
            <p className="text-lg md:text-xl">Empowering accessibility for everyone</p>
          </div>
        </header>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-slate-200">
          <p className="text-xl md:text-2xl text-slate-700 mb-6 leading-relaxed">
            Welcome to SensAble. Choose your option:
          </p>
          <p className="text-lg text-slate-600 mb-8">
            Press "Ready to Speak" then say: I cannot see, I cannot hear, I cannot talk
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-200 mb-6">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">Voice Navigation</h2>

            {!isListening && !isReadyToSpeak && (
              <button
                onClick={handleReadyToSpeak}
                className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2"
                aria-label="Ready to speak - Press to start voice recognition"
              >
                <Mic className="w-12 h-12" />
              </button>
            )}

            {isListening && (
              <button
                onClick={stopListening}
                className="bg-red-600 hover:bg-red-700 text-white p-6 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300 focus:ring-offset-2 animate-pulse"
                aria-label="Stop listening"
              >
                <MicOff className="w-12 h-12" />
              </button>
            )}

            <p className="text-slate-600 text-lg">
              {!isListening && !isReadyToSpeak && "Press 'Ready to Speak' to start"}
              {isListening && "🎤 Listening... Say your choice now"}
              {!isListening && isReadyToSpeak && "Voice recognition ready"}
            </p>

            {recognizedCommand && (
              <p className="text-green-600 font-medium bg-green-50 p-3 rounded-lg">Heard: "{recognizedCommand}"</p>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:gap-8 max-w-2xl mx-auto">
          <Link
            href="/blind"
            onClick={() => handleOptionClick("I cannot see")}
            className="group bg-blue-600 hover:bg-blue-700 text-white p-6 md:p-8 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2"
          >
            <div className="flex items-center justify-center gap-4">
              <Eye className="w-8 h-8 md:w-10 md:h-10" />
              <span className="text-xl md:text-2xl font-semibold">I cannot see</span>
            </div>
            <p className="mt-2 text-blue-100 text-sm md:text-base">Voice recognition activated</p>
          </Link>

          <Link
            href="/deaf"
            onClick={() => handleOptionClick("I cannot hear")}
            className="group bg-green-600 hover:bg-green-700 text-white p-6 md:p-8 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-offset-2"
          >
            <div className="flex items-center justify-center gap-4">
              <Ear className="w-8 h-8 md:w-10 md:h-10" />
              <span className="text-xl md:text-2xl font-semibold">I cannot hear</span>
            </div>
            <p className="mt-2 text-green-100 text-sm md:text-base">Text-based communication</p>
          </Link>

          <Link
            href="/mute"
            onClick={() => handleOptionClick("I cannot talk")}
            className="group bg-purple-600 hover:bg-purple-700 text-white p-6 md:p-8 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-offset-2"
          >
            <div className="flex items-center justify-center gap-4">
              <MessageSquare className="w-8 h-8 md:w-10 md:h-10" />
              <span className="text-xl md:text-2xl font-semibold">I cannot talk</span>
            </div>
            <p className="mt-2 text-purple-100 text-sm md:text-base">Text-to-speech conversion</p>
          </Link>
        </div>

        <footer className="text-slate-500 text-sm">
          <p>Designed for accessibility and ease of use</p>
        </footer>
      </div>
    </main>
  )
}
