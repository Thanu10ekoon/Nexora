import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const FAQsManagement = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    keywords: [],
    isActive: true
  });

  const categories = [
    'Academic',
    'Admission',
    'Fee & Payment',
    'Examination',
    'Campus Life',
    'Transportation',
    'Cafeteria',
    'Library',
    'Hostel',
    'Technical Support',
    'General'
  ];

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/faqs');
      setFaqs(response.data.data || []);
    } catch (err) {
      setError('Failed to load FAQs');
      console.error('FAQs error:', err);
    } finally {
      setLoading(false);
    }
  };
  const openModal = (faq = null) => {
    if (faq) {
      setEditingFaq(faq);
      setFormData({
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        keywords: faq.keywords ? JSON.parse(faq.keywords) : [],
        isActive: faq.is_active
      });
    } else {
      setEditingFaq(null);
      setFormData({
        question: '',
        answer: '',
        category: '',
        keywords: [],
        isActive: true
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingFaq(null);
    setError('');
  };
  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    if (e.target.name === 'keywords') {
      // Handle keywords as comma-separated string
      const keywordsArray = value.split(',').map(k => k.trim()).filter(k => k);
      setFormData({
        ...formData,
        keywords: keywordsArray
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFaq) {
        await api.put(`/faqs/${editingFaq.id}`, formData);
      } else {
        await api.post('/faqs', formData);
      }
      fetchFaqs();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save FAQ');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        await api.delete(`/faqs/${id}`);
        fetchFaqs();
      } catch (err) {
        setError('Failed to delete FAQ');
      }
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      await api.put(`/faqs/${id}`, { is_active: !currentStatus });
      fetchFaqs();
    } catch (err) {
      setError('Failed to update FAQ status');
    }
  };

  // Filter FAQs based on search term and category
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group FAQs by category
  const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {});

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">FAQs Management</h1>
            <p className="mt-2 text-gray-600">Manage frequently asked questions</p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            Add New FAQ
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Search and Filter */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search FAQs</label>
              <input
                type="text"
                placeholder="Search questions and answers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* FAQs by Category */}
        {Object.keys(groupedFaqs).length > 0 ? (
          <div className="space-y-8">
            {Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
              <div key={category} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-200">
                  <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                  <p className="text-sm text-indigo-700">{categoryFaqs.length} FAQ{categoryFaqs.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="divide-y divide-gray-200">
                  {categoryFaqs
                    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                    .map((faq) => (
                    <div key={faq.id} className={`p-6 ${!faq.is_active ? 'opacity-60 bg-gray-50' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h4 className="text-lg font-medium text-gray-900 mr-3">{faq.question}</h4>
                            {!faq.is_active && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                Inactive
                              </span>
                            )}
                            {faq.display_order > 0 && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 ml-2">
                                Order: {faq.display_order}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap">{faq.answer}</p>
                        </div>
                        <div className="ml-4 flex items-center space-x-2">
                          <button
                            onClick={() => toggleActive(faq.id, faq.is_active)}
                            className={`text-sm font-medium ${
                              faq.is_active 
                                ? 'text-red-600 hover:text-red-900' 
                                : 'text-green-600 hover:text-green-900'
                            }`}
                          >
                            {faq.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => openModal(faq)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(faq.id)}
                            className="text-red-600 hover:text-red-900 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No FAQs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedCategory ? 'Try adjusting your search or filter.' : 'Get started by creating your first FAQ.'}
            </p>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Question</label>
                    <input
                      type="text"
                      name="question"
                      value={formData.question}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Answer</label>
                    <textarea
                      name="answer"
                      value={formData.answer}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Category</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Display Order</label>
                      <input
                        type="number"
                        name="display_order"
                        value={formData.display_order}
                        onChange={handleInputChange}
                        min="0"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <p className="mt-1 text-sm text-gray-500">Lower numbers appear first (0 = no specific order)</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Active (visible to users)
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {editingFaq ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQsManagement;
