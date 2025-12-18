import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const useFetchAvailableTasks = () => {
  
  const [loadingAvailableTasks, setLoadingAvailableTasks] = useState(false);

  // Fetch available template tasks (all tasks with isTemplate = TRUE)
  const fetchAvailableTasks = useCallback(async (organizationID) => {
    if (!organizationID) return null;
    
    setLoadingAvailableTasks(true);
    try {
      const response = await axios.get(`/templates/tasks?organizationID=${organizationID}`);
      return response.data.tasks || [];
    } catch (error) {
      toast.error('Failed to load available tasks');
      return null;
    } finally {
      setLoadingAvailableTasks(false);
    }
  }, []);

  return {
    fetchAvailableTasks,
    loadingAvailableTasks
  };
};

export default useFetchAvailableTasks;

