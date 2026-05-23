'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TarotCardPicker } from './TarotCardPicker';
import { HoroscopeQuickView } from './HoroscopeQuickView';
import { NumerologyCalculator } from './NumerologyCalculator';
import { RuneCast } from './RuneCast';

interface QuickActionBarProps {
    onClose: () => void;
    showRegisterPrompt?: boolean;
}

const quickActions = [
    {
        id: 'tarot',
        name: 'Карта дня',
        icon: '🔮',
        description: 'Вытяните карту Таро'
    },
    {
        id: 'horoscope',
        name: 'Гороскоп',
        icon: '⭐',
        description: 'Прогноз на сегодня'
    },
    {
        id: 'numerology',
        name: 'Число судьбы',
        icon: '🔢',
        description: 'Рассчитайте свое число'
    },
    {
        id: 'rune',
        name: 'Руна дня',
        icon: 'ᚱ',
        description: 'Бросьте руну'
    },
];

export const QuickActionBar = ({
    onClose,
    showRegisterPrompt = false
}: QuickActionBarProps) => {
    const [activeAction, setActiveAction] = useState<string | null>(null);

    const renderComponent = () => {
        switch (activeAction) {
            case 'tarot':
                return <TarotCardPicker showRegisterPrompt={showRegisterPrompt} />;
            case 'horoscope':
                return <HoroscopeQuickView showRegisterPrompt={showRegisterPrompt} />;
            case 'numerology':
                return <NumerologyCalculator showRegisterPrompt={showRegisterPrompt} />;
            case 'rune':
                return <RuneCast showRegisterPrompt={showRegisterPrompt} />;
            default:
                return null;
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                className="quick-action-bar"
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                transition={{ duration: 0.3 }}
            >
                <div className="quick-actions-header">
                    <h3>Попробуйте прямо сейчас</h3>
                    <button
                        onClick={onClose}
                        className="close-button"
                        aria-label="Закрыть"
                    >
                        ✕
                    </button>
                </div>

                {!activeAction ? (
                    <motion.div
                        className="quick-actions-grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {quickActions.map((action, index) => (
                            <motion.button
                                key={action.id}
                                className="quick-action-button"
                                onClick={() => setActiveAction(action.id)}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span className="action-icon">{action.icon}</span>
                                <span className="action-name">{action.name}</span>
                                <span className="action-description">{action.description}</span>
                            </motion.button>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        className="action-demo"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <button
                            onClick={() => setActiveAction(null)}
                            className="back-button"
                        >
                            ← Назад к выбору
                        </button>
                        {renderComponent()}
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );
};
