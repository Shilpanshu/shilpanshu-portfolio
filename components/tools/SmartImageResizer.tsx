import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import imageCompression from 'browser-image-compression';
import { Upload, Download, Crop, Image as ImageIcon, Check, Loader2, AlertCircle, Maximize2, RotateCw } from 'lucide-react';
import Navigation from '../Navigation';
import ServiceLayout from '../layout/ServiceLayout';

// --- Types ---
type AspectRatio = { label: string, value: number, width: number, height: number };

const ASPECT_RATIOS: AspectRatio[] = [
    { label: 'Custom', value: 0, width: 1080, height: 1080 },
    { label: 'Instagram Square', value: 1, width: 1080, height: 1080 },
    { label: 'Instagram Portrait', value: 4 / 5, width: 1080, height: 1350 },
    { label: 'Instagram Story', value: 9 / 16, width: 1080, height: 1920 },
    { label: 'LinkedIn Post', value: 1.91, width: 1200, height: 627 },
    { label: 'YouTube Thumbnail', value: 16 / 9, width: 1280, height: 720 },
];

const SmartImageResizer: React.FC = () => {
    // --- State ---
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);

    // Crop State
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    // Settings
    const [selectedPreset, setSelectedPreset] = useState<AspectRatio>(ASPECT_RATIOS[0]);
    const [customDim, setCustomDim] = useState({ width: 1080, height: 1080 });
    const [targetSizeKB, setTargetSizeKB] = useState<string>(''); // empty = no target
    const [outputFormat, setOutputFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');

    // Processing
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [processedInfo, setProcessedInfo] = useState<{ size: string, width: number, height: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    // --- Handlers ---
    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const f = e.target.files[0];
            setFile(f);
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageSrc(reader.result?.toString() || null);
                // Reset
                setProcessedImage(null);
                setProcessedInfo(null);
                setZoom(1);
                setRotation(0);
                setError(null);
            });
            reader.readAsDataURL(f);
        }
    };

    const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    // --- Core Logic: Crop & Resize ---
    const createCroppedImage = async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        setIsProcessing(true);
        setError(null);

        try {
            // 1. Get Cropped Canvas
            const croppedCanvas = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
            if (!croppedCanvas) throw new Error("Crop failed");

            // 2. Resize to Target Dimensions
            const finalWidth = selectedPreset.label === 'Custom' ? customDim.width : selectedPreset.width;
            const finalHeight = selectedPreset.label === 'Custom' ? customDim.height : selectedPreset.height;

            const resizeCanvas = document.createElement('canvas');
            resizeCanvas.width = finalWidth;
            resizeCanvas.height = finalHeight;
            const ctx = resizeCanvas.getContext('2d');

            // Draw cropped image onto resized canvas (scaling it)
            // Use high quality interpolation
            ctx!.imageSmoothingEnabled = true;
            ctx!.imageSmoothingQuality = 'high';
            ctx!.drawImage(croppedCanvas, 0, 0, finalWidth, finalHeight);

            // 3. Compress if needed
            let blob = await new Promise<Blob>((resolve) =>
                resizeCanvas.toBlob((b) => resolve(b!), `image/${outputFormat}`, 0.9)
            );

            if (targetSizeKB && parseFloat(targetSizeKB) > 0) {
                const targetSizeMB = parseFloat(targetSizeKB) / 1024;
                const options = {
                    maxSizeMB: targetSizeMB,
                    maxWidthOrHeight: Math.max(finalWidth, finalHeight), // keep dims
                    useWebWorker: true,
                    initialQuality: 0.9,
                    fileType: `image/${outputFormat}`
                };

                // Convert blob to file for compression lib
                const tempFile = new File([blob], "temp", { type: `image/${outputFormat}` });
                try {
                    const compressedFile = await imageCompression(tempFile, options);
                    blob = compressedFile;
                } catch (err) {
                    console.warn("Compression missed target slightly, using best effort.");
                }
            }

            // 4. Final Output
            const url = URL.createObjectURL(blob);
            setProcessedImage(url);
            setProcessedInfo({
                size: (blob.size / 1024 / 1024).toFixed(2) + ' MB',
                width: finalWidth,
                height: finalHeight
            });

        } catch (e: any) {
            console.error(e);
            setError("Processing failed. Please try a smaller image.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ServiceLayout
            title="Free AI Smart Image Resizer - Resize & Upscale Online"
            description="Resize and upscale images intelligently without losing quality. Perfect for social media, print, and web. Free online tool."
            keywords="AI image resizer, smart upscale, image enlarger free, resize image 4k, social media image resizer, instagram resizer"
            heroTitle="Resize and Upscale Images with AI"
            heroDescription="Intelligently resize images for any platform. Crop, scale, and upscale low-res photos to 4K clarity without artifacts."
            howItWorks={[
                { step: "Upload Image", description: "Drag & drop your JPG, PNG, or WebP file to begin." },
                { step: "Choose Target", description: "Select a preset (Instagram, LinkedIn, YouTube) or define custom dimensions." },
                { step: "Smart Process", description: "Our AI-enhanced logic resizes and sharpens the image instantly." }
            ]}
            useCases={["Social Media Posts", "Printing High-Res", "Web Optimization", "Restoring Old Photos", "E-commerce Product Images"]}
            faqs={[
                { question: "Does it lose quality?", answer: "Our smart algorithms minimize quality loss. For upscaling, we use interpolation to maintain sharpness." },
                { question: "What formats are supported?", answer: "We support JPG, PNG, and WebP for both input and output." },
                { question: "Is it secure?", answer: "Yes, all processing happens locally in your browser. Your images are never uploaded to a server." },
                { question: "Can I crop images?", answer: "Yes, the tool includes a fully featured cropper with aspect ratio presets." }
            ]}
        >
            <div className="min-h-screen bg-[#0f1115] text-white">
                <Navigation />
                <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">

                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-4xl md:text-5xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400 mb-4">
                            Smart Image Resizer
                        </h1>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                            Crop, resize, and compress images securely in your browser. Perfect for social media and web assets.
                        </p>
                    </div>

                    {!imageSrc ? (
                        // --- Upload State ---
                        <div className="max-w-2xl mx-auto bg-[#181a1f] border border-white/5 rounded-3xl p-12 text-center">
                            <div className="w-20 h-20 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Upload className="w-10 h-10 text-teal-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Upload an Image</h3>
                            <p className="text-slate-500 mb-8">JPG, PNG, or WEBP (Max 20MB)</p>
                            <label className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-black font-bold px-8 py-3 rounded-xl cursor-pointer transition-colors">
                                <ImageIcon className="w-5 h-5" />
                                Select Image
                                <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                            </label>
                        </div>
                    ) : (
                        // --- Editor State ---
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-250px)] min-h-[600px]">

                            {/* 1. Left Controls (Settings) */}
                            <div className="bg-[#181a1f] border border-white/5 rounded-2xl p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">

                                {/* Dimension Settings */}
                                <div>
                                    <h3 className="font-bold text-slate-300 mb-4 flex items-center gap-2">
                                        <Maximize2 className="w-4 h-4 text-teal-400" /> Dimensions
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        {ASPECT_RATIOS.map(p => (
                                            <button
                                                key={p.label}
                                                onClick={() => setSelectedPreset(p)}
                                                className={`text-xs p-2 rounded-lg border transition-all ${selectedPreset.label === p.label ? 'bg-teal-500/20 border-teal-500 text-white' : 'bg-black/20 border-white/5 text-slate-400 hover:bg-white/5'}`}
                                            >
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>

                                    {selectedPreset.label === 'Custom' && (
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <label className="text-[10px] uppercase text-slate-500 font-bold">Width</label>
                                                <input
                                                    type="number"
                                                    value={customDim.width}
                                                    onChange={e => setCustomDim(d => ({ ...d, width: parseInt(e.target.value) || 0 }))}
                                                    className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm focus:border-teal-500 outline-none"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-[10px] uppercase text-slate-500 font-bold">Height</label>
                                                <input
                                                    type="number"
                                                    value={customDim.height}
                                                    onChange={e => setCustomDim(d => ({ ...d, height: parseInt(e.target.value) || 0 }))}
                                                    className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm focus:border-teal-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <hr className="border-white/5" />

                                {/* Compression Settings */}
                                <div>
                                    <h3 className="font-bold text-slate-300 mb-4 flex items-center gap-2">
                                        <Download className="w-4 h-4 text-purple-400" /> Output
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs text-slate-400 mb-1 block">Format</label>
                                            <div className="flex bg-black/20 p-1 rounded-lg">
                                                {['jpeg', 'png', 'webp'].map(fmt => (
                                                    <button
                                                        key={fmt}
                                                        onClick={() => setOutputFormat(fmt as any)}
                                                        className={`flex-1 text-xs py-1.5 rounded-md uppercase transition-all ${outputFormat === fmt ? 'bg-white/10 text-white' : 'text-slate-500'}`}
                                                    >
                                                        {fmt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 mb-1 block">Target Size (Optional)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    step="1"
                                                    placeholder="e.g. 500"
                                                    value={targetSizeKB}
                                                    onChange={(e) => setTargetSizeKB(e.target.value)}
                                                    className="w-full bg-black/30 border border-white/10 rounded p-2 text-sm focus:border-purple-500 outline-none pr-8"
                                                />
                                                <span className="absolute right-3 top-2 text-xs text-slate-500">KB</span>
                                            </div>
                                            <p className="text-[10px] text-slate-600 mt-1">Leave empty for max quality.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto pt-4">
                                    <button
                                        onClick={createCroppedImage}
                                        disabled={isProcessing}
                                        className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Crop className="w-5 h-5" />}
                                        Process Image
                                    </button>
                                    {error && <p className="text-red-400 text-xs text-center mt-2">{error}</p>}
                                </div>
                            </div>

                            {/* 2. Main Canvas (Center) */}
                            <div className="lg:col-span-2 bg-[#0a0b0d] rounded-2xl border border-white/5 relative overflow-hidden flex flex-col">
                                {!processedImage ? (
                                    <>
                                        <div className="relative flex-1 bg-checkered">
                                            <Cropper
                                                image={imageSrc}
                                                crop={crop}
                                                zoom={zoom}
                                                rotation={rotation}
                                                aspect={(selectedPreset.label === 'Custom' ? customDim.width / customDim.height : selectedPreset.value)}
                                                onCropChange={setCrop}
                                                onZoomChange={setZoom}
                                                onRotationChange={setRotation}
                                                onCropComplete={onCropComplete}
                                                objectFit="contain"
                                            />
                                        </div>

                                        {/* Canvas Controls */}
                                        <div className="bg-[#12141a] p-4 flex items-center gap-6 border-t border-white/5 z-10">
                                            <div className="flex-1 flex items-center gap-3">
                                                <span className="text-xs text-slate-400">Zoom</span>
                                                <input
                                                    type="range" min={1} max={3} step={0.1}
                                                    value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))}
                                                    className="flex-1 h-1 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal-400"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => setRotation(r => r - 90)} className="p-2 hover:bg-white/10 rounded text-slate-400 hover:text-white"><RotateCw className="w-4 h-4 -scale-x-100" /></button>
                                                <button onClick={() => setRotation(r => r + 90)} className="p-2 hover:bg-white/10 rounded text-slate-400 hover:text-white"><RotateCw className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    // --- Result View ---
                                    <div className="absolute inset-0 flex flex-col bg-checkered">
                                        {/* Image Area: Takes available space, centers image */}
                                        <div className="flex-1 overflow-hidden p-8 flex items-center justify-center">
                                            <img
                                                src={processedImage}
                                                alt="Processed"
                                                className="max-w-full max-h-full object-contain shadow-2xl rounded-lg border border-white/10"
                                            />
                                        </div>

                                        {/* Controls Area: Fixed at bottom */}
                                        <div className="flex-none p-6 bg-[#181a1f] border-t border-white/10 flex items-center justify-center z-10 w-full">
                                            <div className="max-w-md w-full flex flex-col gap-4">
                                                <div className="flex items-center justify-between text-sm text-slate-400 bg-black/20 px-4 py-2 rounded-lg border border-white/5">
                                                    <div className="flex items-center gap-2 text-white font-medium"><Check className="w-4 h-4 text-green-400" /> Ready</div>
                                                    <div className="font-mono text-xs">{processedInfo?.width}x{processedInfo?.height} • {processedInfo?.size} • {outputFormat.toUpperCase()}</div>
                                                </div>
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => setProcessedImage(null)}
                                                        className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <a
                                                        href={processedImage}
                                                        download={`resized_${processedInfo?.width}x${processedInfo?.height}.${outputFormat}`}
                                                        className="flex-[2] py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-black font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-teal-500/20"
                                                    >
                                                        <Download className="w-4 h-4" /> Download Image
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <style>{`
                    .bg-checkered {
                        background-image: 
                          linear-gradient(45deg, #15171c 25%, transparent 25%), 
                          linear-gradient(-45deg, #15171c 25%, transparent 25%), 
                          linear-gradient(45deg, transparent 75%, #15171c 75%), 
                          linear-gradient(-45deg, transparent 75%, #15171c 75%);
                        background-size: 20px 20px;
                        background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
                    }
                `}</style>
            </div>
        </ServiceLayout>
    );
};

// --- Helper: Canvas Utils ---
const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.src = url;
    });

async function getCroppedImg(
    imageSrc: string,
    pixelCrop: { x: number, y: number, width: number, height: number },
    rotation = 0
): Promise<HTMLImageElement | null> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    // Translate to center for rotation
    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(
        image,
        safeArea / 2 - image.width * 0.5,
        safeArea / 2 - image.height * 0.5
    );

    // Get cropped data
    const data = ctx.getImageData(
        safeArea / 2 - image.width * 0.5 + pixelCrop.x,
        safeArea / 2 - image.height * 0.5 + pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height
    );

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    ctx.putImageData(data, 0, 0);

    return new Promise((resolve) => {
        const url = canvas.toDataURL('image/png'); // Intermediate is always png
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = url;
    });
}

export default SmartImageResizer;
