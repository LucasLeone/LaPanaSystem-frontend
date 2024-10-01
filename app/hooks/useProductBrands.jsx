import { useState, useEffect } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useProductBrands = () => {
  const [productBrands, setProductBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProductBrands = async () => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get('/product-brands/', {
        headers: {
          Authorization: `Token ${token}`,
        }
      });
      setProductBrands(response.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar las marcas.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchProductBrands();
  }, []);

  return { productBrands, loading, error, fetchProductBrands };
};

export default useProductBrands;