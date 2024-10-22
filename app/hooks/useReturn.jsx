import { useState, useEffect } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useReturn = (returnId) => {
  const [return_, setReturn] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReturn = async (id) => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get(`/returns/${id}`, {
        headers: {
          Authorization: `Token ${token}`,
        }
      });
      setReturn(response.data);
    } catch (err) {
      if (err.response && err.response.data.detail === "Usted no tiene permiso para realizar esta acción.") {
        setError("No tiene permisos para esta acción.");
      } else {
        setError("Error al cargar la devolución.");
      }
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (returnId) {
        fetchReturn(returnId);
    }
  }, [returnId]);

  return { return_, loading, error, fetchReturn };
};

export default useReturn;