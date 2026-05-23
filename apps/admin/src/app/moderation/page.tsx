'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Button, Card, Stack, Badge, Grid, Modal, Checkbox } from '@mirastros-universal/design-system';
import { adminApi } from '../../services/api';
import type { JournalEntry, ModerationStats } from '../../types';


export default function ModerationPage() {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [stats, setStats] = useState<ModerationStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
    const [showDetail, setShowDetail] = useState(false);

    useEffect(() => {
        fetchEntries();
        fetchStats();
    }, [showFlaggedOnly]);

    const fetchEntries = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getJournalEntries({
                flaggedOnly: showFlaggedOnly,
            });
            setEntries(data);
        } catch (error) {
            console.error('Failed to fetch entries:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await adminApi.getModerationStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleAction = async (entryId: string, action: string, reason?: string) => {
        try {
            await adminApi.moderateJournalEntry(entryId, action, reason);
            alert('Действие выполнено');
            fetchEntries();
            fetchStats();
            setShowDetail(false);
        } catch (error: any) {
            alert('Ошибка: ' + (error.message || 'Unknown error'));
        }
    };

    const getEntryTypeIcon = (type?: string | null) => {
        const t = String(type ?? '').toLowerCase();
        switch (t) {
            case 'dream': return '💭';
            case 'meditation': return '🧘';
            case 'reading': return '🔮';
            case 'reflection': return '📝';
            default: return '📄';
        }
    };

    return (
        <AdminLayout>
            <Stack gap="8">
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-cinzel text-gold mb-2">Модерация</h1>
                    <p className="text-silver/60">Проверка контента пользователей</p>
                </div>

                {stats && (
                    <Grid columns={{ mobile: 1, tablet: 3 }} gap="6">
                        <Card variant="elevated">
                            <p className="text-sm text-silver/60 mb-2">Всего записей</p>
                            <p className="text-3xl font-bold text-gold">{stats.totalJournalEntries}</p>
                        </Card>
                        <Card variant="elevated">
                            <p className="text-sm text-silver/60 mb-2">С флагом</p>
                            <p className="text-3xl font-bold text-red-400">{stats.flaggedEntries}</p>
                        </Card>
                        <Card variant="elevated">
                            <p className="text-sm text-silver/60 mb-2">На проверке</p>
                            <p className="text-3xl font-bold text-yellow-400">{stats.pendingReview}</p>
                        </Card>
                    </Grid>
                )}

                <Card variant="elevated">
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                                checked={showFlaggedOnly}
                                onChange={setShowFlaggedOnly}
                            />
                            <span className="text-silver">Только с флагом</span>
                        </label>
                        <Button
                            variant="primary"
                            onClick={fetchEntries}
                            className="ml-auto"
                        >
                            🔄 Обновить
                        </Button>
                    </div>
                </Card>

                <Card variant="elevated">
                    <h2 className="text-2xl font-cinzel text-gold mb-6">Записи в дневнике</h2>
                    
                    {loading ? (
                        <div className="text-center py-8 text-silver/60">Загрузка...</div>
                    ) : entries.length === 0 ? (
                        <div className="text-center py-8 text-silver/60">Записей нет</div>
                    ) : (
                        <Stack gap="3">
                            {entries.map((entry) => (
                                <div
                                    key={entry.id}
                                    onClick={() => {
                                        setSelectedEntry(entry);
                                        setShowDetail(true);
                                    }}
                                    className="flex items-start justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-2xl">{getEntryTypeIcon((entry as any).entry_type ?? entry.entryType)}</span>
                                            <div>
                                                <h3 className="text-silver font-medium">{entry.title ?? '—'}</h3>
                                                <p className="text-xs text-silver/60">
                                                    {(entry as any).user_email ?? entry.userEmail ?? '—'} • {(entry as any).entry_type ?? entry.entryType ?? '—'} • {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : '—'}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-silver/60 line-clamp-2 ml-11">
                                            {entry.content ?? '—'}
                                        </p>
                                        {entry.tags && entry.tags.length > 0 && (
                                            <div className="flex gap-2 mt-2 ml-11">
                                                {entry.tags.map((tag, idx) => (
                                                    <Badge key={idx} variant="secondary">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {((entry as any).flagged ?? entry.flagged) && (
                                        <Badge variant="danger">
                                            🚩 С флагом
                                        </Badge>
                                    )}
                                </div>
                            ))}
                        </Stack>
                    )}
                </Card>
            </Stack>

            {/* Entry Detail Modal */}
            {showDetail && selectedEntry && (
                <Modal
                    isOpen={showDetail}
                    onClose={() => setShowDetail(false)}
                    title="Просмотр записи"
                    size="lg"
                >
                    <Stack gap="6">
                        {/* Entry Info */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-4xl">{getEntryTypeIcon((selectedEntry as any).entry_type ?? selectedEntry.entryType)}</span>
                                <div>
                                    <h3 className="text-2xl text-silver font-semibold">{selectedEntry.title ?? '—'}</h3>
                                    <p className="text-sm text-silver/60">
                                        {(selectedEntry as any).user_email ?? selectedEntry.userEmail ?? '—'} • {selectedEntry.createdAt ? new Date(selectedEntry.createdAt).toLocaleString() : '—'}
                                    </p>
                                </div>
                            </div>
                            
                            {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                                <div className="flex gap-2 mb-4">
                                    {selectedEntry.tags.map((tag, idx) => (
                                        <Badge key={idx} variant="secondary">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-4 bg-white/5 rounded-lg">
                            <p className="text-silver whitespace-pre-wrap">{selectedEntry.content ?? '—'}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-4 border-t border-white/10">
                            <Button
                                variant="primary"
                                onClick={() => handleAction(selectedEntry.id, 'approve')}
                                className="flex-1"
                            >
                                ✓ Одобрить
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => handleAction(selectedEntry.id, 'flag', 'На проверке')}
                                className="flex-1"
                            >
                                🚩 Флаг
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => {
                                    if (confirm('Удалить эту запись?')) {
                                        handleAction(selectedEntry.id, 'delete', 'Неподходящий контент');
                                    }
                                }}
                                className="flex-1"
                            >
                                🗑️ Удалить
                            </Button>
                        </div>
                    </Stack>
                </Modal>
            )}
        </AdminLayout>
    );
}
