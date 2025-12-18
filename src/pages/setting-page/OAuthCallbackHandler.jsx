import React, { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const OAuthCallbackHandler = () => {
  const history = useHistory();
  const location = useLocation();
  

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');

      if (error) {
        addToast(
          errorDescription || 'OAuth authorization failed. Please try again.',
          { appearance: 'error' }
        );
        history.replace('/settings?view=oauthSettings&oauth=error');
        return;
      }

      if (!code || !state) {
        toast.error();
        history.replace('/settings?view=oauthSettings&oauth=error');
        return;
      }

      try {
        // Call backend callback endpoint
        // Note: This endpoint is public (no auth required)
        const response = await axios.get('/oauth/callback', {
          params: {
            code,
            state,
          },
        });

        if (response.data.body?.success) {
          // Redirect to settings page with success message
          toast.success();
          history.replace('/settings?view=oauthSettings&oauth=success');
        } else {
          throw new Error('OAuth callback failed');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        addToast(
          error.response?.data?.body?.error || 
          error.response?.data?.body?.message ||
          'Failed to complete OAuth authorization',
          { appearance: 'error' }
        );
        history.replace('/settings?view=oauthSettings&oauth=error');
      }
    };

    handleCallback();
  }, [location.search, history, addToast]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-pink mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authorization...</p>
      </div>
    </div>
  );
};

export default OAuthCallbackHandler;


