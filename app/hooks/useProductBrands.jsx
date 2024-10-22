import { useState, useEffect, useCallback } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useProductBrands = (offset = 0, limit = 100000) => {
  const [productBrands, setProductBrands] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBrands = useCallback(async (offset, limit) => {
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
        params: {
          offset: offset,
          limit: limit,
        },
      });
      setProductBrands(response.data.results || []);
      setTotalCount(response.data.count);
    } catch (err) {
      if (err.response && err.response.data.detail === "Usted no tiene permiso para realizar esta acción.") {
        setError("No tiene permisos para esta acción.");
      } else {
        setError("Error al cargar las marcas de productos..");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands(offset, limit);
  }, [offset, limit, fetchBrands]);

  return { productBrands, totalCount, loading, error, fetchBrands };
};

export default useProductBrands;
