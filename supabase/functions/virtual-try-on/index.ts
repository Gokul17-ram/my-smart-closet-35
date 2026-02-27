import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userPhoto, clothingImages } = await req.json();

    if (!userPhoto || !clothingImages || clothingImages.length === 0) {
      return new Response(
        JSON.stringify({ error: "User photo and at least one clothing image are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the clothing description from images
    const clothingDescriptions = clothingImages.map(
      (img: { name: string; url: string }, i: number) => `Item ${i + 1}: ${img.name}`
    ).join(", ");

    // Build content array with user photo and clothing images
    const contentParts: any[] = [
      {
        type: "text",
        text: `You are a virtual fashion stylist. The user has uploaded their photo and selected these clothing items from their wardrobe: ${clothingDescriptions}. 
        
Create a realistic fashion visualization showing how the person in the photo would look wearing these selected clothing items. Adjust the clothing to match the person's body shape and proportions. Make it look natural and realistic, as if they are actually wearing the outfit. Keep the person's face, hair, and body proportions exactly as they are in the original photo. The background should be clean and neutral.`
      },
      {
        type: "image_url",
        image_url: { url: userPhoto }
      }
    ];

    // Add each clothing image
    for (const img of clothingImages) {
      contentParts.push({
        type: "image_url",
        image_url: { url: img.url }
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: contentParts,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate try-on preview" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const generatedImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textResponse = data.choices?.[0]?.message?.content;

    return new Response(
      JSON.stringify({ image: generatedImage || null, text: textResponse || "" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("virtual-try-on error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
