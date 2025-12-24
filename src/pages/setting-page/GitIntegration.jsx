import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useHistory, useLocation } from 'react-router-dom';
import {
  doGetGitAuthUrl,
  doConnectRepository,
  doGetRepositories,
  doDisconnectRepository,
  doSyncRepository,
  doGetGitOAuthConnections,
  selectOAuthConnections,
  selectRepositories,
  selectIsLoading,
  selectIsConnecting,
} from '../../state/slice/gitIntegrationSlice';
import { selectSelectedProject, selectProjectList } from '../../state/slice/projectSlice';
import Modal from '../../components/Modal.jsx';
import FormInput from '../../components/FormInput.jsx';
import FormSelect from '../../components/FormSelect.jsx';
import useGitRepositories from '../../hooks/custom-hooks/git/useGitRepositories';
import ConfirmationDialog from '../../components/ConfirmationDialog.jsx';
import { CodeBracketIcon, CubeIcon } from '@heroicons/react/24/outline';

let lastHandledOAuthSignature = null;

const GitIntegration = () => {

  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();
  const selectedProject = useSelector(selectSelectedProject);
  const projectList = useSelector(selectProjectList);
  const repositories = useSelector(selectRepositories);
  const oauthConnections = useSelector(selectOAuthConnections);
  const isLoading = useSelector(selectIsLoading);
  const isConnecting = useSelector(selectIsConnecting);

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);
  const [repositoryToDisconnect, setRepositoryToDisconnect] = useState(null);
  const [connectFormValues, setConnectFormValues] = useState({
    provider: 'GITHUB',
    repositoryUrl: '',
    projectID: selectedProject?.id || null,
  });

  const { refetch: refetchRepositories } = useGitRepositories(selectedProject?.id);

  useEffect(() => {
    dispatch(doGetGitOAuthConnections());
  }, [dispatch]);

  // Handle OAuth callback success
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const oauthStatus = searchParams.get('oauth');
    const projectID = searchParams.get('projectID') || '';
    const signature = oauthStatus ? `${oauthStatus}:${projectID}` : null;

    if (!oauthStatus) {
      return;
    }

    if (signature && lastHandledOAuthSignature === signature) {
      return;
    }

    lastHandledOAuthSignature = signature;

    if (oauthStatus === 'success') {
      toast.success();
      dispatch(doGetGitOAuthConnections());
      refetchRepositories();
    } else if (oauthStatus === 'error') {
      toast.error();
    }

    searchParams.delete('oauth');
    const newSearch = searchParams.toString();
    const normalizedPath =
      location.pathname === '/index.html' ? '/settings' : location.pathname;
    const newUrl = `${normalizedPath}${newSearch ? `?${newSearch}` : ''}`;
    history.replace(newUrl);
  }, [
    dispatch,
    history,
    location.pathname,
    location.search,
    refetchRepositories,
  ]);

  // Load repositories on mount
  useEffect(() => {
    if (selectedProject?.id) {
      dispatch(doGetRepositories({ projectID: selectedProject.id }));
    } else {
      dispatch(doGetRepositories());
    }
  }, [dispatch, selectedProject?.id]);

  // Update form when project changes
  useEffect(() => {
    setConnectFormValues(prev => ({
      ...prev,
      projectID: selectedProject?.id || null,
    }));
  }, [selectedProject?.id]);

  const handleConnectProvider = async (provider) => {
    try {
      const response = await dispatch(
        doGetGitAuthUrl({ provider, projectID: selectedProject?.id })
      ).unwrap();

      // Redirect to OAuth provider
      window.location.href = response.authUrl;
    } catch (error) {
      toast.error(
        error || `Failed to connect ${provider}. Please try again.`
      );
    }
  };

  const handleConnectFormChange = ({ target: { name, value } }) => {
    setConnectFormValues(prev => ({
      ...prev,
      [name]: name === 'projectID' ? (value === '' ? null : Number(value)) : value,
    }));
  };

  const handleConnectRepository = async (e) => {
    e.preventDefault();

    if (!connectFormValues.repositoryUrl) {
      toast.error();
      return;
    }

    try {
      await dispatch(doConnectRepository(connectFormValues)).unwrap();
      toast.success();
      setIsConnectModalOpen(false);
      setConnectFormValues({
        provider: 'GITHUB',
        repositoryUrl: '',
        projectID: selectedProject?.id || null,
      });
      refetchRepositories();
    } catch (error) {
      toast.error(
        error || 'Failed to connect repository. Please try again.'
      );
    }
  };

  const handleDisconnectClick = (repository) => {
    setRepositoryToDisconnect(repository);
    setIsDisconnectDialogOpen(true);
  };

  const handleConfirmDisconnect = async () => {
    if (!repositoryToDisconnect) return;

    try {
      await dispatch(doDisconnectRepository(repositoryToDisconnect.id)).unwrap();
      toast.success();
      setIsDisconnectDialogOpen(false);
      setRepositoryToDisconnect(null);
      refetchRepositories();
    } catch (error) {
      toast.error(
        error || 'Failed to disconnect repository. Please try again.'
      );
    }
  };

  const getProviderIcon = (provider) => {
    const iconStyle = { width: '24px', height: '24px' };
    switch (provider?.toUpperCase()) {
      case 'GITHUB':
        return <CodeBracketIcon style={iconStyle} className="text-gray-900" />;
      case 'GITLAB':
        return <CodeBracketIcon style={iconStyle} className="text-orange-500" />;
      case 'BITBUCKET':
        return <CubeIcon style={iconStyle} className="text-blue-500" />;
      default:
        return '📦';
    }
  };

  const getProviderName = (provider) => {
    switch (provider?.toUpperCase()) {
      case 'GITHUB':
        return 'GitHub';
      case 'GITLAB':
        return 'GitLab';
      case 'BITBUCKET':
        return 'Bitbucket';
      default:
        return provider;
    }
  };

  const isProviderConnected = (provider) => {
    const providerKey = provider?.toUpperCase();
    if (!providerKey) return false;

    if (oauthConnections?.[providerKey]?.connected) {
      return true;
    }

    return repositories?.some(
      repo => repo.provider?.toUpperCase() === providerKey
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const providerOptions = [
    { value: 'GITHUB', label: 'GitHub' },
    { value: 'GITLAB', label: 'GitLab' },
    { value: 'BITBUCKET', label: 'Bitbucket' },
  ];

  const projectOptions = (projectList || []).map((project) => ({
    value: String(project.id),
    label: project.name,
  }));

  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="mb-6">
        <h4 className="text-2xl font-bold text-gray-900 mb-2">
          Git Integration
        </h4>
        <p className="text-gray-600">
          Connect your Git repositories and manually link branches to tasks. When you link a branch, its commits and pull requests will be automatically synced.
        </p>
      </div>

      {/* OAuth Connections Section */}
      <div className="mb-8">
        <div className="mb-4">
          <h5 className="text-lg font-semibold text-gray-900 mb-2">OAuth Connections</h5>
          <p className="text-sm text-gray-600">
            Connect your Git provider accounts to enable repository integration
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* GitHub Card */}
          <div className="border border-gray-200 rounded-lg p-4 relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CodeBracketIcon className="w-6 h-6 text-gray-900" />
                <span className="font-semibold text-gray-900">GitHub</span>
              </div>
              {isProviderConnected('GITHUB') ? (
                <span className="text-green-500">✓</span>
              ) : (
                <span className="text-gray-400">✗</span>
              )}
            </div>
            {isProviderConnected('GITHUB') ? (
              <div className="mb-3">
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Account connected
                </p>
              </div>
            ) : null}
            <button
              onClick={() => {
                if (!isProviderConnected('GITHUB')) {
                  handleConnectProvider('GITHUB');
                }
              }}
              disabled={isProviderConnected('GITHUB') || isConnecting}
              className={`w-full py-2 px-4 rounded-md text-sm font-medium ${isProviderConnected('GITHUB')
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-primary-pink text-white hover:bg-secondary-pink'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isProviderConnected('GITHUB') ? 'Connected' : 'Connect GitHub'}
            </button>
          </div>

          {/* GitLab Card */}
          <div className="border border-gray-200 rounded-lg p-4 relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CodeBracketIcon className="w-6 h-6 text-orange-500" />
                <span className="font-semibold text-gray-900">GitLab</span>
              </div>
              {isProviderConnected('GITLAB') ? (
                <span className="text-green-500">✓</span>
              ) : (
                <span className="text-gray-400">✗</span>
              )}
            </div>
            {isProviderConnected('GITLAB') ? (
              <div className="mb-3">
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Account connected
                </p>
              </div>
            ) : null}
            <button
              onClick={() => {
                if (!isProviderConnected('GITLAB')) {
                  handleConnectProvider('GITLAB');
                }
              }}
              disabled={isProviderConnected('GITLAB') || isConnecting}
              className={`w-full py-2 px-4 rounded-md text-sm font-medium ${isProviderConnected('GITLAB')
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-primary-pink text-white hover:bg-secondary-pink'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isProviderConnected('GITLAB') ? 'Connected' : 'Connect GitLab'}
            </button>
          </div>

          {/* Bitbucket Card */}
          <div className="border border-gray-200 rounded-lg p-4 relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CubeIcon className="w-6 h-6 text-blue-500" />
                <span className="font-semibold text-gray-900">Bitbucket</span>
              </div>
              {isProviderConnected('BITBUCKET') ? (
                <span className="text-green-500">✓</span>
              ) : (
                <span className="text-gray-400">✗</span>
              )}
            </div>
            {isProviderConnected('BITBUCKET') ? (
              <div className="mb-3">
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Account connected
                </p>
              </div>
            ) : null}
            <button
              onClick={() => {
                if (!isProviderConnected('BITBUCKET')) {
                  handleConnectProvider('BITBUCKET');
                }
              }}
              disabled={isProviderConnected('BITBUCKET') || isConnecting}
              className={`w-full py-2 px-4 rounded-md text-sm font-medium ${isProviderConnected('BITBUCKET')
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-primary-pink text-white hover:bg-secondary-pink'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isProviderConnected('BITBUCKET') ? 'Connected' : 'Connect Bitbucket'}
            </button>
          </div>
        </div>
      </div>

      {/* Connected Repositories Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h5 className="text-lg font-semibold text-gray-900 mb-2">Connected Repositories</h5>
            <p className="text-sm text-gray-600">
              Manage repositories linked to your projects
            </p>
          </div>
          <button
            onClick={() => setIsConnectModalOpen(true)}
            className="bg-primary-pink text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary-pink"
          >
            + Connect Repository
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading repositories...</div>
        ) : repositories?.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
            No repositories connected. Click "Connect Repository" to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Repository
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Sync
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {repositories.map((repo) => (
                  <tr key={repo.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <a
                          href={repo.repositoryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {repo.repositoryName}
                        </a>
                        <p className="text-sm text-gray-500">{repo.repositoryFullName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span>{getProviderIcon(repo.provider)}</span>
                        <span className="text-sm text-gray-900">
                          {getProviderName(repo.provider)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {repo.projectName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${repo.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {repo.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(repo.lastSyncAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            try {
                              await dispatch(doSyncRepository(repo.id)).unwrap();
                              toast.success();
                            } catch (error) {
                              toast.error(
                                error || 'Failed to sync repository. Please try again.'
                              );
                            }
                          }}
                          disabled={isLoading}
                          className="text-primary-pink hover:text-secondary-pink border border-primary-pink px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Sync
                        </button>
                        <button
                          onClick={() => handleDisconnectClick(repo)}
                          className="text-red-600 hover:text-red-900 border border-red-600 px-3 py-1 rounded"
                        >
                          Disconnect
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Connect Repository Modal */}
      <Modal
        isOpen={isConnectModalOpen}
        onClose={() => {
          setIsConnectModalOpen(false);
          setConnectFormValues({
            provider: 'GITHUB',
            repositoryUrl: '',
            projectID: selectedProject?.id || null,
          });
        }}
        title="Connect Repository"
        titleClassName="text-base"
        titleTag="h5"
      >
        <form onSubmit={handleConnectRepository} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Git Provider
            </label>
            <FormSelect
              name="provider"
              formValues={connectFormValues}
              onChange={handleConnectFormChange}
              options={providerOptions}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Repository URL
            </label>
            <div className="mt-1">
              <FormInput
                type="url"
                name="repositoryUrl"
                formValues={connectFormValues}
                onChange={handleConnectFormChange}
                placeholder="https://github.com/organization/repo-name"
                showLabel={false}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project <span className="text-gray-500 font-normal">(Optional)</span>
            </label>
            <FormSelect
              name="projectID"
              formValues={{ projectID: connectFormValues.projectID ? String(connectFormValues.projectID) : '' }}
              onChange={handleConnectFormChange}
              options={projectOptions}
            />
            <p className="mt-1 text-xs text-gray-500">
              Link this repository to a specific project. If not selected, the repository will be available for all projects.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsConnectModalOpen(false);
                setConnectFormValues({
                  provider: 'GITHUB',
                  repositoryUrl: '',
                  projectID: selectedProject?.id || null,
                });
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary-pink text-white rounded-md text-sm font-medium hover:bg-secondary-pink disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Connect
            </button>
          </div>
        </form>
      </Modal>

      {/* Disconnect Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDisconnectDialogOpen}
        onClose={() => {
          setIsDisconnectDialogOpen(false);
          setRepositoryToDisconnect(null);
        }}
        onConfirm={handleConfirmDisconnect}
        title="Disconnect Repository"
        message={
          repositoryToDisconnect
            ? `Are you sure you want to disconnect "${repositoryToDisconnect.repositoryName}"? This will stop automatic synchronization.`
            : ''
        }
      />
    </div>
  );
};

export default GitIntegration;


