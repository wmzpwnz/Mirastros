'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Input, Button, Select, Textarea, Card, Stack, Badge } from '@mirastros-universal/design-system';
import { adminApi } from '../../services/api';
import type { Document } from '../../types';

export default function DocumentsPage() {
    const [uploadType, setUploadType] = useState<'text' | 'pdf'>('text');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('horoscope');
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');

    useEffect(() => {
        fetchDocuments();
    }, [filterCategory]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getDocuments(
                filterCategory !== 'all' ? filterCategory : undefined
            );
            setDocuments(data);
        } catch (error) {
            console.error('Failed to fetch documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTextUpload = async () => {
        setUploading(true);
        try {
            await adminApi.uploadDocument({
                title,
                content,
                category,
                source: 'admin-upload',
            });
            alert('Документ загружен.');
            setTitle('');
            setContent('');
            fetchDocuments();
        } catch (error: any) {
            alert('Ошибка загрузки: ' + (error.message || 'Unknown error'));
        } finally {
            setUploading(false);
        }
    };

    const handlePdfUpload = async () => {
        if (!file) return;
        setUploading(true);
        try {
            await adminApi.uploadPdf(file, category);
            alert('PDF загружен.');
            setFile(null);
            fetchDocuments();
        } catch (error: any) {
            alert('Ошибка загрузки: ' + (error.message || 'Unknown error'));
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить этот документ?')) return;
        
        try {
            await adminApi.deleteDocument(id);
            alert('Документ удалён.');
            fetchDocuments();
        } catch (error: any) {
            alert('Delete failed: ' + (error.message || 'Unknown error'));
        }
    };

    const filteredDocuments = documents.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminLayout>
            <Stack gap="8">
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-cinzel text-gold mb-2">Документы</h1>
                    <p className="text-silver/60">База знаний RAG</p>
                </div>

                {/* Upload Section */}
                <Card variant="elevated">
                    <h2 className="text-2xl font-cinzel text-gold mb-6">Загрузить документ</h2>

                    <div className="flex gap-4 mb-6">
                        <Button
                            variant={uploadType === 'text' ? 'primary' : 'secondary'}
                            onClick={() => setUploadType('text')}
                        >
                            📝 Текст
                        </Button>
                        <Button
                            variant={uploadType === 'pdf' ? 'primary' : 'secondary'}
                            onClick={() => setUploadType('pdf')}
                        >
                            📄 PDF
                        </Button>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm text-silver/60 mb-2">Категория</label>
                        <Select
                            options={[
                                { value: 'horoscope', label: 'Гороскоп' },
                                { value: 'tarot', label: 'Таро' },
                                { value: 'natal', label: 'Натальная карта' },
                            ]}
                            value={category}
                            onChange={(value) => setCategory(String(value))}
                            placeholder="Категория"
                        />
                    </div>

                    {uploadType === 'text' && (
                        <Stack gap="4">
                            <div>
                                <label className="block text-sm text-silver/60 mb-2">Название</label>
                                <Input
                                    type="text"
                                    value={title}
                                    onChange={(value) => setTitle(value ?? '')}
                                    placeholder="Название документа"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-silver/60 mb-2">Содержимое</label>
                                <Textarea
                                    value={content}
                                    onChange={(value) => setContent(value ?? '')}
                                    placeholder="Текст документа..."
                                    rows={10}
                                />
                            </div>
                            <Button
                                variant="primary"
                                onClick={handleTextUpload}
                                disabled={uploading || !title || !content}
                                className="w-full"
                            >
                                {uploading ? 'Загрузка...' : 'Загрузить текст'}
                            </Button>
                        </Stack>
                    )}

                    {uploadType === 'pdf' && (
                        <Stack gap="4">
                            <div>
                                <label className="block text-sm text-silver/60 mb-2">Файл PDF</label>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                                    className="w-full px-4 py-2 rounded border border-gray-600 bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-gold-500"
                                />
                            </div>
                            <Button
                                variant="primary"
                                onClick={handlePdfUpload}
                                disabled={uploading || !file}
                                className="w-full"
                            >
                                {uploading ? 'Загрузка...' : 'Загрузить PDF'}
                            </Button>
                        </Stack>
                    )}
                </Card>

                <Card variant="elevated">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-cinzel text-gold">Документы в базе</h2>
                        <div className="flex gap-4">
                            <Input
                                type="text"
                                placeholder="Поиск..."
                                value={searchQuery}
                                onChange={(value) => setSearchQuery(value ?? '')}
                                className="w-48"
                            />
                            <Select
                                options={[
                                    { value: 'all', label: 'Все категории' },
                                    { value: 'horoscope', label: 'Гороскоп' },
                                    { value: 'tarot', label: 'Таро' },
                                    { value: 'natal', label: 'Натальная карта' },
                                    { value: 'numerology', label: 'Нумерология' },
                                    { value: 'dream', label: 'Сны' },
                                    { value: 'runes', label: 'Руны' },
                                    { value: 'iching', label: 'И Цзин' },
                                    { value: 'lenormand', label: 'Ленорман' },
                                ]}
                                value={filterCategory}
                                onChange={(value) => setFilterCategory(String(value))}
                                placeholder="Категория"
                                className="w-48"
                            />
                        </div>
                    </div>
                    
                    {loading ? (
                        <div className="text-center py-8 text-silver/60">Загрузка...</div>
                    ) : filteredDocuments.length === 0 ? (
                        <div className="text-center py-8 text-silver/60">Документы не найдены</div>
                    ) : (
                        <Stack gap="3">
                            {filteredDocuments.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                                >
                                    <div>
                                        <h3 className="text-silver font-medium">{doc.title}</h3>
                                        <p className="text-xs text-silver/60 mt-1">
                                            Категория: <Badge variant="secondary">{doc.category || '—'}</Badge>
                                            {doc.source && ` • ${doc.source}`}
                                        </p>
                                    </div>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDelete(doc.id)}
                                    >
                                        Удалить
                                    </Button>
                                </div>
                            ))}
                        </Stack>
                    )}
                </Card>
            </Stack>
        </AdminLayout>
    );
}
