import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

export type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

interface ThemeProviderProps {
    children: ReactNode;
    storageKey?: string;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({
    children,
    storageKey = "quantumverse-theme",
}: ThemeProviderProps) {

    // Detect browser theme
    const getInitialTheme = (): Theme => {
        if (typeof window === "undefined") return "dark";

        const saved = localStorage.getItem(storageKey);

        if (saved === "light" || saved === "dark") {
            return saved;
        }

        return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    };

    const [theme, setThemeState] = useState<Theme>(getInitialTheme);

    useEffect(() => {

        const root = document.documentElement;

        root.classList.remove("light", "dark");

        root.classList.add(theme);

        root.setAttribute("data-theme", theme);

        localStorage.setItem(storageKey, theme);

    }, [theme, storageKey]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    const toggleTheme = () => {
        setThemeState(prev =>
            prev === "dark" ? "light" : "dark"
        );
    };

    const value = useMemo(
        () => ({
            theme,
            setTheme,
            toggleTheme,
        }),
        [theme]
    );

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {

    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error(
            "useTheme must be used inside ThemeProvider"
        );
    }

    return context;
}