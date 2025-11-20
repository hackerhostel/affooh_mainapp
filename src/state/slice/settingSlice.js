import { createSlice } from "@reduxjs/toolkit";

const settingSlice = createSlice({
    name: "settingView",
    initialState: {
        selectedView:"customFields"
    },

    reducers: {
        setSettingView: (state, action) => {
            state.selectedView = action.payload
        },
    },
});

export const {setSettingView} = settingSlice.actions;
export default settingSlice.reducer;