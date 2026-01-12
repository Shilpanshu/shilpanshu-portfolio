
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Upload, Download, Loader2, Image as ImageIcon, Sparkles,
    Move, ZoomIn, ZoomOut, Check, X, Undo2
} from 'lucide-react';
import Navigation from '../Navigation';
import ServiceLayout from '../layout/ServiceLayout';

// --- Types ---
type ToolType = 'move' | 'compare';

// URL - User must update this in .env or UI
const API_URL = import.meta.env.VITE_SAM_API_URL || 'https://shilpanshu-sam2-backend.hf.space';

const BackgroundRemover: React.FC = () => {
    // --- State: Core ---
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [fileObject, setFileObject] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [backendUrl, setBackendUrl] = useState(API_URL);
    const [showColdStartMsg, setShowColdStartMsg] = useState(false);

    // --- State: Editor ---
    const [activeTool, setActiveTool] = useState<ToolType>('move');
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isComparing, setIsComparing] = useState(false); // Compare state for UI

    // --- Refs ---
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const originalImageRef = useRef<HTMLImageElement | null>(null);
    const maskCanvasRef = useRef<HTMLCanvasElement | null>(null); // Accumulates masks
    const isCutoutRef = useRef(false); // True if the maskCanvas contains the FINAL cutout (BiRefNet)

    // --- 1. File Handling ---
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) loadFile(file);
    };

    const loadFile = (file: File) => {
        if (!file.type.match('image.*')) return setError("Invalid Image");
        const url = URL.createObjectURL(file);
        setImageSrc(url);
        setFileObject(file);

        // Reset
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setIsProcessing(false);
        setError(null);
        setActiveTool('move');
        isCutoutRef.current = false;
        setIsComparing(false);

        // Load Image
        const img = new Image();
        img.src = url;
        img.onload = () => {
            originalImageRef.current = img;
            // Create blank mask canvas
            const mc = document.createElement('canvas');
            mc.width = img.width;
            mc.height = img.height;
            maskCanvasRef.current = mc;
            renderCanvas();
        };
    };

    // --- 2b. BiRefNet API Call (Auto Remove) ---
    const runBiRefNet = async () => {
        if (!fileObject) return;
        setIsProcessing(true);
        setShowColdStartMsg(false);
        setError(null);

        // 3 Minute Timeout for Cold Starts
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 180000);

        // Show "Cold Start" message after 15s
        const coldStartTimer = setTimeout(() => setShowColdStartMsg(true), 15000);

        try {
            const formData = new FormData();
            formData.append('file', fileObject);

            const targetUrl = backendUrl.replace(/\/$/, '') + '/remove-bg';

            const response = await fetch(targetUrl, {
                method: 'POST',
                body: formData,
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            clearTimeout(coldStartTimer);

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Backend Error');
            }

            const blob = await response.blob();
            // Verify it's an image
            if (!blob.type.startsWith('image/')) {
                throw new Error(`Received invalid type: ${blob.type}. Backend might be down.`);
            }

            const resultUrl = URL.createObjectURL(blob);
            const resultImg = new Image();
            resultImg.src = resultUrl;

            await new Promise<void>((resolve, reject) => {
                resultImg.onload = () => {
                    const mc = maskCanvasRef.current;
                    const ctx = mc?.getContext('2d');
                    if (mc && ctx) {
                        // Resize mask canvas to match result if needed (should match original)
                        mc.width = resultImg.width;
                        mc.height = resultImg.height;

                        ctx.clearRect(0, 0, mc.width, mc.height);
                        ctx.drawImage(resultImg, 0, 0, mc.width, mc.height);

                        // --- Smart Result Analysis ---
                        // Convert opaque masks to alpha if necessary
                        const imageData = ctx.getImageData(0, 0, mc.width, mc.height);
                        const data = imageData.data;
                        let hasAlpha = false;
                        let isGrayscale = true; // Assume B/W mask until colored pixel found

                        for (let i = 0; i < data.length; i += 40) { // Sampling
                            const r = data[i];
                            const g = data[i + 1];
                            const b = data[i + 2];
                            const a = data[i + 3];

                            if (a < 255) {
                                hasAlpha = true;
                                break;
                            }
                            if (Math.abs(r - g) > 5 || Math.abs(g - b) > 5) {
                                isGrayscale = false;
                            }
                        }

                        if (hasAlpha) {
                            isCutoutRef.current = true; // It's already a cutout
                        } else if (isGrayscale) {
                            // It's a B/W mask => Convert to Alpha
                            // White (255) = Foreground (Alpha 255)
                            // Black (0) = Background (Alpha 0)
                            for (let i = 0; i < data.length; i += 4) {
                                // Red channel as Alpha
                                data[i + 3] = data[i];
                            }
                            ctx.putImageData(imageData, 0, 0);
                            isCutoutRef.current = true;
                        } else {
                            // It's a full color image (likely failed to remove BG)
                            isCutoutRef.current = true;
                            console.warn("Backend returned opaque color image. Background removal likely failed.");
                        }

                        renderCanvas();
                        resolve();
                    } else {
                        reject(new Error("Canvas context missing"));
                    }
                };
                resultImg.onerror = () => reject(new Error("Failed to load result image"));
            });

        } catch (err: any) {
            console.error(err);
            if (err.name === 'AbortError') {
                setError("Request Timed Out (Limit 3 mins). The backend server is sleeping or overloaded.");
            } else {
                setError(err.message || "Auto-Removal Failed");
            }
        } finally {
            clearTimeout(timeoutId);
            clearTimeout(coldStartTimer);
            setIsProcessing(false);
            setShowColdStartMsg(false);
        }
    };

    // --- 4. Rendering ---
    const renderCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const img = originalImageRef.current;
        const mask = maskCanvasRef.current;

        if (!canvas || !ctx || !img) return;

        // Ensure canvas matches image resolution
        if (canvas.width !== img.width) canvas.width = img.width;
        if (canvas.height !== img.height) canvas.height = img.height;

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw
        ctx.save();
        // COMPARE LOGIC: If isComparing is true, show original regardless of mask
        if (isComparing) {
            ctx.drawImage(img, 0, 0);
        }
        else if (mask && isCutoutRef.current) {
            // If we have a cutout, draw it directly
            ctx.drawImage(mask, 0, 0);
        } else {
            // Otherwise show original
            ctx.drawImage(img, 0, 0);
        }
        ctx.restore();

    }, [isComparing]);

    // Re-render when compare state changes
    useEffect(() => { renderCanvas(); }, [renderCanvas, isComparing]);

    // --- 5. Export ---
    const download = () => {
        if (!canvasRef.current) return;
        const link = document.createElement('a');
        link.download = 'removed-background.png';
        link.href = canvasRef.current.toDataURL('image/png');
        link.click();
    };

    return (
        <ServiceLayout
            title="Free AI Background Remover - Remove Image Background Online"
            description="Remove image backgrounds instantly with AI. Accurate, free, and privacy-focused. Download transparent PNGs in seconds."
            keywords="AI background remover free, remove background online, transparent background, background eraser"
            heroTitle="Remove Backgrounds Instantly with AI"
            heroDescription="The most accurate free background remover. Powered by advanced AI technology for pixel-perfect segmentation. No login required, 100% free."
            howItWorks={[
                { step: "Upload Image", description: "Drag & drop or select any image (JPG, PNG, WebP) to begin." },
                { step: "AI Auto-Removal", description: "Our advanced AI model automatically detects and extracts the subject." },
                { step: "Download PNG", description: "Save your transparent background image in high quality instantly." }
            ]}
            useCases={["E-commerce Photography", "Social Media Profiles", "Marketing Assets", "Presentations", "Graphic Design"]}
            faqs={[
                { question: "Is this tool free?", answer: "Yes, this tool is 100% free to use for unlimited images." },
                { question: "Are my images saved?", answer: "No. Your images are processed temporarily and are not stored on our servers for privacy." },
                { question: "What technology is used?", answer: "We use a state-of-the-art AI model designed for high-accuracy image segmentation, providing better results than standard tools." },
                { question: "Does it work on mobile?", answer: "Yes, the tool is fully responsive and works on both desktop and mobile devices." }
            ]}
        >
            <div className="h-[95vh] flex flex-col bg-[#0f1115] text-white">
                <Navigation />

                {/* Main Workspace */}
                <div className="flex-1 flex overflow-hidden pt-16">

                    {/* Toolbar (Left) */}
                    <div className="w-20 bg-[#181a1f] border-r border-[#2a2d35] flex flex-col items-center py-6 gap-6 z-10">
                        {/* Zoom Controls */}
                        <div className="flex flex-col gap-2 p-2 bg-black/20 rounded-lg">
                            <button onClick={() => setZoom(z => Math.min(4, z + 0.1))} className="p-2 hover:bg-white/10 rounded text-slate-400 hover:text-white" title="Zoom In">
                                <ZoomIn className="w-5 h-5" />
                            </button>
                            <span className="text-[10px] font-mono text-center text-slate-500">{Math.round(zoom * 100)}%</span>
                            <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className="p-2 hover:bg-white/10 rounded text-slate-400 hover:text-white" title="Zoom Out">
                                <ZoomOut className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="h-[1px] w-8 bg-white/10" />

                        {/* Compare Button */}
                        <button
                            onMouseDown={() => setIsComparing(true)} // Toggle compare on hold
                            onMouseUp={() => setIsComparing(false)}
                            onMouseLeave={() => setIsComparing(false)} // Safety
                            disabled={!isCutoutRef.current} // Only enable if we have a result
                            onTouchStart={() => setIsComparing(true)} // Mobile support
                            onTouchEnd={() => setIsComparing(false)}
                            className={`p-3 rounded-xl transition-all ${isComparing ? 'bg-brand-accent text-black' : 'text-slate-400 hover:bg-white/10 hover:text-white'} disabled:opacity-20`}
                            title="Hold to Compare"
                        >
                            <Undo2 className="w-6 h-6" />
                        </button>

                        <div className="h-[1px] w-8 bg-white/10" />

                        {/* Magic Button (Trigger Backend) */}
                        <button
                            onClick={runBiRefNet}
                            disabled={!imageSrc || isProcessing || isCutoutRef.current} // Disable if already done/processing
                            className={`p-3 rounded-xl transition-all ${isCutoutRef.current ? 'bg-green-500/20 text-green-500' : 'bg-brand-accent text-black shadow-[0_0_15px_rgba(var(--brand-accent),0.3)] hover:scale-105 active:scale-95'} disabled:opacity-20 disabled:shadow-none`}
                            title="Remove Background"
                        >
                            {isCutoutRef.current ? <Check className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                        </button>
                    </div>

                    {/* Canvas Area - FIXED LAYOUT */}
                    <div className="flex-1 bg-[#0a0b0d] relative flex items-center justify-center p-8 overflow-hidden">
                        {!imageSrc ? (
                            <div className="text-center p-12 border-2 border-dashed border-white/10 rounded-2xl hover:border-brand-accent/50 transition-colors bg-[#12141a]">
                                <Upload className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-slate-200 mb-2">Upload Image</h3>
                                <p className="text-slate-500 mb-6 text-sm max-w-xs mx-auto">Upload an image to automatically remove the background.</p>
                                <button className="relative px-6 py-3 bg-brand-accent text-black font-bold rounded-lg overflow-hidden">
                                    <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    Open Image
                                </button>
                            </div>
                        ) : (
                            // Wrapper with width/height 100% and flex center to constrain canvas
                            <div
                                className="relative w-full h-full flex items-center justify-center transition-transform ease-out"
                                style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}
                            >
                                <canvas
                                    ref={canvasRef}
                                    className="shadow-2xl bg-checkered"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain'
                                    }}
                                />
                                {isProcessing && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                                        <div className="bg-black/70 backdrop-blur px-6 py-4 rounded-xl flex flex-col items-center gap-3 text-center border border-white/10">
                                            <div className="flex items-center gap-3">
                                                <Loader2 className="w-5 h-5 text-brand-accent animate-spin" />
                                                <span className="text-white font-medium">Processing...</span>
                                            </div>
                                            {showColdStartMsg && (
                                                <p className="text-xs text-yellow-400 max-w-[200px] animate-pulse">
                                                    Starting AI Server... (This may take up to 2mins for the first run)
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Error Overlay */}
                        {error && (
                            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-red-500/10 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl backdrop-blur-md flex items-center gap-3 animate-in slide-in-from-bottom-5 z-50">
                                <span className="text-sm font-medium">{error}</span>
                                <button onClick={() => setError(null)} className="ml-4 hover:text-white"><X className="w-4 h-4" /></button>
                            </div>
                        )}
                    </div>

                    {/* Right Action Bar (From Client-Side UI) */}
                    <div className="w-80 bg-[#181a1f] border-l border-[#2a2d35] flex flex-col p-6">
                        <h2 className="font-display text-lg font-medium text-slate-200 mb-6">Details</h2>

                        <div className="space-y-6">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <span className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2 block">Status</span>
                                {isCutoutRef.current ? (
                                    <div className="flex items-center gap-2 text-green-400">
                                        <Check className="w-4 h-4" />
                                        <span className="font-medium">Background Removed</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <div className="w-2 h-2 rounded-full bg-slate-500" />
                                        <span>Ready to Process</span>
                                    </div>
                                )}
                            </div>

                            {/* Download Button */}
                            <button
                                onClick={download}
                                disabled={!isCutoutRef.current}
                                className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Download className="w-5 h-5" />
                                Download PNG
                            </button>

                            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 leading-relaxed">
                                <strong>Privacy Note:</strong> Your photos are processed temporarily on our advanced GPU cluster. No images are permanently stored.
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <style>{`
                .bg-checkered {
                    background-image:
                        linear-gradient(45deg, #252525 25%, transparent 25%),
                        linear-gradient(-45deg, #252525 25%, transparent 25%),
                        linear-gradient(45deg, transparent 75%, #252525 75%),
                        linear-gradient(-45deg, transparent 75%, #252525 75%);
                    background-size: 20px 20px;
                    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
                }
            `}</style>
        </ServiceLayout>
    );
};

export default BackgroundRemover;
