"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Navigation, AlertTriangle, CheckCircle } from "lucide-react"

// Placeholder function for AI-generated crossing instructions
const generateCrossingInstructions = async (): Promise<string[]> => {
  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  return [
    "Traffic light detected ahead",
    "Wait for the pedestrian signal",
    "Listen for traffic sounds",
    "Look left, then right, then left again",
    "Cross when safe - you have 30 seconds",
    "Walk straight across the crosswalk",
    "You have successfully crossed the road",
  ]
}

const speakText = (text: string) => {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.8
    utterance.volume = 1
    window.speechSynthesis.speak(utterance)
  }
}

export default function CrossRoadPage() {
  const [isActive, setIsActive] = useState(false)
  const [instructions, setInstructions] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const handleStartAssistance = async () => {
    setIsLoading(true)
    setIsActive(true)
    setCurrentStep(0)

    speakText("Starting road crossing assistance. Please wait while I analyze the environment.")

    try {
      const newInstructions = await generateCrossingInstructions()
      setInstructions(newInstructions)
      setIsLoading(false)

      // Start reading first instruction
      if (newInstructions.length > 0) {
        speakText(newInstructions[0])
      }
    } catch (error) {
      setIsLoading(false)
      speakText("Sorry, there was an error. Please try again.")
    }
  }

  const handleNextStep = () => {
    if (currentStep < instructions.length - 1) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      speakText(instructions[nextStep])
    } else {
      setIsActive(false)
      speakText("Road crossing assistance completed. Stay safe!")
    }
  }

  const handleStopAssistance = () => {
    setIsActive(false)
    setInstructions([])
    setCurrentStep(0)
    speakText("Road crossing assistance stopped.")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-4 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
            aria-label="Go back to home page"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-lg">Back to Home</span>
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">Cross Road Assistance</h1>
          <p className="text-lg text-slate-600">AI-powered guidance for safe road crossing</p>
        </header>

        {/* Main Interface */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
          {!isActive && !isLoading && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-orange-100 rounded-full mx-auto flex items-center justify-center">
                <Navigation className="w-10 h-10 text-orange-600" />
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-slate-800 mb-2">Ready to Help You Cross</h2>
                <p className="text-slate-600">Press the button below to start AI-guided road crossing assistance</p>
              </div>

              <button
                onClick={handleStartAssistance}
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2"
                aria-label="Start road crossing assistance"
              >
                Start Crossing Assistance
              </button>
            </div>
          )}

          {isLoading && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-orange-200 rounded-full mx-auto flex items-center justify-center">
                <div className="w-8 h-8 bg-orange-600 rounded-full animate-ping"></div>
              </div>
              <h2 className="text-xl font-semibold text-slate-800">Analyzing Environment...</h2>
              <p className="text-slate-600">Please wait while I assess the road conditions</p>
            </div>
          )}

          {isActive && instructions.length > 0 && (
            <div className="space-y-6">
              {/* Progress Indicator */}
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>
                  Step {currentStep + 1} of {instructions.length}
                </span>
                <div className="flex-1 mx-4 bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / instructions.length) * 100}%` }}
                  ></div>
                </div>
                <span>{Math.round(((currentStep + 1) / instructions.length) * 100)}%</span>
              </div>

              {/* Current Instruction */}
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-2">Current Instruction:</h3>
                    <p className="text-lg text-slate-700">{instructions[currentStep]}</p>
                  </div>
                </div>
              </div>

              {/* All Instructions List */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-800">All Steps:</h3>
                {instructions.map((instruction, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      index < currentStep
                        ? "bg-green-50 border border-green-200"
                        : index === currentStep
                          ? "bg-orange-50 border border-orange-200"
                          : "bg-slate-50 border border-slate-200"
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : index === currentStep ? (
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
                    )}
                    <span className={`${index <= currentStep ? "text-slate-800" : "text-slate-500"}`}>
                      {instruction}
                    </span>
                  </div>
                ))}
              </div>

              {/* Control Buttons */}
              <div className="flex gap-4 justify-center">
                {currentStep < instructions.length - 1 ? (
                  <button
                    onClick={handleNextStep}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2"
                    aria-label="Next step"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    onClick={handleNextStep}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2"
                    aria-label="Complete crossing"
                  >
                    Complete Crossing
                  </button>
                )}

                <button
                  onClick={handleStopAssistance}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
                  aria-label="Stop assistance"
                >
                  Stop Assistance
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Safety Tips */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Safety Tips:</h3>
          <ul className="space-y-2 text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
              <span>Always listen for audio cues and traffic sounds</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
              <span>Use designated crosswalks when available</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
              <span>Take your time and don't rush</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}
