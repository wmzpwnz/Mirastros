'use client';

import React, { useState } from 'react';
import { ServiceSection } from './ServiceSection';
import { DemoModal } from '../ui/DemoModal';
import { TarotCardPicker } from '../interactive/TarotCardPicker';

interface TarotSectionProps {
    id?: string;
}

export const TarotSection = ({ id }: TarotSectionProps) => {
    const [showDemo, setShowDemo] = useState(false);

    return (
        <>
            <ServiceSection
                id={id}
                badge="МИСТИКА"
                title="Таро"
                description="Древнее искусство предсказания через символы карт. Откройте тайны прошлого, настоящего и будущего."
                media={{ webm: "/taro.webm", mp4: "/taro.mp4" }}
                imageAlt="Таро анимация"
            />

            <DemoModal
                isOpen={showDemo}
                onClose={() => setShowDemo(false)}
                title="Карта дня Таро"
            >
                <TarotCardPicker showRegisterPrompt={true} />
            </DemoModal>
        </>
    );
};
