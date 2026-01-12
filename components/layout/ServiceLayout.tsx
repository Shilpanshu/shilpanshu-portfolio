import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Navigation from '../Navigation';

interface FAQItem {
    question: string;
    answer: string;
}

interface ServiceLayoutProps {
    children: React.ReactNode;

    // SEO Metadata
    title: string;
    description: string;
    keywords?: string;

    // Content Sections
    heroTitle: string;
    heroDescription: string;

    howItWorks?: { step: string; description: string }[];
    useCases?: string[];
    faqs?: FAQItem[];
}

import { motion, AnimatePresence } from 'framer-motion';

const ServiceLayout: React.FC<ServiceLayoutProps> = ({
    children,
    title,
    description,
    keywords,
    heroTitle,
    heroDescription,
    howItWorks,
    useCases,
    faqs
}) => {
    const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    const faqSchema = faqs ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    } : null;

    return (
        <div className="min-h-screen bg-[#0f1115] text-white selection:bg-brand-accent/30 font-sans">
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />
                {keywords && <meta name="keywords" content={keywords} />}
                {faqSchema && (
                    <script type="application/ld+json">
                        {JSON.stringify(faqSchema)}
                    </script>
                )}
            </Helmet>

            <div className="relative min-h-[90vh] flex flex-col">
                {children}
            </div>

            {/* SEO Content Section */}
            <div className="relative border-t border-white/5 bg-gradient-to-b from-[#0a0b0d] to-[#050607]">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-accent/20 to-transparent" />

                <div className="max-w-5xl mx-auto px-6 py-32 space-y-32">

                    {/* Hero Section */}
                    <section className="text-center space-y-6 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none" />
                        <h1 className="relative text-4xl md:text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500">
                            {heroTitle}
                        </h1>
                        <p className="relative text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-light">
                            {heroDescription}
                        </p>
                    </section>

                    {/* How It Works */}
                    {howItWorks && (
                        <section>
                            <h2 className="text-3xl font-bold font-display mb-16 text-center text-white">How It Works</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {howItWorks.map((step, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="relative p-8 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden group hover:border-brand-accent/30 transition-all duration-500 hover:bg-white/[0.07]"
                                    >
                                        <div className="absolute top-0 right-0 p-6 font-display text-8xl text-white/[0.02] font-bold group-hover:text-brand-accent/[0.05] transition-colors select-none">
                                            {i + 1}
                                        </div>
                                        <div className="relative z-10">
                                            <div className="w-12 h-12 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center mb-6 text-brand-accent font-bold group-hover:scale-110 transition-transform duration-300">
                                                {i + 1}
                                            </div>
                                            <h3 className="text-xl font-bold mb-4 text-white group-hover:text-brand-accent transition-colors">{step.step}</h3>
                                            <p className="text-slate-400 leading-relaxed font-light">{step.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Use Cases */}
                    {useCases && (
                        <section>
                            <div className="bg-[#13151a] rounded-[2.5rem] p-12 md:p-16 border border-white/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

                                <h2 className="text-3xl font-bold font-display mb-10 text-center text-white relative z-10">Perfect For</h2>
                                <div className="flex flex-wrap justify-center gap-3 relative z-10 max-w-3xl mx-auto">
                                    {useCases.map((useCase, i) => (
                                        <motion.span
                                            key={i}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.05 }}
                                            className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-default backdrop-blur-sm"
                                        >
                                            {useCase}
                                        </motion.span>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* FAQ */}
                    {faqs && (
                        <section className="max-w-3xl mx-auto">
                            <h2 className="text-3xl font-bold font-display mb-12 text-center text-white">Frequently Asked Questions</h2>
                            <div className="space-y-4">
                                {faqs.map((faq, i) => {
                                    const isOpen = openFaqIndex === i;
                                    return (
                                        <motion.div
                                            key={i}
                                            initial={false}
                                            animate={{ backgroundColor: isOpen ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0)" }}
                                            className="rounded-2xl overflow-hidden transition-all duration-300 border border-transparent hover:border-white/5"
                                        >
                                            <button
                                                onClick={() => toggleFaq(i)}
                                                className="w-full flex items-center justify-between p-6 text-left group"
                                            >
                                                <span className={`font-medium text-lg transition-colors duration-300 ${isOpen ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                                    {faq.question}
                                                </span>
                                                <div className={`p-2 rounded-full transition-all duration-300 ${isOpen ? 'rotate-180 bg-brand-accent/10 text-brand-accent' : 'bg-white/5 text-slate-500 group-hover:bg-white/10 group-hover:text-slate-300'}`}>
                                                    <ChevronDown className="w-5 h-5" />
                                                </div>
                                            </button>
                                            <AnimatePresence>
                                                {isOpen && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                                                    >
                                                        <div className="px-6 pb-8 text-slate-400 leading-relaxed font-light">
                                                            {faq.answer}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServiceLayout;
