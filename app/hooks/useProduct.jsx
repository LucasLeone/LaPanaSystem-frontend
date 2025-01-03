import { useState, useEffect } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useProduct = (productSlug) => {
  const [product, setProduct] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProduct = async (slug) => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get(`/products/${slug}`, {
        headers: {
          Authorization: `Token ${token}`,
        }
      });
      setProduct(response.data);
    } catch (err) {
      if (err.response && err.response.data.detail === "Usted no tiene permiso para realizar esta acción.") {
        setError("No tiene permisos para esta acción.");
      } else {
        setError("Error al cargar el producto.");
      }
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (productSlug) {
        fetchProduct(productSlug);
    }
  }, [productSlug]);

  return { product, loading, error, fetchProduct };
};

export default useProduct;