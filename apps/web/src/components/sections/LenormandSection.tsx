import React from 'react';
import { ServiceSection } from './ServiceSection';

interface LenormandSectionProps {
    id?: string;
}

export const LenormandSection: React.FC<LenormandSectionProps> = ({ id }) => {
    return (
        <ServiceSection
            id={id}
            badge="ЛЕНОРМАН"
            title="Карты Ленорман"
            description="Точные предсказания на каждый день. Система гадания, которая отвечает на конкретные вопросы."
            media={{ webm: "/lenorman.webm", mp4: "/lenorman.mp4" }}
            imageAlt="Ленорман анимация"
        />
    );
};
