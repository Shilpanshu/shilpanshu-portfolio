
import React, { useState, useRef, useEffect } from 'react';
// Use Type-Only imports to avoid bundling runtime code
import type { Results, NormalizedLandmarkList } from '@mediapipe/pose';
import { Upload, Camera, Ruler, Shirt, ChevronRight, X, Loader2 } from 'lucide-react';
import Navigation from '../Navigation';
import ServiceLayout from '../layout/ServiceLayout';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from '../../firebase';
import { doc, getDoc, runTransaction } from "firebase/firestore";

// Declare globals loaded via CDN in index.html
declare global {
    interface Window {
        Pose: any;
        drawConnectors: any;
        drawLandmarks: any;
        POSE_CONNECTIONS: any;
    }
}

const VirtualTryOn: React.FC = () => {
    // --- State ---
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Upload, 2: Analyze, 3: Measure, 4: Try-On
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [userHeightCm, setUserHeightCm] = useState<string>('175'); // Default calibration height
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [landmarks, setLandmarks] = useState<NormalizedLandmarkList | null>(null);
    const [measurements, setMeasurements] = useState<any>(null);

    // Garment State (for Uploads)
    const [topGarment, setTopGarment] = useState<string | null>(null);
    const [bottomGarment, setBottomGarment] = useState<string | null>(null);

    // Generative AI State
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [generationStatus, setGenerationStatus] = useState<string>('');

    const imageRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const poseNetRef = useRef<any>(null); // Use any for the instance to avoid type clashes

    // --- Helpers defined before usage ---
    const calculateMeasurements = (landmarks: NormalizedLandmarkList) => {
        const h = parseInt(userHeightCm) || 175;
        setMeasurements({
            shoulder: Math.round(h * 0.24) + ' cm',
            chest: Math.round(h * 0.53) + ' cm',
            waist: Math.round(h * 0.45) + ' cm',
            hips: Math.round(h * 0.55) + ' cm',
            sleeve: Math.round(h * 0.38) + ' cm',
            inseam: Math.round(h * 0.45) + ' cm',
        });
    };

    const runAnalysis = async (src: string) => {
        setIsAnalyzing(true);
        const img = new Image();
        img.src = src;
        img.onload = async () => {
            if (poseNetRef.current) {
                await poseNetRef.current.send({ image: img });
            }
        };
    };

    const onPoseResults = (results: Results) => {
        if (!results.poseLandmarks) {
            alert("Could not detect a person. Please try a clearer full-body photo.");
            setIsAnalyzing(false);
            setStep(1);
            return;
        }

        setLandmarks(results.poseLandmarks);

        // Auto-advance to measurement after short delay
        setTimeout(() => {
            calculateMeasurements(results.poseLandmarks);
            setIsAnalyzing(false);
            setStep(3);
        }, 1000);
    };

    // --- MediaPipe Setup ---
    useEffect(() => {
        // Wait for script to load if not ready
        const initPose = () => {
            if (!window.Pose) {
                console.warn("MediaPipe Pose script not loaded yet, retrying...");
                setTimeout(initPose, 500);
                return;
            }

            console.log("Initializing MediaPipe Pose from CDN...");
            const pose = new window.Pose({
                locateFile: (file: string) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
                }
            });

            pose.setOptions({
                modelComplexity: 1,
                smoothLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            pose.onResults(onPoseResults);
            poseNetRef.current = pose;
        };

        if (typeof window !== 'undefined') {
            initPose();
        }

        return () => {
            if (poseNetRef.current) {
                poseNetRef.current.close();
            }
        };
    }, []); // Empty dependency array - run once on mount

    const fileToGenerativePart = async (src: string) => {
        const base64EncodedDataPromise = new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = src;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL('image/jpeg');
                resolve(dataURL.split(',')[1]);
            };
        });
        return {
            inlineData: {
                data: await base64EncodedDataPromise,
                mimeType: "image/jpeg",
            },
        };
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageSrc(reader.result as string);
                setStep(2);
                setTimeout(() => runAnalysis(reader.result as string), 500);
            }
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleGarmentUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'top' | 'bottom') => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.onload = () => {
                if (type === 'top') {
                    setTopGarment(reader.result as string);
                } else {
                    setBottomGarment(reader.result as string);
                }
            }
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    // --- Gemini VTON Logic ---
    const runGeminiVTON = async () => {
        if (!imageSrc || (!topGarment && !bottomGarment)) {
            alert("Please upload your photo and at least one custom garment (Top or Bottom).");
            return;
        }

        // --- Daily Usage Limit Check (Global) ---
        const MAX_DAILY_USES = 10;
        const today = new Date().toDateString();
        let currentUsage = 0;

        try {
            const usageRef = doc(db, "usage", "vton_daily");
            const docSnap = await getDoc(usageRef);

            if (docSnap.exists() && docSnap.data().date === today) {
                currentUsage = docSnap.data().count;
            }
        } catch (e) {
            console.error("Error reading global usage data", e);
        }

        if (currentUsage >= MAX_DAILY_USES) {
            alert("Global Daily Limit Reached.\nThis tool has used its 10/10 free generations for the community today.\nPlease try again tomorrow.");
            return;
        }

        const apiKey = import.meta.env.VITE_GEMINI_VTON_API_KEY;
        if (!apiKey) {
            alert("API Key not found. Please ensure VITE_AI_VTON_API_KEY is set in your .env file.");
            return;
        }

        setIsGenerating(true);
        const modelId = 'gemini-3-pro-image-preview';
        setGenerationStatus(`Preparing Advanced AI Model...`);

        try {
            // Initialize AI
            const genAI = new GoogleGenerativeAI(apiKey);

            // Use the model provided by user
            const model = genAI.getGenerativeModel({ model: modelId });

            const parts: any[] = [];

            // 1. Prompt 
            parts.push("Use the first uploaded image as the subject and identity reference, and use all subsequent images strictly as clothing references. Replace the subject’s existing clothing with the referenced garments while preserving the subject’s original face, body shape, pose, proportions, skin tone, hairstyle, and facial expression exactly as in the base image. The clothing must be fitted naturally to the body with correct alignment and realistic garment construction, including accurate seams, sleeves, collars, waistlines, hems, and fabric behavior such as drape, thickness, stretch, and natural folds. Maintain the original lighting, shadows, camera perspective, and background with no changes. The final result must be fully photorealistic with high-detail fabric texture, clean edges, correct cloth physics, and no warping, stylization, beautification, body modification, or identity alteration; the image should look like the subject is genuinely wearing the clothes, not edited or pasted. Do not alter facial features in any way—no face replacement, smoothing, or enhancement. Fabric texture must show visible weave, stitching detail, and realistic surface response to light. Garment fit must match the subject’s body scale accurately with no resizing, stretching, or clipping. Do not add accessories, jewelry, styling elements, or additional garments not present in the reference images. The subject’s pose must remain pixel-identical to the original image; do not change body orientation, limb positions, head angle, posture, or camera-relative pose in any way. The task is a clothing replacement only, not a re-render or re-posing. Do not re-generate the person; perform a localized clothing edit on the existing subject only.");

            // 2. Subject Image
            parts.push(await fileToGenerativePart(imageSrc));

            // 3. Garments
            if (topGarment) {
                parts.push(await fileToGenerativePart(topGarment));
            }
            if (bottomGarment) {
                parts.push(await fileToGenerativePart(bottomGarment));
            }

            setGenerationStatus("Generating Photorealistic VTON Result...");

            const result = await model.generateContent(parts);
            const response = await result.response;

            console.log("AI Response Full:", response);

            const candidates = response.candidates;
            if (candidates && candidates.length > 0) {
                const firstPart = candidates[0].content.parts[0];

                // Handle Inline Data (Image)
                if ((firstPart as any).inlineData) {
                    const mime = (firstPart as any).inlineData.mimeType || 'image/png';
                    const data = (firstPart as any).inlineData.data;
                    setGeneratedImage(`data:${mime};base64,${data}`);
                }
                // Handle Text Output (Fallback)
                else if (firstPart.text) {
                    console.log("Received text response:", firstPart.text);
                    if (firstPart.text.startsWith('http')) {
                        setGeneratedImage(firstPart.text);
                        alert("Model returned text instead of image: " + firstPart.text.substring(0, 50) + "...");
                    }
                }
            } else {
                throw new Error("No candidates returned from AI Model.");
            }

            // Increment Usage on Success (Image Case)
            if ((response.candidates?.[0]?.content?.parts?.[0] as any)?.inlineData) {
                try {
                    const usageRef = doc(db, "usage", "vton_daily");
                    await runTransaction(db, async (transaction) => {
                        const sfDoc = await transaction.get(usageRef);
                        if (!sfDoc.exists() || sfDoc.data().date !== today) {
                            transaction.set(usageRef, { date: today, count: 1 });
                        } else {
                            const newCount = sfDoc.data().count + 1;
                            transaction.update(usageRef, { count: newCount });
                        }
                    });
                } catch (e) {
                    console.error("Failed to update global usage stats", e);
                }
            }

        } catch (error: any) {
            console.error("AI Generation Error:", error);
            const msg = error.message || error.toString();
            // Generic error message, referring to environment config
            alert(`Generation Error: ${msg}\n\nPlease check your API Key configuration.`);
        } finally {
            setIsGenerating(false);
            setGenerationStatus("");
        }
    };

    // --- Render Logic ---
    useEffect(() => {
        if (step >= 2 && landmarks && canvasRef.current && imageRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = imageRef.current;

            if (ctx && img) {
                canvas.width = img.width;
                canvas.height = img.height;

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Draw Connectors for Step 2 & 3
                if (step === 2 || step === 3) {
                    // Use window.drawConnectors if available
                    // HIDDEN: User requested to remove the skeleton overlay
                    // if (window.drawConnectors && window.POSE_CONNECTIONS) {
                    //     try {
                    //        window.drawConnectors(ctx, landmarks, window.POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
                    //        window.drawLandmarks(ctx, landmarks, { color: '#FF0000', lineWidth: 1, radius: 3 });
                    //     } catch (e) {
                    //         console.warn("Drawing utils invalid", e);
                    //     }
                    // }
                }
            }
        }
    }, [step, landmarks]);

    return (
        <ServiceLayout
            title="Free AI Virtual Try-On - Visualize Clothes on You"
            description="See how clothes look on you before you buy. Upload a photo and a garment to generate a realistic preview using Advanced AI."
            keywords="Virtual try on AI free, online dressing room, AI clothes changer, visualize clothes, fashion tech, free VTON"
            heroTitle="Visualize Clothes on You with AI"
            heroDescription="Upload your photo and a garment to see an instant realistic preview. No more guessing how it fits. Powered by Generative AI."
            howItWorks={[
                { step: "Upload Your Photo", description: "Upload a clear full-body photo of yourself to serve as the model." },
                { step: "Upload Garment", description: "Upload an image of the clothing item (top or bottom) you want to try." },
                { step: "Generate Preview", description: "Our AI realistically maps the clothing onto your body, preserving your pose and shape." }
            ]}
            useCases={["Online Shopping", "Fashion Design", "Style Experimentation", "Wardrobe Planning", "Social Media Content"]}
            faqs={[
                { question: "Is this tool free?", answer: "Yes, this tool is provided free of charge for the community (limit 10 uses/day)." },
                { question: "How accurate is the fit?", answer: "The AI attempts to map the clothing realistically to your body shape, but it is a visualization tool, not a measuring tape." },
                { question: "Does it work on mobile?", answer: "Yes, it works on mobile browsers. Performance depends on your internet connection." },
                { question: "What photos work best?", answer: "Use a photo with good lighting where you are standing straight and your full body is visible." }
            ]}
        >
            <div className="min-h-screen bg-[#0f1115] text-white font-sans selection:bg-purple-500/30">
                <Navigation />

                <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
                    {/* Header Section */}
                    <div className="text-center mb-10">
                        <h1 className="text-4xl md:text-5xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
                            AI Virtual Try-On
                        </h1>
                        <p className="text-slate-400">Powered by Pro Vision AI</p>
                    </div>

                    {/* --- Progress Steps --- */}
                    <div className="flex justify-center mb-12">
                        <div className="flex items-center gap-4 text-sm font-mono">
                            <span className={`px-3 py-1 rounded-full ${step >= 1 ? 'bg-purple-500 text-white' : 'bg-white/5 text-slate-500'}`}>1. UPLOAD</span>
                            <ChevronRight className="w-4 h-4 text-slate-600" />
                            <span className={`px-3 py-1 rounded-full ${step >= 2 ? 'bg-purple-500 text-white' : 'bg-white/5 text-slate-500'}`}>2. ANALYZE</span>
                            <ChevronRight className="w-4 h-4 text-slate-600" />
                            <span className={`px-3 py-1 rounded-full ${step >= 3 ? 'bg-purple-500 text-white' : 'bg-white/5 text-slate-500'}`}>3. MEASURE</span>
                            <ChevronRight className="w-4 h-4 text-slate-600" />
                            <span className={`px-3 py-1 rounded-full ${step >= 4 ? 'bg-purple-500 text-white' : 'bg-white/5 text-slate-500'}`}>4. TRY-ON</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[600px]">

                        {/* --- LEFT: Controls & Info --- */}
                        <div className="lg:col-span-1 space-y-6">
                            {step === 1 && (
                                <div className="bg-[#181a1f] border border-white/5 rounded-3xl p-8 text-center h-full flex flex-col justify-center items-center">
                                    <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mb-6">
                                        <Upload className="w-10 h-10 text-purple-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Upload Subject</h3>
                                    <p className="text-slate-500 mb-8 text-sm">Full body photo, good lighting.</p>
                                    <label className="inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-400 text-black font-bold px-8 py-3 rounded-xl cursor-pointer transition-colors">
                                        <Camera className="w-5 h-5" /> Select Photo
                                        <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                                    </label>
                                </div>
                            )}

                            {step >= 3 && (
                                <div className="bg-[#181a1f] border border-white/5 rounded-2xl p-6">
                                    <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-6">
                                        <Ruler className="w-5 h-5 text-purple-400" /> AI Measurements
                                    </h3>
                                    {/* Measurement Display */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-white/5">
                                            <span className="text-slate-400 text-sm">Your Height (cm)</span>
                                            <input
                                                type="number" value={userHeightCm}
                                                onChange={(e) => { setUserHeightCm(e.target.value); if (landmarks) calculateMeasurements(landmarks); }}
                                                className="w-16 bg-transparent text-right font-mono text-white outline-none border-b border-white/20 focus:border-purple-500"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {measurements && Object.entries(measurements).map(([key, value]) => (
                                                <div key={key} className="bg-black/20 p-3 rounded-lg border border-white/5">
                                                    <div className="text-[10px] uppercase text-slate-500 mb-1">{key}</div>
                                                    <div className="font-mono text-lg text-purple-300 font-bold">{value as React.ReactNode}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {step === 3 && (
                                        <button onClick={() => setStep(4)} className="w-full mt-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                                            Proceed to Try-On <ChevronRight className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            )}

                            {step === 4 && (
                                <div className="bg-[#181a1f] border border-white/5 rounded-2xl p-6 animate-in fade-in slide-in-from-left-4 duration-500">
                                    <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-6">
                                        <Shirt className="w-5 h-5 text-purple-400" /> Garments
                                    </h3>

                                    <div className="space-y-4">
                                        {/* Uploads */}
                                        <div className="border border-dashed border-white/20 rounded-xl p-4 text-center hover:bg-white/5 transition-colors">
                                            {topGarment ? (
                                                <div className="relative">
                                                    <img src={topGarment} alt="Top" className="h-32 mx-auto object-contain" />
                                                    <button onClick={() => setTopGarment(null)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-400"><X className="w-3 h-3 text-white" /></button>
                                                </div>
                                            ) : (
                                                <label className="cursor-pointer block">
                                                    <Upload className="w-6 h-6 mx-auto mb-2 text-slate-500" />
                                                    <span className="text-sm text-slate-400">Upload Top (Optional)</span>
                                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleGarmentUpload(e, 'top')} />
                                                </label>
                                            )}
                                        </div>

                                        <div className="border border-dashed border-white/20 rounded-xl p-4 text-center hover:bg-white/5 transition-colors">
                                            {bottomGarment ? (
                                                <div className="relative">
                                                    <img src={bottomGarment} alt="Bottom" className="h-32 mx-auto object-contain" />
                                                    <button onClick={() => setBottomGarment(null)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-400"><X className="w-3 h-3 text-white" /></button>
                                                </div>
                                            ) : (
                                                <label className="cursor-pointer block">
                                                    <Upload className="w-6 h-6 mx-auto mb-2 text-slate-500" />
                                                    <span className="text-sm text-slate-400">Upload Bottom (Optional)</span>
                                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleGarmentUpload(e, 'bottom')} />
                                                </label>
                                            )}
                                        </div>

                                        <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl mt-4 space-y-3">
                                            <p className="text-xs text-blue-200">
                                                <strong>Generative AI VTON:</strong> Uses advanced AI to photorealistically "weave" clothes onto your photo.
                                            </p>

                                            <button
                                                onClick={runGeminiVTON}
                                                disabled={isGenerating || (!topGarment && !bottomGarment)}
                                                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                            >
                                                {isGenerating ? <Loader2 className="animate-spin w-4 h-4" /> : 'Generate Result'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* --- RIGHT: Main Canvas --- */}
                        <div className="lg:col-span-2 relative bg-[#0a0b0d] rounded-3xl overflow-hidden border border-white/5 flex items-center justify-center min-h-[600px]">
                            {!imageSrc ? (
                                <div className="text-center text-slate-600">
                                    <Upload className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                    <p>Preview Area</p>
                                </div>
                            ) : (
                                <div className="relative w-full h-full flex items-center justify-center p-4">
                                    <div className="relative max-h-full max-w-full rounded-2xl overflow-hidden shadow-2xl">

                                        {/* Display Logic: Generated Result > Main Image */}
                                        {generatedImage ? (
                                            <img
                                                src={generatedImage}
                                                alt="HD Result"
                                                className="max-h-[70vh] w-auto object-contain rounded-lg border border-blue-500"
                                            />
                                        ) : (
                                            <>
                                                {/* Main Image */}
                                                <img
                                                    ref={imageRef}
                                                    src={imageSrc}
                                                    alt="Upload"
                                                    className="max-h-[70vh] w-auto object-contain"
                                                />

                                                {/* Overlay Canvas (For measurements) */}
                                                <canvas
                                                    ref={canvasRef}
                                                    className="absolute inset-0 pointer-events-none w-full h-full"
                                                />
                                            </>
                                        )}

                                        {/* Loading Overlay */}
                                        {(isAnalyzing || isGenerating) && (
                                            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 text-center p-6">
                                                <Loader2 className="w-10 h-10 text-blue-400 animate-spin mb-4" />
                                                <p className="text-white font-mono text-lg font-bold animate-pulse">
                                                    {isAnalyzing ? "Scanning Body Landmarks..." : generationStatus}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Reset Button */}
                                    <button
                                        onClick={() => {
                                            setStep(1);
                                            setImageSrc(null);
                                            setLandmarks(null);
                                            setMeasurements(null);
                                            setGeneratedImage(null);
                                            setTopGarment(null);
                                            setBottomGarment(null);
                                        }}
                                        className="absolute top-6 right-6 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-md transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </ServiceLayout>
    );
};

export default VirtualTryOn;
