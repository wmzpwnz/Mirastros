'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Document {
    id: number;
    title: string;
    category: string;
    source?: string;
}

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
            const url = filterCategory === 'all' 
                ? `${API_URL}/documents/`
                : `${API_URL}/documents/?category=${filterCategory}`;
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setDocuments(data);
            }
        } catch (error) {
            console.error('Failed to fetch documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTextUpload = async () => {
        setUploading(true);
        try {
            const response = await fetch(`${API_URL}/documents/upload`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, category, source: 'admin-upload' }),
            });
            if (response.ok) {
                alert('Document uploaded successfully!');
                setTitle('');
                setContent('');
                fetchDocuments(); // Refresh list
            } else {
                const error = await response.json();
                alert('Upload failed: ' + (error.detail || 'Unknown error'));
            }
        } catch (error) {
            alert('Upload failed: ' + error);
        } finally {
            setUploading(false);
        }
    };

    const handlePdfUpload = async () => {
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('category', category);

            const response = await fetch(`${API_URL}/documents/upload-pdf`, {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                alert('PDF uploaded successfully!');
                setFile(null);
                fetchDocuments(); // Refresh list
            } else {
                const error = await response.json();
                alert('Upload failed: ' + (error.detail || 'Unknown error'));
            }
        } catch (error) {
            alert('Upload failed: ' + error);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this document?')) return;
        
        try {
            const response = await fetch(`${API_URL}/documents/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                alert('Document deleted successfully!');
                fetchDocuments(); // Refresh list
            } else {
                const error = await response.json();
                alert('Delete failed: ' + (error.detail || 'Unknown error'));
            }
        } catch (error) {
            alert('Delete failed: ' + error);
        }
    };

    const filteredDocuments = documents.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-cinzel text-gold mb-2">Documents</h1>
                    <p className="text-silver/60">Manage RAG knowledge base</p>
                </div>

                {/* Upload Section */}
                <div className="glass rounded-xl p-6">
                    <h2 className="text-2xl font-cinzel text-gold mb-6">Upload Document</h2>

                    {/* Upload Type Toggle */}
                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={() => setUploadType('text')}
                            className={`px-6 py-3 rounded-lg transition-all ${uploadType === 'text'
                                    ? 'bg-gold/20 text-gold border border-gold/30'
                                    : 'bg-white/5 text-silver/60 hover:bg-white/10'
                                }`}
                        >
                            📝 Text
                        </button>
                        <button
                            onClick={() => setUploadType('pdf')}
                            className={`px-6 py-3 rounded-lg transition-all ${uploadType === 'pdf'
                                    ? 'bg-gold/20 text-gold border border-gold/30'
                                    : 'bg-white/5 text-silver/60 hover:bg-white/10'
                                }`}
                        >
                            📄 PDF
                        </button>
                    </div>

                    {/* Category Select */}
                    <div className="mb-6">
                        <label className="block text-sm text-silver/60 mb-2">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-silver focus:border-gold/50 focus:outline-none"
                        >
                            <option value="horoscope">Horoscope</option>
                            <option value="tarot">Tarot</option>
                            <option value="natal">Natal Chart</option>
                        </select>
                    </div>

                    {/* Text Upload Form */}
                    {uploadType === 'text' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-silver/60 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Document title"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-silver focus:border-gold/50 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-silver/60 mb-2">Content</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Document content..."
                                    rows={10}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-silver focus:border-gold/50 focus:outline-none resize-none"
                                />
                            </div>
                            <button
                                onClick={handleTextUpload}
                                disabled={uploading || !title || !content}
                                className="w-full px-6 py-3 bg-gold/20 text-gold border border-gold/30 rounded-lg hover:bg-gold/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploading ? 'Uploading...' : 'Upload Text Document'}
                            </button>
                        </div>
                    )}

                    {/* PDF Upload Form */}
                    {uploadType === 'pdf' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-silver/60 mb-2">PDF File</label>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-silver focus:border-gold/50 focus:outline-none"
                                />
                            </div>
                            <button
                                onClick={handlePdfUpload}
                                disabled={uploading || !file}
                                className="w-full px-6 py-3 bg-gold/20 text-gold border border-gold/30 rounded-lg hover:bg-gold/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploading ? 'Uploading...' : 'Upload PDF Document'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Documents List */}
                <div className="glass rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-cinzel text-gold">Existing Documents</h2>
                        <div className="flex gap-4">
                            {/* Search */}
                            <input
                                type="text"
                                placeholder="Search documents..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-silver focus:border-gold/50 focus:outline-none"
                            />
                            {/* Filter */}
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-silver focus:border-gold/50 focus:outline-none"
                            >
                                <option value="all">All Categories</option>
                                <option value="horoscope">Horoscope</option>
                                <option value="tarot">Tarot</option>
                                <option value="natal">Natal Chart</option>
                                <option value="numerology">Numerology</option>
                                <option value="dream">Dream</option>
                                <option value="runes">Runes</option>
                                <option value="iching">I Ching</option>
                                <option value="lenormand">Lenormand</option>
                            </select>
                        </div>
                    </div>
                    
                    {loading ? (
                        <div className="text-center py-8 text-silver/60">Loading documents...</div>
                    ) : filteredDocuments.length === 0 ? (
                        <div className="text-center py-8 text-silver/60">No documents found</div>
                    ) : (
                        <div className="space-y-3">
                            {filteredDocuments.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                                >
                                    <div>
                                        <h3 className="text-silver font-medium">{doc.title}</h3>
                                        <p className="text-xs text-silver/60 mt-1">
                                            Category: <span className="text-turquoise">{doc.category || 'N/A'}</span>
                                            {doc.source && ` • Source: ${doc.source}`}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(doc.id)}
                                        className="px-4 py-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
