import React from 'react';
import { motion } from 'framer-motion';
import { Eraser, FileText, Palette, FileOutput, ArrowRight, ScanSearch } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from './Navigation';

const tools = [
  {
    id: 'remove-bg',
    title: 'AI Background Remover',
    description: 'Instantly remove backgrounds from images using simplified client-side AI.',
    icon: Eraser,
    color: 'text-pink-500',
    gradient: 'from-pink-500/20 to-purple-500/20',
    link: '/services/ai-background-remover'
  },
  {
    id: 'resume-improver',
    title: 'ATS Resume Scanner',
    description: 'Beat the hiring bots. Get an instant match score and missing keywords check using Gemini AI.',
    icon: ScanSearch,
    color: 'text-purple-400',
    gradient: 'from-blue-500/20 to-purple-500/20',
    link: '/services/resume-improver'
  },
  {
    id: 'palette-extractor',
    title: 'Palette Extractor',
    description: 'Extract beautiful color palettes from any image automatically.',
    icon: Palette,
    color: 'text-amber-500',
    gradient: 'from-amber-500/20 to-orange-500/20',
    link: '/services/palette-extractor'
  },
  {
    id: 'file-converter',
    title: 'File Converter Hub',
    description: 'Secure, private file conversions entirely in your browser.',
    icon: FileOutput,
    color: 'text-emerald-500',
    gradient: 'from-emerald-500/20 to-green-500/20',
    link: '/services/file-converter'
  }
];

const Services: React.FC = () => {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-brand-dark pt-24 px-6 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
              Creation <span className="text-brand-accent">Toolkit</span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg font-light leading-relaxed">
              A suite of intelligent, client-side tools designed to accelerate your creative workflow.
              Free, private, and running directly in your browser.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tools.map((tool, index) => (
              <Link to={tool.link} key={tool.id}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className={`relative p-8 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden group hover:border-white/10 transition-all cursor-pointer h-full`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div className="relative z-10 flex flex-col items-start gap-4">
                    <div className={`p-4 rounded-xl bg-white/5 ${tool.color} group-hover:bg-black/20 transition-colors`}>
                      <tool.icon className="w-8 h-8" />
                    </div>

                    <div>
                      <h3 className="text-2xl font-display font-bold text-white mb-2 group-hover:text-brand-accent transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-slate-400 group-hover:text-slate-200 transition-colors text-sm leading-relaxed">
                        {tool.description}
                      </p>
                    </div>

                    <div className="mt-auto pt-4 flex items-center gap-2 text-sm font-mono text-brand-accent opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                      OPEN TOOL <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Services;
