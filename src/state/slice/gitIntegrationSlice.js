import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  oauthConnections: {
    GITHUB: null,
    GITLAB: null,
    BITBUCKET: null,
  },
  oauthCredentials: {
    GITHUB: null,
    GITLAB: null,
    BITBUCKET: null,
  },
  repositories: [],
  repositoryBranches: [],
  taskDevelopmentData: {
    branches: [],
    commits: [],
    pullRequests: [],
  },
  isLoading: false,
  isConnecting: false,
  error: null,
};

// Get OAuth authorization URL
export const doGetGitAuthUrl = createAsyncThunk(
  "gitIntegration/getAuthUrl",
  async ({ provider, projectID }, thunkApi) => {
    try {
      const params = projectID ? { projectID } : {};
      const response = await axios.get(`/git/auth/${provider}`, { params });
      return { provider, authUrl: response.data.body.authUrl };
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.body?.error || error.message
      );
    }
  }
);

// Connect repository
export const doConnectRepository = createAsyncThunk(
  "gitIntegration/connectRepository",
  async (repositoryData, thunkApi) => {
    try {
      const response = await axios.post("/git/repositories", repositoryData);
      thunkApi.dispatch(doGetRepositories({ projectID: repositoryData.projectID }));
      return response.data.body;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.body?.error || error.message
      );
    }
  }
);

// Get repositories
export const doGetRepositories = createAsyncThunk(
  "gitIntegration/getRepositories",
  async ({ projectID } = {}, thunkApi) => {
    try {
      const params = projectID ? { projectID } : {};
      const response = await axios.get("/git/repositories", { params });
      return response.data.body;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.body?.error || error.message
      );
    }
  }
);

// Disconnect repository
export const doDisconnectRepository = createAsyncThunk(
  "gitIntegration/disconnectRepository",
  async (repositoryID, thunkApi) => {
    try {
      await axios.delete(`/git/repositories/${repositoryID}`);
      thunkApi.dispatch(doGetRepositories());
      return repositoryID;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.body?.error || error.message
      );
    }
  }
);

// Get task development data
export const doGetTaskDevelopmentData = createAsyncThunk(
  "gitIntegration/getTaskDevelopmentData",
  async (taskID, thunkApi) => {
    try {
      const response = await axios.get(`/git/tasks/${taskID}/development`);
      return response.data.body;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.body?.error || error.message
      );
    }
  }
);

// Get repository branches
export const doGetRepositoryBranches = createAsyncThunk(
  "gitIntegration/getRepositoryBranches",
  async (repositoryID, thunkApi) => {
    try {
      const response = await axios.get(`/git/repositories/${repositoryID}/branches`);
      return response.data.body;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.body?.error || error.message
      );
    }
  }
);

// Create branch
export const doCreateBranch = createAsyncThunk(
  "gitIntegration/createBranch",
  async (branchData, thunkApi) => {
    try {
      const response = await axios.post("/git/branches", branchData);
      // Refresh task development data if taskID is provided
      if (branchData.taskID) {
        thunkApi.dispatch(doGetTaskDevelopmentData(branchData.taskID));
      }
      return response.data.body;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.body?.error || error.message
      );
    }
  }
);

// Link existing branch
export const doLinkExistingBranch = createAsyncThunk(
  "gitIntegration/linkExistingBranch",
  async (branchData, thunkApi) => {
    try {
      const response = await axios.post("/git/branches/link", branchData);
      // Refresh task development data if taskID is provided
      if (branchData.taskID) {
        thunkApi.dispatch(doGetTaskDevelopmentData(branchData.taskID));
      }
      return response.data.body;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.body?.error || error.message
      );
    }
  }
);

// Sync repository
export const doSyncRepository = createAsyncThunk(
  "gitIntegration/syncRepository",
  async (repositoryID, thunkApi) => {
    try {
      const response = await axios.post(`/git/repositories/${repositoryID}/sync`);
      // Refresh repositories list after sync
      thunkApi.dispatch(doGetRepositories());
      return response.data.body;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.body?.error || error.message
      );
    }
  }
);

// Get OAuth credentials
export const doGetGitOAuthCredentials = createAsyncThunk(
  "gitIntegration/getOAuthCredentials",
  async (provider, thunkApi) => {
    try {
      const response = await axios.get(`/git/oauth/credentials/${provider}`);
      return { provider, credentials: response.data.body };
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.body?.error || error.message
      );
    }
  }
);

