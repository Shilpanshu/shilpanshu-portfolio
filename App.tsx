import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import ProjectPage from './components/ProjectPage';
import AIGeneration from './components/AIGeneration';
import Cursor from './components/Cursor';
import Services from './components/Services';
import BackgroundRemover from './components/tools/BackgroundRemover';
import PaletteExtractor from './components/tools/PaletteExtractor';
import FileConverter from './components/tools/FileConverter';
import ResumeImprover from './components/tools/ResumeImprover';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="bg-brand-dark min-h-screen text-slate-200">
        <Cursor />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/ai-background-remover" element={<BackgroundRemover />} />
          <Route path="/services/palette-extractor" element={<PaletteExtractor />} />
          <Route path="/services/file-converter" element={<FileConverter />} />
          <Route path="/services/resume-improver" element={<ResumeImprover />} />
          <Route path="/project/ai-fashion" element={<AIGeneration />} />
          <Route path="/project/:id" element={<ProjectPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;