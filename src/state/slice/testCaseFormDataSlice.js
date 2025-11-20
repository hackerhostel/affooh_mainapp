import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from "axios";

const initialState = {
    isTestCaseFormDataError: false,
    isTestCaseFormDataLoading: false,
    testCaseStatuses: [],
    testCasePriorities: [],
    testCaseCategories: [],
};

export const doGetTestCaseFormData = createAsyncThunk(
    'testCaseFormData/getTestCaseFormData',
    async (projectId, thunkApi) => {
        try {
            const response = await axios.get(`/projects/${projectId}/test-case-form-data`)
            const responseData = response.data.testCaseFormData;

            if (responseData) {
                return responseData
            } else {
                return thunkApi.rejectWithValue('Test case form data not found');
            }
        } catch (error) {
            console.log(error)
            return thunkApi.rejectWithValue(error.message);
            }
    }
);

export const testCaseFormDataSlice = createSlice({
    name: 'testCaseFormData',
    initialState,
    reducers: {
        clearTestCaseFormDataState: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(doGetTestCaseFormData.pending, (state) => {
                state.isTestCaseFormDataLoading = true;
            })
            .addCase(doGetTestCaseFormData.fulfilled, (state, action) => {
                state.isTestCaseFormDataLoading = false;
                state.isTestCaseFormDataError = false;
                const attributes = action.payload?.attributes || [];

                state.testCaseStatuses = attributes.filter(attr => attr.type === 'STATUS');
                state.testCasePriorities = attributes.filter(attr => attr.type === 'PRIORITY');
                state.testCaseCategories = attributes.filter(attr => attr.type === 'CATEGORY');
            })
            .addCase(doGetTestCaseFormData.rejected, (state, action) => {
                state.isTestCaseFormDataLoading = false;
                state.isTestCaseFormDataError = true;
            });
    },
});

export const {clearTestCaseFormDataState} = testCaseFormDataSlice.actions;
export const selectIsTestCaseFormDataError = (state) => state?.testCaseFormData?.isTestCaseFormDataError;
export const selectIsTestCaseFormDataLoading = (state) => state?.testCaseFormData?.isTestCaseFormDataLoading;
export const selectTestCaseStatuses = (state) => state?.testCaseFormData?.testCaseStatuses;
export const selectTestCasePriorities = (state) => state?.testCaseFormData?.testCasePriorities;
export const selectTestCaseCategories = (state) => state?.testCaseFormData?.testCaseCategories;

export default testCaseFormDataSlice.reducer;
