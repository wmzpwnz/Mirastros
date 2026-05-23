import React from 'react';
import { ServiceSection } from './ServiceSection';

interface CrystalsSectionProps {
    id?: string;
}

export const CrystalsSection: React.FC<CrystalsSectionProps> = ({ id }) => {
    return (
        <ServiceSection
            id={id}
            badge="КРИСТАЛЛЫ"
            title="Магия камней"
            description="Подберите кристаллы для вашей энергии. Узнайте, какие камни подходят именно вам."
            media={{ webm: "/crystal.webm", mp4: "/crystal.mp4" }}
            imageAlt="Кристаллы анимация"
        />
    );
};
