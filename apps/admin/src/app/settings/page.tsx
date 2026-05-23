'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Card, Stack, Button, Badge } from '@mirastros-universal/design-system';
import { useAuth } from '../../contexts/AuthContext';
import { adminApi } from '../../services/api';

export default function SettingsPage() {
    const { user } = useAuth();
    const [cacheStats, setCacheStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCacheStats();
    }, []);

    const fetchCacheStats = async () => {
        try {
            const stats = await adminApi.getCacheStats();
            setCacheStats(stats);
        } catch (error) {
            console.error('Failed to fetch cache stats:', error);
        }
    };

    const handleClearCache = async () => {
        if (!confirm('Очистить весь кэш? Действие нельзя отменить.')) {
            return;
        }

        try {
            setLoading(true);
            await adminApi.clearCache();
            alert('Кэш очищен.');
            await fetchCacheStats();
        } catch (error: any) {
            alert('Ошибка: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <Stack gap="8">
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-cinzel text-gold mb-2">Настройки</h1>
                    <p className="text-silver/60">Конфигурация панели администратора</p>
                </div>

                {user && (
                    <Card variant="elevated">
                        <h2 className="text-2xl font-cinzel text-gold mb-6">Текущий администратор</h2>
                        <Stack gap="4">
                            <div className="flex items-center justify-between">
                                <span className="text-silver/60">Email:</span>
                                <span className="text-gold font-medium">{user.email}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-silver/60">Имя:</span>
                                <span className="text-silver">{user.fullName}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-silver/60">Тариф:</span>
                                <Badge variant="primary">{user.subscriptionTier}</Badge>
                            </div>
                            {user.createdAt && (
                                <div className="flex items-center justify-between">
                                    <span className="text-silver/60">Аккаунт создан:</span>
                                    <span className="text-silver">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </Stack>
                    </Card>
                )}

                {/* Admin Configuration Info */}
                <Card variant="elevated">
                    <h2 className="text-2xl font-cinzel text-gold mb-6">Доступ администратора</h2>
                    <Stack gap="4">
                        <div className="p-4 bg-white/5 rounded-lg">
                            <p className="text-sm text-silver/60 mb-2">
                                Доступ задаётся переменной <code className="text-turquoise">ADMIN_EMAILS</code> в backend.
                            </p>
                            <p className="text-sm text-silver/60">
                                В панель могут входить только пользователи с email из списка <code className="text-turquoise">ADMIN_EMAILS</code>.
                            </p>
                        </div>
                        <div className="text-xs text-silver/40 mt-2">
                            По умолчанию: admin@mirastros.com
                        </div>
                    </Stack>
                </Card>

                <Card variant="elevated">
                    <h2 className="text-2xl font-cinzel text-gold mb-6">Кэш</h2>
                    <Stack gap="4">
                        {cacheStats && (
                            <div className="p-4 bg-white/5 rounded-lg">
                                <p className="text-sm text-silver/60 mb-2">Статистика кэша:</p>
                                <pre className="text-xs text-silver/80 font-mono overflow-auto">
                                    {JSON.stringify(cacheStats, null, 2)}
                                </pre>
                            </div>
                        )}
                        <Button
                            variant="danger"
                            onClick={handleClearCache}
                            disabled={loading}
                        >
                            {loading ? 'Очистка...' : 'Очистить весь кэш'}
                        </Button>
                        <p className="text-xs text-silver/60">
                            Очистка удалит все кэшированные данные (гороскопы, профили, каталог).
                        </p>
                    </Stack>
                </Card>

                <Card variant="elevated">
                    <h2 className="text-2xl font-cinzel text-gold mb-6">API</h2>
                    <Stack gap="4">
                        <div className="flex items-center justify-between">
                            <span className="text-silver/60">URL API:</span>
                            <span className="text-silver font-mono text-sm">
                                {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-silver/60">Документация:</span>
                            <a
                                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/docs`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-turquoise hover:underline"
                            >
                                Swagger UI
                            </a>
                        </div>
                    </Stack>
                </Card>
            </Stack>
        </AdminLayout>
    );
}
