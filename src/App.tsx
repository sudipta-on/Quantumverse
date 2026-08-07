import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Router from "./router";
import QuantumPreloader from "./components/common/QuantumPreloader";

export default function App() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulates the initial quantum state loading sequence
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <AnimatePresence>
                {isLoading && <QuantumPreloader />}
            </AnimatePresence>

            <Router />
        </>
    );
}