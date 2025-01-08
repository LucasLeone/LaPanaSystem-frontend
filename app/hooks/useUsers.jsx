import { useState, useEffect, useCallback } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useUsers = (filters = {}, offset = 0, limit = 100000) => {
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async (
    newFilters = {},
    newOffset = 0,
    newLimit = 100000
  ) => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    const queryParams = new URLSearchParams();

    Object.keys(newFilters).forEach((key) => {
      queryParams.append(key, newFilters[key]);
    });
    queryParams.append('offset', newOffset);
    queryParams.append('limit', newLimit);

    const queryString = `?${queryParams.toString()}`;
    try {
      const response = await api.get(`/users/${queryString}`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setUsers(response.data.results || []);
      setTotalCount(response.data.count);
    } catch (err) {
      if (err.response && err.response.data.detail === "Usted no tiene permiso para realizar esta acción.") {
        setError("No tiene permisos para esta acción.");
      } else {
        setError("Error al cargar los usuarios.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(filters, offset, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, limit, fetchUsers, JSON.stringify(filters)]);

  return { users, totalCount, loading, error, fetchUsers };
};

export default useUsers;