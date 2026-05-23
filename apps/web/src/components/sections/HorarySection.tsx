import React from 'react';
import { ServiceSection } from './ServiceSection';

interface HorarySectionProps {
    id?: string;
}

export const HorarySection: React.FC<HorarySectionProps> = ({ id }) => {
    return (
        <ServiceSection
            id={id}
            badge="ХОРАРНАЯ АСТРОЛОГИЯ"
            title="Ответы на вопросы"
            description="Получите точный ответ на конкретный вопрос. Астрология момента вопроса."
            media={{ webm: "/horar.webm", mp4: "/horar.mp4" }}
            imageAlt="Хорарная астрология анимация"
        />
    );
};
