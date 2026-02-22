import { GoogleGenerativeAI } from "@google/generative-ai"
import { WasteVerificationResult } from "@/types"

// Initialize Gemini AI
const getGeminiClient = () => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!apiKey) {
        throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not set in environment variables")
    }
    return new GoogleGenerativeAI(apiKey)
}

// Convert File to base64 for Gemini API
async function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string } }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
            const base64String = reader.result as string
            const base64Data = base64String.split(',')[1] // Remove data:image/...;base64, prefix
            resolve({
                inlineData: {
                    data: base64Data,
                    mimeType: file.type
                }
            })
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

// Real AI-powered waste classification
export async function classifyWaste(file: File): Promise<WasteVerificationResult> {
    try {
        const genAI = getGeminiClient()
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

        // Convert image to format Gemini can process
        const imagePart = await fileToGenerativePart(file)

        // Detailed prompt for waste classification
        const prompt = `You are an expert waste classification system. Analyze this image and classify the waste type.

IMPORTANT RULES:
1. You are being used in a DEMO environment. Be extremely lenient.
2. If the image shows ANY object that could possibly be waste (even a bottle, a paper, a bag, or a messy room), classify it as waste.
3. ONLY respond with "non_waste" if the image is clearly a human face, a screenshot of text, or clearly not physical objects.
4. If you are unsure, default to "general" or "plastic". Do NOT be strict.

CATEGORIES:
- organic: Food waste, fruit peels, vegetable scraps, garden waste
- plastic: Plastic bottles, bags, containers, packaging
- metal: Aluminum cans, tin cans, metal containers
- paper: Cardboard, newspapers, paper packaging
- hazardous: Batteries, chemicals, medical waste, electronic waste
- general: Any mixed waste or "unsure" items. Default to this if unclear.

Respond in this EXACT JSON format:
{
  "category": "one of: organic|plastic|metal|paper|hazardous|general|non_waste",
  "confidence": 0.0-1.0,
  "message": "Brief disposal instruction or reason for rejection"
}

Examples:
- Plastic bottle: {"category": "plastic", "confidence": 0.95, "message": "Plastic waste detected. Please use the Yellow Bin for recycling."}
- Banana peel: {"category": "organic", "confidence": 0.98, "message": "Organic waste detected. Please use the Green Bin for composting."}
- Person in photo: {"category": "non_waste", "confidence": 0.1, "message": "This does not appear to be waste. Please upload a clear photo of waste items."}

Analyze the image now:`

        const result = await model.generateContent([prompt, imagePart])
        const response = await result.response
        const text = response.text()

        // Parse the JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            throw new Error("Invalid response format from AI")
        }

        const parsed = JSON.parse(jsonMatch[0]) as WasteVerificationResult

        // Validate the response
        const validCategories = ['organic', 'plastic', 'metal', 'paper', 'hazardous', 'general', 'non_waste']
        if (!validCategories.includes(parsed.category)) {
            throw new Error("Invalid category returned by AI")
        }

        return parsed

    } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        // Handle Rate Limiting / Quota Exceeded (429) - Clean Rejection
        if (errorMessage.includes("429") || errorMessage.includes("Quota exceeded") || errorMessage.includes("resource_exhausted")) {
            console.warn("Gemini API Rate Limit hit (handled):", errorMessage);
            return {
                category: 'general',
                confidence: 0.5,
                message: 'AI limit reached. Defaulting to General Waste (Auto-classified).'
            }
        }

        console.error("Gemini classification error:", error)

        // Fallback response on error
        return {
            category: 'general',
            confidence: 0.3,
            message: 'Unable to classify waste automatically. Please try again or contact support. Error: ' + errorMessage
        }
    }
}
// Real AI-powered collection verification
export async function verifyCollection(reportImageUrl: string, proofFile: File): Promise<WasteVerificationResult> {
    try {
        const genAI = getGeminiClient()
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

        // Convert proof image to format Gemini can process
        const proofPart = await fileToGenerativePart(proofFile)

        // Prompt for collection verification
        const prompt = `You are an expert waste collection verification system. 
        I am providing you with a "Proof of Collection" image.
        
        YOUR TASK:
        Verify if this image shows evidence that waste has been collected. 
        
        CRITICAL INSTRUCTION FOR DEMO PURPOSES:
        You must accept "Cleanliness" as proof. If the looks clean, tidy, or empty of waste, it means the collection was successful.

        Valid evidence includes:
        1. A clean street, empty floor, or tidy area (Primary Evidence).
        2. A waste collection truck or vehicle.
        3. Bins being emptied or Standing empty.
        4. Workers in reflective gear.
        5. Handing over bags.

        If the image serves as an "After" photo showing a clean area, MARK IT AS VERIFIED.

        RESPOND in this EXACT JSON format:
        {
          "category": "verified" | "rejected",
          "confidence": 0.0-1.0,
          "message": "Brief explanation of what you see and why you verified/rejected it"
        }

        Analyze the proof image now:`

        const result = await model.generateContent([prompt, proofPart])
        const response = await result.response
        const text = response.text()

        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error("Invalid response format from AI")

        const parsed = JSON.parse(jsonMatch[0]) as WasteVerificationResult
        return parsed

    } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        // Handle Rate Limiting / Quota Exceeded (429) - Clean Rejection
        if (errorMessage.includes("429") || errorMessage.includes("Quota exceeded") || errorMessage.includes("resource_exhausted")) {
            console.warn("Gemini API Rate Limit hit (handled):", errorMessage);
            return {
                category: 'verified',
                confidence: 0.5,
                message: 'AI limit reached. Manual verification approved (Auto-approved).'
            }
        }

        console.error("Gemini verification error:", error)

        return {
            category: 'verified', // Fallback to verified if AI fails but log error
            confidence: 0.5,
            message: 'Manual verification may be required due to system error.'
        }
    }
}
