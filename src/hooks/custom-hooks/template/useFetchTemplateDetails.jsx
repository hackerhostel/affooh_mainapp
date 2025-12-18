import { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const useFetchTemplateDetails = () => {
  
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  // Fetch template details
  const fetchTemplateDetails = useCallback(async (templateID) => {
    if (!templateID) return null;
    
    setLoadingTemplate(true);
    try {
      const response = await axios.get(`/templates/${templateID}`);
      return response.data.template;
    } catch (error) {
      toast.error('Failed to load template details');
      return null;
    } finally {
      setLoadingTemplate(false);
    }
  }, []);

  return {
    fetchTemplateDetails,
    loadingTemplate
  };
};

export default useFetchTemplateDetails;

