import React from 'react';

interface HeroSectionProps {
    id?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ id }) => {
    return (
        <section className="mira-section mira-hero" id={id}>
            <div className="section-content">
                <h1 className="hero-title">
                    <span className="title-line-1">МИСТИЧЕСКИЙ</span>
                    <span className="title-line-2">ПРОВОДНИК</span>
                </h1>
                <p className="hero-tagline">АСТРОЛОГ И ТАРОЛОГ</p>
                <p className="hero-quote">Я не предсказываю будущее, я раскрываю то, что уже знает ваша душа.</p>
            </div>
        </section>
    );
};
