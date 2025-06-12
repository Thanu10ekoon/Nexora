import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const MenusViewTest = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/menus');
      if (response.data.success) {
        setMenus(response.data.data || []);
      } else {
        setError('Failed to fetch menus');
      }
    } catch (error) {
      console.error('Error fetching menus:', error);
      setError('Failed to fetch menus');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading menus...</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchMenus}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Cafeteria Menus (Test)</h1>
      
      {menus.length === 0 ? (
        <p>No menus found</p>
      ) : (
        <div className="grid gap-4">
          {menus.map(menu => (
            <div key={menu.id} className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold">{menu.item_name}</h3>
              <p className="text-gray-600">{menu.description}</p>
              <div className="flex justify-between mt-2">
                <span className="font-bold text-green-600">LKR{menu.price}</span>
                <span className="text-sm text-gray-500">{menu.meal_type}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenusViewTest;
