import { type NextRequest, NextResponse } from "next/server"

// Enhanced fallback for speech-to-text
const generateFallbackTranscription = (audioFile: File): string => {
  const fileName = audioFile.name.toLowerCase()
  const fileSize = audioFile.size
  const duration = Math.round(fileSize / 16000) // Rough estimate based on file size

  const fallbackTexts = [
    "Hello, this is a sample transcription. The audio file was successfully received.",
    "I can hear you speaking clearly. This is a demonstration of the speech-to-text feature.",
    "Your voice recording has been processed. This is what a transcription would look like.",
    "Thank you for using the speech-to-text feature. Your audio was captured successfully.",
    "This is a sample transcription showing how your speech would be converted to text.",
  ]

  let transcription = fallbackTexts[Math.floor(Math.random() * fallbackTexts.length)]

  // Add context based on file characteristics
  if (duration > 10) {
    transcription += " This appears to be a longer recording with multiple sentences."
  } else if (duration > 5) {
    transcription += " This seems to be a medium-length recording."
  } else {
    transcription += " This appears to be a short recording."
  }

  transcription +=
    " Note: This is a demonstration transcription. For accurate speech-to-text conversion, please configure the OpenAI API key."

  return transcription
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File
    const language = (formData.get("language") as string) || "en"

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 })
    }

    // Validate audio file
    if (!audioFile.type.startsWith("audio/")) {
      return NextResponse.json({ error: "Please upload a valid audio file." }, { status: 400 })
    }

    // Check if OpenAI API key is properly configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith("AIza")) {
      console.log("OpenAI API key not properly configured, using fallback transcription")
      const fallbackText = generateFallbackTranscription(audioFile)
      return NextResponse.json({
        text: fallbackText,
        language: language,
        duration: Math.round(audioFile.size / 16000), // Rough estimate
        source: "fallback",
      })
    }

    try {
      const transcriptionFormData = new FormData()
      transcriptionFormData.append("file", audioFile)
      transcriptionFormData.append("model", "whisper-1")
      transcriptionFormData.append("language", language)
      transcriptionFormData.append("response_format", "json")

      const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: transcriptionFormData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("OpenAI Whisper API error:", response.status, errorText)
        throw new Error(`Whisper API responded with status: ${response.status}`)
      }

      const data = await response.json()

      return NextResponse.json({
        text: data.text,
        language: language,
        duration: data.duration || null,
        source: "openai",
      })
    } catch (whisperError) {
      console.error("Speech-to-text error:", whisperError)
      // Use fallback on API error
      const fallbackText = generateFallbackTranscription(audioFile)
      return NextResponse.json({
        text: fallbackText + " (Note: AI transcription service temporarily unavailable)",
        language: language,
        duration: Math.round(audioFile.size / 16000),
        source: "fallback_after_error",
      })
    }
  } catch (error) {
    console.error("Speech-to-text API error:", error)
    return NextResponse.json(
      {
        error: "Failed to process speech-to-text request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
