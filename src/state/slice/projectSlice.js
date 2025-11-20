import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {doGetSprintBreakdown, doGetSprintFormData, setRedirectSprint} from "./sprintSlice.js";
import {doGetProjectUsers} from "./projectUsersSlice.js";
import axios from "axios";

const initialState = {
  isProjectDetailsError: false,
  isProjectDetailsLoading: true,
  selectedProject: undefined,
  selectedProjectFromList: undefined,
  projectList: [],

  isSwitchingProject: true
}

export const doGetProjectBreakdown = createAsyncThunk('src/project/getProjectBreakdown',
  async (_, thunkApi) => {
    try {
      const state = thunkApi.getState();
      const { selectedProject } = state.project;

      if (selectedProject) {
        const selectedProjectId = selectedProject?.id
        thunkApi.dispatch(setRedirectSprint(0));
        thunkApi.dispatch(doGetSprintBreakdown(selectedProjectId));
        thunkApi.dispatch(doGetProjectUsers(selectedProjectId));
        thunkApi.dispatch(doGetSprintFormData());
        thunkApi.dispatch(doGetProjectFormData());
      } else {
        thunkApi.dispatch(doGetProjectFormData());
      }
    } catch (error) {
      return thunkApi.rejectWithValue(error);
    }
  });

export const doSwitchProject = createAsyncThunk('src/project/switchProject',
  async (newProjectId, thunkApi) => {
    try {
      const state = thunkApi.getState();
      const { projectList } = state.project;

      // TODO: other initial lists will be invoked here
      thunkApi.dispatch(setRedirectSprint(0));
      thunkApi.dispatch(doGetSprintBreakdown(newProjectId));
      thunkApi.dispatch(doGetProjectUsers(newProjectId));
      thunkApi.dispatch(doGetSprintFormData());

      if(projectList && Array.isArray(projectList)) {
        const pp = projectList.filter(p => p.id === newProjectId)
        return pp[0]
      }
    } catch (error) {
      return thunkApi.rejectWithValue(error);
    }
  });

export const doGetProjectFormData = createAsyncThunk('src/projects/form-data',
    async (thunkApi) => {
      try {
        const response = await axios.get('/projects/form-data')
        const responseData = response?.data;

        if (responseData) {
          return responseData?.body.types
        } else {
          return thunkApi.rejectWithValue('Project form data not found');
        }
      } catch (error) {
        return thunkApi.rejectWithValue(error);
      }
    });

export const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setSelectedProjectFromList: (state, action) => {
      state.selectedProjectFromList = action.payload;
    },
    setProjectList: (state, action) => {
      state.projectList = action.payload;
    },
    setSelectedProject: (state, action) => {
      state.selectedProject = action.payload;
    },
    clearProjectState: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(doSwitchProject.pending, (state, action) => {
      state.isSwitchingProject = true;
    });
    builder.addCase(doSwitchProject.fulfilled, (state, action) => {
      state.selectedProject = action.payload;
      state.isSwitchingProject = false;
    });
    builder.addCase(doGetProjectFormData.pending, (state, action) => {
      state.isProjectDetailsLoading = true;
    });
    builder.addCase(doGetProjectFormData.fulfilled, (state, action) => {
      state.projectFormdata = action.payload;
      state.isProjectDetailsLoading = false;
    });
  }
})

export const {setSelectedProjectFromList, setProjectList, setSelectedProject} = projectSlice.actions;

export const selectIsProjectDetailsError = (state) => state.project.isProjectDetailsError;
export const selectIsProjectDetailsLoading = (state) => state.project.isProjectDetailsLoading;
export const selectSelectedProject = (state) => state.project.selectedProject;
export const selectSelectedProjectFromList = (state) => state.project.selectedProjectFromList;
export const selectProjectList = (state) => state.project.projectList;
export const setProjectType = (state) => state.project.projectFormdata;

export default projectSlice.reducer
