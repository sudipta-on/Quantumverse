import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
    ArrowRight,
    BookOpen,
    // Cpu,
    Sparkles,
    // Terminal,
    // Zap,
    Atom,
    ChevronDown,
    Layers,
} from "lucide-react";
import QuantumCanvas from "../components/common/QuantumCanvas";

gsap.registerPlugin(ScrollTrigger);

// ============================================================================
// DATA CONFIGURATION
// ============================================================================

const FEATURES = [
    {
        icon: Sparkles,
        title: "Interactive Visualizers",
        description: "Grasp quantum state superposition through real-time 3D Bloch sphere projections.",
        tag: "Visuals",
    },
    {
        icon: BookOpen,
        title: "Interactive Notebooks",
        description: "Execute quantum algorithms line-by-line directly in your browser with zero setup.",
        tag: "Notebooks",
    },
    // {
    //     icon: Zap,
    //     title: "Algorithmic Sandbox",
    //     description: "Experiment with Grover Search, Quantum Teleportation, and Shor's algorithm.",
    //     tag: "Playground",
    // },
    // {
    //     icon: Terminal,
    //     title: "Drag & Drop Composer",
    //     description: "Construct circuits visually using standard gate matrices like Hadamard and CNOT.",
    //     tag: "Composer",
    // },
    // {
    //     icon: Cpu,
    //     title: "Browser QPU Simulator",
    //     description: "Simulate up to 5 state-vector qubits at 60 FPS entirely on your local WebGL context.",
    //     tag: "Local QPU",
    // },
    {
        icon: Layers,
        title: "Open Source Platform",
        description: "Contribute to quantum education resources and integrate custom gate definitions.",
        tag: "Community",
    },
];

const METRICS = [
    { value: "100%", label: "In-Browser Execution", detail: "Zero Cloud Latency" },
    { value: "5 Qubits", label: "State Vector Engine", detail: "32-Complex State Dimensions" },
    { value: "60 FPS", label: "WebGL Render Rate", detail: "Hardware Accelerated" },
    { value: "10+", label: "Interactive Modules", detail: "Theory to Implementation" },
];

const TESTIMONIALS = [
    {
        quote: "The most intuitive platform for visualizing quantum state superposition.",
        author: "Quantum Research Scholar",
        role: "Physics Department",
    },
    {
        quote: "The drag-and-drop circuit composer made teaching quantum gates effortless.",
        author: "Physics Department Lead",
        role: "SM Lab",
    },
    {
        quote: "Beautiful UI design paired with crisp math visualizations. Game-changing.",
        author: "CS Research Fellow",
        role: "Q Pi",
    },
];

// ============================================================================
// FEATURE CARD COMPONENT
// ============================================================================

const FeatureCard = ({ icon: Icon, title, description, tag, index }: any) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="feature-card-wrapper group relative p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-blue-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-lg hover:shadow-blue-500/10 hover:border-blue-500/40 transition-all duration-300"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 dark:bg-cyan-400/10 border border-slate-500/20 text-blue-600 dark:text-cyan-400 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-slate-950 transition-colors duration-300">
                    <Icon size={22} />
                </div>
                <span className="text-[11px] font-mono font-semibold px-3 py-1 rounded-full bg-blue-100 dark:bg-slate-800 text-blue-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {tag}
                </span>
            </div>

            <h3 className="text-xl font-bold mb-2.5 text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                {description}
            </p>

            <div className="absolute bottom-0 left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/0 to-transparent group-hover:via-cyan-500/50 transition-all duration-500" />
        </motion.div>
    );
};

// ============================================================================
// MAIN HOME COMPONENT
// ============================================================================

