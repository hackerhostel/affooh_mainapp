import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from "axios";

const initialState = {
    isTestCasesForProjectError: false,
    isTestCasesForProjectLoading: false,
    testCasesForProject: []
};

export const doGetTestCases = createAsyncThunk(
    'testCases/getTestCases',
    async (projectId, thunkApi) => {
        try {
            const response = await axios.get(`/projects/${projectId}/test-cases`)
            const responseData = response.data.testCases;

            if (responseData) {
                return responseData
            } else {
                return thunkApi.rejectWithValue('Test cases not found');
            }
        } catch (error) {
            console.log(error)
            return thunkApi.rejectWithValue(error.message);
        }
    }
);

export const testCaseSlice = createSlice({
    name: 'testCase',
    initialState,
    reducers: {
        clearTestCaseState: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(doGetTestCases.pending, (state) => {
                state.isTestCasesForProjectLoading = true;
            })
            .addCase(doGetTestCases.fulfilled, (state, action) => {
                state.testCasesForProject = action.payload;
                state.isTestCasesForProjectLoading = false;
                state.isTestCasesForProjectError = false;
            })
            .addCase(doGetTestCases.rejected, (state, action) => {
                state.isTestCasesForProjectLoading = false;
                state.isTestCasesForProjectError = true;
            });
    },
});

export const {clearTestCaseState} = testCaseSlice.actions;

export const selectIsTestCasesForProjectError = (state) => state?.testCase?.isTestCasesForProjectError;
export const selectIsTestCasesForProjectLoading = (state) => state?.testCase?.isTestCasesForProjectLoading;
export const selectTestCasesForProject = (state) => state?.testCase?.testCasesForProject;

export default testCaseSlice.reducer;
