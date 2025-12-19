import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import FormInput from '../../components/FormInput.jsx';
import { getAPIBaseURL } from '../../utils/commonUtils';
import axios from 'axios';
import {
  doGetOAuthCredentials,
  doSaveOAuthCredentials,
  selectOAuthCredentials,
  selectIsLoading
} from '../../state/slice/documentSlice';
import {
  doGetGitOAuthCredentials,
  doSaveGitOAuthCredentials,
  selectOAuthCredentials as selectGitOAuthCredentials,
  selectIsLoading as selectGitIsLoading
} from '../../state/slice/gitIntegrationSlice';

const OAuthSettings = () => {
  
  const dispatch = useDispatch();
  const location = useLocation();
  const oauthCredentials = useSelector(selectOAuthCredentials);
  const isLoading = useSelector(selectIsLoading);
  const gitOAuthCredentials = useSelector(selectGitOAuthCredentials);
  const gitIsLoading = useSelector(selectGitIsLoading);

  const [activeProvider, setActiveProvider] = useState('MS365');
  const [ms365FormValues, setMs365FormValues] = useState({
    clientID: '',
    clientSecret: '',
    tenantID: '',
    redirectUri: '',
  });
  const [googleFormValues, setGoogleFormValues] = useState({
    clientID: '',
    clientSecret: '',
    redirectUri: '',
  });
  const [githubFormValues, setGithubFormValues] = useState({
    clientID: '',
    clientSecret: '',
    redirectUri: '',
  });
  const [gitlabFormValues, setGitlabFormValues] = useState({
    clientID: '',
    clientSecret: '',
    redirectUri: '',
  });
  const [bitbucketFormValues, setBitbucketFormValues] = useState({
    clientID: '',
    clientSecret: '',
    redirectUri: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Auto-generate redirect URI
  const getDefaultRedirectUri = () => {
    const baseURL = getAPIBaseURL();
    return `${baseURL}/oauth/callback`;
  };

  // Auto-generate Git redirect URI
  const getDefaultGitRedirectUri = () => {
    const baseURL = getAPIBaseURL();
    return `${baseURL}/git/oauth/callback`;
  };

  useEffect(() => {
    // Load existing credentials for all providers
    dispatch(doGetOAuthCredentials('MS365'));
    dispatch(doGetOAuthCredentials('GOOGLE_DOCS'));
    dispatch(doGetGitOAuthCredentials('GITHUB'));
    dispatch(doGetGitOAuthCredentials('GITLAB'));
    dispatch(doGetGitOAuthCredentials('BITBUCKET'));
  }, [dispatch]);

  // Handle OAuth callback success
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const oauthStatus = urlParams.get('oauth');
    
    if (oauthStatus === 'success') {
      toast.success();
      // Clean up URL
      window.history.replaceState({}, '', '/settings?view=oauthSettings');
    } else if (oauthStatus === 'error') {
      toast.error();
      window.history.replaceState({}, '', '/settings?view=oauthSettings');
    }
  }, [location.search]);

  // Auto-populate redirect URI if empty
  useEffect(() => {
    const defaultRedirectUri = getDefaultRedirectUri();
    const defaultGitRedirectUri = getDefaultGitRedirectUri();
    
    if (!ms365FormValues.redirectUri && !oauthCredentials.MS365?.redirectUri) {
      setMs365FormValues(prev => ({
        ...prev,
        redirectUri: defaultRedirectUri
      }));
    }
    
    if (!googleFormValues.redirectUri && !oauthCredentials.GOOGLE_DOCS?.redirectUri) {
      setGoogleFormValues(prev => ({
        ...prev,
        redirectUri: defaultRedirectUri
      }));
    }

    if (!githubFormValues.redirectUri && !gitOAuthCredentials.GITHUB?.redirectUri) {
      setGithubFormValues(prev => ({
        ...prev,
        redirectUri: defaultGitRedirectUri
      }));
    }

    if (!gitlabFormValues.redirectUri && !gitOAuthCredentials.GITLAB?.redirectUri) {
      setGitlabFormValues(prev => ({
        ...prev,
        redirectUri: defaultGitRedirectUri
      }));
    }

    if (!bitbucketFormValues.redirectUri && !gitOAuthCredentials.BITBUCKET?.redirectUri) {
      setBitbucketFormValues(prev => ({
        ...prev,
        redirectUri: defaultGitRedirectUri
      }));
    }
  }, []);

  useEffect(() => {
    // Update form values when credentials are loaded
    if (oauthCredentials.MS365) {
      setMs365FormValues({
        clientID: oauthCredentials.MS365.clientID || '',
        clientSecret: oauthCredentials.MS365.clientSecret || '',
        tenantID: oauthCredentials.MS365.tenantID || '',
        redirectUri: oauthCredentials.MS365.redirectUri || '',
      });
    }
    if (oauthCredentials.GOOGLE_DOCS) {
      setGoogleFormValues({
        clientID: oauthCredentials.GOOGLE_DOCS.clientID || '',
        clientSecret: oauthCredentials.GOOGLE_DOCS.clientSecret || '',
        redirectUri: oauthCredentials.GOOGLE_DOCS.redirectUri || '',
      });
    }
    if (gitOAuthCredentials.GITHUB) {
      setGithubFormValues({
        clientID: gitOAuthCredentials.GITHUB.clientID || '',
        clientSecret: gitOAuthCredentials.GITHUB.clientSecret || '',
        redirectUri: gitOAuthCredentials.GITHUB.redirectUri || '',
      });
    }
    if (gitOAuthCredentials.GITLAB) {
      setGitlabFormValues({
        clientID: gitOAuthCredentials.GITLAB.clientID || '',
        clientSecret: gitOAuthCredentials.GITLAB.clientSecret || '',
        redirectUri: gitOAuthCredentials.GITLAB.redirectUri || '',
      });
    }
    if (gitOAuthCredentials.BITBUCKET) {
      setBitbucketFormValues({
        clientID: gitOAuthCredentials.BITBUCKET.clientID || '',
        clientSecret: gitOAuthCredentials.BITBUCKET.clientSecret || '',
        redirectUri: gitOAuthCredentials.BITBUCKET.redirectUri || '',
      });
    }
  }, [oauthCredentials, gitOAuthCredentials]);

  const handleMs365Change = ({ target: { name, value } }) => {
    // Clean clientID - remove http:// or https:// prefix if user accidentally includes it
    let cleanedValue = value;
    if (name === 'clientID' && value) {
      cleanedValue = value.replace(/^https?:\/\//, '').trim();
    }
    setMs365FormValues({ ...ms365FormValues, [name]: cleanedValue });
  };

  const handleGoogleChange = ({ target: { name, value } }) => {
    // Clean clientID - remove http:// or https:// prefix if user accidentally includes it
    let cleanedValue = value;
    if (name === 'clientID' && value) {
      cleanedValue = value.replace(/^https?:\/\//, '').trim();
    }
    setGoogleFormValues({ ...googleFormValues, [name]: cleanedValue });
  };

  const handleGithubChange = ({ target: { name, value } }) => {
    let cleanedValue = value;
    if (name === 'clientID' && value) {
      cleanedValue = value.replace(/^https?:\/\//, '').trim();
    }
    setGithubFormValues({ ...githubFormValues, [name]: cleanedValue });
  };

  const handleGitlabChange = ({ target: { name, value } }) => {
    let cleanedValue = value;
    if (name === 'clientID' && value) {
      cleanedValue = value.replace(/^https?:\/\//, '').trim();
    }
    setGitlabFormValues({ ...gitlabFormValues, [name]: cleanedValue });
  };

  const handleBitbucketChange = ({ target: { name, value } }) => {
    let cleanedValue = value;
    if (name === 'clientID' && value) {
      cleanedValue = value.replace(/^https?:\/\//, '').trim();
    }
    setBitbucketFormValues({ ...bitbucketFormValues, [name]: cleanedValue });
  };

  const handleSaveMs365 = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await dispatch(
        doSaveOAuthCredentials({
          provider: 'MS365',
          ...ms365FormValues,
        })
      ).unwrap();
      toast.success();
      dispatch(doGetOAuthCredentials('MS365'));
    } catch (error) {
      toast.error();
    }

    setIsSubmitting(false);
  };

  const handleSaveGoogle = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await dispatch(
        doSaveOAuthCredentials({
          provider: 'GOOGLE_DOCS',
          ...googleFormValues,
        })
      ).unwrap();
      toast.success();
      dispatch(doGetOAuthCredentials('GOOGLE_DOCS'));
    } catch (error) {
      toast.error();
    }

    setIsSubmitting(false);
  };

  const handleCancelMs365 = () => {
    if (oauthCredentials.MS365) {
      setMs365FormValues({
        clientID: oauthCredentials.MS365.clientID || '',
        clientSecret: oauthCredentials.MS365.clientSecret || '',
        tenantID: oauthCredentials.MS365.tenantID || '',
        redirectUri: oauthCredentials.MS365.redirectUri || '',
      });
    } else {
      setMs365FormValues({
        clientID: '',
        clientSecret: '',
        tenantID: '',
        redirectUri: '',
      });
    }
  };

  const handleCancelGoogle = () => {
    if (oauthCredentials.GOOGLE_DOCS) {
      setGoogleFormValues({
        clientID: oauthCredentials.GOOGLE_DOCS.clientID || '',
        clientSecret: oauthCredentials.GOOGLE_DOCS.clientSecret || '',
        redirectUri: oauthCredentials.GOOGLE_DOCS.redirectUri || getDefaultRedirectUri(),
      });
    } else {
      setGoogleFormValues({
        clientID: '',
        clientSecret: '',
        redirectUri: getDefaultRedirectUri(),
      });
    }
  };

  const handleSaveGithub = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await dispatch(
        doSaveGitOAuthCredentials({
          provider: 'GITHUB',
          ...githubFormValues,
        })
      ).unwrap();
      toast.success();
      dispatch(doGetGitOAuthCredentials('GITHUB'));
    } catch (error) {
      toast.error();
    }

    setIsSubmitting(false);
  };

  const handleSaveGitlab = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await dispatch(
        doSaveGitOAuthCredentials({
          provider: 'GITLAB',
          ...gitlabFormValues,
        })
      ).unwrap();
      toast.success();
      dispatch(doGetGitOAuthCredentials('GITLAB'));
    } catch (error) {
      toast.error();
    }

    setIsSubmitting(false);
  };

  const handleSaveBitbucket = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await dispatch(
        doSaveGitOAuthCredentials({
          provider: 'BITBUCKET',
          ...bitbucketFormValues,
        })
      ).unwrap();
      toast.success();
      dispatch(doGetGitOAuthCredentials('BITBUCKET'));
    } catch (error) {
      toast.error();
    }

    setIsSubmitting(false);
  };

  const handleCancelGithub = () => {
    if (gitOAuthCredentials.GITHUB) {
      setGithubFormValues({
        clientID: gitOAuthCredentials.GITHUB.clientID || '',
        clientSecret: gitOAuthCredentials.GITHUB.clientSecret || '',
        redirectUri: gitOAuthCredentials.GITHUB.redirectUri || getDefaultGitRedirectUri(),
      });
    } else {
      setGithubFormValues({
        clientID: '',
        clientSecret: '',
        redirectUri: getDefaultGitRedirectUri(),
      });
    }
  };

  const handleCancelGitlab = () => {
    if (gitOAuthCredentials.GITLAB) {
      setGitlabFormValues({
        clientID: gitOAuthCredentials.GITLAB.clientID || '',
        clientSecret: gitOAuthCredentials.GITLAB.clientSecret || '',
        redirectUri: gitOAuthCredentials.GITLAB.redirectUri || getDefaultGitRedirectUri(),
      });
    } else {
      setGitlabFormValues({
        clientID: '',
        clientSecret: '',
        redirectUri: getDefaultGitRedirectUri(),
      });
    }
  };

  const handleCancelBitbucket = () => {
    if (gitOAuthCredentials.BITBUCKET) {
      setBitbucketFormValues({
        clientID: gitOAuthCredentials.BITBUCKET.clientID || '',
        clientSecret: gitOAuthCredentials.BITBUCKET.clientSecret || '',
        redirectUri: gitOAuthCredentials.BITBUCKET.redirectUri || getDefaultGitRedirectUri(),
      });
    } else {
      setBitbucketFormValues({
        clientID: '',
        clientSecret: '',
        redirectUri: getDefaultGitRedirectUri(),
      });
    }
  };

  // Handle connect account button
  const handleConnectAccount = async (provider) => {
    setIsConnecting(true);
    try {
      const response = await axios.get(`/oauth/authorize/${provider}`);
      const { authUrl } = response.data.body;
      
      // Debug: Log the authorization URL to help troubleshoot
      console.log('OAuth Authorization URL:', authUrl);
      console.log('Provider:', provider);
      
      // Parse and log redirect URI from the URL for debugging
      try {
        const urlObj = new URL(authUrl);
        const redirectUri = urlObj.searchParams.get('redirect_uri');
        const clientId = urlObj.searchParams.get('client_id');
        const state = urlObj.searchParams.get('state');
        console.log('=== OAuth Debug Information ===');
        console.log('Provider:', provider);
        console.log('Redirect URI being used:', redirectUri);
        console.log('Client ID being used:', clientId);
        console.log('State parameter:', state);
        console.log('⚠️ Make sure this Redirect URI is added in Google Console!');
        console.log('⚠️ Make sure this Client ID matches the one in Google Console!');
        console.log('==============================');
      } catch (e) {
        console.error('Error parsing auth URL:', e);
      }
      
      // Redirect user to OAuth provider login
      window.location.href = authUrl;
    } catch (error) {
      console.error('OAuth authorization error:', error);
      toast.error(
        error.response?.data?.body?.error || `Failed to connect ${provider} account`
      );
      setIsConnecting(false);
    }
  };

  return (
    <div className="w-full p-6">
      <h4 className="text-lg font-bold mb-6">OAuth Configuration</h4>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveProvider('MS365')}
          className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
            activeProvider === 'MS365'
              ? 'border-b-2 border-primary-pink text-primary-pink'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Microsoft 365
        </button>
        <button
          onClick={() => setActiveProvider('GOOGLE_DOCS')}
          className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
            activeProvider === 'GOOGLE_DOCS'
              ? 'border-b-2 border-primary-pink text-primary-pink'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Google Docs
        </button>
        <button
          onClick={() => setActiveProvider('GITHUB')}
          className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
            activeProvider === 'GITHUB'
              ? 'border-b-2 border-primary-pink text-primary-pink'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          GitHub
        </button>
        <button
          onClick={() => setActiveProvider('GITLAB')}
          className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
            activeProvider === 'GITLAB'
              ? 'border-b-2 border-primary-pink text-primary-pink'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          GitLab
        </button>
        <button
          onClick={() => setActiveProvider('BITBUCKET')}
          className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
            activeProvider === 'BITBUCKET'
              ? 'border-b-2 border-primary-pink text-primary-pink'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Bitbucket
        </button>
      </div>

      {/* Microsoft 365 Configuration */}
      {activeProvider === 'MS365' && (
        <div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h5 className="font-semibold text-blue-900 mb-2">Setup Instructions</h5>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Go to <a href="https://portal.azure.com" target="_blank" rel="noopener noreferrer" className="underline">Azure Portal</a></li>
              <li>Navigate to Azure Active Directory → App registrations</li>
              <li>Click "New registration" and register your application</li>
              <li>Copy the Application (client) ID and Directory (tenant) ID</li>
              <li>Under "Certificates & secrets", create a new client secret</li>
              <li>Configure redirect URI in Azure AD to match the URI below</li>
              <li>Grant necessary API permissions (Files.ReadWrite, Sites.ReadWrite.All)</li>
            </ol>
          </div>

          <form onSubmit={handleSaveMs365} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client ID (Application ID)
              </label>
              <FormInput
                type="text"
                name="clientID"
                formValues={ms365FormValues}
                onChange={handleMs365Change}
                placeholder="Enter your Azure AD Application ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Secret
              </label>
              <FormInput
                type="password"
                name="clientSecret"
                formValues={ms365FormValues}
                onChange={handleMs365Change}
                placeholder="Enter your Azure AD Client Secret"
              />
              {oauthCredentials.MS365?.clientSecret && (
                <p className="text-xs text-gray-500 mt-1">
                  Current secret: {oauthCredentials.MS365.clientSecret}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tenant ID (Directory ID)
              </label>
              <FormInput
                type="text"
                name="tenantID"
                formValues={ms365FormValues}
                onChange={handleMs365Change}
                placeholder="Enter your Azure AD Tenant ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Redirect URI
              </label>
              <FormInput
                type="url"
                name="redirectUri"
                formValues={ms365FormValues}
                onChange={handleMs365Change}
                placeholder="https://your-app.com/oauth/callback"
              />
              <p className="text-xs text-gray-500 mt-1">
                Copy this URI and add it to Azure AD "Authorized redirect URIs"
              </p>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => handleConnectAccount('MS365')}
                className="px-6 py-2 border border-primary-pink rounded-md text-primary-pink bg-white hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-pink w-[180px]"
                disabled={isConnecting || isLoading || !oauthCredentials.MS365}
              >
                {isConnecting ? 'Connecting...' : 'Connect Microsoft Account'}
              </button>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={handleCancelMs365}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-pink w-[180px]"
                disabled={isSubmitting || isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary w-[180px]"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Google Docs Configuration */}
      {activeProvider === 'GOOGLE_DOCS' && (
        <div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h5 className="font-semibold text-green-900 mb-2">Setup Instructions</h5>
            <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
              <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
              <li>Create a new project or select an existing one</li>
              <li>Navigate to "APIs & Services" → "Credentials"</li>
              <li>Click "Create Credentials" → "OAuth client ID"</li>
              <li>Select "Web application" as the application type</li>
              <li>Add authorized redirect URIs</li>
              <li>Copy the Client ID and Client Secret</li>
              <li>Enable Google Drive API in "APIs & Services" → "Library"</li>
            </ol>
          </div>

          <form onSubmit={handleSaveGoogle} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client ID
              </label>
              <FormInput
                type="text"
                name="clientID"
                formValues={googleFormValues}
                onChange={handleGoogleChange}
                placeholder="Enter your Google OAuth Client ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Secret
              </label>
              <FormInput
                type="password"
                name="clientSecret"
                formValues={googleFormValues}
                onChange={handleGoogleChange}
                placeholder="Enter your Google OAuth Client Secret"
              />
              {oauthCredentials.GOOGLE_DOCS?.clientSecret && (
                <p className="text-xs text-gray-500 mt-1">
                  Current secret: {oauthCredentials.GOOGLE_DOCS.clientSecret}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Redirect URI
              </label>
              <FormInput
                type="url"
                name="redirectUri"
                formValues={googleFormValues}
                onChange={handleGoogleChange}
                placeholder="https://your-app.com/oauth/callback"
              />
              <p className="text-xs text-gray-500 mt-1">
                Copy this URI and add it to Google Cloud Console "Authorized redirect URIs"
              </p>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => handleConnectAccount('GOOGLE_DOCS')}
                className="px-6 py-2 border border-primary-pink rounded-md text-primary-pink bg-white hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-pink w-[180px]"
                disabled={isConnecting || isLoading || !oauthCredentials.GOOGLE_DOCS}
              >
                {isConnecting ? 'Connecting...' : 'Connect Google Account'}
              </button>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={handleCancelGoogle}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-pink w-[180px]"
                disabled={isSubmitting || isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary w-[180px]"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* GitHub Configuration */}
      {activeProvider === 'GITHUB' && (
        <div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h5 className="font-semibold text-gray-900 mb-2">Setup Instructions</h5>
            <ol className="text-sm text-gray-800 space-y-1 list-decimal list-inside">
              <li>Go to GitHub → Settings → Developer settings → OAuth Apps</li>
              <li>Click "New OAuth App"</li>
              <li>Fill in Application name and Homepage URL</li>
              <li>Set Authorization callback URL to: {githubFormValues.redirectUri || getDefaultGitRedirectUri()}</li>
              <li>Copy the Client ID and generate a Client Secret</li>
              <li>Paste the credentials below</li>
            </ol>
          </div>

          <form onSubmit={handleSaveGithub} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client ID
              </label>
              <FormInput
                type="text"
                name="clientID"
                formValues={githubFormValues}
                onChange={handleGithubChange}
                placeholder="Enter your GitHub OAuth Client ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Secret
              </label>
              <FormInput
                type="password"
                name="clientSecret"
                formValues={githubFormValues}
                onChange={handleGithubChange}
                placeholder="Enter your GitHub OAuth Client Secret"
              />
              {gitOAuthCredentials.GITHUB?.clientSecret && (
                <p className="text-xs text-gray-500 mt-1">
                  Current secret: {gitOAuthCredentials.GITHUB.clientSecret}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Redirect URI
              </label>
              <FormInput
                type="url"
                name="redirectUri"
                formValues={githubFormValues}
                onChange={handleGithubChange}
                placeholder="https://your-app.com/git/oauth/callback"
              />
              <p className="text-xs text-gray-500 mt-1">
                Copy this URI and add it to GitHub OAuth app settings
              </p>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={handleCancelGithub}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-pink w-[180px]"
                disabled={isSubmitting || gitIsLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary w-[180px]"
                disabled={isSubmitting || gitIsLoading}
              >
                {isSubmitting ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* GitLab Configuration */}
      {activeProvider === 'GITLAB' && (
        <div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <h5 className="font-semibold text-orange-900 mb-2">Setup Instructions</h5>
            <ol className="text-sm text-orange-800 space-y-1 list-decimal list-inside">
              <li>Go to GitLab → User Settings → Applications</li>
              <li>Fill in Name and Redirect URI</li>
              <li>Set Redirect URI to: {gitlabFormValues.redirectUri || getDefaultGitRedirectUri()}</li>
              <li>Select scopes: api, read_repository, write_repository</li>
              <li>Copy the Application ID and Secret</li>
              <li>Paste the credentials below</li>
            </ol>
          </div>

          <form onSubmit={handleSaveGitlab} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client ID
              </label>
              <FormInput
                type="text"
                name="clientID"
                formValues={gitlabFormValues}
                onChange={handleGitlabChange}
                placeholder="Enter your GitLab OAuth Client ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Secret
              </label>
              <FormInput
                type="password"
                name="clientSecret"
                formValues={gitlabFormValues}
                onChange={handleGitlabChange}
                placeholder="Enter your GitLab OAuth Client Secret"
              />
              {gitOAuthCredentials.GITLAB?.clientSecret && (
                <p className="text-xs text-gray-500 mt-1">
                  Current secret: {gitOAuthCredentials.GITLAB.clientSecret}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Redirect URI
              </label>
              <FormInput
                type="url"
                name="redirectUri"
                formValues={gitlabFormValues}
                onChange={handleGitlabChange}
                placeholder="https://your-app.com/git/oauth/callback"
              />
              <p className="text-xs text-gray-500 mt-1">
                Copy this URI and add it to GitLab OAuth app settings
              </p>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={handleCancelGitlab}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-pink w-[180px]"
                disabled={isSubmitting || gitIsLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary w-[180px]"
                disabled={isSubmitting || gitIsLoading}
              >
                {isSubmitting ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bitbucket Configuration */}
      {activeProvider === 'BITBUCKET' && (
        <div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h5 className="font-semibold text-blue-900 mb-2">Setup Instructions</h5>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Go to Bitbucket → Personal settings → App passwords</li>
              <li>Or go to Bitbucket → Workspace settings → OAuth consumers</li>
              <li>Create a new OAuth consumer</li>
              <li>Set Callback URL to: {bitbucketFormValues.redirectUri || getDefaultGitRedirectUri()}</li>
              <li>Copy the Key (Client ID) and Secret (Client Secret)</li>
              <li>Paste the credentials below</li>
            </ol>
          </div>

          <form onSubmit={handleSaveBitbucket} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client ID
              </label>
              <FormInput
                type="text"
                name="clientID"
                formValues={bitbucketFormValues}
                onChange={handleBitbucketChange}
                placeholder="Enter your Bitbucket OAuth Client ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Secret
              </label>
              <FormInput
                type="password"
                name="clientSecret"
                formValues={bitbucketFormValues}
                onChange={handleBitbucketChange}
                placeholder="Enter your Bitbucket OAuth Client Secret"
              />
              {gitOAuthCredentials.BITBUCKET?.clientSecret && (
                <p className="text-xs text-gray-500 mt-1">
                  Current secret: {gitOAuthCredentials.BITBUCKET.clientSecret}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Redirect URI
              </label>
              <FormInput
                type="url"
                name="redirectUri"
                formValues={bitbucketFormValues}
                onChange={handleBitbucketChange}
                placeholder="https://your-app.com/git/oauth/callback"
              />
              <p className="text-xs text-gray-500 mt-1">
                Copy this URI and add it to Bitbucket OAuth app settings
              </p>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={handleCancelBitbucket}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-pink w-[180px]"
                disabled={isSubmitting || gitIsLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary w-[180px]"
                disabled={isSubmitting || gitIsLoading}
              >
                {isSubmitting ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default OAuthSettings;

