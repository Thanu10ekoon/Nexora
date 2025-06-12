import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const UpdatesManagement = () => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState(null);  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    category: '',
    priority: 'medium',
    targetAudience: 'all',
    publishDate: '',
    expiryDate: '',
    isPublished: true
  });

  const categories = [
    'Academic',
    'Administrative',
    'Emergency',
    'General',
    'Examination',
    'Fee',
    'Admission',
    'Placement',
    'Other'
  ];
  const priorities = [
    { value: 'low', label: 'Low', class: 'bg-gray-100 text-gray-800' },
    { value: 'medium', label: 'Medium', class: 'bg-blue-100 text-blue-800' },
    { value: 'high', label: 'High', class: 'bg-yellow-100 text-yellow-800' },
    { value: 'urgent', label: 'Urgent', class: 'bg-red-100 text-red-800' }
  ];

  const audiences = [
    { value: 'all', label: 'All' },
    { value: 'students', label: 'Students' },
    { value: 'faculty', label: 'Faculty' },
    { value: 'staff', label: 'Staff' }
  ];

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/updates');
      setUpdates(response.data.data || []);
    } catch (err) {
      setError('Failed to load updates');
      console.error('Updates error:', err);
    } finally {
      setLoading(false);
    }
  };
  const openModal = (update = null) => {
    if (update) {
      setEditingUpdate(update);
      setFormData({
        title: update.title,
        content: update.content,
        summary: update.summary || '',
        category: update.category,
        priority: update.priority,
        targetAudience: update.target_audience || 'all',
        publishDate: update.publish_date ? update.publish_date.split('T')[0] : '',
        expiryDate: update.expiry_date ? update.expiry_date.split('T')[0] : '',
        isPublished: update.is_published
      });
    } else {
      setEditingUpdate(null);
      setFormData({
        title: '',
        content: '',
        summary: '',
        category: '',
        priority: 'medium',
        targetAudience: 'all',
        publishDate: '',
        expiryDate: '',
        isPublished: true
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUpdate(null);
    setError('');
  };

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUpdate) {
        await api.put(`/updates/${editingUpdate.id}`, formData);
      } else {
        await api.post('/updates', formData);
      }
      fetchUpdates();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save update');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this update?')) {
      try {
        await api.delete(`/updates/${id}`);
        fetchUpdates();
      } catch (err) {
        setError('Failed to delete update');
      }
    }
  };

  const togglePublished = async (id, currentStatus) => {
    try {
      await api.put(`/updates/${id}`, { is_published: !currentStatus });
      fetchUpdates();
    } catch (err) {
      setError('Failed to update publication status');
    }
  };

  const getPriorityClass = (priority) => {
    const priorityObj = priorities.find(p => p.value === priority);
    return priorityObj ? priorityObj.class : 'bg-gray-100 text-gray-800';
  };

  const isUpdateValid = (validUntil) => {
    if (!validUntil) return true;
    return new Date(validUntil) >= new Date();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">University Updates</h1>
            <p className="mt-2 text-gray-600">Manage announcements and updates</p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Add New Update
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Updates List */}
        <div className="space-y-6">
          {updates.map((update) => (
            <div key={update.id} className={`bg-white shadow rounded-lg overflow-hidden ${!update.is_published ? 'opacity-60' : ''}`}>
              <div className="px-6 py-4 bg-red-50 border-b border-red-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityClass(update.priority)}`}>
                      {update.priority.charAt(0).toUpperCase() + update.priority.slice(1)}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                      {update.category}
                    </span>
                    {!update.is_published && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        Draft
                      </span>
                    )}
                    {update.expiry_date && !isUpdateValid(update.expiry_date) && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        Expired
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(update.created_at).toLocaleDateString()}
                    {update.valid_until && (
                      <span className="ml-2">
                        • Valid until {new Date(update.valid_until).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mt-2">{update.title}</h3>
              </div>
              <div className="p-6">
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{update.content}</p>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-6">
                  <button
                    onClick={() => togglePublished(update.id, update.is_published)}
                    className={`text-sm font-medium ${
                      update.is_published 
                        ? 'text-red-600 hover:text-red-900' 
                        : 'text-green-600 hover:text-green-900'
                    }`}
                  >
                    {update.is_published ? 'Unpublish' : 'Publish'}
                  </button>
                  <div className="space-x-2">
                    <button
                      onClick={() => openModal(update)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(update.id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {updates.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No updates</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new update.</p>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingUpdate ? 'Edit Update' : 'Add New Update'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    />
                  </div>                  <div>
                    <label className="block text-sm font-medium text-gray-700">Content</label>
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Summary (Optional)</label>
                    <textarea
                      name="summary"
                      value={formData.summary}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="Brief summary of the update..."
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
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
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Priority</label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                      >
                        {priorities.map(priority => (
                          <option key={priority.value} value={priority.value}>{priority.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Target Audience</label>
                      <select
                        name="targetAudience"
                        value={formData.targetAudience}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                      >
                        {audiences.map(audience => (
                          <option key={audience.value} value={audience.value}>{audience.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Publish Date</label>
                      <input
                        type="date"
                        name="publishDate"
                        value={formData.publishDate}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expiry Date (Optional)</label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">Leave empty if the update should remain valid indefinitely</p>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isPublished"
                      checked={formData.isPublished}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Publish immediately
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
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      {editingUpdate ? 'Update' : 'Create'}
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

export default UpdatesManagement;
