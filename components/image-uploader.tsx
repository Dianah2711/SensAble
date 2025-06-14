"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Camera, Upload, ImageIcon, Eye, XCircle, Loader2 } from "lucide-react"

interface ImageUploaderProps {
  onImageAnalyzed: (description: string) => void
  autoSpeak?: boolean
}

export default function ImageUploader({ onImageAnalyzed, autoSpeak = true }: ImageUploaderProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [description, setDescription] = useState<string>("")
  const [error, setError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      processImage(file)
    }
  }

  const processImage = (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.")
      setSelectedImage(null)
      setImagePreview("")
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image file is too large. Please select an image under 10MB.")
      setSelectedImage(null)
      setImagePreview("")
      return
    }

    if (file.size === 0) {
      setError("Selected file is empty. Please choose a valid image.")
      setSelectedImage(null)
      setImagePreview("")
      return
    }

    setSelectedImage(file)
    setError("")

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Auto-analyze if enabled
    if (autoSpeak) {
      analyzeImage(file)
    }
  }

  const analyzeImage = async (imageFile: File) => {
    setIsAnalyzing(true)
    setError("")
    setDescription("") // Clear previous description

    try {
      const formData = new FormData()
      formData.append("image", imageFile)

      const response = await fetch("/api/describe-image", {
        method: "POST",
        body: formData,
      })

      let data: { description?: string; error?: string; source?: string }
      if (!response.ok) {
        try {
          data = await response.json()
        } catch (jsonError) {
          const textError = await response.text()
          console.error("Failed to parse JSON error response:", jsonError, "Raw text:", textError)
          throw new Error(
            `Server error: ${response.status} ${response.statusText}. Details: ${textError.substring(0, Math.min(textError.length, 100))}...`,
          )
        }
        throw new Error(data.error || `Server responded with status ${response.status}`)
      }

      data = await response.json()
      const newDescription = data.description || "No description available."
      const source = data.source || "unknown"

      setDescription(newDescription)
      onImageAnalyzed(newDescription)

      if (autoSpeak) {
        const prefix =
          source === "fallback" || source === "fallback_after_error"
            ? "Image uploaded successfully. "
            : "Image analysis complete. "
        speakDescription(prefix + newDescription)
      }
    } catch (err: any) {
      console.error("Error analyzing image:", err)
      setError(err.message || "An unexpected error occurred during image analysis.")
      if (autoSpeak) {
        speakText("Sorry, I couldn't analyze the image. Please try again.")
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  const speakDescription = (text: string) => {
    const fullText = `Image analysis complete. ${text}`
    speakText(fullText)
  }

  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      utterance.volume = 1
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleCameraCapture = () => {
    cameraInputRef.current?.click()
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const clearImage = () => {
    setSelectedImage(null)
    setImagePreview("")
    setDescription("")
    setError("")
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (cameraInputRef.current) cameraInputRef.current.value = ""
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
        <Eye className="w-6 h-6" />
        Object Recognition
      </h2>

      {/* Upload Controls */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleCameraCapture}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label="Take photo with camera"
          >
            <Camera className="w-8 h-8 text-slate-400 mb-2" />
            <span className="text-sm font-medium text-slate-600">Take Photo</span>
          </button>

          <button
            onClick={handleFileUpload}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label="Upload image file"
          >
            <Upload className="w-8 h-8 text-slate-400 mb-2" />
            <span className="text-sm font-medium text-slate-600">Upload File</span>
          </button>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Camera capture input"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="File upload input"
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-6">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview || "/placeholder.svg"}
              alt="Uploaded image for analysis"
              className="w-full h-64 object-cover rounded-xl border border-slate-200"
            />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
              aria-label="Remove image"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          {selectedImage && (
            <div className="mt-2 text-center text-sm text-slate-600">
              <p>{selectedImage.name}</p>
              <p>{(selectedImage.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}
        </div>
      )}

      {/* Analysis Controls */}
      {selectedImage && !isAnalyzing && (
        <div className="mb-6">
          <button
            onClick={() => analyzeImage(selectedImage)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 flex items-center justify-center gap-2"
            aria-label="Analyze uploaded image"
          >
            <Eye className="w-5 h-5" />
            Analyze Image
          </button>
        </div>
      )}

      {/* Analysis Loading */}
      {isAnalyzing && (
        <div className="text-center py-8 mb-6">
          <div className="w-12 h-12 bg-blue-200 rounded-full mx-auto flex items-center justify-center mb-4">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
          <p className="text-slate-600">Analyzing image...</p>
          <p className="text-sm text-slate-500 mt-1">This may take a few seconds</p>
        </div>
      )}

      {/* Description Results */}
      {description && !isAnalyzing && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <ImageIcon className="w-5 h-5 text-green-600" />
              <p className="font-medium text-green-800">Image Description</p>
            </div>
            <p className="text-slate-800 leading-relaxed">{description}</p>
          </div>

          <button
            onClick={() => speakDescription(description)}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2"
            aria-label="Read image description aloud"
          >
            🔊 Read Description Aloud
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 bg-slate-50 rounded-xl p-4">
        <h3 className="font-medium text-slate-800 mb-2">How to use:</h3>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>• Take a photo or upload an image file</li>
          <li>• The system will automatically analyze the image</li>
          <li>• Listen to the spoken description of what's in the image</li>
          <li>• Supported formats: JPG, PNG, GIF (max 10MB)</li>
        </ul>
      </div>
    </div>
  )
}
