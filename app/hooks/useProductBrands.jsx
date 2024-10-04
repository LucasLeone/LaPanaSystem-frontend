import { useState, useEffect, useCallback } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useProductBrands = () => {
  const [productBrands, setProductBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    if (!token) {
      setError('Token de acceso no encontrado.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/product-brands/', {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setProductBrands(response.data);
    } catch (err) {
      console.error('Error al cargar las marcas:', err);
      setError('Error al cargar las marcas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  return { productBrands, loading, error, fetchBrands };
};

export default useProductBrands;
