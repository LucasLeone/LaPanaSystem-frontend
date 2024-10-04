import { useState, useEffect } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useSupplier = (supplierId) => {
  const [supplier, setSupplier] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSupplier = async (id) => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get(`/supplier/${id}`, {
        headers: {
          Authorization: `Token ${token}`,
        }
      });
      setSupplier(response.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar el proveedor.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (supplierId) {
        fetchSupplier(supplierId);
    }
  }, [supplierId]);

  return { supplier, loading, error, fetchSupplier };
};

export default useSupplier;