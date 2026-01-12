import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertOctagon, XCircle, Search, Sparkles, Loader2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
// Use local worker with Vite's ?url suffix to ensure correct path resolution without external CDNs
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { GoogleGenerativeAI } from "@google/generative-ai";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

import Navigation from '../Navigation';
import ServiceLayout from '../layout/ServiceLayout';

const ATSScanner: React.FC = () => {
    const [resumeText, setResumeText] = useState<string>('');
    const [jobDesc, setJobDesc] = useState<string>('');
    const [fileName, setFileName] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [result, setResult] = useState<{ score: number, missingKeywords: string[], criticalFeedback: string[] } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isParsing, setIsParsing] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset state
        setFileName(file.name);
        setError(null);
        setResult(null);
        setResumeText('');
        setIsParsing(true);

        try {
            if (file.type === 'application/pdf') {
                const arrayBuffer = await file.arrayBuffer();
                // Load the document using PDF.js
                // standard font data is loaded from standard CDN automatically by pdf.js logic usually, 
                // but worker is the critical part.
                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                const pdf = await loadingTask.promise;

                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map((item: any) => item.str).join(' ');
                    fullText += pageText + ' ';
                }

                // Cleanup text mostly for checking emptiness
                if (!fullText.trim() || fullText.trim().length < 20) {
                    throw new Error("Parsed text is empty. Your PDF might be an image scan (not selectable text).");
                }
                setResumeText(fullText);
            } else {
                throw new Error("Only PDF files are supported.");
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to parse PDF. Please try a text-based PDF.");
        } finally {
            setIsParsing(false);
        }
    };



    const handleScan = async () => {
        if (!resumeText || !jobDesc) {
            setError("Please upload a resume and paste the job description.");
            return;
        }

        let API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
        if (!API_KEY) {
            setError("Configuration Error: Missing VITE_GEMINI_API_KEY in .env file.");
            return;
        }

        // Sanitize API Key (remove accidental quotes or whitespace)
        API_KEY = API_KEY.replace(/["']/g, '').trim();

        setIsScanning(true);
        setError(null);

        try {
            const genAI = new GoogleGenerativeAI(API_KEY);
            // User requested specific model version
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const prompt = `
            Act as a strict Applicant Tracking System (ATS) and Senior Technical Recruiter.
            Analyze the following Resume against the Job Description.

            Resume Text:
            "${resumeText.slice(0, 10000)}"

            Job Description:
            "${jobDesc.slice(0, 5000)}"

            Output a VALID JSON object with this exact structure (no markdown formatting, just raw JSON):
            {
                "score": <number 0-100 based on keyword match and relevance>,
                "missingKeywords": [<array of specific technical skills or requirements missing from resume>],
                "criticalFeedback": [<array of 3-5 specific, harsh, actionable improvements>]
            }
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean markdown code blocks if present
            const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();

            const data = JSON.parse(cleanJson);
            setResult(data);
        } catch (err: any) {
            console.error("Gemini Error:", err);
            const msg = err.message || "";
            if (msg.includes("404") || msg.includes("not found")) {
                setError("API Key Error: This key cannot access the required AI model. Please ensure your API key is valid and has 'Generative Language API' enabled.");
            } else {
                setError(`Analysis Failed: ${msg}`);
            }
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <ServiceLayout
            title="Free AI Resume Improver - Optimize Your CV Online"
            description="Improve your resume instantly with AI. Get scoring, keyword suggestions, and formatting tips to beat applicant tracking systems (ATS)."
            keywords="AI resume checker free, CV improver, ATS resume scanner, resume optimization online, resume score, job application helper"
            heroTitle="Optimize Your Resume with AI"
            heroDescription="Get instant feedback on your resume. Improve your score, fix formatting, and beat ATS filters to get hired faster."
            howItWorks={[
                { step: "Upload Resume", description: "Upload your PDF resume to extract the text automatically." },
                { step: "Add Job Description", description: "Paste the job description you are applying for to get targeted feedback." },
                { step: "Get AI Report", description: "Receive a detailed score, missing keywords, and actionable tips." }
            ]}
            useCases={["Job Seekers", "Students", "Career Changers", "LinkedIn Optimization", "Interview Prep"]}
            faqs={[
                { question: "Is my data saved?", answer: "No, we process your resume locally/temporarily. It is not stored on our servers for privacy." },
                { question: "How does the scoring work?", answer: "We analyze keyword density, action verbs, and readability against industry standards and the specific job description." },
                { question: "Can I use PDF?", answer: "Yes, our tool supports PDF upload and automatic text extraction." },
                { question: "Is it free?", answer: "Yes, the resume analysis is completely free to help you land your dream job." }
            ]}
        >
            <div className="min-h-screen bg-[#0f1115] text-white selection:bg-brand-accent/30">
                <Navigation />

                <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
                            ATS Resume Scanner
                        </h1>
                        <p className="text-slate-400 text-lg">
                            Beat the bots. Get an instant score and keywords check before you apply.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left: Inputs */}
                        <div className="space-y-6">
                            {/* 1. Resume Upload */}
                            <div className="bg-[#181a1f] border border-white/5 rounded-2xl p-6">
                                <h3 className="font-bold text-slate-300 mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-blue-400" /> Resume (PDF)</h3>

                                {!fileName ? (
                                    <label className={`block w-full border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all group ${error ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 hover:bg-white/5 hover:border-blue-400/50'}`}>
                                        {isParsing ? (
                                            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-3" />
                                        ) : (
                                            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                                <Upload className="w-6 h-6 text-blue-400" />
                                            </div>
                                        )}
                                        <span className={`transition-colors ${error ? 'text-red-400' : 'text-slate-400 group-hover:text-white'}`}>
                                            {isParsing ? "Reading PDF..." : error ? "Upload Failed - Try Again" : "Click to Upload PDF"}
                                        </span>
                                        <input type="file" className="hidden" accept="application/pdf" onChange={handleFileUpload} disabled={isParsing} />
                                    </label>
                                ) : (
                                    <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-8 h-8 text-blue-400" />
                                            <div>
                                                <p className="font-medium text-white">{fileName}</p>
                                                <p className="text-xs text-blue-300">PDF Parsed Successfully ({resumeText.length} chars)</p>
                                            </div>
                                        </div>
                                        <button onClick={() => { setFileName(null); setResumeText(''); setError(null); }} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white">Change</button>
                                    </div>
                                )}
                            </div>

                            {/* 2. Job Desc */}
                            <div className="bg-[#181a1f] border border-white/5 rounded-2xl p-6 flex-1 h-[400px] flex flex-col">
                                <h3 className="font-bold text-slate-300 mb-4 flex items-center gap-2"><Search className="w-5 h-5 text-purple-400" /> Job Description</h3>
                                <textarea
                                    value={jobDesc}
                                    onChange={(e) => setJobDesc(e.target.value)}
                                    placeholder="Paste the full job description here..."
                                    className="flex-1 w-full bg-black/30 border border-white/10 rounded-xl p-4 text-slate-300 focus:outline-none focus:border-purple-500/50 resize-none font-mono text-sm leading-relaxed"
                                />
                            </div>

                            {/* Scan Action */}
                            <button
                                onClick={handleScan}
                                disabled={isScanning || !resumeText || !jobDesc}
                                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl ${isScanning || !resumeText || !jobDesc ? 'bg-white/5 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:scale-[1.02]'}`}
                            >
                                {isScanning ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</>
                                ) : (
                                    <><Sparkles className="w-5 h-5" /> Scan Resume Now</>
                                )}
                            </button>
                            {error && <p className="text-red-400 text-center text-sm">{error}</p>}
                        </div>

                        {/* Right: Results */}
                        <div className="relative">
                            {!result ? (
                                <div className="h-full bg-[#181a1f] border border-white/5 rounded-2xl flex flex-col items-center justify-center p-12 text-center opacity-50">
                                    <AlertOctagon className="w-16 h-16 text-slate-600 mb-6" />
                                    <h3 className="text-xl font-bold text-slate-400">Waiting for Scan</h3>
                                    <p className="text-slate-600 mt-2 max-w-sm">Upload your resume and paste the job description to start the analysis.</p>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6">
                                    {/* Score Card */}
                                    <div className="bg-[#181a1f] border border-white/5 rounded-2xl p-8 flex items-center gap-8">
                                        <div className="relative w-32 h-32 flex items-center justify-center">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-700" />
                                                <circle
                                                    cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent"
                                                    className={result.score > 75 ? "text-emerald-500" : result.score > 50 ? "text-amber-500" : "text-red-500"}
                                                    strokeDasharray={351}
                                                    strokeDashoffset={351 - (351 * result.score) / 100}
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-3xl font-bold text-white">{result.score}%</span>
                                                <span className="text-[10px] uppercase tracking-wider text-slate-400">Match</span>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-2xl font-bold text-white mb-2">
                                                {result.score > 80 ? "Excellent Match!" : result.score > 60 ? "Good Potential" : "Needs Improvement"}
                                            </h2>
                                            <p className="text-slate-400 text-sm">
                                                {result.score > 80 ? "Your resume is highly optimized for this role." : "You are missing some key requirements found in the JD."}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Keywords */}
                                    <div className="bg-[#181a1f] border border-white/5 rounded-2xl p-6">
                                        <h4 className="font-bold text-slate-300 mb-4 flex items-center gap-2"><XCircle className="w-5 h-5 text-red-400" /> Missing Keywords</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {result.missingKeywords.length > 0 ? result.missingKeywords.map((kw, i) => (
                                                <span key={i} className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm">
                                                    {kw}
                                                </span>
                                            )) : (
                                                <p className="text-emerald-400 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> All key terms detected!</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Tips */}
                                    <div className="bg-[#181a1f] border border-white/5 rounded-2xl p-6">
                                        <h4 className="font-bold text-slate-300 mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-400" /> Recruiter Feedback</h4>
                                        <ul className="space-y-3">
                                            {result.criticalFeedback.map((tip, i) => (
                                                <li key={i} className="flex items-start gap-3 bg-white/5 p-3 rounded-xl">
                                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                                                    <span className="text-slate-300 text-sm leading-relaxed">{tip}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ServiceLayout>
    );
};

export default ATSScanner;
