import React from 'react';
import { ServiceSection } from './ServiceSection';

interface IChingSectionProps {
    id?: string;
}

export const IChingSection: React.FC<IChingSectionProps> = ({ id }) => {
    return (
        <ServiceSection
            id={id}
            badge="И-ЦЗИН"
            title="Книга перемен"
            description="Древнекитайская мудрость для современных решений. Получите ответы через гексаграммы."
            media={{ webm: "/ci.webm", mp4: "/ci.mp4" }}
            imageAlt="И-Цзин анимация"
        />
    );
};
