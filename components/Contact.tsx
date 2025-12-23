import React from 'react';
import { PROFILE } from '../constants';
import { ArrowUpRight, Copy } from 'lucide-react';

const Contact: React.FC = () => {
    return (
        <footer id="connect" className="bg-brand-dark pt-32 pb-8 px-4 border-t border-white/10 relative overflow-hidden">
            {/* Large Background Text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-display font-bold text-white/5 pointer-events-none whitespace-nowrap">
                SHILPANSHU
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-12">
                    <div>
                        <h2 className="font-display text-6xl md:text-8xl font-bold text-white leading-none mb-8">
                            LET'S <br />
                            <span className="text-brand-accent">BUILD</span> IT.
                        </h2>
                        <p className="font-mono text-gray-400 max-w-md">
                            Open for collaborations in Fashion Tech, AR, and Computer Vision. Currently based in {PROFILE.location}.
                        </p>
                    </div>

                    <div className="flex flex-col gap-6">
                        <a href={`mailto:${PROFILE.email}`} className="group flex items-center justify-between gap-8 border-b border-white/20 pb-4 text-2xl font-display text-white hover:border-brand-accent transition-colors">
                            <span>{PROFILE.email}</span>
                            <ArrowUpRight className="w-6 h-6 group-hover:rotate-45 transition-transform" />
                        </a>
                        <div className="flex gap-4">
                            <a href={PROFILE.linkedin} target="_blank" rel="noreferrer" className="px-6 py-3 border border-white/20 rounded-full text-sm font-mono text-white hover:bg-white hover:text-black transition-all">
                                LINKEDIN
                            </a>
                            <a href="/assets/resume.pdf" target="_blank" rel="noopener noreferrer" className="px-6 py-3 border border-white/20 rounded-full text-sm font-mono text-white hover:bg-white hover:text-black transition-all">
                                RESUME
                            </a>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center text-[10px] font-mono text-gray-600 uppercase tracking-widest border-t border-white/5 pt-8">
                    <p>Designed & Engineered by Shilpanshu © {new Date().getFullYear()}</p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <span>React</span>
                        <span>Tailwind</span>
                        <span>Motion</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Contact;