import { useState, useEffect, useCallback } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useProducts = (filters = {}, offset = 0, limit = 100000) => {
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async (filters, offset, limit) => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');

    const queryParams = new URLSearchParams();

    Object.keys(filters).forEach((key) => {
      queryParams.append(key, filters[key]);
    });
    queryParams.append('offset', offset);
    queryParams.append('limit', limit);

    const queryString = `?${queryParams.toString()}`;

    try {
      const response = await api.get(`/products/${queryString}`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      setProducts(response.data.results);
      setTotalCount(response.data.count);
    } catch (err) {
      console.error(err);
      setError('Error al cargar los productos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(filters, offset, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters), fetchProducts, limit, offset]);

  return { products, totalCount, loading, error, fetchProducts };
};

export default useProducts;