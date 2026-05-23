'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const ZODIAC_SIGNS = [
    { id: 'aries', name: 'Овен', icon: '♈' },
    { id: 'taurus', name: 'Телец', icon: '♉' },
    { id: 'gemini', name: 'Близнецы', icon: '♊' },
    { id: 'cancer', name: 'Рак', icon: '♋' },
    { id: 'leo', name: 'Лев', icon: '♌' },
    { id: 'virgo', name: 'Дева', icon: '♍' },
    { id: 'libra', name: 'Весы', icon: '♎' },
    { id: 'scorpio', name: 'Скорпион', icon: '♏' },
    { id: 'sagittarius', name: 'Стрелец', icon: '♐' },
    { id: 'capricorn', name: 'Козерог', icon: '♑' },
    { id: 'aquarius', name: 'Водолей', icon: '♒' },
    { id: 'pisces', name: 'Рыбы', icon: '♓' },
];

interface HoroscopeQuickViewProps {
    showRegisterPrompt?: boolean;
    defaultSign?: string;
}

export const HoroscopeQuickView = ({
    showRegisterPrompt = false,
    defaultSign
}: HoroscopeQuickViewProps) => {
    const [selectedSign, setSelectedSign] = useState<string | null>(defaultSign || null);
    const [horoscope, setHoroscope] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSignClick = async (signId: string) => {
        setSelectedSign(signId);
        setLoading(true);

        try {
            const response = await fetch(`/api/horoscope/daily/${signId}`);
            const data = await response.json();

            setHoroscope(data.text);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch horoscope:', error);
            setLoading(false);
        }
    };

    return (
        <div className="horoscope-quick">
            <div className="zodiac-grid">
                {ZODIAC_SIGNS.map((sign) => (
                    <motion.button
                        key={sign.id}
                        className={`zodiac-button ${selectedSign === sign.id ? 'active' : ''}`}
                        onClick={() => handleSignClick(sign.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        disabled={loading}
                    >
                        <span className="zodiac-icon">{sign.icon}</span>
                        <span className="zodiac-name">{sign.name}</span>
                    </motion.button>
                ))}
            </div>

            {loading && (
                <div className="loading-spinner">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        ⏳
                    </motion.div>
                    <p>Загрузка...</p>
                </div>
            )}

            {horoscope && !loading && (
                <motion.div
                    className="horoscope-result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <h4>Гороскоп на сегодня</h4>
                    <p className="horoscope-text">{horoscope}</p>

                    {showRegisterPrompt ? (
                        <div className="register-prompt">
                            <p>Хотите недельный и месячный прогноз?</p>
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
                            onClick={() => window.location.href = '/services/horoscope'}
                        >
                            Подробный прогноз →
                        </button>
                    )}
                </motion.div>
            )}
        </div>
    );
};
