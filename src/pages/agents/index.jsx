import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  doLoadSeoData,
  doRunAnalysis,
  doGetReportById,
  doSaveSiteConfig,
  doSaveSchedule,
  doSendChatMessage,
  seoExecutionUpdated,
  addChatMessage,
  clearChatMessages,
  selectSeoStatus,
  selectSeoModelConfig,
  selectSeoSiteConfig,
  selectSeoSchedule,
  selectLatestReport,
  selectReportDetail,
  selectReportList,
  selectExecutions,
  selectCurrentExecution,
  selectAgentLoading,
  selectAgentError,
  selectChatMessages,
  selectReportCode,
  selectReportTable,
  selectReportChart,
  selectReportMap,
  doGetReportCode,
  doGetReportTable,
  doGetReportChart,
  doGetReportMap,
} from '../../state/slice/agentSlice';
import {
  doGetProjectFormData,
  selectProjectList,
} from '../../state/slice/projectSlice';
import {
  enableAgent,
  disableAgent,
  getSeoTasks,
  saveSeoTask,
  runSeoTask,
} from './agentApi';
import { fetchAuthSession } from 'aws-amplify/auth';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  Cog6ToothIcon,
  PlusIcon,
  EllipsisHorizontalIcon,
  ArrowPathIcon,
  ChatBubbleLeftEllipsisIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  CodeBracketIcon,
  TableCellsIcon,
  ChartBarIcon,
  FolderIcon,
  MapIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  PaperAirplaneIcon,
  BoltIcon,
  ChevronDownIcon,
  LinkIcon,
  ShieldExclamationIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { PlayIcon } from '@heroicons/react/24/solid';
import { useHistory } from 'react-router-dom';
import NewAgentModal from './NewAgentModal';
import ConfigureAgentModal from './ConfigureAgentModal';

const Toggle = ({ checked, onChange }) => (
  <div
    onClick={e => { e.stopPropagation(); onChange && onChange(!checked); }}
    className={`w-[40px] h-[22px] rounded-full relative shadow-inner transition-colors cursor-pointer shrink-0 ${checked ? 'bg-[#d92d78]' : 'bg-gray-200'}`}
  >
    <div className={`w-[18px] h-[18px] bg-white rounded-full absolute top-[2px] shadow-sm transition-all ${checked ? 'left-[20px]' : 'left-[2px]'}`} />
  </div>
);

const SCHEDULE_OPTIONS = ['Realtime', 'Hourly', 'Daily · 03:00 UTC', 'Weekly · Mon 06:00', 'Monthly · 1st', 'Off'];

// Static UI metadata — taskType maps to backend API
const SEO_TASKS_META = [
  {
    id: 'crawl', taskType: 'crawl',
    icon: ArrowPathIcon, iconBg: 'bg-pink-50 text-pink-500 border-pink-100',
    name: 'Site crawl', desc: 'Discover URLs, status codes, redirects, orphan pages.',
    defaultSchedule: 'Daily · 03:00 UTC',
    fields: [
      { key: 'startUrl', label: 'START URL', placeholder: 'https://affooh.com', defaultValue: 'https://affooh.com', half: true },
      { key: 'maxDepth', label: 'MAX DEPTH', placeholder: '5', defaultValue: '5', half: true },
    ],
  },
  {
    id: 'meta', taskType: 'on_page',
    icon: DocumentTextIcon, iconBg: 'bg-blue-50 text-blue-500 border-blue-100',
    name: 'Meta audit', desc: 'Title, description, canonical, OG and Twitter cards.',
    defaultSchedule: 'Daily · 03:00 UTC',
    fields: [
      { key: 'scope', label: 'SCOPE', placeholder: 'All indexable pages', defaultValue: 'All indexable pages', half: false },
    ],
  },
  {
    id: 'speed', taskType: 'performance',
    icon: BoltIcon, iconBg: 'bg-yellow-50 text-yellow-500 border-yellow-100',
    name: 'Site speed (Core Web Vitals)', desc: 'LCP, INP, CLS for mobile + desktop. Lighthouse run.',
    defaultSchedule: 'Weekly · Mon 06:00',
    fields: [
      { key: 'urls', label: 'URLS', placeholder: 'Top 50 by traffic', defaultValue: 'Top 50 by traffic', half: true },
      { key: 'device', label: 'DEVICE', placeholder: 'Mobile + Desktop', defaultValue: 'Mobile + Desktop', half: true },
    ],
  },
  {
    id: 'rank', taskType: 'keywords',
    icon: ChartBarIcon, iconBg: 'bg-purple-50 text-purple-500 border-purple-100',
    name: 'Keyword rank tracking', desc: 'Track positions for a keyword set across locations.',
    defaultSchedule: 'Daily · 03:00 UTC',
    fields: [
      { key: 'keywords', label: 'KEYWORDS', placeholder: '124 tracked', defaultValue: '124 tracked', half: true },
      { key: 'locations', label: 'LOCATIONS', placeholder: 'US, UK, AU', defaultValue: 'US, UK, AU', half: true },
    ],
  },
  {
    id: 'backlink', taskType: 'backlinks',
    icon: LinkIcon, iconBg: 'bg-orange-50 text-orange-500 border-orange-100',
    name: 'Backlink monitoring', desc: 'New/lost referring domains, anchor-text shifts.',
    defaultSchedule: 'Weekly · Mon 06:00',
    fields: [
      { key: 'domain', label: 'DOMAIN', placeholder: 'affooh.com', defaultValue: 'affooh.com', half: false },
    ],
  },
  {
    id: 'gap', taskType: 'content',
    icon: MapIcon, iconBg: 'bg-gray-50 text-gray-400 border-gray-200',
    name: 'Content gap analysis', desc: "Find keywords competitors rank for and you don't.",
    defaultSchedule: 'Monthly · 1st',
    fields: [
      { key: 'competitors', label: 'COMPETITORS', placeholder: 'monday.com, notion.so', defaultValue: 'monday.com, notion.so', half: false },
    ],
  },
  {
    id: 'broken', taskType: 'broken',
    icon: ShieldExclamationIcon, iconBg: 'bg-red-50 text-red-500 border-red-100',
    name: 'Broken-link scan', desc: '4xx/5xx internal links and external dead-ends.',
    defaultSchedule: 'Weekly · Mon 06:00',
    fields: [
      { key: 'scope', label: 'SCOPE', placeholder: 'Internal + External', defaultValue: 'Internal + External', half: false },
    ],
  },
  {
    id: 'schema', taskType: 'schema',
    icon: CodeBracketIcon, iconBg: 'bg-gray-50 text-gray-400 border-gray-200',
    name: 'Schema validation', desc: 'Lint JSON-LD blocks against schema.org spec.',
    defaultSchedule: 'Off',
    fields: [
      { key: 'pageTypes', label: 'PAGE TYPES', placeholder: 'Article, Product, FAQ', defaultValue: 'Article, Product, FAQ', half: false },
    ],
  },
];

const SCHEDULE_LABEL_TO_TYPE = {
  'Realtime': 'REALTIME',
  'Hourly': 'HOURLY',
  'Daily · 03:00 UTC': 'DAILY',
  'Weekly · Mon 06:00': 'WEEKLY',
  'Monthly · 1st': 'MONTHLY',
  'Off': 'OFF',
};
const SCHEDULE_TYPE_TO_LABEL = Object.fromEntries(
  Object.entries(SCHEDULE_LABEL_TO_TYPE).map(([k, v]) => [v, k])
);

// ─── Site Info + Schedule Section ─────────────────────────────────────────────

const CRAWL_SPEED_LABELS = ['Polite', 'Normal', 'Aggressive'];
const CRAWL_SPEED_VALUES = ['polite', 'normal', 'aggressive'];

