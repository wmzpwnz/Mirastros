'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Button, Select, Card, Stack, Badge, Grid } from '@mirastros-universal/design-system';
import { adminApi } from '../../services/api';
import type { Product, Order } from '../../types';


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
            const data = await adminApi.getProducts({
                category: filterCategory !== 'all' ? filterCategory : undefined,
            });
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getOrders({
                status: filterStatus !== 'all' ? filterStatus : undefined,
            });
            setOrders(data);
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
            case 'pending': return 'warning';
            case 'paid': return 'success';
            case 'shipped': return 'info';
            case 'delivered': return 'primary';
            case 'cancelled': return 'danger';
            default: return 'secondary';
        }
    };

    return (
        <AdminLayout>
            <Stack gap="8">
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-cinzel text-gold mb-2">Магазин</h1>
                    <p className="text-silver/60">Товары и заказы</p>
                </div>

                <div className="flex gap-4">
                    <Button
                        variant={activeTab === 'products' ? 'primary' : 'secondary'}
                        onClick={() => setActiveTab('products')}
                    >
                        📦 Товары
                    </Button>
                    <Button
                        variant={activeTab === 'orders' ? 'primary' : 'secondary'}
                        onClick={() => setActiveTab('orders')}
                    >
                        🛒 Заказы
                    </Button>
                </div>

                {activeTab === 'products' && (
                    <Stack gap="6">
                        <Card variant="elevated">
                            <div className="flex gap-4">
                                <Select
                                    options={[
                                        { value: 'all', label: 'Все категории' },
                                        { value: 'crystals', label: 'Кристаллы' },
                                        { value: 'tarot-decks', label: 'Колоды Таро' },
                                        { value: 'books', label: 'Книги' },
                                        { value: 'ritual-items', label: 'Ритуальные предметы' },
                                    ]}
                                    value={filterCategory}
                                    onChange={(value) => setFilterCategory(String(value))}
                                    placeholder="Категория"
                                />
                                <Button variant="primary">
                                    + Добавить товар
                                </Button>
                            </div>
                        </Card>

                        <Card variant="elevated">
                            <h2 className="text-2xl font-cinzel text-gold mb-6">Товары</h2>
                            
                            {loading ? (
                                <div className="text-center py-8 text-silver/60">Загрузка...</div>
                            ) : products.length === 0 ? (
                                <div className="text-center py-8 text-silver/60">Товаров нет</div>
                            ) : (
                                <Grid columns={{ mobile: 1, tablet: 2, desktop: 3 }} gap="4">
                                    {products.map((product) => (
                                        <div
                                            key={product.id}
                                            className="p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <span className="text-3xl">{getCategoryIcon(product.category ?? '')}</span>
                                                <Badge variant={(product as any).is_active ?? product.isActive !== false ? 'primary' : 'secondary'}>
                                                    {(product as any).is_active ?? product.isActive !== false ? 'Активен' : 'Неактивен'}
                                                </Badge>
                                            </div>
                                            <h3 className="text-silver font-medium mb-2">{product.name ?? '—'}</h3>
                                            <p className="text-xs text-silver/60 mb-3 line-clamp-2">
                                                {product.description ?? ''}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gold font-semibold">
                                                    ${Number((product as any).price ?? product.price ?? 0).toFixed(2)}
                                                </span>
                                                <span className="text-xs text-silver/60">
                                                    В наличии: {(product as any).stock_quantity ?? product.stockQuantity ?? 0}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </Grid>
                            )}
                        </Card>
                    </Stack>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <Stack gap="6">
                        {/* Filter */}
                        <Card variant="elevated">
                            <Select
                                options={[
                                    { value: 'all', label: 'Все статусы' },
                                    { value: 'pending', label: 'Ожидает' },
                                    { value: 'paid', label: 'Оплачен' },
                                    { value: 'shipped', label: 'Отправлен' },
                                    { value: 'delivered', label: 'Доставлен' },
                                    { value: 'cancelled', label: 'Отменён' },
                                ]}
                                value={filterStatus}
                                onChange={(value) => setFilterStatus(String(value))}
                                placeholder="Статус"
                            />
                        </Card>

                        <Card variant="elevated">
                            <h2 className="text-2xl font-cinzel text-gold mb-6">Заказы</h2>
                            
                            {loading ? (
                                <div className="text-center py-8 text-silver/60">Загрузка...</div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-8 text-silver/60">Заказов нет</div>
                            ) : (
                                <Stack gap="3">
                                    {orders.map((order) => (
                                        <div
                                            key={order.id}
                                            className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                <span className="text-xs text-silver/60 font-mono">
                                                    #{(order.id ?? '').slice(0, 8)}
                                                </span>
                                                <Badge variant={getStatusColor((order as any).status ?? order.status ?? '') as any}>
                                                    {String((order as any).status ?? order.status ?? '').toUpperCase()}
                                                </Badge>
                                            </div>
                                            <p className="text-silver text-sm">{(order as any).user_email ?? order.userEmail ?? '—'}</p>
                                            <p className="text-xs text-silver/60">
                                                {(order as any).items_count ?? order.itemsCount ?? 0} шт. • {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-gold font-semibold text-lg">
                                                ${Number((order as any).total_amount ?? order.totalAmount ?? 0).toFixed(2)}
                                            </p>
                                            </div>
                                        </div>
                                    ))}
                                </Stack>
                            )}
                        </Card>
                    </Stack>
                )}
            </Stack>
        </AdminLayout>
    );
}
