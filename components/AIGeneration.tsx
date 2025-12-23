import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { AI_CONTENT } from '../data/ai-content';

const AIGeneration: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-neutral-900 text-slate-200">
            {/* Navigation Bar */}
            <nav className="fixed top-0 w-full z-50 px-6 py-6 flex justify-between items-center bg-neutral-900/80 backdrop-blur-md border-b border-white/5">
                <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-mono text-sm uppercase tracking-wider">Back to Portfolio</span>
                </Link>
                <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-brand-accent animate-pulse">●</span>
                    <span className="font-mono text-xs text-gray-500 uppercase">Viewing Project: AI Fashion</span>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto space-y-32">
                {/* Header Section */}
                <header className="text-center max-w-4xl mx-auto mb-24">
                    <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 border border-brand-accent/30 rounded-full bg-brand-accent/5">
                        <Sparkles className="w-3 h-3 text-brand-accent" />
                        <span className="font-mono text-xs text-brand-accent tracking-wider">2024</span>
                    </div>
                    <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                        AI Image & Video Generation
                    </h1>
                    <p className="text-xl text-gray-400 leading-relaxed font-light">
                        A cinematic journey through AI-generated fashion, featuring Renaissance reimaginings, Neon editorials, and Underwater elegance.
                    </p>
                </header>

                {/* Content Sections */}
                {AI_CONTENT.map((section, idx) => (
                    <section key={idx} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        {/* 
                           Layout Logic:
                           - Usually images are on top or left. 
                           - The scrape showed "media" then "heading".
                           - For visual variety, we can alternate, but let's stick to a consistent premium grid for now, 
                             or maybe alternate based on index if we want that "magazine" feel.
                           - Let's try alternating: even index = text left, odd = text right.
                        */}

                        <div className={`lg:col-span-12 flex flex-col gap-8`}>
                            {/* Images/Video Grid for this section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {section.media.map((media, mIdx) => (
                                    <div key={mIdx} className={`relative group overflow-hidden rounded-lg border border-white/5 ${section.media.length === 1 ? 'md:col-span-2 max-w-4xl mx-auto w-full' : ''}`}>
                                        <video
                                            src={media.url}
                                            className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Section Text */}
                            <div className="text-center space-y-4 max-w-2xl mx-auto mt-8">
                                <h2 className="font-display text-3xl font-bold text-white tracking-wide">
                                    {section.heading}
                                </h2>
                                {section.description && (
                                    <p className="font-mono text-sm text-brand-accent uppercase tracking-widest">
                                        {section.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>
                ))}
            </main>

            {/* Footer */}
            <footer className="border-t border-white/10 py-12 text-center font-mono text-xs text-gray-600 uppercase tracking-widest">
                <p>AI Generated Concepts</p>
            </footer>
        </div>
    );
};

export default AIGeneration;
