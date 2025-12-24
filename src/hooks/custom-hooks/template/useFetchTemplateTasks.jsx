import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const useFetchTemplateTasks = () => {
  
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Fetch tasks for a specific template
  const fetchTemplateTasks = useCallback(async (templateID) => {
    if (!templateID) return null;
    
    setLoadingTasks(true);
    try {
      const response = await axios.get(`/templates/${templateID}/tasks`);
      return response.data.tasks || [];
    } catch (error) {
      toast.error('Failed to load template tasks');
      return null;
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  return {
    fetchTemplateTasks,
    loadingTasks
  };
};

export default useFetchTemplateTasks;

