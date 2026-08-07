import { Link } from "react-router-dom";
import { Atom } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
            <div className="text-primary mb-6 animate-pulse">
                <Atom size={64} />
            </div>
            <h1 className="text-6xl font-bold mb-4">404</h1>
            <p className="text-xl text-muted-foreground mb-8">This state collapsed into a vacuum. Page not found.</p>
            <Link to="/" className="glass px-6 py-3 rounded-full hover:bg-white/10 transition-colors">
                Return to Home
            </Link>
        </div>
    );
}
