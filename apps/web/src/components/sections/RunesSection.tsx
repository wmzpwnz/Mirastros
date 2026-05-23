'use client';

import React, { useState } from 'react';
import { ServiceSection } from './ServiceSection';
import { DemoModal } from '../ui/DemoModal';
import { RuneCast } from '../interactive/RuneCast';

interface RunesSectionProps {
    id?: string;
}

export const RunesSection = ({ id }: RunesSectionProps) => {
    const [showDemo, setShowDemo] = useState(false);

    return (
        <>
            <ServiceSection
                id={id}
                badge="ДРЕВНИЕ СИМВОЛЫ"
                title="Руны"
                description="Древнескандинавская система гадания. Получите мудрость предков через священные символы."
                media={{ webm: "/runes.webm", mp4: "/runes.mp4" }}
                imageAlt="Руны анимация"
            />

            <DemoModal
                isOpen={showDemo}
                onClose={() => setShowDemo(false)}
                title="Руна дня"
            >
                <RuneCast showRegisterPrompt={true} />
            </DemoModal>
        </>
    );
};
