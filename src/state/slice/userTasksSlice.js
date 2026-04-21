import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isUserTasksError: false,
  isUserTasksLoading: false,
  userTasks: [],
  selectedUserId: null,
  isEditingSame: false
};

export const doGetUserTasks = createAsyncThunk(
  "src/userTasks/getUserTasks",
  async (userId, thunkApi) => {
    try {
      
      const response = await axios.get(`/users/${userId}/tasks`);
      return response.data.tasks || [];
    } catch (error) {
      return thunkApi.rejectWithValue(error);
    }
  }
);

export const userTasksSlice = createSlice({
  name: "userTasks",
  initialState,
  reducers: {
    setSelectedUserId: (state, action) => {
      state.selectedUserId = action.payload;
    },
    clearUserTasksState: () => initialState,
    setIsEditingSame: (state, action) => {
      state.isEditingSame = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(doGetUserTasks.pending, (state, action) => {
      state.isUserTasksLoading = true;
      state.isUserTasksError = false;
    });
    builder.addCase(doGetUserTasks.fulfilled, (state, action) => {
      state.userTasks = action.payload;
      state.isUserTasksLoading = false;
      state.isUserTasksError = false;
    });
    builder.addCase(doGetUserTasks.rejected, (state, action) => {
      state.isUserTasksError = true;
      state.isUserTasksLoading = false;
      state.userTasks = [];
    });
  },
});

export const {setSelectedUserId, clearUserTasksState, setIsEditingSame} =
  userTasksSlice.actions;

export const selectIsUserTasksError = (state) =>
  state.userTasks.isUserTasksError;
export const selectIsUserTasksLoading = (state) =>
  state.userTasks.isUserTasksLoading;
export const selectUserTasks = (state) => state.userTasks.userTasks;
export const selectSelectedUserId = (state) => state.userTasks.selectedUserId;
export const selectIsEditingSame = (state) => state.userTasks.isEditingSame;

export default userTasksSlice.reducer;
