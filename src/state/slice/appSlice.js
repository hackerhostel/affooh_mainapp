import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import axios from "axios";
import {setRedirectSprint} from "./sprintSlice.js";
import {setClickedUser} from "./projectUsersSlice.js";

const initialState = {
  appConfig: {},
  organizationUsers: undefined,
  initialDataLoading: true,
  initialDataError: false,
}

export const doGetMasterData = createAsyncThunk(
  'src/app/doGetMasterData', async (_, thunkApi) =>
  {
  try {
    const response = await axios.get('/organizations/master-data');
    thunkApi.dispatch(doGetOrganizationUsers());

    const responseData = response.data;
    if (responseData) {
      return responseData;
    } else {
      return thunkApi.rejectWithValue('app details not found');
    }
  } catch (error) {
    return thunkApi.rejectWithValue(error);
  }
});

export const doGetOrganizationUsers = createAsyncThunk(
    'src/app/doGetOrganizationUsers', async (_, thunkApi) =>
    {
      try {
        const response = await axios.get('/organizations/users')

        const responseData = response.data.body;
        if (responseData) {
          thunkApi.dispatch(setClickedUser(responseData[0]));
          return responseData;
        } else {
          return thunkApi.rejectWithValue('Organization users not found');
        }
      } catch (error) {
        return thunkApi.rejectWithValue(error);
      }
    });

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    clearAppState: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(doGetMasterData.pending, (state, action) => {
      state.initialDataLoading = true;
    });
    builder.addCase(doGetMasterData.fulfilled, (state, action) => {
      state.initialDataLoading = false;
      state.initialDataError = false;
      state.appConfig = action.payload
    });
    builder.addCase(doGetMasterData.rejected, (state, action) => {
      state.initialDataError = true;
    });
    builder.addCase(doGetOrganizationUsers.pending, (state, action) => {
      state.initialDataLoading = true;
    });
    builder.addCase(doGetOrganizationUsers.fulfilled, (state, action) => {
      state.initialDataLoading = false;
      state.initialDataError = false;
      state.organizationUsers = action.payload
    });
    builder.addCase(doGetOrganizationUsers.rejected, (state, action) => {
      state.initialDataError = true;
    });
  }
})

export const {clearAppState} = appSlice.actions

export const selectAppConfig = (state) => state.app.appConfig;
export const selectInitialDataLoading = (state) => state.app.initialDataLoading;
export const selectInitialDataError = (state) => state.app.initialDataError;
export const selectOrganizationUsers = (state) => state.app.organizationUsers;

export default appSlice.reducer