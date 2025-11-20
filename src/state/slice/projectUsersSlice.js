import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { generateClient } from "aws-amplify/api";
import { fetchAuthSession } from "aws-amplify/auth";
import { getProjectUsers } from "../../graphql/projectQueries/queries.js";
import { doGetSprintBreakdown, setRedirectSprint } from "./sprintSlice.js";
import axios from "axios";

const initialState = {
  isProjectUsersError: false,
  isProjectUsersLoading: false,
  projectUserList: [],
  selectedUser: undefined,
};

export const doGetProjectUsers = createAsyncThunk(
  "projectUsers/getProjectUsers",
  async (projectId, thunkApi) => {
    try {
      const response = await axios.get(`/projects/${projectId}/users`);
      const responseData = response.data.body;

      if (responseData) {
        return responseData;
      } else {
        return thunkApi.rejectWithValue("Sprint list not found");
      }
    } catch (error) {
      return thunkApi.rejectWithValue(error.message); // Serialize error to avoid non-serializable warning
    }
  }
);

export const projectUsersSlice = createSlice({
  name: "projectUsers",
  initialState,
  reducers: {
    clearProjectUsersState: () => initialState,
    setClickedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(doGetProjectUsers.pending, (state) => {
        state.isProjectUsersLoading = true;
      })
      .addCase(doGetProjectUsers.fulfilled, (state, action) => {
        state.projectUserList = action.payload;
        state.isProjectUsersLoading = false;
        state.isProjectUsersError = false;
      })
      .addCase(doGetProjectUsers.rejected, (state, action) => {
        state.isProjectUsersLoading = false;
        state.isProjectUsersError = true;
      });
  },
});

export const { clearProjectUsersState, setClickedUser } =
  projectUsersSlice.actions;

export const selectIsProjectUsersError = (state) =>
  state?.projectUsers?.isProjectUsersError;
export const selectIsProjectUsersLoading = (state) =>
  state?.projectUsers?.isProjectUsersLoading;
export const selectProjectUserList = (state) =>
  state?.projectUsers?.projectUserList;
export const clickedUser = (state) => state.projectUsers?.selectedUser;

export default projectUsersSlice.reducer;
