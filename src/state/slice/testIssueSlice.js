import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  // Issue Count State
  isIssueCountLoading: false,
  isIssueCountError: false,
  issueCount: 0,
  // Issues List State
  isIssuesLoading: false,
  isIssuesError: false,
  issues: [],
  // Add Issues State
  isAddIssuesLoading: false,
  isAddIssuesError: false,
};

// Fetch Issue Count for a Test Suite
export const doGetIssueCount = createAsyncThunk(
  "testIssues/getIssueCount",
  async ({ testSuiteID, testCaseID, platform, testCycleID }, thunkApi) => {
    
    try {
      const response = await axios.get(
        `/test-plans/test-suites/${testSuiteID}/issues/count`,
        {
          params: { testCaseID, platform, testCycleID }, 
        }
      );
      const responseData = response.data;

      if (responseData !== undefined) {
        return responseData;
      } else {
        return thunkApi.rejectWithValue("Issue count not found");
      }
    } catch (error) {
      console.log(error);
      return thunkApi.rejectWithValue(error.message);
    }
  }
);

// Fetch Issues for a Test Suite
export const doGetIssues = createAsyncThunk(
  "testIssues/getIssues",
  async ({ testSuiteID, testCaseID, platform, testCycleID }, thunkApi) => {
    
    try {
      const response = await axios.get(
        `/test-plans/test-suites/${testSuiteID}/issues`,
        {
          params: { testCaseID, platform, testCycleID }, 
        }
      );
      const responseData = response.data;

      console.log("doGetIssues response:", responseData);

      if (responseData) {
        return responseData;
      } else {
        return thunkApi.rejectWithValue("Issues not found");
      }
    } catch (error) {
      console.log("doGetIssues error:", error);
      return thunkApi.rejectWithValue(error.message);
    }
  }
);

// Add Issues
export const doAddIssues = createAsyncThunk(
  "testIssues/addIssues",
  async (
    { testSuiteID, taskIDs, testCaseID, platform, testCycleID },
    thunkApi
  ) => {
    
    try {
      const response = await axios.post(
        `/test-plans/test-suites/${testSuiteID}/issues`,
        {
          testSuiteID,
          taskIDs,
          platform,
          testCycleID, 
        },
        {
          params: { testCaseID },
        }
      );
      const responseData = response.data;
      if (response.data.error || !responseData) {
        return thunkApi.rejectWithValue(
          response.data.message || "Failed to add issues"
        );
      }
      return responseData;
    } catch (error) {
      console.error("Error adding issues:", error);
      return thunkApi.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const testIssueSlice = createSlice({
  name: "testIssues",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get Issue Count
      .addCase(doGetIssueCount.pending, (state) => {
        state.isIssueCountLoading = true;
      })
      .addCase(doGetIssueCount.fulfilled, (state, action) => {
        state.issueCount = action.payload;
        state.isIssueCountLoading = false;
        state.isIssueCountError = false;
      })
      .addCase(doGetIssueCount.rejected, (state, action) => {
        state.isIssueCountLoading = false;
        state.isIssueCountError = true;
      })
      // Get Issues
      .addCase(doGetIssues.pending, (state) => {
        state.isIssuesLoading = true;
        state.isIssuesError = false;
      })
      .addCase(doGetIssues.fulfilled, (state, action) => {
        state.issues = action.payload || [];
        state.isIssuesLoading = false;
        state.isIssuesError = false;
      })
      .addCase(doGetIssues.rejected, (state, action) => {
        state.isIssuesLoading = false;
        state.isIssuesError = true;
      })
      // Add Issues
      .addCase(doAddIssues.pending, (state) => {
        state.isAddIssuesLoading = true;
      })
      .addCase(doAddIssues.fulfilled, (state, action) => {
        state.isAddIssuesLoading = false;
        state.isAddIssuesError = false;
      })
      .addCase(doAddIssues.rejected, (state, action) => {
        state.isAddIssuesLoading = false;
        state.isAddIssuesError = true;
      });
  },
});

export const selectIssueCount = (state) => state.testIssues?.issueCount;
export const selectIsIssueCountLoading = (state) =>
  state.testIssues?.isIssueCountLoading;
export const selectIsIssueCountError = (state) =>
  state.testIssues?.isIssueCountError;
export const selectIssues = (state) => state.testIssues?.issues;
export const selectIsIssuesLoading = (state) =>
  state.testIssues?.isIssuesLoading;
export const selectIsIssuesError = (state) => state.testIssues?.isIssuesError;
export const selectIsAddIssuesLoading = (state) =>
  state.testIssues?.isAddIssuesLoading;
export const selectIsAddIssuesError = (state) =>
  state.testIssues?.isAddIssuesError;

export default testIssueSlice.reducer;
