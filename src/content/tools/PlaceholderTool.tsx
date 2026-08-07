import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Terminal, Sparkles, CheckCircle } from "lucide-react";

// Easy to read status messages
const STATUS_STEPS = [
    "Connecting to Quantum Computer...",
    "Setting up Quantum Qubits...",
    "Stabilizing Superposition States...",
    "Loading Simulation Engine...",
    "Compiling Quantum Circuits...",
];

export default function PlaceholderTool() {
    const [stepIndex, setStepIndex] = useState(0);

    // Cycle through messages every 2.5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setStepIndex((prev) => (prev + 1) % STATUS_STEPS.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative flex-1 w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-6 overflow-hidden font-sans select-none transition-colors duration-300">

            {/* 1. Background Soft Glow */}
            <div className="absolute w-72 h-72 bg-cyan-500/10 dark:bg-cyan-500/15 blur-[100px] rounded-full pointer-events-none animate-pulse" />

            {/* 2. Simple QPU Chip Graphic */}
            <div className="relative mb-8 flex items-center justify-center">
                {/* Outer Orbit Ring 1 */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                    className="absolute w-48 h-48 sm:w-56 sm:h-56 rounded-full border border-dashed border-cyan-500/30 dark:border-cyan-400/30"
                >
                    <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
                </motion.div>

                {/* Outer Orbit Ring 2 */}
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border border-dashed border-purple-500/30 dark:border-purple-400/30"
                >
                    <span className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
                </motion.div>

                {/* Center QPU Processor Box */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/80 dark:bg-slate-900/90 border border-slate-200 dark:border-cyan-500/30 backdrop-blur-xl flex flex-col items-center justify-center shadow-xl shadow-cyan-500/10 dark:shadow-cyan-500/20"
                >
                    {/* Hardware Stage Bars */}
                    <div className="w-12 h-1 bg-amber-400 dark:bg-amber-300 rounded-full mb-1" />
                    <div className="w-8 h-1 bg-amber-400 dark:bg-amber-300 rounded-full mb-2" />

                    {/* QPU Chip Node */}
                    <div className="relative w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-950 border border-cyan-400/50 flex items-center justify-center">
                        <Cpu className="w-5 h-5 text-cyan-600 dark:text-cyan-400 animate-pulse" />
                        <span className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                        <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-purple-400" />
                    </div>
                </motion.div>

                <Sparkles className="absolute -top-2 -right-2 w-4 h-4 text-purple-400 animate-bounce" />
            </div>

            {/* 3. Simple Text */}
            <div className="relative z-10 max-w-sm text-center space-y-2">
                <h1 className="text-2xl font-bold">Coming Soon</h1>
                <p className="text-sm text-slate-500">
                    This tool is currently under construction.
                </p>
            </div>

            {/* 4. Compact Status Panel */}
            <div className="relative z-10 w-full max-w-xs mt-6 bg-white/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-md space-y-3">
                {/* Animated Message Text */}
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 min-h-[20px]">
                    <CheckCircle className="w-4 h-4 text-cyan-500 dark:text-cyan-400 shrink-0" />
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={STATUS_STEPS[stepIndex]}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.2 }}
                            className="truncate"
                        >
                            {STATUS_STEPS[stepIndex]}
                        </motion.span>
                    </AnimatePresence>
                </div>

                {/* Shimmer Loading Bar */}
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                    <motion.div
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                        className="w-1/2 h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                    />
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1">
                        <Terminal className="w-3 h-3 text-cyan-400" /> SYSTEM_STATUS
                    </span>
                    <span className="animate-pulse text-cyan-500 dark:text-cyan-400">READY</span>
                </div>
            </div>

            {/* 5. Minimal Footer */}
            <footer className="relative z-10 mt-12 text-[11px] font-mono text-slate-400 dark:text-slate-500">
                QuantumVerse Engine v1.0
            </footer>
        </div>
    );
}