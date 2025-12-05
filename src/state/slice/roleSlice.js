import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  // Template state
  template: null,
  isTemplateLoading: false,
  isTemplateError: false,
  templateError: null,

  // Roles list state
  roles: [],
  isRolesLoading: false,
  isRolesError: false,
  rolesError: null,

  // Single role state
  selectedRole: null,
  isRoleLoading: false,
  isRoleError: false,
  roleError: null,

  // Create/Update/Delete state
  isRoleSaving: false,
  isRoleSaveError: false,
  roleSaveError: null,
  isRoleDeleting: false,
  isRoleDeleteError: false,
  roleDeleteError: null,
};

// Fetch role template
export const doGetRoleTemplate = createAsyncThunk(
  "role/getTemplate",
  async (_, thunkApi) => {
    try {
      const response = await axios.get("/organizations/roles/template");
      const responseData = response?.data;

      // Handle different response structures
      let data;
      if (responseData?.body) {
        data = responseData.body;
      } else {
        data = responseData;
      }

      // If data has a 'template' key, extract it
      if (data?.template) {
        data = data.template;
      }

      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch role template"
      );
    }
  }
);

// Fetch all roles
export const doGetRoles = createAsyncThunk(
  "role/getRoles",
  async (_, thunkApi) => {
    try {
      const response = await axios.get("/organizations/roles");
      const responseData = response?.data;

      let data;
      // Handle different response structures
      if (responseData?.body) {
        data = responseData.body;
      } else if (Array.isArray(responseData)) {
        data = responseData;
      } else {
        data = responseData;
      }

      // Convert object with numeric keys to array
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        data = Object.values(data);
      }

      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch roles"
      );
    }
  }
);

// Fetch single role by ID
export const doGetRoleById = createAsyncThunk(
  "role/getRoleById",
  async (roleId, thunkApi) => {
    try {
      const response = await axios.get(`/organizations/roles/${roleId}`);
      const responseData = response?.data;

      // Handle different response structures
      let data;
      if (responseData?.body) {
        data = responseData.body;
      } else {
        data = responseData;
      }

      // Extract userRole if it exists
      if (data?.userRole) {
        data = data.userRole;
      }

      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch role"
      );
    }
  }
);

// Create new role
export const doCreateRole = createAsyncThunk(
  "role/createRole",
  async (roleData, thunkApi) => {
    try {
      console.log("doCreateRole - Sending data:", roleData);
      // Backend expects data wrapped in 'userRole' property
      const response = await axios.post("/organizations/roles", { userRole: roleData });
      console.log("doCreateRole - Response:", response);
      // Refresh the roles list after creating
      thunkApi.dispatch(doGetRoles());
      return response.data;
    } catch (error) {
      console.error("doCreateRole - Error:", error);
      console.error("doCreateRole - Error response:", error.response);
      console.error("doCreateRole - Error response data:", error.response?.data);
      return thunkApi.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to create role"
      );
    }
  }
);

// Update existing role
export const doUpdateRole = createAsyncThunk(
  "role/updateRole",
  async ({ roleId, roleData }, thunkApi) => {
    try {
      // Backend expects data wrapped in 'userRole' property
      const response = await axios.put(`/organizations/roles/${roleId}`, { userRole: roleData });
      // Refresh the roles list after updating
      thunkApi.dispatch(doGetRoles());
      return response.data;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to update role"
      );
    }
  }
);

// Delete role
export const doDeleteRole = createAsyncThunk(
  "role/deleteRole",
  async (roleId, thunkApi) => {
    try {
      await axios.delete(`/organizations/roles/${roleId}`);
      // Refresh the roles list after deleting
      thunkApi.dispatch(doGetRoles());
      return roleId;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to delete role"
      );
    }
  }
);