export default function Home() {
    const containerRef = useRef<HTMLDivElement>(null);
    const featuresRef = useRef<HTMLDivElement>(null);
    const statsRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll();
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 20 });

    const heroY = useTransform(smoothProgress, [0, 0.3], ["0%", "18%"]);
    const heroOpacity = useTransform(smoothProgress, [0, 0.25], [1, 0]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (featuresRef.current) {
                const cards = featuresRef.current.querySelectorAll(".feature-card-wrapper");
                gsap.fromTo(
                    cards,
                    { y: 50, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        stagger: 0.1,
                        duration: 0.8,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: featuresRef.current,
                            start: "top 80%",
                        },
                    }
                );
            }

            if (statsRef.current) {
                const statItems = statsRef.current.querySelectorAll(".metric-item");
                gsap.fromTo(
                    statItems,
                    { scale: 0.9, opacity: 0 },
                    {
                        scale: 1,
                        opacity: 1,
                        stagger: 0.1,
                        duration: 0.7,
                        ease: "back.out(1.5)",
                        scrollTrigger: {
                            trigger: statsRef.current,
                            start: "top 85%",
                        },
                    }
                );
            }
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative w-full min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden font-sans select-none transition-colors duration-300"
        >
            {/* Ambient Energy Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-cyan-500/15 via-purple-500/10 to-transparent blur-[120px] pointer-events-none rounded-full" />

            {/* MAIN CONTENT WRAPPER */}
            <div className="flex-1 w-full flex flex-col">
                {/* 1. HERO SECTION */}
                <section className="relative h-screen min-h-[680px] flex items-center justify-center pt-16 overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <QuantumCanvas mode="hero" />
                    </div>

                    <motion.div
                        style={{ y: heroY, opacity: heroOpacity }}
                        className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-md mb-6 text-xs font-mono font-semibold text-sky-700 dark:text-cyan-400"
                        >
                            <Atom className="w-4 h-4 text-cyan-500 animate-spin" />
                            <span>QUANTUMVERSE OS // ONLINE</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.15 }}
                            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.08] mb-6"
                        >
                            Learn Quantum <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 dark:from-cyan-400 dark:via-sky-200 dark:to-purple-400">
                                Computing Beautifully.
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl font-normal leading-relaxed"
                        >
                            An interactive learning platform blending theory with powerful in-browser quantum state vector simulation.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.45 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
                        >
                            <Link
                                to="/courses"
                                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all duration-200 shadow-xl shadow-cyan-500/20 hover:scale-105 active:scale-95 text-center text-sm tracking-wide"
                            >
                                Start Learning
                            </Link>
                            <Link
                                to="/playground"
                                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 text-slate-800 dark:text-slate-200 font-semibold backdrop-blur-xl transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 text-sm"
                            >
                                Open Playground <ArrowRight size={16} className="text-cyan-500" />
                            </Link>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-400 flex flex-col items-center gap-1.5 opacity-60 pointer-events-none"
                    >
                        <span className="text-[10px] font-mono uppercase tracking-widest">Scroll</span>
                        <ChevronDown size={16} className="text-cyan-400" />
                    </motion.div>
                </section>

                {/* 2. METRICS DISPLAY */}
                <section className="py-12 border-y border-slate-200/80 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
                    <div className="container mx-auto px-4 md:px-6" ref={statsRef}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                            {METRICS.map((item, idx) => (
                                <div key={idx} className="metric-item space-y-1 p-3 rounded-2xl">
                                    <div className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-purple-600 dark:from-cyan-400 dark:to-purple-400 font-mono">
                                        {item.value}
                                    </div>
                                    <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                                        {item.label}
                                    </div>
                                    <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                                        {item.detail}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 3. FEATURES SECTION */}
                <section className="py-24 relative z-10" ref={featuresRef}>
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="text-center mb-16 space-y-3">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-blue-700 dark:text-amber-400 text-xs font-mono font-semibold">
                                <Sparkles size={14} />
                                <span>DESIGNED FOR CLARITY</span>
                            </div>
                            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                                Reimagining Quantum Education
                            </h2>
                            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                                Skip static equations. Learn through interactive visualizers, live Bloch spheres, and drag-and-drop circuit composers.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {FEATURES.map((feature, idx) => (
                                <FeatureCard key={idx} {...feature} index={idx} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* 4. TESTIMONIALS MARQUEE (NO BOTTOM GAP) */}
                <section className="py-16 bg-slate-100/70 dark:bg-slate-900/60 border-t border-slate-200/80 dark:border-slate-800/80 overflow-hidden mb-0">
                    <div className="container mx-auto px-4 md:px-6 mb-8 text-center">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            Loved by Students & Researchers
                        </h2>
                    </div>

                    <div className="relative flex overflow-hidden">
                        <motion.div
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                            className="flex gap-6 whitespace-nowrap"
                        >
                            {[...TESTIMONIALS, ...TESTIMONIALS].map((item, i) => (
                                <div
                                    key={i}
                                    className="w-[300px] sm:w-[360px] p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-xl shrink-0 space-y-4"
                                >
                                    <p className="text-sm italic text-slate-700 dark:text-slate-300 whitespace-normal leading-relaxed">
                                        "{item.quote}"
                                    </p>
                                    <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                            {item.author}
                                        </span>
                                        <span className="text-[11px] font-mono text-indigo-600 dark:text-cyan-400 font-semibold">
                                            {item.role}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </section>
            </div>
        </div>
    );
}