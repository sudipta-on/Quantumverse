import { useParams, useNavigate } from "react-router-dom";
import {
    Grid,
    Home,
    Sparkles,
    X,
    ChevronRight,
    Atom,
} from "lucide-react";
import { useEffect, Suspense, lazy, useState } from "react";
import toolsData from "../content/tools.json";

// Dynamically construct mapping of lazy-loaded tool components
const toolComponents: Record<string, React.LazyExoticComponent<any>> = {};

toolsData.forEach((tool: any) => {
    toolComponents[tool.id] = lazy(
        () => import(`../content/tools/${tool.componentFile}.tsx`)
    );
});

export default function Tool() {
    const { tool } = useParams();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        // Prevent body scrollbar overflow on tool views
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    // Find current tool configuration
    const toolConfig = toolsData.find((t: any) => t.id === tool);
    const ToolRenderer =
        tool && toolComponents[tool] ? toolComponents[tool] : null;

    // Fallback view when route or component is missing
    if (!toolConfig || !ToolRenderer) {
        return (
            <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-6 select-none">
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6 text-center">
                    <h2 className="text-xl font-bold text-red-400 mb-1">
                        Quantum Tool Not Found
                    </h2>
                    <p className="text-xs text-slate-400">
                        The requested module could not be loaded or located.
                    </p>
                </div>
                <button
                    onClick={() => navigate("/playground")}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-cyan-500/10"
                >
                    <Home size={16} /> Return Home
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col overflow-hidden font-sans select-none">

            {/* FLOATING NAVIGATION DOCK AT BOTTOM RIGHT */}
            <div className="fixed bottom-5 right-5 z-50 pointer-events-auto flex flex-col items-end">

                {/* Glassmorphic Tool Picker Dropdown */}
                {menuOpen && (
                    <div className="mb-3 w-64 rounded-2xl bg-slate-950/90 border border-cyan-500/20 shadow-2xl shadow-cyan-500/10 backdrop-blur-2xl p-2.5 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200">

                        {/* Tool Catalog Selector */}
                        <div className="pt-1">
                            <div className="px-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                                Switch Quantum Tool
                            </div>
                            <div className="max-h-52 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                {toolsData.map((t: any) => {
                                    const isActive = t.id === tool;
                                    return (
                                        <button
                                            key={t.id}
                                            onClick={() => {
                                                setMenuOpen(false);
                                                navigate(`/playground/${t.id}`);
                                            }}
                                            className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors ${isActive
                                                ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold"
                                                : "text-slate-300 hover:bg-slate-900 hover:text-slate-100"
                                                }`}
                                        >
                                            <span className="truncate">{t.name}</span>
                                            {isActive ? (
                                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                            ) : (
                                                <ChevronRight size={12} className="text-slate-600" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* ULTRA-COMPACT FLOATING ACTION PILL */}
                <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/70 border border-slate-800/90 shadow-2xl backdrop-blur-2xl hover:border-cyan-500/30 transition-all">

                    {/* 1. Home Button */}
                    <button
                        onClick={() => navigate("/")}
                        className="p-2.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-900/80 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                        title="Return Home"
                    >
                        <Home size={16} />
                    </button>

                    <div className="w-px h-4 bg-slate-800" />

                    {/* 2. Switch Tools Button */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 hover:scale-105 active:scale-95 ${menuOpen
                            ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                            : "text-slate-300 hover:text-cyan-300 hover:bg-slate-900/80"
                            }`}
                        title="Switch Quantum Tool"
                    >
                        <Grid size={15} className={menuOpen ? "text-slate-950" : "text-cyan-400"} />
                        <span>Tools</span>
                    </button>
                </div>
            </div>

            {/* RENDER DYNAMICALLY IMPORTED COMPONENT */}
            <Suspense
                fallback={
                    <div className="flex-1 w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-100 relative overflow-hidden">
                        {/* Background Ambient Glow */}
                        <div className="absolute w-[400px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none animate-pulse" />

                        {/* Futuristic Orbital Loader */}
                        <div className="relative flex items-center justify-center mb-6">
                            <div className="absolute w-24 h-24 rounded-full border border-cyan-500/20 animate-ping opacity-75" />
                            <div className="absolute w-20 h-20 rounded-full border-2 border-dashed border-cyan-400/40 animate-[spin_8s_linear_infinite]" />
                            <div className="relative w-14 h-14 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin flex items-center justify-center shadow-lg shadow-cyan-500/20">
                                <Sparkles size={18} className="text-cyan-400 animate-pulse" />
                            </div>
                        </div>

                        {/* Loading Message */}
                        <div className="text-center space-y-1.5 z-10">
                            <h3 className="text-sm font-bold tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400">
                                Initializing Quantum Simulator
                            </h3>
                            <p className="text-xs text-slate-400 font-mono animate-pulse">
                                Preparing state vectors & WebGL render context...
                            </p>
                        </div>
                    </div>
                }
            >
                <ToolRenderer />
            </Suspense>
        </div>
    );
}