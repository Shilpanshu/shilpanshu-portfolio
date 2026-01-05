import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Upload, Download, Loader2, Image as ImageIcon, Sparkles,
    Eraser, Paintbrush, ZoomIn, ZoomOut, MousePointer2,
    Move, Check, X, RotateCcw
} from 'lucide-react';
import Navigation from '../Navigation';

// --- Types ---
type ToolType = 'move' | 'select' | 'erase' | 'restore';
type BackgroundType = 'transparent' | 'color' | 'image' | 'gradient';

// Placeholder URL - User must update this in .env or UI
const API_URL = import.meta.env.VITE_SAM_API_URL || 'https://shilpanshu-sam2-backend.hf.space';

const BackgroundRemover: React.FC = () => {
    // --- State: Core ---
    // imageSrc is the URL of the original loaded image
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [fileObject, setFileObject] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [backendUrl, setBackendUrl] = useState(API_URL);

    // --- State: Editor ---
    const [activeTool, setActiveTool] = useState<ToolType>('select');
    const [brushSize, setBrushSize] = useState(35);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });

    // --- State: SAM Interaction ---
    // Points for the current segmentation session
    const [points, setPoints] = useState<{ x: number, y: number, label: number }[]>([]);

    // --- Refs ---
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const originalImageRef = useRef<HTMLImageElement | null>(null);
    const maskCanvasRef = useRef<HTMLCanvasElement | null>(null); // Accumulates masks
    const hasMaskRef = useRef(false); // Track if we should apply masking

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
        setPoints([]);
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setIsProcessing(false);
        setError(null);
        setActiveTool('select');
        hasMaskRef.current = false; // Reset mask state

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

    // --- 2. SAM API Call ---
    const runSAM = async (newPoints: { x: number, y: number, label: number }[]) => {
        if (!fileObject || !originalImageRef.current) return;
        setIsProcessing(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', fileObject);
            // Convert points to API format [[x,y], ...]
            const ptArr = newPoints.map(p => [p.x, p.y]);
            const lbArr = newPoints.map(p => p.label);

            formData.append('points', JSON.stringify(ptArr));
            formData.append('labels', JSON.stringify(lbArr));

            // Use the user-provided URL or default
            const targetUrl = backendUrl.replace(/\/$/, '') + '/predict';

            const response = await fetch(targetUrl, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Backend Error');

            const blob = await response.blob();
            const maskUrl = URL.createObjectURL(blob);

            // Draw this new mask onto our accumulation mask canvas
            // For "Selection", usually we replace the previous mask for the same object?
            // Or if we are "Adding" to the selection.
            // Simplified logic: The API returns the mask for *these points*.
            // We should overwrite the mask canvas with this new result.
            const maskImg = new Image();
            maskImg.src = maskUrl;
            maskImg.onload = () => {
                const mc = maskCanvasRef.current;
                const ctx = mc?.getContext('2d');
                if (mc && ctx) {
                    ctx.clearRect(0, 0, mc.width, mc.height); // Clear previous attempt

                    // --- IMPROVE: Feathering / Anti-aliasing ---
                    // 1. Apply slight blur to soften the binary edges
                    ctx.filter = 'blur(2px)';
                    // Explicitly scale the mask to match the original image size to avoid cropping/resolution issues
                    ctx.drawImage(maskImg, 0, 0, mc.width, mc.height);
                    ctx.filter = 'none'; // Reset filter

                    // --- FIX: Convert B/W Mask to Alpha Mask ---
                    // Backend returns White (Object) on Black (BG). Both are opaque.
                    // We need Black to be Transparent (Alpha=0) for source-in to work.
                    const imageData = ctx.getImageData(0, 0, mc.width, mc.height);
                    const data = imageData.data;
                    for (let i = 0; i < data.length; i += 4) {
                        // Red channel = Brightness (0-255).
                        // 0 (Black) -> Alpha 0
                        // 255 (White) -> Alpha 255
                        // 128 (Gray edge) -> Alpha 128 (Semi-transparent)
                        const brightness = data[i];
                        data[i + 3] = brightness;
                    }
                    ctx.putImageData(imageData, 0, 0);

                    hasMaskRef.current = true; // Enable masking now that we have a result
                    renderCanvas();
                }
                setIsProcessing(false);
            };

        } catch (err) {
            console.error(err);
            setError("Connection Failed. Is the Backend URL correct?");
            setIsProcessing(false);
        }
    };

    // --- 3. Interaction Logic ---
    const handleCanvasClick = (e: React.MouseEvent) => {
        if (!originalImageRef.current || !canvasRef.current) return;
        if (activeTool !== 'select') return;

        // Calculate Coords
        const rect = canvasRef.current.getBoundingClientRect();
        // Mouse relative to Canvas Element
        const clientX = e.clientX - rect.left;
        const clientY = e.clientY - rect.top;

        // Simplest: Map click to 0-1 then to Image W/H.
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;

        const x = Math.round(clientX * scaleX);
        const y = Math.round(clientY * scaleY);

        // Add Point
        const newPoint = { x, y, label: 1 }; // 1 = foreground
        // For multi-click segmentation of ONE object, we accumulate points.
        const updatedPoints = [...points, newPoint];
        setPoints(updatedPoints);

        // Trigger AI
        runSAM(updatedPoints);
    };

    const handleManualBrush = (e: React.MouseEvent | React.TouchEvent) => {
        if (activeTool === 'select' || activeTool === 'move') return;
        // Basic painting logic similar to previous version...
        if (!maskCanvasRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top) * scaleY;

        const mCtx = maskCanvasRef.current.getContext('2d');
        if (!mCtx) return;

        hasMaskRef.current = true; // Ensure masking is active if we paint manually

        // --- Soft Brush Logic ---
        const radius = brushSize / 2;
        const gradient = mCtx.createRadialGradient(x, y, radius * 0.2, x, y, radius);

        if (activeTool === 'erase') {
            // Destination-Out: Source Alpha determines how much to remove.
            // 1.0 (Black) -> Remove fully. 0.0 -> Remove nothing.
            gradient.addColorStop(0, 'rgba(0,0,0,1)');
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            mCtx.globalCompositeOperation = 'destination-out';
        } else { // restore
            // Source-Over: Just paint white.
            gradient.addColorStop(0, 'rgba(255,255,255,1)');
            gradient.addColorStop(1, 'rgba(255,255,255,0)');
            mCtx.globalCompositeOperation = 'source-over';
        }

        mCtx.fillStyle = gradient;
        // Draw the soft brush
        mCtx.beginPath();
        mCtx.arc(x, y, radius, 0, Math.PI * 2);
        mCtx.fill();

        renderCanvas();
    };

    // --- 4. Rendering ---
    const renderCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        const img = originalImageRef.current;
        const mask = maskCanvasRef.current;

        if (!canvas || !ctx || !img) return;

        if (canvas.width !== img.width) canvas.width = img.width;
        if (canvas.height !== img.height) canvas.height = img.height;

        // Clear canvas (Transparent background)
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 2. Composition
        // We want to draw the Image MASKED by the MaskCanvas.
        ctx.save();

        // Only apply mask if we actually have one (from SAM or Manual edits)
        if (mask && hasMaskRef.current) {
            ctx.drawImage(mask, 0, 0); // Draw the white shape
            ctx.globalCompositeOperation = 'source-in';
            ctx.drawImage(img, 0, 0); // Draw image ONLY where mask was white

        } else {
            // Initial state: Show full original image
            ctx.drawImage(img, 0, 0);
        }
        ctx.restore();

        // 3. Draw Points Overlay (if Select tool active)
        if (activeTool === 'select') {
            points.forEach(p => {
                ctx.fillStyle = p.label === 1 ? '#00ff00' : '#ff0000';
                ctx.beginPath();
                ctx.arc(p.x, p.y, 10 * (img.width / 1000), 0, Math.PI * 2); // Dynamic size
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();
            });
        }

    }, [points]);

    useEffect(() => { renderCanvas(); }, [renderCanvas]);


    // --- 5. Export ---
    const download = () => {
        if (!canvasRef.current) return;
        const link = document.createElement('a');
        link.download = 'segmented-image.png';
        link.href = canvasRef.current.toDataURL('image/png');
        link.click();
    };


    return (
        <div className="h-screen flex flex-col bg-[#0f1115] text-white">
            <Navigation />

            {/* Editor Workspace */}
            <div className="flex-1 flex overflow-hidden pt-16">

                {/* 1. Left Sidebar: Layers */}
                <div className="w-72 bg-[#181a1f] border-r border-[#2a2d35] flex flex-col p-4 custom-scrollbar">
                    <h2 className="font-display font-medium text-slate-200 mb-6">Settings</h2>

                    {/* Backend Config */}
                    <div className="mb-8">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Server URL</label>
                        <input
                            type="text"
                            value={backendUrl}
                            onChange={(e) => setBackendUrl(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-xs text-slate-300 focus:border-brand-accent focus:outline-none"
                            placeholder="https://...hf.space"
                        />
                        <p className="text-[10px] text-slate-600 mt-1">Direct link to your running HF Space</p>
                    </div>

                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <h4 className="flex items-center gap-2 text-sm font-medium mb-1">
                            <Sparkles className="w-3 h-3 text-brand-accent" />
                            Interactive Mode
                        </h4>
                        <p className="text-xs text-slate-500">
                            Click on the main subject. The AI will isolate it on a transparent background.
                        </p>
                    </div>
                </div>

                {/* 2. Canvas */}
                <div className="flex-1 bg-[#0a0b0d] relative flex items-center justify-center overflow-hidden">
                    {!imageSrc ? (
                        <div className="text-center p-12 border-2 border-dashed border-white/10 rounded-2xl hover:border-brand-accent/50 transition-colors bg-[#12141a]">
                            <Upload className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-slate-200 mb-2">Interactive AI Segmentation</h3>
                            <p className="text-slate-500 mb-6 text-sm max-w-xs mx-auto">Upload an image, then click on objects to instantly cut them out using SAM 2.</p>
                            <button className="relative px-6 py-3 bg-brand-accent text-black font-bold rounded-lg overflow-hidden">
                                <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                Open Image
                            </button>
                        </div>
                    ) : (
                        <div
                            className="relative transition-transform ease-out"
                            style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}
                        >
                            <canvas
                                ref={canvasRef}
                                className={`bg-checkered max-h-[85vh] max-w-[90vw] object-contain shadow-2xl ${activeTool === 'select' ? 'cursor-crosshair' : 'cursor-default'}`}
                                onClick={handleCanvasClick}
                                onMouseDown={(e) => {
                                    if (activeTool === 'erase' || activeTool === 'restore') {
                                        const move = (me: MouseEvent) => handleManualBrush(me as any);
                                        const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
                                        window.addEventListener('mousemove', move);
                                        window.addEventListener('mouseup', up);
                                        handleManualBrush(e);
                                    }
                                }}
                            />
                            {isProcessing && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="bg-black/70 backdrop-blur px-6 py-4 rounded-xl flex items-center gap-3">
                                        <Loader2 className="w-5 h-5 text-brand-accent animate-spin" />
                                        <span className="text-white font-medium">Segmenting...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Zoom Overlay */}
                    {imageSrc && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#181a1f] p-2 rounded-full border border-white/10 shadow-xl">
                            <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className="p-2 hover:bg-white/10 rounded-full"><ZoomOut className="w-4 h-4 text-slate-400" /></button>
                            <span className="text-xs font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
                            <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="p-2 hover:bg-white/10 rounded-full"><ZoomIn className="w-4 h-4 text-slate-400" /></button>
                        </div>
                    )}
                </div>

                {/* 3. Toolbar */}
                <div className="w-16 bg-[#181a1f] border-l border-[#2a2d35] flex flex-col items-center py-4 gap-4 z-10">
                    <ToolButton
                        icon={<MousePointer2 className="w-5 h-5" />}
                        label="Select (SAM)"
                        isActive={activeTool === 'select'}
                        onClick={() => setActiveTool('select')}
                        disabled={!imageSrc}
                    />
                    <div className="w-8 h-[1px] bg-white/10 my-2" />
                    <ToolButton
                        icon={<Eraser className="w-5 h-5" />}
                        label="Erase Manual"
                        isActive={activeTool === 'erase'}
                        onClick={() => setActiveTool('erase')}
                        disabled={!imageSrc}
                    />
                    <ToolButton
                        icon={<Paintbrush className="w-5 h-5" />}
                        label="Restore Manual"
                        isActive={activeTool === 'restore'}
                        onClick={() => setActiveTool('restore')}
                        disabled={!imageSrc}
                    />
                    <div className="mt-auto flex flex-col gap-4">
                        <button
                            onClick={() => { setPoints([]); /* Also clear mask? */ }}
                            className="w-10 h-10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all bg-white/5"
                            title="Reset Selection"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </button>
                        <button
                            onClick={download}
                            className="w-10 h-10 rounded-xl bg-brand-accent text-black flex items-center justify-center hover:bg-white transition-colors shadow-lg shadow-brand-accent/20"
                            title="Download"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                    </div>
                </div>

            </div>

            <style>{`
                .bg-checkered {
                    background-color: #1a1a1a;
                    background-image: 
                      linear-gradient(45deg, #252525 25%, transparent 25%), 
                      linear-gradient(-45deg, #252525 25%, transparent 25%), 
                      linear-gradient(45deg, transparent 75%, #252525 75%), 
                      linear-gradient(-45deg, transparent 75%, #252525 75%);
                    background-size: 20px 20px;
                    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
                }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
            `}</style>
        </div>
    );
};

const ToolButton: React.FC<{ icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void, disabled?: boolean }> = ({ icon, label, isActive, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`relative group w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-brand-accent text-black shadow-lg shadow-brand-accent/20' : 'text-slate-400 hover:bg-white/10 hover:text-white'} ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
    >
        {icon}
        <span className="absolute right-14 bg-black px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
            {label}
        </span>
    </button>
);

export default BackgroundRemover;
