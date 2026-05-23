import React from 'react';
import { ServiceSection } from './ServiceSection';

interface SynastrySectionProps {
    id?: string;
}

export const SynastrySection: React.FC<SynastrySectionProps> = ({ id }) => {
    return (
        <ServiceSection
            id={id}
            badge="Совместимость партнеров"
            title="Синастрия"
            description="Астрологический анализ ваших отношений. Узнайте о гармонии и вызовах в вашей паре."
            media={{ webm: "/sinastr.webm", mp4: "/sinastr.mp4" }}
            imageAlt="Синастрия анимация"
        />
    );
};
