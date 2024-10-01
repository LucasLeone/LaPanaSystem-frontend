import { useState, useEffect } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useCustomer = (userId) => {
  const [customer, setCustomer] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCustomer = async (id) => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get(`/customers/${id}/`, {
        headers: {
          Authorization: `Token ${token}`,
        }
      });
      setCustomer(response.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar el cliente.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (userId) {
        fetchCustomer(userId);
    }
  }, [userId]);

  return { customer, loading, error, fetchCustomer };
};

export default useCustomer;