import { useState, useEffect } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useProductBrand = (productBrandId) => {
  const [productBrand, setProductBrand] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProductBrand = async (id) => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get(`/product-brands/${id}`, {
        headers: {
          Authorization: `Token ${token}`,
        }
      });
      setProductBrand(response.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar la marca.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (productBrandId) {
        fetchProductBrand(productBrandId);
    }
  }, [productBrandId]);

  return { productBrand, loading, error, fetchProductBrand };
};

export default useProductBrand;