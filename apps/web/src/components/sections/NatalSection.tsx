import React from 'react';

interface NatalSectionProps {
    id?: string;
}

export const NatalSection: React.FC<NatalSectionProps> = ({ id }) => {
    return (
        <section className="mira-section mira-natal" id={id}>
            <div className="section-content">
                <div className="section-layout">
                    <span className="section-category">Натальная карта</span>
                    <h2 className="section-title">Астрологический анализ</h2>
                    <p className="section-description">Детальный анализ вашей натальной карты</p>
                    <div className="section-icon-placeholder">⭐</div>
                </div>
            </div>
        </section>
    );
};
