import { useState, useEffect } from 'react';
import api from '../axios';
import Cookies from 'js-cookie';

const useUser = (username) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUser = async (username) => {
    setLoading(true);
    setError(null);

    const token = Cookies.get('access_token');
    try {
      const response = await api.get(`/users/${username}/`, {
        headers: {
          Authorization: `Token ${token}`,
        }
      });
      setUser(response.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar el usuario.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchUser(username);
    }
  }, [username]);

  return { user, loading, error, fetchUser };
};

export default useUser;
