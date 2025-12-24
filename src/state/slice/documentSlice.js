import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  folders: [],
  selectedFolder: null,
  documents: [],
  oauthCredentials: {
    MS365: null,
    GOOGLE_DOCS: null,
  },
  isLoading: false,
  isCreating: false,
  error: null,
};

export const doGetFolders = createAsyncThunk(
  "documents/getFolders",
  async (projectID = null, thunkApi) => {
    try {
      const params = projectID ? { projectID } : {};
      const response = await axios.get("/folders", { params });
      return response.data.body;
    } catch (error) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

export const doCreateFolder = createAsyncThunk(
  "documents/createFolder",
  async (folderData, thunkApi) => {
    try {
      const response = await axios.post("/folders", folderData);
      thunkApi.dispatch(doGetFolders());
      return response.data.body;
    } catch (error) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

export const doDeleteFolder = createAsyncThunk(
  "documents/deleteFolder",
  async (folderId, thunkApi) => {
    try {
      await axios.delete(`/folders/${folderId}`);
      thunkApi.dispatch(doGetFolders());
      return folderId;
    } catch (error) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

export const doGetDocuments = createAsyncThunk(
  "documents/getDocuments",
  async (folderId, thunkApi) => {
    try {
      const response = await axios.get(`/folders/${folderId}/documents`);
      return response.data.body;
    } catch (error) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

export const doCreateDocument = createAsyncThunk(
  "documents/createDocument",
  async (documentData, thunkApi) => {
    try {
      const response = await axios.post("/documents", documentData);
      const state = thunkApi.getState();
      const { selectedFolder } = state.document;
      if (selectedFolder) {
        thunkApi.dispatch(doGetDocuments(selectedFolder.id));
      }
      return response.data.body;
    } catch (error) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

export const doUpdateDocument = createAsyncThunk(
  "documents/updateDocument",
  async ({ documentId, documentData }, thunkApi) => {
    try {
      const response = await axios.put(`/documents/${documentId}`, documentData);
      const state = thunkApi.getState();
      const { selectedFolder } = state.document;
      if (selectedFolder) {
        thunkApi.dispatch(doGetDocuments(selectedFolder.id));
      }
      return response.data.body;
    } catch (error) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

export const doDeleteDocument = createAsyncThunk(
  "documents/deleteDocument",
  async (documentId, thunkApi) => {
    try {
      await axios.delete(`/documents/${documentId}`);
      const state = thunkApi.getState();
      const { selectedFolder } = state.document;
      if (selectedFolder) {
        thunkApi.dispatch(doGetDocuments(selectedFolder.id));
      }
      return documentId;
    } catch (error) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

export const doSaveOAuthCredentials = createAsyncThunk(
  "documents/saveOAuthCredentials",
  async (credentialData, thunkApi) => {
    try {
      const response = await axios.post("/oauth/credentials", credentialData);
      return response.data.body;
    } catch (error) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

export const doGetOAuthAuthUrl = createAsyncThunk(
  "documents/getOAuthAuthUrl",
  async (provider, thunkApi) => {
    try {
      const response = await axios.get(`/oauth/authorize/${provider}`);
      return response.data.body;
    } catch (error) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

export const doGetOAuthCredentials = createAsyncThunk(
  "documents/getOAuthCredentials",
  async (provider, thunkApi) => {
    try {
      const response = await axios.get(`/oauth/credentials/${provider}`);
      return { provider, credentials: response.data.body };
    } catch (error) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

export const doFetchFilename = createAsyncThunk(
  "documents/fetchFilename",
  async (documentId, thunkApi) => {
    try {
      const response = await axios.get(`/documents/${documentId}/filename`);
      return response.data.body;
    } catch (error) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

export const documentSlice = createSlice({
  name: "document",
  initialState,
  reducers: {
    setSelectedFolder: (state, action) => {
      state.selectedFolder = action.payload;
    },
    clearDocumentState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(doGetFolders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(doGetFolders.fulfilled, (state, action) => {
        state.folders = action.payload;
        state.isLoading = false;
      })
      .addCase(doGetFolders.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })
      .addCase(doCreateFolder.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(doCreateFolder.fulfilled, (state) => {
        state.isCreating = false;
      })
      .addCase(doCreateFolder.rejected, (state, action) => {
        state.error = action.payload;
        state.isCreating = false;
      })
      .addCase(doGetDocuments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(doGetDocuments.fulfilled, (state, action) => {
        state.documents = action.payload;
        state.isLoading = false;
      })
      .addCase(doGetDocuments.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })
      .addCase(doCreateDocument.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(doCreateDocument.fulfilled, (state) => {
        state.isCreating = false;
      })
      .addCase(doCreateDocument.rejected, (state, action) => {
        state.error = action.payload;
        state.isCreating = false;
      })
      .addCase(doUpdateDocument.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(doUpdateDocument.fulfilled, (state) => {
        state.isCreating = false;
      })
      .addCase(doUpdateDocument.rejected, (state, action) => {
        state.error = action.payload;
        state.isCreating = false;
      })
      .addCase(doSaveOAuthCredentials.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(doSaveOAuthCredentials.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(doSaveOAuthCredentials.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })
      .addCase(doGetOAuthCredentials.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(doGetOAuthCredentials.fulfilled, (state, action) => {
        const { provider, credentials } = action.payload;
        state.oauthCredentials[provider] = credentials;
        state.isLoading = false;
      })
      .addCase(doGetOAuthCredentials.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      })
      .addCase(doFetchFilename.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(doFetchFilename.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(doFetchFilename.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      });
  },
});

export const { setSelectedFolder, clearDocumentState } = documentSlice.actions;

export const selectFolders = (state) => state.document.folders;
export const selectSelectedFolder = (state) => state.document.selectedFolder;
export const selectDocuments = (state) => state.document.documents;
export const selectOAuthCredentials = (state) => state.document.oauthCredentials;
export const selectIsLoading = (state) => state.document.isLoading;
export const selectIsCreating = (state) => state.document.isCreating;
export const selectError = (state) => state.document.error;

export default documentSlice.reducer;
