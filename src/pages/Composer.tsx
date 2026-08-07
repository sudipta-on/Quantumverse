import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Wrench, ArrowRight, Code2, Sparkles, Cpu } from "lucide-react";
import QuantumCanvas from "../components/common/QuantumCanvas";

export default function Composer() {
    return (
        <div className="relative w-full min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden font-sans select-none transition-colors duration-300">
            {/* Ambient Energy Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-cyan-500/15 via-purple-500/10 to-transparent blur-[120px] pointer-events-none rounded-full" />

            {/* MAIN CONTENT WRAPPER */}
            <div className="flex-1 w-full flex flex-col">
                {/* HERO / UNDER CONSTRUCTION SECTION */}
                <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center pt-28 sm:pt-36 pb-16 px-4 overflow-hidden">
                    <div className="absolute inset-0 z-0 opacity-40">
                        <QuantumCanvas mode="hero" />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center"
                    >
                        {/* Status Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-md mb-6 text-xs font-mono font-semibold text-sky-700 dark:text-cyan-400"
                        >
                            <Wrench className="w-4 h-4 text-cyan-500 animate-spin" />
                            <span>BUILDING IN PROGRESS</span>
                        </motion.div>

                        {/* Main Title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] mb-6"
                        >
                            Quantum Composer <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 dark:from-cyan-400 dark:via-sky-200 dark:to-purple-400">
                                Coming Soon.
                            </span>
                        </motion.h1>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl font-normal leading-relaxed"
                        >
                            We are crafting an easy, drag-and-drop workspace where you can build quantum circuits visually, test gates instantly, and export clean Qiskit code.
                        </motion.p>

                        {/* Feature Preview Grid */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mb-10 text-left"
                        >
                            <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-blue-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-lg">
                                <div className="h-10 w-10 rounded-2xl bg-blue-500/10 dark:bg-cyan-400/10 border border-slate-500/20 text-blue-600 dark:text-cyan-400 flex items-center justify-center mb-3">
                                    <Sparkles size={18} />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 text-sm">Visual Drag & Drop</h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400">Place Hadamard, CNOT, and Pauli gates onto quantum wires seamlessly.</p>
                            </div>

                            <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-blue-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-lg">
                                <div className="h-10 w-10 rounded-2xl bg-blue-500/10 dark:bg-cyan-400/10 border border-slate-500/20 text-blue-600 dark:text-cyan-400 flex items-center justify-center mb-3">
                                    <Cpu size={18} />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 text-sm">Live State Simulating</h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400">Watch state probabilities update instantly right inside your browser window.</p>
                            </div>

                            <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-blue-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-lg">
                                <div className="h-10 w-10 rounded-2xl bg-blue-500/10 dark:bg-cyan-400/10 border border-slate-500/20 text-blue-600 dark:text-cyan-400 flex items-center justify-center mb-3">
                                    <Code2 size={18} />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 text-sm">Instant Code Export</h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400">Convert your visual circuits straight into ready-to-use Python Qiskit code.</p>
                            </div>
                        </motion.div>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
                        >
                            <Link
                                to="/playground"
                                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all duration-200 shadow-xl shadow-cyan-500/20 hover:scale-105 active:scale-95 text-center text-sm tracking-wide"
                            >
                                Try the Playground
                            </Link>
                            <Link
                                to="/courses"
                                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 text-slate-800 dark:text-slate-200 font-semibold backdrop-blur-xl transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 text-sm"
                            >
                                Explore Courses <ArrowRight size={16} className="text-cyan-500" />
                            </Link>
                        </motion.div>
                    </motion.div>
                </section>
            </div>
        </div>
    );
}