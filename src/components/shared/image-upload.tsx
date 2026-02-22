"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import toast from "react-hot-toast"

interface ImageUploadProps {
    onImageSelect: (file: File | null) => void
    initialPreview?: string
}

export function ImageUpload({ onImageSelect, initialPreview }: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(initialPreview || null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]

            // Validate file type
            if (!file.type.startsWith("image/")) {
                toast.error("Please select an image file")
                return
            }

            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result as string)
            }
            reader.readAsDataURL(file)

            onImageSelect(file)
        }
    }

    const handleClear = () => {
        setPreview(null)
        onImageSelect(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleClick = () => {
        fileInputRef.current?.click()
    }

    return (
        <div className="w-full">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />

            {preview ? (
                <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-contain"
                    />
                    <button
                        onClick={handleClear}
                        className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors"
                        type="button"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <div
                    onClick={handleClick}
                    className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500 font-medium">Click to upload proof</span>
                    <span className="text-xs text-gray-400 mt-1">PEG, PNG (Max 5MB)</span>
                </div>
            )}
        </div>
    )
}
