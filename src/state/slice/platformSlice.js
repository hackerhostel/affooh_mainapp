import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from "axios";

const initialState = {
    isPlatformListError: false,
    isPlatformListLoading: false,
    platformList: [],
};

export const doGetPlatforms = createAsyncThunk(
    'platforms/getPlatforms',
    async (thunkApi) => {
        try {
            const response = await axios.get(`/organizations/platforms`)
            const responseData = response.data.platforms;

            if (responseData) {
                return responseData
            } else {
                return thunkApi.rejectWithValue('Platforms not found');
            }
        } catch (error) {
            console.log(error)
            return thunkApi.rejectWithValue(error.message);
        }
    }
);

export const platformsSlice = createSlice({
    name: 'platform',
    initialState,
    reducers: {
        clearPlatformState: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(doGetPlatforms.pending, (state) => {
                state.isPlatformListLoading = true;
            })
            .addCase(doGetPlatforms.fulfilled, (state, action) => {
                state.platformList = action.payload;
                state.isPlatformListLoading = false;
                state.isPlatformListError = false;
            })
            .addCase(doGetPlatforms.rejected, (state, action) => {
                state.isPlatformListLoading = false;
                state.isPlatformListError = true;
            });
    },
});

export const {clearPlatformState} = platformsSlice.actions;

export const selectIsPlatformListError = (state) => state?.platform?.isPlatformListError;
export const selectIsPlatformListLoading = (state) => state?.platform?.isPlatformListLoading;
export const selectPlatformList = (state) => state?.platform?.platformList;

export default platformsSlice.reducer;