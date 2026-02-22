import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Camera, UploadCloud, RefreshCw } from "lucide-react"
import { CollectionTask } from "@/types"
import toast from "react-hot-toast"

interface VerificationModalProps {
    task: CollectionTask | null;
    isOpen: boolean;
    onClose: () => void;
    onVerify: (task: CollectionTask, file: File) => Promise<boolean | void>;
}

export function VerificationModal({ task, isOpen, onClose, onVerify }: VerificationModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // Reset state when modal opens/closes
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            onClose();
            // Small delay to clear state after animation
            setTimeout(() => {
                setFile(null);
                setPreviewUrl(null);
                setUploading(false);
            }, 300);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleSubmit = async () => {
        if (!task || !file) return;

        setUploading(true);
        try {
            const success = await onVerify(task, file);
            if (success !== false) {
                handleOpenChange(false); // Close on success
            }
        } catch (error) {
            console.error("Verification failed", error);
            // Toast is likely handled by parent, but we can add one here if needed
        } finally {
            setUploading(false);
        }
    };

    if (!task) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Verify Collection</DialogTitle>
                    <DialogDescription>
                        Upload a photo of the cleared area to complete the task.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center gap-6 py-4">
                    <div className={`
                relative w-full aspect-video rounded-xl border-2 border-dashed 
                flex flex-col items-center justify-center cursor-pointer overflow-hidden
                transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50
                ${previewUrl ? 'border-none' : 'border-gray-300 dark:border-gray-700'}
            `}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            disabled={uploading}
                        />

                        {previewUrl ? (
                            <div className="relative w-full h-full group">
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="bg-white/90 text-gray-900 px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 shadow-lg">
                                        <RefreshCw className="h-4 w-4" /> Change Photo
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-6 transition-all">
                                <div className="w-16 h-16 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <UploadCloud className="h-8 w-8" />
                                </div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Click to upload photo</h4>
                                <p className="text-sm text-gray-500 mt-1">Supports JPG, PNG</p>
                            </div>
                        )}
                    </div>

                    {/* AI Warning / Info (Static for now, can be dynamic) */}
                    <div className="w-full bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3 dark:bg-blue-900/10 dark:border-blue-900/20">
                        <Camera className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="text-xs text-blue-700 dark:text-blue-300">
                            <p className="font-semibold mb-0.5">AI Verification Enabled</p>
                            <p>Our system will analyze the photo to ensure the waste has been properly cleared.</p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={uploading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!file || uploading} className="min-w-[140px]">
                        {uploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                            </>
                        ) : (
                            <>Verify & Complete</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
