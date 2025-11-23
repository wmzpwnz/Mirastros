'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface JournalEntry {
    id: string;
    user_id: string;
    user_email: string;
    entry_type: string;
    title: string;
    content: string;
    tags?: string[];
    created_at: string;
    flagged: boolean;
}

interface ModerationStats {
    total_journal_entries: number;
    flagged_entries: number;
    pending_review: number;
}

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
            const params = new URLSearchParams();
            if (showFlaggedOnly) {
                params.append('flagged_only', 'true');
            }
            
            const response = await fetch(`${API_URL}/admin/moderation/journal-entries?${params}`);
            if (response.ok) {
                const data = await response.json();
                setEntries(data);
            }
        } catch (error) {
            console.error('Failed to fetch entries:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/moderation/stats`);
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleAction = async (entryId: string, action: string, reason?: string) => {
        try {
            const response = await fetch(`${API_URL}/admin/moderation/journal-entries/${entryId}/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, reason }),
            });
            
            if (response.ok) {
                alert(`Entry ${action}ed successfully`);
                fetchEntries();
                fetchStats();
                setShowDetail(false);
            } else {
                const error = await response.json();
                alert('Action failed: ' + (error.detail || 'Unknown error'));
            }
        } catch (error) {
            alert('Action failed: ' + error);
        }
    };

    const getEntryTypeIcon = (type: string) => {
        switch (type) {
            case 'dream': return '💭';
            case 'meditation': return '🧘';
            case 'reading': return '🔮';
            case 'reflection': return '📝';
            default: return '📄';
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-cinzel text-gold mb-2">Content Moderation</h1>
                    <p className="text-silver/60">Review and moderate user-generated content</p>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass rounded-xl p-6">
                            <p className="text-sm text-silver/60 mb-2">Total Entries</p>
                            <p className="text-3xl font-bold text-gold">{stats.total_journal_entries}</p>
                        </div>
                        <div className="glass rounded-xl p-6">
                            <p className="text-sm text-silver/60 mb-2">Flagged</p>
                            <p className="text-3xl font-bold text-red-400">{stats.flagged_entries}</p>
                        </div>
                        <div className="glass rounded-xl p-6">
                            <p className="text-sm text-silver/60 mb-2">Pending Review</p>
                            <p className="text-3xl font-bold text-yellow-400">{stats.pending_review}</p>
                        </div>
                    </div>
                )}

                {/* Filter */}
                <div className="glass rounded-xl p-6">
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showFlaggedOnly}
                                onChange={(e) => setShowFlaggedOnly(e.target.checked)}
                                className="w-4 h-4 rounded border-white/10 bg-white/5 text-gold focus:ring-gold"
                            />
                            <span className="text-silver">Show flagged only</span>
                        </label>
                        <button
                            onClick={fetchEntries}
                            className="ml-auto px-6 py-3 bg-gold/20 text-gold border border-gold/30 rounded-lg hover:bg-gold/30 transition-all"
                        >
                            🔄 Refresh
                        </button>
                    </div>
                </div>

                {/* Entries List */}
                <div className="glass rounded-xl p-6">
                    <h2 className="text-2xl font-cinzel text-gold mb-6">Journal Entries</h2>
                    
                    {loading ? (
                        <div className="text-center py-8 text-silver/60">Loading entries...</div>
                    ) : entries.length === 0 ? (
                        <div className="text-center py-8 text-silver/60">No entries found</div>
                    ) : (
                        <div className="space-y-3">
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
                                            <span className="text-2xl">{getEntryTypeIcon(entry.entry_type)}</span>
                                            <div>
                                                <h3 className="text-silver font-medium">{entry.title}</h3>
                                                <p className="text-xs text-silver/60">
                                                    {entry.user_email} • {entry.entry_type} • {new Date(entry.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-silver/60 line-clamp-2 ml-11">
                                            {entry.content}
                                        </p>
                                        {entry.tags && entry.tags.length > 0 && (
                                            <div className="flex gap-2 mt-2 ml-11">
                                                {entry.tags.map((tag, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2 py-1 bg-turquoise/20 text-turquoise text-xs rounded"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {entry.flagged && (
                                        <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                                            🚩 Flagged
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Entry Detail Modal */}
            {showDetail && selectedEntry && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="glass rounded-xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-3xl font-cinzel text-gold">Review Entry</h2>
                            <button
                                onClick={() => setShowDetail(false)}
                                className="text-silver/60 hover:text-silver text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Entry Info */}
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-4xl">{getEntryTypeIcon(selectedEntry.entry_type)}</span>
                                    <div>
                                        <h3 className="text-2xl text-silver font-semibold">{selectedEntry.title}</h3>
                                        <p className="text-sm text-silver/60">
                                            {selectedEntry.user_email} • {new Date(selectedEntry.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                
                                {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                                    <div className="flex gap-2 mb-4">
                                        {selectedEntry.tags.map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-1 bg-turquoise/20 text-turquoise text-sm rounded"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-4 bg-white/5 rounded-lg">
                                <p className="text-silver whitespace-pre-wrap">{selectedEntry.content}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 pt-4 border-t border-white/10">
                                <button
                                    onClick={() => handleAction(selectedEntry.id, 'approve')}
                                    className="flex-1 px-6 py-3 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-all"
                                >
                                    ✓ Approve
                                </button>
                                <button
                                    onClick={() => handleAction(selectedEntry.id, 'flag', 'Flagged for review')}
                                    className="flex-1 px-6 py-3 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 transition-all"
                                >
                                    🚩 Flag
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm('Are you sure you want to delete this entry?')) {
                                            handleAction(selectedEntry.id, 'delete', 'Inappropriate content');
                                        }
                                    }}
                                    className="flex-1 px-6 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all"
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
