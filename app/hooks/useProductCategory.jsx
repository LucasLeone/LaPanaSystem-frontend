import { useState, useEffect } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useProductCategory = (productCategoryId) => {
  const [productCategory, setProductCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProductCategory = async (id) => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get(`/product-categories/${id}/`, {
        headers: {
          Authorization: `Token ${token}`,
        }
      });
      setProductCategory(response.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar la categoría.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productCategoryId) {
      fetchProductCategory(productCategoryId);
    }
  }, [productCategoryId]);

  return { productCategory, loading, error, fetchProductCategory };
};

export default useProductCategory;
