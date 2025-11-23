'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Cosmic star field with 5000 particles
 * Implements slow rotation animation for immersive effect
 */
function CosmicStarField() {
    const ref = useRef<THREE.Points>(null);
    
    // Generate 5000 star positions
    const [positions, colors] = useMemo(() => {
        const positions = new Float32Array(5000 * 3);
        const colors = new Float32Array(5000 * 3);
        
        for (let i = 0; i < 5000; i++) {
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
    }, []);
    
    // Slow rotation animation
    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x += delta * 0.02;
            ref.current.rotation.y += delta * 0.03;
        }
    });
    
    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={5000}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={5000}
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
 * Nebula clouds for depth
 */
function NebulaClouds() {
    const cloud1Ref = useRef<THREE.Mesh>(null);
    const cloud2Ref = useRef<THREE.Mesh>(null);
    
    useFrame((state, delta) => {
        if (cloud1Ref.current) {
            cloud1Ref.current.rotation.z += delta * 0.01;
        }
        if (cloud2Ref.current) {
            cloud2Ref.current.rotation.z -= delta * 0.015;
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
 * 3D Cosmic Background Component
 * Features:
 * - 5000 star particles with gold tint
 * - Slow rotation animation
 * - Fog for depth perception
 * - Ambient and directional lighting
 * - Nebula clouds for atmosphere
 */
export const Background3D: React.FC = () => {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none">
            <Canvas
                camera={{ position: [0, 0, 10], fov: 75 }}
                gl={{ antialias: true, alpha: true }}
            >
                {/* Fog for depth */}
                <fog attach="fog" args={['#050505', 20, 150]} />
                
                {/* Lighting */}
                <ambientLight intensity={0.3} />
                <directionalLight
                    position={[10, 10, 5]}
                    intensity={0.5}
                    color="#BE8F44"
                />
                <directionalLight
                    position={[-10, -10, -5]}
                    intensity={0.3}
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
