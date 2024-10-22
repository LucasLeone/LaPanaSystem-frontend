import { useState, useEffect } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useProductBrand = (productBrandId) => {
  const [productBrand, setProductBrand] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProductBrand = async (id) => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get(`/product-brands/${id}`, {
        headers: {
          Authorization: `Token ${token}`,
        }
      });
      setProductBrand(response.data);
    } catch (err) {
      if (err.response && err.response.data.detail === "Usted no tiene permiso para realizar esta acción.") {
        setError("No tiene permisos para esta acción.");
      } else {
        setError("Error al cargar la marca del producto.");
      }
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (productBrandId) {
        fetchProductBrand(productBrandId);
    }
  }, [productBrandId]);

  return { productBrand, loading, error, fetchProductBrand };
};

export default useProductBrand;