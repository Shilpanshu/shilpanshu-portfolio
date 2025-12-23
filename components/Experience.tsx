import React from 'react';
import { EXPERIENCE, EDUCATION } from '../constants';
import { CircleDot } from 'lucide-react';

const Experience: React.FC = () => {
  return (
    <section id="about" className="py-32 bg-brand-dark px-4 border-t border-white/5 scroll-mt-16">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-16">
        
        <div className="lg:w-1/3">
            <h2 className="font-display text-4xl font-bold text-white mb-6 sticky top-32">
                HISTORY_ <br/>
                LOG
            </h2>
        </div>

        <div className="lg:w-2/3 space-y-24">
            {/* Experience Group */}
            <div>
                <h3 className="font-mono text-brand-accent mb-8">// EXPERIENCE</h3>
                <div className="border-l border-white/10 ml-2 space-y-12 pb-4">
                    {EXPERIENCE.map((job) => (
                        <div key={job.id} className="relative pl-12 group">
                            <div className="absolute left-[-5px] top-2 bg-brand-dark p-1">
                                <div className="w-2 h-2 rounded-full bg-gray-600 group-hover:bg-brand-accent transition-colors"></div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-2">
                                <h4 className="font-display text-2xl font-bold text-white">{job.role}</h4>
                                <span className="font-mono text-xs text-gray-500">{job.period}</span>
                            </div>
                            <p className="font-mono text-sm text-brand-accent mb-4">{job.company}</p>
                            <ul className="space-y-2">
                                {job.description.map((desc, i) => (
                                    <li key={i} className="text-gray-400 text-sm leading-relaxed pl-4 border-l border-white/5 hover:border-brand-accent/50 transition-colors">
                                        {desc}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Education Group */}
            <div>
                <h3 className="font-mono text-brand-accent mb-8">// ACADEMICS</h3>
                 <div className="border-l border-white/10 ml-2 space-y-12">
                    {EDUCATION.map((edu, idx) => (
                        <div key={idx} className="relative pl-12 group">
                            <div className="absolute left-[-5px] top-2 bg-brand-dark p-1">
                                <CircleDot className="w-3 h-3 text-gray-600 group-hover:text-brand-accent transition-colors" />
                            </div>
                            
                            <h4 className="font-display text-xl font-bold text-white">{edu.school}</h4>
                            <div className="flex justify-between items-center mt-1 mb-3">
                                <p className="font-mono text-sm text-gray-300">{edu.degree}</p>
                                <span className="font-mono text-xs text-gray-500">{edu.period}</span>
                            </div>
                            {edu.details && (
                                <div className="text-sm text-gray-500 font-mono bg-white/5 p-3 rounded">
                                    {edu.details.join(' • ')}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;