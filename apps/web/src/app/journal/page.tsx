'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../services/api';

export default function JournalPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    entryType: 'dream',
    tags: '',
    mood: '',
  });

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const result = await api.getJournalEntries(20, 0);
      setEntries(result.entries);
    } catch (error) {
      console.error('Failed to load entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = async () => {
    try {
      await api.createJournalEntry({
        ...newEntry,
        tags: newEntry.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      setNewEntry({
        title: '',
        content: '',
        entryType: 'dream',
        tags: '',
        mood: '',
      });
      setShowNewEntry(false);
      loadEntries();
    } catch (error) {
      console.error('Failed to create entry:', error);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
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
                Дневник практик
              </h1>
              <p className="text-gray-400">
                Записывайте свои наблюдения и получайте инсайты от AI
              </p>
            </div>
            <button
              onClick={() => setShowNewEntry(!showNewEntry)}
              className="px-6 py-3 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold rounded-lg transition"
            >
              {showNewEntry ? 'Отменить' : '+ Новая запись'}
            </button>
          </div>
        </div>

        {/* New Entry Form */}
        {showNewEntry && (
          <div className="mb-8 bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="font-cinzel text-xl font-bold text-white mb-4">
              Новая запись
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Тип записи
                </label>
                <select
                  value={newEntry.entryType}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, entryType: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-mirastros-gold focus:border-transparent transition"
                >
                  <option value="dream">Сон</option>
                  <option value="meditation">Медитация</option>
                  <option value="reading">Предсказание</option>
                  <option value="observation">Наблюдение</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Заголовок
                </label>
                <input
                  type="text"
                  value={newEntry.title}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, title: e.target.value })
                  }
                  placeholder="Краткое описание"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-mirastros-gold focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Содержание
                </label>
                <textarea
                  value={newEntry.content}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, content: e.target.value })
                  }
                  placeholder="Опишите свой опыт..."
                  rows={6}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-mirastros-gold focus:border-transparent transition resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Теги (через запятую)
                  </label>
                  <input
                    type="text"
                    value={newEntry.tags}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, tags: e.target.value })
                    }
                    placeholder="любовь, карьера"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-mirastros-gold focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Настроение
                  </label>
                  <input
                    type="text"
                    value={newEntry.mood}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, mood: e.target.value })
                    }
                    placeholder="спокойное, радостное"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-mirastros-gold focus:border-transparent transition"
                  />
                </div>
              </div>

              <button
                onClick={handleCreateEntry}
                className="w-full py-3 px-6 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold rounded-lg transition"
              >
                Сохранить запись
              </button>
            </div>
          </div>
        )}

        {/* Entries List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mirastros-gold mx-auto mb-4"></div>
            <p className="text-gray-400">Загрузка записей...</p>
          </div>
        ) : entries.length > 0 ? (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-cinzel text-lg font-bold text-white mb-1">
                      {entry.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span className="capitalize">{entry.entryType}</span>
                      <span>•</span>
                      <span>
                        {new Date(entry.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                      {entry.mood && (
                        <>
                          <span>•</span>
                          <span>{entry.mood}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-gray-300 mb-3 line-clamp-3">
                  {entry.content}
                </p>

                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {entry.tags.map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-mirastros-gold/20 text-mirastros-gold rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/5 border border-white/10 rounded-lg">
            <div className="text-4xl mb-4">📔</div>
            <p className="text-gray-400 mb-2">У вас пока нет записей</p>
            <p className="text-gray-500 text-sm">
              Начните вести дневник своих практик
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
