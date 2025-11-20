import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

const useFetch = (url) => {
  const [data, setData] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (url && !url.includes('undefined')) {
      try {
        let tmpURL = url;
        setData({});
        setLoading(true);
        setError('');
        const response = await axios.get(tmpURL);
        setData(response.body);
      } catch (err) {
        setError(
          err?.response?.data?.msg ||
            err?.response?.data?.message ||
            (err?.response?.data?.error) ||
            (err?.message),
        );
      } finally {
        setLoading(false);
      }
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, loading, reFetch: fetchData };
};

export default useFetch;
