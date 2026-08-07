import { motion } from "framer-motion";
import { Atom } from "lucide-react";

export default function QuantumPreloader() {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white select-none"
        >
            {/* Background Ambient Glow */}
            <div className="absolute w-72 h-72 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute w-72 h-72 bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative flex flex-col items-center">
                {/* Quantum Atom Animation */}
                <div className="relative flex items-center justify-center w-20 h-20 mb-6">
                    {/* Outer Orbit 1 */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                        className="absolute inset-0 rounded-full border border-cyan-400/30"
                    >
                        <div className="absolute -top-1 left-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee]" />
                    </motion.div>

                    {/* Outer Orbit 2 */}
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                        className="absolute inset-[-6px] rounded-full border border-violet-500/25"
                    >
                        <div className="absolute bottom-0 right-1/4 w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_12px_#a855f7]" />
                    </motion.div>

                    {/* Central Core Icon */}
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-white/20 backdrop-blur-xl shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                    >
                        <Atom size={22} className="text-cyan-300" />
                    </motion.div>
                </div>

                {/* Brand Text & Loading Indicator */}
                <h2 className="text-lg font-black tracking-wider bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent mb-2">
                    QuantumVerse
                </h2>
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    <p className="text-xs font-mono tracking-widest uppercase text-slate-400">
                        Initializing Quantum State...
                    </p>
                </div>
            </div>
        </motion.div>
    );
}