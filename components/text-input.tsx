"use client"

import type React from "react"

import { useState } from "react"
import { Type, Trash2 } from "lucide-react"

interface TextInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isLoading?: boolean
  placeholder?: string
}

export default function TextInput({ value, onChange, onSubmit, isLoading = false, placeholder }: TextInputProps) {
  const [wordCount, setWordCount] = useState(0)

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setWordCount(newValue.trim() ? newValue.trim().split(/\s+/).length : 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      if (value.trim() && !isLoading) {
        onSubmit()
      }
    }
  }

  const handleClear = () => {
    onChange("")
    setWordCount(0)
  }

  const quickPhrases = [
    "Hello, how are you?",
    "Thank you very much",
    "I need help please",
    "What time is it?",
    "Where is the bathroom?",
    "I am hungry",
    "I love you",
    "Good morning",
  ]

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <Type className="w-5 h-5" />
          Enter Text to Convert
        </h2>
        {value && (
          <button
            onClick={handleClear}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
            aria-label="Clear text"
            title="Clear text"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Text Input Area */}
      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Type any sentence here..."}
            className="w-full p-4 border border-slate-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent text-lg leading-relaxed"
            rows={6}
            maxLength={500}
            aria-label="Text to convert to sign language"
            aria-describedby="text-input-help"
          />
          <div className="absolute bottom-3 right-3 text-xs text-slate-400">{value.length}/500</div>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-500">
          <span id="text-input-help">Words: {wordCount}</span>
          <span className="text-xs">Press Ctrl+Enter to convert</span>
        </div>

        {/* Convert Button */}
        <button
          onClick={onSubmit}
          disabled={!value.trim() || isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
          aria-label="Convert text to sign language"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Converting...
            </div>
          ) : (
            "Convert to Sign Language"
          )}
        </button>
      </div>

      {/* Quick Phrases */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Quick Phrases:</h3>
        <div className="grid grid-cols-2 gap-2">
          {quickPhrases.map((phrase, index) => (
            <button
              key={index}
              onClick={() => onChange(phrase)}
              className="text-left p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
              aria-label={`Use quick phrase: ${phrase}`}
            >
              {phrase}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
