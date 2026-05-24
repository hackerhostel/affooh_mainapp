import axios from 'axios';

const BASE = `${import.meta.env.VITE_REACT_APP_API_PROTOCOL}://${import.meta.env.VITE_REACT_APP_API_HOST}`;
const API_KEY = import.meta.env.VITE_REACT_APP_X_API_KEY;

const headers = () => ({
  'x-api-key': API_KEY,
});

// ─── Model Config ────────────────────────────────────────────────────────────

export async function getModelConfig(agentType) {
  const { data } = await axios.get(`${BASE}/agents/${agentType.toLowerCase()}/model`, {
    headers: headers(),
  });
  return data;
}

export async function saveModelConfig(agentType, payload) {
  const { data } = await axios.put(`${BASE}/agents/${agentType.toLowerCase()}/model`, payload, {
    headers: headers(),
  });
  return data;
}

export async function testModelConfig(agentType) {
  const { data } = await axios.post(`${BASE}/agents/${agentType.toLowerCase()}/model/test`, {}, {
    headers: headers(),
  });
  return data;
}

export async function deleteModelConfig(agentType) {
  const { data } = await axios.delete(`${BASE}/agents/${agentType.toLowerCase()}/model`, {
    headers: headers(),
  });
  return data;
}

// ─── SEO Credentials ─────────────────────────────────────────────────────────

export async function getCredentials() {
  const { data } = await axios.get(`${BASE}/agents/seo/credentials`, {
    headers: headers(),
  });
  return data;
}

export async function saveCredential(provider, payload) {
  const { data } = await axios.post(`${BASE}/agents/seo/credentials/${provider}`, payload, {
    headers: headers(),
  });
  return data;
}

export async function testCredential(provider) {
  const { data } = await axios.post(`${BASE}/agents/seo/credentials/${provider}/test`, {}, {
    headers: headers(),
  });
  return data;
}

export async function deleteCredential(provider) {
  const { data } = await axios.delete(`${BASE}/agents/seo/credentials/${provider}`, {
    headers: headers(),
  });
  return data;
}

// ─── Agent Status ────────────────────────────────────────────────────────────

export async function getAgentStatus() {
  const { data } = await axios.get(`${BASE}/agents/status`, {
    headers: headers(),
  });
  return data;
}

export async function enableAgent(agentType) {
  const { data } = await axios.post(`${BASE}/agents/${agentType.toLowerCase()}/enable`, {}, {
    headers: headers(),
  });
  return data;
}

export async function disableAgent(agentType) {
  const { data } = await axios.post(`${BASE}/agents/${agentType.toLowerCase()}/disable`, {}, {
    headers: headers(),
  });
  return data;
}

// ─── SEO Schedule & Run ──────────────────────────────────────────────────────

export async function getSeoSchedule() {
  const { data } = await axios.get(`${BASE}/agents/seo/schedule`, {
    headers: headers(),
  });
  return data;
}

export async function saveSeoSchedule(payload) {
  const { data } = await axios.put(`${BASE}/agents/seo/schedule`, payload, {
    headers: headers(),
  });
  return data;
}

export async function getSeoSiteConfig() {
  const { data } = await axios.get(`${BASE}/agents/seo/site-config`, {
    headers: headers(),
  });
  return data;
}

export async function saveSeoSiteConfig(payload) {
  const { data } = await axios.put(`${BASE}/agents/seo/site-config`, payload, {
    headers: headers(),
  });
  return data;
}

export async function runSeoAnalysis(payload = {}) {
  const { data } = await axios.post(`${BASE}/agents/seo/run`, payload, {
    headers: headers(),
  });
  return data;
}

export async function getSeoExecutions() {
  const { data } = await axios.get(`${BASE}/agents/seo/executions`, {
    headers: headers(),
  });
  return data;
}

export async function getLatestSeoReport() {
  const { data } = await axios.get(`${BASE}/agents/seo/reports/latest`, {
    headers: headers(),
  });
  return data;
}

