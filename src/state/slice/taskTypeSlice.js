import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  taskTypes: [],
  selectedTaskTypeId: null,
  loading: false,
  error: null,
};


export const fetchAllTaskTypes = createAsyncThunk(
  "taskType/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/task-types");
      return response.data.taskTypes || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);


const taskTypeSlice = createSlice({
  name: "taskType",
  initialState,
  reducers: {
    setSelectedTaskTypeId: (state, action) => {
      state.selectedTaskTypeId = action.payload;
    },
    clearSelectedTaskTypeId: (state) => {
      state.selectedTaskTypeId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchAllTaskTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTaskTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.taskTypes = action.payload;
      })
      .addCase(fetchAllTaskTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
     
  },
});

export const { setSelectedTaskTypeId, clearSelectedTaskTypeId } =
  taskTypeSlice.actions;

// Selectors
export const selectTaskTypes = (state) => state.taskType.taskTypes;
export const selectTaskTypeLoading = (state) => state.taskType.loading;
export const selectTaskTypeError = (state) => state.taskType.error;

export default taskTypeSlice.reducer;
