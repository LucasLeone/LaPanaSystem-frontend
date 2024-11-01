import { useState, useEffect, useCallback } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useStatistics = (filters = {}) => {
  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStatistics = useCallback(async (filters) => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');

    const queryParams = new URLSearchParams();

    Object.keys(filters).forEach((key) => {
      queryParams.append(key, filters[key]);
    });

    const queryString = `?${queryParams.toString()}`;

    try {
      const response = await api.get(`/sales/statistics/${queryString}`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      setStatistics(response.data.statistics);
    } catch (err) {
      if (err.response && err.response.data.detail === "Usted no tiene permiso para realizar esta acción.") {
        setError("No tiene permisos para esta acción.");
      } else {
        setError("Error al cargar las estadísticas.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters), fetchStatistics]);

  return { statistics, loading, error, fetchStatistics };
};

export default useStatistics;