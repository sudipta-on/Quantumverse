import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import {
    Terminal,
    AlertCircle,
    ExternalLink,
    FileCode,
    BookOpen,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Hash,
    Layers,
    Copy,
    Check,
    Wrench
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import coursesCatalog from "../content/courses.json";
// import katex from "katex";
import "katex/dist/katex.min.css";

const NAVBAR_HEIGHT = 100;
const SIDEBAR_COLLAPSED_KEY = "courseSidebarCollapsed";

// ============================================================================
// MATH DELIMITER NORMALIZATION (Robust Parser for Jupyter & HTML blocks)
// ============================================================================
function normalizeMathDelimiters(source: string): string {
    if (!source) return source;
    let out = source;

    // Fix JSON raw backslash escape discrepancies
    out = out.replace(/\\\\/g, "\\");

    // Convert display math block brackets \[ ... \] to display $$ ... $$ formatting
    out = out.replace(
        /(^|\n)[ \t]*\\\[([\s\S]*?)\\\][ \t]*(?=\n|$)/g,
        (_m, lead, expr) => `${lead}\n$$\n${expr}\n$$\n`
    );

    // Convert any remaining inline \[ ... \] into safe inline $ ... $ math
    out = out.replace(/\\\[([\s\S]*?)\\\]/g, (_m, expr) => `$${expr}$`);

    // Convert inline parenthesis \( ... \) into standard inline $ ... $ math
    out = out.replace(/\\\(([\s\S]*?)\\\)/g, (_m, expr) => `$${expr}$`);

    return out;
}

// ============================================================================
// LIGHTWEIGHT KATEX MATH RENDERER HELPER
// ============================================================================
// function InlineMathRenderer({ math, block = false }: { math: string; block?: boolean }) {
//     const containerRef = useRef<HTMLSpanElement>(null);

//     useEffect(() => {
//         if (containerRef.current) {
//             try {
//                 katex.render(math, containerRef.current, {
//                     displayMode: block,
//                     throwOnError: false,
//                 });
//             } catch (e) {
//                 containerRef.current.textContent = math;
//             }
//         }
//     }, [math, block]);

//     return <span ref={containerRef} />;
// }

// ============================================================================
// QUICK TOOLS
// ============================================================================

interface QuickToolLink {
    id: string;
    title: string;
    path: string;
}

const DEFAULT_QUICK_TOOLS: QuickToolLink[] = [
    { id: "bloch-sphere", title: "Bloch Sphere", path: "/playground/bloch-sphere" },
    { id: "qft", title: "Quantum Fourier Transform", path: "/playground/qft" },
    { id: "state-viewer", title: "Quantum State Viewer", path: "/playground/state-viewer" },
    { id: "density-matrix", title: "Density Matrix", path: "/playground/density-matrix" },
    { id: "noise-simulator", title: "Noise Simulator", path: "/playground/noise-simulator" },
    { id: "grover-search", title: "Grover Search", path: "/playground/grover-search" },
];

function resolveQuickTools(): QuickToolLink[] {
    const catalog = coursesCatalog as any;
    const raw = catalog?.tools ?? catalog?.quickTools;
    if (Array.isArray(raw) && raw.length > 0) {
        const mapped = raw
            .map((t: any) => ({
                id: t.id ?? t.slug ?? t.path ?? t.title,
                title: t.title ?? t.name ?? t.id ?? "Tool",
                path: t.path ?? t.url ?? (t.id ? `/playground/${t.id}` : ""),
            }))
            .filter((t: QuickToolLink) => !!t.path);
        if (mapped.length > 0) return mapped;
    }
    return DEFAULT_QUICK_TOOLS;
}

const QUICK_TOOLS = resolveQuickTools();

// ============================================================================
// MASTER COURSE CONTAINER LAYOUT
// ============================================================================

interface CourseLayoutProps {
    courseId: string;
    notebookPath?: string;
    children?: React.ReactNode;
}

export function CourseLayout({ courseId, notebookPath, children }: CourseLayoutProps) {
    const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
    const [activeHeadingId, setActiveHeadingId] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
        try {
            return typeof window !== "undefined" && window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
        } catch {
            return false;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, sidebarCollapsed ? "1" : "0");
        } catch {
            // ignore
        }
    }, [sidebarCollapsed]);

    const currentCourse = (coursesCatalog as any[]).find((c) => c.id === courseId) || {
        id: courseId,
        title: "Course Module",
        category: "Quantum Course",
        description: "",
        colabLink: "",
        notebookFile: ""
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!containerRef.current) return;

            const els = Array.from(containerRef.current.querySelectorAll("[data-toc-title], h1, h2 ")) as HTMLElement[];

            const collected = els.map((el, i) => {
                const customTitle = el.getAttribute("data-toc-title");
                const id = el.id || `section-${i}`;
                el.id = id;
                el.style.scrollMarginTop = `${NAVBAR_HEIGHT}px`;

                return {
                    id,
                    text: customTitle || el.textContent?.replace(/<[^>]*>/g, "").trim() || "",
                    level: parseInt(el.tagName[1] || "2", 10)
                };
            }).filter((h) => h.level >= 1 && h.text.length > 0);

            setHeadings(collected);
        }, 400);

        return () => clearTimeout(timer);
    }, [notebookPath, children]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleTocClick = useCallback((id: string) => {
        const el = document.getElementById(id);
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;
        window.scrollTo({ top, behavior: "smooth" });
        setActiveHeadingId(id);
        setDropdownOpen(false);
    }, []);

    const LeftPanelContent = () => (
        <div className="space-y-8">
            <div className="space-y-3">
                <div className="text-[11px] font-mono uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 flex items-center gap-2">
                    <BookOpen size={14} className="text-cyan-500" />
                    <span>Notebook Workspace</span>
                </div>

                <div className="flex flex-col gap-2.5">
                    {currentCourse.notebookFile && (
                        <a
                            href={`${import.meta.env.BASE_URL}${currentCourse.notebookFile.replace(/^\/+/, "")}`}
                            download
                            className="w-full px-4 py-2.5 rounded-xl bg-blue-100 dark:bg-slate-800/80 border border-blue-200 dark:border-blue-700/80 hover:border-blue-500/40 text-blue-700 dark:text-blue-200 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                        >
                            <FileCode size={15} className="text-blue-500" />
                            <span>Download .ipynb</span>
                        </a>
                    )}

                    {currentCourse.colabLink ? (
                        <a
                            href={currentCourse.colabLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-500/25"
                        >
                            <ExternalLink size={15} />
                            <span>Open in Google Colab</span>
                        </a>
                    ) : (
                        <div className="text-[11px] text-slate-400 italic text-center py-1">Colab link unavailable</div>
                    )}
                </div>
            </div>


            <div className="h-px bg-slate-200 dark:bg-slate-800/80" />

            <div>
                <div className="text-[11px] font-mono uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
                    <Hash size={14} className="text-cyan-500" />
                    <span>Table of Contents</span>
                </div>
                {headings.length > 0 ? (
                    <ul className="space-y-1.5 border-l border-slate-200 dark:border-slate-800 pl-3 text-xs max-h-[50vh] overflow-y-auto scrollbar-thin">
                        {headings.map((h) => (
                            <li key={h.id}>
                                <button
                                    onClick={() => handleTocClick(h.id)}
                                    className={`w-full text-left py-1 truncate transition-colors block ${activeHeadingId === h.id
                                        ? "text-cyan-600 dark:text-cyan-400 font-bold translate-x-1"
                                        : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
                                        }`}
                                >
                                    {h.text}
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <span className="text-xs text-slate-400 italic">Scanning sections...</span>
                )}
            </div>
            <div className="h-px bg-slate-200 dark:bg-slate-800/80" />

            <div>
                <div className="text-[11px] font-mono uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
                    <Wrench size={14} className="text-cyan-500" />
                    <span>Quick Tools</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {QUICK_TOOLS.map((tool) => (
                        <Link
                            key={tool.id}
                            to={tool.path}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-cyan-500/40 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 text-[11px] font-semibold transition-all"
                        >
                            {tool.title}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen pt-24 sm:pt-28 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans relative transition-colors">
            <div className="lg:hidden w-full px-4 sm:px-6 mb-6 relative z-35" ref={dropdownRef}>
                <div className="w-full rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-lg p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 pl-2 truncate">
                        <Layers size={15} className="text-cyan-500 shrink-0" />
                        <span className="truncate">Course Navigation & Notebooks</span>
                    </div>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="px-3.5 py-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 flex items-center gap-2 text-xs font-bold shrink-0 transition-all hover:bg-cyan-500/20"
                    >
                        <span>Menu</span>
                        <ChevronDown size={14} className={`transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`} />
                    </button>
                </div>

                <AnimatePresence>
                    {dropdownOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-4 right-4 mt-2 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 z-40 overflow-hidden max-h-[70vh] overflow-y-auto"
                        >
                            <LeftPanelContent />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="max-w-[1500px] w-full mx-auto px-4 sm:px-6 lg:px-10 flex-1 flex gap-0 pb-20">
                <aside
                    className={`hidden lg:block shrink-0 sticky top-28 h-[calc(100vh-7rem)] overflow-y-auto scrollbar-thin transition-all duration-300 ease-in-out ${sidebarCollapsed ? "w-0 opacity-0 pointer-events-none" : "w-72 opacity-100 pr-4"
                        }`}
                >
                    <LeftPanelContent />
                </aside>

                <div className="hidden lg:flex flex-col items-center shrink-0 sticky top-28 h-[calc(100vh-7rem)] px-1">
                    <button
                        onClick={() => setSidebarCollapsed((c) => !c)}
                        title={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
                        className="mt-1 p-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-400/60 shadow-sm transition-colors"
                    >
                        {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>
                </div>

                <main className={`flex-1 min-w-0 mx-auto lg:mx-0 py-2 transition-all duration-300 ${sidebarCollapsed ? "max-w-full" : "max-w-full"}`}>
                    <div className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
                        <span className="text-[11px] font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest block mb-1">
                            {currentCourse.category}
                        </span>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                            {currentCourse.title}
                        </h1>
                        {currentCourse.description && (
                            <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm">
                                {currentCourse.description}
                            </p>
                        )}
                    </div>

                    <article ref={containerRef} className="space-y-6">
                        {children}
                    </article>
                </main>
            </div>
        </div>
    );
}

// ============================================================================
// NOTEBOOK CELL RENDERER
// ============================================================================
function NotebookCellRenderer({ cell }: { cell: any; index: number }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (cell.cell_type === "markdown") {
        let sourceText = Array.isArray(cell.source) ? cell.source.join("") : cell.source;

        // Apply robust normalization to convert \[...\] and \(...\) to KaTeX format safely
        sourceText = normalizeMathDelimiters(sourceText);

        return (
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-300 my-4 overflow-x-auto">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeRaw, rehypeKatex]}
                >
                    {sourceText}
                </ReactMarkdown>
            </div>
        );
    }

    if (cell.cell_type === "code") {
        const codeText = Array.isArray(cell.source) ? cell.source.join("") : cell.source;
        const outputs = cell.outputs || [];

        return (
            <div className="my-6 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-800 bg-slate-900 shadow-xl max-w-full">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800 text-slate-400 text-xs font-mono select-none">
                    <span className="flex items-center gap-2">
                        <Terminal size={14} className="text-cyan-400" />
                        <span className="text-slate-300 font-semibold">In [ ]</span>
                    </span>
                    <button
                        onClick={() => handleCopy(codeText)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all text-[11px] font-mono border border-slate-700/50"
                    >
                        {copied ? (
                            <>
                                <Check size={12} className="text-emerald-400" />
                                <span className="text-emerald-400 font-bold">Copied</span>
                            </>
                        ) : (
                            <>
                                <Copy size={12} />
                                <span>Copy</span>
                            </>
                        )}
                    </button>
                </div>
                <div className="p-4 overflow-x-auto text-sm font-mono leading-relaxed text-slate-100">
                    <pre className="whitespace-pre-wrap break-words"><code>{codeText}</code></pre>
                </div>

                {outputs.length > 0 && (
                    <div className="border-t border-slate-800 bg-slate-950/70 p-4 font-mono text-xs text-slate-300 overflow-x-auto">
                        <div className="text-[10px] uppercase font-bold text-slate-500 mb-2 tracking-wider">Output:</div>
                        {outputs.map((out: any, oIdx: number) => {
                            const outText = out.text
                                ? (Array.isArray(out.text) ? out.text.join("") : out.text)
                                : out.data?.["text/plain"]
                                    ? (Array.isArray(out.data["text/plain"]) ? out.data["text/plain"].join("") : out.data["text/plain"])
                                    : null;

                            return (
                                <div key={oIdx} className="whitespace-pre-wrap">
                                    {outText}
                                    {out.data?.["image/png"] && (
                                        <img
                                            src={`data:image/png;base64,${out.data["image/png"]}`}
                                            alt="Notebook Output Plot"
                                            className="mt-2 rounded-lg max-w-full h-auto"
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    return null;
}

// ============================================================================
// DYNAMIC NOTEBOOK PAGE ROUTER
// ============================================================================

export default function CoursePage() {
    const { slug } = useParams<{ slug: string }>();
    const [notebookData, setNotebookData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const currentSlug = slug || "intro-to-quantum";

    useEffect(() => {
        setLoading(true);
        setError(null);
        setNotebookData(null);

        const catalogEntry = (coursesCatalog as any[]).find((c) => c.id === currentSlug);
        const file = catalogEntry?.notebookFile;
        const notebookPath = file ? `${import.meta.env.BASE_URL}${file.replace(/^\/+/, "")}` : `${import.meta.env.BASE_URL}notebooks/${currentSlug}.ipynb`;

        fetch(notebookPath)
            .then((res) => {
                if (!res.ok) throw new Error(`Could not locate notebook file at ${notebookPath}`);
                return res.json();
            })
            .then((data) => {
                setNotebookData(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [currentSlug]);

    if (loading) {
        return (
            <div className="min-h-screen pt-40 flex flex-col items-center justify-center text-cyan-500 font-mono text-xs gap-3">
                <Terminal size={24} className="animate-spin" />
                <span>Loading Quantum Notebook Workspace...</span>
            </div>
        );
    }

    if (error || !notebookData) {
        return (
            <CourseLayout courseId={currentSlug}>
                <div className="my-10 p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 flex items-center gap-3 text-sm">
                    <AlertCircle size={20} className="shrink-0" />
                    <div>
                        <h4 className="font-bold">Notebook Preview Unavailable</h4>
                        <p className="text-xs mt-1 opacity-90">{error || "Please verify your .ipynb file path in courses.json."}</p>
                    </div>
                </div>
            </CourseLayout>
        );
    }

    const cells = notebookData.cells || [];

    return (
        <CourseLayout courseId={currentSlug}>
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
                {cells.map((cell: any, idx: number) => (
                    <NotebookCellRenderer key={idx} cell={cell} index={idx + 1} />
                ))}
            </div>
        </CourseLayout>
    );
}