const SITE_SCHEDULE_OPTIONS = [
  { label: 'Off', value: 'OFF' },
  { label: 'Daily', value: 'DAILY' },
  { label: 'Weekly', value: 'WEEKLY' },
  { label: 'On deploy', value: 'ON_DEPLOY' },
  { label: 'Manual only', value: 'MANUAL' },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SiteInfoSection = ({ siteConfig, schedule, onSaveSiteConfig, onSaveSchedule, webhookUrl, projectList = [] }) => {
  const [webhookCopied, setWebhookCopied] = useState(false);
  const [siteForm, setSiteForm] = useState({
    siteURL: '',
    projectID: '',
    maxPagesPerCrawl: 5000,
    crawlDepth: 5,
    crawlSpeed: 'normal',
    excludeURLPatterns: '',
    includeSubdomains: false,
    respectRobotsTxt: true,
  });
  const [schedForm, setSchedForm] = useState({
    scheduleType: 'OFF',
    scheduledTime: '03:00',
    scheduledDayOfWeek: 1,
    timezone: 'UTC',
  });
  const [siteSaved, setSiteSaved] = useState(false);
  const [schedSaved, setSchedSaved] = useState(false);
  const [siteSaving, setSiteSaving] = useState(false);
  const [schedSaving, setSchedSaving] = useState(false);

  useEffect(() => {
    if (siteConfig) {
      setSiteForm({
        siteURL: siteConfig.siteURL || siteConfig.siteUrl || '',
        projectID: siteConfig.projectID ?? '',
        maxPagesPerCrawl: siteConfig.maxPagesPerCrawl ?? 5000,
        crawlDepth: siteConfig.crawlDepth ?? 5,
        crawlSpeed: siteConfig.crawlSpeed || 'normal',
        excludeURLPatterns: Array.isArray(siteConfig.excludeURLPatterns)
          ? siteConfig.excludeURLPatterns.join('\n')
          : siteConfig.excludeURLPatterns || '',
        includeSubdomains: !!siteConfig.includeSubdomains,
        respectRobotsTxt: siteConfig.respectRobotsTxt !== false,
      });
    }
  }, [siteConfig]);

  useEffect(() => {
    if (schedule) {
      setSchedForm({
        scheduleType: schedule.scheduleType || 'OFF',
        scheduledTime: schedule.scheduledTime || '03:00',
        scheduledDayOfWeek: schedule.scheduledDayOfWeek ?? 1,
        timezone: schedule.timezone || 'UTC',
      });
    }
  }, [schedule]);

  const handleSaveSite = async () => {
    setSiteSaving(true);
    try {
      const payload = {
        ...siteForm,
        maxPagesPerCrawl: Number(siteForm.maxPagesPerCrawl),
        crawlDepth: Number(siteForm.crawlDepth),
        excludeURLPatterns: siteForm.excludeURLPatterns
          .split('\n').map(s => s.trim()).filter(Boolean),
      };
      await onSaveSiteConfig(payload);
      setSiteSaved(true);
      setTimeout(() => setSiteSaved(false), 2000);
    } finally {
      setSiteSaving(false);
    }
  };

  const handleSaveSchedule = async () => {
    setSchedSaving(true);
    try {
      await onSaveSchedule(schedForm);
      setSchedSaved(true);
      setTimeout(() => setSchedSaved(false), 2000);
    } finally {
      setSchedSaving(false);
    }
  };

  const speedIdx = CRAWL_SPEED_VALUES.indexOf(siteForm.crawlSpeed);

  return (
    <div className="border-t border-gray-100 bg-white">
      {/* ── Site Info ── */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[13px] font-bold text-gray-900">Site Info</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Crawl parameters passed to DataForSEO</div>
          </div>
          <button
            onClick={handleSaveSite}
            disabled={siteSaving}
            className={`px-3 py-1.5 text-[12px] font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${siteSaved ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-black disabled:opacity-50'}`}
          >
            {siteSaved ? <><CheckCircleIcon className="w-3.5 h-3.5" /> Saved</> : siteSaving ? 'Saving…' : 'Save'}
          </button>
        </div>

        <div className="space-y-4">
          {/* URL + Max pages */}
          <div className="flex gap-3">
            <div className="flex-1 min-w-0">
              <label className="block text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-1">Start URL</label>
              <input
                type="url"
                value={siteForm.siteURL}
                onChange={e => setSiteForm(f => ({ ...f, siteURL: e.target.value }))}
                placeholder="https://example.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#d92d78]/30 focus:border-[#d92d78]"
              />
            </div>
            <div className="w-36 shrink-0">
              <label className="block text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-1">Max pages per crawl</label>
              <input
                type="number"
                min={1}
                max={50000}
                value={siteForm.maxPagesPerCrawl}
                onChange={e => setSiteForm(f => ({ ...f, maxPagesPerCrawl: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#d92d78]/30 focus:border-[#d92d78]"
              />
            </div>
          </div>

          {/* Project link */}
          {projectList.length > 0 && (
            <div>
              <label className="block text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-1">Linked project</label>
              <select
                value={siteForm.projectID ?? ''}
                onChange={e => setSiteForm(f => ({ ...f, projectID: e.target.value ? Number(e.target.value) : null }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#d92d78]/30 focus:border-[#d92d78]"
              >
                <option value="">None</option>
                {projectList.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Crawl depth */}
          <div className="w-28">
            <label className="block text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-1">Crawl depth <span className="normal-case font-normal">— link levels</span></label>
            <input
              type="number"
              min={1}
              max={20}
              value={siteForm.crawlDepth}
              onChange={e => setSiteForm(f => ({ ...f, crawlDepth: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#d92d78]/30 focus:border-[#d92d78]"
            />
          </div>

          {/* Crawl speed */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-2">
              Crawl speed — <span className="normal-case font-normal text-gray-600">{CRAWL_SPEED_LABELS[speedIdx === -1 ? 1 : speedIdx]} · {speedIdx === 0 ? '1' : speedIdx === 1 ? '5' : '10'} req/sec</span>
            </label>
            <div className="relative px-1">
              <input
                type="range" min={0} max={2} step={1}
                value={speedIdx === -1 ? 1 : speedIdx}
                onChange={e => setSiteForm(f => ({ ...f, crawlSpeed: CRAWL_SPEED_VALUES[e.target.value] }))}
                className="w-full accent-[#d92d78]"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                {CRAWL_SPEED_LABELS.map(l => <span key={l}>{l}</span>)}
              </div>
            </div>
          </div>

          {/* Exclude URLs */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-1">
              Exclude URLs <span className="normal-case font-normal">— one pattern per line, supports *</span>
            </label>
            <textarea
              rows={4}
              value={siteForm.excludeURLPatterns}
              onChange={e => setSiteForm(f => ({ ...f, excludeURLPatterns: e.target.value }))}
              placeholder="/admin/*&#10;/preview/*&#10;*/cart"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#d92d78]/30 focus:border-[#d92d78] resize-none"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <div>
                <div className="text-[13px] font-medium text-gray-800">Include subdomains?</div>
                <div className="text-[11px] text-gray-400">Follow links to *.{siteForm.siteURL ? (siteForm.siteURL.replace(/^https?:\/\//, '').split('/')[0]) : 'example.com'}</div>
              </div>
              <Toggle checked={siteForm.includeSubdomains} onChange={v => setSiteForm(f => ({ ...f, includeSubdomains: v }))} />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-[13px] font-medium text-gray-800">Respect robots.txt?</div>
                <div className="text-[11px] text-gray-400">Honour Disallow rules and crawl-delay directives</div>
              </div>
              <Toggle checked={siteForm.respectRobotsTxt} onChange={v => setSiteForm(f => ({ ...f, respectRobotsTxt: v }))} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Schedule ── */}
      <div className="px-5 pt-4 pb-6 border-t border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[13px] font-bold text-gray-900">Schedule</div>
            <div className="text-[11px] text-gray-400 mt-0.5">When to run the full site analysis automatically</div>
          </div>
          <button
            onClick={handleSaveSchedule}
            disabled={schedSaving}
            className={`px-3 py-1.5 text-[12px] font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${schedSaved ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-black disabled:opacity-50'}`}
          >
            {schedSaved ? <><CheckCircleIcon className="w-3.5 h-3.5" /> Saved</> : schedSaving ? 'Saving…' : 'Save'}
          </button>
        </div>

        <div className="space-y-4">
          {/* Schedule type pills */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-2">Frequency</label>
            <div className="flex flex-wrap gap-2">
              {SITE_SCHEDULE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSchedForm(f => ({ ...f, scheduleType: opt.value }))}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-colors ${schedForm.scheduleType === opt.value ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time + day (shown only when applicable) */}
          {schedForm.scheduleType !== 'OFF' && schedForm.scheduleType !== 'ON_DEPLOY' && schedForm.scheduleType !== 'MANUAL' && (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-1">Time (UTC)</label>
                <input
                  type="time"
                  value={schedForm.scheduledTime}
                  onChange={e => setSchedForm(f => ({ ...f, scheduledTime: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#d92d78]/30 focus:border-[#d92d78]"
                />
              </div>
              {schedForm.scheduleType === 'WEEKLY' && (
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-1">Day</label>
                  <div className="flex gap-1">
                    {DAYS.map((d, i) => (
                      <button
                        key={d}
                        onClick={() => setSchedForm(f => ({ ...f, scheduledDayOfWeek: i }))}
                        className={`flex-1 py-2 rounded text-[11px] font-medium border transition-colors ${schedForm.scheduledDayOfWeek === i ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {schedForm.scheduleType === 'ON_DEPLOY' && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
              <div className="text-[12px] text-gray-600">Trigger an SEO analysis by POSTing to this webhook after your deploy pipeline completes.</div>
              {webhookUrl && (
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                  <span className="flex-1 font-mono text-[11px] text-gray-700 truncate">{webhookUrl}</span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(webhookUrl); setWebhookCopied(true); setTimeout(() => setWebhookCopied(false), 2000); }}
                    className="shrink-0 flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                    {webhookCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AutomatedTasksTab = ({ onOpenConfigure }) => {
  const [taskState, setTaskState] = useState({});
  const [fieldValues, setFieldValues] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [runningIds, setRunningIds] = useState({});
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    getSeoTasks().then(({ tasks }) => {
      const state = {};
      const fields = {};
      SEO_TASKS_META.forEach(meta => {
        const remote = tasks[meta.taskType] || {};
        state[meta.id] = {
          enabled: remote.isEnabled ?? (meta.defaultSchedule !== 'Off'),
          schedule: SCHEDULE_TYPE_TO_LABEL[remote.scheduleType] || meta.defaultSchedule,
          totalRuns: remote.totalRuns ?? 0,
          lastRunAt: remote.lastRunAt || null,
        };
        const cfg = remote.config || {};
        const fv = {};
        meta.fields.forEach(f => { fv[f.key] = cfg[f.key] || f.defaultValue; });
        fields[meta.id] = fv;
      });
      setTaskState(state);
      setFieldValues(fields);
    }).catch(() => {
      const state = {};
      const fields = {};
      SEO_TASKS_META.forEach(meta => {
        state[meta.id] = {
          enabled: meta.defaultSchedule !== 'Off',
          schedule: meta.defaultSchedule,
          totalRuns: 0,
          lastRunAt: null,
        };
        const fv = {};
        meta.fields.forEach(f => { fv[f.key] = f.defaultValue; });
        fields[meta.id] = fv;
      });
      setTaskState(state);
      setFieldValues(fields);
    }).finally(() => setLoadingTasks(false));
  }, []);

  const persist = async (meta, patch) => {
    const current = taskState[meta.id] || {};
    const merged = { ...current, ...patch };
    const config = fieldValues[meta.id] || {};
    const schedType = SCHEDULE_LABEL_TO_TYPE[merged.schedule] || 'OFF';
    await saveSeoTask(meta.taskType, {
      isEnabled: merged.enabled,
      scheduleType: schedType,
      config,
    }).catch(() => {});
  };

  const toggleTask = (meta) => {
    setTaskState(prev => {
      const updated = { ...prev[meta.id], enabled: !prev[meta.id].enabled };
      persist(meta, { enabled: updated.enabled });
      return { ...prev, [meta.id]: updated };
    });
  };

  const setSchedule = (meta, sched) => {
    setTaskState(prev => {
      const updated = { ...prev[meta.id], schedule: sched };
      persist(meta, { schedule: sched });
      return { ...prev, [meta.id]: updated };
    });
  };

  const setField = (taskId, key, value) => {
    setFieldValues(prev => ({ ...prev, [taskId]: { ...prev[taskId], [key]: value } }));
  };

  const handleRun = async (meta) => {
    setRunningIds(prev => ({ ...prev, [meta.id]: true }));
    try {
      // Save current config first, then trigger
      const config = fieldValues[meta.id] || {};
      const schedType = SCHEDULE_LABEL_TO_TYPE[taskState[meta.id]?.schedule] || 'OFF';
      await saveSeoTask(meta.taskType, {
        isEnabled: taskState[meta.id]?.enabled ?? true,
        scheduleType: schedType,
        config,
      });
      await runSeoTask(meta.taskType);
      setTaskState(prev => ({
        ...prev,
        [meta.id]: { ...prev[meta.id], totalRuns: (prev[meta.id]?.totalRuns || 0) + 1, lastRunAt: new Date().toISOString() },
      }));
    } catch (e) {
      // swallow — user sees no change
    } finally {
      setRunningIds(prev => ({ ...prev, [meta.id]: false }));
    }
  };

  const enabledCount = SEO_TASKS_META.filter(m => taskState[m.id]?.enabled).length;

  if (loadingTasks) {
    return <div className="flex-1 flex items-center justify-center text-[13px] text-gray-400">Loading tasks…</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-white">
      {/* Header */}
      <div className="bg-[#fff0f6] rounded-xl p-4 border border-pink-100 flex items-center justify-between shadow-sm mb-4">
        <div>
          <div className="text-[14px] font-bold text-gray-900 mb-0.5">Automated tasks</div>
          <p className="text-[13px] text-gray-500">
            Recurring jobs SEO Specialist runs on its own.{' '}
            <span className="font-medium text-gray-700">{enabledCount} of {SEO_TASKS_META.length} enabled</span>
            {' · '}model &amp; persona live in{' '}
            <span className="text-pink-600 underline cursor-pointer hover:text-pink-700" onClick={onOpenConfigure}>advanced settings</span>.
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 shadow-sm rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50">
          <PlusIcon className="w-4 h-4" /> Add task
        </button>
      </div>

      {/* Task rows */}
      <div className="space-y-2">
        {SEO_TASKS_META.map(meta => {
          const Icon = meta.icon;
          const isOpen = expandedId === meta.id;
          const state = taskState[meta.id] || {};
          const fv = fieldValues[meta.id] || {};
          const isRunning = runningIds[meta.id];
          const lastRun = state.lastRunAt
            ? new Date(state.lastRunAt).toLocaleString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            : 'never';

          return (
            <div
              key={meta.id}
              className={`bg-white border rounded-xl shadow-sm overflow-hidden transition-all ${state.enabled ? 'border-gray-200' : 'border-gray-100'} ${!state.enabled ? 'opacity-70' : ''}`}
            >
              {/* Row header */}
              <div
                className="flex items-center gap-4 px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(isOpen ? null : meta.id)}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border shrink-0 ${meta.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-[13px] font-bold ${state.enabled ? 'text-gray-900' : 'text-gray-500'}`}>{meta.name}</div>
                  <div className="text-[11px] text-gray-400 truncate">{meta.desc}</div>
                </div>
                <div className="text-right shrink-0 mr-2">
                  <div className="text-[12px] font-medium text-gray-600 flex items-center gap-1 justify-end">
                    <ArrowPathIcon className="w-3 h-3" /> {state.schedule || meta.defaultSchedule}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">Last run · {lastRun}</div>
                </div>
                <Toggle checked={!!state.enabled} onChange={() => toggleTask(meta)} />
                <ChevronDownIcon className={`w-4 h-4 text-gray-300 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </div>

              {/* Expanded panel */}
              {isOpen && (
                <div className="border-t border-gray-100 bg-[#fafafa] px-5 py-4 space-y-4">
                  {/* Config fields */}
                  <div className={`flex gap-4 ${meta.fields.length === 1 ? '' : 'flex-wrap'}`}>
                    {meta.fields.map(f => (
                      <div key={f.key} className={f.half ? 'flex-1 min-w-0' : 'w-full'}>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">{f.label}</label>
                        <input
                          type="text"
                          value={fv[f.key] ?? f.defaultValue}
                          placeholder={f.placeholder}
                          onChange={e => setField(meta.id, f.key, e.target.value)}
                          onBlur={() => persist(meta, {})}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-800 focus:outline-none focus:border-[#d92d78] focus:ring-1 focus:ring-[#d92d78]"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Schedule pills */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Schedule</label>
                    <div className="flex flex-wrap gap-1.5 bg-white border border-gray-200 rounded-lg p-1.5">
                      {SCHEDULE_OPTIONS.map(opt => (
                        <button
                          key={opt}
                          onClick={() => setSchedule(meta, opt)}
                          className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${(state.schedule || meta.defaultSchedule) === opt ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-[11px] text-gray-400 flex items-center gap-1 font-medium">
                      <BoltIcon className="w-3 h-3" /> {state.totalRuns ?? 0} total runs · Output → output panel
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1 px-3 py-1.5 text-[12px] font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                        <EllipsisHorizontalIcon className="w-3.5 h-3.5" /> Logs
                      </button>
                      <button
                        disabled={isRunning}
                        onClick={e => { e.stopPropagation(); handleRun(meta); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold text-white bg-gray-900 rounded-lg hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <PlayIcon className="w-3 h-3" /> {isRunning ? 'Running…' : 'Run now'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AgentsLayout = () => {
  const dispatch = useDispatch();

  // UI state — stays local
  const history = useHistory();
  const [selectedAgent, setSelectedAgent] = useState('seo');
  const [activeTab, setActiveTab] = useState('chat');
  const [isNewAgentModalOpen, setIsNewAgentModalOpen] = useState(false);
  const [isConfigureModalOpen, setIsConfigureModalOpen] = useState(false);
  const [selectedOutputTab, setSelectedOutputTab] = useState('report');
  const [runMessage, setRunMessage] = useState(null);

  // Data state — from Redux
  const seoStatus = useSelector(selectSeoStatus);
  const seoModelConfig = useSelector(selectSeoModelConfig);
  const seoSchedule = useSelector(selectSeoSchedule);
  const seoSiteConfig = useSelector(selectSeoSiteConfig);
  const seoReport = useSelector(selectLatestReport);
  const seoReportDetail = useSelector(selectReportDetail);
  const reportList = useSelector(selectReportList);
  const reportCode = useSelector(selectReportCode);
  const reportTable = useSelector(selectReportTable);
  const reportChart = useSelector(selectReportChart);
  const reportMap = useSelector(selectReportMap);
  const seoExecutions = useSelector(selectExecutions);
  const currentExecution = useSelector(selectCurrentExecution);
  const agentLoading = useSelector(selectAgentLoading);
  const seoLoading = agentLoading.initial ?? false;
  const runningAnalysis = agentLoading.running ?? false;

  const [issueFilter, setIssueFilter] = useState('ALL');
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [agentToggling, setAgentToggling] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const chatMessagesEndRef = useRef(null);

  const chatMessages = useSelector(selectChatMessages);
  const chatTyping = agentLoading.chatTyping ?? false;
  const projectList = useSelector(selectProjectList) || [];

  // Backend returns full webhookURL in schedule when type is ON_DEPLOY
  const webhookUrl = seoSchedule?.webhookURL || null;

  const handleToggleAgent = async () => {
    if (agentToggling) return;
    setAgentToggling(true);
    try {
      if (seoEnabled) {
        await disableAgent('seo');
      } else {
        await enableAgent('seo');
      }
      dispatch(doLoadSeoData());
    } catch (_) {
    } finally {
      setAgentToggling(false);
    }
  };

  const handleSelectReport = (reportId) => {
    setSelectedReportId(reportId || null);
    if (reportId) {
      dispatch(doGetReportById(reportId));
      dispatch(doGetReportCode(reportId));
      dispatch(doGetReportTable(reportId));
      dispatch(doGetReportChart(reportId));
      dispatch(doGetReportMap(reportId));
    }
  };

  // reportDetail always has { ...report, issues[] } — use it preferentially so issues render.
  // When a past report is selected verify id matches; otherwise fall back to latest.
  const displayedReport = selectedReportId
    ? (seoReportDetail?.id === Number(selectedReportId) ? seoReportDetail : seoReport)
    : (seoReportDetail || seoReport);

  useEffect(() => {
    dispatch(doLoadSeoData());
    dispatch(doGetProjectFormData());
  }, [dispatch]);

  // WebSocket — real-time execution updates
  useEffect(() => {
    const WS_URL = import.meta.env.VITE_REACT_APP_WS_HOST;
    if (!WS_URL) return;

    let ws = null;
    let reconnectTimer = null;

    const connect = async () => {
      try {
        const session = await fetchAuthSession();
        const token = session.tokens?.accessToken?.toString();
        if (!token) return;

        ws = new WebSocket(WS_URL);

        ws.onopen = () => {
          ws.send(JSON.stringify({ type: 'auth', token }));
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'SEO_EXECUTION_UPDATE' || msg.executionId) {
              dispatch(seoExecutionUpdated(msg));
              if (msg.status === 'COMPLETED' || msg.status === 'FAILED' || msg.status === 'PARTIAL') {
                setTimeout(() => dispatch(doLoadSeoData()), 1500);
              }
            }
          } catch (_) {}
        };

        ws.onclose = () => {
          reconnectTimer = setTimeout(connect, 5000);
        };
      } catch (_) {}
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (ws) { ws.onclose = null; ws.close(); }
    };
  }, [dispatch]);

  const loadSeoData = useCallback(() => {
    dispatch(doLoadSeoData());
  }, [dispatch]);

  // Clear chat when switching agent
  useEffect(() => {
    dispatch(clearChatMessages());
    setChatInput('');
  }, [selectedAgent, dispatch]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatTyping]);

  const handleSendChat = async () => {
    const text = chatInput.trim();
    if (!text || chatTyping) return;
    setChatInput('');
    dispatch(addChatMessage({ role: 'user', content: text }));
    const allMessages = [...chatMessages, { role: 'user', content: text }];
    dispatch(doSendChatMessage({
      agentType: currentAgent?.agentType || currentAgent?.id?.toUpperCase() || 'SEO',
      messages: allMessages,
    }));
  };

  const handleRunAnalysis = async () => {
    setRunMessage(null);
    const result = await dispatch(doRunAnalysis({ siteUrl: seoSiteConfig?.siteURL }));
    if (doRunAnalysis.fulfilled.match(result)) {
      setRunMessage({ type: 'success', text: `Analysis started — execution ID: ${result.payload?.executionId || 'queued'}` });
      setTimeout(() => dispatch(doLoadSeoData()), 3000);
    } else {
      setRunMessage({ type: 'error', text: result.payload || 'Failed to start analysis' });
    }
  };

  const seoEnabled = seoStatus?.agents?.SEO?.isEnabled ?? false;
  const seoModelName = seoModelConfig?.config?.modelID || 'Not configured';

  const agents = [
    { id: 'ba', name: 'Business Analyst', model: 'GPT-4o', init: 'BA', color: 'bg-blue-600 text-white', sources: 3, tools: 2 },
    { id: 'pm', name: 'Product Manager', model: 'Claude Sonnet 3.5', init: 'PM', color: 'bg-purple-500 text-white', sources: 5, tools: 4 },
    { id: 'seo', name: 'SEO Specialist', model: seoModelName, init: 'SEO', color: 'bg-gradient-to-br from-orange-400 to-pink-500 text-white', active: true, running: seoEnabled, sources: 8, tools: 6, agentType: 'SEO' },
    { id: 'des', name: 'Designer', model: 'Claude Sonnet 3.5', init: 'DE', color: 'bg-pink-400 text-white', sources: 2, tools: 3 },
    { id: 'da', name: 'Data Analyst', model: 'GPT-4o', init: 'DA', color: 'bg-teal-500 text-white', sources: 4, tools: 5 },
    { id: 'qa', name: 'QA Tester', model: 'Claude Haiku 3.5', init: 'QA', color: 'bg-red-500 text-white', sources: 3, tools: 2 },
    { id: 'mk', name: 'Marketing', model: 'GPT-4o-mini', init: 'MK', color: 'bg-yellow-500 text-white', sources: 6, tools: 4 },
    { id: 'cw', name: 'Content Writer', model: 'Claude Sonnet 3.5', init: 'CW', color: 'bg-green-500 text-white', sources: 4, tools: 3 },
    { id: 'ra', name: 'Research Analyst', model: 'GPT-4o', init: 'RA', color: 'bg-cyan-500 text-white', sources: 5, tools: 4 },
  ];

  const currentAgent = agents.find(a => a.id === selectedAgent) || agents[2];

  const outputTabs = [
    { id: 'report', label: 'Report', icon: DocumentTextIcon },
    { id: 'tasks', label: 'Tasks', icon: ClipboardDocumentCheckIcon },
    { id: 'code', label: 'Code', icon: CodeBracketIcon },
    { id: 'table', label: 'Table', icon: TableCellsIcon },
    { id: 'chart', label: 'Chart', icon: ChartBarIcon },
    { id: 'files', label: 'Files', icon: FolderIcon },
    { id: 'map', label: 'Map', icon: MapIcon },
  ];


  return (
    <div className="bg-white flex text-sm text-gray-800 font-sans h-full w-full overflow-hidden">
      {/* LEFT SIDEBAR */}
      <div className="w-[280px] bg-[#fafafa] border-r border-gray-200 flex flex-col h-full shrink-0">
        <div className="p-4 flex flex-col gap-4 border-b border-transparent mt-2">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => history.push('/')}>
            <span className="text-[#d92d78] font-bold text-2xl tracking-tighter" style={{ fontFamily: 'cursive' }}>Affooh</span>
            <span className="text-xs text-gray-500 font-medium mt-1">Acme Workspace</span>
          </div>

          <div className="relative">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input type="text" placeholder="Search agents" className="w-full pl-9 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-pink-500 shadow-sm" />
            <AdjustmentsHorizontalIcon className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
          </div>
        </div>

        <div className="px-4 pt-2 pb-2 flex justify-between items-center text-[10px] font-bold text-gray-400 tracking-wider">
          <span>AGENTS</span>
          <span className="text-gray-500">9</span>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
          {/* Agent Items */}
          {agents.map(agent => (
            <div 
              key={agent.id} 
              onClick={() => setSelectedAgent(agent.id)}
              className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all ${selectedAgent === agent.id ? 'bg-white shadow-sm border border-gray-200' : 'hover:bg-gray-100 border border-transparent'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${agent.color}`}>
                {agent.init}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 text-[13px]">{agent.name}</div>
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  {agent.model}
                  {agent.running && <span className="bg-green-50 border border-green-200 text-green-700 px-1.5 py-0 rounded-md text-[10px] font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> running</span>}
                </div>
              </div>
              {selectedAgent === agent.id && <Cog6ToothIcon className="w-4 h-4 text-gray-400" />}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setIsNewAgentModalOpen(true)}
            className="w-full py-2 border border-gray-300 bg-white rounded-lg text-gray-700 font-medium hover:bg-gray-50 flex items-center justify-center gap-2 text-[13px] shadow-sm"
          >
            <PlusIcon className="w-4 h-4" /> New agent
          </button>
        </div>

        <div className="p-4 border-t border-gray-200 flex items-center justify-between hover:bg-gray-100 cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#c17a65] rounded-full flex items-center justify-center text-white font-bold text-xs">SP</div>
            <div>
              <div className="font-semibold text-[13px] text-gray-800">Sarah Park</div>
              <div className="text-[11px] text-gray-500">Free • 142 / 500 runs</div>
            </div>
          </div>
          <EllipsisHorizontalIcon className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* MIDDLE SECTION */}
      <div className="flex-1 flex flex-col bg-white border-r border-gray-200 min-w-0">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${currentAgent.color} border border-gray-200 shadow-sm`}>{currentAgent.init}</div>
              <div>
                <div className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  {currentAgent.name}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                  {currentAgent.id === 'seo'
                    ? seoEnabled
                      ? <span className="bg-green-50 border border-green-200 text-green-700 px-1.5 py-0 rounded-md font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> running</span>
                      : <span className="bg-gray-100 border border-gray-200 text-gray-500 px-1.5 py-0 rounded-md font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> disabled</span>
                    : null}
                  <span>{currentAgent.model}</span>
                  <span>·</span>
                  <span>{currentAgent.sources} sources</span>
                  <span>·</span>
                  <span>{currentAgent.tools} tools</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <button className="flex items-center gap-1.5 hover:text-gray-900 bg-white border border-gray-200 shadow-sm px-3 py-1.5 rounded-lg text-[13px]"><ArrowPathIcon className="w-4 h-4" /> New thread</button>
              {currentAgent.id === 'seo' && (
                <button
                  onClick={handleRunAnalysis}
                  disabled={runningAnalysis}
                  className="flex items-center gap-1.5 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-[13px] font-semibold hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <PlayIcon className="w-3.5 h-3.5" />
                  {runningAnalysis ? 'Running…' : 'Run analysis'}
                </button>
              )}
              <button onClick={() => setIsConfigureModalOpen(true)} className="flex items-center gap-1.5 hover:text-gray-900 bg-white border border-gray-200 shadow-sm px-3 py-1.5 rounded-lg text-[13px]"><AdjustmentsHorizontalIcon className="w-4 h-4" /> Configure</button>
            </div>
          </div>

          {runMessage && (
            <div className={`flex items-center gap-2 text-[12px] px-1 font-medium ${runMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
              {runMessage.type === 'success' ? <CheckCircleIcon className="w-4 h-4 shrink-0" /> : <ExclamationCircleIcon className="w-4 h-4 shrink-0" />}
              {runMessage.text}
            </div>
          )}
          <div className="flex items-center justify-between mt-2 border-b border-gray-100">
            <div className="flex items-center gap-6">
              <div
                className={`flex items-center gap-2 pb-2 border-b-2 font-medium text-[13px] cursor-pointer transition-colors ${activeTab === 'chat' ? 'border-[#d92d78] text-[#d92d78]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('chat')}
              >
                <ChatBubbleLeftEllipsisIcon className="w-4 h-4" /> Chat
              </div>
              <div
                className={`flex items-center gap-2 pb-2 border-b-2 font-medium text-[13px] cursor-pointer transition-colors ${activeTab === 'configure' ? 'border-[#d92d78] text-[#d92d78]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('configure')}
              >
                <AdjustmentsHorizontalIcon className="w-4 h-4" /> Configure
              </div>
            </div>
            <div className="text-[12px] text-gray-400 pb-2">
              New thread
            </div>
          </div>
        </div>

        {activeTab === 'chat' ? (
          <>
            <div className="flex-1 overflow-y-auto p-6 bg-white flex flex-col">
              {chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-[13px] font-bold ${currentAgent.color} mb-4 shadow-sm`}>
                    {currentAgent.init}
                  </div>
                  <div className="text-[15px] font-semibold text-gray-800 mb-1">{currentAgent.name}</div>
                  <div className="text-[13px] text-gray-400 mb-6 text-center max-w-xs">
                    Start a conversation. Ask this agent to run an analysis, draft content, or review your site.
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center max-w-sm">
                    {currentAgent.id === 'seo' ? (
                      <>
                        <button onClick={() => { setChatInput('Run a site audit'); }} className="bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-[12px] font-medium hover:bg-gray-100">Run a site audit</button>
                        <button onClick={() => { setChatInput('Find content gaps'); }} className="bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-[12px] font-medium hover:bg-gray-100">Find content gaps</button>
                        <button onClick={() => { setChatInput('Check Core Web Vitals'); }} className="bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-[12px] font-medium hover:bg-gray-100">Check Core Web Vitals</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setChatInput('Get started'); }} className="bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-[12px] font-medium hover:bg-gray-100">Get started</button>
                        <button onClick={() => { setChatInput('What can you do?'); }} className="bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-[12px] font-medium hover:bg-gray-100">What can you do?</button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-[#d92d78] text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {chatTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-500 px-4 py-2.5 rounded-2xl rounded-bl-sm text-[13px] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  )}
                  <div ref={chatMessagesEndRef} />
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-white border-t border-gray-100">
              <div className="flex items-center gap-4 mb-3 px-1 text-[11px] font-semibold text-gray-500 tracking-wide">
                <span className="flex items-center gap-1.5"><Cog6ToothIcon className="w-3.5 h-3.5" /> Tools · {currentAgent.tools}</span>
                <span className="flex items-center gap-1.5"><FolderIcon className="w-3.5 h-3.5" /> RAG · {currentAgent.sources}</span>
                <span className="flex items-center gap-1.5"><ChartBarIcon className="w-3.5 h-3.5" /> Memory</span>
              </div>
              <div className="border border-gray-200 rounded-xl bg-white flex items-center p-1.5 shadow-sm focus-within:ring-1 focus-within:ring-[#d92d78] focus-within:border-[#d92d78]">
                <input
                  type="text"
                  placeholder={`Message ${currentAgent.name}...`}
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChat(); } }}
                  disabled={chatTyping}
                  className="flex-1 bg-transparent border-none focus:outline-none px-3 text-[14px] disabled:opacity-60"
                />
                <div className="flex items-center gap-3 text-[12px] text-gray-400 mr-2 font-medium">
                  Slash commands
                </div>
                <button
                  onClick={handleSendChat}
                  disabled={!chatInput.trim() || chatTyping}
                  className="bg-[#d92d78] hover:bg-[#c2185b] text-white p-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <AutomatedTasksTab
              seoEnabled={seoEnabled}
              onOpenConfigure={() => setIsConfigureModalOpen(true)}
            />
            {currentAgent.id === 'seo' && (
              <SiteInfoSection
                siteConfig={seoSiteConfig}
                schedule={seoSchedule}
                onSaveSiteConfig={(cfg) => dispatch(doSaveSiteConfig(cfg))}
                onSaveSchedule={(sch) => dispatch(doSaveSchedule(sch))}
                webhookUrl={webhookUrl}
                projectList={projectList}
              />
            )}
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR (OUTPUT PANEL) */}
      <div className="w-[500px] bg-white flex flex-col h-full shrink-0">
        <div className="px-6 pt-5 pb-3 flex items-center justify-between bg-white border-b border-transparent">
          <div>
            <div className="text-lg font-bold text-gray-800">Output</div>
            <div className="text-[11px] text-gray-500 mt-0.5">Artifacts from {currentAgent.name} • auto-saved</div>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <button className="p-1.5 hover:bg-gray-100 rounded-md border border-gray-200 shadow-sm"><DocumentDuplicateIcon className="w-4 h-4" /></button>
            <button className="p-1.5 hover:bg-gray-100 rounded-md border border-gray-200 shadow-sm"><ArrowDownTrayIcon className="w-4 h-4" /></button>
            <button className="p-1.5 hover:bg-gray-100 rounded-md border border-gray-200 shadow-sm"><EllipsisHorizontalIcon className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="bg-white px-5 pt-1 border-b border-gray-200">
          <div className="flex gap-3 text-[12px] font-semibold text-gray-500 overflow-x-auto scrollbar-hide pb-[-1px]">
            {outputTabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button 
                  key={tab.id}
                  onClick={() => setSelectedOutputTab(tab.id)}
                  className={`flex items-center gap-1.5 pb-2.5 border-b-2 transition-all whitespace-nowrap shrink-0 ${selectedOutputTab === tab.id ? 'border-gray-800 text-gray-800' : 'border-transparent hover:text-gray-700'}`}
                >
                  <Icon className="w-4 h-4" /> {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Execution progress bar — shown while analysis is running */}
        {currentExecution && (currentExecution.status === 'RUNNING' || currentExecution.status === 'QUEUED') && (
          <div className="px-5 py-3 border-b border-gray-100 bg-white">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] font-medium text-gray-700 flex items-center gap-1.5">
                <ArrowPathIcon className="w-3.5 h-3.5 animate-spin text-[#d92d78]" />
                {currentExecution.currentStep || 'Analysis in progress…'}
              </span>
              <span className="text-[11px] font-bold text-gray-500">{currentExecution.progress ?? 0}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#d92d78] to-pink-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${currentExecution.progress ?? 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Execution error banner */}
        {currentExecution && (currentExecution.status === 'FAILED' || currentExecution.status === 'PARTIAL') && (
          <div className={`px-5 py-2.5 border-b flex items-center gap-2 text-[12px] font-medium ${currentExecution.status === 'FAILED' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-orange-50 border-orange-100 text-orange-700'}`}>
            <ExclamationCircleIcon className="w-4 h-4 shrink-0" />
            {currentExecution.status === 'FAILED'
              ? `Analysis failed${currentExecution.errorMessage ? ` — ${currentExecution.errorMessage}` : '. Check site config and try again.'}`
              : 'Analysis completed with partial data — some crawl steps encountered errors.'}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 bg-[#fcfcfc] scrollbar-hide">
          {selectedOutputTab === 'report' && (
            seoLoading ? (
              <div className="flex items-center justify-center h-48 text-gray-400 text-[13px]">
                <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" /> Loading report…
              </div>
            ) : displayedReport ? (
              <div className="space-y-4">
                {/* Report history dropdown */}
                {reportList.length > 1 && (
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider shrink-0">Report</label>
                    <select
                      value={selectedReportId || ''}
                      onChange={e => handleSelectReport(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-[12px] text-gray-800 focus:outline-none focus:border-[#d92d78] focus:ring-1 focus:ring-[#d92d78]"
                    >
                      <option value="">Latest report</option>
                      {reportList.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.generatedAt ? new Date(r.generatedAt).toLocaleString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : `Report #${r.id}`}
                          {r.healthScore != null ? ` · Score ${r.healthScore}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Header row */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
                  <div className="flex items-center gap-3 mb-3">
                    {displayedReport.healthScore != null && (
                      <span className={`px-3 py-1 rounded-full font-bold text-white text-[13px] ${displayedReport.healthScore >= 70 ? 'bg-green-500' : displayedReport.healthScore >= 40 ? 'bg-orange-400' : 'bg-red-500'}`}>
                        Score {displayedReport.healthScore}
                      </span>
                    )}
                    <div className="text-[15px] font-bold text-gray-900">SEO Health Report</div>
                  </div>
                  <div className="text-[12px] text-gray-400 font-medium">
                    {displayedReport.generatedAt ? `Generated ${new Date(displayedReport.generatedAt).toLocaleString()}` : ''}
                    {displayedReport.triggerType ? ` · ${displayedReport.triggerType.toLowerCase()}` : ''}
                  </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
                    <div className="text-2xl font-bold text-gray-900">{displayedReport.totalPagesCrawled ?? '—'}</div>
                    <div className="text-[11px] text-gray-500 mt-1 font-medium">Pages crawled</div>
                  </div>
                  <div className="bg-white border border-rose-100 rounded-xl p-4 shadow-sm text-center">
                    <div className="text-2xl font-bold text-rose-600">{displayedReport.newIssuesCount ?? '—'}</div>
                    <div className="text-[11px] text-gray-500 mt-1 font-medium">New issues</div>
                  </div>
                  <div className="bg-white border border-green-100 rounded-xl p-4 shadow-sm text-center">
                    <div className="text-2xl font-bold text-green-600">{displayedReport.totalIssuesResolved ?? '—'}</div>
                    <div className="text-[11px] text-gray-500 mt-1 font-medium">Fixed</div>
                  </div>
                </div>

                {/* Issue breakdown */}
                {displayedReport.issueBreakdown && (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                    <div className="text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-3">Issue breakdown</div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                        <span className="text-[13px] font-bold text-gray-900">{displayedReport.issueBreakdown.CRITICAL}</span>
                        <span className="text-[12px] text-gray-500">Critical</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0"></span>
                        <span className="text-[13px] font-bold text-gray-900">{displayedReport.issueBreakdown.WARNING}</span>
                        <span className="text-[12px] text-gray-500">Warning</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0"></span>
                        <span className="text-[13px] font-bold text-gray-900">{displayedReport.issueBreakdown.INFO}</span>
                        <span className="text-[12px] text-gray-500">Info</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI summary — reportSummaryJSON is a JSON string; parse it */}
                {(() => {
                  let parsedSummary = null;
                  try { parsedSummary = JSON.parse(displayedReport.reportSummaryJSON); } catch {}
                  return parsedSummary?.summary ? (
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                      <div className="text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-2">AI Summary</div>
                      <p className="text-[13px] text-gray-800 leading-relaxed">{parsedSummary.summary}</p>
                    </div>
                  ) : null;
                })()}

                {/* Issues from this report (loaded via getReport) */}
                {displayedReport.issues?.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-[11px] font-bold text-gray-500 tracking-wider uppercase">
                        Issues · {displayedReport.issues.length}
                      </div>
                      <div className="flex gap-1">
                        {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map(f => (
                          <button
                            key={f}
                            onClick={() => setIssueFilter(f)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase transition-colors ${issueFilter === f
                              ? f === 'CRITICAL' ? 'bg-rose-600 text-white'
                              : f === 'WARNING' ? 'bg-orange-500 text-white'
                              : f === 'INFO' ? 'bg-blue-500 text-white'
                              : 'bg-gray-900 text-white'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                          >{f}</button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {displayedReport.issues
                        .filter(issue => issueFilter === 'ALL' || issue.severity === issueFilter)
                        .map((issue, i) => {
                          let detail = null;
                          try { detail = JSON.parse(issue.issueDetail); } catch {}
                          return (
                            <div key={issue.id || i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                              <span className={`mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                                issue.severity === 'CRITICAL'
                                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                  : issue.severity === 'WARNING'
                                  ? 'bg-orange-100 text-orange-700 border border-orange-200'
                                  : 'bg-blue-50 text-blue-600 border border-blue-100'
                              }`}>{issue.severity}</span>
                              <div className="flex-1 min-w-0">
                                <div className="text-[13px] font-semibold text-gray-900 capitalize">
                                  {issue.issueType?.replace(/_/g, ' ')}
                                </div>
                                <div className="text-[11px] text-gray-400 truncate mt-0.5">{issue.pageURL}</div>
                                {detail?.recommendedFix && (
                                  <div className="text-[11px] text-gray-500 mt-1">{detail.recommendedFix}</div>
                                )}
                              </div>
                              {issue.affooTaskID && (
                                <span className="text-[11px] font-medium text-gray-500 shrink-0">
                                  #{issue.affooTaskID}
                                </span>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <DocumentTextIcon className="w-12 h-12 text-gray-200 mb-4" />
                <div className="text-[14px] font-semibold text-gray-500 mb-1">No report yet</div>
                <div className="text-[13px] text-gray-400 mb-4">Run an analysis to generate your first SEO report.</div>
                <button
                  onClick={handleRunAnalysis}
                  disabled={runningAnalysis}
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg text-[13px] font-medium hover:bg-black flex items-center gap-2 disabled:opacity-50"
                >
                  <PlayIcon className="w-3.5 h-3.5" /> {runningAnalysis ? 'Running…' : 'Run analysis'}
                </button>
              </div>
            )
          )}

          {selectedOutputTab === 'tasks' && (
            seoLoading ? (
              <div className="flex items-center justify-center h-48 text-gray-400 text-[13px]">
                <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" /> Loading…
              </div>
            ) : seoReportDetail?.issues?.length > 0 ? (
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-gray-400 tracking-wider uppercase px-1 mb-3">
                  {seoReportDetail.issues.length} issues · auto-created as Affooh tasks
                </div>
                {seoReportDetail.issues.map((issue) => (
                  <div key={issue.id} className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-sm flex items-start gap-3">
                    <span className={`mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                      issue.severity === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                        : issue.severity === 'WARNING'
                        ? 'bg-orange-100 text-orange-700 border border-orange-200'
                        : 'bg-blue-50 text-blue-600 border border-blue-100'
                    }`}>{issue.severity}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-gray-900 capitalize">
                        {issue.issueType?.replace(/_/g, ' ')}
                      </div>
                      <div className="text-[11px] text-gray-400 truncate mt-0.5">{issue.pageURL}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      {issue.affooTaskID ? (
                        issue.taskClosedAt
                          ? <span className="text-[11px] font-medium text-green-600 flex items-center gap-1"><CheckCircleIcon className="w-3.5 h-3.5" /> Fixed</span>
                          : <span className="text-[11px] font-medium text-gray-500">Task #{issue.affooTaskID}</span>
                      ) : (
                        issue.severity === 'INFO'
                          ? <span className="text-[11px] text-gray-400">—</span>
                          : <span className="text-[11px] text-orange-500 font-medium">No task</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <ClipboardDocumentCheckIcon className="w-12 h-12 text-gray-200 mb-4" />
                <div className="text-[14px] font-semibold text-gray-500 mb-1">No tasks yet</div>
                <div className="text-[13px] text-gray-400">Tasks extracted from the SEO report will appear here.</div>
              </div>
            )
          )}

          {selectedOutputTab === 'code' && (() => {
            const snippets = reportCode?.snippets ?? [];
            const [activeSnippetIdx, setActiveSnippetIdx] = useState(0);
            const snippet = snippets[activeSnippetIdx] ?? null;
            const [copied, setCopied] = useState(false);
            const handleCopy = () => {
              if (!snippet) return;
              navigator.clipboard.writeText(snippet.code).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              });
            };
            if (agentLoading.reportCode) return (
              <div className="flex items-center justify-center h-48 text-gray-400 text-[13px]">
                <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" /> Loading code snippets…
              </div>
            );
            if (!snippet) return (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <CodeBracketIcon className="w-10 h-10 text-gray-200 mb-3" />
                <div className="text-[14px] font-semibold text-gray-500 mb-1">No code snippets yet</div>
                <div className="text-[13px] text-gray-400">Run an analysis to generate fix snippets.</div>
              </div>
            );
            return (
              <div className="bg-[#0f172a] rounded-xl overflow-hidden shadow-xl min-h-full flex flex-col">
                {/* Tab bar for multiple snippets */}
                {snippets.length > 1 && (
                  <div className="flex gap-1 px-4 pt-3 bg-[#0f172a] overflow-x-auto">
                    {snippets.map((s, i) => (
                      <button
                        key={s.id}
                        onClick={() => setActiveSnippetIdx(i)}
                        className={`shrink-0 px-3 py-1.5 rounded-t-lg text-[11px] font-mono font-bold transition-colors border-b-2 ${
                          i === activeSnippetIdx
                            ? 'text-blue-300 border-blue-400 bg-white/5'
                            : 'text-gray-500 border-transparent hover:text-gray-300'
                        }`}
                      >
                        {s.type}
                      </button>
                    ))}
                  </div>
                )}
                <div className="px-4 py-3 bg-[#1e293b] border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                    <span className="ml-2 text-[11px] font-mono text-gray-400 tracking-wider">{snippet.label}</span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-bold rounded-lg transition-colors border border-white/5"
                  >
                    <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="p-6 font-mono text-[13px] leading-relaxed text-blue-100 overflow-x-auto flex-1">
                  <pre className="whitespace-pre-wrap">{snippet.code}</pre>
                </div>
              </div>
            );
          })()}

          {selectedOutputTab === 'table' && (() => {
            if (agentLoading.reportTable) return (
              <div className="flex items-center justify-center h-48 text-gray-400 text-[13px]">
                <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" /> Loading table…
              </div>
            );
            const columns = reportTable?.columns ?? [];
            const rows = reportTable?.rows ?? [];
            if (!rows.length) return (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <TableCellsIcon className="w-10 h-10 text-gray-200 mb-3" />
                <div className="text-[14px] font-semibold text-gray-500 mb-1">No table data yet</div>
                <div className="text-[13px] text-gray-400">Run an analysis to populate the page issues table.</div>
              </div>
            );
            return (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden min-h-full flex flex-col">
                <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Pages by issue count — top {rows.length}</span>
                </div>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        {columns.map(col => (
                          <th key={col.key} className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-[13px]">
                      {rows.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate" title={row.pageURL}>
                            {row.pageURL}
                          </td>
                          <td className="px-4 py-3 text-gray-700 font-mono text-[12px] font-bold">{row.totalIssues}</td>
                          <td className="px-4 py-3 font-mono text-[12px]">
                            {row.critical > 0
                              ? <span className="text-red-600 font-bold">{row.critical}</span>
                              : <span className="text-gray-400">—</span>}
                          </td>
                          <td className="px-4 py-3 font-mono text-[12px]">
                            {row.warning > 0
                              ? <span className="text-orange-500 font-bold">{row.warning}</span>
                              : <span className="text-gray-400">—</span>}
                          </td>
                          <td className="px-4 py-3 font-mono text-[12px] text-gray-500">{row.info || '—'}</td>
                          <td className="px-4 py-3 font-mono text-[12px]">
                            {row.perfScore != null
                              ? <span className={row.perfScore >= 70 ? 'text-green-600 font-bold' : row.perfScore >= 40 ? 'text-orange-500 font-bold' : 'text-red-600 font-bold'}>{row.perfScore}</span>
                              : <span className="text-gray-400">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {selectedOutputTab === 'chart' && (() => {
            if (agentLoading.reportChart) return (
              <div className="flex items-center justify-center h-48 text-gray-400 text-[13px]">
                <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" /> Loading chart…
              </div>
            );
            const bars = reportChart?.bars ?? [];
            if (!bars.length) return (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <ChartBarIcon className="w-10 h-10 text-gray-200 mb-3" />
                <div className="text-[14px] font-semibold text-gray-500 mb-1">No chart data yet</div>
                <div className="text-[13px] text-gray-400">Run an analysis to generate the issue breakdown chart.</div>
              </div>
            );
            const maxVal = Math.max(...bars.map(b => b.value), 1);
            return (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 min-h-full">
                <div className="text-[15px] font-bold text-gray-900 mb-6">{reportChart?.title ?? 'Issues by type'}</div>
                <div className="space-y-5">
                  {bars.map((bar, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-36 text-[13px] font-medium text-gray-600 truncate shrink-0" title={bar.label}>{bar.label}</div>
                      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden relative">
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 to-rose-400 rounded-full transition-all duration-500"
                          style={{ width: `${Math.round((bar.value / maxVal) * 100)}%` }}
                        />
                      </div>
                      <div className="w-10 text-right text-[12px] font-mono font-bold text-gray-900 shrink-0">{bar.value}</div>
                    </div>
                  ))}
                </div>
                {reportChart?.source && (
                  <div className="mt-8 pt-6 border-t border-gray-100 text-[11px] text-gray-400 font-medium italic">
                    Source: {reportChart.source}
                  </div>
                )}
              </div>
            );
          })()}

          {selectedOutputTab === 'files' && (
            <div className="space-y-3 min-h-full">
              {seoLoading ? (
                <div className="flex items-center justify-center h-32 text-gray-400 text-[13px]">
                  <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" /> Loading…
                </div>
              ) : seoExecutions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <FolderIcon className="w-10 h-10 text-gray-200 mb-3" />
                  <div className="text-[13px] text-gray-400">No runs yet. Run an analysis to see execution history.</div>
                </div>
              ) : (
                seoExecutions.map((exec, i) => (
                  <div key={exec.id || i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between group hover:border-pink-300 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-[10px] font-bold border ${
                        exec.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-100' :
                        exec.status === 'FAILED' ? 'bg-red-50 text-red-600 border-red-100' :
                        exec.status === 'PARTIAL' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                        exec.status === 'RUNNING' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        'bg-gray-50 text-gray-500 border-gray-200'
                      }`}>
                        {exec.status === 'COMPLETED' ? 'DONE' : exec.status === 'FAILED' ? 'FAIL' : exec.status === 'PARTIAL' ? 'PART' : exec.status === 'RUNNING' ? 'RUN' : 'PEND'}
                      </div>
                      <div>
                        <div className="text-[14px] font-bold text-gray-900 group-hover:text-[#d92d78] transition-colors">
                          SEO Analysis
                          {exec.healthScore != null && <span className="ml-2 text-[12px] font-normal text-gray-500">· Score {exec.healthScore}</span>}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5 font-medium">
                          {exec.startedAt ? new Date(exec.startedAt).toLocaleString() : '—'}
                          {exec.siteURL ? ` · ${exec.siteURL}` : ''}
                        </div>
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full shrink-0 ${exec.status === 'COMPLETED' ? 'bg-green-500' : exec.status === 'RUNNING' ? 'bg-blue-500 animate-pulse' : exec.status === 'FAILED' ? 'bg-red-500' : exec.status === 'PARTIAL' ? 'bg-orange-400' : 'bg-gray-400'}`}></div>
                  </div>
                ))
              )}
            </div>
          )}

          {selectedOutputTab === 'map' && (() => {
            if (agentLoading.reportMap) return (
              <div className="flex items-center justify-center h-48 text-gray-400 text-[13px]">
                <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" /> Loading site map…
              </div>
            );
            const mapCenter = reportMap?.center ?? '';
            const mapNodes = reportMap?.nodes ?? [];
            if (!mapCenter && !mapNodes.length) return (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <MapIcon className="w-10 h-10 text-gray-200 mb-3" />
                <div className="text-[14px] font-semibold text-gray-500 mb-1">No site map yet</div>
                <div className="text-[13px] text-gray-400">Run an analysis to see the site content clusters.</div>
              </div>
            );
            // Lay nodes out in a circle around the center
            const angleStep = mapNodes.length > 0 ? (2 * Math.PI) / mapNodes.length : 0;
            const R = 38; // % radius
            const nodePositions = mapNodes.map((_, i) => {
              const angle = i * angleStep - Math.PI / 2;
              return {
                x: 50 + R * Math.cos(angle),
                y: 50 + R * Math.sin(angle),
              };
            });
            return (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 min-h-full flex flex-col items-center justify-center relative overflow-hidden">
                <div className="relative w-full h-[420px] flex items-center justify-center select-none">
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {nodePositions.map((pos, i) => (
                      <line
                        key={i}
                        x1="50%" y1="50%"
                        x2={`${pos.x}%`} y2={`${pos.y}%`}
                        stroke="#cbd5e1" strokeWidth="1.5"
                      />
                    ))}
                  </svg>

                  {/* Center node */}
                  <div className="z-10 bg-[#d92d78] text-white px-6 py-3 rounded-xl font-bold text-[14px] shadow-lg border border-pink-400 text-center max-w-[160px] truncate">
                    {mapCenter}
                  </div>

                  {/* Satellite nodes */}
                  {mapNodes.map((node, i) => {
                    const pos = nodePositions[i];
                    const hasIssues = node.issueCount > 0;
                    return (
                      <div
                        key={node.id}
                        className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 px-4 py-2 rounded-xl text-[12px] font-semibold shadow-sm border transition-colors cursor-default ${
                          hasIssues
                            ? 'bg-red-50 border-red-200 text-red-700 hover:border-red-400'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-pink-300'
                        }`}
                        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                        title={`${node.label} · ${node.issueCount} issue${node.issueCount !== 1 ? 's' : ''} across ${node.pageCount} page${node.pageCount !== 1 ? 's' : ''}`}
                      >
                        {node.label}
                        {hasIssues && (
                          <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold">
                            {node.issueCount > 99 ? '99+' : node.issueCount}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="absolute bottom-6 left-8 text-[11px] text-gray-400 font-medium">
                  Site sections · issue counts from latest report.
                  <span className="ml-1 text-red-400 font-semibold">Red = has issues</span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      <NewAgentModal
        isOpen={isNewAgentModalOpen}
        onClose={() => setIsNewAgentModalOpen(false)}
      />

      <ConfigureAgentModal
        isOpen={isConfigureModalOpen}
        onClose={() => setIsConfigureModalOpen(false)}
        agent={currentAgent}
        isEnabled={seoEnabled}
        onToggleEnabled={handleToggleAgent}
        agentToggling={agentToggling}
      />
    </div>
  );
};

export default AgentsLayout;
