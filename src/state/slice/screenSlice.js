import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    screens: [],
    loading: false,
    error: null,
    selectedScreenId: null,
};


export const fetchScreensByProject = createAsyncThunk(
    "screen/fetchScreensByProject",
    async (projectId, { rejectWithValue }) => {
        try {
            const response = await axios.get("/screens", {
                params: { projectID: projectId },
            });
            console.log(response);
            return response.data.screens || response.data; 
        } catch (error) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

// fetch all screens by organization
export const fetchScreensByOrganization = createAsyncThunk(
    "screen/fetchScreensByOrganization",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get("/screens");
            return response.data.screens || response.data; 
        } catch (error) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

const screenSlice = createSlice({
  name: "screen",
  initialState,
  reducers: {
    setSelectedScreenId: (state, action) => {
      state.selectedScreenId = action.payload;
    },
    clearSelectedScreenId: (state) => {
      state.selectedScreenId = null;
    },
    clearScreens: (state) => {
      state.screens = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchScreensByProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScreensByProject.fulfilled, (state, action) => {
        state.loading = false;
        state.screens = action.payload;
      })
      .addCase(fetchScreensByProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // New cases for organization screens
      .addCase(fetchScreensByOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScreensByOrganization.fulfilled, (state, action) => {
        state.loading = false;
        state.screens = action.payload;
      })
      .addCase(fetchScreensByOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
    setSelectedScreenId,
    clearSelectedScreenId,
    clearScreens,
} = screenSlice.actions;

export const selectScreens = (state) => state.screen.screens;
export const selectScreenLoading = (state) => state.screen.loading;
export const selectScreenError = (state) => state.screen.error;

export default screenSlice.reducer;
