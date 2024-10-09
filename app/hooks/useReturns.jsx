import { useState, useEffect, useCallback } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useReturns = (filters = {}, offset = 0, limit = 0) => {
  const [returns, setReturns] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReturns = useCallback(async (filters, offset, limit) => {
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
      const response = await api.get(`/returns/${queryString}`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      setReturns(response.data.results);
      setTotalCount(response.data.count);
    } catch (err) {
      console.error(err);
      setError('Error al cargar las devoluciones.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReturns(filters, offset, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, limit, fetchReturns, JSON.stringify(filters)]);

  return { returns, totalCount, loading, error, fetchReturns };
};

export default useReturns;