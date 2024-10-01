import { useState, useEffect } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get('/customers/', {
        headers: {
          Authorization: `Token ${token}`,
        }
      });
      setCustomers(response.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar los clientes.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchCustomers();
  }, []);

  return { customers, loading, error, fetchCustomers };
};

export default useCustomers;