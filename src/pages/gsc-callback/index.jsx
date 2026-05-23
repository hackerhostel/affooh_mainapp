import { useEffect } from 'react';

const GSCCallback = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');

    if (window.opener) {
      window.opener.postMessage(
        { type: 'GSC_OAUTH_CALLBACK', code, state, error },
        window.location.origin
      );
      window.close();
    } else {
      // Fallback: redirect to agents page if popup opener is gone
      window.location.replace('/agents');
    }
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#666' }}>
      Connecting Google Search Console…
    </div>
  );
};

export default GSCCallback;
