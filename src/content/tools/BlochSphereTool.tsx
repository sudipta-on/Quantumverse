import { useNavigate } from "react-router-dom";
import React, { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { Line, Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
    LuRotateCcw, LuUndo2, LuDownload, LuSun, LuMoon, LuEye, LuX, LuChevronDown, LuAtom, LuPin, LuPinOff, LuMinus, LuMaximize2, LuFocus, LuSlidersHorizontal, LuWaves, LuMove,
} from "react-icons/lu";

/* ============================================================================
 * COMPLEX ALGEBRA & CANONICAL QUANTUM STATE ENGINE
 * ==========================================================================*/

interface C {
    re: number;
    im: number;
}
const c = (re: number, im = 0): C => ({ re, im });
const cAdd = (a: C, b: C): C => ({ re: a.re + b.re, im: a.im + b.im });
const cSub = (a: C, b: C): C => ({ re: a.re - b.re, im: a.im - b.im });
const cMul = (a: C, b: C): C => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re });
const cScale = (a: C, s: number): C => ({ re: a.re * s, im: a.im * s });
const cExpI = (t: number): C => ({ re: Math.cos(t), im: Math.sin(t) });
const cAbs = (a: C) => Math.hypot(a.re, a.im);
const cAbs2 = (a: C) => a.re * a.re + a.im * a.im;

type Mat2 = [[C, C], [C, C]];

export interface QuantumState {
    alpha: C; // |0⟩ amplitude
    beta: C;  // |1⟩ amplitude
}

/** 2x2 Matrix-Vector Multiplication directly in Hilbert space */
const matVecState = (M: Mat2, state: QuantumState): QuantumState => ({
    alpha: cAdd(cMul(M[0][0], state.alpha), cMul(M[0][1], state.beta)),
    beta: cAdd(cMul(M[1][0], state.alpha), cMul(M[1][1], state.beta)),
});

/** Enforces strict ‖ψ‖ = 1 to prevent floating-point norm drift */
const normalizeState = (state: QuantumState): QuantumState => {
    const norm = Math.hypot(cAbs(state.alpha), cAbs(state.beta));
    if (norm < 1e-12) return { alpha: c(1, 0), beta: c(0, 0) };
    const invNorm = 1 / norm;
    return {
        alpha: cScale(state.alpha, invNorm),
        beta: cScale(state.beta, invNorm),
    };
};

