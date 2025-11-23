import React from 'react';

interface TarotSectionProps {
    id?: string;
}

export const TarotSection: React.FC<TarotSectionProps> = ({ id }) => {
    return (
        <section className="mira-section mira-tarot" id={id}>
            <div className="section-content">
                <div className="section-layout">
                    <span className="section-category">Таро</span>
                    <h2 className="section-title">AI-гадания</h2>
                    <p className="section-description">Персонализированные расклады с искусственным интеллектом</p>
                    <div className="section-icon-placeholder">🔮</div>
                </div>
            </div>
        </section>
    );
};
