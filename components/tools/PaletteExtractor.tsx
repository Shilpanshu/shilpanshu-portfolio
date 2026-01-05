import React, { useState, useRef } from 'react';
import ColorThief from 'colorthief';
import { Upload, Copy, Check, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '../Navigation';

const PaletteExtractor: React.FC = () => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [palette, setPalette] = useState<string[][] | null>(null);
    const [copiedColor, setCopiedColor] = useState<string | null>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImageSrc(e.target?.result as string);
                setPalette(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const extractColors = () => {
        if (imgRef.current) {
            const colorThief = new ColorThief();
            // Get palette: 8 colors
            const colors = colorThief.getPalette(imgRef.current, 8);
            const hexColors = colors.map((rgb: number[]) => ({
                rgb: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
                hex: rgbToHex(rgb[0], rgb[1], rgb[2])
            }));
            // Provide data as [hex, rgb] for simplicity or just hex objects
            setPalette(hexColors.map(c => [c.hex, c.rgb]));
        }
    };

    const rgbToHex = (r: number, g: number, b: number) => '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedColor(text);
        setTimeout(() => setCopiedColor(null), 2000);
    };

    return (
        <div className="min-h-screen bg-[#0f1115] text-white selection:bg-brand-accent/30">
            <Navigation />

            <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-4">
                        Palette Extractor
                    </h1>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
                        Upload any image to instantly generate a beautiful, harmonious color palette.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Image Uploader (Span 7) */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="relative group rounded-3xl overflow-hidden bg-[#181a1f] border border-white/5 shadow-2xl transition-all hover:border-white/10 min-h-[500px] flex flex-col items-center justify-center">
                            {imageSrc ? (
                                <>
                                    <div className="absolute inset-0 bg-checkered opacity-10 pointer-events-none" />
                                    <img
                                        ref={imgRef}
                                        src={imageSrc}
                                        alt="Preview"
                                        className="relative max-h-[600px] w-full object-contain p-8 z-10"
                                        crossOrigin="anonymous"
                                        onLoad={() => setTimeout(extractColors, 100)}
                                    />

                                    {/* Action Bar */}
                                    <div className="absolute top-4 right-4 z-20 flex gap-2">
                                        <button
                                            onClick={() => { setImageSrc(null); setPalette(null); }}
                                            className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-xl backdrop-blur-md transition-all border border-white/10"
                                            title="Reset Image"
                                        >
                                            <RefreshCw className="w-5 h-5" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center p-12">
                                    <label className="cursor-pointer group flex flex-col items-center justify-center">
                                        <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 group-hover:border-brand-accent/30 group-hover:bg-brand-accent/10 transition-all duration-300">
                                            <Upload className="w-10 h-10 text-slate-400 group-hover:text-brand-accent transition-colors" />
                                        </div>
                                        <span className="text-2xl font-medium text-slate-200 mb-2">Upload Image</span>
                                        <span className="text-slate-500">Drag & drop or click to browse</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Colors (Span 5) */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-[#181a1f]/80 backdrop-blur-xl rounded-3xl border border-white/5 p-6 shadow-2xl h-full min-h-[500px] flex flex-col">
                            <h3 className="text-xl font-medium text-white mb-6 flex items-center gap-2">
                                <div className="w-1 h-6 bg-brand-accent rounded-full" />
                                Generated Palette
                            </h3>

                            {!palette ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-white/5 rounded-2xl p-8">
                                    <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                                    <p>Waiting for image...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-fr">
                                    <AnimatePresence>
                                        {palette.map((color, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/5 hover:border-white/20 transition-all hover:shadow-lg hover:shadow-black/50"
                                                onClick={() => copyToClipboard(color[0])}
                                            >
                                                {/* Color Block */}
                                                <div
                                                    className="h-24 w-full"
                                                    style={{ backgroundColor: color[0] }}
                                                />

                                                {/* Details */}
                                                <div className="bg-[#12141a] p-3 flex justify-between items-center">
                                                    <span className="font-mono text-sm font-bold text-slate-300 group-hover:text-white transition-colors">
                                                        {color[0]}
                                                    </span>
                                                    {copiedColor === color[0] ? (
                                                        <Check className="w-4 h-4 text-green-400" />
                                                    ) : (
                                                        <Copy className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                                                    )}
                                                </div>

                                                {/* Overlay Effect */}
                                                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/0 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* Tips Footer */}
                            {palette && (
                                <div className="mt-6 pt-6 border-t border-white/5 text-center">
                                    <p className="text-xs text-slate-500">
                                        Click any color card to copy its Hex code to your clipboard.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .bg-checkered {
                    background-image: 
                      linear-gradient(45deg, #333 25%, transparent 25%), 
                      linear-gradient(-45deg, #333 25%, transparent 25%), 
                      linear-gradient(45deg, transparent 75%, #333 75%), 
                      linear-gradient(-45deg, transparent 75%, #333 75%);
                    background-size: 20px 20px;
                    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
                }
            `}</style>
        </div>
    );
};

export default PaletteExtractor;
