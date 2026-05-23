'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Card, Grid, Stack, Button, ProgressBar } from '@mirastros-universal/design-system';
import { adminApi } from '../../services/api';

interface RegistrationStats {
    total: number;
    daily: Array<{ date: string; count: number }>;
    start_date: string;
    end_date: string;
}

interface ConversionStats {
    total_registrations: number;
    total_conversions: number;
    overall_conversion_rate: number;
    by_tier: {
        [key: string]: {
            count: number;
            conversion_rate: number;
        };
    };
}

interface ServiceUsageStats {
    total_usage: number;
    services: Array<{
        service: string;
        count: number;
        avg_response_time_ms: number | null;
    }>;
}

interface AIPerformanceStats {
    total_requests: number;
    avg_response_time_ms: number | null;
    min_response_time_ms: number | null;
    max_response_time_ms: number | null;
    p95_response_time_ms: number | null;
    total_tokens_used: number;
}

export default function AnalyticsPage() {
    const [registrations, setRegistrations] = useState<RegistrationStats | null>(null);
    const [conversions, setConversions] = useState<ConversionStats | null>(null);
    const [serviceUsage, setServiceUsage] = useState<ServiceUsageStats | null>(null);
    const [aiPerformance, setAIPerformance] = useState<AIPerformanceStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const [regData, convData, serviceData, aiData] = await Promise.all([
                adminApi.getAnalytics('registrations').catch(() => null),
                adminApi.getAnalytics('conversions').catch(() => null),
                adminApi.getAnalytics('service-usage').catch(() => null),
                adminApi.getAnalytics('ai-performance').catch(() => null),
            ]);
            
            if (regData) setRegistrations(regData);
            if (convData) setConversions(convData);
            if (serviceData) setServiceUsage(serviceData);
            if (aiData) setAIPerformance(aiData);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            setError('Не удалось загрузить аналитику');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="text-4xl mb-4">⏳</div>
                        <p className="text-silver/60">Загрузка аналитики...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="text-4xl mb-4">⚠️</div>
                        <p className="text-red-400 mb-4">{error}</p>
                        <Button variant="primary" onClick={fetchAnalytics}>
                            Повторить
                        </Button>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <Stack gap="8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-cinzel text-gold mb-2">Аналитика</h1>
                        <p className="text-silver/60">Статистика и производительность</p>
                    </div>
                    <Button variant="primary" onClick={fetchAnalytics}>
                        🔄 Обновить
                    </Button>
                </div>

                {/* Registration Stats */}
                {registrations && (
                    <Grid columns={{ mobile: 1, tablet: 2 }} gap="6">
                        <Card variant="elevated">
                            <h2 className="text-2xl font-cinzel text-gold mb-4">Регистрации</h2>
                            <p className="text-4xl font-bold text-gold mb-2">{registrations.total}</p>
                            <p className="text-sm text-silver/60">За 30 дней</p>
                        </Card>
                        
                        {conversions && (
                            <Card variant="elevated">
                                <h2 className="text-2xl font-cinzel text-gold mb-4">Конверсия</h2>
                                <p className="text-4xl font-bold text-turquoise mb-2">
                                    {conversions.overall_conversion_rate}%
                                </p>
                                <p className="text-sm text-silver/60">
                                    {conversions.total_conversions} / {conversions.total_registrations} конверсий
                                </p>
                            </Card>
                        )}
                    </Grid>
                )}

                {/* Conversion by Tier */}
                {conversions && Object.keys(conversions.by_tier).length > 0 && (
                    <Card variant="elevated">
                        <h2 className="text-2xl font-cinzel text-gold mb-6">Конверсия по тарифам</h2>
                        <Grid columns={{ mobile: 1, tablet: 2 }} gap="6">
                            {Object.entries(conversions.by_tier).map(([tier, stats]) => (
                                <div key={tier} className="border border-gold/20 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-lg font-semibold text-silver capitalize">
                                            {tier === 'premium' ? '⭐ Premium' : '💎 Platinum'}
                                        </span>
                                        <span className="text-2xl font-bold text-gold">
                                            {stats.conversion_rate.toFixed(1)}%
                                        </span>
                                    </div>
                                    <p className="text-sm text-silver/60">{stats.count} конверсий</p>
                                </div>
                            ))}
                        </Grid>
                    </Card>
                )}

                {/* Service Usage */}
                {serviceUsage && serviceUsage.services.length > 0 && (
                    <Card variant="elevated">
                        <h2 className="text-2xl font-cinzel text-gold mb-6">Использование сервисов</h2>
                        <p className="text-sm text-silver/60 mb-4">
                            Всего запросов: {serviceUsage.total_usage}
                        </p>
                        <Stack gap="4">
                            {serviceUsage.services.slice(0, 10).map((service) => {
                                const percentage = (service.count / serviceUsage.total_usage) * 100;
                                return (
                                    <div key={service.service}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-silver capitalize">
                                                {service.service.replace('_', ' ')}
                                            </span>
                                            <div className="text-right">
                                                <span className="text-silver/60">{service.count} запросов</span>
                                                {service.avg_response_time_ms && (
                                                    <span className="text-xs text-turquoise ml-2">
                                                        ~{service.avg_response_time_ms}ms
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <ProgressBar value={percentage} />
                                    </div>
                                );
                            })}
                        </Stack>
                    </Card>
                )}

                {/* AI Performance */}
                {aiPerformance && aiPerformance.total_requests > 0 && (
                    <Card variant="elevated">
                        <h2 className="text-2xl font-cinzel text-gold mb-6">Метрики AI</h2>
                        <Grid columns={{ mobile: 2, tablet: 4 }} gap="6">
                            <div>
                                <p className="text-sm text-silver/60 mb-2">Всего запросов</p>
                                <p className="text-2xl font-bold text-gold">{aiPerformance.total_requests}</p>
                            </div>
                            <div>
                                <p className="text-sm text-silver/60 mb-2">Ср. время ответа</p>
                                <p className="text-2xl font-bold text-turquoise">
                                    {aiPerformance.avg_response_time_ms || 0}ms
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-silver/60 mb-2">P95 время ответа</p>
                                <p className="text-2xl font-bold text-purple">
                                    {aiPerformance.p95_response_time_ms || 0}ms
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-silver/60 mb-2">Токенов всего</p>
                                <p className="text-2xl font-bold text-silver">
                                    {aiPerformance.total_tokens_used.toLocaleString()}
                                </p>
                            </div>
                        </Grid>
                    </Card>
                )}
            </Stack>
        </AdminLayout>
    );
}
