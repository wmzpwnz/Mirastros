import React from 'react';
import { ServiceSection } from './ServiceSection';

interface MandalaSectionProps {
    id?: string;
}

export const MandalaSection: React.FC<MandalaSectionProps> = ({ id }) => {
    return (
        <ServiceSection
            id={id}
            badge="МАНДАЛА"
            title="Персональная мандала"
            description="Создайте уникальную мандалу вашей судьбы. Визуализация вашего энергетического кода."
            media={{ webm: "/mandala.webm", mp4: "/mandala.mp4" }}
            imageAlt="Мандала анимация"
        />
    );
};