/** Derives theta and phi for 3D Bloch sphere rendering without discarding global phase */
const stateToBloch = (state: QuantumState): { theta: number; phi: number } => {
    const r0 = cAbs(state.alpha);
    const r1 = cAbs(state.beta);
    const theta = 2 * Math.atan2(r1, r0);

    // Singularity protection at poles
    if (r1 < 1e-10) return { theta: 0, phi: 0 };
    if (r0 < 1e-10) {
        const phi = Math.atan2(state.beta.im, state.beta.re) - Math.atan2(state.alpha.im, state.alpha.re);
        return { theta: Math.PI, phi: ((phi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) };
    }

    const phase0 = Math.atan2(state.alpha.im, state.alpha.re);
    const phase1 = Math.atan2(state.beta.im, state.beta.re);
    let phi = phase1 - phase0;
    phi = ((phi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    return { theta, phi };
};

/** Calculates Pauli Expectation Values <X>, <Y>, <Z> directly from state amplitudes */
const getExpectationValues = (state: QuantumState) => {
    const { alpha: a, beta: b } = state;
    // <X> = 2 * Re(a* * b)
    const ex = 2 * (a.re * b.re + a.im * b.im);
    // <Y> = 2 * Im(a* * b)
    const ey = 2 * (a.re * b.im - a.im * b.re);
    // <Z> = |a|² - |b|²
    const ez = cAbs2(a) - cAbs2(b);
    return { ex, ey, ez };
};

// --- Single-qubit Unitary Gates ----------------------------------------------
const SQRT1_2 = 1 / Math.sqrt(2);
const GATE: Record<string, Mat2> = {
    I: [[c(1), c(0)], [c(0), c(1)]],
    X: [[c(0), c(1)], [c(1), c(0)]],
    Y: [[c(0), c(0, -1)], [c(0, 1), c(0)]],
    Z: [[c(1), c(0)], [c(0), c(-1)]],
    H: [[c(SQRT1_2), c(SQRT1_2)], [c(SQRT1_2), c(-SQRT1_2)]],
    S: [[c(1), c(0)], [c(0), c(0, 1)]],
    Sdag: [[c(1), c(0)], [c(0), c(0, -1)]],
    T: [[c(1), c(0)], [c(0), cExpI(Math.PI / 4)]],
    Tdag: [[c(1), c(0)], [c(0), cExpI(-Math.PI / 4)]],
    SX: [[c(0.5, 0.5), c(0.5, -0.5)], [c(0.5, -0.5), c(0.5, 0.5)]],
};

const Rx = (theta: number): Mat2 => {
    const cc = Math.cos(theta / 2), s = Math.sin(theta / 2);
    return [[c(cc), c(0, -s)], [c(0, -s), c(cc)]];
};
const Ry = (theta: number): Mat2 => {
    const cc = Math.cos(theta / 2), s = Math.sin(theta / 2);
    return [[c(cc), c(-s)], [c(s), c(cc)]];
};
const Rz = (theta: number): Mat2 => {
    const half = theta / 2;
    return [[cExpI(-half), c(0)], [c(0), cExpI(half)]];
};
const Rn = (nx: number, ny: number, nz: number, theta: number): Mat2 => {
    const norm = Math.hypot(nx, ny, nz) || 1;
    nx /= norm; ny /= norm; nz /= norm;
    const cc = Math.cos(theta / 2), s = Math.sin(theta / 2);
    return [
        [c(cc, -s * nz), c(-s * ny, -s * nx)],
        [c(s * ny, -s * nx), c(cc, s * nz)],
    ];
};
const U3 = (theta: number, phi: number, lambda: number): Mat2 => {
    const cc = Math.cos(theta / 2), s = Math.sin(theta / 2);
    return [
        [c(cc), cScale(cExpI(lambda), -s)],
        [cScale(cExpI(phi), s), cScale(cExpI(phi + lambda), cc)],
    ];
};

const basisAnalysis = (state: QuantumState) => {
    const { alpha: a0, beta: a1 } = state;
    const iA1 = cMul(c(0, 1), a1);
    const xPlus = cScale(cAdd(a0, a1), SQRT1_2);
    const xMinus = cScale(cSub(a0, a1), SQRT1_2);
    const yPlus = cScale(cSub(a0, iA1), SQRT1_2);
    const yMinus = cScale(cAdd(a0, iA1), SQRT1_2);
    return {
        z0: { amp: a0, p: cAbs2(a0) },
        z1: { amp: a1, p: cAbs2(a1) },
        xPlus: { amp: xPlus, p: cAbs2(xPlus) },
        xMinus: { amp: xMinus, p: cAbs2(xMinus) },
        yPlus: { amp: yPlus, p: cAbs2(yPlus) },
        yMinus: { amp: yMinus, p: cAbs2(yMinus) },
    };
};

/* ============================================================================
 * GEOMETRY & FORMATTING HELPERS
 * ==========================================================================*/

const sphericalToCartesian = (theta: number, phi: number): THREE.Vector3 =>
    new THREE.Vector3(Math.sin(theta) * Math.cos(phi), Math.cos(theta), Math.sin(theta) * Math.sin(phi));

const generateArcPoints = (start: THREE.Vector3, end: THREE.Vector3, steps = 24): THREE.Vector3[] => {
    const s = start.clone().normalize();
    const e = end.clone().normalize();
    if (s.distanceTo(e) < 1e-4) return [s];
    const q = new THREE.Quaternion().setFromUnitVectors(s, e);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= steps; i++) {
        const step = new THREE.Quaternion().slerp(q, i / steps);
        pts.push(s.clone().applyQuaternion(step));
    }
    return pts;
};

const fmtComplexLatex = (z: C, digits = 3) => {
    if (Math.abs(z.im) < 1e-4) return z.re.toFixed(digits);
    if (Math.abs(z.re) < 1e-4) return `${z.im >= 0 ? "" : "-"}${Math.abs(z.im).toFixed(digits)}i`;
    const sign = z.im >= 0 ? "+" : "-";
    return `${z.re.toFixed(digits)} ${sign} ${Math.abs(z.im).toFixed(digits)}i`;
};

const rad2deg = (r: number) => (r * 180) / Math.PI;
const deg2rad = (d: number) => (d * Math.PI) / 180;

type InitialStateKey = "0" | "plus" | "i";
const INITIAL_STATE_MAP: Record<InitialStateKey, { state: QuantumState; label: string }> = {
    "0": { state: { alpha: c(1, 0), beta: c(0, 0) }, label: "|0⟩" },
    plus: { state: { alpha: c(SQRT1_2, 0), beta: c(SQRT1_2, 0) }, label: "|+⟩" },
    i: { state: { alpha: c(SQRT1_2, 0), beta: c(0, SQRT1_2) }, label: "|+i⟩" },
};

/* ============================================================================
 * RESEARCH-GRADE VISUAL THEMES
 * ==========================================================================*/

export type ThemeMode = "ibm" | "light" | "cyberpunk";
export interface ThemePalette {
    bg: string; headerBg: string; panelBg: string; borderColor: string;
    textColor: string; accentColor: string; subtextColor: string; canvasBg: string;
    vectorDefault: string; trailDefault: string; poleAxisColor: string;
}
export const THEMES: Record<ThemeMode, ThemePalette> = {
    ibm: {
        bg: "#0B0F19", headerBg: "rgba(15, 23, 42, 0.92)", panelBg: "rgba(15, 23, 42, 0.88)",
        borderColor: "rgba(99, 102, 241, 0.28)", textColor: "#F8FAFC", accentColor: "#818CF8",
        subtextColor: "#94A3B8", canvasBg: "radial-gradient(ellipse at center, #1E1B4B 0%, #0B0F19 100%)",
        vectorDefault: "#6366F1", trailDefault: "#10B981", poleAxisColor: "#F59E0B",
    },
    light: {
        bg: "#F8FAFC", headerBg: "rgba(255, 255, 255, 0.94)", panelBg: "rgba(255, 255, 255, 0.9)",
        borderColor: "rgba(203, 213, 225, 0.8)", textColor: "#0F172A", accentColor: "#2563EB",
        subtextColor: "#64748B", canvasBg: "radial-gradient(ellipse at center, #FFFFFF 0%, #F1F5F9 100%)",
        vectorDefault: "#2563EB", trailDefault: "#059669", poleAxisColor: "#D97706",
    },
    cyberpunk: {
        bg: "#0F172A", headerBg: "rgba(30, 41, 59, 0.94)", panelBg: "rgba(30, 41, 59, 0.9)",
        borderColor: "rgba(148, 163, 184, 0.25)", textColor: "#F1F5F9", accentColor: "#38BDF8",
        subtextColor: "#94A3B8", canvasBg: "radial-gradient(ellipse at center, #1E293B 0%, #0F172A 100%)",
        vectorDefault: "#38BDF8", trailDefault: "#F43F5E", poleAxisColor: "#FACC15",
    },
};

/* ============================================================================
 * WIDGET SYSTEM
 * ==========================================================================*/

export interface WidgetState {
    id: string; title: string; x: number; y: number; zIndex: number;
    open: boolean; pinned: boolean; minimized: boolean;
    width?: number; height?: number; resizable?: boolean;
}

interface DraggableWidgetProps {
    widget: WidgetState; theme: ThemePalette; fontScale: number;
    onBringToFront: (id: string) => void;
    onClose: (id: string) => void;
    onTogglePin: (id: string) => void;
    onToggleMinimize: (id: string) => void;
    onMove: (id: string, x: number, y: number) => void;
    onResize?: (id: string, width: number, height: number) => void;
    children: React.ReactNode;
}

const clampToViewport = (x: number, y: number) => {
    const maxX = Math.max(8, (typeof window !== "undefined" ? window.innerWidth : 1200) - 120);
    const maxY = Math.max(8, (typeof window !== "undefined" ? window.innerHeight : 800) - 60);
    return { x: Math.min(Math.max(x, 4), maxX), y: Math.min(Math.max(y, 64), maxY) };
};

const DraggableWidget: React.FC<DraggableWidgetProps> = ({
    widget, theme, fontScale, onBringToFront, onClose, onTogglePin, onToggleMinimize, onMove, onResize, children,
}) => {
    const dragState = useRef<{ startX: number; startY: number; wx: number; wy: number } | null>(null);
    const resizeState = useRef<{ startX: number; startY: number; w: number; h: number } | null>(null);
    const fz = (n: number) => ({ fontSize: `${(n * fontScale).toFixed(2)}px` });

    const handlePointerDown = (e: React.PointerEvent) => {
        onBringToFront(widget.id);
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        dragState.current = { startX: e.clientX, startY: e.clientY, wx: widget.x, wy: widget.y };
    };
    const handlePointerMove = (e: React.PointerEvent) => {
        if (!dragState.current) return;
        const dx = e.clientX - dragState.current.startX;
        const dy = e.clientY - dragState.current.startY;
        const { x, y } = clampToViewport(dragState.current.wx + dx, dragState.current.wy + dy);
        onMove(widget.id, x, y);
    };
    const handlePointerUp = (e: React.PointerEvent) => {
        dragState.current = null;
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    };

    const handleResizeDown = (e: React.PointerEvent) => {
        e.stopPropagation();
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        resizeState.current = { startX: e.clientX, startY: e.clientY, w: widget.width ?? 360, h: widget.height ?? 260 };
    };
    const handleResizeMove = (e: React.PointerEvent) => {
        if (!resizeState.current || !onResize) return;
        const dw = e.clientX - resizeState.current.startX;
        const dh = e.clientY - resizeState.current.startY;
        onResize(widget.id, Math.max(280, resizeState.current.w + dw), Math.max(170, resizeState.current.h + dh));
    };
    const handleResizeUp = (e: React.PointerEvent) => {
        resizeState.current = null;
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    };

    if (!widget.open) return null;

    return (
        <div
            style={{
                left: widget.x, top: widget.y, zIndex: widget.zIndex,
                backgroundColor: theme.panelBg, borderColor: theme.borderColor, color: theme.textColor,
                width: widget.width ? widget.width : undefined,
            }}
            className={`absolute ${!widget.width ? "w-[88vw] max-w-[22rem]" : ""} backdrop-blur-xl border rounded-2xl shadow-2xl overflow-hidden transition-[width,height] duration-150`}
            onPointerDown={() => onBringToFront(widget.id)}
        >
            <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                style={{ borderColor: theme.borderColor, touchAction: "none" }}
                className="px-3.5 py-2.5 border-b flex items-center justify-between cursor-grab active:cursor-grabbing select-none gap-2"
            >
                <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full animate-pulse shrink-0" style={{ backgroundColor: theme.accentColor }} />
                    <h3 style={{ ...fz(12), letterSpacing: "0.06em" }} className="font-bold uppercase truncate">{widget.title}</h3>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={(e) => { e.stopPropagation(); onTogglePin(widget.id); }}
                        title={widget.pinned ? "Unpin" : "Pin"}
                        style={{ color: widget.pinned ? theme.accentColor : theme.subtextColor }}
                        className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                    >
                        {widget.pinned ? <LuPin className="w-3.5 h-3.5" /> : <LuPinOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleMinimize(widget.id); }}
                        title={widget.minimized ? "Expand" : "Minimize"}
                        style={{ color: theme.subtextColor }}
                        className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                    >
                        {widget.minimized ? <LuMaximize2 className="w-3.5 h-3.5" /> : <LuMinus className="w-3.5 h-3.5" />}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onClose(widget.id); }}
                        style={{ color: theme.subtextColor }}
                        className="p-1 rounded hover:bg-red-500/20 hover:text-red-400"
                    >
                        <LuX className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
            {!widget.minimized && (
                <div
                    className="p-3.5 overflow-y-auto relative"
                    style={{ ...fz(12.5), maxHeight: widget.height ? widget.height - 46 : undefined, height: widget.height ? widget.height - 46 : undefined }}
                >
                    {children}
                    {widget.resizable && onResize && (
                        <div
                            onPointerDown={handleResizeDown}
                            onPointerMove={handleResizeMove}
                            onPointerUp={handleResizeUp}
                            title="Drag to resize"
                            style={{ touchAction: "none", color: theme.subtextColor }}
                            className="absolute bottom-1 right-1 w-5 h-5 flex items-end justify-end cursor-nwse-resize opacity-60 hover:opacity-100"
                        >
                            <LuMove className="w-3.5 h-3.5 rotate-45" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

/* ============================================================================
 * SMALL UI COMPONENTS
 * ==========================================================================*/

const GateButton: React.FC<{ label: React.ReactNode; sub?: string; onClick: () => void; theme: ThemePalette; wide?: boolean; fontScale?: number }> = ({ label, sub, onClick, theme, wide, fontScale = 1 }) => (
    <button
        onClick={onClick}
        style={{ borderColor: theme.borderColor, color: theme.accentColor }}
        className={`${wide ? "col-span-full" : ""} py-2 font-mono font-bold border rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex flex-col items-center leading-tight`}
    >
        <span style={{ fontSize: `${14 * fontScale}px` }}>{label}</span>
        {sub && <span style={{ fontSize: `${9 * fontScale}px` }} className="font-normal opacity-70">{sub}</span>}
    </button>
);

const SliderRow: React.FC<{ label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (v: number) => void; theme: ThemePalette; fontScale?: number }> = ({ label, value, min, max, step = 1, unit = "", onChange, theme, fontScale = 1 }) => {
    const decimals = step < 1 ? 2 : 0;
    return (
        <div>
            <div className="flex justify-between items-center mb-1 gap-2" style={{ fontSize: `${11 * fontScale}px` }}>
                <span style={{ color: theme.subtextColor }}>{label}</span>
                <span className="flex items-center gap-1">
                    <input
                        type="number" min={min} max={max} step={step} value={Number(value.toFixed(decimals))}
                        onChange={(e) => {
                            const v = parseFloat(e.target.value);
                            if (!Number.isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
                        }}
                        className="w-16 px-1.5 py-0.5 bg-transparent border rounded text-right font-mono"
                        style={{ borderColor: theme.borderColor, fontSize: `${12 * fontScale}px` }}
                    />
                    <span className="font-mono" style={{ color: theme.subtextColor }}>{unit}</span>
                </span>
            </div>
            <input
                type="range" min={min} max={max} step={step} value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-1.5 rounded cursor-pointer"
                style={{ accentColor: theme.accentColor }}
            />
        </div>
    );
};

const Switch: React.FC<{ checked: boolean; onChange: (v: boolean) => void; theme: ThemePalette }> = ({ checked, onChange, theme }) => (
    <button
        onClick={() => onChange(!checked)}
        style={{ backgroundColor: checked ? theme.accentColor : theme.borderColor }}
        className="w-9 h-5 rounded-full relative transition-colors shrink-0"
    >
        <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform" style={{ transform: checked ? "translateX(16px)" : "translateX(0)" }} />
    </button>
);

const NumberField: React.FC<{ label: string; value: number; onChange: (v: number) => void; theme: ThemePalette; step?: number; fontScale?: number }> = ({ label, value, onChange, theme, step = 0.1, fontScale = 1 }) => (
    <div>
        <label className="block mb-1" style={{ color: theme.subtextColor, fontSize: `${11 * fontScale}px` }}>{label}</label>
        <input
            type="number" step={step} value={value}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className="w-full px-2 py-1 bg-transparent border rounded"
            style={{ borderColor: theme.borderColor, fontSize: `${13 * fontScale}px` }}
        />
    </div>
);

const SAMPLES = 96;
interface WaveMember { label: string; color: string; reValues: number[]; imValues: number[]; reCur: number; imCur: number; }
const AmplitudeWaveChart: React.FC<{
    title: string; members: WaveMember[]; mode: "both" | "re" | "im"; currentPhi: number; theme: ThemePalette; showAxisValues: boolean; fontScale: number;
}> = ({ title, members, mode, currentPhi, theme, showAxisValues, fontScale }) => {
    const W = 300, H = 120, PAD = 6;
    const valueToY = (v: number) => PAD + ((1 - v) / 2) * (H - 2 * PAD);
    const idxToX = (i: number) => (i / (SAMPLES - 1)) * W;
    const gridLevels = [1, SQRT1_2, 0, -SQRT1_2, -1];
    const currentIdx = Math.round((((currentPhi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI) * (SAMPLES - 1));

    return (
        <div>
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1.5">
                <span style={{ color: theme.subtextColor, fontSize: `${11 * fontScale}px` }} className="font-bold">{title}</span>
                <div className="flex items-center gap-3">
                    {members.map((m) => (
                        <span key={m.label} className="flex items-center gap-1 font-mono" style={{ color: theme.textColor, fontSize: `${10 * fontScale}px` }}>
                            <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: m.color }} />{m.label}
                        </span>
                    ))}
                </div>
            </div>
            <div className="relative rounded-lg overflow-hidden border" style={{ borderColor: theme.borderColor, backgroundColor: theme.bg }}>
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-28 block">
                    {gridLevels.map((lv) => (
                        <line key={lv} x1={0} x2={W} y1={valueToY(lv)} y2={valueToY(lv)} stroke={theme.borderColor} strokeWidth={lv === 0 ? 1.2 : 0.75} />
                    ))}
                    {showAxisValues && gridLevels.map((lv) => (
                        <text key={lv} x={4} y={valueToY(lv) - 2} fontSize={9 * fontScale} fontFamily="serif" fill={theme.subtextColor}>
                            {lv === 1 ? "1" : lv === -1 ? "-1" : lv === 0 ? "0" : lv > 0 ? "1/√2" : "-1/√2"}
                        </text>
                    ))}
                    {members.flatMap((m) => {
                        const lines: React.ReactNode[] = [];
                        if (mode !== "im") {
                            lines.push(
                                <polyline key={m.label + "-re"} fill="none" stroke={m.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"
                                    points={m.reValues.map((v, i) => `${idxToX(i)},${valueToY(v)}`).join(" ")} />
                            );
                        }
                        if (mode !== "re") {
                            lines.push(
                                <polyline key={m.label + "-im"} fill="none" stroke={m.color} strokeWidth={2} strokeDasharray="4 3" strokeLinejoin="round" strokeLinecap="round"
                                    points={m.imValues.map((v, i) => `${idxToX(i)},${valueToY(v)}`).join(" ")} />
                            );
                        }
                        return lines;
                    })}
                    {members.flatMap((m) => {
                        const dots: React.ReactNode[] = [];
                        if (mode !== "im") dots.push(<circle key={m.label + "-redot"} cx={idxToX(currentIdx)} cy={valueToY(m.reCur)} r={3.2} fill={m.color} stroke={theme.bg} strokeWidth={1.3} />);
                        if (mode !== "re") dots.push(<circle key={m.label + "-imdot"} cx={idxToX(currentIdx)} cy={valueToY(m.imCur)} r={3.2} fill={m.color} stroke={theme.bg} strokeWidth={1.3} opacity={0.75} />);
                        return dots;
                    })}
                </svg>
            </div>
        </div>
    );
};

/* ============================================================================
 * 3D BLOCH VECTOR & TRAJECTORY
 * ==========================================================================*/

const BlochVectorArrow: React.FC<{ position: THREE.Vector3; color: string }> = ({ position, color }) => {
    const dir = useMemo(() => position.clone().normalize(), [position]);
    const quat = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir), [dir]);
    const headLen = 0.16;
    const shaftLen = Math.max(position.length() - headLen, 0.02);

    return (
        <group quaternion={quat}>
            <mesh position={[0, shaftLen / 2, 0]}>
                <cylinderGeometry args={[0.02, 0.02, shaftLen, 16]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} />
            </mesh>
            <mesh position={[0, shaftLen + headLen / 2, 0]}>
                <coneGeometry args={[0.075, headLen, 20]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} />
            </mesh>
            <mesh position={[0, shaftLen + headLen, 0]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshBasicMaterial color={color} transparent opacity={0.3} blending={THREE.AdditiveBlending} />
            </mesh>
        </group>
    );
};

interface TrajectoryProps { history: THREE.Vector3[]; color: string; size: number; }
const Trajectory: React.FC<TrajectoryProps> = ({ history, color, size }) => {
    const tubeGeom = useMemo(() => {
        if (history.length < 2) return null;
        const pts: THREE.Vector3[] = [];
        for (let i = 0; i < history.length - 1; i++) {
            const arc = generateArcPoints(history[i], history[i + 1], 20);
            if (i > 0) arc.shift();
            pts.push(...arc);
        }
        if (pts.length < 2) return null;
        const curve = new THREE.CatmullRomCurve3(pts);
        return new THREE.TubeGeometry(curve, pts.length * 3, size, 8, false);
    }, [history, size]);

    return (
        <group>
            {tubeGeom && (
                <mesh geometry={tubeGeom}>
                    <meshBasicMaterial color={color} transparent opacity={0.85} depthTest={false} />
                </mesh>
            )}
            {history.map((p, i) => (
                <mesh key={i} position={p}>
                    <sphereGeometry args={[size * 1.5, 12, 12]} />
                    <meshBasicMaterial color={color} depthTest={false} />
                </mesh>
            ))}
        </group>
    );
};

/* ============================================================================
 * MAIN BLOCH SPHERE SIMULATOR APP
 * ==========================================================================*/

type BasisKey = "z0" | "z1" | "xPlus" | "xMinus" | "yPlus" | "yMinus";
const BASIS_META: { key: BasisKey; label: string; color: string; basis: "Z" | "X" | "Y" }[] = [
    { key: "z0", label: "|0⟩", color: "#6366F1", basis: "Z" },
    { key: "z1", label: "|1⟩", color: "#EC4899", basis: "Z" },
    { key: "xPlus", label: "|+⟩", color: "#3B82F6", basis: "X" },
    { key: "xMinus", label: "|-⟩", color: "#F97316", basis: "X" },
    { key: "yPlus", label: "|+i⟩", color: "#10B981", basis: "Y" },
    { key: "yMinus", label: "|-i⟩", color: "#84CC16", basis: "Y" },
];

const sweepPhiCurve = (state: QuantumState, key: BasisKey, part: "re" | "im"): number[] => {
    const { theta } = stateToBloch(state);
    const values: number[] = [];
    for (let i = 0; i < SAMPLES; i++) {
        const phiSample = (i / (SAMPLES - 1)) * 2 * Math.PI;
        const sampleState = normalizeState({
            alpha: c(Math.cos(theta / 2)),
            beta: cScale(cExpI(phiSample), Math.sin(theta / 2)),
        });
        const amp = basisAnalysis(sampleState)[key].amp;
        values.push(part === "re" ? amp.re : amp.im);
    }
    return values;
};

export default function BlochSphereSimulator() {
    const navigate = useNavigate();
    const [themeMode, setThemeMode] = useState<ThemeMode>("ibm");
    const theme = THEMES[themeMode];

    const [fontScale, setFontScale] = useState(1);
    const fz = (n: number): React.CSSProperties => ({ fontSize: `${(n * fontScale).toFixed(2)}px` });

    // Canonical Quantum State stored exclusively as Complex Amplitudes (alpha, beta)
    const [qState, setQState] = useState<QuantumState>({ alpha: c(1, 0), beta: c(0, 0) });

    const [initialState, setInitialState] = useState<InitialStateKey>("0");
    const [vectorColor, setVectorColor] = useState(theme.vectorDefault);
    const [trailColor, setTrailColor] = useState(theme.trailDefault);
    const [showTrail, setShowTrail] = useState(true);
    const [trailSize, setTrailSize] = useState(0.016);
    const [historyLength, setHistoryLength] = useState(12);

    const [amplitudePart, setAmplitudePart] = useState<"both" | "re" | "im">("both");
    const [showAxisValues, setShowAxisValues] = useState(true);

    useEffect(() => { setVectorColor(theme.vectorDefault); setTrailColor(theme.trailDefault); }, [themeMode]);

    const [rxDeg, setRxDeg] = useState(90);
    const [ryDeg, setRyDeg] = useState(90);
    const [rzDeg, setRzDeg] = useState(90);
    const [axis, setAxis] = useState({ nx: 1, ny: 0, nz: 0 });
    const [axisDeg, setAxisDeg] = useState(90);
    const [u3, setU3] = useState({ thetaDeg: 90, phiDeg: 0, lambdaDeg: 180 });

    // History tracking Hilbert space state vector and derived 3D position
    const [history, setHistory] = useState<{ pos: THREE.Vector3; state: QuantumState }[]>(() => {
        const init = INITIAL_STATE_MAP["0"].state;
        const { theta, phi } = stateToBloch(init);
        return [{ pos: sphericalToCartesian(theta, phi), state: init }];
    });

    const recordState = useCallback((newState: QuantumState) => {
        const normalized = normalizeState(newState);
        const { theta, phi } = stateToBloch(normalized);
        const pos = sphericalToCartesian(theta, phi);

        setHistory((prev) => {
            const next = [...prev, { pos, state: normalized }];
            return next.length > historyLength + 1 ? next.slice(next.length - (historyLength + 1)) : next;
        });
        setQState(normalized);
    }, [historyLength]);

    const runGate = useCallback((M: Mat2) => {
        setQState((prevState) => {
            const nextState = matVecState(M, prevState);
            const normalized = normalizeState(nextState);
            const { theta, phi } = stateToBloch(normalized);
            const pos = sphericalToCartesian(theta, phi);

            setHistory((prev) => {
                const next = [...prev, { pos, state: normalized }];
                return next.length > historyLength + 1 ? next.slice(next.length - (historyLength + 1)) : next;
            });
            return normalized;
        });
    }, [historyLength]);

    const handleInit = () => {
        const init = INITIAL_STATE_MAP[initialState].state;
        const { theta, phi } = stateToBloch(init);
        setQState(init);
        setHistory([{ pos: sphericalToCartesian(theta, phi), state: init }]);
    };
    const selectInitialState = (key: InitialStateKey) => {
        setInitialState(key);
        const init = INITIAL_STATE_MAP[key].state;
        const { theta, phi } = stateToBloch(init);
        setQState(init);
        setHistory([{ pos: sphericalToCartesian(theta, phi), state: init }]);
    };
    const handleUndo = () => {
        if (history.length <= 1) return;
        const next = history.slice(0, -1);
        const last = next[next.length - 1];
        setQState(last.state);
        setHistory(next);
    };
    const handleExport = (format: "png" | "jpeg") => {
        const canvas = document.querySelector("canvas");
        if (!canvas) return;
        const link = document.createElement("a");
        link.download = `bloch-sphere-state.${format}`;
        link.href = canvas.toDataURL(`image/${format}`, 1.0);
        link.click();
    };

    const [topZ, setTopZ] = useState(30);
    const [widgets, setWidgets] = useState<Record<string, WidgetState>>(() => {
        const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
        const rightX = Math.max(380, vw - 380);
        return {
            state: { id: "state", title: "State Vector |Ψ⟩", x: 20, y: 84, zIndex: 10, open: true, pinned: true, minimized: false },
            probs: { id: "probs", title: "Probability Distributions", x: 20, y: 246, zIndex: 11, open: true, pinned: true, minimized: false, resizable: true, width: 360, height: 270 },
            gates: { id: "gates", title: "Unitary Operations", x: rightX, y: 84, zIndex: 12, open: true, pinned: true, minimized: false },
            amplitudes: { id: "amplitudes", title: "Wave Function Analysis", x: rightX, y: 84, zIndex: 13, open: false, pinned: false, minimized: false, width: 360 },
            advanced: { id: "advanced", title: "Custom Rotations U(θ,φ,λ)", x: rightX, y: 420, zIndex: 14, open: false, pinned: false, minimized: false },
            settings: { id: "settings", title: "Simulator Settings", x: rightX, y: 420, zIndex: 15, open: false, pinned: false, minimized: false },
        };
    });

    const bringToFront = (id: string) => { const z = topZ + 1; setTopZ(z); setWidgets((p) => ({ ...p, [id]: { ...p[id], zIndex: z } })); };
    const closeWidget = (id: string) => setWidgets((p) => ({ ...p, [id]: { ...p[id], open: false } }));
    const openWidget = (id: string) => { setWidgets((p) => ({ ...p, [id]: { ...p[id], open: true } })); bringToFront(id); };
    const togglePin = (id: string) => setWidgets((p) => ({ ...p, [id]: { ...p[id], pinned: !p[id].pinned } }));
    const toggleMinimize = (id: string) => setWidgets((p) => ({ ...p, [id]: { ...p[id], minimized: !p[id].minimized } }));
    const moveWidget = (id: string, x: number, y: number) => setWidgets((p) => ({ ...p, [id]: { ...p[id], x, y } }));
    const resizeWidget = (id: string, width: number, height: number) => setWidgets((p) => ({ ...p, [id]: { ...p[id], width, height } }));

    const [focusMode, setFocusMode] = useState(false);
    const preFocusOpen = useRef<Record<string, boolean> | null>(null);
    const toggleFocusMode = () => {
        if (!focusMode) {
            preFocusOpen.current = Object.fromEntries(Object.entries(widgets).map(([id, w]) => [id, w.open]));
            setWidgets((p) => Object.fromEntries(Object.entries(p).map(([id, w]) => [id, { ...w, open: false }])) as Record<string, WidgetState>);
            setFocusMode(true);
        } else {
            const restore = preFocusOpen.current;
            if (restore) setWidgets((p) => Object.fromEntries(Object.entries(p).map(([id, w]) => [id, { ...w, open: restore[id] ?? w.open }])) as Record<string, WidgetState>);
            setFocusMode(false);
        }
    };
    const DiracKet: React.FC<{ label: React.ReactNode }> = ({ label }) => (
        <span className="font-serif italic">
            |{label}⟩
        </span>
    );

    const [viewMenuOpen, setViewMenuOpen] = useState(false);
    const viewMenuRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!viewMenuOpen) return;
        const onPointerDown = (e: PointerEvent) => {
            if (viewMenuRef.current && !viewMenuRef.current.contains(e.target as Node)) {
                setViewMenuOpen(false);
            }
        };
        document.addEventListener("pointerdown", onPointerDown);
        return () => document.removeEventListener("pointerdown", onPointerDown);
    }, [viewMenuOpen]);

    // DERIVED QUANTITIES MEMOIZATION
    const analysis = useMemo(() => basisAnalysis(qState), [qState]);
    const { theta, phi } = useMemo(() => stateToBloch(qState), [qState]);
    const currentPos = useMemo(() => sphericalToCartesian(theta, phi), [theta, phi]);
    const trailHistoryPositions = useMemo(() => history.map((h) => h.pos), [history]);

    const themeButtonColor = currentThemeTextColor(themeMode);
    const probsWidget = widgets.probs;
    const barsAreaHeight = probsWidget.height ? Math.max(90, probsWidget.height - 150) : 112;

    return (
        <div style={{ backgroundColor: theme.bg, color: theme.textColor, ...fz(14) }} className="w-full h-screen font-sans relative overflow-hidden select-none transition-colors duration-300">
            {/* HEADER */}
            <header style={{ backgroundColor: theme.headerBg, borderColor: theme.borderColor }} className="absolute top-0 left-0 right-0 h-16 backdrop-blur-md border-b px-3 sm:px-6 flex items-center justify-between z-50 transition-colors duration-300">
                <div onClick={() => navigate(-1)} className="flex cursor-pointer items-center gap-2 sm:gap-3 min-w-0">
                    <div className="p-2 rounded-xl border shrink-0 group " style={{ borderColor: theme.borderColor, color: theme.accentColor }}>
                        <LuAtom className="w-5 h-5 transition-transform duration-700 ease-in-out group-hover:rotate-[180deg]" />
                    </div>
                    <div className="min-w-0 hidden min-[420px]:block">
                        <h1 style={{ color: theme.accentColor, ...fz(15) }} className="font-extrabold tracking-tight truncate">Bloch Sphere Simulator</h1>
                        <p style={{ color: theme.subtextColor, ...fz(10.5) }} className="font-mono truncate">Interactive Single-Qubit Mechanics</p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                    <button onClick={toggleFocusMode} title="Focus view" style={{ borderColor: theme.borderColor, color: focusMode ? themeButtonColor : theme.accentColor, backgroundColor: focusMode ? theme.accentColor : "transparent", ...fz(12) }} className="px-2.5 py-1.5 font-semibold rounded-lg border flex items-center gap-1.5 transition-colors">
                        <LuFocus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{focusMode ? "Exit Focus" : "Focus"}</span>
                    </button>

                    <button onClick={handleInit} style={{ borderColor: theme.borderColor, color: theme.accentColor, ...fz(12) }} className="px-2.5 py-1.5 font-semibold rounded-lg border flex items-center gap-1.5 hover:bg-black/10 dark:hover:bg-white/10">
                        <LuRotateCcw className="w-3.5 h-3.5" /><span className="hidden sm:inline">RESET</span>
                    </button>
                    <button onClick={handleUndo} style={{ borderColor: theme.borderColor, color: theme.textColor, ...fz(12) }} className="px-2.5 py-1.5 font-semibold rounded-lg border flex items-center gap-1.5 hover:bg-black/10 dark:hover:bg-white/10">
                        <LuUndo2 className="w-3.5 h-3.5" /><span className="hidden sm:inline">UNDO</span>
                    </button>
                    <button onClick={() => handleExport("png")} style={{ backgroundColor: theme.accentColor, color: themeButtonColor, ...fz(12) }} className="px-2.5 py-1.5 font-semibold rounded-lg flex items-center gap-1.5 hover:opacity-90">
                        <LuDownload className="w-3.5 h-3.5" /><span className="hidden sm:inline">EXPORT</span>
                    </button>

                    <div className="relative" ref={viewMenuRef}>
                        <button onClick={() => setViewMenuOpen((v) => !v)} style={{ backgroundColor: theme.panelBg, borderColor: theme.borderColor, color: theme.textColor, ...fz(12) }} className="px-2.5 py-1.5 font-semibold rounded-lg border flex items-center gap-1.5">
                            <LuEye className="w-3.5 h-3.5" /><LuChevronDown className="w-3 h-3" />
                        </button>
                        {viewMenuOpen && (
                            <div
                                style={{ backgroundColor: theme.panelBg, borderColor: theme.borderColor, zIndex: 100000 }}
                                className="absolute right-0 mt-2 w-64 rounded-xl border shadow-2xl p-2 backdrop-blur-xl"
                            >
                                <div style={{ color: theme.subtextColor, ...fz(10.5) }} className="px-2 py-1 font-bold uppercase border-b mb-1">Panels &amp; Windows</div>
                                {Object.values(widgets).map((w) => (
                                    <div key={w.id} className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10">
                                        <button onClick={() => (w.open ? closeWidget(w.id) : openWidget(w.id))} style={{ color: w.open ? theme.accentColor : theme.subtextColor, ...fz(12) }} className="flex-1 text-left truncate">
                                            {w.title}
                                        </button>
                                        <button onClick={() => togglePin(w.id)} style={{ color: w.pinned ? theme.accentColor : theme.subtextColor }} className="p-1">
                                            {w.pinned ? <LuPin className="w-3 h-3" /> : <LuPinOff className="w-3 h-3" />}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button onClick={() => { const modes: ThemeMode[] = ["ibm", "light", "cyberpunk"]; setThemeMode(modes[(modes.indexOf(themeMode) + 1) % modes.length]); }} style={{ backgroundColor: theme.panelBg, borderColor: theme.borderColor, color: theme.accentColor }} className="p-2 rounded-lg border" title="Toggle Theme">
                        {themeMode === "light" ? <LuSun className="w-4 h-4" /> : <LuMoon className="w-4 h-4" />}
                    </button>
                </div>
            </header>

            {/* 3D SCENE */}
            <div style={{ background: theme.canvasBg }} className="absolute inset-0 pt-16 z-0 flex items-center justify-center transition-colors duration-300">
                <Canvas gl={{ preserveDrawingBuffer: true }} camera={{ position: [2.8, 2.0, 3.2], fov: 45 }}>
                    <ambientLight intensity={themeMode === "light" ? 1.2 : 0.8} />
                    <directionalLight position={[10, 10, 5]} intensity={1.2} />
                    <OrbitControls enablePan={false} minDistance={2} maxDistance={6} />

                    <group>
                        <mesh>
                            <sphereGeometry args={[1, 32, 24]} />
                            <meshBasicMaterial color={theme.accentColor} wireframe transparent opacity={0.08} depthTest={false} />
                        </mesh>

                        <Line points={Array.from({ length: 65 }).map((_, i) => [Math.cos((i * Math.PI * 2) / 64), 0, Math.sin((i * Math.PI * 2) / 64)] as [number, number, number])} color={theme.accentColor} lineWidth={1} />
                        <Line points={[[-1.4, 0, 0], [1.4, 0, 0]]} color="#EF4444" lineWidth={1.5} />
                        <Line points={[[0, -1.4, 0], [0, 1.4, 0]]} color={theme.poleAxisColor} lineWidth={1.5} />
                        <Line points={[[0, 0, -1.4], [0, 0, 1.4]]} color="#10B981" lineWidth={1.5} />

                        {/* LaTeX Formatted Axis Poles */}
                        <Html position={[0, 1.48, 0]} center className="font-serif font-bold pointer-events-none select-none" style={{ color: theme.textColor, ...fz(16) }}>|0⟩</Html>
                        <Html position={[0, -1.48, 0]} center className="font-serif font-bold pointer-events-none select-none" style={{ color: theme.textColor, ...fz(16) }}>|1⟩</Html>
                        <Html position={[1.48, 0, 0]} center className="text-red-400 font-serif font-bold pointer-events-none select-none" style={fz(15)}>X</Html>
                        <Html position={[0, 0, 1.48]} center className="font-serif font-bold pointer-events-none select-none" style={{ color: "#10B981", ...fz(15) }}>Y</Html>

                        {showTrail && <Trajectory history={trailHistoryPositions} color={trailColor} size={trailSize} />}
                        <BlochVectorArrow position={currentPos} color={vectorColor} />
                    </group>
                </Canvas>
            </div>

            {/* PANEL: STATE VECTOR */}
            <DraggableWidget widget={widgets.state} theme={theme} fontScale={fontScale} onBringToFront={bringToFront} onClose={closeWidget} onTogglePin={togglePin} onToggleMinimize={toggleMinimize} onMove={moveWidget}>
                <div className="space-y-2.5 font-serif">
                    {/* Dirac Mathematical Representation Directly from Canonical Amplitudes */}
                    <div style={{ color: theme.accentColor, ...fz(15) }} className="font-semibold">
                        <DiracKet label="ψ" /> = <span className="font-sans font-normal">({fmtComplexLatex(qState.alpha)})</span><DiracKet label="0" /> + <span className="font-sans font-normal">({fmtComplexLatex(qState.beta)})</span><DiracKet label="1" />
                    </div>

                    <div className="grid grid-cols-4 gap-x-3 gap-y-1 font-sans" style={{ color: theme.subtextColor, ...fz(11) }}>
                        <div className="flex items-center gap-1">
                            <span className="font-serif">θ</span> = <span>{rad2deg(theta).toFixed(1)}°</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="font-serif">φ</span> = <span>{rad2deg(phi).toFixed(1)}°</span>
                        </div>
                        <div className="flex items-center col-span-2">
                            <span className="font-serif">r</span> = (<span className="font-mono">{currentPos.x.toFixed(2)}</span>, <span className="font-mono">{currentPos.z.toFixed(2)}</span>, <span className="font-mono">{currentPos.y.toFixed(2)}</span>)
                        </div>
                    </div>
                </div>
            </DraggableWidget>

            {/* PANEL: PROBABILITY DISTRIBUTIONS */}
            <DraggableWidget widget={widgets.probs} theme={theme} fontScale={fontScale} onBringToFront={bringToFront} onClose={closeWidget} onTogglePin={togglePin} onToggleMinimize={toggleMinimize} onMove={moveWidget} onResize={resizeWidget}>
                <div className="space-y-2 h-full flex flex-col">
                    <div style={{ height: barsAreaHeight, borderColor: theme.borderColor }} className="flex items-end justify-between gap-1 pt-4 pb-2 border-b px-1">
                        {BASIS_META.map(({ key, label, color }) => (
                            <div key={key} className="flex-1 h-full flex flex-col items-center justify-end gap-1">
                                <span style={{ color, ...fz(10) }} className="font-mono font-semibold">{(analysis[key].p * 100).toFixed(1)}%</span>
                                <div className="w-full flex-1 flex items-end">
                                    <div style={{ height: `${analysis[key].p * 100}%`, backgroundColor: color }} className="w-full rounded-t-sm transition-all duration-150" />
                                </div>
                                <span className="font-serif font-semibold" style={{ color: theme.textColor, ...fz(11) }}>{label}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between font-serif px-1" style={{ color: theme.subtextColor, ...fz(11) }}>
                        <span>Z-basis {"{|0⟩, |1⟩}"}</span>
                        <span>X-basis {"{|+⟩, |-⟩}"}</span>
                        <span>Y-basis {"{|+i⟩, |-i⟩}"}</span>
                    </div>
                </div>
            </DraggableWidget>

            {/* PANEL: GATE OPERATIONS */}
            <DraggableWidget widget={widgets.gates} theme={theme} fontScale={fontScale} onBringToFront={bringToFront} onClose={closeWidget} onTogglePin={togglePin} onToggleMinimize={toggleMinimize} onMove={moveWidget}>
                <div className="space-y-4">
                    <div>
                        <span style={{ color: theme.subtextColor, ...fz(10.5) }} className="font-bold uppercase block mb-1.5">Pauli &amp; Hadamard</span>
                        <div className="grid grid-cols-4 gap-2">
                            <GateButton label="X" theme={theme} fontScale={fontScale} onClick={() => runGate(GATE.X)} />
                            <GateButton label="Y" theme={theme} fontScale={fontScale} onClick={() => runGate(GATE.Y)} />
                            <GateButton label="Z" theme={theme} fontScale={fontScale} onClick={() => runGate(GATE.Z)} />
                            <GateButton label="H" theme={theme} fontScale={fontScale} onClick={() => runGate(GATE.H)} />
                        </div>
                    </div>

                    <div>
                        <span style={{ color: theme.subtextColor, ...fz(10.5) }} className="font-bold uppercase block mb-1.5">Phase Gates</span>
                        <div className="grid grid-cols-4 gap-2">
                            <GateButton label="S" theme={theme} fontScale={fontScale} onClick={() => runGate(GATE.S)} />
                            <GateButton label={<>S<sup>†</sup></>} theme={theme} fontScale={fontScale} onClick={() => runGate(GATE.Sdag)} />
                            <GateButton label="T" theme={theme} fontScale={fontScale} onClick={() => runGate(GATE.T)} />
                            <GateButton label={<>T<sup>†</sup></>} theme={theme} fontScale={fontScale} onClick={() => runGate(GATE.Tdag)} />
                        </div>
                    </div>

                    <div>
                        <span style={{ color: theme.subtextColor, ...fz(10.5) }} className="font-bold uppercase block mb-1.5">Sqrt Gate</span>
                        <GateButton label={<>√X</>} sub="√X · √X = X" theme={theme} fontScale={fontScale} onClick={() => runGate(GATE.SX)} wide />
                    </div>
                    <div className="pt-3 border-t space-y-3" style={{ borderColor: theme.borderColor }}>
                        <span style={{ color: theme.subtextColor, ...fz(10.5) }} className="font-bold uppercase block">Rotation Gates R(θ)</span>
                        <div className="flex items-end gap-2">
                            <div className="flex-1"><SliderRow label="R_x(θ)" value={rxDeg} min={-360} max={360} step={1} unit="°" onChange={setRxDeg} theme={theme} fontScale={fontScale} /></div>
                            <button onClick={() => runGate(Rx(deg2rad(rxDeg)))} style={{ borderColor: theme.borderColor, color: "#EF4444", ...fz(10) }} className="px-3 py-1.5 font-bold border rounded-lg hover:bg-black/10 dark:hover:bg-white/10">APPLY</button>
                        </div>
                        <div className="flex items-end gap-2">
                            <div className="flex-1"><SliderRow label="R_y(θ)" value={ryDeg} min={-360} max={360} step={1} unit="°" onChange={setRyDeg} theme={theme} fontScale={fontScale} /></div>
                            <button onClick={() => runGate(Ry(deg2rad(ryDeg)))} style={{ borderColor: theme.borderColor, color: "#10B981", ...fz(10) }} className="px-3 py-1.5 font-bold border rounded-lg hover:bg-black/10 dark:hover:bg-white/10">APPLY</button>
                        </div>
                        <div className="flex items-end gap-2">
                            <div className="flex-1"><SliderRow label="R_z(θ)" value={rzDeg} min={-360} max={360} step={1} unit="°" onChange={setRzDeg} theme={theme} fontScale={fontScale} /></div>
                            <button onClick={() => runGate(Rz(deg2rad(rzDeg)))} style={{ borderColor: theme.borderColor, color: theme.poleAxisColor, ...fz(10) }} className="px-3 py-1.5 font-bold border rounded-lg hover:bg-black/10 dark:hover:bg-white/10">APPLY</button>
                        </div>
                    </div>

                    <button
                        onClick={() => openWidget("advanced")}
                        style={{ backgroundColor: theme.accentColor, color: themeButtonColor, ...fz(12) }}
                        className="w-full py-1.5 font-semibold rounded flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                    >
                        <LuSlidersHorizontal className="w-3.5 h-3.5" /> U3 Gate &amp; Axis Rotations
                    </button>
                </div>
            </DraggableWidget>

            {/* PANEL: WAVE FUNCTION ANALYSIS */}
            <DraggableWidget widget={widgets.amplitudes} theme={theme} fontScale={fontScale} onBringToFront={bringToFront} onClose={closeWidget} onTogglePin={togglePin} onToggleMinimize={toggleMinimize} onMove={moveWidget}>
                <div className="space-y-4">
                    <p style={{ color: theme.subtextColor, ...fz(10.5) }}>
                        Continuous phase decomposition of wave amplitudes across φ ∈ [0, 2π). Solid curves represent Re[ψ], dashed curves represent Im[ψ].
                    </p>

                    <div className="flex rounded-lg overflow-hidden border w-fit" style={{ borderColor: theme.borderColor }}>
                        {(["both", "re", "im"] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => setAmplitudePart(p)}
                                style={{ backgroundColor: amplitudePart === p ? theme.accentColor : "transparent", color: amplitudePart === p ? themeButtonColor : theme.subtextColor, ...fz(10.5) }}
                                className="px-3 py-1 font-bold uppercase"
                            >
                                {p === "both" ? "Re + Im" : p === "re" ? "Re[ψ]" : "Im[ψ]"}
                            </button>
                        ))}
                    </div>

                    {(["Z", "X", "Y"] as const).map((basisLetter) => {
                        const members = BASIS_META.filter((b) => b.basis === basisLetter);
                        return (
                            <AmplitudeWaveChart
                                key={basisLetter}
                                title={`${basisLetter}-basis Amplitudes`}
                                theme={theme}
                                currentPhi={phi}
                                showAxisValues={showAxisValues}
                                mode={amplitudePart}
                                fontScale={fontScale}
                                members={members.map((m) => ({
                                    label: m.label,
                                    color: m.color,
                                    reValues: sweepPhiCurve(qState, m.key, "re"),
                                    imValues: sweepPhiCurve(qState, m.key, "im"),
                                    reCur: analysis[m.key].amp.re,
                                    imCur: analysis[m.key].amp.im,
                                }))}
                            />
                        );
                    })}

                    <div className="flex items-center justify-between pt-1">
                        <span style={fz(12)}>Display plot axis values</span>
                        <Switch checked={showAxisValues} onChange={setShowAxisValues} theme={theme} />
                    </div>
                </div>
            </DraggableWidget>

            {/* PANEL: ADVANCED ROTATIONS */}
            <DraggableWidget widget={widgets.advanced} theme={theme} fontScale={fontScale} onBringToFront={bringToFront} onClose={closeWidget} onTogglePin={togglePin} onToggleMinimize={toggleMinimize} onMove={moveWidget}>
                <div className="space-y-4">
                    <div>
                        <span style={{ color: theme.subtextColor, ...fz(10.5) }} className="font-bold uppercase mb-2 flex items-center gap-1.5"><LuWaves className="w-3 h-3" /> Axis Rotation R_n(θ)</span>
                        <div className="grid grid-cols-3 gap-2 mb-2 mt-2">
                            <NumberField label="n_x" value={axis.nx} onChange={(v) => setAxis((a) => ({ ...a, nx: v }))} theme={theme} fontScale={fontScale} />
                            <NumberField label="n_y" value={axis.ny} onChange={(v) => setAxis((a) => ({ ...a, ny: v }))} theme={theme} fontScale={fontScale} />
                            <NumberField label="n_z" value={axis.nz} onChange={(v) => setAxis((a) => ({ ...a, nz: v }))} theme={theme} fontScale={fontScale} />
                        </div>
                        <SliderRow label="Angle θ" value={axisDeg} min={-360} max={360} step={1} unit="°" onChange={setAxisDeg} theme={theme} fontScale={fontScale} />
                        <button onClick={() => runGate(Rn(axis.nx, axis.ny, axis.nz, deg2rad(axisDeg)))} style={{ backgroundColor: theme.accentColor, color: themeButtonColor, ...fz(12) }} className="w-full mt-2 py-1.5 font-semibold rounded hover:opacity-90">Apply R_n(θ)</button>
                    </div>

                    <div className="pt-3 border-t space-y-2" style={{ borderColor: theme.borderColor }}>
                        <span style={{ color: theme.subtextColor, ...fz(10.5) }} className="font-bold uppercase block">U3(θ, φ, λ) Unitary</span>
                        <SliderRow label="θ" value={u3.thetaDeg} min={0} max={360} step={1} unit="°" onChange={(v) => setU3((s) => ({ ...s, thetaDeg: v }))} theme={theme} fontScale={fontScale} />
                        <SliderRow label="φ" value={u3.phiDeg} min={0} max={360} step={1} unit="°" onChange={(v) => setU3((s) => ({ ...s, phiDeg: v }))} theme={theme} fontScale={fontScale} />
                        <SliderRow label="λ" value={u3.lambdaDeg} min={0} max={360} step={1} unit="°" onChange={(v) => setU3((s) => ({ ...s, lambdaDeg: v }))} theme={theme} fontScale={fontScale} />
                        <button onClick={() => runGate(U3(deg2rad(u3.thetaDeg), deg2rad(u3.phiDeg), deg2rad(u3.lambdaDeg)))} style={{ backgroundColor: theme.accentColor, color: themeButtonColor, ...fz(12) }} className="w-full py-1.5 font-semibold rounded hover:opacity-90">Apply U3</button>
                    </div>
                </div>
            </DraggableWidget>

            {/* PANEL: SETTINGS */}
            <DraggableWidget widget={widgets.settings} theme={theme} fontScale={fontScale} onBringToFront={bringToFront} onClose={closeWidget} onTogglePin={togglePin} onToggleMinimize={toggleMinimize} onMove={moveWidget}>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <span style={{ color: theme.subtextColor, ...fz(10.5) }} className="font-bold uppercase block">Initial Ground State</span>
                        <div className="grid grid-cols-3 gap-2">
                            {(Object.keys(INITIAL_STATE_MAP) as InitialStateKey[]).map((key) => (
                                <button
                                    key={key}
                                    onClick={() => selectInitialState(key)}
                                    style={{
                                        borderColor: initialState === key ? theme.accentColor : theme.borderColor,
                                        backgroundColor: initialState === key ? theme.accentColor : "transparent",
                                        color: initialState === key ? themeButtonColor : theme.textColor,
                                        ...fz(14),
                                    }}
                                    className="py-1.5 font-serif font-bold border rounded-lg transition-colors"
                                >
                                    {INITIAL_STATE_MAP[key].label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-3 border-t space-y-3" style={{ borderColor: theme.borderColor }}>
                        <span style={{ color: theme.subtextColor, ...fz(10.5) }} className="font-bold uppercase block">Trajectory &amp; Vector Styling</span>
                        <label className="flex items-center justify-between" style={fz(12.5)}>
                            <span>Enable trajectory trace</span>
                            <input type="checkbox" checked={showTrail} onChange={(e) => setShowTrail(e.target.checked)} style={{ accentColor: theme.accentColor }} />
                        </label>
                        <SliderRow label="Trace length" value={historyLength} min={1} max={40} step={1} onChange={(v) => setHistoryLength(Math.round(v))} theme={theme} fontScale={fontScale} />
                        <SliderRow label="Trajectory thickness" value={trailSize} min={0.005} max={0.05} step={0.002} onChange={setTrailSize} theme={theme} fontScale={fontScale} />
                        <div className="flex items-center justify-between pt-1">
                            <span style={fz(12.5)}>State vector color</span>
                            <input type="color" value={vectorColor} onChange={(e) => setVectorColor(e.target.value)} className="w-8 h-6 bg-transparent border-none cursor-pointer" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span style={fz(12.5)}>Trajectory color</span>
                            <input type="color" value={trailColor} onChange={(e) => setTrailColor(e.target.value)} className="w-8 h-6 bg-transparent border-none cursor-pointer" />
                        </div>
                    </div>

                    <div className="pt-3 border-t space-y-2" style={{ borderColor: theme.borderColor }}>
                        <span style={{ color: theme.subtextColor, ...fz(10.5) }} className="font-bold uppercase block">Typography Scale</span>
                        <SliderRow label="UI Text Scale" value={fontScale} min={0.85} max={1.5} step={0.05} unit="×" onChange={setFontScale} theme={theme} fontScale={fontScale} />
                    </div>
                </div>
            </DraggableWidget>

            {/* FOCUS MODE RESTORE FLOATING BUTTON */}
            {focusMode && (
                <button
                    onClick={toggleFocusMode}
                    style={{ backgroundColor: theme.accentColor, color: themeButtonColor, ...fz(12) }}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full font-semibold shadow-2xl flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                    <LuMaximize2 className="w-3.5 h-3.5" /> Restore Workspace
                </button>
            )}
        </div>
    );
}

function currentThemeTextColor(mode: ThemeMode) {
    return mode === "light" ? "#FFFFFF" : "#0F172A";
}