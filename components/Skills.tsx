import React from 'react';
import { SKILL_CATEGORIES } from '../constants';

const Skills: React.FC = () => {
  // Flatten all skills into a single array or process by category
  const allSkills = SKILL_CATEGORIES.flatMap(cat => cat.skills);
  const row1 = allSkills.slice(0, Math.ceil(allSkills.length / 2));
  const row2 = allSkills.slice(Math.ceil(allSkills.length / 2));

  return (
    <section id="expertise" className="py-32 bg-brand-panel relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-brand-dark to-transparent z-10"></div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-brand-dark to-transparent z-10"></div>
        
        <div className="text-center mb-20 relative z-20 px-4">
            <span className="font-mono text-brand-accent tracking-widest text-xs uppercase mb-4 block">Tech Stack</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white">CAPABILITIES_</h2>
        </div>

        {/* Marquee Row 1 */}
        <div className="relative flex overflow-x-hidden mb-8 opacity-80 hover:opacity-100 transition-opacity duration-500">
            <div className="animate-marquee whitespace-nowrap py-4">
                {row1.map((skill, i) => (
                    <span key={i} className="mx-8 font-display text-6xl md:text-8xl font-bold text-transparent text-outline hover:text-white transition-colors cursor-default">
                        {skill}
                    </span>
                ))}
            </div>
            <div className="absolute top-0 animate-marquee2 whitespace-nowrap py-4">
                 {row1.map((skill, i) => (
                    <span key={`dup-${i}`} className="mx-8 font-display text-6xl md:text-8xl font-bold text-transparent text-outline hover:text-white transition-colors cursor-default">
                        {skill}
                    </span>
                ))}
            </div>
        </div>

        {/* Marquee Row 2 (Reverse) */}
        <div className="relative flex overflow-x-hidden opacity-80 hover:opacity-100 transition-opacity duration-500">
            <div className="animate-marquee-reverse whitespace-nowrap py-4">
                {row2.map((skill, i) => (
                    <span key={i} className="mx-8 font-display text-6xl md:text-8xl font-bold text-transparent text-outline hover:text-white transition-colors cursor-default">
                        {skill}
                    </span>
                ))}
            </div>
             <div className="absolute top-0 animate-marquee-reverse2 whitespace-nowrap py-4">
                {row2.map((skill, i) => (
                    <span key={`dup-${i}`} className="mx-8 font-display text-6xl md:text-8xl font-bold text-transparent text-outline hover:text-white transition-colors cursor-default">
                        {skill}
                    </span>
                ))}
            </div>
        </div>
        
        {/* Style helper for infinite scroll seamless loop */}
        <style>{`
            .animate-marquee { animation: marquee 35s linear infinite; }
            .animate-marquee2 { animation: marquee2 35s linear infinite; }
            .animate-marquee-reverse { animation: marqueeReverse 35s linear infinite; }
            .animate-marquee-reverse2 { animation: marqueeReverse2 35s linear infinite; }

            @keyframes marquee {
                0% { transform: translateX(0%); }
                100% { transform: translateX(-100%); }
            }
            @keyframes marquee2 {
                0% { transform: translateX(100%); }
                100% { transform: translateX(0%); }
            }
             @keyframes marqueeReverse {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(0%); }
            }
            @keyframes marqueeReverse2 {
                0% { transform: translateX(0%); }
                100% { transform: translateX(100%); }
            }
        `}</style>
    </section>
  );
};

export default Skills;