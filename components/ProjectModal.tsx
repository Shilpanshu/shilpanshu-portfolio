import React, { useEffect } from 'react';
import { X, ExternalLink, Calendar, Code, Target } from 'lucide-react';
import { Project } from '../types';

interface ProjectModalProps {
    project: Project;
    onClose: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-6xl h-[90vh] bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in fade-in zoom-in-95 duration-300">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 bg-black/50 text-white hover:bg-white hover:text-black rounded-full transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Left Side: Gallery */}
                <div className="w-full md:w-3/5 h-1/2 md:h-full bg-black overflow-y-auto scrollbar-hide p-4 space-y-4">
                    {project.images && project.images.length > 0 ? (
                        project.images.map((img, idx) => (
                            <img
                                key={idx}
                                src={img}
                                alt={`${project.title} screenshot ${idx + 1}`}
                                className="w-full rounded-lg object-cover border border-white/5"
                            />
                        ))
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 font-mono">
                            NO_IMAGE_DATA
                        </div>
                    )}
                </div>

                {/* Right Side: Details */}
                <div className="w-full md:w-2/5 h-1/2 md:h-full overflow-y-auto p-8 bg-neutral-900 border-l border-white/10">
                    <div className="mb-6">
                        <span className="font-mono text-brand-accent text-sm tracking-widest uppercase mb-2 block">
                            Project File: {project.year}
                        </span>
                        <h2 className="font-display text-4xl font-bold text-white mb-4 leading-tight">
                            {project.title}
                        </h2>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {project.tags.map((tag, i) => (
                                <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-gray-300">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="prose prose-invert max-w-none">
                            <h3 className="text-sm font-mono text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Target className="w-4 h-4" /> Description
                            </h3>
                            <p className="text-gray-300 leading-relaxed">
                                {project.longDescription || project.description}
                            </p>
                        </div>

                        {project.challenges && (
                            <div>
                                <h3 className="text-sm font-mono text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Code className="w-4 h-4" /> Key Tech
                                </h3>
                                <p className="text-gray-300 leading-relaxed">
                                    {project.challenges}
                                </p>
                            </div>
                        )}

                        {project.link && project.link !== '#' && (
                            <a
                                href={project.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold uppercase tracking-wider hover:bg-brand-accent transition-colors rounded-lg"
                            >
                                <span>View Live Project</span>
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProjectModal;
