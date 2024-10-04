import { useState, useEffect, useCallback } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get('/expenses/', {
        headers: {
          Authorization: `Token ${token}`,
        }
      });
      setExpenses(response.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar los gastos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return { expenses, loading, error, refetch: fetchExpenses };
};

export default useExpenses;