export const roleSlice = createSlice({
  name: "role",
  initialState,
  reducers: {
    clearSelectedRole: (state) => {
      state.selectedRole = null;
      state.isRoleLoading = false;
      state.isRoleError = false;
      state.roleError = null;
    },
    clearRoleErrors: (state) => {
      state.isTemplateError = false;
      state.templateError = null;
      state.isRolesError = false;
      state.rolesError = null;
      state.isRoleError = false;
      state.roleError = null;
      state.isRoleSaveError = false;
      state.roleSaveError = null;
      state.isRoleDeleteError = false;
      state.roleDeleteError = null;
    },
  },
  extraReducers: (builder) => {
    // Get template
    builder.addCase(doGetRoleTemplate.pending, (state) => {
      state.isTemplateLoading = true;
      state.isTemplateError = false;
      state.templateError = null;
    });
    builder.addCase(doGetRoleTemplate.fulfilled, (state, action) => {
      state.template = action.payload;
      state.isTemplateLoading = false;
    });
    builder.addCase(doGetRoleTemplate.rejected, (state, action) => {
      state.isTemplateLoading = false;
      state.isTemplateError = true;
      state.templateError = action.payload;
    });

    // Get roles
    builder.addCase(doGetRoles.pending, (state) => {
      state.isRolesLoading = true;
      state.isRolesError = false;
      state.rolesError = null;
    });
    builder.addCase(doGetRoles.fulfilled, (state, action) => {
      state.roles = action.payload;
      state.isRolesLoading = false;
    });
    builder.addCase(doGetRoles.rejected, (state, action) => {
      state.isRolesLoading = false;
      state.isRolesError = true;
      state.rolesError = action.payload;
    });

    // Get role by ID
    builder.addCase(doGetRoleById.pending, (state) => {
      state.isRoleLoading = true;
      state.isRoleError = false;
      state.roleError = null;
    });
    builder.addCase(doGetRoleById.fulfilled, (state, action) => {
      state.selectedRole = action.payload;
      state.isRoleLoading = false;
    });
    builder.addCase(doGetRoleById.rejected, (state, action) => {
      state.isRoleLoading = false;
      state.isRoleError = true;
      state.roleError = action.payload;
    });

    // Create role
    builder.addCase(doCreateRole.pending, (state) => {
      state.isRoleSaving = true;
      state.isRoleSaveError = false;
      state.roleSaveError = null;
    });
    builder.addCase(doCreateRole.fulfilled, (state) => {
      state.isRoleSaving = false;
    });
    builder.addCase(doCreateRole.rejected, (state, action) => {
      state.isRoleSaving = false;
      state.isRoleSaveError = true;
      state.roleSaveError = action.payload;
    });

    // Update role
    builder.addCase(doUpdateRole.pending, (state) => {
      state.isRoleSaving = true;
      state.isRoleSaveError = false;
      state.roleSaveError = null;
    });
    builder.addCase(doUpdateRole.fulfilled, (state) => {
      state.isRoleSaving = false;
    });
    builder.addCase(doUpdateRole.rejected, (state, action) => {
      state.isRoleSaving = false;
      state.isRoleSaveError = true;
      state.roleSaveError = action.payload;
    });

    // Delete role
    builder.addCase(doDeleteRole.pending, (state) => {
      state.isRoleDeleting = true;
      state.isRoleDeleteError = false;
      state.roleDeleteError = null;
    });
    builder.addCase(doDeleteRole.fulfilled, (state) => {
      state.isRoleDeleting = false;
    });
    builder.addCase(doDeleteRole.rejected, (state, action) => {
      state.isRoleDeleting = false;
      state.isRoleDeleteError = true;
      state.roleDeleteError = action.payload;
    });
  },
});

export const { clearSelectedRole, clearRoleErrors } = roleSlice.actions;

// Selectors
export const selectTemplate = (state) => state.role.template;
export const selectIsTemplateLoading = (state) => state.role.isTemplateLoading;
export const selectIsTemplateError = (state) => state.role.isTemplateError;
export const selectTemplateError = (state) => state.role.templateError;

export const selectRoles = (state) => state.role.roles;
export const selectIsRolesLoading = (state) => state.role.isRolesLoading;
export const selectIsRolesError = (state) => state.role.isRolesError;
export const selectRolesError = (state) => state.role.rolesError;

export const selectSelectedRole = (state) => state.role.selectedRole;
export const selectIsRoleLoading = (state) => state.role.isRoleLoading;
export const selectIsRoleError = (state) => state.role.isRoleError;
export const selectRoleError = (state) => state.role.roleError;

export const selectIsRoleSaving = (state) => state.role.isRoleSaving;
export const selectIsRoleSaveError = (state) => state.role.isRoleSaveError;
export const selectRoleSaveError = (state) => state.role.roleSaveError;

export const selectIsRoleDeleting = (state) => state.role.isRoleDeleting;
export const selectIsRoleDeleteError = (state) => state.role.isRoleDeleteError;
export const selectRoleDeleteError = (state) => state.role.roleDeleteError;

export default roleSlice.reducer;
