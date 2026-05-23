'use client';

import React, { useState } from 'react';
import { ServiceSection } from './ServiceSection';
import { DemoModal } from '../ui/DemoModal';
import { HoroscopeQuickView } from '../interactive/HoroscopeQuickView';

interface HoroscopeSectionProps {
    id?: string;
}

export const HoroscopeSection = ({ id }: HoroscopeSectionProps) => {
    const [showDemo, setShowDemo] = useState(false);

    return (
        <>
            <ServiceSection
                id={id}
                badge="АСТРОЛОГИЯ"
                title="Гороскоп"
                description="Персональные прогнозы на основе вашего знака зодиака. Узнайте, что готовят для вас звезды."
                media={{ webm: "/horo.webm", mp4: "/horo.mp4" }}
                imageAlt="Гороскоп анимация"
            />

            <DemoModal
                isOpen={showDemo}
                onClose={() => setShowDemo(false)}
                title="Гороскоп на сегодня"
            >
                <HoroscopeQuickView showRegisterPrompt={true} />
            </DemoModal>
        </>
    );
};
