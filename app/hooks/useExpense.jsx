import { useState, useEffect } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useExpense = (expenseId) => {
  const [expense, setExpense] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExpense = async (id) => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get(`/expenses/${id}`, {
        headers: {
          Authorization: `Token ${token}`,
        }
      });
      setExpense(response.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar el gasto.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (expenseId) {
        fetchExpense(expenseId);
    }
  }, [expenseId]);

  return { expense, loading, error, fetchExpense };
};

export default useExpense;