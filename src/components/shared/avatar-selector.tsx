"use client"

import { X, Upload, Image as ImageIcon } from "lucide-react"
import { UserAvatar } from "./user-avatar"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ImageCropModal } from "./image-crop-modal"

interface AvatarSelectorProps {
    currentAvatarId?: string | null
    onAvatarSelect: (id: string) => void
}

export function AvatarSelector({ currentAvatarId, onAvatarSelect }: AvatarSelectorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [cropSrc, setCropSrc] = useState<string | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onloadend = () => {
            setCropSrc(reader.result as string)
        }
        reader.readAsDataURL(file)
    }

    const handleCropConfirm = (croppedBase64: string) => {
        onAvatarSelect(croppedBase64)
        setCropSrc(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const handleCropCancel = () => {
        setCropSrc(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    return (
        <>
            {/* Crop modal — shown after file is picked */}
            {cropSrc && (
                <ImageCropModal
                    src={cropSrc}
                    onConfirm={handleCropConfirm}
                    onCancel={handleCropCancel}
                />
            )}

            <div className="w-full flex flex-col items-center gap-6 max-w-sm mx-auto">
                <div className="relative group">
                    <UserAvatar
                        avatarId={currentAvatarId}
                        fallbackName="U"
                        className="h-24 w-24 sm:h-28 sm:w-28 shadow-lg ring-4 ring-background transition-all group-hover:opacity-80 group-hover:scale-[1.02]"
                        iconClassName="h-10 w-10 sm:h-12 sm:w-12"
                    />

                    {/* Upload Button overlay on hover */}
                    <div
                        className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-0"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="h-8 w-8 text-white" />
                    </div>

                    {currentAvatarId && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                onAvatarSelect("")
                                if (fileInputRef.current) fileInputRef.current.value = ""
                            }}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-transform hover:scale-105 active:scale-95 z-10"
                            title="Remove Avatar"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <div className="w-full space-y-2 text-center">
                    <div className="mb-2">
                        <p className="text-sm font-bold text-foreground">Profile Picture</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Upload a photo to represent you.</p>
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full max-w-[200px] mx-auto rounded-xl border-border/60 bg-white dark:bg-zinc-900 shadow-sm transition-all active:scale-[0.98]"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <ImageIcon className="mr-2 h-4 w-4" />
                        {currentAvatarId ? "Change Picture" : "Upload Picture"}
                    </Button>
                </div>
            </div>
        </>
    )
}
