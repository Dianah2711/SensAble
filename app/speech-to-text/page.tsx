"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, AlertCircle, CheckCircle, Info } from "lucide-react"
import RecorderButton from "@/components/recorder-button"
import TranscriptDisplay from "@/components/transcript-display"
import { transcribeAudio, type SpeechToTextResult, type SpeechToTextError } from "@/lib/speech-to-text"

export default function SpeechToTextPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string>("")
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [actualMimeType, setActualMimeType] = useState<string>("")
  const [transcriptionSource, setTranscriptionSource] = useState<string>("")

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Check microphone permission
  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())
      setHasPermission(true)
      return true
    } catch (err) {
      setHasPermission(false)
      setError("Microphone access denied. Please allow microphone access and refresh the page.")
      return false
    }
  }

  const getMimeType = () => {
    const types = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg", "audio/mp4"]
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }
    // Fallback to a default if no specific type is supported, though this might still cause issues
    console.warn("No specific MediaRecorder MIME type supported, falling back to audio/webm.")
    return "audio/webm"
  }

  const startRecording = async () => {
    setError("")

    // Check permission first
    const hasAccess = await checkMicrophonePermission()
    if (!hasAccess) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      })

      audioChunksRef.current = []
      const mimeType = getMimeType() // Get the best supported MIME type
      setActualMimeType(mimeType) // Store it for Blob creation

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: mimeType, // Use the dynamically determined MIME type
      })

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = async () => {
        // Check if any audio data was collected
        if (audioChunksRef.current.length === 0) {
          setError("No audio data recorded. Please ensure your microphone is working and you spoke.")
          setIsProcessing(false)
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        // Use the stored actualMimeType when creating the Blob
        const audioBlob = new Blob(audioChunksRef.current, { type: actualMimeType })
        await processAudio(audioBlob)

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorderRef.current.start(1000) // Collect data every second
      setIsRecording(true)
    } catch (err) {
      console.error("Error starting recording:", err)
      setError(
        "Failed to start recording. Please check your microphone and ensure it's not in use by another application.",
      )
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsProcessing(true)
    }
  }

  const processAudio = async (audioBlob: Blob) => {
    try {
      setIsProcessing(true)
      setError("")

      const result: SpeechToTextResult = await transcribeAudio(audioBlob)
      setTranscript(result.transcript)
      setTranscriptionSource(result.source || "unknown")

      // Announce result for accessibility
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const sourceText =
          result.source === "fallback" || result.source === "fallback_after_error"
            ? "Demonstration transcription ready: "
            : "Transcription complete: "
        const utterance = new SpeechSynthesisUtterance(sourceText + result.transcript)
        utterance.rate = 0.8
        window.speechSynthesis.speak(utterance)
      }
    } catch (err) {
      const error = err as SpeechToTextError
      console.error("Transcription error:", error)
      setError(error.message || "Failed to transcribe audio. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const clearTranscript = () => {
    setTranscript("")
    setError("")
    setTranscriptionSource("")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
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

          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">Speech to Text Converter</h1>
          <p className="text-lg text-slate-600 mb-4">
            Tap the button and speak. The app will transcribe your speech into text.
          </p>

          {/* Permission Status */}
          {hasPermission !== null && (
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                hasPermission ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
            >
              {hasPermission ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Microphone Ready</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Microphone Access Needed</span>
                </>
              )}
            </div>
          )}

          {/* API Status Info */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-blue-800">
                <p className="font-medium mb-1">Demo Mode Active</p>
                <p className="text-sm">
                  The app is running in demonstration mode with fallback transcription. For full AI-powered speech
                  recognition, configure the OpenAI API key.
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Recording Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">Voice Recording</h2>

            <RecorderButton
              isRecording={isRecording}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              disabled={hasPermission === false || isProcessing}
            />

            {/* Instructions */}
            <div className="mt-8 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
                <ul className="text-blue-700 text-sm space-y-1 text-left">
                  <li>• Click the microphone button to start recording</li>
                  <li>• Speak clearly and at a normal pace</li>
                  <li>• Click the stop button when finished</li>
                  <li>• Wait for the transcription to process</li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h3 className="font-semibold text-amber-800 mb-2">Tips for Better Results:</h3>
                <ul className="text-amber-700 text-sm space-y-1 text-left">
                  <li>• Use a quiet environment</li>
                  <li>• Speak directly into your microphone</li>
                  <li>• Avoid background noise</li>
                  <li>• Pause between sentences</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Transcript Section */}
          <div>
            <TranscriptDisplay
              transcript={transcript}
              isProcessing={isProcessing}
              error={error}
              onClear={clearTranscript}
            />

            {/* Source Information */}
            {transcript && transcriptionSource && (
              <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      transcriptionSource === "openai"
                        ? "bg-green-400"
                        : transcriptionSource === "browser"
                          ? "bg-blue-400"
                          : "bg-orange-400"
                    }`}
                  />
                  <span className="text-sm text-slate-600">
                    Source:{" "}
                    {transcriptionSource === "openai"
                      ? "AI Enhanced"
                      : transcriptionSource === "browser"
                        ? "Browser Speech Recognition"
                        : "Demo Mode"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <span className="text-2xl">🎤</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">High-Quality Recording</h3>
            <p className="text-slate-600 text-sm">
              Advanced audio processing with noise cancellation for clear recordings.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Smart Fallbacks</h3>
            <p className="text-slate-600 text-sm">
              Multiple transcription methods with browser and cloud-based options.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Export Options</h3>
            <p className="text-slate-600 text-sm">Copy to clipboard, download as text file, or read aloud.</p>
          </div>
        </div>
      </div>
    </main>
  )
}
