import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getAgentStatus,
  getModelConfig,
  getSeoSiteConfig,
  saveSeoSiteConfig,
  getSeoSchedule,
  saveSeoSchedule,
  getLatestSeoReport,
  getSeoReport,
  getSeoReportList,
  getSeoExecutions,
  runSeoAnalysis,
  getAgentSettings,
  saveAgentSettings,
  chatWithAgent,
  getSeoReportCode,
  getSeoReportTable,
  getSeoReportChart,
  getSeoReportMap,
} from '../../pages/agents/agentApi';

// ─── Thunks ──────────────────────────────────────────────────────────────────

export const doGetAgentStatus = createAsyncThunk(
  'agent/getAgentStatus',
  async (_, { rejectWithValue }) => {
    try { return await getAgentStatus(); }
    catch (e) { return rejectWithValue(e?.response?.data?.error || e.message); }
  }
);

export const doGetModelConfig = createAsyncThunk(
  'agent/getModelConfig',
  async (agentType, { rejectWithValue }) => {
    try { return await getModelConfig(agentType); }
    catch (e) { return rejectWithValue(e?.response?.data?.error || e.message); }
  }
);

export const doGetSiteConfig = createAsyncThunk(
  'agent/getSiteConfig',
  async (_, { rejectWithValue }) => {
    try { return await getSeoSiteConfig(); }
    catch (e) { return rejectWithValue(e?.response?.data?.error || e.message); }
  }
);

export const doSaveSiteConfig = createAsyncThunk(
  'agent/saveSiteConfig',
  async (payload, { rejectWithValue }) => {
    try { await saveSeoSiteConfig(payload); return payload; }
    catch (e) { return rejectWithValue(e?.response?.data?.error || e.message); }
  }
);

export const doGetSchedule = createAsyncThunk(
  'agent/getSchedule',
  async (_, { rejectWithValue }) => {
    try { return await getSeoSchedule(); }
    catch (e) { return rejectWithValue(e?.response?.data?.error || e.message); }
  }
);

export const doSaveSchedule = createAsyncThunk(
  'agent/saveSchedule',
  async (payload, { rejectWithValue }) => {
    try { await saveSeoSchedule(payload); return payload; }
    catch (e) { return rejectWithValue(e?.response?.data?.error || e.message); }
  }
);

export const doGetLatestReport = createAsyncThunk(
  'agent/getLatestReport',
  async (_, { rejectWithValue }) => {
    try { return await getLatestSeoReport(); }
    catch (e) { return rejectWithValue(e?.response?.data?.error || e.message); }
  }
);

export const doGetReportById = createAsyncThunk(
  'agent/getReportById',
  async (reportId, { rejectWithValue }) => {
    try { return await getSeoReport(reportId); }
    catch (e) { return rejectWithValue(e?.response?.data?.error || e.message); }
  }
);

export const doGetExecutions = createAsyncThunk(
  'agent/getExecutions',
  async (_, { rejectWithValue }) => {
    try { return await getSeoExecutions(); }
    catch (e) { return rejectWithValue(e?.response?.data?.error || e.message); }
  }
);

export const doGetReportList = createAsyncThunk(
  'agent/getReportList',
  async (_, { rejectWithValue }) => {
    try { return await getSeoReportList(); }
    catch (e) { return rejectWithValue(e?.response?.data?.error || e.message); }
  }
);

export const doRunAnalysis = createAsyncThunk(
  'agent/runAnalysis',
  async (payload, { rejectWithValue }) => {
    try { return await runSeoAnalysis(payload); }
    catch (e) { return rejectWithValue(e?.response?.data?.error || e.message); }
  }
);

export const doGetAgentSettings = createAsyncThunk(
  'agent/getAgentSettings',
  async (agentType, { rejectWithValue }) => {
    try { return await getAgentSettings(agentType); }
    catch (e) { return rejectWithValue(e?.response?.data?.error || e.message); }
  }
);

export const doSaveAgentSettings = createAsyncThunk(
  'agent/saveAgentSettings',
  async ({ agentType, settings }, { rejectWithValue }) => {
    try { await saveAgentSettings(agentType, settings); return { agentType, settings }; }
    catch (e) { return rejectWithValue(e?.response?.data?.error || e.message); }
  }
);

