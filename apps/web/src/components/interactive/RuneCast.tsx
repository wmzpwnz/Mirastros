'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface Rune {
    symbol: string;
    name: string;
    meaning: string;
}

interface RuneCastProps {
    showRegisterPrompt?: boolean;
}

export const RuneCast = ({
    showRegisterPrompt = false
}: RuneCastProps) => {
    const [rune, setRune] = useState<Rune | null>(null);
    const [casting, setCasting] = useState(false);

    const castRune = async () => {
        setCasting(true);

        // Анимация броска
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            const response = await fetch('/api/runes/cast');
            const data = await response.json();

            setRune(data);
            setCasting(false);
        } catch (error) {
            console.error('Failed to cast rune:', error);
            setCasting(false);
        }
    };

    return (
        <div className="rune-cast">
            {!rune ? (
                <motion.button
                    className="cast-button"
                    onClick={castRune}
                    disabled={casting}
                    animate={casting ? { rotate: 360 } : {}}
                    transition={{
                        duration: 1.5,
                        repeat: casting ? Infinity : 0,
                        ease: "linear"
                    }}
                    whileHover={!casting ? { scale: 1.05 } : {}}
                    whileTap={!casting ? { scale: 0.95 } : {}}
                >
                    {casting ? '🌀' : '🎲'} {casting ? 'Бросаем...' : 'Бросить руну'}
                </motion.button>
            ) : (
                <motion.div
                    className="rune-result"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.div
                        className="rune-symbol"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    >
                        {rune.symbol}
                    </motion.div>
                    <h4 className="rune-name">{rune.name}</h4>
                    <p className="rune-meaning">{rune.meaning}</p>

                    <button
                        className="btn-link"
                        onClick={() => setRune(null)}
                    >
                        Бросить еще раз
                    </button>

                    {showRegisterPrompt ? (
                        <div className="register-prompt">
                            <p>Хотите полный рунический расклад?</p>
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
                            onClick={() => window.location.href = '/services/runes'}
                        >
                            Полный расклад →
                        </button>
                    )}
                </motion.div>
            )}
        </div>
    );
};
