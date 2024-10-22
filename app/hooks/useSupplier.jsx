import { useState, useEffect } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useSupplier = (supplierId) => {
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSupplier = async (id) => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get(`/suppliers/${id}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setSupplier(response.data);
    } catch (err) {
      if (err.response && err.response.data.detail === "Usted no tiene permiso para realizar esta acción.") {
        setError("No tiene permisos para esta acción.");
      } else {
        setError("Error al cargar el proveedor.");
      }
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
