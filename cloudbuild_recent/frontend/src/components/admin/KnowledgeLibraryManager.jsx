import React, { useState, useEffect } from 'react';

const KnowledgeLibraryManager = () => {
  const [knowledgeItems, setKnowledgeItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    content: '',
    category: 'business',
    subcategory: '',
    tags: [],
    source: 'admin'
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'business', label: 'Business & Strategy' },
    { value: 'marketing', label: 'Marketing & Sales' },
    { value: 'psychology', label: 'Psychology & NLP' },
    { value: 'creative', label: 'Creative & Content' },
    { value: 'technical', label: 'Technical & SEO' },
    { value: 'general', label: 'General Knowledge' }
  ];

  useEffect(() => {
    loadKnowledgeItems();
  }, []);

  const loadKnowledgeItems = async () => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/knowledge/items`, {
        headers: {
          'Authorization': `Bearer ${await window.firebaseAuth?.currentUser?.getIdToken()}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setKnowledgeItems(data.items || []);
      }
    } catch (err) {
      console.error('Failed to load knowledge items:', err);
      setMessage({ type: 'error', text: 'Failed to load knowledge items' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/knowledge/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await window.firebaseAuth?.currentUser?.getIdToken()}`
        },
        body: JSON.stringify(newItem)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Knowledge item uploaded successfully' });
        setNewItem({
          title: '',
          content: '',
          category: 'business',
          subcategory: '',
          tags: [],
          source: 'admin'
        });
        setShowUploadForm(false);
        loadKnowledgeItems();
      } else {
        setMessage({ type: 'error', text: 'Failed to upload knowledge item' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to upload knowledge item' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this knowledge item?')) return;
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/knowledge/items/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await window.firebaseAuth?.currentUser?.getIdToken()}`
        }
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Knowledge item deleted successfully' });
        loadKnowledgeItems();
      } else {
        setMessage({ type: 'error', text: 'Failed to delete knowledge item' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete knowledge item' });
    }
  };

  const filteredItems = knowledgeItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category) => {
    const colors = {
      business: 'bg-blue-100 text-blue-800',
      marketing: 'bg-green-100 text-green-800',
      psychology: 'bg-purple-100 text-purple-800',
      creative: 'bg-orange-100 text-orange-800',
      technical: 'bg-gray-100 text-gray-800',
      general: 'bg-indigo-100 text-indigo-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading knowledge library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            🧠 Agent Knowledge Library
          </h2>
          <p className="text-gray-600 mt-1">
            Manage the private knowledge base that powers your AI agents
          </p>
        </div>
        <button 
          onClick={() => setShowUploadForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          ➕ Add Knowledge
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' : 'bg-green-50 border border-green-200 text-green-800'}`}>
          {message.text}
        </div>
      )}

      {/* Upload Form */}
      {showUploadForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Add New Knowledge Item</h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="Knowledge item title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value, subcategory: '' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.filter(cat => cat.value !== 'all').map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                value={newItem.content}
                onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                placeholder="Enter the knowledge content..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={newItem.tags.join(', ')}
                onChange={(e) => setNewItem({ ...newItem, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) })}
                placeholder="strategy, growth, leadership"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                📤 Upload Knowledge
              </button>
              <button 
                type="button" 
                onClick={() => setShowUploadForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search knowledge items..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          </div>
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Knowledge Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <div className="flex gap-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                    {categories.find(cat => cat.value === item.category)?.label}
                  </span>
                  {item.subcategory && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {item.subcategory.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:text-red-700 p-1"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
            <p className="text-gray-600 text-sm line-clamp-3 mb-3">
              {item.content}
            </p>
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {item.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Usage: {item.usage_count || 0}</span>
              <span>Score: {item.effectiveness_score || 0}/5</span>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🧠</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No knowledge items found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Start building your agent knowledge library by adding your first knowledge item'
            }
          </p>
          <button onClick={() => setShowUploadForm(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 mx-auto">
            ➕ Add First Knowledge Item
          </button>
        </div>
      )}
    </div>
  );
};

export default KnowledgeLibraryManager;