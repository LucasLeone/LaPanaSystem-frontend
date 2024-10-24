import { useState, useEffect } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useExpenseCategory = (expenseCategoryId) => {
  const [expenseCategory, setExpenseCategory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExpenseCategory = async (id) => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get(`/expense-categories/${id}`, {
        headers: {
          Authorization: `Token ${token}`,
        }
      });
      setExpenseCategory(response.data);
    } catch (err) {
      if (err.response && err.response.data.detail === "Usted no tiene permiso para realizar esta acción.") {
        setError("No tiene permisos para esta acción.");
      } else {
        setError("Error al cargar la categoría de gasto.");
      }
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (expenseCategoryId) {
        fetchExpenseCategory(expenseCategoryId);
    }
  }, [expenseCategoryId]);

  return { expenseCategory, loading, error, fetchExpenseCategory };
};

export default useExpenseCategory;