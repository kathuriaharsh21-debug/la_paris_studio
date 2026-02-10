
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { PresetType } from "../types";

const MODEL_NAME = 'gemini-2.5-flash-image';

const PRESET_PROMPTS: Record<PresetType, string> = {
  'ai-magic': "Professional editorial product photography. High-end Pâtisserie Masterpiece. Creative and artistic luxury bakery setting with dramatic soft lighting and golden accents.",
  'avenue-montaigne': "High-end Parisian boutique interior. The item is on a polished white Carrara marble counter with fine gold trim. Sophisticated minimalist decor, soft warm interior lighting, ultra-luxury aesthetic.",
  'jardin-palais': "Dreamy outdoor Parisian garden setting. Soft-focus background of cream hydrangeas and white roses. Natural soft morning sunlight, elegant wrought iron cafe table textures.",
  'artisanal-atelier': "Texture-rich artisanal baking atelier. Warm limestone surface. Soft natural daylight from a large side window. Sophisticated, warm, and authentic craft atmosphere.",
  'champagne-soiree': "Luxury festive evening celebration. Cream silk fabric textures, delicate gold leaf accents, warm candlelight bokeh in the background. High-end celebratory mood.",
  'saint-germain': "Modern Parisian chic cafe vibe. Matte pastel ivory background with sharp, intentional fashion-style shadows. Very clean, minimalist, and sophisticated editorial shot.",
  'solid-chic': "High-end luxury catalog photography. The item is placed on a smooth, premium [COLOR] textured surface. Background is a matching solid [COLOR] studio backdrop. Professional studio lighting with soft, intentional shadows. Zero distractions, extreme elegance."
};

export async function processBakeryImage(
  base64Image: string,
  productName: string,
  preset: PresetType,
  logoBase64?: string,
  color: string = "Ivory White"
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let environmentPrompt = PRESET_PROMPTS[preset] || PRESET_PROMPTS['ai-magic'];
  
  // Inject custom color into the prompt if solid-chic is selected
  if (preset === 'solid-chic') {
    environmentPrompt = environmentPrompt.replace(/\[COLOR\]/g, color);
  }
  
  let prompt = `
    TASK: Transform this bakery photo into high-end editorial marketing content matching the 'La Paris Bakers' brand guide.
    PRODUCT: ${productName || "Bakery item"}.
    STYLE: Professional Parisian Pâtisserie Editorial.
    ENVIRONMENT: ${environmentPrompt}
    INSTRUCTION: Maintain 100% fidelity to the original bakery item's shape, color, and texture. Only replace the background and supporting surface.
  `;

  if (logoBase64) {
    prompt += `
    LOGO INSTRUCTION: I have provided a second image which is a brand logo. 
    Action: Precisely place this brand logo onto the base or the stand of the bakery item. 
    Ensure the logo follows the 3D perspective and curvature of the object it is placed on. 
    It should look like it is physically printed or embossed on the item.
    Maintain logo proportions.
    `;
  }

  prompt += `\nOutput: 8k resolution, flawless professional quality.`;

  const parts: any[] = [
    { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
    { text: prompt }
  ];

  if (logoBase64) {
    parts.push({ inlineData: { mimeType: 'image/png', data: logoBase64 } });
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts },
    });

    let imageUrl = '';
    
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) {
      throw new Error("No image was generated. Please try a different preset.");
    }

    return imageUrl;
  } catch (error) {
    console.error("Gemini Image Processing Error:", error);
    throw error;
  }
}
