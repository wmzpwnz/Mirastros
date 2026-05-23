import React from 'react';
import { ServiceSection } from './ServiceSection';

interface AstrologySectionProps {
    id?: string;
}

export const AstrologySection: React.FC<AstrologySectionProps> = ({ id }) => {
    return (
        <ServiceSection
            id={id}
            badge="АСТРОЛОГИЯ"
            title="Наука о звездах"
            description="Изучите влияние планет на вашу судьбу и характер"
            media={{ webm: "/astro.webm", mp4: "/astro.mp4" }}
            imageAlt="Астрология анимация"
        />
    );
};
