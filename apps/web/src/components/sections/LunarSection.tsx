import React from 'react';
import { ServiceSection } from './ServiceSection';

interface LunarSectionProps {
    id?: string;
}

export const LunarSection: React.FC<LunarSectionProps> = ({ id }) => {
    return (
        <ServiceSection
            id={id}
            badge="ЛУННЫЙ КАЛЕНДАРЬ"
            title="Фазы Луны"
            description="Планируйте дела в гармонии с лунными циклами. Узнайте лучшие дни для важных начинаний."
            media={{ webm: "/moon.webm", mp4: "/moon.mp4" }}
            imageAlt="Лунный календарь анимация"
        />
    );
};
