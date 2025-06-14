"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Camera, Scan, CheckCircle, AlertCircle } from "lucide-react"

interface FruitInfo {
  name: string
  ripeness: string
  color: string
  condition: string
  recommendations: string[]
}

// Placeholder function for fruit recognition
const analyzeFruit = async (): Promise<FruitInfo> => {
  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 3000))

  const fruits = [
    {
      name: "Apple",
      ripeness: "Ripe",
      color: "Red with green patches",
      condition: "Good",
      recommendations: [
        "This apple is ready to eat",
        "Store in refrigerator for longer freshness",
        "Good source of fiber and vitamin C",
      ],
    },
    {
      name: "Banana",
      ripeness: "Very ripe",
      color: "Yellow with brown spots",
      condition: "Excellent for eating",
      recommendations: [
        "Perfect for immediate consumption",
        "Great for smoothies or baking",
        "High in potassium and natural sugars",
      ],
    },
    {
      name: "Orange",
      ripeness: "Ripe",
      color: "Bright orange",
      condition: "Fresh",
      recommendations: ["Juicy and ready to eat", "Rich in vitamin C", "Store at room temperature for best flavor"],
    },
  ]

  return fruits[Math.floor(Math.random() * fruits.length)]
}

const speakText = (text: string) => {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.8
    utterance.volume = 1
    window.speechSynthesis.speak(utterance)
  }
}

export default function FruitScanPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [fruitInfo, setFruitInfo] = useState<FruitInfo | null>(null)
  const [hasScanned, setHasScanned] = useState(false)

  const handleScanFruit = async () => {
    setIsScanning(true)
    setFruitInfo(null)
    setHasScanned(false)

    speakText("Starting fruit scan. Please hold the fruit steady in front of the camera.")

    try {
      const result = await analyzeFruit()
      setFruitInfo(result)
      setHasScanned(true)

      // Announce results
      const announcement = `Scan complete. I detected a ${result.name}. It appears to be ${result.ripeness.toLowerCase()} and in ${result.condition.toLowerCase()} condition. ${result.recommendations[0]}`
      speakText(announcement)
    } catch (error) {
      speakText("Sorry, there was an error scanning the fruit. Please try again.")
    } finally {
      setIsScanning(false)
    }
  }

  const handleNewScan = () => {
    setFruitInfo(null)
    setHasScanned(false)
    speakText("Ready for new fruit scan.")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-lime-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-4 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
            aria-label="Go back to home page"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-lg">Back to Home</span>
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">Fruit Scanner</h1>
          <p className="text-lg text-slate-600">AI-powered fruit recognition and quality assessment</p>
        </header>

        {/* Main Interface */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
          {!hasScanned && !isScanning && (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-green-100 rounded-full mx-auto flex items-center justify-center">
                <Camera className="w-12 h-12 text-green-600" />
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-slate-800 mb-2">Ready to Scan Fruit</h2>
                <p className="text-slate-600 mb-4">Hold your fruit in front of the camera and press the scan button</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                  <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
                  <ul className="text-blue-700 space-y-1 text-sm">
                    <li>• Ensure good lighting</li>
                    <li>• Hold fruit steady</li>
                    <li>• Keep fruit centered in view</li>
                    <li>• Wait for scan to complete</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={handleScanFruit}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2 flex items-center gap-2 mx-auto"
                aria-label="Start fruit scanning"
              >
                <Scan className="w-6 h-6" />
                Scan Fruit
              </button>
            </div>
          )}

          {isScanning && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-200 rounded-full mx-auto flex items-center justify-center">
                <div className="w-10 h-10 bg-green-600 rounded-full animate-ping"></div>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-slate-800 mb-2">Scanning Fruit...</h2>
                <p className="text-slate-600">Please hold still while I analyze your fruit</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 justify-center">
                  <Scan className="w-5 h-5 text-yellow-600 animate-spin" />
                  <span className="text-yellow-800 font-medium">AI Recognition in Progress...</span>
                </div>
              </div>
            </div>
          )}

          {hasScanned && fruitInfo && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-800">Scan Complete!</h2>
              </div>

              {/* Fruit Information */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-green-800 mb-4">Fruit Analysis Results</h3>

                <div className="grid gap-4">
                  <div className="flex justify-between items-center py-2 border-b border-green-200">
                    <span className="font-medium text-slate-700">Fruit Type:</span>
                    <span className="text-slate-800 font-semibold">{fruitInfo.name}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-green-200">
                    <span className="font-medium text-slate-700">Ripeness:</span>
                    <span className="text-slate-800">{fruitInfo.ripeness}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-green-200">
                    <span className="font-medium text-slate-700">Color:</span>
                    <span className="text-slate-800">{fruitInfo.color}</span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium text-slate-700">Condition:</span>
                    <span className="text-slate-800">{fruitInfo.condition}</span>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Recommendations:</h3>
                <ul className="space-y-2">
                  {fruitInfo.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                      <span className="text-blue-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleNewScan}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2"
                  aria-label="Scan another fruit"
                >
                  Scan Another Fruit
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Scanning Tips:</h3>
          <div className="grid gap-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-1 flex-shrink-0" />
              <span className="text-slate-600 text-sm">Ensure adequate lighting for best results</span>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-1 flex-shrink-0" />
              <span className="text-slate-600 text-sm">Hold the fruit at arm's length from the camera</span>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-1 flex-shrink-0" />
              <span className="text-slate-600 text-sm">Keep the fruit centered and stable during scanning</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
