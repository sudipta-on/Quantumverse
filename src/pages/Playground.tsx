import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    ArrowUpRight,
    Activity,
    Globe,
    Sparkles,
    X
} from "lucide-react";
import QuantumCanvas from "../components/common/QuantumCanvas";

interface PlaygroundTool {
    id: string;
    title: string;
    description: string;
    category: "VISUALIZATION" | "ALGORITHM" | "SIMULATION" | "ANALYSIS";
    icon: any;
}

const toolsData: PlaygroundTool[] = [
    {
        id: "bloch-sphere",
        title: "Bloch Sphere",
        description: "Visualize single-qubit states and rotations on the Bloch sphere.",
        category: "VISUALIZATION",
        icon: Globe,
    },
    {
        id: "qft",
        title: "Quantum Fourier Transform",
        description: "Interactive visualization of the QFT circuit and state phases.",
        category: "ALGORITHM",
        icon: Activity,
    },
];

// Color mapping aligned with the home page cyan/sky accent theme
const categoryTheme: Record<
    PlaygroundTool["category"],
    { badge: string; iconBg: string; hoverBorder: string; hoverGlow: string }
> = {
    VISUALIZATION: {
        badge: "bg-sky-50 border-sky-200 text-sky-700 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/40",
        iconBg: "bg-sky-50 text-sky-600 border-sky-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30",
        hoverBorder: "hover:border-sky-600 dark:hover:border-cyan-400",
        hoverGlow: "hover:shadow-[0_0_25px_rgba(6,182,212,0.15)]",
    },
    ALGORITHM: {
        badge: "bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/40",
        iconBg: "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30",
        hoverBorder: "hover:border-purple-600 dark:hover:border-purple-400",
        hoverGlow: "hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]",
    },
    SIMULATION: {
        badge: "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/40",
        iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
        hoverBorder: "hover:border-emerald-600 dark:hover:border-emerald-400",
        hoverGlow: "hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]",
    },
    ANALYSIS: {
        badge: "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/40",
        iconBg: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
        hoverBorder: "hover:border-amber-600 dark:hover:border-amber-400",
        hoverGlow: "hover:shadow-[0_0_25px_rgba(245,158,11,0.15)]",
    },
};

export default function QuantumPlayground() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

    const categories = ["ALL", "VISUALIZATION", "ALGORITHM"];

    const filteredTools = useMemo(() => {
        const query = searchTerm.toLowerCase().trim();
        return toolsData.filter((tool) => {
            const matchesSearch =
                !query ||
                tool.title.toLowerCase().includes(query) ||
                tool.description.toLowerCase().includes(query);

            const matchesCategory =
                selectedCategory === "ALL" || tool.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, selectedCategory]);

    return (
        <div className="relative min-h-screen w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 pt-28 pb-20 transition-colors duration-300">

            {/* Background Canvas & Ambient Energy Glow (Matches Home Page) */}
            <div className="fixed inset-0 z-0 opacity-20 dark:opacity-30 pointer-events-none">
                <QuantumCanvas mode="playground" />
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-cyan-500/15 via-purple-500/10 to-transparent blur-[120px] pointer-events-none rounded-full" />

            <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-7xl">

                {/* Title Header */}
                <div className="text-center max-w-3xl mx-auto mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-md mb-4 text-xs font-mono font-semibold text-sky-700 dark:text-cyan-400">
                        <Sparkles size={14} className="text-cyan-500" />
                        <span>Interactive Sandbox</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4 pb-2 leading-tight">
                        Quantum <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 dark:from-cyan-400 dark:via-sky-200 dark:to-purple-400">Playground</span>
                    </h1>

                    <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed font-normal">
                        Experiment with quantum mechanics in real-time. Select a tool below to launch the interactive sandbox.
                    </p>
                </div>

                {/* SEARCH BAR & CATEGORY PILLS */}
                <div className="max-w-3xl mx-auto mb-12 space-y-4">

                    {/* Search Box Container */}
                    <div className="relative group">
                        <Search
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-sky-600 dark:group-focus-within:text-cyan-400 transition-colors"
                            size={20}
                        />
                        <input
                            type="text"
                            placeholder="Search tools..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 dark:focus:border-cyan-400 backdrop-blur-xl rounded-2xl py-4 pl-12 pr-10 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium text-base shadow-lg focus:shadow-cyan-500/10 focus:outline-none transition-all"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                        {categories.map((cat) => {
                            const isSelected = selectedCategory === cat;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all border shadow-sm ${isSelected
                                        ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20 scale-105"
                                        : "bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 hover:text-cyan-600 dark:hover:text-cyan-400 backdrop-blur-xl"
                                        }`}
                                >
                                    {cat}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* TOOL CARDS GRID */}
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredTools.map((tool, idx) => {
                            const IconComponent = tool.icon;
                            const theme = categoryTheme[tool.category];

                            return (
                                <motion.div
                                    layout
                                    key={tool.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.25, delay: idx * 0.04 }}
                                >
                                    <Link
                                        to={`/playground/${tool.id}`}
                                        className={`group relative flex flex-col justify-between h-full rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-lg ${theme.hoverBorder} ${theme.hoverGlow} hover:-translate-y-1.5 transition-all duration-300 focus:outline-none`}
                                    >
                                        <div>
                                            {/* Card Top Row */}
                                            <div className="flex items-center justify-between mb-5">
                                                <div className={`p-3 rounded-2xl border ${theme.iconBg}`}>
                                                    <IconComponent size={22} />
                                                </div>
                                                <span className={`px-3 py-1 rounded-full border text-[11px] font-extrabold tracking-wider ${theme.badge}`}>
                                                    {tool.category}
                                                </span>
                                            </div>

                                            {/* Card Title */}
                                            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-cyan-400 transition-colors mb-2.5 flex items-center justify-between">
                                                <span>{tool.title}</span>
                                                <ArrowUpRight
                                                    size={20}
                                                    className="text-slate-400 group-hover:text-cyan-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"
                                                />
                                            </h3>

                                            {/* Card Description */}
                                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-normal">
                                                {tool.description}
                                            </p>
                                        </div>

                                        {/* Card Footer */}
                                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                                            <span>Launch Tool</span>
                                            <span className="text-sky-600 dark:text-cyan-400 group-hover:underline">Explore Sandbox →</span>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>

                {/* Empty State */}
                {filteredTools.length === 0 && (
                    <div className="text-center py-16 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl max-w-md mx-auto shadow-lg">
                        <Search size={28} className="mx-auto text-slate-400 mb-3" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No tools found</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Try adjusting your search or category filter.</p>
                    </div>
                )}

            </div>
        </div>
    );
}