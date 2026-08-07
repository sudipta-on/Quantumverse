import { useState, useEffect } from "react";
import { IpynbRenderer } from "react-ipynb-renderer";
import "react-ipynb-renderer/dist/styles/monokai.css"; // Optional Jupyter theme stylesheet
import { Terminal, AlertCircle } from "lucide-react";

interface NotebookPreviewProps {
    notebookPath: string; // e.g. "/notebooks/intro_to_quantum.ipynb"
}

export default function NotebookPreview({ notebookPath }: NotebookPreviewProps) {
    const [notebookData, setNotebookData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        fetch(notebookPath)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load notebook file.");
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
    }, [notebookPath]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-cyan-500 font-mono text-xs gap-2">
                <Terminal size={16} className="animate-spin" />
                <span>Rendering Jupyter Notebook...</span>
            </div>
        );
    }

    if (error || !notebookData) {
        return (
            <div className="my-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 flex items-center gap-3 text-sm">
                <AlertCircle size={18} />
                <span>Could not preview notebook: {error || "Invalid notebook data."}</span>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-xl overflow-hidden">
            <IpynbRenderer
                ipynb={notebookData}
                syntaxTheme="dark"
                bgTransparent={true}
                language="python"
            />
        </div>
    );
}