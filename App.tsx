import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import ProjectPage from './components/ProjectPage';
import AIGeneration from './components/AIGeneration';
import Cursor from './components/Cursor';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="bg-brand-dark min-h-screen text-slate-200">
        <Cursor />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/project/ai-fashion" element={<AIGeneration />} />
          <Route path="/project/:id" element={<ProjectPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;