export const doSendChatMessage = createAsyncThunk(
  'agent/sendChatMessage',
  async ({ agentType, messages }, { rejectWithValue }) => {
    try { return await chatWithAgent(agentType, messages); }
    catch (e) { return rejectWithValue(e?.response?.data?.error || e.message); }
  }
);

export const doGetReportCode = createAsyncThunk(
  'agent/getReportCode',
  async (reportId, { rejectWithValue }) => {
    try { return await getSeoReportCode(reportId); }
    catch (e) { return rejectWithValue(e?.response?.data?.error || e.message); }
  }
);

export const doGetReportTable = createAsyncThunk(
  'agent/getReportTable',
  async (reportId, { rejectWithValue }) => {
    try { return await getSeoReportTable(reportId); }
    catch (e) { return rejectWithValue(e?.response?.data?.error || e.message); }
  }
);

export const doGetReportChart = createAsyncThunk(
  'agent/getReportChart',
  async (reportId, { rejectWithValue }) => {
    try { return await getSeoReportChart(reportId); }
    catch (e) { return rejectWithValue(e?.response?.data?.error || e.message); }
  }
);

export const doGetReportMap = createAsyncThunk(
  'agent/getReportMap',
  async (reportId, { rejectWithValue }) => {
    try { return await getSeoReportMap(reportId); }
    catch (e) { return rejectWithValue(e?.response?.data?.error || e.message); }
  }
);

