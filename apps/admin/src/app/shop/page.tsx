'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Product {
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    currency: string;
    stock_quantity: number;
    is_active: boolean;
    image_url?: string;
    zodiac_signs?: string;
    created_at: string;
}

interface Order {
    id: string;
    user_id: string;
    user_email: string;
    total_amount: number;
    status: string;
    created_at: string;
    items_count: number;
}

export default function ShopPage() {
    const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        if (activeTab === 'products') {
            fetchProducts();
        } else {
            fetchOrders();
        }
    }, [activeTab, filterCategory, filterStatus]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filterCategory !== 'all') {
                params.append('category', filterCategory);
            }
            
            const response = await fetch(`${API_URL}/admin/shop/products?${params}`);
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filterStatus !== 'all') {
                params.append('status', filterStatus);
            }
            
            const response = await fetch(`${API_URL}/admin/shop/orders?${params}`);
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'crystals': return '💎';
            case 'tarot-decks': return '🃏';
            case 'books': return '📚';
            case 'ritual-items': return '🕯️';
            default: return '📦';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'text-yellow-400';
            case 'paid': return 'text-green-400';
            case 'shipped': return 'text-blue-400';
            case 'delivered': return 'text-turquoise';
            case 'cancelled': return 'text-red-400';
            default: return 'text-silver';
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-cinzel text-gold mb-2">Shop Management</h1>
                    <p className="text-silver/60">Manage products and orders</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`px-6 py-3 rounded-lg transition-all ${
                            activeTab === 'products'
                                ? 'bg-gold/20 text-gold border border-gold/30'
                                : 'bg-white/5 text-silver/60 hover:bg-white/10'
                        }`}
                    >
                        📦 Products
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-6 py-3 rounded-lg transition-all ${
                            activeTab === 'orders'
                                ? 'bg-gold/20 text-gold border border-gold/30'
                                : 'bg-white/5 text-silver/60 hover:bg-white/10'
                        }`}
                    >
                        🛒 Orders
                    </button>
                </div>

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div className="space-y-6">
                        {/* Filter */}
                        <div className="glass rounded-xl p-6">
                            <div className="flex gap-4">
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-silver focus:border-gold/50 focus:outline-none"
                                >
                                    <option value="all">All Categories</option>
                                    <option value="crystals">Crystals</option>
                                    <option value="tarot-decks">Tarot Decks</option>
                                    <option value="books">Books</option>
                                    <option value="ritual-items">Ritual Items</option>
                                </select>
                                <button
                                    className="px-6 py-3 bg-gold/20 text-gold border border-gold/30 rounded-lg hover:bg-gold/30 transition-all"
                                >
                                    + Add Product
                                </button>
                            </div>
                        </div>

                        {/* Products List */}
                        <div className="glass rounded-xl p-6">
                            <h2 className="text-2xl font-cinzel text-gold mb-6">Products</h2>
                            
                            {loading ? (
                                <div className="text-center py-8 text-silver/60">Loading products...</div>
                            ) : products.length === 0 ? (
                                <div className="text-center py-8 text-silver/60">No products found</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {products.map((product) => (
                                        <div
                                            key={product.id}
                                            className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <span className="text-3xl">{getCategoryIcon(product.category)}</span>
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    product.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                    {product.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <h3 className="text-silver font-medium mb-2">{product.name}</h3>
                                            <p className="text-xs text-silver/60 mb-3 line-clamp-2">
                                                {product.description}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gold font-semibold">
                                                    ${product.price.toFixed(2)}
                                                </span>
                                                <span className="text-xs text-silver/60">
                                                    Stock: {product.stock_quantity}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div className="space-y-6">
                        {/* Filter */}
                        <div className="glass rounded-xl p-6">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-silver focus:border-gold/50 focus:outline-none"
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        {/* Orders List */}
                        <div className="glass rounded-xl p-6">
                            <h2 className="text-2xl font-cinzel text-gold mb-6">Orders</h2>
                            
                            {loading ? (
                                <div className="text-center py-8 text-silver/60">Loading orders...</div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-8 text-silver/60">No orders found</div>
                            ) : (
                                <div className="space-y-3">
                                    {orders.map((order) => (
                                        <div
                                            key={order.id}
                                            className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-xs text-silver/60 font-mono">
                                                        #{order.id.slice(0, 8)}
                                                    </span>
                                                    <span className={`text-sm font-semibold ${getStatusColor(order.status)}`}>
                                                        {order.status.toUpperCase()}
                                                    </span>
                                                </div>
                                                <p className="text-silver text-sm">{order.user_email}</p>
                                                <p className="text-xs text-silver/60">
                                                    {order.items_count} items • {new Date(order.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-gold font-semibold text-lg">
                                                    ${order.total_amount.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
