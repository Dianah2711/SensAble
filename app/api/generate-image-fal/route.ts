import { type NextRequest, NextResponse } from "next/server"

// Alternative implementation using Fal.ai for Stable Diffusion
export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Enhanced prompt for Stable Diffusion
    const enhancedPrompt = `${prompt}, high quality, detailed, photorealistic, professional photography, 8k resolution, masterpiece`

    const response = await fetch("https://fal.run/fal-ai/fast-sdxl", {
      method: "POST",
      headers: {
        Authorization: `Key ${process.env.FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        image_size: "square_hd",
        num_inference_steps: 25,
        guidance_scale: 7.5,
        num_images: 1,
        enable_safety_checker: true,
      }),
    })

    if (!response.ok) {
      throw new Error("Fal.ai API request failed")
    }

    const data = await response.json()

    return NextResponse.json({
      imageUrl: data.images[0].url,
      model: "stable-diffusion-xl",
    })
  } catch (error) {
    console.error("Fal.ai image generation error:", error)
    return NextResponse.json({ error: "Failed to generate image with Stable Diffusion" }, { status: 500 })
  }
}
