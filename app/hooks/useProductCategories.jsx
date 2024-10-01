import { useState, useEffect } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useProductCategories = () => {
  const [productCategories, setProductCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProductCategories = async () => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get('/product-categories/', {
        headers: {
          Authorization: `Token ${token}`,
        }
      });
      setProductCategories(response.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar las categorias.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchProductCategories();
  }, []);

  return { productCategories, loading, error, fetchProductCategories };
};

export default useProductCategories;