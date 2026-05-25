import { useEffect } from 'react';

const GSCCallback = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const message = params.get('message');

    if (status === 'error' && message) {
      alert("GSC Connection Failed: " + message);
    }

    if (window.opener) {
      window.opener.postMessage(
        { type: 'GSC_OAUTH_CALLBACK', status },
        '*'
      );
    }
    window.close();
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#666' }}>
      Connecting Google Search Console…
    </div>
  );
};

export default GSCCallback;
