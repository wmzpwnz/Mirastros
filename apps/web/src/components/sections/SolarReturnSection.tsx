import React from 'react';
import { ServiceSection } from './ServiceSection';

interface SolarReturnSectionProps {
    id?: string;
}

export const SolarReturnSection: React.FC<SolarReturnSectionProps> = ({ id }) => {
    return (
        <ServiceSection
            id={id}
            badge="СОЛЯР"
            title="Прогноз на год"
            description="Узнайте, что принесет вам новый год жизни. Астрологический прогноз на год вперед."
            media={{ webm: "/solar.webm", mp4: "/solar.mp4" }}
            imageAlt="Соляр анимация"
        />
    );
};
