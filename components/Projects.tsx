import React, { useState, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { PROJECTS } from '../constants';
import { Project } from '../types';
import { Link } from 'react-router-dom';

const Projects: React.FC = () => {
    const [hoveredProject, setHoveredProject] = useState<number | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
        // Calculate relative position to viewport for the image
        setMousePos({ x: e.clientX, y: e.clientY });
    };

    // Helper to get image source
    const getProjectImage = (project: Project) => {
        if (project.images && project.images.length > 0) {
            return project.images[0];
        }
        return 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop';
    }

    return (
        <section id="work" className="py-32 px-4 bg-brand-dark relative z-20" onMouseMove={handleMouseMove} ref={containerRef}>
            <div className="max-w-7xl mx-auto">
                <div className="flex items-end justify-between mb-20 border-b border-white/10 pb-6">
                    <h2 className="font-display text-4xl md:text-6xl font-bold text-white">SELECTED <br /> WORKS</h2>
                    <span className="font-mono text-brand-accent text-sm hidden md:block">[ 2023 - 2025 ]</span>
                </div>

                <div className="flex flex-col">
                    {PROJECTS.map((project, idx) => (
                        <Link
                            key={idx}
                            to={`/project/${project.id}`}
                            className="group relative border-b border-white/10 py-12 transition-colors hover:bg-white/5 block cursor-pointer"
                            onMouseEnter={() => setHoveredProject(idx)}
                            onMouseLeave={() => setHoveredProject(null)}
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                                <div className="md:w-1/2">
                                    <h3 className="font-display text-3xl md:text-5xl font-bold text-white group-hover:text-brand-accent transition-colors">
                                        {project.title}
                                    </h3>
                                    <div className="flex gap-2 mt-4">
                                        {project.tags.slice(0, 3).map((tag, t) => (
                                            <span key={t} className="font-mono text-xs border border-white/20 rounded-full px-3 py-1 text-gray-400">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="md:w-1/3 flex items-center justify-between md:justify-end gap-12">
                                    <p className="font-mono text-sm text-gray-500 hidden md:block max-w-[200px] text-right">
                                        {project.description.substring(0, 80)}...
                                    </p>
                                    <ArrowUpRight className="w-8 h-8 text-white group-hover:rotate-45 transition-transform duration-300" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Floating Reveal Image */}
            {hoveredProject !== null && (
                <div
                    className="hover-reveal-image fixed pointer-events-none z-40 overflow-hidden rounded-lg w-[400px] h-[250px] hidden md:block transition-opacity duration-200"
                    style={{
                        top: mousePos.y,
                        left: mousePos.x,
                        opacity: 1,
                        transform: 'translate(-50%, -50%) rotate(-5deg)'
                    }}
                >
                    <div className="absolute inset-0 bg-brand-accent/20 z-10 mix-blend-overlay"></div>
                    <img
                        src={getProjectImage(PROJECTS[hoveredProject])}
                        alt="Project Preview"
                        className="w-full h-full object-cover grayscale contrast-125"
                    />
                </div>
            )}
        </section>
    );
};

export default Projects;