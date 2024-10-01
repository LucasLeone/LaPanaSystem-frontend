import { useState, useEffect } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useExpenseCategories = () => {
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExpenseCategories = async () => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get('/expense-categories/', {
        headers: {
          Authorization: `Token ${token}`,
        }
      });
      setExpenseCategories(response.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar las categorias de gastos.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchExpenseCategories();
  }, []);

  return { expenseCategories, loading, error, fetchExpenseCategories };
};

export default useExpenseCategories;