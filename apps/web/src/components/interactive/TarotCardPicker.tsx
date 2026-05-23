'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface TarotCard {
    id: number;
    name: string;
    meaning: string;
    image?: string;
}

interface TarotCardPickerProps {
    onComplete?: (card: TarotCard) => void;
    showRegisterPrompt?: boolean;
}

export const TarotCardPicker = ({
    onComplete,
    showRegisterPrompt = false
}: TarotCardPickerProps) => {
    const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
    const [loading, setLoading] = useState(false);

    const cards = Array.from({ length: 7 }, (_, i) => ({ id: i }));

    const handleCardClick = async (cardId: number) => {
        setLoading(true);

        try {
            const response = await fetch('/api/tarot/daily');
            const card = await response.json();

            setTimeout(() => {
                setSelectedCard(card);
                setLoading(false);
                onComplete?.(card);
            }, 600);
        } catch (error) {
            console.error('Failed to fetch tarot card:', error);
            setLoading(false);
        }
    };

    return (
        <div className="tarot-picker">
            {!selectedCard ? (
                <div className="card-deck">
                    {cards.map((card) => (
                        <motion.div
                            key={card.id}
                            className="tarot-card-back"
                            onClick={() => !loading && handleCardClick(card.id)}
                            whileHover={!loading ? { scale: 1.05, y: -10 } : {}}
                            whileTap={!loading ? { scale: 0.95 } : {}}
                            style={{ cursor: loading ? 'wait' : 'pointer' }}
                        >
                            <div className="card-pattern">🔮</div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <motion.div
                    className="tarot-result"
                    initial={{ opacity: 0, rotateY: 90 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="card-image">{selectedCard.image || '🎴'}</div>
                    <h3 className="card-name">{selectedCard.name}</h3>
                    <p className="card-meaning">{selectedCard.meaning}</p>

                    {showRegisterPrompt ? (
                        <div className="register-prompt">
                            <p>Хотите полный расклад и историю?</p>
                            <button
                                className="btn-primary"
                                onClick={() => window.location.href = '/auth/register'}
                            >
                                Зарегистрироваться бесплатно
                            </button>
                        </div>
                    ) : (
                        <button
                            className="btn-secondary"
                            onClick={() => window.location.href = '/services/tarot'}
                        >
                            Полный расклад →
                        </button>
                    )}
                </motion.div>
            )}
        </div>
    );
};
