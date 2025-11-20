import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  selectedSprint: undefined,
  sprintListForProject: [],
  isSprintListForProjectLoading: false,
  isSprintListForProjectError: false
}

export const doGetSprintBreakdown = createAsyncThunk('src/sprint/getSprintBreakdown',
  async (projectId, thunkApi) => {
    try {
      const response = await axios.get(`/projects/${projectId}/sprints`)
      const responseData = response.data.body;

      if (responseData) {
        return responseData.sprints
      } else {
        return thunkApi.rejectWithValue('sprint list not found');
      }
    } catch (error) {
      return thunkApi.rejectWithValue(error);
    }
  });

export const doGetSprintFormData = createAsyncThunk('src/sprints/form-data',
    async (thunkApi) => {
      try {
        const response = await axios.get(`/sprints/form-data`)
        const responseData = response?.data;

        if (responseData) {
          return responseData?.body
        } else {
          return thunkApi.rejectWithValue('sprint form data not found');
        }
      } catch (error) {
        return thunkApi.rejectWithValue(error);
      }
    });

export const sprintSlice = createSlice({
  name: 'sprint',
  initialState,
  reducers: {
    setSelectedSprint: (state, action) => {
      state.selectedSprint = action.payload;
    },
    setRedirectSprint: (state, action) => {
      state.redirectSprint = action.payload;
    },
    clearSprintState: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(doGetSprintBreakdown.pending, (state, action) => {
      state.isSprintListForProjectLoading = true;
    });
    builder.addCase(doGetSprintBreakdown.fulfilled, (state, action) => {
      state.sprintListForProject = action.payload;
      state.selectedSprint = state?.redirectSprint > 0 ? action.payload?.find(sl => sl.id === state.sprint?.redirectSprint) : action.payload[0];
      state.isSprintListForProjectLoading = false;
      state.isSprintListForProjectError = false;
    });
    builder.addCase(doGetSprintBreakdown.rejected, (state, action) => {
      state.isSprintListForProjectLoading = false;
      state.isSprintListForProjectError = true;
    });

    builder.addCase(doGetSprintFormData.pending, (state, action) => {
      state.isSprintListForProjectLoading = true;
    });
    builder.addCase(doGetSprintFormData.fulfilled, (state, action) => {
      state.sprintFormData = action.payload;
      state.isSprintListForProjectLoading = false;
      state.isSprintListForProjectError = false;
    });
    builder.addCase(doGetSprintFormData.rejected, (state, action) => {
      state.isSprintListForProjectLoading = false;
      state.isSprintListForProjectError = true;
    });
  }
})

export const {setSelectedSprint, setRedirectSprint} = sprintSlice.actions;

export const selectSelectedSprint = (state) => state.sprint.selectedSprint;
export const selectIsSprintListForProjectError = (state) => state.sprint.isSprintListForProjectError;
export const selectIsSprintListForProjectLoading = (state) => state.sprint.isSprintListForProjectLoading;
export const selectSprintListForProject = (state) => state.sprint.sprintListForProject;
export const selectSprintFormData = (state) => state.sprint.sprintFormData;

export default sprintSlice.reducer
