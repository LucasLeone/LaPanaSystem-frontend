import { useState, useEffect, useCallback } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useSuppliers = (offset = 0, limit = 100000) => {
  const [suppliers, setSuppliers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSuppliers = useCallback(async (offset, limit) => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get('/suppliers/', {
        headers: {
          Authorization: `Token ${token}`,
        },
        params: {
          offset: offset,
          limit: limit,
        },
      });
      setSuppliers(response.data.results || []);
      setTotalCount(response.data.count);
    } catch (err) {
      if (err.response && err.response.data.detail === "Usted no tiene permiso para realizar esta acción.") {
        setError("No tiene permisos para esta acción.");
      } else {
        setError("Error al cargar los proveedores.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers(offset, limit);
  }, [offset, limit, fetchSuppliers]);

  return { suppliers, totalCount, loading, error, fetchSuppliers };
};

export default useSuppliers;