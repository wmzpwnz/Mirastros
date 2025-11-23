'use client';

import React from 'react';

export const IntroSection: React.FC = () => {
    return (
        <section className="flex flex-col items-center justify-center text-center p-8 relative z-10 w-full">
            <div>
                <div className="mb-8 drop-shadow-2xl">
                    <img src="/logo.png" alt="Mirastros Logo" className="w-full max-w-2xl mx-auto" />
                </div>
                <p className="text-xl md:text-2xl text-mirastros-silver max-w-2xl mx-auto font-light tracking-widest uppercase">
                    Gateway to the Unknown
                </p>
            </div>

            <div
                className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce"
            >
                <span className="text-mirastros-turquoise text-xs uppercase tracking-[0.5em] opacity-70">
                    Scroll to Ascend
                </span>
            </div>
        </section>
    );
};
