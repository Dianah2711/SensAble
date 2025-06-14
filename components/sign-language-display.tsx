"use client"

import { useState, useEffect } from "react"

interface SignLanguageDisplayProps {
  text: string
  onComplete?: () => void
}

// Sign language representations for common phrases
const signLanguageDatabase: Record<string, string[]> = {
  "how are you": ["👋 (Wave hello)", "👆 (Point to person)", "🤔 (Questioning expression)", "👍👎 (Good/bad gesture)"],
  "i am hungry": [
    "👆 (Point to self)",
    "🍽️ (Eating gesture - hand to mouth)",
    "😋 (Hungry expression)",
    "🤲 (Open hands asking)",
  ],
  "i love you": ["👆 (Point to self)", "❤️ (Heart shape with hands)", "👆 (Point to person)", "🤗 (Hugging gesture)"],
  "i want to sleep": [
    "👆 (Point to self)",
    "😴 (Sleepy expression)",
    "🛏️ (Pillow gesture - head on hands)",
    "💤 (Sleeping motion)",
  ],
  "thank you": ["🙏 (Prayer hands at chin)", "👋 (Move hand forward)", "😊 (Grateful expression)"],
  hello: ["👋 (Wave with open hand)", "😊 (Friendly expression)"],
  goodbye: ["👋 (Wave goodbye)", "🚶 (Walking away gesture)"],
  yes: ["✊ (Closed fist)", "👇 (Nod down motion)"],
  no: ["✋ (Open hand)", "👈👉 (Side to side motion)"],
}

export default function SignLanguageDisplay({ text, onComplete }: SignLanguageDisplayProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [signSteps, setSignSteps] = useState<string[]>([])
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const lowerText = text.toLowerCase().trim()

    // Find matching sign language sequence
    const matchedSigns = signLanguageDatabase[lowerText] || [
      "🤟 (Sign language gesture)",
      "👐 (Open hands)",
      "📝 (Spelling out letters)",
    ]

    setSignSteps(matchedSigns)
    setCurrentStep(0)
    setIsAnimating(true)

    // Auto-advance through sign steps
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < matchedSigns.length - 1) {
          return prev + 1
        } else {
          setIsAnimating(false)
          onComplete?.()
          clearInterval(interval)
          return prev
        }
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [text, onComplete])

  if (!signSteps.length) return null

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <h3 className="font-semibold text-slate-800 mb-4">Sign Language for: "{text}"</h3>

      <div className="bg-slate-900 rounded-lg p-8 text-center mb-4">
        <div className="text-6xl mb-4">{signSteps[currentStep]?.split(" ")[0] || "🤟"}</div>
        <p className="text-white text-lg font-medium">
          Step {currentStep + 1} of {signSteps.length}
        </p>
        <p className="text-slate-300 text-sm mt-2">{signSteps[currentStep]}</p>
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center space-x-2 mb-4">
        {signSteps.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${
              index <= currentStep ? "bg-blue-600" : "bg-slate-300"
            }`}
          />
        ))}
      </div>

      {/* All steps preview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {signSteps.map((step, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border text-center transition-colors ${
              index === currentStep
                ? "border-blue-600 bg-blue-50"
                : index < currentStep
                  ? "border-green-600 bg-green-50"
                  : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="text-2xl mb-1">{step.split(" ")[0]}</div>
            <p className="text-xs text-slate-600">Step {index + 1}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="bg-slate-600 hover:bg-slate-700 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg text-sm"
        >
          ⏮️ Previous
        </button>
        <button
          onClick={() => setCurrentStep(Math.min(signSteps.length - 1, currentStep + 1))}
          disabled={currentStep === signSteps.length - 1}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg text-sm"
        >
          ⏭️ Next
        </button>
        <button
          onClick={() => {
            setCurrentStep(0)
            setIsAnimating(true)
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          🔄 Replay
        </button>
      </div>
    </div>
  )
}
