import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useLocation } from "react-router-dom";

// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================

const VIEWPORT_BREAKPOINTS = {
    MOBILE: 640,
    TABLET: 1024,
} as const;

const PARTICLE_COUNTS = {
    HERO: { MOBILE: 500, TABLET: 700, DESKTOP: 1000 },
    STANDARD: { MOBILE: 300, TABLET: 500, DESKTOP: 800 },
} as const;

/** High-contrast, vibrant quantum energy palettes (Strict 6-digit hex format) */
const PALETTES = {
    DARK: [
        new THREE.Color("#00F0FF"), // Electric Cyan
        new THREE.Color("#7000FF"), // Deep Quantum Violet
        new THREE.Color("#38BDF8"), // Bright Blue
        new THREE.Color("#00FF9D"), // Neon Green
        new THREE.Color("#818CF8"), // Soft Indigo
    ],
    LIGHT: [
        new THREE.Color("#0284C7"),
        new THREE.Color("#2563EB"),
        new THREE.Color("#7C3AED"),
        new THREE.Color("#0D9488"),
    ],
} as const;

const PHYSICS = {
    SPRING_STIFFNESS: 0.035, // Hooke's Law constant (restoration to origin)
    DAMPING: 0.68,          // Velocity decay factor (friction)
    MOUSE_RADIUS: 1.6,       // Repulsion field radius in world units
    MOUSE_FORCE: 0.06,       // Repulsion force multiplier
    WAVE_SPEED: 3.0,         // Wave front expansion velocity
    WAVE_THICKNESS: 1.0,     // Effective pulse width of quantum shockwave
    WAVE_FORCE: 0.15,        // Wave impact impulse magnitude
    WAVE_MAX_RADIUS: 18.0,   // Radius at which wave completely dissipates
    IDLE_AMPLITUDE: 0.008,   // Zero-point fluctuation movement scale
    IDLE_SPEED: 1.2,         // Rate of quantum jitter
    ENERGY_DECAY: 0.95,      // Rate at which excited energy dissipates back to ground state
} as const;

const MAX_SIMULTANEOUS_WAVES = 5;

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type CanvasMode = "hero" | "courses" | "playground" | "composer";

export interface QuantumCanvasProps {
    mode?: CanvasMode;
    className?: string;
}

interface WaveDisturbance {
    x: number;
    y: number;
    radius: number;
    active: boolean;
    intensity: number;
}

