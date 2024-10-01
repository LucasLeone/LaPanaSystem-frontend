import { useState, useEffect } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useReturns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReturns = async () => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get('/returns/', {
        headers: {
          Authorization: `Token ${token}`,
        }
      });
      setReturns(response.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar las devoluciones.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchReturns();
  }, []);

  return { returns, loading, error, fetchReturns };
};

export default useReturns;