'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

interface RetentionStats {
    cohort_date: string;
    cohort_size: number;
    retention: Array<{
        week: number;
        active_users: number;
        retention_rate: number;
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
    const [retention, setRetention] = useState<RetentionStats | null>(null);
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
            
            // Get auth token from localStorage
            const token = localStorage.getItem('admin_token');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            
            // Fetch registration stats (last 30 days)
            const regResponse = await fetch(`${API_URL}/analytics/registrations`, { headers });
            if (regResponse.ok) {
                const regData = await regResponse.json();
                setRegistrations(regData);
            }
            
            // Fetch conversion stats
            const convResponse = await fetch(`${API_URL}/analytics/conversions`, { headers });
            if (convResponse.ok) {
                const convData = await convResponse.json();
                setConversions(convData);
            }
            
            // Fetch service usage
            const serviceResponse = await fetch(`${API_URL}/analytics/service-usage`, { headers });
            if (serviceResponse.ok) {
                const serviceData = await serviceResponse.json();
                setServiceUsage(serviceData);
            }
            
            // Fetch retention stats
            const retResponse = await fetch(`${API_URL}/analytics/retention`, { headers });
            if (retResponse.ok) {
                const retData = await retResponse.json();
                setRetention(retData);
            }
            
            // Fetch AI performance
            const aiResponse = await fetch(`${API_URL}/analytics/ai-performance`, { headers });
            if (aiResponse.ok) {
                const aiData = await aiResponse.json();
                setAIPerformance(aiData);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            setError('Failed to load analytics data');
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
                        <p className="text-silver/60">Loading analytics...</p>
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
                        <button
                            onClick={fetchAnalytics}
                            className="px-6 py-3 bg-gold/20 text-gold border border-gold/30 rounded-lg hover:bg-gold/30 transition-all"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-cinzel text-gold mb-2">Analytics Dashboard</h1>
                        <p className="text-silver/60">Real-time system performance and usage statistics</p>
                    </div>
                    <button
                        onClick={fetchAnalytics}
                        className="px-6 py-3 bg-gold/20 text-gold border border-gold/30 rounded-lg hover:bg-gold/30 transition-all"
                    >
                        🔄 Refresh
                    </button>
                </div>

                {/* Registration Stats */}
                {registrations && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass rounded-xl p-6">
                            <h2 className="text-2xl font-cinzel text-gold mb-4">User Registrations</h2>
                            <p className="text-4xl font-bold text-gold mb-2">{registrations.total}</p>
                            <p className="text-sm text-silver/60">Last 30 days</p>
                        </div>
                        
                        {conversions && (
                            <div className="glass rounded-xl p-6">
                                <h2 className="text-2xl font-cinzel text-gold mb-4">Conversion Rate</h2>
                                <p className="text-4xl font-bold text-turquoise mb-2">
                                    {conversions.overall_conversion_rate}%
                                </p>
                                <p className="text-sm text-silver/60">
                                    {conversions.total_conversions} / {conversions.total_registrations} users converted
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Conversion by Tier */}
                {conversions && Object.keys(conversions.by_tier).length > 0 && (
                    <div className="glass rounded-xl p-6">
                        <h2 className="text-2xl font-cinzel text-gold mb-6">Conversions by Tier</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    <p className="text-sm text-silver/60">{stats.count} conversions</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Service Usage */}
                {serviceUsage && serviceUsage.services.length > 0 && (
                    <div className="glass rounded-xl p-6">
                        <h2 className="text-2xl font-cinzel text-gold mb-6">Service Usage</h2>
                        <p className="text-sm text-silver/60 mb-4">
                            Total requests: {serviceUsage.total_usage}
                        </p>
                        <div className="space-y-4">
                            {serviceUsage.services.slice(0, 10).map((service) => {
                                const percentage = (service.count / serviceUsage.total_usage) * 100;
                                return (
                                    <div key={service.service}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-silver capitalize">
                                                {service.service.replace('_', ' ')}
                                            </span>
                                            <div className="text-right">
                                                <span className="text-silver/60">{service.count} requests</span>
                                                {service.avg_response_time_ms && (
                                                    <span className="text-xs text-turquoise ml-2">
                                                        ~{service.avg_response_time_ms}ms
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-gold to-turquoise h-full rounded-full transition-all"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* AI Performance */}
                {aiPerformance && aiPerformance.total_requests > 0 && (
                    <div className="glass rounded-xl p-6">
                        <h2 className="text-2xl font-cinzel text-gold mb-6">AI Performance Metrics</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <p className="text-sm text-silver/60 mb-2">Total Requests</p>
                                <p className="text-2xl font-bold text-gold">{aiPerformance.total_requests}</p>
                            </div>
                            <div>
                                <p className="text-sm text-silver/60 mb-2">Avg Response Time</p>
                                <p className="text-2xl font-bold text-turquoise">
                                    {aiPerformance.avg_response_time_ms || 0}ms
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-silver/60 mb-2">P95 Response Time</p>
                                <p className="text-2xl font-bold text-purple">
                                    {aiPerformance.p95_response_time_ms || 0}ms
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-silver/60 mb-2">Total Tokens</p>
                                <p className="text-2xl font-bold text-silver">
                                    {aiPerformance.total_tokens_used.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Retention */}
                {retention && retention.cohort_size > 0 && (
                    <div className="glass rounded-xl p-6">
                        <h2 className="text-2xl font-cinzel text-gold mb-6">User Retention</h2>
                        <p className="text-sm text-silver/60 mb-4">
                            Cohort: {new Date(retention.cohort_date).toLocaleDateString()} ({retention.cohort_size} users)
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {retention.retention.map((week) => (
                                <div key={week.week} className="border border-gold/20 rounded-lg p-4">
                                    <p className="text-sm text-silver/60 mb-2">Week {week.week}</p>
                                    <p className="text-3xl font-bold text-gold mb-1">
                                        {week.retention_rate}%
                                    </p>
                                    <p className="text-xs text-silver/60">{week.active_users} active</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
