import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, } from "framer-motion";
import { Menu, X, Atom, Sun, Moon } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import { FaGithub } from "react-icons/fa";

export default function Navbar() {
    const rotateX = useMotionValue(0);
    const rotateY = useMotionValue(0);
    const smoothX = useSpring(rotateX, { stiffness: 180, damping: 18, });
    const smoothY = useSpring(rotateY, { stiffness: 180, damping: 18, });
    const glow = useTransform(smoothY, [-12, 12], [0.6, 1]);
    const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left; const y = e.clientY - rect.top;
        rotateY.set((x / rect.width - 0.5) * 18); rotateX.set(-(y / rect.height - 0.5) * 18);
    };
    const handleLeave = () => { rotateX.set(0); rotateY.set(0); };
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => { setIsMobileMenuOpen(false); }, [location]);
    const isActive = (path: string) => location.pathname === path;
    const [hovered, setHovered] = useState<string | null>(null);

    const navLinks = [
        { name: "Home", path: "/" },
        { name: "Courses", path: "/courses" },
        { name: "Playground", path: "/playground" },
        { name: "Composer", path: "/composer" },
        { name: "About", path: "/about" },
    ];

    return (
        <motion.header initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, type: "spring", stiffness: 120, }} className="fixed top-3 sm:top-5 left-0 right-0 z-50 flex justify-center px-4 sm:px-6">
            <div className={`relative mx-auto w-full max-w-[1450px] rounded-[22px] sm:rounded-[28px] transition-all duration-500 overflow-hidden ${isScrolled ? `bg-white/[0.08] dark:bg-[#081120]/65 backdrop-blur-3xl backdrop-saturate-[180%] border border-cyan-400/10 shadow-[0_8px_40px_rgba(3,8,20,.35), 0_0_40px_rgba(34,211,238,.05)]` : `bg-white/[0.02] backdrop-blur-xl border border-white/5`}`}>
                <div className="pointer-events-none absolute inset-0 rounded-[32px] bg-gradient-to-b from-white/10 via-white/[0.03] to-transparent" />
                <div className="absolute -inset-[2px] rounded-[30px] bg-gradient-to-r from-cyan-500/10 via-transparent to-violet-500/10 blur-2xl -z-10" />

                {/* Scaled height across viewports: h-16 on mobile, h-20 on tablets, h-[84px] on desktop */}
                <div className="flex h-16 sm:h-20 lg:h-[84px] items-center justify-between px-4 sm:px-6 lg:px-8">

                    {/* Logo Section */}
                    <Link to="/" onMouseMove={handleMouseMove} onMouseLeave={handleLeave} className="group flex items-center gap-3 sm:gap-4 lg:gap-5">
                        <motion.div style={{ rotateX: smoothX, rotateY: smoothY, }} whileHover={{ scale: 1.08, }} className="relative">
                            {/* Glow */}
                            <motion.div style={{ opacity: glow, }} animate={{ scale: [1, 1.25, 1], }} transition={{ repeat: Infinity, duration: 3, }} className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-violet-500/20 blur-xl" />
                            {/* Orbit */}
                            <motion.div animate={{ rotate: 360, }} transition={{ repeat: Infinity, duration: 14, ease: "linear", }} className="absolute inset-[-4px] sm:inset-[-5px] rounded-full border border-cyan-400/25" />
                            <motion.div animate={{ rotate: -360, }} transition={{ repeat: Infinity, duration: 9, ease: "linear", }} className="absolute inset-[-8px] sm:inset-[-10px] rounded-full border border-violet-500/15" />
                            {/* Electron */}
                            <motion.div animate={{ rotate: 360, }} transition={{ repeat: Infinity, duration: 3, ease: "linear", }} className="absolute inset-[-4px] sm:inset-[-5px]">
                                <div className="absolute -top-1 left-1/2 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee]" />
                            </motion.div>
                            <motion.div animate={{ rotate: [0, 360], }} transition={{ repeat: Infinity, duration: 15, ease: "linear" }} whileHover={{ scale: 1.08, rotate: 540 }} className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl sm:rounded-2xl border border-white/15 bg-white/5 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,.18)] group-hover:border-cyan-400/40 transition-all duration-500">
                                <Atom size={18} strokeWidth={2.2} className="text-cyan-300 sm:w-5 sm:h-5" />
                            </motion.div>
                        </motion.div>
                        <div>
                            {/* Responsive Brand Title: text-lg on mobile, text-xl on tablet, text-2xl on desktop */}
                            <motion.h1 whileHover={{ letterSpacing: "0.06em", }} className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500 bg-clip-text text-lg sm:text-xl lg:text-2xl font-black tracking-tight text-transparent">
                                QuantumVerse
                            </motion.h1>
                            {/* Responsive Subtitle: hidden on very small screens, scales up smoothly */}
                            <motion.p initial={{ opacity: .8, }} whileHover={{ opacity: 1, x: 3, }} className="text-[10px] sm:text-xs lg:text-sm font-semibold tracking-widest uppercase text-slate-400">
                                Interactive Quantum Learning
                            </motion.p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-2 xl:gap-3">
                        {navLinks.map((link) => {
                            const active = isActive(link.path);
                            const hovering = hovered === link.path;
                            return (
                                <Link key={link.path} to={link.path} onMouseEnter={() => setHovered(link.path)}
                                    onMouseLeave={() => setHovered(null)} className="relative px-2 py-3 text-sm xl:text-md font-medium transition-colors duration-300">
                                    {active && (<motion.div layoutId="active-nav" transition={{ type: "spring", stiffness: 350, damping: 30, }} />)}
                                    <span className={`relative transition-all duration-300 font-bold ${active ? "dark:text-white text-blue-900" : hovering
                                        ? "dark:text-cyan-300 text-blue-900" : "text-slate-400 dark:hover:text-white hover:text-slate-600"}`}>
                                        {link.name}
                                    </span>
                                    {(active || hovering) && (
                                        <motion.div layoutId="navbar-underline" transition={{ type: "spring", stiffness: 380, damping: 28, }} className="absolute bottom-0 left-0 right-0 mx-auto h-[3px] w-[75%] rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 shadow-[0_0_12px_rgba(34,211,238,.6)]" />)}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Actions */}
                    <div className="hidden md:flex items-center gap-3 lg:gap-4">
                        <motion.button animate={{ rotate: theme === "dark" ? 180 : 0, }} whileHover={{ scale: 1.12, rotate: 180, }} whileTap={{ scale: 0.9, }} onClick={toggleTheme}
                            className="p-2 rounded-full text-muted-foreground hover:text-amber-400 hover:bg-white/10 transition-all">
                            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                        </motion.button>
                        <motion.a whileHover={{ y: -2, scale: 1.15, }} whileTap={{ scale: .92 }}
                            href="https://github.com/sudipta-on/Quantumverse/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300"
                        >
                            <FaGithub className="text-xl" />
                        </motion.a>
                        <motion.div whileHover={{ scale: 1.04, y: -2, }} whileTap={{ scale: .96 }}>
                            <Link to="/courses" className="group relative inline-flex items-center overflow-hidden rounded-full px-5 lg:px-6 py-2.5 lg:py-3 text-xs lg:text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-600 shadow-[0_0_25px_rgba(34,211,238,.25)]">
                                <span className="relative z-20">
                                    Get Started
                                </span>
                                <motion.div initial={{ x: "-100%" }} whileHover={{ x: "100%" }} transition={{ duration: .8 }} className="absolute inset-0" style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent)" }} />
                            </Link>
                        </motion.div>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <motion.button animate={{ rotate: theme === "dark" ? 180 : 0 }} whileHover={{ scale: 1.15 }}
                        className="md:hidden p-2 text-foreground"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                    </motion.button>
                </div>
            </div>

            {/* ================= MOBILE DRAWER ================= */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Overlay */}
                        <motion.div initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-md"
                        />

                        {/* Drawer */}
                        <motion.aside
                            initial={{ x: "110%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "110%" }}
                            transition={{
                                type: "spring",
                                stiffness: 220,
                                damping: 26,
                            }}
                            className="fixed top-0 right-0 z-50 h-screen w-[88%] max-w-[380px] overflow-hidden border-l border-white/10 bg-slate-950/70 backdrop-blur-[30px] backdrop-saturate-150 shadow-[0_0_80px_rgba(0,0,0,.45)]">
                            {/* Aurora */}
                            <div className="absolute -top-28 -right-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-[120px]" />
                            <div className="absolute bottom-[-120px] left-[-80px] h-72 w-72 rounded-full bg-violet-500/20 blur-[120px]" />
                            {/* Glass Reflection */}
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-white/[0.03] to-transparent" />
                            {/* Header */}
                            <div className="relative flex items-center justify-between border-b border-white/10 px-5 sm:px-6 py-5 sm:py-6">
                                <div>
                                    <motion.h2 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-sm sm:text-md font-black text-transparent">
                                        QuantumVerse
                                    </motion.h2>
                                    <p className="mt-1 text-[10px] sm:text-xs uppercase tracking-[0.25em] text-slate-400">
                                        Interactive Quantum Learning
                                    </p>
                                </div>
                                <motion.button whileHover={{ rotate: 90, scale: 1.08, }} whileTap={{ scale: 0.92, }}
                                    onClick={() => setIsMobileMenuOpen(false)} className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all hover:border-cyan-400/20">
                                    <X size={18} />
                                </motion.button>
                            </div>
                            {/* Divider */}
                            <div className="mx-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                            {/* Scroll Area */}
                            <div className="relative flex h-[calc(100vh-100px)] flex-col overflow-y-auto px-4 sm:px-5 py-5 sm:py-6">
                                {/* Navigation */}
                                <div className="space-y-2.5 sm:space-y-3">
                                    {[
                                        {
                                            icon: "📚",
                                            title: "Courses",
                                            desc: "Learn Quantum Computing",
                                            path: "/courses",
                                        },
                                        {
                                            icon: "⚛",
                                            title: "Playground",
                                            desc: "Interactive Simulators",
                                            path: "/playground",
                                        },
                                        {
                                            icon: "🧩",
                                            title: "Composer",
                                            desc: "Drag & Drop Circuits",
                                            path: "/composer",
                                        },
                                        {
                                            icon: "ℹ",
                                            title: "About",
                                            desc: "Know QuantumVerse",
                                            path: "/about",
                                        },
                                    ].map((item, index) => {
                                        const active = location.pathname === item.path;
                                        return (
                                            <motion.div
                                                key={item.path}
                                                initial={{ opacity: 0, x: 40, }}
                                                animate={{ opacity: 1, x: 0, }}
                                                transition={{ delay: 0.1 + index * 0.08, duration: .45, }}>
                                                <Link to={item.path}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className={`relative group flex items-center justify-between overflow-hidden rounded-2xl sm:rounded-3xl border p-4 sm:p-5 transition-all duration-300 ${active ? "border-cyan-400/20 bg-cyan-500/10" : "border-white/10 bg-white/5 hover:border-cyan-400/20 hover:bg-white/10"}`}>
                                                    <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-cyan-400/10 blur-3xl" />
                                                    <div className="flex items-center gap-3.5 sm:gap-4">
                                                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 text-xl sm:text-2xl">
                                                            {item.icon}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-white text-sm sm:text-base">
                                                                {item.title}
                                                            </h3>
                                                            <p className="text-xs sm:text-sm text-slate-400">
                                                                {item.desc}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* Divider */}
                                <div className="my-6 sm:my-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                                {/* Quick Actions */}
                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                    <motion.button whileHover={{ scale: 1.03, y: -2, }} whileTap={{ scale: .96, }} onClick={toggleTheme}
                                        className="flex items-center justify-center gap-2 sm:gap-3 rounded-2xl sm:rounded-3xl border border-white/10 bg-white/10 py-3.5 sm:py-4 backdrop-blur-xl transition-all hover:border-cyan-400/20 text-white text-xs sm:text-sm font-medium">
                                        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                                        <span>Theme</span>
                                    </motion.button>
                                    <motion.a
                                        whileHover={{ scale: 1.03, y: -2, }}
                                        whileTap={{ scale: .96, }}
                                        href="https://github.com/sudipta-on"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 sm:gap-3 rounded-2xl sm:rounded-3xl border border-white/10 bg-white/10 py-3.5 sm:py-4 backdrop-blur-xl transition-all hover:border-cyan-400/20 text-white text-xs sm:text-sm font-medium">
                                        <FaGithub />
                                        GitHub
                                    </motion.a>
                                </div>

                                {/* Spacer */}
                                <div className="flex-1" />

                                {/* CTA */}
                                <motion.button whileHover={{ scale: 1.02, y: -2, }} whileTap={{ scale: .97, }}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="group relative mt-6 sm:mt-8 overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-sky-400 via-indigo-500 to-violet-500 py-4 sm:py-5 font-semibold text-white text-sm sm:text-base shadow-[0_0_35px_rgba(59,130,246,.25)]">
                                    <span className="relative z-20 flex items-center justify-center">
                                        Start Learning
                                    </span>
                                    <motion.div initial={{ x: "-100%", }} whileHover={{ x: "100%", }} transition={{ duration: .8, }} className="absolute inset-0" style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent)", }} />
                                </motion.button>

                                {/* Footer */}
                                <div className="mt-6 sm:mt-8 border-t border-white/10 pt-5 text-center">
                                    <p className="text-xs sm:text-sm font-semibold text-slate-300">
                                        QuantumVerse
                                    </p>
                                    <p className="mt-1 text-[11px] text-slate-500">
                                        Interactive Quantum Learning Platform
                                    </p>
                                    <p className="mt-2 text-[10px] text-slate-600">
                                        Version 1.0 • © 2026
                                    </p>
                                </div>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </motion.header >
    );
}