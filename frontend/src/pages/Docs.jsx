import React, { useState, useEffect } from 'react'
import { Book, Zap, FileText, BarChart2, Sparkles, CheckCircle2, ArrowRight, Home } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Navbar from '../components/landing/Navbar'

const sections = [
    {
        id: 'getting-started',
        title: 'Getting Started',
        icon: <Home size={20} />,
        content: (
            <div className="space-y-6">
                <p className="text-gray-400 text-lg leading-relaxed">
                    Welcome to the Generative Engine Optimizer (GEO). This tool is designed to help your content get noticed, cited, and recommended by AI engines like ChatGPT, Gemini, and Perplexity.
                </p>
                
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
                    <h4 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
                        <Zap size={18} /> Pro Tip
                    </h4>
                    <p className="text-sm text-blue-100/80">
                        For the best results, always use the "Deep Optimization" mode when working on educational or pillar blog content. This enables the Jina Search grounding for maximum factual density.
                    </p>
                </div>

                <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-white">The Workflow</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { step: '1', title: 'Research', desc: 'Identify semantic gaps in your niche.' },
                            { step: '2', title: 'Optimize', desc: 'Rewrite content with Jina-powered grounding.' },
                            { step: '3', title: 'Verify', desc: 'Test perception using the AI Simulator.' },
                            { step: '4', title: 'Publish', desc: 'Watch your AI citations grow.' }
                        ].map((s) => (
                            <div key={s.step} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                <div className="text-blue-500 font-black text-xl mb-1">{s.step}</div>
                                <div className="text-white font-bold mb-1">{s.title}</div>
                                <div className="text-gray-400 text-sm">{s.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'optimization',
        title: 'Content Optimization',
        icon: <FileText size={20} />,
        content: (
            <div className="space-y-8">
                <div>
                    <h3 className="text-2xl font-bold text-white mb-4">Rewriting for AI-First Search</h3>
                    <p className="text-gray-400 mb-6">
                        Our optimization engine doesn't just "fix" grammar. It injects **Semantic Bridges** and **Grounded Facts** that AI scrapers look for when building their knowledge base.
                    </p>
                    
                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/20 mb-6">
                        <img 
                            src="/docs/rewrite content paste.png" 
                            alt="Rewriting Content" 
                            className="w-full h-auto"
                        />
                        <div className="p-4 text-center text-sm text-gray-500 bg-white/5 italic">
                            Paste your existing content or a target URL to begin the audit.
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-xl font-bold text-white">How it Works:</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="text-blue-500 mt-1 shrink-0" size={18} />
                                <span className="text-gray-300">**Jina Search Grounding:** The tool searches the web for real-world stats to back your claims.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="text-blue-500 mt-1 shrink-0" size={18} />
                                <span className="text-gray-300">**Entity Enrichment:** We inject high-authority entities that link your content to the broader knowledge graph.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="text-blue-500 mt-1 shrink-0" size={18} />
                                <span className="text-gray-300">**FAQ Injection:** Every rewrite includes a schema-ready FAQ section to capture "Answer Boxes."</span>
                            </li>
                        </ul>
                    </div>

                    <div className="mt-8 rounded-2xl overflow-hidden border border-white/10 bg-black/20">
                        <img 
                            src="/docs/Rewrite content  result.png" 
                            alt="Optimization Result" 
                            className="w-full h-auto"
                        />
                        <div className="p-4 text-center text-sm text-gray-500 bg-white/5 italic">
                            The final result features a punchy H1, high fact density, and structured citations.
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'ai-simulator',
        title: 'AI Simulator',
        icon: <Zap size={20} />,
        content: (
            <div className="space-y-8">
                <div>
                    <h3 className="text-2xl font-bold text-white mb-4">See Your Content Through AI Eyes</h3>
                    <p className="text-gray-400 mb-6">
                        Before you publish, use the AI Simulator to see if an LLM (like GPT-4) would actually cite your content for a specific query.
                    </p>
                    
                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/20 mb-6">
                        <img 
                            src="/docs/ai simulartor input.png" 
                            alt="AI Simulator Input" 
                            className="w-full h-auto"
                        />
                    </div>

                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6 mb-8">
                        <p className="text-sm text-purple-100/80">
                            The simulator analyzes "Citation Probability." If your content is too vague or lacks unique data, the AI is less likely to use it as a source.
                        </p>
                    </div>

                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/20">
                        <img 
                            src="/docs/ai simulator result.png" 
                            alt="AI Simulator Result" 
                            className="w-full h-auto"
                        />
                        <div className="p-4 text-center text-sm text-gray-500 bg-white/5 italic">
                            A high probability score means your content is "Cite-Ready."
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'visibility',
        title: 'Visibility Analysis',
        icon: <BarChart2 size={20} />,
        content: (
            <div className="space-y-8">
                <div>
                    <h3 className="text-2xl font-bold text-white mb-4">Track Your Citations</h3>
                    <p className="text-gray-400 mb-6">
                        Paste a URL to see how many AI engines are currently referencing your brand or content.
                    </p>
                    
                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/20 mb-6">
                        <img 
                            src="/docs/vsibilty analysis url input.png" 
                            alt="Visibility Input" 
                            className="w-full h-auto"
                        />
                    </div>

                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/20">
                        <img 
                            src="/docs/visibility analysis results.png" 
                            alt="Visibility Results" 
                            className="w-full h-auto"
                        />
                        <div className="p-4 text-center text-sm text-gray-500 bg-white/5 italic">
                            Understand where you stand in the Generative Search ecosystem.
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'strategy',
        title: 'Content Strategy',
        icon: <Sparkles size={20} />,
        content: (
            <div className="space-y-8">
                <div>
                    <h3 className="text-2xl font-bold text-white mb-4">Build Topical Authority</h3>
                    <p className="text-gray-400 mb-6">
                        Enter a keyword, and we'll map out a cluster of 10-15 related articles you need to write to own that niche.
                    </p>
                    
                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/20">
                        <img 
                            src="/docs/content startegy input with result.png" 
                            alt="Content Strategy" 
                            className="w-full h-auto"
                        />
                        <div className="p-4 text-center text-sm text-gray-500 bg-white/5 italic">
                            Complete topical maps to dominate AI engine responses.
                        </div>
                    </div>
                </div>
            </div>
        )
    }
]

function Docs() {
    const [activeSection, setActiveSection] = useState('getting-started')

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [activeSection])

    return (
        <div className="min-h-screen bg-[#020617] text-white font-['Plus_Jakarta_Sans',sans-serif]">
            <Navbar />
            
            <div className="max-w-[1400px] mx-auto px-6 py-12 flex flex-col md:flex-row gap-12 pt-32">
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-72 shrink-0">
                    <div className="sticky top-32 space-y-2">
                        <div className="px-4 mb-6">
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Documentation</h2>
                        </div>
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                                    activeSection === section.id 
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                {section.icon}
                                <span className="font-semibold text-sm">{section.title}</span>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 max-w-4xl">
                    <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 md:p-12 backdrop-blur-3xl shadow-2xl"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                                {sections.find(s => s.id === activeSection)?.icon}
                            </div>
                            <h1 className="text-4xl font-black text-white tracking-tight">
                                {sections.find(s => s.id === activeSection)?.title}
                            </h1>
                        </div>

                        <div className="prose prose-invert max-w-none">
                            {sections.find(s => s.id === activeSection)?.content}
                        </div>

                        {/* Navigation Footer */}
                        <div className="mt-16 pt-12 border-t border-white/5 flex justify-between items-center">
                            <Link to="/app" className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors">
                                Back to App <ArrowRight size={14} />
                            </Link>
                        </div>
                    </motion.div>
                </main>
            </div>

            {/* Premium Background Effects */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>
        </div>
    )
}

export default Docs
