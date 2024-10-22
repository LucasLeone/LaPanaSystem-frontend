import { useState, useEffect, useCallback } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useExpenseCategories = (offset = 0, limit = 100000) => {
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExpenseCategories = useCallback(async (offset, limit) => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get('/expense-categories/', {
        headers: {
          Authorization: `Token ${token}`,
        },
        params: {
          offset: offset,
          limit: limit,
        },
      });
      setExpenseCategories(response.data.results || []);
      setTotalCount(response.data.count);
    } catch (err) {
      if (err.response && err.response.data.detail === "Usted no tiene permiso para realizar esta acción.") {
        setError("No tiene permisos para esta acción.");
      } else {
        setError("Error al cargar las categorías de gasto.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenseCategories(offset, limit);
  }, [offset, limit, fetchExpenseCategories]);

  return { expenseCategories, totalCount, loading, error, fetchExpenseCategories };
};

export default useExpenseCategories;