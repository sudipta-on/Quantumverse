import { motion } from "framer-motion";
import { Atom, BookOpen, Cpu, Sparkles, GraduationCap, Award } from "lucide-react";

export default function About() {
    return (
        <div className="relative w-full overflow-hidden min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950 pt-24 sm:pt-32 pb-20 px-4 sm:px-6 lg:px-8">

            {/* Ambient Glow */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-cyan-500/15 via-purple-500/10 to-transparent blur-[120px] pointer-events-none rounded-full" />

            <div className="max-w-4xl mx-auto w-full space-y-16 relative z-10">

                {/* PART 1: ABOUT THE PLATFORM */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-6 text-center sm:text-left"
                >
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-mono font-semibold">
                        <Sparkles size={14} />
                        <span>PLATFORM OVERVIEW</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                        About <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-cyan-400 dark:to-purple-400">QuantumVerse</span>
                    </h1>

                    <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                        QuantumVerse is built to bridge the gap between abstract quantum mechanics and hands-on intuition. Traditional textbooks often leave learners struggling with complex math vectors without visual validation. Our platform combines live WebGL-accelerated state vector simulations, interactive notebooks, and accessible circuit design directly inside your modern browser—requiring zero installation setup.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                        <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2">
                            <Atom className="text-cyan-500 h-6 w-6" />
                            <h3 className="font-bold text-sm">Interactive Visuals</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Real-time Bloch sphere projections mapping state superposition.</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2">
                            <BookOpen className="text-indigo-500 h-6 w-6" />
                            <h3 className="font-bold text-sm">In-Browser Notebooks</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Execute quantum algorithms line-by-line seamlessly.</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2">
                            <Cpu className="text-purple-500 h-6 w-6" />
                            <h3 className="font-bold text-sm">Local QPU Simulation</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Hardware-accelerated rendering rates running up to 60 FPS.</p>
                        </div>
                    </div>
                </motion.div>

                <div className="h-px w-full bg-slate-200 dark:bg-slate-800" />

                {/* PART 2: ABOUT ME (CREATOR / RESEARCHER) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex flex-col md:flex-row gap-8 items-center bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 rounded-3xl backdrop-blur-xl shadow-lg"
                >
                    {/* Optional Avatar / Emblem Placeholder */}
                    <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-inner">
                        <GraduationCap className="w-14 h-14 text-cyan-600 dark:text-cyan-400" />
                    </div>

                    <div className="space-y-4 text-center md:text-left flex-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-semibold">
                            <Award size={14} />
                            <span>CREATOR PROFILE</span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                            Sudipta Majumder
                        </h2>

                        <p className="text-xs sm:text-sm font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
                            CSIR Fellow &amp; Research Scholar · Department of Physics, IIT Kharagpur
                        </p>

                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                            My academic and research focus spans quantum computing, quantum information theory, graph neural networks, and quantum machine learning. QuantumVerse was built out of a passion to make complex quantum mechanics interactive, transparent, and approachable for students and researchers globally.
                        </p>

                        <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start">
                            <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                Quantum Algorithms
                            </span>
                            <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                Qiskit &amp; Cirq
                            </span>
                            <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                Quantum Machine Learning
                            </span>
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}