interface ParticleSystemData {
    count: number;
    positions: Float32Array;
    originalPositions: Float32Array;
    velocities: Float32Array;
    colors: Float32Array;
    baseColors: Float32Array;
    sizes: Float32Array;
    baseSizes: Float32Array;
    masses: Float32Array;
    phases: Float32Array;
    energyLevels: Float32Array;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function createCircularParticleTexture(): THREE.CanvasTexture {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;

    const ctx = canvas.getContext("2d");
    if (ctx) {
        const center = 32;
        const gradient = ctx.createRadialGradient(center, center, 0, center, center, 32);

        gradient.addColorStop(0, "rgba(255, 255, 255, 1.0)");
        gradient.addColorStop(0.25, "rgba(255, 255, 255, 0.85)");
        gradient.addColorStop(0.65, "rgba(255, 255, 255, 0.3)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0.0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(center, center, 32, 0, Math.PI * 2);
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

function getParticleCount(width: number, mode: CanvasMode): number {
    const isHero = mode === "hero";
    const counts = isHero ? PARTICLE_COUNTS.HERO : PARTICLE_COUNTS.STANDARD;

    if (width < VIEWPORT_BREAKPOINTS.MOBILE) return counts.MOBILE;
    if (width < VIEWPORT_BREAKPOINTS.TABLET) return counts.TABLET;
    return counts.DESKTOP;
}

function createParticleData(
    count: number,
    boundsWidth: number,
    boundsHeight: number,
    isDarkTheme: boolean
): ParticleSystemData {
    const positions = new Float32Array(count * 3);
    const originalPositions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const baseColors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const baseSizes = new Float32Array(count);
    const masses = new Float32Array(count);
    const phases = new Float32Array(count);
    const energyLevels = new Float32Array(count);

    const palette = isDarkTheme ? PALETTES.DARK : PALETTES.LIGHT;

    for (let i = 0; i < count; i++) {
        const i3 = i * 3;

        const x = (Math.random() - 0.5) * boundsWidth * 1.15;
        const y = (Math.random() - 0.5) * boundsHeight * 1.15;
        const z = (Math.random() - 0.5) * 2.5;

        positions[i3] = x;
        positions[i3 + 1] = y;
        positions[i3 + 2] = z;

        originalPositions[i3] = x;
        originalPositions[i3 + 1] = y;
        originalPositions[i3 + 2] = z;

        velocities[i3] = 0;
        velocities[i3 + 1] = 0;
        velocities[i3 + 2] = 0;

        const randSize = Math.random();
        let size = 0.08;
        if (randSize > 0.9) {
            size = 0.22;
        } else if (randSize > 0.7) {
            size = 0.14;
        }

        sizes[i] = size;
        baseSizes[i] = size;

        masses[i] = 0.8 + Math.random() * 0.4 + (size / 0.08) * 0.2;
        phases[i] = Math.random() * Math.PI * 2;
        energyLevels[i] = 0.0;

        const color = palette[Math.floor(Math.random() * palette.length)];
        const brightness = 0.6 + Math.random() * 0.4;

        const r = color.r * brightness;
        const g = color.g * brightness;
        const b = color.b * brightness;

        colors[i3] = r;
        colors[i3 + 1] = g;
        colors[i3 + 2] = b;

        baseColors[i3] = r;
        baseColors[i3 + 1] = g;
        baseColors[i3 + 2] = b;
    }

    return {
        count,
        positions,
        originalPositions,
        velocities,
        colors,
        baseColors,
        sizes,
        baseSizes,
        masses,
        phases,
        energyLevels,
    };
}

// ============================================================================
// CORE THREE.JS PARTICLE COMPONENT
// ============================================================================

const QuantumField: React.FC<{ mode: CanvasMode }> = ({ mode }) => {
    const pointsRef = useRef<THREE.Points>(null);
    const geometryRef = useRef<THREE.BufferGeometry>(null);

    const { viewport, camera } = useThree();
    const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

    const circleTexture = useMemo(() => createCircularParticleTexture(), []);

    const particleCount = useMemo(() => {
        const windowWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
        return getParticleCount(windowWidth, mode);
    }, [mode]);

    const data = useMemo<ParticleSystemData>(() => {
        return createParticleData(
            particleCount,
            viewport.width,
            viewport.height,
            isDark
        );
    }, [particleCount, viewport.width, viewport.height, isDark]);

    const mouseWorldPos = useRef<THREE.Vector3>(new THREE.Vector3(-999, -999, 0));
    const activeWaves = useRef<WaveDisturbance[]>(
        Array.from({ length: MAX_SIMULTANEOUS_WAVES }, () => ({
            x: 0,
            y: 0,
            radius: 0,
            active: false,
            intensity: 0,
        }))
    );
    const nextWaveIndex = useRef(0);

    const raycaster = useMemo(() => new THREE.Raycaster(), []);
    const planeZ = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
    const mouseNDC = useRef(new THREE.Vector2(-999, -999));

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseNDC.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouseNDC.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };

        const handleMouseLeave = () => {
            mouseNDC.current.set(-999, -999);
            mouseWorldPos.current.set(-999, -999, 0);
        };

        const handleClick = () => {
            const wave = activeWaves.current[nextWaveIndex.current];
            wave.x = mouseWorldPos.current.x;
            wave.y = mouseWorldPos.current.y;
            wave.radius = 0.01;
            wave.active = true;
            wave.intensity = 1.0;

            nextWaveIndex.current = (nextWaveIndex.current + 1) % MAX_SIMULTANEOUS_WAVES;
        };

        window.addEventListener("mousemove", handleMouseMove, { passive: true });
        window.addEventListener("mouseleave", handleMouseLeave);
        window.addEventListener("click", handleClick);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseleave", handleMouseLeave);
            window.removeEventListener("click", handleClick);
        };
    }, []);

