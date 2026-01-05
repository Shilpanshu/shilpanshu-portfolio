import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = ['About', 'Services', 'Expertise', 'Work', 'Connect'];

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 px-6 py-6 flex justify-between items-center mix-blend-difference">
        <a href="#home" className="flex items-center gap-2 cursor-pointer z-50">
          <span className="font-mono text-xs text-brand-accent">[001]</span>
          <span className="font-display font-bold text-xl text-white tracking-widest">SHILPANSHU</span>
        </a>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 items-center">
          {navItems.map((item, i) => {
            const isService = item === 'Services';
            const linkHref = isService ? '/services' : `/#${item.toLowerCase()}`;

            return (
              <a
                key={i}
                href={linkHref}
                className="group relative text-sm font-mono text-white/70 hover:text-brand-accent transition-colors uppercase tracking-wider"
              >
                <span className="mr-1 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity text-brand-accent">{`0${i + 1}`}</span>
                {item}
              </a>
            );
          })}
          <a
            href="/assets/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border border-brand-accent/50 text-brand-accent font-mono text-xs uppercase tracking-widest hover:bg-brand-accent hover:text-black transition-colors"
          >
            Resume
          </a>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden z-50">
          <button onClick={toggleMenu} className="text-white hover:text-brand-accent transition-colors">
            {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-brand-dark z-40 transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden flex flex-col justify-center items-center`}>
        {/* Background Grid for Mobile Menu */}
        <div className="absolute inset-0 bg-[size:50px_50px] bg-grid-pattern opacity-[0.05] pointer-events-none"></div>

        <div className="flex flex-col gap-8 text-center relative z-10">
          {navItems.map((item, i) => (
            <a
              key={i}
              href={item === 'Services' ? '/services' : `/#${item.toLowerCase()}`}
              onClick={() => setIsOpen(false)}
              className="font-display text-5xl font-bold text-white hover:text-brand-accent transition-colors"
            >
              {item}
            </a>
          ))}
          <a
            href="/assets/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="font-display text-3xl font-bold text-brand-accent border border-brand-accent px-6 py-2 mt-4"
          >
            RESUME
          </a>
        </div>

        <div className="absolute bottom-10 font-mono text-xs text-gray-500">
          SYSTEM STATUS: ONLINE
        </div>
      </div>
    </>
  );
};

export default Navigation;