"use client"

import { useState } from "react"
import { Mic, MicOff, AlertCircle, CheckCircle } from "lucide-react"

interface MicAccessProps {
  onPermissionGranted: (stream: MediaStream) => void
  onPermissionDenied: () => void
  isActive: boolean
}

export default function MicAccess({ onPermissionGranted, onPermissionDenied, isActive }: MicAccessProps) {
  const [permissionStatus, setPermissionStatus] = useState<"unknown" | "granted" | "denied" | "requesting">("unknown")
  const [error, setError] = useState<string>("")

  const requestMicrophoneAccess = async () => {
    setPermissionStatus("requesting")
    setError("")

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })

      setPermissionStatus("granted")
      onPermissionGranted(stream)
    } catch (err) {
      console.error("Microphone access error:", err)
      setPermissionStatus("denied")

      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setError("Microphone access denied. Please allow microphone access and try again.")
        } else if (err.name === "NotFoundError") {
          setError("No microphone found. Please connect a microphone and try again.")
        } else {
          setError("Failed to access microphone. Please check your device settings.")
        }
      }

      onPermissionDenied()
    }
  }

  const getStatusIcon = () => {
    switch (permissionStatus) {
      case "granted":
        return <CheckCircle className="w-6 h-6 text-green-600" />
      case "denied":
        return <AlertCircle className="w-6 h-6 text-red-600" />
      case "requesting":
        return <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      default:
        return <Mic className="w-6 h-6 text-slate-600" />
    }
  }

  const getStatusText = () => {
    switch (permissionStatus) {
      case "granted":
        return "Microphone Ready"
      case "denied":
        return "Microphone Access Denied"
      case "requesting":
        return "Requesting Access..."
      default:
        return "Microphone Access Required"
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
        {getStatusIcon()}
        Microphone Access
      </h2>

      <div className="space-y-4">
        <div
          className={`p-4 rounded-xl border-2 ${
            permissionStatus === "granted"
              ? "border-green-200 bg-green-50"
              : permissionStatus === "denied"
                ? "border-red-200 bg-red-50"
                : "border-slate-200 bg-slate-50"
          }`}
        >
          <p className="font-medium text-slate-800 mb-2">{getStatusText()}</p>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>

        {permissionStatus !== "granted" && (
          <button
            onClick={requestMicrophoneAccess}
            disabled={permissionStatus === "requesting"}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-3 px-6 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
            aria-label="Request microphone access"
          >
            {permissionStatus === "requesting" ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Requesting Access...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Mic className="w-5 h-5" />
                Allow Microphone Access
              </div>
            )}
          </button>
        )}

        {permissionStatus === "granted" && (
          <div className="text-center">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                isActive ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"
              }`}
            >
              {isActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              <span className="text-sm font-medium">{isActive ? "Monitoring Active" : "Monitoring Stopped"}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
