import React, { useState, useEffect } from 'react';
import { HelpCircle, Search, Tag, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import api from '../../services/api';

const FAQsView = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const categories = ['Academic', 'Admission', 'Fees', 'Hostel', 'Library', 'Technical', 'General'];

  useEffect(() => {
    fetchFAQs();
  }, []);
  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/faqs');
      if (response.data.success) {
        setFaqs((response.data.data || []).filter(faq => faq.is_active));
      } else {
        console.error('Failed to fetch FAQs');
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (faqId) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Academic': 'bg-blue-100 text-blue-800',
      'Admission': 'bg-green-100 text-green-800',
      'Fees': 'bg-yellow-100 text-yellow-800',
      'Hostel': 'bg-purple-100 text-purple-800',
      'Library': 'bg-indigo-100 text-indigo-800',
      'Technical': 'bg-gray-100 text-gray-800',
      'General': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryStats = () => {
    return categories.map(category => ({
      category,
      count: faqs.filter(faq => faq.category === category).length
    })).filter(stat => stat.count > 0);
  };

  const popularFAQs = faqs.slice(0, 5); // Assuming first 5 are most popular

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <HelpCircle className="mr-3 text-teal-600" />
                Frequently Asked Questions
              </h1>
              <p className="text-gray-600 mt-2">Find answers to common questions about university services</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-teal-100">
                <HelpCircle className="text-teal-600" size={24} />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{faqs.length}</div>
                <div className="text-gray-600 text-sm">Total FAQs</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Tag className="text-blue-600" size={24} />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{categories.length}</div>
                <div className="text-gray-600 text-sm">Categories</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <MessageCircle className="text-green-600" size={24} />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{filteredFAQs.length}</div>
                <div className="text-gray-600 text-sm">Results</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Search className="text-purple-600" size={24} />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {searchTerm ? filteredFAQs.length : '-'}
                </div>
                <div className="text-gray-600 text-sm">Search Results</div>
              </div>
            </div>
          </div>
        </div>

        {/* Popular FAQs */}
        {!searchTerm && !selectedCategory && (
          <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg shadow-lg p-6 mb-6 text-white">
            <h2 className="text-2xl font-bold mb-4">🔥 Most Popular Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularFAQs.slice(0, 3).map(faq => (
                <div key={faq.id} className="bg-white bg-opacity-20 rounded-lg p-4">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-2 ${getCategoryColor(faq.category)} bg-opacity-80`}>
                    {faq.category}
                  </div>
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">{faq.question}</h3>
                  <button 
                    onClick={() => toggleFAQ(faq.id)}
                    className="text-xs text-cyan-100 hover:text-white"
                  >
                    Click to expand
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Overview */}
        {!searchTerm && !selectedCategory && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Browse by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {getCategoryStats().map(({ category, count }) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-colors duration-200"
                >
                  <div className="text-center">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-2 ${getCategoryColor(category)}`}>
                      {category}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-600">Questions</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results Header */}
        {(searchTerm || selectedCategory) && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {filteredFAQs.length} FAQ{filteredFAQs.length !== 1 ? 's' : ''} found
                  {searchTerm && ` for "${searchTerm}"`}
                  {selectedCategory && ` in ${selectedCategory}`}
                </h2>
              </div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
                className="text-teal-600 hover:text-teal-800 text-sm font-medium"
              >
                Clear filters
              </button>
            </div>
          </div>
        )}

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQs.map(faq => (
            <div key={faq.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              <div 
                className="p-6 cursor-pointer"
                onClick={() => toggleFAQ(faq.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(faq.category)}`}>
                        <Tag className="w-3 h-3 mr-1" />
                        {faq.category}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                    {expandedFAQ === faq.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="prose max-w-none">
                          <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    {expandedFAQ === faq.id ? (
                      <ChevronUp className="text-gray-400" size={20} />
                    ) : (
                      <ChevronDown className="text-gray-400" size={20} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredFAQs.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No FAQs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedCategory 
                ? "Try adjusting your search or filter criteria."
                : "No frequently asked questions are available at this time."
              }
            </p>
            {(searchTerm || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
                className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                View All FAQs
              </button>
            )}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6">
          <div className="text-center">
            <HelpCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Still need help?</h3>
            <p className="text-gray-600 mb-4">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500">
                Contact Support
              </button>
              <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500">
                Submit Question
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQsView;
