import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';

interface HoroscopeSectionProps {
    id?: string;
}

export const HoroscopeSection: React.FC<HoroscopeSectionProps> = ({ id }) => {
    const [horoscope, setHoroscope] = useState<string>('Загрузка предсказания...');

    useEffect(() => {
        const fetchHoroscope = async () => {
            const data = await api.getHoroscope('Aries');
            setHoroscope(data.response);
        };
        fetchHoroscope();
    }, []);

    return (
        <section className="mira-section mira-horoscope" id={id}>
            <div className="section-content">
                <div className="section-layout">
                    <span className="section-category">Гороскоп</span>
                    <h2 className="section-title">Ежедневные прогнозы</h2>
                    <p className="section-description">{horoscope}</p>
                    <div className="section-icon-placeholder">♈</div>
                </div>
            </div>
        </section>
    );
};
