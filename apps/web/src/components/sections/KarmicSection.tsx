import React from 'react';
import { ServiceSection } from './ServiceSection';

interface KarmicSectionProps {
    id?: string;
}

export const KarmicSection: React.FC<KarmicSectionProps> = ({ id }) => {
    return (
        <ServiceSection
            id={id}
            badge="КАРМИЧЕСКИЕ ЗАДАЧИ"
            title="Путь души"
            description="Раскройте кармические уроки вашей жизни. Узнайте о связях из прошлых воплощений."
            media={{ webm: "/karma.webm", mp4: "/karma.mp4" }}
            imageAlt="Кармические задачи путь души анимация"
        />
    );
};
