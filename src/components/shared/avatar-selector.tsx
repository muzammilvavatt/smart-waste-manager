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

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 w-full">
                <div className="relative group shrink-0">
                    <UserAvatar
                        avatarId={currentAvatarId}
                        fallbackName="U"
                        className="h-24 w-24 sm:h-28 sm:w-28 border border-border/50 shadow-sm ring-4 ring-background transition-all group-hover:opacity-80 group-hover:scale-[1.02] bg-muted/20"
                        iconClassName="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground"
                    />

                    {/* Upload Overlay on Hover */}
                    <div
                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-[1.25rem] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="h-6 w-6 text-white mb-1" />
                        <span className="text-[10px] font-semibold text-white">Upload</span>
                    </div>
                </div>

                <div className="flex flex-col items-center sm:items-start space-y-3 mt-1 text-center sm:text-left">
                    <div>
                        <p className="text-sm font-semibold text-foreground">Profile Picture</p>
                        <p className="text-[13px] text-muted-foreground mt-1 max-w-sm">
                            We recommend an image of at least 300x300. You can upload a PNG, JPG, or WebP.
                        </p>
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />

                    <div className="flex items-center gap-3 pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-9 px-4 rounded-md border-border/60 bg-white dark:bg-zinc-900 shadow-sm transition-all text-[13px] font-medium"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <ImageIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                            {currentAvatarId ? "Change photo" : "Upload photo"}
                        </Button>

                        {currentAvatarId && (
                            <Button
                                type="button"
                                variant="ghost"
                                className="h-9 px-3 rounded-md text-destructive hover:bg-destructive/10 hover:text-destructive text-[13px] font-medium"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onAvatarSelect("")
                                    if (fileInputRef.current) fileInputRef.current.value = ""
                                }}
                            >
                                Remove
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
