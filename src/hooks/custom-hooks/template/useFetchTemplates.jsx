import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const useFetchTemplates = () => {
  
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Fetch all templates for an organization
  const fetchTemplates = useCallback(async (organizationID) => {
    if (!organizationID) return null;
    
    setLoadingTemplates(true);
    try {
      const response = await axios.get(`/templates?organizationID=${organizationID}`);
      return response.data.templates || [];
    } catch (error) {
      toast.error('Failed to load templates');
      return null;
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

  return {
    fetchTemplates,
    loadingTemplates
  };
};

export default useFetchTemplates;

