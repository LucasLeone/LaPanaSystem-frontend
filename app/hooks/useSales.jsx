import { useState, useEffect } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useSales = (filters = {}) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSales = async (filters) => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');

    const queryParams = new URLSearchParams();

    if (filters.state) {
      queryParams.append('state', filters.state);
    }

    if (filters.date) {
      queryParams.append('date', filters.date);
    }

    if (filters.search) {
      queryParams.append('search', filters.search);
    }

    if (filters.ordering) {
      queryParams.append('ordering', filters.ordering);
    }

    if (filters.sale_type) {
      queryParams.append('sale_type', filters.sale_type);
    }

    if (filters.start_date) {
      queryParams.append('start_date', filters.start_date);
    }

    if (filters.end_date) {
      queryParams.append('end_date', filters.end_date);
    }

    if (filters.min_total !== undefined && filters.min_total !== null) {
      queryParams.append('min_total', filters.min_total);
    }

    if (filters.max_total !== undefined && filters.max_total !== null) {
      queryParams.append('max_total', filters.max_total);
    }

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

    try {
      const response = await api.get(`/sales/${queryString}`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setSales(response.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar las ventas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  return { sales, loading, error, fetchSales };
};

export default useSales;
