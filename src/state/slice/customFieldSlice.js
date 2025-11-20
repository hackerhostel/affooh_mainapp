import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    customFields: [],
    fieldTypes: [],
    selectedCustomFieldId: null, 
    loading: false,
    error: null,
};

// Fetch Field Types
export const fetchFieldTypes = createAsyncThunk(
    "customField/fetchFieldTypes",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get("/custom-fields/field-types");
            return response.data.body;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

// Create Custom Field
export const createCustomField = createAsyncThunk(
    "customField/create",
    async (customFieldData, { rejectWithValue }) => {
        try {
            const response = await axios.post("/custom-fields", customFieldData);
            return response.data.body;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

// Fetch All Custom Fields
export const fetchCustomFields = createAsyncThunk(
    "customField/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get("/custom-fields");
            return response.data.body;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);

// Delete Custom Field
export const deleteCustomField = createAsyncThunk(
    "customField/delete",
    async (customFieldId, { rejectWithValue }) => {
        try {
            await axios.delete(`/custom-fields/${customFieldId}`);
            return customFieldId;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Something went wrong");
        }
    }
);


const customFieldSlice = createSlice({
    name: "customField",
    initialState,
    reducers: {
        setSelectedCustomFieldId: (state, action) => {
            state.selectedCustomFieldId = action.payload;
        },
        clearSelectedCustomFieldId: (state) => {
            state.selectedCustomFieldId = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Field Types
            .addCase(fetchFieldTypes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFieldTypes.fulfilled, (state, action) => {
                state.loading = false;
                state.fieldTypes = action.payload;
            })
            .addCase(fetchFieldTypes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create
            .addCase(createCustomField.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createCustomField.fulfilled, (state, action) => {
                state.loading = false;
                state.customFields.push(action.payload);
            })
            .addCase(createCustomField.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch All
            .addCase(fetchCustomFields.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCustomFields.fulfilled, (state, action) => {
                state.loading = false;
                state.customFields = action.payload;
            })
            .addCase(fetchCustomFields.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Delete
            .addCase(deleteCustomField.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteCustomField.fulfilled, (state, action) => {
                state.loading = false;
                state.customFields = state.customFields.filter(
                    (field) => field.id !== action.payload
                );
            })
            .addCase(deleteCustomField.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setSelectedCustomFieldId, clearSelectedCustomFieldId } = customFieldSlice.actions;

export default customFieldSlice.reducer;
