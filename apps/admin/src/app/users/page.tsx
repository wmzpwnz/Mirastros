'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Input, Button, Select, Table, Modal, Stack, Card, Badge } from '@mirastros-universal/design-system';
import { adminApi } from '../../services/api';
import type { User } from '../../types';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTier, setFilterTier] = useState<string>('all');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showDetail, setShowDetail] = useState(false);
    const [page, setPage] = useState(0);
    const [limit] = useState(20);

    useEffect(() => {
        fetchUsers();
    }, [filterTier, page]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getUsers({
                skip: page * limit,
                limit,
                search: searchQuery || undefined,
                subscriptionTier: filterTier !== 'all' ? filterTier : undefined,
            });
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserDetail = async (userId: string) => {
        try {
            const data = await adminApi.getUser(userId);
            setSelectedUser(data);
            setShowDetail(true);
        } catch (error) {
            console.error('Failed to fetch user detail:', error);
        }
    };

    const handleSearch = () => {
        setPage(0);
        fetchUsers();
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Удалить этого пользователя? Действие нельзя отменить.')) {
            return;
        }
        
        try {
            await adminApi.deleteUser(userId);
            alert('Пользователь удалён');
            fetchUsers();
            setShowDetail(false);
        } catch (error: any) {
            alert('Ошибка: ' + (error.message || 'Unknown error'));
        }
    };

    const getTierBadge = (tier?: string | null) => {
        const t = String(tier ?? 'freemium').toLowerCase();
        switch (t) {
            case 'freemium': return { icon: '🆓', label: 'Freemium' };
            case 'premium': return { icon: '⭐', label: 'Premium' };
            case 'platinum': return { icon: '💎', label: 'Platinum' };
            default: return { icon: '', label: tier ?? '—' };
        }
    };

    return (
        <AdminLayout>
            <Stack gap="8">
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-cinzel text-gold mb-2">Пользователи</h1>
                    <p className="text-silver/60">Управление пользователями и подписками</p>
                </div>

                {/* Search and Filter */}
                <Card variant="elevated">
                    <div className="flex gap-4">
                        <Input
                            type="text"
                            placeholder="Поиск по email или имени..."
                            value={searchQuery}
                            onChange={(value) => setSearchQuery(value ?? '')}
                            className="flex-1"
                        />
                        <Button variant="primary" onClick={handleSearch}>
                            Поиск
                        </Button>
                        <Select
                            options={[
                                { value: 'all', label: 'Все тарифы' },
                                { value: 'freemium', label: 'Freemium' },
                                { value: 'premium', label: 'Premium' },
                                { value: 'platinum', label: 'Platinum' },
                            ]}
                            value={filterTier}
                            onChange={(value) => {
                                setFilterTier(String(value));
                                setPage(0);
                            }}
                            placeholder="Тариф"
                        />
                    </div>
                </Card>

                {/* Users List */}
                <Card variant="elevated">
                    <h2 className="text-2xl font-cinzel text-gold mb-6">Список пользователей</h2>
                    
                    {loading ? (
                        <div className="text-center py-8 text-silver/60">Загрузка...</div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-8 text-silver/60">Пользователи не найдены</div>
                    ) : (
                        <>
                            <Stack gap="3">
                                {users.map((user) => (
                                    <div
                                        key={user.id}
                                        onClick={() => fetchUserDetail(user.id)}
                                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{getTierBadge(user.subscriptionTier).icon}</span>
                                                <div>
                                                    <h3 className="text-silver font-medium">{user.fullName || user.email || '—'}</h3>
                                                    <p className="text-xs text-silver/60">{user.email || '—'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="primary">
                                                {getTierBadge(user.subscriptionTier).label}
                                            </Badge>
                                            <p className="text-xs text-silver/60 mt-1">
                                                Зарегистрирован: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </Stack>

                            {/* Pagination */}
                            <div className="flex justify-center gap-4 mt-6">
                                <Button
                                    variant="secondary"
                                    onClick={() => setPage(Math.max(0, page - 1))}
                                    disabled={page === 0}
                                >
                                    Назад
                                </Button>
                                <span className="px-4 py-2 text-silver">Стр. {page + 1}</span>
                                <Button
                                    variant="secondary"
                                    onClick={() => setPage(page + 1)}
                                    disabled={users.length < limit}
                                >
                                    Вперёд
                                </Button>
                            </div>
                        </>
                    )}
                </Card>
            </Stack>

            {/* User Detail Modal */}
            {showDetail && selectedUser && (
                <Modal
                    isOpen={showDetail}
                    onClose={() => setShowDetail(false)}
                    title="Карточка пользователя"
                    size="lg"
                >
                    <Stack gap="6">
                        <div>
                            <h3 className="text-lg font-semibold text-turquoise mb-3">Основное</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-silver/60">ID:</span>
                                    <span className="text-silver font-mono text-xs">{selectedUser.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-silver/60">Имя:</span>
                                    <span className="text-silver">{selectedUser.fullName || selectedUser.email || '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-silver/60">Email:</span>
                                    <span className="text-silver">{selectedUser.email || '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-silver/60">Подписка:</span>
                                    <Badge variant="primary">
                                        {getTierBadge(selectedUser.subscriptionTier).label}
                                    </Badge>
                                </div>
                                {selectedUser.subscriptionExpires && (
                                    <div className="flex justify-between">
                                        <span className="text-silver/60">До:</span>
                                        <span className="text-silver">
                                            {new Date(selectedUser.subscriptionExpires).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {selectedUser.birthDate && (
                            <div>
                                <h3 className="text-lg font-semibold text-turquoise mb-3">Дата рождения</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-silver/60">Дата:</span>
                                        <span className="text-silver">{selectedUser.birthDate}</span>
                                    </div>
                                    {selectedUser.birthTime && (
                                        <div className="flex justify-between">
                                            <span className="text-silver/60">Время:</span>
                                            <span className="text-silver">{selectedUser.birthTime}</span>
                                        </div>
                                    )}
                                    {selectedUser.zodiacSign && (
                                        <div className="flex justify-between">
                                            <span className="text-silver/60">Знак зодиака:</span>
                                            <span className="text-silver">{selectedUser.zodiacSign}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div>
                            <h3 className="text-lg font-semibold text-turquoise mb-3">Соцсети</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-silver/60">Google:</span>
                                    <span className="text-silver">{selectedUser.googleId || '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-silver/60">Apple:</span>
                                    <span className="text-silver">{selectedUser.appleId || '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-silver/60">Telegram:</span>
                                    <span className="text-silver">{selectedUser.telegramId || '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-silver/60">VK:</span>
                                    <span className="text-silver">{selectedUser.vkId || '—'}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-turquoise mb-3">Активность</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-silver/60">Создан:</span>
                                    <span className="text-silver">
                                        {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : '—'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-silver/60">Обновлён:</span>
                                    <span className="text-silver">
                                        {selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleString() : '—'}
                                    </span>
                                </div>
                                {selectedUser.lastLogin && (
                                    <div className="flex justify-between">
                                        <span className="text-silver/60">Последний вход:</span>
                                        <span className="text-silver">
                                            {new Date(selectedUser.lastLogin).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-white/10">
                            <Button
                                variant="danger"
                                onClick={() => handleDeleteUser(selectedUser.id)}
                                className="flex-1"
                            >
                                Удалить пользователя
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => setShowDetail(false)}
                                className="flex-1"
                            >
                                Закрыть
                            </Button>
                        </div>
                    </Stack>
                </Modal>
            )}
        </AdminLayout>
    );
}
