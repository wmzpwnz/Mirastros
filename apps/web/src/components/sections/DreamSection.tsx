import React from 'react';
import { ServiceSection } from './ServiceSection';

interface DreamSectionProps {
    id?: string;
}

export const DreamSection: React.FC<DreamSectionProps> = ({ id }) => {
    return (
        <ServiceSection
            id={id}
            badge="СНОВИДЕНИЯ"
            title="Толкование снов"
            description="Узнайте, что говорят вам ваши сны. Расшифруйте послания из подсознания."
            media={{ webm: "/sonnik.webm", mp4: "/sonnik.mp4" }}
            imageAlt="Толкование снов анимация"
        />
    );
};
