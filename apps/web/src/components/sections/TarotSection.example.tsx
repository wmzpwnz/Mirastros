'use client';

import React, { useState } from 'react';
import { DemoModal } from '../ui/DemoModal';
import { TarotCardPicker } from '../interactive/TarotCardPicker';
import { useSplitting } from '../../hooks/useSplitting';

interface TarotSectionProps {
    id?: string;
}

/**
 * ПРИМЕР: Вариант 1 - Split-screen (текст слева, GIF справа)
 * Подходит для секций, которые появляются слева в туннеле
 */
export const TarotSectionVariant1 = ({ id }: TarotSectionProps) => {
    const [showDemo, setShowDemo] = useState(false);
    const titleRef = useSplitting('words');
    const descriptionRef = useSplitting('words');

    return (
        <section 
            className="mira-section" 
            id={id}
        >
            <div className="section-content">
                <div className="section-layout section-layout-split">
                    {/* Текст слева */}
                    <div className="section-text">
                        <div className="section-category">МИСТИКА</div>
                        <h2 className="section-title" ref={titleRef as any} data-splitting>
                            Таро
                        </h2>
                        <p className="section-description" ref={descriptionRef as any} data-splitting>
                            Древнее искусство предсказания через символы карт.
                            Откройте тайны прошлого, настоящего и будущего.
                        </p>
                        <button
                            className="btn-gradient-gold"
                            onClick={() => setShowDemo(true)}
                            style={{ maxWidth: '300px', marginTop: '1rem' }}
                        >
                            Попробовать сейчас
                        </button>
                    </div>
                    
                    {/* GIF справа */}
                    <div className="section-media">
                        <img src="/zodiacCircle.png" alt="Таро анимация" />
                    </div>
                </div>
            </div>

            <DemoModal
                isOpen={showDemo}
                onClose={() => setShowDemo(false)}
                title="Карта дня Таро"
            >
                <TarotCardPicker showRegisterPrompt={true} />
            </DemoModal>
        </section>
    );
};

/**
 * ПРИМЕР: Вариант 3 - Overlay (текст поверх GIF)
 * Создает мистический эффект глубины
 */
export const TarotSectionVariant3 = ({ id }: TarotSectionProps) => {
    const [showDemo, setShowDemo] = useState(false);
    const titleRef = useSplitting('words');
    const descriptionRef = useSplitting('words');

    return (
        <section 
            className="mira-section" 
            id={id}
        >
            <div className="section-content">
                <div className="section-layout section-layout-overlay">
                    {/* GIF с затемнением */}
                    <div className="section-media">
                        <img src="/zodiacCircle.png" alt="Таро анимация" />
                    </div>
                    
                    {/* Текст поверх GIF */}
                    <div className="section-text">
                        <div className="section-category">МИСТИКА</div>
                        <h2 className="section-title" ref={titleRef as any} data-splitting>
                            Таро
                        </h2>
                        <p className="section-description" ref={descriptionRef as any} data-splitting>
                            Древнее искусство предсказания через символы карт.
                            Откройте тайны прошлого, настоящего и будущего.
                        </p>
                        <button
                            className="btn-gradient-gold"
                            onClick={() => setShowDemo(true)}
                            style={{ maxWidth: '300px', marginTop: '1rem' }}
                        >
                            Попробовать сейчас
                        </button>
                    </div>
                </div>
            </div>

            <DemoModal
                isOpen={showDemo}
                onClose={() => setShowDemo(false)}
                title="Карта дня Таро"
            >
                <TarotCardPicker showRegisterPrompt={true} />
            </DemoModal>
        </section>
    );
};

/**
 * ПРИМЕР: Вариант 5 - Асимметричный (текст в углу, GIF в центре)
 * Создает динамику и движение
 */
export const TarotSectionVariant5 = ({ id }: TarotSectionProps) => {
    const [showDemo, setShowDemo] = useState(false);
    const titleRef = useSplitting('words');
    const descriptionRef = useSplitting('words');

    return (
        <section 
            className="mira-section" 
            id={id}
        >
            <div className="section-content">
                <div className="section-layout section-layout-asymmetric">
                    {/* Текст в левом верхнем углу */}
                    <div className="section-text">
                        <div className="section-category">МИСТИКА</div>
                        <h2 className="section-title" ref={titleRef as any} data-splitting>
                            Таро
                        </h2>
                        <p className="section-description" ref={descriptionRef as any} data-splitting>
                            Древнее искусство предсказания через символы карт.
                            Откройте тайны прошлого, настоящего и будущего.
                        </p>
                        <button
                            className="btn-gradient-gold"
                            onClick={() => setShowDemo(true)}
                            style={{ maxWidth: '300px', marginTop: '1rem' }}
                        >
                            Попробовать сейчас
                        </button>
                    </div>
                    
                    {/* GIF в центре */}
                    <div className="section-media">
                        <img src="/zodiacCircle.png" alt="Таро анимация" />
                    </div>
                </div>
            </div>

            <DemoModal
                isOpen={showDemo}
                onClose={() => setShowDemo(false)}
                title="Карта дня Таро"
            >
                <TarotCardPicker showRegisterPrompt={true} />
            </DemoModal>
        </section>
    );
};





















