import { useState, useEffect } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSuppliers = async () => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get('/suppliers/', {
        headers: {
          Authorization: `Token ${token}`,
        }
      });
      setSuppliers(response.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar los proveedores.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchSuppliers();
  }, []);

  return { suppliers, loading, error, fetchSuppliers };
};

export default useSuppliers;