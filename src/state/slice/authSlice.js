import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import axios from "axios";
import {setProjectList, setSelectedProject} from "./projectSlice.js";

const initialState = {
  appConfig: {},
  user: {permissions: []},
  initialDataLoading: true,
  initialDataError: false,
}

export const doGetWhoAmI = createAsyncThunk('src/auth/doGetWhoAmI', async (_, thunkApi) => {
  try {
    const response = await axios.get('/users/who-am-i');   

    const responseData = response.data.body;
    if (responseData) {
      thunkApi.dispatch(setProjectList(responseData.projects));
      thunkApi.dispatch(setSelectedProject(responseData.projects[0]));
      return responseData.userDetails;
    } else {
      console.error('❌ doGetWhoAmI: Response body is missing.');
      return thunkApi.rejectWithValue('User details not found in response body');
    }
  } catch (error) {
    console.error('❌ doGetWhoAmI: API call failed with an error:', error);
    return thunkApi.rejectWithValue(error);
  }
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthState: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(doGetWhoAmI.pending, (state, action) => {
      state.initialDataLoading = true;
    });
    builder.addCase(doGetWhoAmI.fulfilled, (state, action) => {
      state.initialDataLoading = false;
      state.initialDataError = false;
      state.user = action.payload
    });
    builder.addCase(doGetWhoAmI.rejected, (state, action) => {
      state.initialDataLoading = false;
      state.initialDataError = true;
    });
  }
})

export const {clearAuthState} = authSlice.actions

export const selectUser = (state) => state.auth.user;
export const selectInitialUserDataLoading = (state) => state.auth.initialDataLoading;
export const selectInitialUserDataError = (state) => state.auth.initialDataError;

export default authSlice.reducer