import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Code, Target } from 'lucide-react';
import { PROJECTS } from '../constants';

const ProjectPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const project = PROJECTS.find(p => p.id === id);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    if (!project) {
        return (
            <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center text-white">
                <h1 className="text-4xl font-display font-bold mb-4">404</h1>
                <p className="font-mono text-gray-400 mb-8">Project not found.</p>
                <Link to="/" className="px-6 py-3 border border-white/20 rounded-full hover:bg-white hover:text-black transition-colors">
                    Return Home
                </Link>
            </div>
        );
    }

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
                    <span className="font-mono text-xs text-gray-500 uppercase">Viewing Project File: {project.id}</span>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
                {/* Header */}
                <header className="mb-16">
                    <div className="inline-flex items-center gap-3 mb-6 px-3 py-1 border border-brand-accent/30 rounded-full bg-brand-accent/5">
                        <span className="font-mono text-xs text-brand-accent tracking-wider">{project.year}</span>
                    </div>
                    <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                        {project.title}
                    </h1>
                    <div className="flex flex-wrap gap-2 text-sm font-mono text-gray-400">
                        {project.tags.map((tag, i) => (
                            <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                                {tag}
                            </span>
                        ))}
                    </div>
                </header>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left: Description & Details */}
                    <div className="lg:col-span-5 space-y-12">
                        <div className="prose prose-invert prose-lg max-w-none">
                            <h3 className="text-sm font-mono text-brand-accent uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Target className="w-4 h-4" /> Project Overview
                            </h3>
                            <p className="text-gray-300 leading-relaxed text-lg">
                                {project.longDescription || project.description}
                            </p>
                        </div>

                        {project.challenges && (
                            <div>
                                <h3 className="text-sm font-mono text-brand-accent uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Code className="w-4 h-4" /> Technical Challenges
                                </h3>
                                <p className="text-gray-400 leading-relaxed">
                                    {project.challenges}
                                </p>
                            </div>
                        )}

                        {project.link && project.link !== '#' && (
                            <div className="pt-8 border-t border-white/10">
                                <a
                                    href={project.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold uppercase tracking-wider hover:bg-brand-accent transition-colors rounded-lg w-full justify-center lg:w-auto"
                                >
                                    <span>Launch Project</span>
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Right: Gallery */}
                    <div className="lg:col-span-7 space-y-8">
                        {project.images && project.images.length > 0 ? (
                            project.images.map((img, idx) => (
                                <div key={idx} className="group relative overflow-hidden rounded-xl border border-white/10 bg-black">
                                    <div className="absolute inset-0 bg-brand-accent/0 group-hover:bg-brand-accent/5 transition-colors z-10 pointer-events-none"></div>
                                    <img
                                        src={img}
                                        alt={`${project.title} - View ${idx + 1}`}
                                        className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                                        loading="lazy"
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="h-96 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl font-mono text-gray-500">
                                <p>NO VISUAL DATA AVAILABLE</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Simple Footer */}
            <footer className="border-t border-white/10 py-12 text-center font-mono text-xs text-gray-600 uppercase tracking-widest">
                <p>End of File</p>
            </footer>
        </div>
    );
};

export default ProjectPage;
