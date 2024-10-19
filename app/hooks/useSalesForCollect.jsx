// hooks/useSalesForCollect.js

import { useState, useEffect, useCallback } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useSalesForCollect = (filters = {}, offset = 0, limit = 10) => {
  const [salesForCollect, setSalesForCollect] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSalesForCollect = useCallback(async (filters, offset, limit) => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');

    const queryParams = new URLSearchParams();

    Object.keys(filters).forEach((key) => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    queryParams.append('offset', offset);
    queryParams.append('limit', limit);

    const queryString = `?${queryParams.toString()}`;

    try {
      const response = await api.get(`/sales/list-by-customer-for-collect/${queryString}`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      const customers = response.data.customers || [];
      setSalesForCollect(customers);
      setTotalCount(customers.length);
    } catch (err) {
      console.error(err);
      setError('Error al cargar las ventas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSalesForCollect(filters, offset, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters), offset, limit]);

  return { salesForCollect, totalCount, loading, error, fetchSalesForCollect };
};

export default useSalesForCollect;
