import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { FileOutput, Upload, Download, Loader2, FileType, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '../Navigation';

type ConversionType = 'csv-to-excel' | 'image-to-pdf' | 'excel-to-json';

const converters = [
    { id: 'csv-to-excel', label: 'CSV to Excel', accept: '.csv' },
    { id: 'image-to-pdf', label: 'Image to PDF', accept: 'image/*' },
    { id: 'excel-to-json', label: 'Excel to JSON', accept: '.xlsx, .xls' }
];

const FileConverter: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [outputFormat, setOutputFormat] = useState<string>('');
    const [isConverting, setIsConverting] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [downloadName, setDownloadName] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    // --- supported formats ---
    const getSupportedOutputs = (mime: string, name: string): string[] => {
        const ext = name.split('.').pop()?.toLowerCase();
        if (mime.startsWith('image/')) return ['pdf', 'png', 'jpg', 'webp'];
        if (ext === 'csv') return ['xlsx', 'json'];
        if (ext === 'xlsx' || ext === 'xls') return ['csv', 'json'];
        if (ext === 'json') return ['csv', 'xlsx'];
        return [];
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const f = e.target.files[0];
            setFile(f);
            setDownloadUrl(null);
            setError(null);
            const outputs = getSupportedOutputs(f.type, f.name);
            if (outputs.length > 0) setOutputFormat(outputs[0]);
            else setError("Unsupported file type.");
        }
    };

    const convert = async () => {
        if (!file || !outputFormat) return;
        setIsConverting(true);
        setError(null);

        try {
            await new Promise(r => setTimeout(r, 500)); // UX delay

            const ext = file.name.split('.').pop()?.toLowerCase();
            const mime = file.type;

            // --- 1. Image Conversions ---
            if (mime.startsWith('image/')) {
                const img = new Image();
                img.src = URL.createObjectURL(file);
                await new Promise(resolve => { img.onload = resolve; });

                if (outputFormat === 'pdf') {
                    const pdf = new jsPDF();
                    const imgProps = pdf.getImageProperties(img);
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                    pdf.addImage(img, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    const blob = pdf.output('blob');
                    setDownloadUrl(URL.createObjectURL(blob));
                    setDownloadName(file.name.replace(/\.[^/.]+$/, "") + ".pdf");

                } else {
                    // Canvas Convert (PNG, JPG, WEBP)
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0);
                    const outMime = `image/${outputFormat === 'jpg' ? 'jpeg' : outputFormat}`;
                    canvas.toBlob((blob) => {
                        if (blob) setDownloadUrl(URL.createObjectURL(blob));
                        setDownloadName(file.name.replace(/\.[^/.]+$/, "") + `.${outputFormat}`);
                    }, outMime);
                }

                // --- 2. Data Conversions ---
            } else if (['csv', 'xlsx', 'xls', 'json'].includes(ext || '')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = e.target?.result;
                        let wb = XLSX.utils.book_new();
                        let ws;

                        // Parse Input
                        if (ext === 'json') {
                            const jsonData = JSON.parse(data as string);
                            ws = XLSX.utils.json_to_sheet(Array.isArray(jsonData) ? jsonData : [jsonData]);
                            XLSX.utils.book_append_sheet(wb, ws, "Data");
                        } else if (ext === 'csv') {
                            wb = XLSX.read(data, { type: 'string' });
                        } else { // xlsx
                            wb = XLSX.read(data, { type: 'binary' });
                        }

                        // Write Output
                        if (outputFormat === 'xlsx') {
                            const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                            const blob = new Blob([out], { type: "application/octet-stream" });
                            setDownloadUrl(URL.createObjectURL(blob));
                        } else if (outputFormat === 'csv') {
                            const csv = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]]);
                            const blob = new Blob([csv], { type: "text/csv" });
                            setDownloadUrl(URL.createObjectURL(blob));
                        } else if (outputFormat === 'json') {
                            const json = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
                            const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
                            setDownloadUrl(URL.createObjectURL(blob));
                        }
                        setDownloadName(file.name.replace(/\.[^/.]+$/, "") + `.${outputFormat}`);

                    } catch (err) { setError("Parsing Error"); }
                };

                if (ext === 'xlsx' || ext === 'xls') reader.readAsBinaryString(file);
                else reader.readAsText(file);
            }

        } catch (err) {
            console.error(err);
            setError("Conversion Failed");
        }
        setIsConverting(false);
    };

    return (
        <div className="min-h-screen bg-[#0f1115] text-white">
            <Navigation />
            <div className="max-w-6xl mx-auto px-6 pt-24 pb-12">

                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 mb-4">
                        Universal File Converter
                    </h1>
                    <p className="text-slate-400 text-lg">
                        The ultimate student utility. Convert images, documents, and data locally.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto bg-[#181a1f] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    {/* Background Decor */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

                    {!file ? (
                        <label className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-white/10 rounded-2xl hover:bg-white/5 hover:border-emerald-500/50 transition-all cursor-pointer group">
                            <div className="w-20 h-20 bg-[#0f1115] rounded-full flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                                <Upload className="w-8 h-8 text-slate-400 group-hover:text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Drop your file here</h3>
                            <p className="text-slate-500 text-sm mb-1">Supports: JPG, PNG, Excel, CSV, JSON</p>
                            <input type="file" className="hidden" onChange={handleFileChange} />
                        </label>
                    ) : (
                        <div className="space-y-8">
                            {/* File Info */}
                            <div className="flex items-center gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
                                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center">
                                    <FileType className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-white">{file.name}</h4>
                                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB • {file.type || 'Unknown Type'}</p>
                                </div>
                                <button onClick={() => { setFile(null); setDownloadUrl(null); }} className="text-slate-500 hover:text-white p-2">
                                    <Upload className="w-5 h-5 rotate-45" />
                                </button>
                            </div>

                            {/* Controls */}
                            {!downloadUrl && !isConverting && (
                                <div className="flex flex-col md:flex-row gap-4 items-center justify-center animate-in fade-in slide-in-from-bottom-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-400">Convert to:</span>
                                        <select
                                            value={outputFormat}
                                            onChange={(e) => setOutputFormat(e.target.value)}
                                            className="bg-black/30 border border-white/10 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                                        >
                                            {getSupportedOutputs(file.type, file.name).map(fmt => (
                                                <option key={fmt} value={fmt}>{fmt.toUpperCase()}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        onClick={convert}
                                        className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-2 rounded-lg transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                                    >
                                        Convert File
                                    </button>
                                </div>
                            )}

                            {/* Loading */}
                            {isConverting && (
                                <div className="text-center py-8">
                                    <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-4" />
                                    <p className="text-slate-300">Processing conversion...</p>
                                </div>
                            )}

                            {/* Success */}
                            {downloadUrl && (
                                <div className="text-center bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 animate-in zoom-in-95">
                                    <div className="w-16 h-16 bg-emerald-500 text-black rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                                        <Check className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Done!</h3>
                                    <p className="text-slate-400 mb-6">Your file has been converted to .{outputFormat}</p>
                                    <a
                                        href={downloadUrl}
                                        download={downloadName}
                                        className="inline-flex items-center gap-2 bg-white text-black font-bold px-8 py-3 rounded-xl hover:bg-slate-200 transition-colors"
                                    >
                                        <Download className="w-5 h-5" />
                                        Download File
                                    </a>
                                </div>
                            )}

                            {error && <p className="text-red-400 text-center">{error}</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileConverter;
