'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface User {
    id: string;
    email: string;
    full_name: string;
    subscription_tier: string;
    subscription_expires: string | null;
    created_at: string;
    last_login: string | null;
    birth_date: string | null;
    zodiac_sign: string | null;
}

interface UserDetail extends User {
    birth_time: string | null;
    birth_location: any;
    google_id: string | null;
    apple_id: string | null;
    telegram_id: string | null;
    vk_id: string | null;
    updated_at: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterTier, setFilterTier] = useState<string>('all');
    const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
    const [showDetail, setShowDetail] = useState(false);
    const [page, setPage] = useState(0);
    const [limit] = useState(20);

    useEffect(() => {
        fetchUsers();
    }, [filterTier, page]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                skip: (page * limit).toString(),
                limit: limit.toString(),
            });
            
            if (searchQuery) {
                params.append('search', searchQuery);
            }
            
            if (filterTier !== 'all') {
                params.append('subscription_tier', filterTier);
            }
            
            const response = await fetch(`${API_URL}/admin/users?${params}`);
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserDetail = async (userId: string) => {
        try {
            const response = await fetch(`${API_URL}/admin/users/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setSelectedUser(data);
                setShowDetail(true);
            }
        } catch (error) {
            console.error('Failed to fetch user detail:', error);
        }
    };

    const handleSearch = () => {
        setPage(0);
        fetchUsers();
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/admin/users/${userId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                alert('User deleted successfully');
                fetchUsers();
                setShowDetail(false);
            } else {
                const error = await response.json();
                alert('Delete failed: ' + (error.detail || 'Unknown error'));
            }
        } catch (error) {
            alert('Delete failed: ' + error);
        }
    };

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'freemium': return 'text-silver/60';
            case 'premium': return 'text-gold';
            case 'platinum': return 'text-purple';
            default: return 'text-silver';
        }
    };

    const getTierBadge = (tier: string) => {
        switch (tier) {
            case 'freemium': return '🆓';
            case 'premium': return '⭐';
            case 'platinum': return '💎';
            default: return '';
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-cinzel text-gold mb-2">User Management</h1>
                    <p className="text-silver/60">Manage users and subscriptions</p>
                </div>

                {/* Search and Filter */}
                <div className="glass rounded-xl p-6">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Search by email or name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-silver focus:border-gold/50 focus:outline-none"
                        />
                        <button
                            onClick={handleSearch}
                            className="px-6 py-3 bg-gold/20 text-gold border border-gold/30 rounded-lg hover:bg-gold/30 transition-all"
                        >
                            Search
                        </button>
                        <select
                            value={filterTier}
                            onChange={(e) => {
                                setFilterTier(e.target.value);
                                setPage(0);
                            }}
                            className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-silver focus:border-gold/50 focus:outline-none"
                        >
                            <option value="all">All Tiers</option>
                            <option value="freemium">Freemium</option>
                            <option value="premium">Premium</option>
                            <option value="platinum">Platinum</option>
                        </select>
                    </div>
                </div>

                {/* Users List */}
                <div className="glass rounded-xl p-6">
                    <h2 className="text-2xl font-cinzel text-gold mb-6">Users</h2>
                    
                    {loading ? (
                        <div className="text-center py-8 text-silver/60">Loading users...</div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-8 text-silver/60">No users found</div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {users.map((user) => (
                                    <div
                                        key={user.id}
                                        onClick={() => fetchUserDetail(user.id)}
                                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{getTierBadge(user.subscription_tier)}</span>
                                                <div>
                                                    <h3 className="text-silver font-medium">{user.full_name}</h3>
                                                    <p className="text-xs text-silver/60">{user.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-semibold ${getTierColor(user.subscription_tier)}`}>
                                                {user.subscription_tier.toUpperCase()}
                                            </p>
                                            <p className="text-xs text-silver/60">
                                                Joined: {new Date(user.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="flex justify-center gap-4 mt-6">
                                <button
                                    onClick={() => setPage(Math.max(0, page - 1))}
                                    disabled={page === 0}
                                    className="px-4 py-2 bg-white/5 text-silver rounded-lg hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2 text-silver">Page {page + 1}</span>
                                <button
                                    onClick={() => setPage(page + 1)}
                                    disabled={users.length < limit}
                                    className="px-4 py-2 bg-white/5 text-silver rounded-lg hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* User Detail Modal */}
            {showDetail && selectedUser && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="glass rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-3xl font-cinzel text-gold">User Details</h2>
                            <button
                                onClick={() => setShowDetail(false)}
                                className="text-silver/60 hover:text-silver text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div>
                                <h3 className="text-lg font-semibold text-turquoise mb-3">Basic Information</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-silver/60">ID:</span>
                                        <span className="text-silver font-mono text-xs">{selectedUser.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-silver/60">Name:</span>
                                        <span className="text-silver">{selectedUser.full_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-silver/60">Email:</span>
                                        <span className="text-silver">{selectedUser.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-silver/60">Subscription:</span>
                                        <span className={getTierColor(selectedUser.subscription_tier)}>
                                            {getTierBadge(selectedUser.subscription_tier)} {selectedUser.subscription_tier.toUpperCase()}
                                        </span>
                                    </div>
                                    {selectedUser.subscription_expires && (
                                        <div className="flex justify-between">
                                            <span className="text-silver/60">Expires:</span>
                                            <span className="text-silver">
                                                {new Date(selectedUser.subscription_expires).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Birth Data */}
                            {selectedUser.birth_date && (
                                <div>
                                    <h3 className="text-lg font-semibold text-turquoise mb-3">Birth Data</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-silver/60">Birth Date:</span>
                                            <span className="text-silver">{selectedUser.birth_date}</span>
                                        </div>
                                        {selectedUser.birth_time && (
                                            <div className="flex justify-between">
                                                <span className="text-silver/60">Birth Time:</span>
                                                <span className="text-silver">{selectedUser.birth_time}</span>
                                            </div>
                                        )}
                                        {selectedUser.zodiac_sign && (
                                            <div className="flex justify-between">
                                                <span className="text-silver/60">Zodiac Sign:</span>
                                                <span className="text-silver">{selectedUser.zodiac_sign}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Social Logins */}
                            <div>
                                <h3 className="text-lg font-semibold text-turquoise mb-3">Social Logins</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-silver/60">Google:</span>
                                        <span className="text-silver">{selectedUser.google_id || 'Not linked'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-silver/60">Apple:</span>
                                        <span className="text-silver">{selectedUser.apple_id || 'Not linked'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-silver/60">Telegram:</span>
                                        <span className="text-silver">{selectedUser.telegram_id || 'Not linked'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-silver/60">VK:</span>
                                        <span className="text-silver">{selectedUser.vk_id || 'Not linked'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Timestamps */}
                            <div>
                                <h3 className="text-lg font-semibold text-turquoise mb-3">Activity</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-silver/60">Created:</span>
                                        <span className="text-silver">
                                            {new Date(selectedUser.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-silver/60">Updated:</span>
                                        <span className="text-silver">
                                            {new Date(selectedUser.updated_at).toLocaleString()}
                                        </span>
                                    </div>
                                    {selectedUser.last_login && (
                                        <div className="flex justify-between">
                                            <span className="text-silver/60">Last Login:</span>
                                            <span className="text-silver">
                                                {new Date(selectedUser.last_login).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 pt-4 border-t border-white/10">
                                <button
                                    onClick={() => handleDeleteUser(selectedUser.id)}
                                    className="flex-1 px-6 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all"
                                >
                                    Delete User
                                </button>
                                <button
                                    onClick={() => setShowDetail(false)}
                                    className="flex-1 px-6 py-3 bg-white/5 text-silver border border-white/10 rounded-lg hover:bg-white/10 transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
