import { useState, useMemo, memo, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, BookOpen, Clock, Star, Sparkles, X } from "lucide-react";
import QuantumCanvas from "../components/common/QuantumCanvas";
import coursesData from "../content/courses.json";

interface Course {
    id: string;
    title: string;
    description: string;
    category: "Beginner" | "Intermediate" | "Advanced" | string;
    rating: number;
    duration: string;
    tags?: string[];
}

const categoryTheme: Record<
    string,
    { badge: string; iconBg: string; hoverBorder: string; hoverGlow: string }
> = {
    Beginner: {
        badge: "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/40",
        iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
        hoverBorder: "hover:border-emerald-600 dark:hover:border-emerald-400",
        hoverGlow: "hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]",
    },
    Intermediate: {
        badge: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/40",
        iconBg: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
        hoverBorder: "hover:border-amber-600 dark:hover:border-amber-400",
        hoverGlow: "hover:shadow-[0_0_25px_rgba(245,158,11,0.15)]",
    },
    Advanced: {
        badge: "bg-sky-50 border-sky-200 text-sky-700 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/40",
        iconBg: "bg-sky-50 text-sky-600 border-sky-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30",
        hoverBorder: "hover:border-sky-600 dark:hover:border-cyan-400",
        hoverGlow: "hover:shadow-[0_0_25px_rgba(6,182,212,0.15)]",
    },
};

const CourseCard = memo(({ course, idx }: { course: Course; idx: number }) => {
    const theme = categoryTheme[course.category] || categoryTheme.Advanced;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, delay: Math.min(idx * 0.04, 0.2) }}
            className="h-full"
        >
            <Link
                to={`/courses/${course.id}`}
                className={`group relative flex flex-col justify-between h-full rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-lg ${theme.hoverBorder} ${theme.hoverGlow} hover:-translate-y-1.5 transition-all duration-300 focus:outline-none`}
            >
                <div>
                    {/* Category Badge & Rating */}
                    <div className="flex items-center justify-between mb-5">
                        <span className={`px-3 py-1 rounded-full border text-[11px] font-extrabold tracking-wider ${theme.badge}`}>
                            {course.category}
                        </span>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-bold">
                            <Star size={13} fill="currentColor" />
                            <span>{course.rating}</span>
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-cyan-400 transition-colors mb-2.5">
                        {course.title}
                    </h2>

                    {/* Description */}
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-normal line-clamp-3">
                        {course.description}
                    </p>

                    {/* Tags */}
                    {course.tags && course.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-6">
                            {course.tags.slice(0, 4).map((tag) => (
                                <span
                                    key={tag}
                                    className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-[11px] font-medium text-slate-700 dark:text-slate-300"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mt-auto">
                    <div className="flex items-center gap-1.5">
                        <Clock size={15} />
                        <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sky-600 dark:text-cyan-400 group-hover:underline">
                        <span>View Course</span>
                        <BookOpen size={14} />
                    </div>
                </div>
            </Link>
        </motion.div>
    );
});

CourseCard.displayName = "CourseCard";

export default function Courses() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const categories = ["All", "Beginner", "Intermediate", "Advanced"];

    const filteredCourses = useMemo(() => {
        const query = searchTerm.toLowerCase().trim();
        return (coursesData as Course[]).filter((course) => {
            const matchesSearch =
                !query ||
                course.title.toLowerCase().includes(query) ||
                course.description.toLowerCase().includes(query) ||
                course.tags?.some((tag) => tag.toLowerCase().includes(query));

            const matchesCategory =
                selectedCategory === "All" || course.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, selectedCategory]);

    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchTerm(e.target.value);
        },
        []
    );

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pt-28 pb-20 transition-colors duration-300">

            {/* Background Canvas & Ambient Energy Glow (Matches Home Page) */}
            <div className="fixed inset-0 z-0 opacity-20 dark:opacity-30 pointer-events-none">
                <QuantumCanvas mode="courses" />
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-cyan-500/15 via-purple-500/10 to-transparent blur-[120px] pointer-events-none rounded-full" />

            <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-7xl">

                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-md mb-4 text-xs font-mono font-semibold text-sky-700 dark:text-cyan-400">
                        <Sparkles size={14} className="text-cyan-500" />
                        <span>Interactive Learning</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4 pb-2 leading-tight">
                        Course <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 dark:from-cyan-400 dark:via-sky-200 dark:to-purple-400">Catalog</span>
                    </h1>

                    <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed font-normal">
                        Master quantum computing from the ground up with interactive modules, theoretical fundamentals, and visual demonstrations.
                    </p>
                </div>

                {/* Search & Category Filtering Controls */}
                <div className="max-w-3xl mx-auto mb-12 space-y-4">

                    {/* Search Box */}
                    <div className="relative group">
                        <Search
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-sky-600 dark:group-focus-within:text-cyan-400 transition-colors"
                            size={20}
                        />
                        <input
                            type="text"
                            placeholder="Search courses, topics, or algorithms..."
                            value={searchTerm}
                            onChange={handleSearchChange}
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
                                    className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all border flex items-center gap-1.5 shadow-sm ${isSelected
                                        ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20 scale-105"
                                        : "bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 hover:text-cyan-600 dark:hover:text-cyan-400 backdrop-blur-xl"
                                        }`}
                                >
                                    {cat === "All" && <Filter size={13} />}
                                    {cat}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Course Grid */}
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredCourses.map((course, idx) => (
                            <CourseCard key={course.id} course={course} idx={idx} />
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* Empty State */}
                {filteredCourses.length === 0 && (
                    <div className="text-center py-16 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl max-w-md mx-auto shadow-lg">
                        <Search size={28} className="mx-auto text-slate-400 mb-3" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No courses found</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Try adjusting your search or category filter.</p>
                    </div>
                )}

            </div>
        </div>
    );
}