import { useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const useFetchData = () => {
  

  // Generic fetch function for custom endpoints
  const fetchData = useCallback(async (endpoint, loadingSetter, errorMessage = 'Failed to fetch data') => {
    if (!endpoint) return null;
    
    if (loadingSetter) loadingSetter(true);
    try {
      const response = await axios.get(endpoint);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.error || errorMessage);
      return null;
    } finally {
      if (loadingSetter) loadingSetter(false);
    }
  }, []);

  return {
    fetchData
  };
};

export default useFetchData;

