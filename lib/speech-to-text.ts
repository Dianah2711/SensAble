// Speech-to-Text API handler with fallback to Web Speech API
export interface SpeechToTextResult {
  transcript: string
  confidence?: number
  language?: string
  duration?: number
  source?: string
}

export interface SpeechToTextError {
  message: string
  code?: string
}

// Cloud-based Speech-to-Text API call (placeholder)
export async function transcribeAudioCloud(audioBlob: Blob): Promise<SpeechToTextResult> {
  try {
    const formData = new FormData()
    formData.append("audio", audioBlob, "recording.wav")
    formData.append("language", "en")

    const response = await fetch("/api/speech-to-text", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `API request failed: ${response.status}`)
    }

    const data = await response.json()

    return {
      transcript: data.text,
      confidence: data.confidence,
      language: data.language,
      duration: data.duration,
      source: data.source || "cloud",
    }
  } catch (error) {
    console.error("Cloud transcription error:", error)
    throw {
      message: error instanceof Error ? error.message : "Failed to transcribe audio",
      code: "CLOUD_API_ERROR",
    }
  }
}

// Web Speech API fallback
export function transcribeAudioBrowser(): Promise<SpeechToTextResult> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("webkitSpeechRecognition" in window)) {
      reject({
        message: "Speech recognition not supported in this browser",
        code: "NOT_SUPPORTED",
      })
      return
    }

    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "en-US"
    recognition.maxAlternatives = 1

    recognition.onresult = (event: any) => {
      if (event.results && event.results.length > 0) {
        const result = event.results[0][0]
        resolve({
          transcript: result.transcript,
          confidence: result.confidence,
          language: "en-US",
          source: "browser",
        })
      } else {
        reject({
          message: "No speech detected",
          code: "NO_SPEECH",
        })
      }
    }

    recognition.onerror = (event: any) => {
      let message = "Speech recognition error"
      switch (event.error) {
        case "no-speech":
          message = "No speech detected. Please speak clearly."
          break
        case "audio-capture":
          message = "No microphone found. Please check your microphone."
          break
        case "not-allowed":
          message = "Microphone access denied. Please allow microphone access."
          break
        case "network":
          message = "Network error. Please check your connection."
          break
        default:
          message = `Speech recognition error: ${event.error}`
      }

      reject({
        message,
        code: event.error.toUpperCase(),
      })
    }

    recognition.start()
  })
}

// Main transcription function with fallback
export async function transcribeAudio(audioBlob?: Blob): Promise<SpeechToTextResult> {
  try {
    // Try cloud API first if audio blob is provided
    if (audioBlob) {
      return await transcribeAudioCloud(audioBlob)
    }
  } catch (error) {
    console.warn("Cloud transcription failed, falling back to browser API:", error)
  }

  // Fallback to browser Speech Recognition API
  return await transcribeAudioBrowser()
}
