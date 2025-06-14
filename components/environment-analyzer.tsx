"use client"

import { useState } from "react"
import { Ear, Users, Shield, Navigation, Scan, RefreshCw } from "lucide-react"

interface EnvironmentAnalysis {
  analysis: string
  type: string
  source: string
}

export default function EnvironmentAnalyzer() {
  const [analysis, setAnalysis] = useState<EnvironmentAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedType, setSelectedType] = useState<string>("general")

  const analysisTypes = [
    { id: "sounds", label: "Sounds", icon: Ear, description: "Audio environment" },
    { id: "people", label: "People", icon: Users, description: "Social activity" },
    { id: "safety", label: "Safety", icon: Shield, description: "Hazard assessment" },
    { id: "navigation", label: "Navigation", icon: Navigation, description: "Spatial layout" },
    { id: "general", label: "Overview", icon: Scan, description: "Complete analysis" },
  ]

  const analyzeEnvironment = async (type: string) => {
    setIsAnalyzing(true)
    setSelectedType(type)

    try {
      const response = await fetch("/api/analyze-environment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType: type,
          context: `Please provide a detailed ${type} analysis of the current environment.`,
        }),
      })

      if (!response.ok) {
        throw new Error("Analysis request failed")
      }

      const data = await response.json()
      setAnalysis(data)
    } catch (error) {
      console.error("Environment analysis error:", error)
      setAnalysis({
        analysis:
          "I'm unable to analyze the environment right now, but I'm still here to help with any questions you have!",
        type: type,
        source: "error",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Environment Analysis</h3>

      {/* Analysis Type Selector */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
        {analysisTypes.map((type) => {
          const Icon = type.icon
          return (
            <button
              key={type.id}
              onClick={() => analyzeEnvironment(type.id)}
              disabled={isAnalyzing}
              className={`p-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                selectedType === type.id
                  ? "border-blue-600 bg-blue-50 text-blue-800"
                  : "border-slate-200 hover:border-slate-300 text-slate-700"
              } ${isAnalyzing ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Icon className="w-5 h-5 mx-auto mb-1" />
              <div className="text-xs font-medium">{type.label}</div>
            </button>
          )
        })}
      </div>

      {/* Analysis Results */}
      {isAnalyzing && (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-blue-200 rounded-full mx-auto flex items-center justify-center mb-4">
            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
          <p className="text-slate-600">Analyzing environment...</p>
          <p className="text-sm text-slate-500 mt-1">
            Focusing on {analysisTypes.find((t) => t.id === selectedType)?.description}
          </p>
        </div>
      )}

      {analysis && !isAnalyzing && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-slate-800">
              {analysisTypes.find((t) => t.id === analysis.type)?.label} Analysis
            </h4>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${analysis.source === "openai" ? "bg-green-400" : "bg-orange-400"}`}
              />
              <span className="text-xs text-slate-500">
                {analysis.source === "openai" ? "AI Enhanced" : "Basic Mode"}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="text-slate-700 leading-relaxed">{analysis.analysis}</p>
          </div>

          <button
            onClick={() => analyzeEnvironment(selectedType)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Analysis
          </button>
        </div>
      )}

      {!analysis && !isAnalyzing && (
        <div className="text-center py-8 text-slate-500">
          <Scan className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Select an analysis type to get started</p>
        </div>
      )}
    </div>
  )
}
