import { useState, useEffect, useCallback } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useSales = (filters = {}, offset = 0, limit = 0) => {
  const [sales, setSales] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSales = useCallback(async (filters, offset, limit) => {
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
      const response = await api.get(`/sales/${queryString}`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      setSales(response.data.results || []);
      setTotalCount(response.data.count);
    } catch (err) {
      if (err.response && err.response.data.detail === "Usted no tiene permiso para realizar esta acción.") {
        setError("No tiene permisos para esta acción.");
      } else {
        setError("Error al cargar las ventas.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales(filters, offset, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters), offset, limit]);

  return { sales, totalCount, loading, error, fetchSales };
};

export default useSales;