    // --------------------------------------------------------------------------
    // PHYSICS ANIMATION LOOP
    // --------------------------------------------------------------------------
    useFrame((state, delta) => {
        const geom = geometryRef.current;
        if (!geom) return;

        // Strict validation: Ensure buffer attributes and underlying arrays exist
        const posAttr = geom.attributes.position as THREE.BufferAttribute | undefined;
        const colorAttr = geom.attributes.color as THREE.BufferAttribute | undefined;
        const sizeAttr = geom.attributes.size as THREE.BufferAttribute | undefined;

        if (!posAttr?.array || !colorAttr?.array || !sizeAttr?.array) return;

        const safeDelta = Math.min(delta, 0.05);
        const elapsedTime = state.clock.elapsedTime ?? 0;
        const time = elapsedTime * PHYSICS.IDLE_SPEED;

        if (mouseNDC.current.x !== -999) {
            raycaster.setFromCamera(mouseNDC.current, camera);
            raycaster.ray.intersectPlane(planeZ, mouseWorldPos.current);
        }

        for (let w = 0; w < MAX_SIMULTANEOUS_WAVES; w++) {
            const wave = activeWaves.current[w];
            if (wave.active) {
                wave.radius += PHYSICS.WAVE_SPEED * safeDelta;
                wave.intensity *= 0.96;

                if (wave.radius > PHYSICS.WAVE_MAX_RADIUS || wave.intensity < 0.01) {
                    wave.active = false;
                }
            }
        }

        const posArray = posAttr.array as Float32Array;
        const colorArray = colorAttr.array as Float32Array;
        const sizeArray = sizeAttr.array as Float32Array;

        const {
            count,
            originalPositions,
            velocities,
            baseColors,
            baseSizes,
            masses,
            phases,
            energyLevels,
        } = data;

        const mx = mouseWorldPos.current.x;
        const my = mouseWorldPos.current.y;

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            let px = posArray[i3];
            let py = posArray[i3 + 1];
            let pz = posArray[i3 + 2];

            const ox = originalPositions[i3];
            const oy = originalPositions[i3 + 1];
            const oz = originalPositions[i3 + 2];

            let vx = velocities[i3];
            let vy = velocities[i3 + 1];
            let vz = velocities[i3 + 2];

            const mass = masses[i];
            const phase = phases[i];
            let energy = energyLevels[i];

            // A. Quantum Idle Fluctuation
            const idleFx = Math.sin(time + phase + ox * 0.5) * PHYSICS.IDLE_AMPLITUDE;
            const idleFy = Math.cos(time * 0.8 + phase + oy * 0.5) * PHYSICS.IDLE_AMPLITUDE;
            const idleFz = Math.sin(time * 1.2 + phase + oz * 0.5) * (PHYSICS.IDLE_AMPLITUDE * 0.5);

            vx += idleFx / mass;
            vy += idleFy / mass;
            vz += idleFz / mass;

            // B. Hooke's Law Spring Restoration
            const dxOrigin = ox - px;
            const dyOrigin = oy - py;
            const dzOrigin = oz - pz;

            vx += dxOrigin * PHYSICS.SPRING_STIFFNESS * (1 / mass);
            vy += dyOrigin * PHYSICS.SPRING_STIFFNESS * (1 / mass);
            vz += dzOrigin * PHYSICS.SPRING_STIFFNESS * (1 / mass);

            // C. Mouse Repulsion
            if (mouseNDC.current.x !== -999) {
                const dxMouse = px - mx;
                const dyMouse = py - my;
                const distSqMouse = dxMouse * dxMouse + dyMouse * dyMouse;
                const mouseRadiusSq = PHYSICS.MOUSE_RADIUS * PHYSICS.MOUSE_RADIUS;

                if (distSqMouse < mouseRadiusSq && distSqMouse > 0.0001) {
                    const distMouse = Math.sqrt(distSqMouse);
                    const force = (1.0 - distMouse / PHYSICS.MOUSE_RADIUS) * PHYSICS.MOUSE_FORCE;

                    vx += (dxMouse / distMouse) * force * (1 / mass);
                    vy += (dyMouse / distMouse) * force * (1 / mass);
                }
            }

            // D. Shockwave Wavefront Disturbance & Energy Gain
            for (let w = 0; w < MAX_SIMULTANEOUS_WAVES; w++) {
                const wave = activeWaves.current[w];
                if (!wave.active) continue;

                const dxWave = px - wave.x;
                const dyWave = py - wave.y;
                const distSqWave = dxWave * dxWave + dyWave * dyWave;
                const distWave = Math.sqrt(distSqWave);

                const ringDelta = Math.abs(distWave - wave.radius);

                if (ringDelta < PHYSICS.WAVE_THICKNESS && distWave > 0.001) {
                    const impulseFactor =
                        (1.0 - ringDelta / PHYSICS.WAVE_THICKNESS) *
                        wave.intensity *
                        PHYSICS.WAVE_FORCE;

                    vx += (dxWave / distWave) * impulseFactor * (1 / mass);
                    vy += (dyWave / distWave) * impulseFactor * (1 / mass);
                    vz += (Math.random() - 0.5) * impulseFactor * 0.5;

                    energy = Math.min(energy + impulseFactor * 2.5, 2.5);
                }
            }

            // E. Damping / Friction
            vx *= PHYSICS.DAMPING;
            vy *= PHYSICS.DAMPING;
            vz *= PHYSICS.DAMPING;

            // F. Energy Decay
            energy *= PHYSICS.ENERGY_DECAY;
            energyLevels[i] = energy;

            // G. Commit Positions
            px += vx;
            py += vy;
            pz += vz;

            posArray[i3] = px;
            posArray[i3 + 1] = py;
            posArray[i3 + 2] = pz;

            velocities[i3] = vx;
            velocities[i3 + 1] = vy;
            velocities[i3 + 2] = vz;

            // H. Apply Energy Gain to Visual Size & Luminance Brightness
            const baseSize = baseSizes[i];
            sizeArray[i] = baseSize * (1.0 + energy * 1.2);

            colorArray[i3] = Math.min(baseColors[i3] * (1.0 + energy * 1.5), 1.0);
            colorArray[i3 + 1] = Math.min(baseColors[i3 + 1] * (1.0 + energy * 1.5), 1.0);
            colorArray[i3 + 2] = Math.min(baseColors[i3 + 2] * (1.0 + energy * 1.5), 1.0);
        }

        posAttr.needsUpdate = true;
        colorAttr.needsUpdate = true;
        sizeAttr.needsUpdate = true;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry ref={geometryRef}>
                <bufferAttribute
                    attach="attributes-position"
                    args={[data.positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-color"
                    args={[data.colors, 3]}
                />
                <bufferAttribute
                    attach="attributes-size"
                    args={[data.sizes, 1]}
                />
            </bufferGeometry>
            <pointsMaterial
                map={circleTexture}
                size={0.12}
                vertexColors
                transparent
                opacity={0.9}
                sizeAttenuation
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
};

// ============================================================================
// MAIN WRAPPER CONTAINER COMPONENT
// ============================================================================

export default function QuantumCanvas({
    mode = "hero",
    className = "",
}: QuantumCanvasProps) {
    const location = useLocation();
    const [isVisible, setIsVisible] = React.useState(true);

    useEffect(() => {
        const allowedPaths = ["/", "/courses", "/playground", "/composer"];
        const isAllowed = allowedPaths.some(
            (path) => location.pathname === path || location.pathname === `${path}/`
        );
        setIsVisible(isAllowed);
    }, [location.pathname]);

    if (!isVisible) return null;

    return (
        <div
            className={`absolute inset-0 z-0 pointer-events-none overflow-hidden ${className}`}
            aria-hidden="true"
        >
            <Canvas
                dpr={[1, 2]}
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: "high-performance",
                    stencil: false,
                    depth: false,
                }}
                onCreated={({ gl }) => {
                    gl.domElement.addEventListener("webglcontextlost", (event) => {
                        event.preventDefault();
                    });
                }}
                camera={{ position: [0, 0, 7.5], fov: 60 }}
            >
                <QuantumField mode={mode} />
            </Canvas>
        </div>
    );
}