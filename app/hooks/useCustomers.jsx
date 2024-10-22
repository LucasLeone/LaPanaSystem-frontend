import { useState, useEffect, useCallback } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useCustomers = (filters = {}, offset = 0, limit = 100000) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);

  const fetchCustomers = useCallback(async (filters, offset, limit) => {
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
      const response = await api.get(`/customers/${queryString}`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setCustomers(response.data.results || []);
      setTotalCount(response.data.count);
    } catch (err) {
      if (err.response && err.response.data.detail === "Usted no tiene permiso para realizar esta acción.") {
        setError("No tiene permisos para esta acción.");
      } else {
        setError("Error al cargar los clientes.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers(filters, offset, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, limit, fetchCustomers, JSON.stringify(filters)]);

  return { customers, totalCount, loading, error, fetchCustomers };
};

export default useCustomers;
