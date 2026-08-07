import { motion } from "framer-motion";
import { Atom } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="relative w-full overflow-hidden border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-[#050816] z-20">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-sky-500 to-transparent" />

            {/* Background Glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-500/5 blur-[140px]" />
                <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-violet-500/5 blur-[140px]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
                <div className="flex flex-col items-center justify-between gap-6 md:gap-8 text-center md:text-left md:flex-row">

                    {/* Brand */}
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <motion.div
                            whileHover={{
                                rotate: 360,
                                scale: 1.12,
                            }}
                            transition={{
                                rotate: {
                                    duration: 0.8,
                                    ease: "easeInOut",
                                },
                                scale: {
                                    duration: 0.25,
                                },
                            }}
                            className="flex h-12 w-12 items-center justify-center rounded-xl border border-sky-200 dark:border-sky-900 bg-white dark:bg-slate-900 shadow-sm cursor-pointer shrink-0">
                            <Atom size={22} className="text-sky-500" />
                        </motion.div>

                        <div>
                            <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                                QuantumVerse
                            </h3>
                            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                Interactive Quantum Computing Learning Platform
                            </p>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="text-center">
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                            © {new Date().getFullYear()} QuantumVerse
                        </p>
                        <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                            Designed & Developed by
                            <span className="ml-1 font-semibold text-sky-500 dark:text-cyan-400">
                                Sudipta Majumder
                            </span>
                        </p>
                    </div>

                    {/* Social Links */}
                    <div className="flex items-center gap-3">
                        <motion.a
                            whileHover={{ y: -3, scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href="https://github.com/sudipta-on"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all hover:border-sky-500 hover:text-sky-500">
                            <FaGithub />
                            GitHub
                        </motion.a>
                        <motion.a
                            whileHover={{ y: -3, scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href="https://linkedin.com/in/sudipta-majumder"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all hover:border-blue-500 hover:text-blue-500">
                            <FaLinkedin />
                            LinkedIn
                        </motion.a>
                    </div>

                </div>
            </div>
        </footer>
    );
}