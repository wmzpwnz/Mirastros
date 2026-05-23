import React from 'react';
import { ServiceSection } from './ServiceSection';

interface ChakraSectionProps {
    id?: string;
}

export const ChakraSection: React.FC<ChakraSectionProps> = ({ id }) => {
    return (
        <ServiceSection
            id={id}
            badge="Энергетический баланс"
            title="Чакры"
            description="Диагностика и гармонизация ваших энергетических центров. Узнайте состояние ваших чакр."
            media={{ webm: "/chakras.webm", mp4: "/chakras.mp4" }}
            imageAlt="Чакры анимация"
        />
    );
};
