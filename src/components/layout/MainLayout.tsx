import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { ThemeProvider } from "../common/ThemeProvider";

export default function MainLayout() {
    return (
        <ThemeProvider storageKey="quantumverse-theme">
            <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
                <Navbar />
                <main className="flex-1">
                    <Outlet />
                </main>
                <Footer />
            </div>
        </ThemeProvider>
    );
}