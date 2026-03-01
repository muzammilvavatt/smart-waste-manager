import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Camera, UploadCloud, RefreshCw, Sparkles } from "lucide-react"
import { CollectionTask } from "@/types"
import { BottomSheet } from "@/components/ui/bottom-sheet"
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
    const [isDesktop, setIsDesktop] = useState(true);

    useEffect(() => {
        const checkIsDesktop = () => setIsDesktop(window.innerWidth >= 768);
        checkIsDesktop();
        window.addEventListener('resize', checkIsDesktop);
        return () => window.removeEventListener('resize', checkIsDesktop);
    }, []);

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            onClose();
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
                handleOpenChange(false);
            }
        } catch (error) {
            console.error("Verification failed", error);
        } finally {
            setUploading(false);
        }
    };

    if (!task) return null;

    const modalContent = (
        <div className="flex flex-col h-full max-h-[85vh] md:max-h-none">
            <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
                {isDesktop && (
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-bold tracking-tight">Verify Collection</DialogTitle>
                        <DialogDescription className="text-sm font-medium mt-1">
                            Upload a photo of the cleared area to complete task <span className="font-bold text-foreground capitalize">{task.wasteType} Waste</span>.
                        </DialogDescription>
                    </DialogHeader>
                )}
                {!isDesktop && (
                    <div className="mb-6">
                        <p className="text-sm font-medium text-muted-foreground mt-1">
                            Upload a photo of the cleared area to complete task <span className="font-bold text-foreground capitalize">{task.wasteType} Waste</span>.
                        </p>
                    </div>
                )}

                <div className="flex flex-col items-center gap-6">
                    <div className={`
                            relative w-full aspect-[4/3] rounded-xl border-2 border-dashed 
                            flex flex-col items-center justify-center cursor-pointer overflow-hidden
                            transition-all duration-300
                            ${previewUrl ? 'border-transparent shadow-md' : 'border-border hover:border-primary/50 hover:bg-muted/30 bg-muted/10'}
                        `}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            disabled={uploading}
                        />

                        {previewUrl ? (
                            <div className="relative w-full h-full group bg-black">
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="bg-background/90 backdrop-blur-sm text-foreground px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 shadow-lg border border-border/50">
                                        <RefreshCw className="h-3.5 w-3.5" /> Retake Photo
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-6 flex flex-col items-center justify-center h-full w-full">
                                <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 shadow-sm transition-transform group-hover:scale-110">
                                    <Camera className="h-6 w-6" />
                                </div>
                                <h4 className="font-bold text-foreground">Open Camera or Gallery</h4>
                                <p className="text-[13px] text-muted-foreground mt-1.5 font-medium max-w-[200px]">Take a clear picture of the cleaned location</p>
                            </div>
                        )}
                    </div>

                    {/* AI Warning / Info */}
                    <div className="w-full bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start gap-3 dark:bg-blue-500/10 dark:border-blue-500/20">
                        <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                        <div className="text-[13px] text-blue-800 dark:text-blue-300 leading-relaxed">
                            <p className="font-bold mb-0.5">Automated AI Verification</p>
                            <p className="opacity-90 font-medium">Your photo will be instantly analyzed to confirm the waste has been properly collected.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-background md:bg-muted/30 px-6 py-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-border/40 shrink-0 mt-auto">
                <Button variant="ghost" onClick={() => handleOpenChange(false)} disabled={uploading} className="w-full sm:w-auto font-semibold">
                    Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!file || uploading} className="min-w-[160px] w-full sm:w-auto font-bold shadow-sm">
                    {uploading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Image...
                        </>
                    ) : (
                        <>Verify & Complete</>
                    )}
                </Button>
            </div>
        </div>
    );

    if (isDesktop) {
        return (
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-border/60 shadow-xl rounded-2xl">
                    {modalContent}
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <BottomSheet isOpen={isOpen} onClose={() => handleOpenChange(false)} title="Verify Collection">
            {modalContent}
        </BottomSheet>
    );
}
