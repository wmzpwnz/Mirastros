'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../services/api';
import type { Product } from '../../types';

const categories = [
  { id: 'all', name: 'Все товары' },
  { id: 'crystals', name: 'Кристаллы' },
  { id: 'tarot', name: 'Таро' },
  { id: 'books', name: 'Книги' },
  { id: 'incense', name: 'Благовония' },
  { id: 'candles', name: 'Свечи' },
  { id: 'jewelry', name: 'Украшения' },
];

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<string[]>([]);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const result = await api.getProducts({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        page: 1,
        pageSize: 20,
      });
      setProducts(result.products);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (productId: string) => {
    setCart([...cart, productId]);
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/dashboard"
            className="inline-block text-mirastros-gold hover:text-mirastros-gold/80 mb-4 transition"
          >
            ← Назад к панели
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-cinzel text-4xl font-bold text-white mb-2">
                Эзотерический магазин
              </h1>
              <p className="text-gray-400">
                Кристаллы, таро, книги и другие мистические товары
              </p>
            </div>
            {cart.length > 0 && (
              <Link
                href="/shop/cart"
                className="relative px-6 py-3 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold rounded-lg transition"
              >
                Корзина
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                selectedCategory === category.id
                  ? 'bg-mirastros-gold text-black'
                  : 'bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mirastros-gold mx-auto mb-4"></div>
            <p className="text-gray-400">Загрузка товаров...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-mirastros-gold/50 transition group"
              >
                {/* Product Image */}
                <div className="aspect-square bg-white/5 flex items-center justify-center text-6xl">
                  {getCategoryIcon(product.category)}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-cinzel text-lg font-bold text-white mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-white">
                        ₽{product.price}
                      </span>
                      {product.stockQuantity > 0 ? (
                        <p className="text-green-400 text-xs mt-1">В наличии</p>
                      ) : (
                        <p className="text-red-400 text-xs mt-1">Нет в наличии</p>
                      )}
                    </div>

                    <button
                      onClick={() => addToCart(product.id)}
                      disabled={product.stockQuantity === 0}
                      className="px-4 py-2 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      В корзину
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/5 border border-white/10 rounded-lg">
            <div className="text-4xl mb-4">🛍️</div>
            <p className="text-gray-400 mb-2">Товары не найдены</p>
            <p className="text-gray-500 text-sm">
              Попробуйте выбрать другую категорию
            </p>
          </div>
        )}

        {/* Recommendations */}
        <div className="mt-12 bg-white/5 border border-white/10 rounded-lg p-6">
          <h2 className="font-cinzel text-xl font-bold text-white mb-4">
            Персональные рекомендации
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            На основе вашей натальной карты мы рекомендуем:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-3xl mb-2">💎</div>
              <h3 className="font-semibold text-white mb-1">Аметист</h3>
              <p className="text-gray-400 text-sm">
                Для вашего знака зодиака
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-3xl mb-2">🃏</div>
              <h3 className="font-semibold text-white mb-1">Таро Райдера-Уэйта</h3>
              <p className="text-gray-400 text-sm">
                Классическая колода для начинающих
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-3xl mb-2">📚</div>
              <h3 className="font-semibold text-white mb-1">Астрология для всех</h3>
              <p className="text-gray-400 text-sm">
                Углубите свои знания
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    crystals: '💎',
    tarot: '🃏',
    books: '📚',
    incense: '🌿',
    candles: '🕯️',
    jewelry: '💍',
  };
  return icons[category] || '✨';
}