export const doLoadSeoData = createAsyncThunk(
  'agent/loadSeoData',
  async (_, { dispatch }) => {
    await Promise.allSettled([
      dispatch(doGetAgentStatus()),
      dispatch(doGetModelConfig('SEO')),
      dispatch(doGetSchedule()),
      dispatch(doGetSiteConfig()),
      dispatch(doGetExecutions()),
      dispatch(doGetReportList()),
    ]);
    // Load latest report then fetch its full detail + output tabs
    const reportResult = await dispatch(doGetLatestReport());
    if (doGetLatestReport.fulfilled.match(reportResult)) {
      const reportId = reportResult.payload?.report?.id;
      if (reportId) {
        await Promise.allSettled([
          dispatch(doGetReportById(reportId)),
          dispatch(doGetReportCode(reportId)),
          dispatch(doGetReportTable(reportId)),
          dispatch(doGetReportChart(reportId)),
          dispatch(doGetReportMap(reportId)),
        ]);
      }
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const agentSlice = createSlice({
  name: 'agent',
  initialState: {
    selectedAgent: null,
    configureModalOpen: false,
    configureActiveTab: 'model',
    seoStatus: null,
    seoModelConfig: null,
    seoCredentials: {},
    seoSiteConfig: null,
    seoSchedule: null,
    latestReport: null,
    reportDetail: null,
    reportList: [],
    reportCode: null,     // { snippets: CodeSnippet[] }
    reportTable: null,    // { columns, rows }
    reportChart: null,    // { title, source, bars }
    reportMap: null,      // { center, nodes }
    executions: [],
    currentExecution: null,
    agentIdentity: {},
    chatMessages: [],
    loading: {},
    error: null,
  },
  reducers: {
    setSelectedAgent: (state, action) => { state.selectedAgent = action.payload; },
    setConfigureModalOpen: (state, action) => { state.configureModalOpen = action.payload; },
    setConfigureActiveTab: (state, action) => { state.configureActiveTab = action.payload; },
    clearAgentError: (state) => { state.error = null; },
    addChatMessage: (state, action) => { state.chatMessages.push(action.payload); },
    clearChatMessages: (state) => { state.chatMessages = []; },
    // WebSocket update — real-time execution progress
    seoExecutionUpdated: (state, action) => {
      const update = action.payload;
      state.currentExecution = {
        ...(state.currentExecution || {}),
        ...update,
      };
      // Reflect status in executions list if matching id
      if (update.executionId) {
        const idx = state.executions.findIndex(e => e.id === update.executionId);
        if (idx >= 0) {
          state.executions[idx] = { ...state.executions[idx], status: update.status };
        }
      }
    },
  },
  extraReducers: (builder) => {
    const setLoading = (key) => (state) => { state.loading[key] = true; };
    const clearLoading = (key) => (state) => { state.loading[key] = false; };

    builder
      // getAgentStatus
      .addCase(doGetAgentStatus.pending, setLoading('status'))
      .addCase(doGetAgentStatus.fulfilled, (state, action) => {
        state.loading.status = false;
        state.seoStatus = action.payload;
      })
      .addCase(doGetAgentStatus.rejected, clearLoading('status'))

      // getModelConfig
      .addCase(doGetModelConfig.pending, setLoading('model'))
      .addCase(doGetModelConfig.fulfilled, (state, action) => {
        state.loading.model = false;
        state.seoModelConfig = action.payload;
      })
      .addCase(doGetModelConfig.rejected, clearLoading('model'))

      // getSiteConfig
      .addCase(doGetSiteConfig.pending, setLoading('siteConfig'))
      .addCase(doGetSiteConfig.fulfilled, (state, action) => {
        state.loading.siteConfig = false;
        state.seoSiteConfig = action.payload?.siteConfig ?? action.payload ?? null;
      })
      .addCase(doGetSiteConfig.rejected, clearLoading('siteConfig'))

      // saveSiteConfig
      .addCase(doSaveSiteConfig.fulfilled, (state, action) => {
        state.seoSiteConfig = { ...(state.seoSiteConfig || {}), ...action.payload };
      })

      // getSchedule
      .addCase(doGetSchedule.pending, setLoading('schedule'))
      .addCase(doGetSchedule.fulfilled, (state, action) => {
        state.loading.schedule = false;
        state.seoSchedule = action.payload?.schedule ?? action.payload ?? null;
      })
      .addCase(doGetSchedule.rejected, clearLoading('schedule'))

      // saveSchedule
      .addCase(doSaveSchedule.fulfilled, (state, action) => {
        state.seoSchedule = { ...(state.seoSchedule || {}), ...action.payload };
      })

      // getLatestReport
      .addCase(doGetLatestReport.pending, setLoading('report'))
      .addCase(doGetLatestReport.fulfilled, (state, action) => {
        state.loading.report = false;
        state.latestReport = action.payload?.report || null;
      })
      .addCase(doGetLatestReport.rejected, clearLoading('report'))

      // getReportById — API returns { report, issues }; flatten into one object
      .addCase(doGetReportById.pending, setLoading('reportDetail'))
      .addCase(doGetReportById.fulfilled, (state, action) => {
        state.loading.reportDetail = false;
        const { report, issues } = action.payload || {};
        state.reportDetail = report ? { ...report, issues: issues || [] } : null;
      })
      .addCase(doGetReportById.rejected, clearLoading('reportDetail'))

      // getExecutions
      .addCase(doGetExecutions.pending, setLoading('executions'))
      .addCase(doGetExecutions.fulfilled, (state, action) => {
        state.loading.executions = false;
        state.executions = action.payload?.executions || [];
      })
      .addCase(doGetExecutions.rejected, clearLoading('executions'))

      // getReportList
      .addCase(doGetReportList.pending, setLoading('reportList'))
      .addCase(doGetReportList.fulfilled, (state, action) => {
        state.loading.reportList = false;
        state.reportList = action.payload?.reports || [];
      })
      .addCase(doGetReportList.rejected, clearLoading('reportList'))

      // runAnalysis
      .addCase(doRunAnalysis.pending, setLoading('running'))
      .addCase(doRunAnalysis.fulfilled, (state, action) => {
        state.loading.running = false;
        if (action.payload?.executionId) {
          state.currentExecution = { id: action.payload.executionId, status: 'QUEUED' };
        }
      })
      .addCase(doRunAnalysis.rejected, (state, action) => {
        state.loading.running = false;
        state.error = action.payload;
      })

      // getReportCode
      .addCase(doGetReportCode.pending, (state) => { state.loading.reportCode = true; })
      .addCase(doGetReportCode.fulfilled, (state, action) => {
        state.loading.reportCode = false;
        state.reportCode = action.payload ?? null;
      })
      .addCase(doGetReportCode.rejected, (state) => { state.loading.reportCode = false; })

      // getReportTable
      .addCase(doGetReportTable.pending, (state) => { state.loading.reportTable = true; })
      .addCase(doGetReportTable.fulfilled, (state, action) => {
        state.loading.reportTable = false;
        state.reportTable = action.payload?.table ?? null;
      })
      .addCase(doGetReportTable.rejected, (state) => { state.loading.reportTable = false; })

      // getReportChart
      .addCase(doGetReportChart.pending, (state) => { state.loading.reportChart = true; })
      .addCase(doGetReportChart.fulfilled, (state, action) => {
        state.loading.reportChart = false;
        state.reportChart = action.payload?.chart ?? null;
      })
      .addCase(doGetReportChart.rejected, (state) => { state.loading.reportChart = false; })

      // getReportMap
      .addCase(doGetReportMap.pending, (state) => { state.loading.reportMap = true; })
      .addCase(doGetReportMap.fulfilled, (state, action) => {
        state.loading.reportMap = false;
        state.reportMap = action.payload?.map ?? null;
      })
      .addCase(doGetReportMap.rejected, (state) => { state.loading.reportMap = false; })

      // loadSeoData
      .addCase(doLoadSeoData.pending, (state) => { state.loading.initial = true; })
      .addCase(doLoadSeoData.fulfilled, (state) => { state.loading.initial = false; })
      .addCase(doLoadSeoData.rejected, (state) => { state.loading.initial = false; })

      // getAgentSettings
      .addCase(doGetAgentSettings.pending, setLoading('identity'))
      .addCase(doGetAgentSettings.fulfilled, (state, action) => {
        state.loading.identity = false;
        state.agentIdentity = action.payload?.settings || {};
      })
      .addCase(doGetAgentSettings.rejected, clearLoading('identity'))

      // saveAgentSettings
      .addCase(doSaveAgentSettings.pending, setLoading('savingIdentity'))
      .addCase(doSaveAgentSettings.fulfilled, (state, action) => {
        state.loading.savingIdentity = false;
        state.agentIdentity = { ...state.agentIdentity, ...action.payload.settings };
      })
      .addCase(doSaveAgentSettings.rejected, (state, action) => {
        state.loading.savingIdentity = false;
        state.error = action.payload;
      })

      // sendChatMessage
      .addCase(doSendChatMessage.pending, setLoading('chatTyping'))
      .addCase(doSendChatMessage.fulfilled, (state, action) => {
        state.loading.chatTyping = false;
        if (action.payload?.response) {
          state.chatMessages.push({ role: 'assistant', content: action.payload.response });
        }
      })
      .addCase(doSendChatMessage.rejected, (state, action) => {
        state.loading.chatTyping = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedAgent,
  setConfigureModalOpen,
  setConfigureActiveTab,
  clearAgentError,
  seoExecutionUpdated,
  addChatMessage,
  clearChatMessages,
} = agentSlice.actions;

// ─── Selectors ───────────────────────────────────────────────────────────────
export const selectSeoStatus = (s) => s.agent.seoStatus;
export const selectSeoModelConfig = (s) => s.agent.seoModelConfig;
export const selectSeoSiteConfig = (s) => s.agent.seoSiteConfig;
export const selectSeoSchedule = (s) => s.agent.seoSchedule;
export const selectLatestReport = (s) => s.agent.latestReport;
export const selectReportDetail = (s) => s.agent.reportDetail;
export const selectReportList = (s) => s.agent.reportList;
export const selectReportCode = (s) => s.agent.reportCode;
export const selectReportTable = (s) => s.agent.reportTable;
export const selectReportChart = (s) => s.agent.reportChart;
export const selectReportMap = (s) => s.agent.reportMap;
export const selectExecutions = (s) => s.agent.executions;
export const selectCurrentExecution = (s) => s.agent.currentExecution;
export const selectAgentLoading = (s) => s.agent.loading;
export const selectAgentError = (s) => s.agent.error;
export const selectAgentIdentity = (s) => s.agent.agentIdentity;
export const selectChatMessages = (s) => s.agent.chatMessages;

export default agentSlice.reducer;
