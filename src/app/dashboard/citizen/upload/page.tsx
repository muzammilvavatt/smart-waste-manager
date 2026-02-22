"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, Loader2, CheckCircle, AlertTriangle, X, MapPin, Camera } from "lucide-react"
import toast from "react-hot-toast"
import { classifyWaste } from "@/lib/gemini"
import { WasteVerificationResult } from "@/types"
import { useAuth } from "@/contexts/auth-context"
import { createTask } from "@/lib/store"
import { useNotifications } from "@/contexts/notification-context"
import dynamic from "next/dynamic"

// Dynamically import LocationPicker with no SSR
const LocationPicker = dynamic(() => import("@/components/shared/location-picker"), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg flex items-center justify-center">Loading Maps...</div>
})

export default function WasteUploadPage() {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const cameraInputRef = useRef<HTMLInputElement>(null)
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [analyzing, setAnalyzing] = useState(false)
    const [result, setResult] = useState<WasteVerificationResult | null>(null)
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
    const [locationName, setLocationName] = useState("")
    const [gettingLocation, setGettingLocation] = useState(false)
    const router = useRouter()
    const { user } = useAuth()
    const { addNotification } = useNotifications()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0]
            setFile(selected)
            setPreview(URL.createObjectURL(selected))
            setResult(null)
            setLocation(null)
        }
    }

    const handleAnalyze = async () => {
        if (!file) return
        setAnalyzing(true)
        try {
            const classification = await classifyWaste(file)
            setResult(classification)
        } catch (error) {
            console.error("Classification failed", error)
        } finally {
            setAnalyzing(false)
        }
    }

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser")
            return
        }
        setGettingLocation(true)
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                })
                setGettingLocation(false)
                toast.success("Location retrieved!")
            },
            (error) => {
                console.error("Error getting location", error)
                toast.error("Unable to retrieve your location")
                setGettingLocation(false)
            }
        )
    }

    const handleSubmit = async () => {
        if (!location || !result) return

        if (!user || !user.id) {
            toast.error("User session not found. Please log in again.")
            router.push("/login")
            return
        }

        try {
            await createTask(
                result.category,
                "1 bag", // Default amount for now, could add input later
                locationName,
                location,
                user.id
            )

            toast.success(`Report submitted successfully! Your points will be awarded once a collector verifies and picks up the waste.`)
            addNotification("info", "Waste Reported", `Your report for ${result.category} waste at ${locationName} has been submitted.`);
            router.push("/dashboard/citizen")
        } catch (error) {
            console.error("Failed to create task", error)
            toast.error("Failed to submit report. Please try again.")
        }
    }

    return (
        <div className="max-w-xl mx-auto space-y-6 sm:space-y-8 pb-10 px-4 sm:px-0">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Report Waste</h1>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1 sm:mt-0">Upload a photo to identify waste type and proper disposal method.</p>
            </div>

            <Card className="border-2 border-dashed">
                <CardContent className="flex flex-col items-center justify-center p-6 sm:p-10 space-y-4">
                    {preview ? (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                            <img src={preview} alt="Waste preview" className="w-full h-full object-contain" />
                            <button
                                onClick={() => { setFile(null); setPreview(null); setResult(null); }}
                                className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="w-full min-h-[12rem] flex flex-col items-center justify-center text-center">
                            <Upload className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Drag and drop or click to upload</p>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 justify-center w-full">
                                {/* Standard File Input */}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                />
                                <Button
                                    variant="outline"
                                    className="cursor-pointer w-full sm:w-auto"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    Select Image
                                </Button>

                                {/* Camera Capture Input */}
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    ref={cameraInputRef}
                                    onChange={handleFileChange}
                                />
                                <Button
                                    className="cursor-pointer w-full sm:w-auto"
                                    onClick={() => cameraInputRef.current?.click()}
                                >
                                    <Camera className="mr-2 h-4 w-4" />
                                    Take Photo
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {file && !result && (
                <Button
                    className="w-full"
                    onClick={handleAnalyze}
                    disabled={analyzing}
                >
                    {analyzing ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                    ) : (
                        "Analyze Waste"
                    )}
                </Button>
            )}

            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className={`p-4 rounded-lg border flex items-start gap-4 ${result.category === 'organic' ? 'bg-green-50 border-green-200 text-green-800' :
                        result.category === 'plastic' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                            result.category === 'metal' ? 'bg-red-50 border-red-200 text-red-800' :
                                (result.category === 'non_waste' || result.category === 'rejected') ? 'bg-red-100 border-red-200 text-red-900' :
                                    'bg-gray-50 border-gray-200 text-gray-800'
                        }`}>
                        {(result.category === 'non_waste' || result.category === 'rejected') ? (
                            <AlertTriangle className="h-6 w-6 shrink-0 text-red-600" />
                        ) : (
                            <CheckCircle className="h-6 w-6 shrink-0" />
                        )}
                        <div>
                            <h3 className="font-bold text-lg capitalize">
                                {result.category === 'non_waste' ? 'Verification Failed' :
                                    result.category === 'rejected' ? 'AI Error / Limit Reached' :
                                        `${result.category} Waste Detected`}
                            </h3>
                            <p className="text-sm opacity-90">{result.message}</p>
                            <p className="text-xs mt-2 font-mono opacity-75">Confidence: {(result.confidence * 100).toFixed(0)}%</p>
                        </div>
                    </div>

                    {result.category !== 'non_waste' && result.category !== 'rejected' && (
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                                <h3 className="text-base sm:text-lg font-medium">Verify Location</h3>
                                {location ? (
                                    <div className="text-xs text-green-600 flex items-center bg-green-50 px-2 py-1 rounded-full border border-green-200 w-fit">
                                        <CheckCircle className="h-3 w-3 mr-1" /> Location Captured
                                    </div>
                                ) : (
                                    <div className="text-xs text-orange-600 flex items-center bg-orange-50 px-2 py-1 rounded-full border border-orange-200 w-fit">
                                        <MapPin className="h-3 w-3 mr-1" /> Location Required
                                    </div>
                                )}
                            </div>

                            <p className="text-sm text-gray-500">
                                Please confirm the exact location of the waste. You can drag the marker to adjust.
                            </p>

                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={handleGetLocation} disabled={gettingLocation} className="w-full">
                                    {gettingLocation ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <MapPin className="mr-2 h-3 w-3" />}
                                    Use My Current Location
                                </Button>
                            </div>

                            <LocationPicker
                                initialLocation={location}
                                onLocationSelect={setLocation}
                            />

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Location Name / Landmark</label>
                                <Input
                                    placeholder="e.g. Central Market, Near Bus Stand"
                                    value={locationName}
                                    onChange={(e) => setLocationName(e.target.value)}
                                />
                            </div>

                            <Button className="w-full mt-4" size="lg" onClick={handleSubmit} disabled={!location || !locationName.trim()}>
                                {location && locationName.trim() ? "Submit Report" : "Select Location & Enter Name"}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