// Get connected OAuth providers
export const doGetGitOAuthConnections = createAsyncThunk(
  "gitIntegration/getOAuthConnections",
  async (_, thunkApi) => {
    try {
      const response = await axios.get("/git/oauth/connections");
      return response.data.body;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.body?.error || error.message
      );
    }
  }
);

// Save OAuth credentials
export const doSaveGitOAuthCredentials = createAsyncThunk(
  "gitIntegration/saveOAuthCredentials",
  async (credentialData, thunkApi) => {
    try {
      const response = await axios.post("/git/oauth/credentials", credentialData);
      thunkApi.dispatch(doGetGitOAuthCredentials(credentialData.provider));
      return response.data.body;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.body?.error || error.message
      );
    }
  }
);

export const gitIntegrationSlice = createSlice({
  name: "gitIntegration",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTaskDevelopmentData: (state) => {
      state.taskDevelopmentData = {
        branches: [],
        commits: [],
        pullRequests: [],
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Auth URL
      .addCase(doGetGitAuthUrl.pending, (state) => {
        state.isConnecting = true;
        state.error = null;
      })
      .addCase(doGetGitAuthUrl.fulfilled, (state, action) => {
        state.isConnecting = false;
        // Store auth URL temporarily if needed
      })
      .addCase(doGetGitAuthUrl.rejected, (state, action) => {
        state.error = action.payload;
        state.isConnecting = false;
      })
      // Connect Repository
      .addCase(doConnectRepository.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(doConnectRepository.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(doConnectRepository.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })
      // Get Repositories
      .addCase(doGetRepositories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(doGetRepositories.fulfilled, (state, action) => {
        state.repositories = action.payload;
        state.isLoading = false;
      })
      .addCase(doGetRepositories.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })
      // Disconnect Repository
      .addCase(doDisconnectRepository.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(doDisconnectRepository.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(doDisconnectRepository.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })
      // Get Task Development Data
      .addCase(doGetTaskDevelopmentData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(doGetTaskDevelopmentData.fulfilled, (state, action) => {
        state.taskDevelopmentData = action.payload;
        state.isLoading = false;
      })
      .addCase(doGetTaskDevelopmentData.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })
      // Get Repository Branches
      .addCase(doGetRepositoryBranches.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(doGetRepositoryBranches.fulfilled, (state, action) => {
        state.repositoryBranches = action.payload;
        state.isLoading = false;
      })
      .addCase(doGetRepositoryBranches.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
        state.repositoryBranches = [];
      })
      // Create Branch
      .addCase(doCreateBranch.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(doCreateBranch.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(doCreateBranch.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })
      // Link Existing Branch
      .addCase(doLinkExistingBranch.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(doLinkExistingBranch.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(doLinkExistingBranch.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })
      // Sync Repository
      .addCase(doSyncRepository.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(doSyncRepository.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(doSyncRepository.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })
      // Get OAuth Credentials
      .addCase(doGetGitOAuthCredentials.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(doGetGitOAuthCredentials.fulfilled, (state, action) => {
        state.oauthCredentials[action.payload.provider] = action.payload.credentials;
        state.isLoading = false;
      })
      .addCase(doGetGitOAuthCredentials.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })
      // Get OAuth Connections
      .addCase(doGetGitOAuthConnections.fulfilled, (state, action) => {
        state.oauthConnections = {
          ...state.oauthConnections,
          ...action.payload,
        };
      })
      .addCase(doGetGitOAuthConnections.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Save OAuth Credentials
      .addCase(doSaveGitOAuthCredentials.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(doSaveGitOAuthCredentials.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(doSaveGitOAuthCredentials.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      });
  },
});

export const { clearError, clearTaskDevelopmentData } = gitIntegrationSlice.actions;

export const selectOAuthConnections = (state) => state.gitIntegration.oauthConnections;
export const selectOAuthCredentials = (state) => state.gitIntegration.oauthCredentials;
export const selectRepositories = (state) => state.gitIntegration.repositories;
export const selectRepositoryBranches = (state) => state.gitIntegration.repositoryBranches;
export const selectTaskDevelopmentData = (state) => state.gitIntegration.taskDevelopmentData;
export const selectIsLoading = (state) => state.gitIntegration.isLoading;
export const selectIsConnecting = (state) => state.gitIntegration.isConnecting;
export const selectError = (state) => state.gitIntegration.error;

export default gitIntegrationSlice.reducer;

