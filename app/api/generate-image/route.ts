import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { prompt, model = "dall-e-3", size = "1024x1024" } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: "OpenAI API key not configured",
          fallback: true,
        },
        { status: 503 },
      )
    }

    // Enhanced prompt for better image generation
    const enhancedPrompt = `High quality, detailed, photorealistic image of ${prompt}. Professional photography style, good lighting, clear details, vibrant colors.`

    try {
      // Try DALL-E 3 first
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: enhancedPrompt,
          n: 1,
          size: size,
          quality: "standard",
          response_format: "url",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("DALL-E 3 API error:", errorData)

        // Fallback to DALL-E 2 if DALL-E 3 fails
        console.log("Trying DALL-E 2 fallback...")
        const fallbackResponse = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "dall-e-2",
            prompt: enhancedPrompt.substring(0, 1000), // DALL-E 2 has shorter prompt limit
            n: 1,
            size: "512x512",
            response_format: "url",
          }),
        })

        if (!fallbackResponse.ok) {
          const fallbackError = await fallbackResponse.json()
          console.error("DALL-E 2 also failed:", fallbackError)
          throw new Error("Both DALL-E 3 and DALL-E 2 failed")
        }

        const fallbackData = await fallbackResponse.json()
        return NextResponse.json({
          imageUrl: fallbackData.data[0].url,
          model: "dall-e-2",
          prompt: enhancedPrompt,
          fallback: true,
        })
      }

      const data = await response.json()

      return NextResponse.json({
        imageUrl: data.data[0].url,
        model: "dall-e-3",
        prompt: enhancedPrompt,
        usage: data.usage || null,
      })
    } catch (fetchError) {
      console.error("Image generation fetch error:", fetchError)
      return NextResponse.json(
        {
          error: "Failed to generate image",
          details: fetchError instanceof Error ? fetchError.message : "Unknown error",
          fallback: true,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Image generation error:", error)
    return NextResponse.json(
      {
        error: "Failed to process image generation request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
