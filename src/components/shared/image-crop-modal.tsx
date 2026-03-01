"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, Check, X } from "lucide-react"

interface ImageCropModalProps {
    src: string            // original image data-URL
    onConfirm: (cropped: string) => void
    onCancel: () => void
}

const OUTPUT_SIZE = 300   // final canvas square (px)
const PREVIEW_SIZE = 280  // circular viewport in UI (px)

export function ImageCropModal({ src, onConfirm, onCancel }: ImageCropModalProps) {
    // ── image natural size ──────────────────────────────────────────────
    const [imgW, setImgW] = useState(0)
    const [imgH, setImgH] = useState(0)

    // ── pan (offset of the image top-left inside the viewport) ──────────
    const [offset, setOffset] = useState({ x: 0, y: 0 })

    // ── zoom (1 = fit to viewport) ──────────────────────────────────────
    const [zoom, setZoom] = useState(1)
    const minZoom = 1
    const maxZoom = 4

    // ── drag state ──────────────────────────────────────────────────────
    const dragging = useRef(false)
    const lastPos = useRef({ x: 0, y: 0 })

    // ── canvas refs ─────────────────────────────────────────────────────
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const imgRef = useRef<HTMLImageElement | null>(null)

    // ── helpers ─────────────────────────────────────────────────────────
    /** Clamp the offset so the image always fully covers the viewport. */
    const clamp = useCallback(
        (ox: number, oy: number, z: number) => {
            const scaledW = imgW * z
            const scaledH = imgH * z
            const minX = PREVIEW_SIZE - scaledW
            const minY = PREVIEW_SIZE - scaledH
            return {
                x: Math.min(0, Math.max(ox, minX)),
                y: Math.min(0, Math.max(oy, minY)),
            }
        },
        [imgW, imgH]
    )

    // ── load image, compute initial fit ────────────────────────────────
    useEffect(() => {
        const img = new Image()
        img.onload = () => {
            imgRef.current = img
            setImgW(img.naturalWidth)
            setImgH(img.naturalHeight)

            // Scale so the shorter side fills the viewport
            const fitZoom = Math.max(
                PREVIEW_SIZE / img.naturalWidth,
                PREVIEW_SIZE / img.naturalHeight
            )
            const initZoom = fitZoom

            // Center the image
            const scaledW = img.naturalWidth * initZoom
            const scaledH = img.naturalHeight * initZoom
            setZoom(initZoom)
            setOffset({
                x: (PREVIEW_SIZE - scaledW) / 2,
                y: (PREVIEW_SIZE - scaledH) / 2,
            })
        }
        img.src = src
    }, [src])

    // ── redraw preview canvas ───────────────────────────────────────────
    useEffect(() => {
        const canvas = canvasRef.current
        const img = imgRef.current
        if (!canvas || !img || imgW === 0) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        ctx.clearRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE)

        // Circular clip
        ctx.save()
        ctx.beginPath()
        ctx.arc(PREVIEW_SIZE / 2, PREVIEW_SIZE / 2, PREVIEW_SIZE / 2, 0, Math.PI * 2)
        ctx.clip()

        ctx.drawImage(img, offset.x, offset.y, imgW * zoom, imgH * zoom)
        ctx.restore()
    }, [offset, zoom, imgW, imgH])

    // ── mouse drag ──────────────────────────────────────────────────────
    const onMouseDown = (e: React.MouseEvent) => {
        dragging.current = true
        lastPos.current = { x: e.clientX, y: e.clientY }
    }
    const onMouseMove = (e: React.MouseEvent) => {
        if (!dragging.current) return
        const dx = e.clientX - lastPos.current.x
        const dy = e.clientY - lastPos.current.y
        lastPos.current = { x: e.clientX, y: e.clientY }
        setOffset((prev) => clamp(prev.x + dx, prev.y + dy, zoom))
    }
    const stopDrag = () => { dragging.current = false }

    // ── touch drag ──────────────────────────────────────────────────────
    const onTouchStart = (e: React.TouchEvent) => {
        dragging.current = true
        lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    const onTouchMove = (e: React.TouchEvent) => {
        if (!dragging.current) return
        const dx = e.touches[0].clientX - lastPos.current.x
        const dy = e.touches[0].clientY - lastPos.current.y
        lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        setOffset((prev) => clamp(prev.x + dx, prev.y + dy, zoom))
    }

    // ── zoom slider ─────────────────────────────────────────────────────
    const handleZoom = (newZoom: number) => {
        // Keep the viewport center pinned while zooming
        const prevZoom = zoom
        const cx = PREVIEW_SIZE / 2
        const cy = PREVIEW_SIZE / 2
        const newOx = cx - (cx - offset.x) * (newZoom / prevZoom)
        const newOy = cy - (cy - offset.y) * (newZoom / prevZoom)
        setZoom(newZoom)
        setOffset(clamp(newOx, newOy, newZoom))
    }

    // ── apply: export square canvas, then circular-clip at output size ──
    const handleApply = () => {
        const img = imgRef.current
        if (!img) return

        const out = document.createElement("canvas")
        out.width = OUTPUT_SIZE
        out.height = OUTPUT_SIZE
        const ctx = out.getContext("2d")
        if (!ctx) return

        // scale factor between preview and output
        const scale = OUTPUT_SIZE / PREVIEW_SIZE

        ctx.save()
        ctx.beginPath()
        ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(
            img,
            offset.x * scale,
            offset.y * scale,
            imgW * zoom * scale,
            imgH * zoom * scale
        )
        ctx.restore()

        onConfirm(out.toDataURL("image/jpeg", 0.9))
    }

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
        >
            <div className="relative w-full max-w-sm rounded-2xl bg-background shadow-2xl border border-border/50 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
                    <h2 className="text-base font-semibold text-foreground">Adjust Profile Picture</h2>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-muted-foreground hover:text-foreground transition-colors rounded-full p-1 hover:bg-muted"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Preview area */}
                <div className="flex flex-col items-center gap-5 px-5 pt-5 pb-4">
                    <p className="text-xs text-muted-foreground">
                        Drag to reposition · Use slider to zoom
                    </p>

                    {/* Circular viewport */}
                    <div
                        className="relative rounded-full overflow-hidden ring-4 ring-primary/30 shadow-lg cursor-grab active:cursor-grabbing select-none"
                        style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
                        onMouseDown={onMouseDown}
                        onMouseMove={onMouseMove}
                        onMouseUp={stopDrag}
                        onMouseLeave={stopDrag}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={stopDrag}
                    >
                        <canvas
                            ref={canvasRef}
                            width={PREVIEW_SIZE}
                            height={PREVIEW_SIZE}
                            className="block"
                        />
                    </div>

                    {/* Zoom controls */}
                    <div className="flex w-full items-center gap-3">
                        <button
                            type="button"
                            onClick={() => handleZoom(Math.max(minZoom, zoom - 0.2))}
                            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                        >
                            <ZoomOut className="h-4 w-4" />
                        </button>

                        <input
                            type="range"
                            min={minZoom}
                            max={maxZoom}
                            step={0.01}
                            value={zoom}
                            onChange={(e) => handleZoom(parseFloat(e.target.value))}
                            className="flex-1 accent-primary h-1.5 rounded-full cursor-pointer"
                        />

                        <button
                            type="button"
                            onClick={() => handleZoom(Math.min(maxZoom, zoom + 0.2))}
                            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                        >
                            <ZoomIn className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 px-5 pb-5">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1 rounded-xl"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        className="flex-1 rounded-xl"
                        onClick={handleApply}
                    >
                        <Check className="mr-2 h-4 w-4" />
                        Apply
                    </Button>
                </div>
            </div>
        </div>
    )
}
