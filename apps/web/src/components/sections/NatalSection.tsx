import React from 'react';
import { ServiceSection } from './ServiceSection';

interface NatalSectionProps {
    id?: string;
}

export const NatalSection: React.FC<NatalSectionProps> = ({ id }) => {
    return (
        <ServiceSection
            id={id}
            badge="Астрологический анализ"
            title="Натальная карта"
            description="Детальный анализ вашей натальной карты. Узнайте о влиянии планет в момент вашего рождения."
            media={{ webm: "/natal.webm", mp4: "/natal.mp4" }}
            imageAlt="Натальная карта анимация"
        />
    );
};
