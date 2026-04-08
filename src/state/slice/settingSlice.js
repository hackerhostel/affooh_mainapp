import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    settingView: "notifications",
    selectedCategory: "general"
};

const settingSlice = createSlice({
    name: "settings",
    initialState,
    reducers: {
        setSettingView: (state, action) => {
            state.settingView = action.payload;
        },
        setSelectedCategory: (state, action) => {
            state.selectedCategory = action.payload;
        }
    },
});

export const settingView = (state) => state?.setting?.settingView;
export const selectedCategory = (state) => state?.setting?.selectedCategory;
export const { setSettingView, setSelectedCategory } = settingSlice.actions;
export default settingSlice.reducer;