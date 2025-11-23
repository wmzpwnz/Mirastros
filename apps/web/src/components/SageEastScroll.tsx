'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SageEastScrollProps {
    children: React.ReactNode;
}

export const SageEastScroll: React.FC<SageEastScrollProps> = ({ children }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const sections = gsap.utils.toArray<HTMLElement>('.scroll-section');

        sections.forEach((section, index) => {
            // Pin each section while scrolling
            ScrollTrigger.create({
                trigger: section,
                start: 'top top',
                end: '+=100%',
                pin: true,
                pinSpacing: true,
                scrub: true,
            });

            // Fade out and scale down when scrolling to next section
            if (index < sections.length - 1) {
                gsap.to(section, {
                    opacity: 0,
                    scale: 0.9,
                    filter: 'blur(10px)',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top top',
                        end: '+=100%',
                        scrub: 1,
                    },
                });
            }
        });

        return () => {
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        };
    }, []);

    return (
        <div ref={containerRef}>
            {children}
        </div>
    );
};
