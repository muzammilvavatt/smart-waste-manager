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
// Helper to fetch an image URL and convert to GenerativePart
async function urlToGenerativePart(url: string, mimeType = "image/jpeg"): Promise<{ inlineData: { data: string; mimeType: string } } | null> {
    try {
        // If it's a data URL, extract base64 directly
        if (url.startsWith('data:')) {
            const arr = url.split(',');
            const match = arr[0].match(/:(.*?);/);
            const mType = match ? match[1] : mimeType;
            const b64 = arr[1];
            return {
                inlineData: {
                    data: b64,
                    mimeType: mType
                }
            };
        }

        // Handle path-based placeholders (e.g. /placeholder-waste.jpg)
        // If relative URL, we might need a full URL to fetch it server-side,
        // but since this is called from the frontend/API, local fetching can fail.
        // We'll attempt fetching if it's absolute.
        if (!url.startsWith('http')) {
            console.warn("urlToGenerativePart: Cannot fetch relative URL directly without base URL. Falling back to single image verification.");
            return null;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const blob = await response.blob();

        // Convert blob to base64
        const arrayBuffer = await blob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Data = buffer.toString('base64');

        return {
            inlineData: {
                data: base64Data,
                mimeType: blob.type || mimeType
            }
        };
    } catch (error) {
        console.error("urlToGenerativePart error:", error);
        return null; // Return null gracefully, fallback to single image
    }
}

// Real AI-powered collection verification with Before vs After comparison
export async function verifyCollection(reportImageUrl: string, proofFile: File): Promise<WasteVerificationResult> {
    try {
        const genAI = getGeminiClient()
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

        // Convert proof image to format Gemini can process
        const proofPart = await fileToGenerativePart(proofFile)

        // Attempt to fetch the original image
        const originalPart = await urlToGenerativePart(reportImageUrl);

        let parts: any[] = [];
        let prompt = "";

        if (originalPart) {
            // We have both images for comparison
            prompt = `You are an expert waste collection verification AI. 
        I am providing you with TWO images.
        Image 1 (first provided): The original "Before" photo showing the waste reported by a citizen.
        Image 2 (second provided): The "After" Proof of Collection photo uploaded by the collector.
        
        YOUR TASK:
        Verify if the collector has successfully cleaned the exact area shown in the first photo.
        
        CRITICAL CHECKS:
        1. LOCATION MATCH: Analyze the background, ground texture, walls, and surrounding environment. Are both photos taken in the EXACT same location?
        2. WASTE REMOVAL: Has the waste shown in Image 1 been physically removed or collected in Image 2?

        Valid evidence of collection:
        - The specific area shown in Image 1 is now clean/empty in Image 2.
        - The background matches perfectly, but the waste is gone.
        - You clearly see the waste being loaded into a collection truck or bin at that location.

        REJECT the proof if:
        - The locations clearly do not match (e.g., different street, different room).
        - The waste is still present and untouched.
        - The proof image is just a random photo of a truck with no geographic context tying it to Image 1.

        RESPOND in this EXACT JSON format:
        {
          "category": "verified" | "rejected",
          "confidence": 0.0-1.0,
          "message": "Start with [LOCATION MATCH] or [LOCATION MISMATCH]. Then briefly explain if the waste was removed."
        }

        Analyze the images now:`;
            parts = [prompt, originalPart, proofPart];
        } else {
            // Fallback: Verify just the proof image if original image couldn't be loaded (e.g., local placeholder during dev)
            prompt = `You are an expert waste collection verification system. 
        I am providing you with a single "Proof of Collection" image. (The original image was unavailable for comparison).
        
        YOUR TASK:
        Verify if this image shows evidence that waste has been collected. 
        
        CRITICAL INSTRUCTION FOR DEMO PURPOSES:
        You must accept "Cleanliness" as proof. If the area looks clean, tidy, or empty of waste, it means the collection was successful.

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
          "message": "Brief explanation of what you see and why you verified/rejected it (Single image mode)"
        }

        Analyze the proof image now:`;
            parts = [prompt, proofPart];
        }

        const result = await model.generateContent(parts)
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

        const prompt = `You are an expert City Waste Management Analyst and Chief Security Officer.
        I am providing you with the real-time statistics of our Smart Waste Management system.
        
        CURRENT STATS:
        ${statsSummary}
        
        YOUR TASK:
        Write a concise, 3-4 sentence strategic summary for the City Administrator.
        
        CRITICAL FOCUS AREAS:
        1. Operational Health: Highlight the most pressing issue (e.g., high pending tasks vs low collectors).
        2. Security & Fraud Prevention: Analyze the stats or recent trends for potential scams, system exposure, or fraudulent collector/citizen behaviors (e.g., unusually high completion rates, suspected staging of waste).
        3. System Integrity: Provide one actionable recommendation to make the system harder to exploit.
        
        GUIDELINES:
        - Keep it brief, professional, and highly actionable.
        - Mention the most common waste type if relevant.
        - Provide stern warnings if metrics look highly irregular or suggestive of gaming the system.
        - Do NOT use bullet points or markdown. Just plain text.
        
        Example: "We currently have 45 pending tasks but only 2 active collectors, indicating a severe bottleneck in operations. Plastic remains the dominant waste type. There is a suspicious spike in rapidly completed tasks in Zone B, suggesting potential fraudulent 'ghost collections'. Consider implementing stricter GPS geo-fencing and mandatory multi-angle photo verification to prevent system exploitation."
        
        Write the summary now:`

        const result = await model.generateContent(prompt)
        const response = await result.response
        return response.text().trim()

    } catch (error: any) {
        console.error("Gemini summary error:", error)
        return "System insights are currently unavailable due to high AI demand or network error."
    }
}
