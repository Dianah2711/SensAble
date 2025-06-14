"use client"

import type React from "react"

import { useState } from "react"
import { Mic, Square } from "lucide-react"

interface RecorderButtonProps {
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => void
  disabled?: boolean
}

export default function RecorderButton({
  isRecording,
  onStartRecording,
  onStopRecording,
  disabled = false,
}: RecorderButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  const handleClick = () => {
    if (isRecording) {
      onStopRecording()
    } else {
      onStartRecording()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      setIsPressed(true)
      handleClick()
    }
  }

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      setIsPressed(false)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        disabled={disabled}
        className={`
          relative w-32 h-32 rounded-full shadow-lg transition-all duration-200 
          focus:outline-none focus:ring-4 focus:ring-offset-2
          ${
            isRecording
              ? "bg-red-600 hover:bg-red-700 focus:ring-red-300 animate-pulse"
              : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-300 hover:scale-105"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${isPressed ? "scale-95" : ""}
        `}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
        aria-pressed={isRecording}
        role="button"
        tabIndex={0}
      >
        <div className="flex items-center justify-center w-full h-full text-white">
          {isRecording ? (
            <div className="flex flex-col items-center">
              <Square className="w-12 h-12 mb-1" fill="currentColor" />
              <span className="text-xs font-medium">STOP</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Mic className="w-12 h-12 mb-1" />
              <span className="text-xs font-medium">TAP</span>
            </div>
          )}
        </div>

        {/* Recording indicator ring */}
        {isRecording && <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping"></div>}
      </button>

      {/* Status text */}
      <div className="text-center">
        <p className={`text-lg font-semibold ${isRecording ? "text-red-600" : "text-slate-700"}`}>
          {isRecording ? "Recording..." : "Tap to Record"}
        </p>
        <p className="text-sm text-slate-500 mt-1">
          {isRecording ? "Speak clearly into your microphone" : "Press and hold or tap to start"}
        </p>
      </div>
    </div>
  )
}