export async function getSeoReport(reportId) {
  const { data } = await axios.get(`${BASE}/agents/seo/reports/${reportId}`, {
    headers: headers(),
  });
  return data;
}

export async function getSeoReportList() {
  const { data } = await axios.get(`${BASE}/agents/seo/reports`, { headers: headers() });
  return data;
}

export async function getSeoReportIssues(reportId, params = {}) {
  const { data } = await axios.get(`${BASE}/agents/seo/reports/${reportId}/issues`, {
    headers: headers(),
    params,
  });
  return data;
}

export async function getSeoReportTasks(reportId, params = {}) {
  const { data } = await axios.get(`${BASE}/agents/seo/reports/${reportId}/tasks`, {
    headers: headers(),
    params,
  });
  return data;
}

export async function getSeoReportCode(reportId) {
  const { data } = await axios.get(`${BASE}/agents/seo/reports/${reportId}/code`, {
    headers: headers(),
  });
  return data;
}

export async function getSeoReportTable(reportId) {
  const { data } = await axios.get(`${BASE}/agents/seo/reports/${reportId}/table`, {
    headers: headers(),
  });
  return data;
}

export async function getSeoReportChart(reportId) {
  const { data } = await axios.get(`${BASE}/agents/seo/reports/${reportId}/chart`, {
    headers: headers(),
  });
  return data;
}

export async function getSeoReportMap(reportId) {
  const { data } = await axios.get(`${BASE}/agents/seo/reports/${reportId}/map`, {
    headers: headers(),
  });
  return data;
}

// ─── GSC OAuth ───────────────────────────────────────────────────────────────

export async function getGSCAuthURL() {
  const { data } = await axios.get(`${BASE}/agents/seo/gsc/auth-url`, {
    headers: headers(),
  });
  return data;
}

export async function disconnectGSC() {
  const { data } = await axios.delete(`${BASE}/agents/seo/gsc/disconnect`, {
    headers: headers(),
  });
  return data;
}

export async function getGSCProperties() {
  const { data } = await axios.get(`${BASE}/agents/seo/gsc/properties`, {
    headers: headers(),
  });
  return data;
}

export async function saveGSCProperty(selectedProperty) {
  const { data } = await axios.put(`${BASE}/agents/seo/gsc/property`, { selectedProperty }, {
    headers: headers(),
  });
  return data;
}

// ─── SEO Tasks ───────────────────────────────────────────────────────────────

export async function getSeoTasks() {
  const { data } = await axios.get(`${BASE}/agents/seo/tasks`, {
    headers: headers(),
  });
  return data;
}

export async function saveSeoTask(taskType, payload) {
  const { data } = await axios.put(`${BASE}/agents/seo/tasks/${taskType}`, payload, {
    headers: headers(),
  });
  return data;
}

export async function runSeoTask(taskType) {
  const { data } = await axios.post(`${BASE}/agents/seo/tasks/${taskType}/run`, {}, {
    headers: headers(),
  });
  return data;
}

// ─── Tool Toggle ─────────────────────────────────────────────────────────────

export async function toggleTool(provider, isEnabled) {
  const { data } = await axios.put(
    `${BASE}/agents/seo/tools/${provider}/toggle`,
    { isEnabled },
    { headers: headers() }
  );
  return data;
}

// ─── Agent Settings (Identity / Persona) ─────────────────────────────────────

export async function getAgentSettings(agentType) {
  const { data } = await axios.get(`${BASE}/agents/${agentType.toLowerCase()}/settings`, {
    headers: headers(),
  });
  return data;
}

export async function saveAgentSettings(agentType, settings) {
  const { data } = await axios.put(
    `${BASE}/agents/${agentType.toLowerCase()}/settings`,
    { settings },
    { headers: headers() }
  );
  return data;
}

// ─── Agent Chat ───────────────────────────────────────────────────────────────

export async function chatWithAgent(agentType, messages) {
  const { data } = await axios.post(
    `${BASE}/agents/${agentType.toLowerCase()}/chat`,
    { messages },
    { headers: headers() }
  );
  return data;
}
