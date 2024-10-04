import { useState, useEffect, useCallback } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useProductCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    if (!token) {
      setError('Token de acceso no encontrado.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/product-categories/', {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setCategories(response.data);
    } catch (err) {
      console.error('Error al cargar las categorías:', err);
      setError('Error al cargar las categorías.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, fetchCategories };
};

export default useProductCategories;
