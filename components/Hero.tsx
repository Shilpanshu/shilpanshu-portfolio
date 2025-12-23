import React from 'react';
import { ArrowDownCircle, Scan } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div id="home" className="relative h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-brand-dark">
      
      {/* Dynamic Background Grid */}
      <div className="absolute inset-0 bg-[size:50px_50px] bg-grid-pattern opacity-[0.07] pointer-events-none"></div>
      
      {/* Decorative HUD Elements */}
      <div className="absolute top-32 left-10 font-mono text-xs text-white/30 hidden md:block">
        <p>COORDINATES: 28.6139° N, 77.2090° E</p>
        <p>SYSTEM STATUS: ONLINE</p>
        <p>LAST LOGIN: TODAY</p>
      </div>
      
      <div className="absolute bottom-10 right-10 font-mono text-xs text-brand-accent hidden md:block animate-pulse">
        _READY_TO_DEPLOY
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 border border-brand-accent/30 rounded-full bg-brand-accent/5">
            <Scan className="w-4 h-4 text-brand-accent" />
            <span className="font-mono text-xs text-brand-accent tracking-wider">COMPUTER VISION ENGINEER</span>
        </div>

        <h1 className="font-display font-bold text-6xl md:text-8xl lg:text-9xl tracking-tighter text-white mb-6 leading-none">
          DIGITAL <br />
          <span className="text-outline hover:text-brand-accent transition-colors duration-500 cursor-default">REALITY</span>
        </h1>
        
        <p className="font-mono text-sm md:text-base text-gray-400 max-w-xl mx-auto leading-relaxed mb-12">
          // FASHION_TECH_ARCHITECT <br/>
          Bridging the gap between physical apparel and digital experiences through Augmented Reality and Advanced Automation.
        </p>

        <div className="flex justify-center gap-6">
           <a href="#work" className="group relative px-8 py-4 bg-white text-black font-bold font-display uppercase tracking-wider overflow-hidden">
              <span className="relative z-10">View Projects</span>
              <div className="absolute inset-0 bg-brand-accent transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 z-0"></div>
           </a>
        </div>
      </div>

      {/* Bottom Scroll Indicator */}
      <a href="#about" className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer z-20">
        <span className="font-mono text-[10px] uppercase tracking-widest text-white">Scroll to Explore</span>
        <ArrowDownCircle className="w-6 h-6 text-brand-accent animate-bounce" />
      </a>

      {/* Floating 3D Graphic Placeholder */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1/3 h-2/3 bg-gradient-to-l from-brand-accent/10 to-transparent blur-3xl rounded-full pointer-events-none"></div>
    </div>
  );
};

export default Hero;