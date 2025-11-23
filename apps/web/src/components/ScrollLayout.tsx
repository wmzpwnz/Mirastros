'use client';

import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface ScrollLayoutProps {
    children: React.ReactNode;
}

export const ScrollLayout: React.FC<ScrollLayoutProps> = ({ children }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end'],
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    return (
        <div ref={containerRef} className="relative min-h-screen w-full overflow-hidden bg-mirastros-bg text-white">
            {/* Parallax Background Layer */}
            <motion.div
                style={{ opacity: smoothProgress }}
                className="fixed inset-0 z-0 pointer-events-none"
            >
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
                    style={{ backgroundImage: 'url(/background.jpg)' }}
                />
                <div className="absolute inset-0 bg-cosmic-gradient opacity-60 mix-blend-overlay" />
            </motion.div>

            {/* Content Layer */}
            <div className="relative z-10">
                {children}
            </div>

            {/* Scroll Progress Bar (Optional, for premium feel) */}
            <motion.div
                className="fixed bottom-0 left-0 right-0 h-1 bg-mirastros-gold origin-left z-50"
                style={{ scaleX: smoothProgress }}
            />
        </div>
    );
};
