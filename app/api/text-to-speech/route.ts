import { type NextRequest, NextResponse } from "next/server"

// Fallback text-to-speech using Web Speech API instructions
const generateFallbackResponse = (text: string, voice: string, speed: number) => {
  return {
    error: "OpenAI API not available",
    fallback: true,
    instructions: {
      text: text,
      voice: voice,
      speed: speed,
      message: "Please use your browser's built-in text-to-speech feature. The text has been prepared for you.",
    },
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, voice = "alloy", speed = 1.0 } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    // Check if OpenAI API key is properly configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith("AIza")) {
      console.log("OpenAI API key not properly configured, providing fallback instructions")
      return NextResponse.json(generateFallbackResponse(text, voice, speed), { status: 200 })
    }

    try {
      const response = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "tts-1",
          input: text,
          voice: voice,
          speed: speed,
          response_format: "mp3",
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("OpenAI TTS API error:", response.status, errorText)
        throw new Error(`TTS API responded with status: ${response.status}`)
      }

      const audioBuffer = await response.arrayBuffer()
      const audioBase64 = Buffer.from(audioBuffer).toString("base64")

      return NextResponse.json({
        audioData: `data:audio/mp3;base64,${audioBase64}`,
        voice: voice,
        speed: speed,
        text: text,
        source: "openai",
      })
    } catch (ttsError) {
      console.error("TTS generation error:", ttsError)
      return NextResponse.json(generateFallbackResponse(text, voice, speed), { status: 200 })
    }
  } catch (error) {
    console.error("TTS API error:", error)
    return NextResponse.json(
      {
        error: "Failed to process TTS request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
