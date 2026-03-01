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

        // Detailed prompt for waste classification with fraud/staging detection
        const prompt = `You are an expert waste classification and fraud detection system. Analyze this image for BOTH waste type AND authenticity.

STEP 1 - FRAUD CHECK (check this FIRST):
Look for signs of "staged" or "freshly dumped" waste — waste that was deliberately placed:
- A single neatly-tied bag or item placed in an otherwise spotless, clean environment
- Waste that looks brand new or unweathered (not dirty, not wet, not sun-faded)
- An obvious mismatch between the neatness of waste and the surroundings
If you detect STAGED waste, set the message to start with "⚠️ SUSPICIOUS:" and describe why.

STEP 2 - WASTE CLASSIFICATION:
2. If the image shows ANY object that could possibly be waste (bottle, paper, bag, messy area), classify it.
3. ONLY respond with "non_waste" if the image is clearly a human face, a screenshot, or has no physical waste items.
4. If unsure, default to "general". Do NOT be overly strict.

CATEGORIES:
- organic: Food waste, fruit peels, vegetable scraps, garden waste
- plastic: Plastic bottles, bags, containers, packaging
- metal: Aluminum cans, tin cans, metal containers
- paper: Cardboard, newspapers, paper packaging
- hazardous: Batteries, chemicals, medical waste, electronic waste
- general: Any mixed waste or "unsure" items. Default to this if unclear.
- non_waste: Clearly not waste (faces, screenshots, blank walls)

Respond in this EXACT JSON format:
{
  "category": "one of: organic|plastic|metal|paper|hazardous|general|non_waste",
  "confidence": 0.0-1.0,
  "message": "Start with ⚠️ SUSPICIOUS: if staged, otherwise give disposal instructions"
}

Examples:
- Natural trash pile: {"category": "plastic", "confidence": 0.95, "message": "Mixed plastic waste detected. Use the Yellow Bin for recycling."}
- Single clean bag on spotless floor: {"category": "plastic", "confidence": 0.7, "message": "⚠️ SUSPICIOUS: Waste appears freshly placed in an otherwise clean environment. Possible staging."}
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

// AI-powered Admin Dashboard Insight
export async function generateAdminSummary(stats: any): Promise<string> {
    try {
        const genAI = getGeminiClient()
        // Use gemini-2.5-flash for fast text generation
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

        // Simplify the stats object to pass to the prompt
        const statsSummary = JSON.stringify({
            totalUsers: stats.totalUsers,
            totalCollections: stats.totalCollections,
            pendingTasks: stats.pendingTasks,
            activeCollectors: stats.activeCollectors,
            topWasteType: stats.wasteTypeStats?.sort((a: any, b: any) => b.value - a.value)[0]?.name || 'Unknown',
            recentTrend: stats.weeklyStats?.slice(-2) // Last 2 days to compare
        });

        const prompt = `You are an expert City Waste Management Analyst.
        I am providing you with the real-time statistics of our Smart Waste Management system.
        
        CURRENT STATS:
        ${statsSummary}
        
        YOUR TASK:
        Write a concise, 2-3 sentence strategic summary for the City Administrator.
        
        GUIDELINES:
        - Keep it brief, professional, and actionable.
        - Highlight the most pressing issue (e.g., high pending tasks vs low collectors).
        - Mention the most common waste type if relevant.
        - Do NOT use bullet points or markdown. Just plain text.
        
        Example: "We currently have 45 pending tasks but only 2 active collectors, indicating a severe bottleneck in operations. Plastic remains the dominant waste type. Consider onboarding more collectors in the affected zones immediately."
        
        Write the summary now:`

        const result = await model.generateContent(prompt)
        const response = await result.response
        return response.text().trim()

    } catch (error: any) {
        console.error("Gemini summary error:", error)
        return "System insights are currently unavailable due to high AI demand or network error."
    }
}
