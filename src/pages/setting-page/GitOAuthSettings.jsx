import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import FormInput from '../../components/FormInput.jsx';
import { getAPIBaseURL } from '../../utils/commonUtils';
import {
  doGetGitOAuthCredentials,
  doSaveGitOAuthCredentials,
  selectOAuthCredentials,
  selectIsLoading
} from '../../state/slice/gitIntegrationSlice';

const GitOAuthSettings = () => {
  
  const dispatch = useDispatch();
  const location = useLocation();
  const oauthCredentials = useSelector(selectOAuthCredentials);
  const isLoading = useSelector(selectIsLoading);

  const [activeProvider, setActiveProvider] = useState('GITHUB');
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

  // Auto-generate redirect URI
  const getDefaultRedirectUri = () => {
    const baseURL = getAPIBaseURL();
    return `${baseURL}/git/oauth/callback`;
  };

  useEffect(() => {
    // Load existing credentials for all providers
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
      window.history.replaceState({}, '', '/settings?view=gitOAuthSettings');
    } else if (oauthStatus === 'error') {
      toast.error();
      window.history.replaceState({}, '', '/settings?view=gitOAuthSettings');
    }
  }, [location.search, addToast]);

  // Auto-populate redirect URI if empty
  useEffect(() => {
    const defaultRedirectUri = getDefaultRedirectUri();
    
    if (!githubFormValues.redirectUri && !oauthCredentials.GITHUB?.redirectUri) {
      setGithubFormValues(prev => ({
        ...prev,
        redirectUri: defaultRedirectUri
      }));
    }
    
    if (!gitlabFormValues.redirectUri && !oauthCredentials.GITLAB?.redirectUri) {
      setGitlabFormValues(prev => ({
        ...prev,
        redirectUri: defaultRedirectUri
      }));
    }

    if (!bitbucketFormValues.redirectUri && !oauthCredentials.BITBUCKET?.redirectUri) {
      setBitbucketFormValues(prev => ({
        ...prev,
        redirectUri: defaultRedirectUri
      }));
    }
  }, []);

  useEffect(() => {
    // Update form values when credentials are loaded
    if (oauthCredentials.GITHUB) {
      setGithubFormValues({
        clientID: oauthCredentials.GITHUB.clientID || '',
        clientSecret: oauthCredentials.GITHUB.clientSecret || '',
        redirectUri: oauthCredentials.GITHUB.redirectUri || '',
      });
    }
    if (oauthCredentials.GITLAB) {
      setGitlabFormValues({
        clientID: oauthCredentials.GITLAB.clientID || '',
        clientSecret: oauthCredentials.GITLAB.clientSecret || '',
        redirectUri: oauthCredentials.GITLAB.redirectUri || '',
      });
    }
    if (oauthCredentials.BITBUCKET) {
      setBitbucketFormValues({
        clientID: oauthCredentials.BITBUCKET.clientID || '',
        clientSecret: oauthCredentials.BITBUCKET.clientSecret || '',
        redirectUri: oauthCredentials.BITBUCKET.redirectUri || '',
      });
    }
  }, [oauthCredentials]);

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

  const handleSave = async (e, provider, formValues) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await dispatch(
        doSaveGitOAuthCredentials({
          provider,
          ...formValues,
        })
      ).unwrap();
      toast.success();
      dispatch(doGetGitOAuthCredentials(provider));
    } catch (error) {
      toast.error();
    }

    setIsSubmitting(false);
  };

  const handleCancel = (e, provider) => {
    e.preventDefault();
    e.stopPropagation();
    
    const credentials = oauthCredentials[provider];
    const defaultRedirectUri = getDefaultRedirectUri();

    if (provider === 'GITHUB') {
      setGithubFormValues(credentials ? {
        clientID: credentials.clientID || '',
        clientSecret: credentials.clientSecret || '',
        redirectUri: credentials.redirectUri || defaultRedirectUri,
      } : {
        clientID: '',
        clientSecret: '',
        redirectUri: defaultRedirectUri,
      });
    } else if (provider === 'GITLAB') {
      setGitlabFormValues(credentials ? {
        clientID: credentials.clientID || '',
        clientSecret: credentials.clientSecret || '',
        redirectUri: credentials.redirectUri || defaultRedirectUri,
      } : {
        clientID: '',
        clientSecret: '',
        redirectUri: defaultRedirectUri,
      });
    } else if (provider === 'BITBUCKET') {
      setBitbucketFormValues(credentials ? {
        clientID: credentials.clientID || '',
        clientSecret: credentials.clientSecret || '',
        redirectUri: credentials.redirectUri || defaultRedirectUri,
      } : {
        clientID: '',
        clientSecret: '',
        redirectUri: defaultRedirectUri,
      });
    }
  };

  const renderProviderForm = (provider, formValues, handleChange, handleSave, handleCancel) => {
    const credentials = oauthCredentials[provider];
    const providerName = provider === 'GITHUB' ? 'GitHub' : provider === 'GITLAB' ? 'GitLab' : 'Bitbucket';
    const setupInstructions = {
      GITHUB: [
        'Go to GitHub → Settings → Developer settings → OAuth Apps',
        'Click "New OAuth App"',
        'Fill in Application name and Homepage URL',
        `Set Authorization callback URL to: ${formValues.redirectUri || getDefaultRedirectUri()}`,
        'Copy the Client ID and generate a Client Secret',
        'Paste the credentials below',
      ],
      GITLAB: [
        'Go to GitLab → User Settings → Applications',
        'Fill in Name and Redirect URI',
        `Set Redirect URI to: ${formValues.redirectUri || getDefaultRedirectUri()}`,
        'Select scopes: api, read_repository, write_repository',
        'Copy the Application ID and Secret',
        'Paste the credentials below',
      ],
      BITBUCKET: [
        'Go to Bitbucket → Personal settings → App passwords',
        'Or go to Bitbucket → Workspace settings → OAuth consumers',
        'Create a new OAuth consumer',
        `Set Callback URL to: ${formValues.redirectUri || getDefaultRedirectUri()}`,
        'Copy the Key (Client ID) and Secret (Client Secret)',
        'Paste the credentials below',
      ],
    };

    const bgColor = provider === 'GITHUB' ? 'bg-gray-50 border-gray-200' : 
                     provider === 'GITLAB' ? 'bg-orange-50 border-orange-200' : 
                     'bg-blue-50 border-blue-200';
    const textColor = provider === 'GITHUB' ? 'text-gray-900' : 
                      provider === 'GITLAB' ? 'text-orange-900' : 
                      'text-blue-900';
    const textColorLight = provider === 'GITHUB' ? 'text-gray-800' : 
                           provider === 'GITLAB' ? 'text-orange-800' : 
                           'text-blue-800';

    return (
      <div>
        <div className={`${bgColor} border rounded-lg p-4 mb-6`}>
          <h5 className={`font-semibold ${textColor} mb-2`}>Setup Instructions</h5>
          <ol className={`text-sm ${textColorLight} space-y-1 list-decimal list-inside`}>
            {setupInstructions[provider].map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ol>
        </div>

        <form onSubmit={(e) => handleSave(e, provider, formValues)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client ID
            </label>
            <FormInput
              type="text"
              name="clientID"
              formValues={formValues}
              onChange={handleChange}
              placeholder={`Enter your ${providerName} OAuth Client ID`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client Secret
            </label>
            <FormInput
              type="password"
              name="clientSecret"
              formValues={formValues}
              onChange={handleChange}
              placeholder={`Enter your ${providerName} OAuth Client Secret`}
            />
            {credentials?.clientSecret && (
              <p className="text-xs text-gray-500 mt-1">
                Current secret: {credentials.clientSecret}
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
              formValues={formValues}
              onChange={handleChange}
              placeholder="https://your-app.com/git/oauth/callback"
            />
            <p className="text-xs text-gray-500 mt-1">
              Copy this URI and add it to {providerName} OAuth app settings
            </p>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={(e) => handleCancel(e, provider)}
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
    );
  };

  return (
    <div className="w-full p-6">
      <h4 className="text-lg font-bold mb-6">Git Integration OAuth Configuration</h4>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveProvider('GITHUB')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeProvider === 'GITHUB'
              ? 'border-b-2 border-primary-pink text-primary-pink'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          GitHub
        </button>
        <button
          onClick={() => setActiveProvider('GITLAB')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeProvider === 'GITLAB'
              ? 'border-b-2 border-primary-pink text-primary-pink'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          GitLab
        </button>
        <button
          onClick={() => setActiveProvider('BITBUCKET')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeProvider === 'BITBUCKET'
              ? 'border-b-2 border-primary-pink text-primary-pink'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Bitbucket
        </button>
      </div>

      {/* Provider Forms */}
      {activeProvider === 'GITHUB' && renderProviderForm(
        'GITHUB',
        githubFormValues,
        handleGithubChange,
        handleSave,
        handleCancel
      )}

      {activeProvider === 'GITLAB' && renderProviderForm(
        'GITLAB',
        gitlabFormValues,
        handleGitlabChange,
        handleSave,
        handleCancel
      )}

      {activeProvider === 'BITBUCKET' && renderProviderForm(
        'BITBUCKET',
        bitbucketFormValues,
        handleBitbucketChange,
        handleSave,
        handleCancel
      )}
    </div>
  );
};

export default GitOAuthSettings;


