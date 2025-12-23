import React, { useEffect, useState } from 'react';

const Cursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      
      const target = e.target as HTMLElement;
      // Check if target or its parents are interactive
      const isInteractive = 
        window.getComputedStyle(target).cursor === 'pointer' ||
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') !== null ||
        target.closest('button') !== null;
        
      setIsPointer(isInteractive);
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  return (
    <div className="hidden md:block pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Main Cursor Dot */}
      <div 
        className="fixed top-0 left-0 w-3 h-3 bg-brand-accent rounded-full mix-blend-difference transition-transform duration-100 ease-out will-change-transform"
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px) scale(${isPointer ? 2.5 : 1})` 
        }}
      />
      {/* Trailing Ring */}
      <div 
        className="fixed top-0 left-0 w-8 h-8 border border-brand-accent rounded-full transition-transform duration-300 ease-out opacity-50 will-change-transform"
        style={{ 
          transform: `translate(${position.x - 14}px, ${position.y - 14}px) scale(${isPointer ? 1.5 : 1})` 
        }}
      />
      {/* Crosshair lines for "Scope" feel - Added pointer-events-none */}
      <div 
         className="fixed bg-white opacity-5 pointer-events-none"
         style={{
             top: position.y,
             left: 0,
             width: '100%',
             height: '1px',
             transform: 'translateY(6px)'
         }}
      />
      <div 
         className="fixed bg-white opacity-5 pointer-events-none"
         style={{
             left: position.x,
             top: 0,
             height: '100%',
             width: '1px',
             transform: 'translateX(6px)'
         }}
      />
    </div>
  );
};

export default Cursor;