'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button, DatePicker, Label } from '@mirastros-universal/design-system';

interface NumerologyCalculatorProps {
    showRegisterPrompt?: boolean;
}

const LIFE_PATH_MEANINGS: Record<number, string> = {
    1: 'Лидер и первопроходец. Вы независимы, амбициозны и полны решимости.',
    2: 'Миротворец и дипломат. Вы чувствительны, интуитивны и стремитесь к гармонии.',
    3: 'Творец и коммуникатор. Вы креативны, оптимистичны и любите самовыражение.',
    4: 'Строитель и организатор. Вы практичны, надежны и трудолюбивы.',
    5: 'Искатель приключений. Вы свободолюбивы, любопытны и жаждете перемен.',
    6: 'Заботливый и ответственный. Вы любите помогать другим и создавать уют.',
    7: 'Мыслитель и духовный искатель. Вы аналитичны, интуитивны и стремитесь к знаниям.',
    8: 'Достигатель и материалист. Вы амбициозны, практичны и стремитесь к успеху.',
    9: 'Гуманист и идеалист. Вы сострадательны, мудры и стремитесь помогать миру.',
    11: 'Мастер-число. Духовный учитель с высокой интуицией и вдохновением.',
    22: 'Мастер-строитель. Способны воплощать великие идеи в реальность.',
};

export const NumerologyCalculator = ({
    showRegisterPrompt = false
}: NumerologyCalculatorProps) => {
    const [birthDate, setBirthDate] = useState('');
    const [result, setResult] = useState<number | null>(null);
    const [meaning, setMeaning] = useState<string>('');

    const calculateLifePath = (date: string) => {
        const digits = date.replace(/\D/g, '').split('');
        let sum = digits.reduce((acc, d) => acc + parseInt(d), 0);

        while (sum > 9 && sum !== 11 && sum !== 22) {
            sum = sum.toString().split('').reduce((acc, d) => acc + parseInt(d), 0);
        }

        return sum;
    };

    const handleCalculate = () => {
        if (!birthDate) return;

        const number = calculateLifePath(birthDate);
        setResult(number);
        setMeaning(LIFE_PATH_MEANINGS[number] || 'Значение не найдено');
    };

    return (
        <div className="numerology-calc space-y-6">
            <div className="calc-input space-y-4">
                <Label>Дата рождения:</Label>
                <DatePicker
                    value={birthDate ? new Date(`${birthDate}T00:00:00`) : undefined}
                    onChange={(date) => setBirthDate(date.toISOString().slice(0, 10))}
                    maxDate={new Date()}
                />
                <Button
                    onClick={handleCalculate}
                    disabled={!birthDate}
                    className="w-full"
                >
                    Рассчитать
                </Button>
            </div>

            {result && (
                <motion.div
                    className="numerology-result space-y-4 text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="life-path-number text-6xl font-bold text-mirastros-gold">{result}</div>
                    <p className="result-label text-lg font-semibold text-white">Ваше число судьбы</p>
                    <p className="result-meaning text-gray-300">{meaning}</p>

                    {showRegisterPrompt ? (
                        <div className="register-prompt space-y-4">
                            <p className="text-white">Хотите полный нумерологический анализ?</p>
                            <Button
                                onClick={() => window.location.href = '/auth/register'}
                                className="w-full"
                            >
                                Зарегистрироваться бесплатно
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="secondary"
                            onClick={() => window.location.href = '/services/numerology'}
                            className="w-full"
                        >
                            Полный анализ →
                        </Button>
                    )}
                </motion.div>
            )}
        </div>
    );
};
