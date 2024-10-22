import { useState, useEffect } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useSale = (saleId) => {
  const [sale, setSale] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSale = async (id) => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get(`/sales/${id}/`, {
        headers: {
          Authorization: `Token ${token}`,
        }
      });
      setSale(response.data);
    } catch (err) {
      if (err.response && err.response.data.detail === "Usted no tiene permiso para realizar esta acción.") {
        setError("No tiene permisos para esta acción.");
      } else {
        setError("Error al cargar la venta.");
      }
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (saleId) {
        fetchSale(saleId);
    }
  }, [saleId]);

  return { sale, loading, error, fetchSale };
};

export default useSale;