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
    const [imageHash, setImageHash] = useState<string | null>(null)
    const router = useRouter()
    const { user } = useAuth()
    const { addNotification } = useNotifications()

    // Compute SHA-256 hash using the browser's native Web Crypto API
    const computeImageHash = async (file: File): Promise<string> => {
        const buffer = await file.arrayBuffer()
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0]
            setFile(selected)
            setPreview(URL.createObjectURL(selected))
            setResult(null)
            setLocation(null)
            setImageHash(null)
            // Compute hash in the background as soon as file is selected
            computeImageHash(selected).then(hash => setImageHash(hash))
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

    const isSuspicious = result?.message?.startsWith('⚠️ SUSPICIOUS') ?? false

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
                "1 bag",
                locationName,
                location,
                user.id,
                undefined,
                imageHash || undefined,
                isSuspicious
            )

            if (isSuspicious) {
                toast(`Report submitted, but flagged for admin review due to suspicious image.`, { icon: '⚠️' })
            } else {
                toast.success(`Report submitted successfully! Your points will be awarded once verified.`)
            }
            addNotification("info", "Waste Reported", `Your report for ${result.category} waste at ${locationName} has been submitted.`);
            router.push("/dashboard/citizen")
        } catch (error: any) {
            console.error("Failed to create task", error)
            const msg = error?.message || ''
            if (msg.includes('already been used')) {
                toast.error("⚠️ Duplicate photo detected. Please take a new photo.")
            } else if (msg.includes('Too many reports')) {
                toast.error("⚠️ Rate limit reached. Please wait before submitting another report.")
            } else {
                toast.error("Failed to submit report. Please try again.")
            }
        }
    }

    return (
        <div className="max-w-xl mx-auto space-y-6 pb-24 sm:pb-10 px-0 sm:px-4">
            <div className="flex flex-col gap-1.5 px-4 sm:px-0">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Report Waste</h1>
                <p className="text-muted-foreground text-[13px] sm:text-sm font-medium">Upload a photo to automatically identify the waste type.</p>
            </div>

            {/* ---> MOBILE UPLOAD UI (< md) <--- */}
            <div className="md:hidden relative w-full aspect-[4/5] sm:aspect-video rounded-[2rem] sm:rounded-3xl overflow-hidden bg-zinc-100 dark:bg-black/60 sm:border sm:border-border/50 shadow-inner group transition-all mx-auto max-w-sm sm:max-w-none">
                {preview ? (
                    <>
                        <img src={preview} alt="Waste preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/20 opacity-100" />
                        <button
                            onClick={() => { setFile(null); setPreview(null); setResult(null); }}
                            className="absolute top-4 right-4 p-2.5 bg-white/20 backdrop-blur-xl text-white rounded-full hover:bg-white/30 shadow-lg transition-all hover:scale-110 active:scale-95 border border-white/20"
                            title="Remove Image"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        {!result && (
                            <div className="absolute bottom-6 left-0 right-0 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <Button
                                    className="w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 text-white backdrop-blur-md transition-all active:scale-[0.98]"
                                    onClick={handleAnalyze}
                                    disabled={analyzing}
                                >
                                    {analyzing ? (
                                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing Image...</>
                                    ) : (
                                        "Detect Waste Type"
                                    )}
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)]" />

                        <div className="relative z-10 h-20 w-20 sm:h-24 sm:w-24 bg-white dark:bg-black/50 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/10 border border-emerald-500/20">
                            <Camera className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-600 dark:text-emerald-500" />
                        </div>

                        <h3 className="relative z-10 text-xl font-bold tracking-tight text-foreground">Snap a Photo</h3>
                        <p className="relative z-10 text-[13px] sm:text-sm font-medium text-muted-foreground mt-2 mb-8 max-w-[250px] leading-relaxed">
                            Take a picture of the waste or upload from your gallery.
                        </p>

                        <div className="relative z-10 flex flex-col gap-3 w-full max-w-[280px]">
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
                                className="w-full h-14 rounded-2xl text-base font-bold shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-emerald-600 hover:bg-emerald-700 text-white transition-all active:scale-[0.98]"
                                onClick={() => cameraInputRef.current?.click()}
                            >
                                <Camera className="mr-2 h-5 w-5" />
                                Open Camera
                            </Button>

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
                                className="w-full h-14 rounded-2xl text-base font-bold bg-white/50 dark:bg-black/50 backdrop-blur-md border-border/50 hover:bg-muted transition-all active:scale-[0.98]"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="mr-2 h-5 w-5 text-muted-foreground" />
                                Photo Library
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* ---> DESKTOP UPLOAD UI (>= md) <--- */}
            <div className="hidden md:block">
                <Card className="border-2 border-dashed border-border/60 bg-muted/10 overflow-hidden hover:border-emerald-500/30 transition-colors shadow-sm rounded-2xl">
                    <CardContent className="flex flex-col items-center justify-center p-8 sm:p-12 space-y-4">
                        {preview ? (
                            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm border border-border/50 group bg-black/5 dark:bg-black/40 flex items-center justify-center">
                                <img src={preview} alt="Waste preview" className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.02]" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                <button
                                    onClick={() => { setFile(null); setPreview(null); setResult(null); }}
                                    className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60 shadow-sm transition-all hover:scale-110 active:scale-95 border border-white/20"
                                    title="Remove Image"
                                >
                                    <X className="h-4 w-4" />
                                </button>

                                {!result && (
                                    <div className="absolute bottom-6 left-0 right-0 px-12 animate-in fade-in slide-in-from-bottom-4 duration-500 flex justify-center">
                                        <Button
                                            className="w-full max-w-sm h-12 rounded-xl text-base font-bold shadow-xl shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 text-white backdrop-blur-md transition-all active:scale-[0.98]"
                                            onClick={handleAnalyze}
                                            disabled={analyzing}
                                        >
                                            {analyzing ? (
                                                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing Image...</>
                                            ) : (
                                                "Detect Waste Type"
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="w-full min-h-[16rem] flex flex-col items-center justify-center text-center">
                                <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 shadow-sm border border-emerald-500/20">
                                    <Upload className="h-8 w-8 text-emerald-600 dark:text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground tracking-tight">Upload Image</h3>
                                <p className="text-sm font-medium text-muted-foreground mt-1.5 mb-8 max-w-[280px]">Drag and drop your file here or click below to select from your computer.</p>

                                <div className="flex gap-4 w-full max-w-sm">
                                    <Button
                                        variant="outline"
                                        className="cursor-pointer flex-1 font-bold group h-12 border-border/60 hover:bg-muted rounded-xl bg-white dark:bg-zinc-900 shadow-sm"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                        Browse Files
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Analysis Result (only showed when result exists, button is inside the preview block now) */}

            {result && (
                <div className="px-4 sm:px-0 space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500 fill-mode-both">
                    <div className={`p-4 sm:p-5 rounded-[1.5rem] border flex items-start gap-4 shadow-sm ${result.category === 'organic' ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300' :
                        result.category === 'plastic' ? 'bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-500/10 dark:border-yellow-500/20 dark:text-yellow-300' :
                            result.category === 'metal' ? 'bg-orange-50 border-orange-200 text-orange-900 dark:bg-orange-500/10 dark:border-orange-500/20 dark:text-orange-300' :
                                (result.category === 'non_waste' || result.category === 'rejected') ? 'bg-red-50 border-red-200 text-red-900 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-300' :
                                    'bg-secondary/50 border-border/50 text-foreground'
                        }`}>
                        {(result.category === 'non_waste' || result.category === 'rejected') ? (
                            <div className="p-2 sm:p-3 bg-red-100 rounded-2xl dark:bg-red-900/40 shadow-inner">
                                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
                            </div>
                        ) : (
                            <div className="p-2 sm:p-3 bg-white/60 rounded-2xl dark:bg-black/40 shadow-inner border border-white/20 dark:border-white/5">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                        )}
                        <div className="pt-0.5">
                            <h3 className="font-bold text-lg sm:text-xl capitalize tracking-tight">
                                {result.category === 'non_waste' ? 'Verification Failed' :
                                    result.category === 'rejected' ? 'AI Error / Limit Reached' :
                                        `${result.category} Waste Detected`}
                            </h3>
                            <p className="text-[13px] sm:text-sm font-medium mt-1 opacity-90 leading-relaxed pr-2">{result.message}</p>
                            <div className="mt-3 flex items-center">
                                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold opacity-80 bg-black/5 dark:bg-white/10 px-2.5 py-1 rounded-md">
                                    AI Confidence: {(result.confidence * 100).toFixed(0)}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Suspicious / Staged Waste Warning Banner */}
                    {isSuspicious && (
                        <div className="flex items-start gap-3 p-4 rounded-[1.25rem] bg-orange-50 border border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/20 animate-in fade-in duration-300">
                            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-sm text-orange-800 dark:text-orange-300">Suspicious Activity Detected</p>
                                <p className="text-[13px] text-orange-700 dark:text-orange-400 font-medium mt-0.5 leading-relaxed">
                                    Our AI flagged this image as potentially staged or freshly placed.
                                    You can still submit, but this report will be queued for admin review before any points are awarded.
                                </p>
                            </div>
                        </div>
                    )}

                    {result.category !== 'non_waste' && result.category !== 'rejected' && (
                        <div className="space-y-5 bg-transparent sm:bg-card p-0 sm:p-6 rounded-[2rem] sm:border border-border/50 sm:shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 pb-3 border-b border-border/40">
                                <div>
                                    <h3 className="text-xl font-bold tracking-tight">Location Details</h3>
                                    <p className="text-[13px] text-muted-foreground font-medium mt-0.5">Pinpoint where the waste is located.</p>
                                </div>
                                {location ? (
                                    <div className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-3 py-1.5 rounded-full border border-emerald-200/60 flex items-center shadow-sm w-fit dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30">
                                        <CheckCircle className="h-4 w-4 mr-1.5" /> Captured
                                    </div>
                                ) : (
                                    <div className="text-xs font-bold text-orange-700 bg-orange-100/80 px-3 py-1.5 rounded-full border border-orange-200/60 flex items-center shadow-sm w-fit dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30 animate-pulse">
                                        <MapPin className="h-4 w-4 mr-1.5" /> Required
                                    </div>
                                )}
                            </div>

                            <div className="pt-2">
                                <Button size="lg" variant="secondary" onClick={handleGetLocation} disabled={gettingLocation} className="w-full font-bold border border-border/60 mb-5 h-14 rounded-2xl shadow-sm bg-white dark:bg-zinc-900 hover:bg-muted active:scale-[0.98] transition-all text-base text-foreground">
                                    {gettingLocation ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <MapPin className="mr-2 h-5 w-5 text-emerald-600 dark:text-emerald-500" />}
                                    Use My Current Location
                                </Button>

                                <div className="rounded-[1.5rem] overflow-hidden shadow-inner border border-border/50 h-[260px] relative">
                                    {/* Ambient shadow for map inset */}
                                    <div className="absolute inset-0 ring-1 ring-black/5 rounded-[1.5rem] pointer-events-none z-10" />
                                    <LocationPicker
                                        initialLocation={location}
                                        onLocationSelect={setLocation}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 pt-3">
                                <label className="text-sm font-bold text-foreground px-1">Location Name / Landmark</label>
                                <Input
                                    placeholder="e.g. Near Central Park Entrance"
                                    value={locationName}
                                    onChange={(e) => setLocationName(e.target.value)}
                                    className="font-medium shadow-sm transition-all focus:ring-emerald-500/20 h-14 rounded-2xl bg-white dark:bg-zinc-900 border-border/60 text-base"
                                />
                            </div>

                            <Button
                                className="w-full mt-8 h-14 rounded-2xl text-base font-bold shadow-[0_8px_30px_rgb(0,0,0,0.12)] bg-emerald-600 hover:bg-emerald-700 text-white transition-all active:scale-[0.98]"
                                onClick={handleSubmit}
                                disabled={!location || !locationName.trim()}
                            >
                                {location && locationName.trim() ? "Submit Report" : "Complete Details to Submit"}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
