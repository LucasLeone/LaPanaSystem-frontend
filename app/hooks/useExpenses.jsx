import { useState, useEffect, useCallback } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useExpenses = (offset = 0, limit = 100000) => {
  const [expenses, setExpenses] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExpenses = useCallback(async (offset, limit) => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get('/expenses/', {
        headers: {
          Authorization: `Token ${token}`,
        },
        params: {
          offset: offset,
          limit: limit,
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
    fetchExpenses(offset, limit);
  }, [offset, limit, fetchExpenses]);

  return { expenses, totalCount, loading, error, refetch: fetchExpenses };
};

export default useExpenses;
