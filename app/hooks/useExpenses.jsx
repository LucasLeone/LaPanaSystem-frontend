import { useState, useEffect, useCallback } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useExpenses = (filters = {}, offset = 0, limit = 100000) => {
  const [expenses, setExpenses] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExpenses = useCallback(async (filters, offset, limit) => {
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
      const response = await api.get(`/expenses/${queryString}`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setExpenses(response.data.results);
      setTotalCount(response.data.count);
    } catch (err) {
      console.error(err);
      setError('Error al cargar los gastos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses(filters, offset, limit);
  }, [filters, offset, limit, fetchExpenses]);

  return { expenses, totalCount, loading, error, refetch: fetchExpenses };
};

export default useExpenses;
