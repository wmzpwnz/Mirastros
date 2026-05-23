'use client';

import React, { useState } from 'react';
import { ServiceSection } from './ServiceSection';
import { DemoModal } from '../ui/DemoModal';
import { NumerologyCalculator } from '../interactive/NumerologyCalculator';

interface NumerologySectionProps {
    id?: string;
}

export const NumerologySection = ({ id }: NumerologySectionProps) => {
    const [showDemo, setShowDemo] = useState(false);

    return (
        <>
            <ServiceSection
                id={id}
                badge="ЧИСЛА"
                title="Нумерология"
                description="Раскройте тайны чисел и их влияние на вашу судьбу. Узнайте свое число жизненного пути."
                media={{ webm: "/numer.webm", mp4: "/numer.mp4" }}
                imageAlt="Нумерология анимация"
            />

            <DemoModal
                isOpen={showDemo}
                onClose={() => setShowDemo(false)}
                title="Число судьбы"
            >
                <NumerologyCalculator showRegisterPrompt={true} />
            </DemoModal>
        </>
    );
};
