'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Cosmic star field with optimized particle count
 * Implements slow rotation animation for immersive effect
 * Reduces particle count on mobile and low-performance devices
 */
function CosmicStarField() {
    const ref = useRef<THREE.Points>(null);

    // Detect device performance
    const getStarCount = () => {
        // Low-end device detection
        const isLowEnd = typeof navigator !== 'undefined' && 
                        (navigator.hardwareConcurrency || 4) < 4;
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        
        if (isLowEnd) return 1500;  // Very low-end
        if (isMobile) return 2500;  // Mobile
        return 5000;                // Desktop
    };

    const starCount = getStarCount();

    // Generate star positions
    const [positions, colors] = useMemo(() => {
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount; i++) {
            // Random spherical distribution
            const radius = 50 + Math.random() * 100;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);

            // Gold-tinted stars with variation
            const brightness = 0.6 + Math.random() * 0.4;
            colors[i * 3] = brightness; // R
            colors[i * 3 + 1] = brightness * 0.9; // G (slightly less for gold tint)
            colors[i * 3 + 2] = brightness * 0.7; // B (even less for gold tint)
        }

        return [positions, colors];
    }, [starCount]);

    // Slower rotation for better performance (30fps effective)
    useFrame((state, delta) => {
        if (ref.current) {
            // Reduce rotation speed for smoother animation
            ref.current.rotation.x += delta * 0.015;
            ref.current.rotation.y += delta * 0.02;
        }
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={starCount}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={starCount}
                    array={colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.5}
                vertexColors
                transparent
                opacity={0.8}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

/**
 * Nebula clouds for depth (optimized)
 */
function NebulaClouds() {
    const cloud1Ref = useRef<THREE.Mesh>(null);
    const cloud2Ref = useRef<THREE.Mesh>(null);

    useFrame((state, delta) => {
        if (cloud1Ref.current) {
            cloud1Ref.current.rotation.z += delta * 0.02; // Slightly slower
        }
        if (cloud2Ref.current) {
            cloud2Ref.current.rotation.z -= delta * 0.03; // Slightly slower
        }
    });

    return (
        <>
            <mesh ref={cloud1Ref} position={[0, 0, -30]}>
                <planeGeometry args={[100, 100]} />
                <meshBasicMaterial
                    color="#BE8F44"
                    transparent
                    opacity={0.03}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
            <mesh ref={cloud2Ref} position={[0, 0, -50]}>
                <planeGeometry args={[120, 120]} />
                <meshBasicMaterial
                    color="#FFD700"
                    transparent
                    opacity={0.02}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
        </>
    );
}

/**
 * Static fallback background for low-performance devices
 */
function StaticStarBackground() {
    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none"
             style={{
                 background: 'radial-gradient(circle at 50% 50%, rgba(190, 143, 68, 0.1) 0%, rgba(0, 0, 0, 1) 100%)',
             }}>
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `
                    radial-gradient(1px 1px at 20% 30%, rgba(255, 215, 0, 0.8), transparent),
                    radial-gradient(1px 1px at 60% 70%, rgba(190, 143, 68, 0.6), transparent),
                    radial-gradient(1px 1px at 50% 50%, rgba(255, 255, 255, 0.9), transparent),
                    radial-gradient(1px 1px at 80% 10%, rgba(255, 215, 0, 0.7), transparent),
                    radial-gradient(1px 1px at 90% 60%, rgba(190, 143, 68, 0.5), transparent),
                    radial-gradient(1px 1px at 33% 10%, rgba(255, 255, 255, 0.8), transparent),
                    radial-gradient(1px 1px at 15% 80%, rgba(255, 215, 0, 0.6), transparent)
                `,
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
            }} />
        </div>
    );
}

/**
 * 3D Cosmic Background Component (Optimized)
 * Features:
 * - Adaptive particle count (1500-5000 based on device)
 * - Low-performance device detection
 * - Static fallback for very low-end devices
 * - Reduced animation speed for battery savings
 * - Fog for depth perception
 * - Ambient and directional lighting
 * - Nebula clouds for atmosphere
 */
export const Background3D: React.FC = () => {
    // Detect very low-end devices (< 2 cores or very old browsers)
    const shouldUseStatic = typeof navigator !== 'undefined' && 
                           (navigator.hardwareConcurrency || 4) < 2;

    if (shouldUseStatic) {
        return <StaticStarBackground />;
    }
    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none">
            <Canvas
                camera={{ position: [0, 0, 10], fov: 75 }}
                gl={{ 
                    antialias: true, 
                    alpha: true,
                    powerPreference: 'low-power' // Battery optimization
                }}
                frameloop="always" // Continuous rendering
            >
                {/* Fog for depth - PURE BLACK to match Hero fade */}
                <fog attach="fog" args={['#000000', 10, 100]} />

                {/* Lighting - Reduced intensity to avoid brown wash */}
                <ambientLight intensity={0.1} />
                <directionalLight
                    position={[10, 10, 5]}
                    intensity={0.2}
                    color="#BE8F44"
                />
                <directionalLight
                    position={[-10, -10, -5]}
                    intensity={0.1}
                    color="#FFD700"
                />

                {/* Star field */}
                <CosmicStarField />

                {/* Nebula clouds */}
                <NebulaClouds />
            </Canvas>
        </div>
    );
};
