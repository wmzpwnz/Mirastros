import React from 'react';
import { ServiceSection } from './ServiceSection';

interface RitualsSectionProps {
    id?: string;
}

export const RitualsSection: React.FC<RitualsSectionProps> = ({ id }) => {
    return (
        <ServiceSection
            id={id}
            badge="РИТУАЛЫ"
            title="Магические практики"
            description="Персональные ритуалы для достижения целей. Создайте свой уникальный обряд."
            media={{ webm: "/ritual.webm", mp4: "/ritual.mp4" }}
            imageAlt="Ритуалы анимация"
        />
    );
};
