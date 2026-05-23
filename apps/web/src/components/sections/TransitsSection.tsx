import React from 'react';
import { ServiceSection } from './ServiceSection';

interface TransitsSectionProps {
    id?: string;
}

export const TransitsSection: React.FC<TransitsSectionProps> = ({ id }) => {
    return (
        <ServiceSection
            id={id}
            badge="ТРАНЗИТЫ"
            title="Планетарные влияния"
            description="Узнайте, как планеты влияют на вашу жизнь прямо сейчас. Отслеживайте важные астрологические события."
            media={{ webm: "/planet.webm", mp4: "/planet.mp4" }}
            imageAlt="Транзиты анимация"
        />
    );
};
