import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navigation from './Navigation';
import Hero from './Hero';
import Experience from './Experience';
import Skills from './Skills';
import Projects from './Projects';
import Contact from './Contact';


const Home: React.FC = () => {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Shilpanshu",
        "url": "https://shilpanshu.site",
        "jobTitle": "Full Stack Developer & AI Engineer",
        "sameAs": [
            "https://github.com/shilpanshu",
            "https://linkedin.com/in/shilpanshu"
        ]
    };

    return (
        <>
            <Helmet>
                <title>Shilpanshu | Full Stack Developer & AI Engineer</title>
                <meta name="description" content="Portfolio of Shilpanshu, a Full Stack Developer and AI Engineer specializing in React, Next.js, Artificial Intelligence, and Creative Coding." />
                <meta name="keywords" content="Shilpanshu, Full Stack Developer, AI Engineer, React Developer, Creative Developer, Portfolio" />
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            </Helmet>

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
