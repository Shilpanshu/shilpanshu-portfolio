import React from 'react';
import Navigation from './Navigation';
import Hero from './Hero';
import Experience from './Experience';
import Skills from './Skills';
import Projects from './Projects';
import Contact from './Contact';

const Home: React.FC = () => {
    return (
        <>
            <Navigation />
            <main>
                <Hero />
                <Experience />
                <Skills />
                <Projects />
            </main>
            <Contact />
        </>
    );
};

export default Home;
