import React, { useState, useEffect, useCallback } from 'react';
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
  ChevronRightIcon,
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
import {
  getAgentStatus,
  getModelConfig,
  getSeoSchedule,
  getSeoSiteConfig,
  runSeoAnalysis,
  getSeoExecutions,
  getLatestSeoReport,
} from './agentApi';

const AgentsLayout = () => {
  const [selectedAgent, setSelectedAgent] = useState('seo');
  const [activeTab, setActiveTab] = useState('chat');
  const [isNewAgentModalOpen, setIsNewAgentModalOpen] = useState(false);
  const [isConfigureModalOpen, setIsConfigureModalOpen] = useState(false);
  const [selectedOutputTab, setSelectedOutputTab] = useState('report');

  // SEO real data state
  const [seoStatus, setSeoStatus] = useState(null);
  const [seoModelConfig, setSeoModelConfig] = useState(null);
  const [seoSchedule, setSeoSchedule] = useState(null);
  const [seoSiteConfig, setSeoSiteConfig] = useState(null);
  const [seoReport, setSeoReport] = useState(null);
  const [seoExecutions, setSeoExecutions] = useState([]);
  const [seoLoading, setSeoLoading] = useState(true);
  const [runningAnalysis, setRunningAnalysis] = useState(false);
  const [runMessage, setRunMessage] = useState(null);

  const loadSeoData = useCallback(async () => {
    setSeoLoading(true);
    try {
      const [statusRes, modelRes, scheduleRes, siteRes, reportRes, execRes] = await Promise.allSettled([
        getAgentStatus(),
        getModelConfig('SEO'),
        getSeoSchedule(),
        getSeoSiteConfig(),
        getLatestSeoReport(),
        getSeoExecutions(),
      ]);
      if (statusRes.status === 'fulfilled') setSeoStatus(statusRes.value);
      if (modelRes.status === 'fulfilled') setSeoModelConfig(modelRes.value);
      if (scheduleRes.status === 'fulfilled') setSeoSchedule(scheduleRes.value);
      if (siteRes.status === 'fulfilled') setSeoSiteConfig(siteRes.value);
      if (reportRes.status === 'fulfilled') setSeoReport(reportRes.value?.report || null);
      if (execRes.status === 'fulfilled') setSeoExecutions(execRes.value?.executions || []);
    } catch (_) {}
    setSeoLoading(false);
  }, []);

  useEffect(() => {
    loadSeoData();
  }, [loadSeoData]);

  const handleRunAnalysis = async () => {
    setRunningAnalysis(true);
    setRunMessage(null);
    try {
      const res = await runSeoAnalysis({ siteUrl: seoSiteConfig?.siteUrl });
      setRunMessage({ type: 'success', text: `Analysis started — execution ID: ${res.executionId || 'queued'}` });
      setTimeout(() => loadSeoData(), 3000);
    } catch (e) {
      setRunMessage({ type: 'error', text: e?.response?.data?.error || 'Failed to start analysis' });
    }
    setRunningAnalysis(false);
  };

  const seoEnabled = seoStatus?.agents?.find(a => a.agentType === 'SEO')?.isEnabled ?? true;
  const seoModelName = seoModelConfig?.modelID || 'Not configured';

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
                  <span className="bg-green-50 border border-green-200 text-green-700 px-1.5 py-0 rounded-md font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> running</span>
                  <span>{currentAgent.model}</span>
                  <span>·</span>
                  <span>{currentAgent.sources} sources</span>
                  <span>·</span>
                  <span>{currentAgent.tools} tools</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium text-gray-600">
              <button className="flex items-center gap-1.5 hover:text-gray-900 bg-white border border-gray-200 shadow-sm px-3 py-1.5 rounded-lg text-[13px]"><ArrowPathIcon className="w-4 h-4" /> New thread</button>
              <button onClick={() => setIsConfigureModalOpen(true)} className="flex items-center gap-1.5 hover:text-gray-900 bg-white border border-gray-200 shadow-sm px-3 py-1.5 rounded-lg text-[13px]"><AdjustmentsHorizontalIcon className="w-4 h-4" /> Configure</button>
            </div>
          </div>

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
            <div className="flex-1 overflow-y-auto p-6 bg-white flex flex-col items-center justify-center">
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
                    <button className="bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-[12px] font-medium hover:bg-gray-100">Run a site audit</button>
                    <button className="bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-[12px] font-medium hover:bg-gray-100">Find content gaps</button>
                    <button className="bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-[12px] font-medium hover:bg-gray-100">Check Core Web Vitals</button>
                  </>
                ) : (
                  <>
                    <button className="bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-[12px] font-medium hover:bg-gray-100">Get started</button>
                    <button className="bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-[12px] font-medium hover:bg-gray-100">What can you do?</button>
                  </>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-white border-t border-gray-100">
              <div className="flex items-center gap-4 mb-3 px-1 text-[11px] font-semibold text-gray-500 tracking-wide">
                <span className="flex items-center gap-1.5"><Cog6ToothIcon className="w-3.5 h-3.5" /> Tools · {currentAgent.tools}</span>
                <span className="flex items-center gap-1.5"><FolderIcon className="w-3.5 h-3.5" /> RAG · {currentAgent.sources}</span>
                <span className="flex items-center gap-1.5"><ChartBarIcon className="w-3.5 h-3.5" /> Memory</span>
              </div>
              <div className="border border-gray-200 rounded-xl bg-white flex items-center p-1.5 shadow-sm focus-within:ring-1 focus-within:ring-[#d92d78] focus-within:border-[#d92d78]">
                <input type="text" placeholder={`Message ${currentAgent.name}...`} className="flex-1 bg-transparent border-none focus:outline-none px-3 text-[14px]" />
                <div className="flex items-center gap-3 text-[12px] text-gray-400 mr-2 font-medium">
                  Slash commands
                </div>
                <button className="bg-[#f3b5ce] text-white p-2 rounded-lg cursor-not-allowed">
                  <PaperAirplaneIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-white">
            {/* Configure Tab — SEO Analysis */}
            <div className="bg-[#fff0f6] rounded-xl p-5 border border-pink-100 flex items-center justify-between shadow-sm mb-6">
              <div>
                <div className="text-[14px] font-bold text-gray-900 mb-0.5">SEO Analysis</div>
                <p className="text-[13px] text-gray-600">
                  {seoSiteConfig?.siteUrl ? (
                    <>Analysing <span className="font-medium text-gray-800">{seoSiteConfig.siteUrl}</span> · schedule &amp; model in <span className="text-pink-600 underline cursor-pointer hover:text-pink-700" onClick={() => setIsConfigureModalOpen(true)}>advanced settings</span>.</>
                  ) : (
                    <>Configure site URL and model in <span className="text-pink-600 underline cursor-pointer hover:text-pink-700" onClick={() => setIsConfigureModalOpen(true)}>advanced settings</span>.</>
                  )}
                </p>
              </div>
              <button
                onClick={handleRunAnalysis}
                disabled={runningAnalysis}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-[13px] font-medium shadow-sm hover:bg-black flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {runningAnalysis ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <PlayIcon className="w-4 h-4" />}
                {runningAnalysis ? 'Starting…' : 'Run now'}
              </button>
            </div>

            {runMessage && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-[13px] font-medium border ${runMessage.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                {runMessage.type === 'success' ? <CheckCircleIcon className="w-4 h-4 shrink-0" /> : <ExclamationCircleIcon className="w-4 h-4 shrink-0" />}
                {runMessage.text}
              </div>
            )}

            {/* Schedule card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 border border-pink-100">
                    <ArrowPathIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-[14px] text-gray-900">Scheduled analysis</div>
                    <div className="text-[13px] text-gray-500 mt-0.5">Full SEO crawl, PageSpeed, GSC data, and AI report.</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    {seoSchedule ? (
                      <>
                        <div className="text-[13px] font-semibold text-gray-600 flex items-center gap-1">
                          <ArrowPathIcon className="w-3.5 h-3.5" />
                          {seoSchedule.frequency || 'Manual'}
                        </div>
                        {seoSchedule.nextRunAt && (
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            Next · {new Date(seoSchedule.nextRunAt).toLocaleString()}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-[13px] text-gray-400">Not scheduled</div>
                    )}
                  </div>
                  <div className={`w-9 h-5 rounded-full relative shadow-inner ${seoEnabled ? 'bg-[#d92d78]' : 'bg-gray-200 border border-gray-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${seoEnabled ? 'right-0.5' : 'left-0.5'}`}></div>
                  </div>
                </div>
              </div>

              <div className="px-5 py-4 bg-white">
                <div className="flex gap-6">
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Site URL</label>
                    <input
                      type="text"
                      readOnly
                      value={seoSiteConfig?.siteUrl || ''}
                      placeholder="Not configured"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-800 font-medium bg-gray-50 focus:outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">AI Model</label>
                    <input
                      type="text"
                      readOnly
                      value={seoModelName}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-800 font-medium bg-gray-50 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                  <div className="text-[12px] text-gray-400 flex items-center gap-1.5 font-medium">
                    <BoltIcon className="w-3.5 h-3.5" /> {seoExecutions.length} total runs · Output → report panel
                  </div>
                  <button
                    onClick={() => setIsConfigureModalOpen(true)}
                    className="text-[13px] text-pink-600 font-medium hover:underline"
                  >
                    Edit settings →
                  </button>
                </div>
              </div>
            </div>

            {/* Past executions */}
            {seoExecutions.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                  Recent Runs
                </div>
                {seoExecutions.slice(0, 5).map((exec, i) => (
                  <div key={exec.executionId || i} className="px-4 py-3 flex items-center justify-between border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${exec.status === 'SUCCEEDED' ? 'bg-green-500' : exec.status === 'RUNNING' ? 'bg-blue-500 animate-pulse' : exec.status === 'FAILED' ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                      <div>
                        <div className="text-[13px] font-medium text-gray-800">{exec.status}</div>
                        <div className="text-[11px] text-gray-400">{exec.startedAt ? new Date(exec.startedAt).toLocaleString() : '—'}</div>
                      </div>
                    </div>
                    {exec.healthScore != null && (
                      <div className="text-[13px] font-bold text-gray-700">Score: {exec.healthScore}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="h-4"></div>
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

        <div className="flex-1 overflow-y-auto p-6 bg-[#fcfcfc] scrollbar-hide">
          {selectedOutputTab === 'report' && (
            seoLoading ? (
              <div className="flex items-center justify-center h-48 text-gray-400 text-[13px]">
                <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" /> Loading report…
              </div>
            ) : seoReport ? (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 min-h-full max-w-full overflow-hidden">
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-6 font-medium">
                  {seoReport.healthScore != null && (
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-white text-[11px] ${seoReport.healthScore >= 70 ? 'bg-green-500' : seoReport.healthScore >= 40 ? 'bg-orange-400' : 'bg-red-500'}`}>
                      Score {seoReport.healthScore}
                    </span>
                  )}
                  {seoReport.generatedAt && (
                    <span>Generated {new Date(seoReport.generatedAt).toLocaleString()}</span>
                  )}
                  {seoReport.siteUrl && (
                    <span className="text-gray-400">{seoReport.siteUrl}</span>
                  )}
                </div>

                <div className="text-2xl font-bold text-gray-900 mb-4 tracking-tight leading-snug">
                  SEO Health Report
                </div>

                {seoReport.executiveSummary && (
                  <div className="mb-6">
                    <div className="text-xs font-bold text-gray-500 tracking-wider mb-2 uppercase">Summary</div>
                    <p className="text-sm text-gray-800 leading-relaxed">{seoReport.executiveSummary}</p>
                  </div>
                )}

                {seoReport.prioritizedIssues?.length > 0 && (
                  <div className="mb-6">
                    <div className="text-xs font-bold text-gray-500 tracking-wider mb-3 uppercase">Prioritized Issues</div>
                    <div className="space-y-3">
                      {seoReport.prioritizedIssues.map((issue, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <span className={`mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                            issue.priority === 'high' || issue.priority === 'critical'
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : issue.priority === 'medium'
                              ? 'bg-orange-100 text-orange-700 border border-orange-200'
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}>{issue.priority || 'low'}</span>
                          <div>
                            <div className="text-[13px] font-semibold text-gray-900">{issue.title || issue.issue}</div>
                            {issue.description && <div className="text-[12px] text-gray-500 mt-0.5">{issue.description}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {seoReport.recommendations?.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-gray-500 tracking-wider mb-3 uppercase">Recommendations</div>
                    <ol className="list-decimal pl-4 space-y-2 text-sm text-gray-800 marker:text-gray-500">
                      {seoReport.recommendations.map((rec, i) => (
                        <li key={i}>{typeof rec === 'string' ? rec : rec.text || rec.recommendation}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <DocumentTextIcon className="w-12 h-12 text-gray-200 mb-4" />
                <div className="text-[14px] font-semibold text-gray-500 mb-1">No report yet</div>
                <div className="text-[13px] text-gray-400 mb-4">Run an analysis to generate your first SEO report.</div>
                <button
                  onClick={() => setActiveTab('configure')}
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg text-[13px] font-medium hover:bg-black flex items-center gap-2"
                >
                  <PlayIcon className="w-3.5 h-3.5" /> Go to Configure
                </button>
              </div>
            )
          )}

          {selectedOutputTab === 'tasks' && (
            <div className="space-y-3 min-h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[13px] text-gray-500 font-medium">7 open · 1 done</div>
                <button className="text-[13px] font-bold text-gray-800 flex items-center gap-1 hover:text-pink-600 transition-colors">
                  <PlusIcon className="w-4 h-4" /> Add task
                </button>
              </div>
              {tasks.map(task => (
                <div key={task.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-start gap-4 group hover:border-gray-300 transition-all cursor-pointer">
                  <div className={`mt-0.5 w-5 h-5 rounded border transition-colors flex items-center justify-center ${task.done ? 'bg-pink-100 border-pink-300 text-pink-600' : 'border-gray-300 group-hover:border-pink-300'}`}>
                    {task.done && <ClipboardDocumentCheckIcon className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1">
                    <div className={`text-[14px] font-medium leading-tight ${task.done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{task.title}</div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${task.priority === 'High' ? 'bg-rose-50 text-rose-600 border border-rose-100' : task.priority === 'Med' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                        {task.priority}
                      </span>
                      <span className="text-[11px] text-gray-400 font-bold">→ {task.owner}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedOutputTab === 'code' && (
            <div className="bg-[#0f172a] rounded-xl overflow-hidden shadow-xl min-h-full flex flex-col">
              <div className="px-4 py-3 bg-[#1e293b] border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                  <span className="ml-2 text-[11px] font-mono text-gray-400 tracking-wider">schema-org · article</span>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 text-[11px] font-bold rounded-lg transition-colors border border-white/5">
                  <DocumentDuplicateIcon className="w-3.5 h-3.5" /> Copy
                </button>
              </div>
              <div className="p-6 font-mono text-[13px] leading-relaxed text-blue-100 overflow-x-auto">
                <pre>{`{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Async standups for distributed teams",
  "author": { "@type": "Organization", "name": "AffooH" },
  "datePublished": "2026-05-20",
  "keywords": [
    "async standups",
    "asynchronous daily",
    "remote standups",
    "distributed standup meeting"
  ],
  "about": {
    "@type": "Thing",
    "name": "Project management"
  },
  "wordCount": 2400,
  "inLanguage": "en-US"
}`}</pre>
              </div>
            </div>
          )}

          {selectedOutputTab === 'table' && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden min-h-full flex flex-col">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Keyword</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Vol</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">KD</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">You</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-green-600">Monday</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-[13px]">
                  {[
                    { kw: 'async standups', vol: '8,400', kd: '28', you: '—', comp: '3' },
                    { kw: 'asynchronous daily standup', vol: '2,100', kd: '22', you: '—', comp: '5' },
                    { kw: 'remote standup meeting', vol: '3,600', kd: '31', you: '62', comp: '2' },
                    { kw: 'distributed standup', vol: '1,900', kd: '19', you: '—', comp: '7' },
                    { kw: 'async daily update', vol: '880', kd: '14', you: '84', comp: '4' },
                    { kw: 'standup template remote', vol: '1,300', kd: '24', you: '—', comp: '6' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5 font-medium text-gray-900 leading-tight">{row.kw}</td>
                      <td className="px-4 py-3.5 text-gray-600 font-mono text-[12px]">{row.vol}</td>
                      <td className="px-4 py-3.5 text-gray-600 font-mono text-[12px]">{row.kd}</td>
                      <td className="px-4 py-3.5 text-orange-600 font-bold font-mono text-[12px]">{row.you}</td>
                      <td className="px-4 py-3.5 text-green-600 font-bold font-mono text-[12px]">{row.comp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedOutputTab === 'chart' && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 min-h-full">
              <div className="text-[15px] font-bold text-gray-900 mb-6">Monthly search volume by cluster</div>
              <div className="space-y-5">
                {[
                  { label: 'Async standups', value: '8,400', width: '40%' },
                  { label: 'Sprint planning', value: '14,200', width: '65%' },
                  { label: 'RICE prioritisation', value: '6,100', width: '30%' },
                  { label: 'OKR examples', value: '22,400', width: '90%' },
                  { label: 'Roadmap viz', value: '4,800', width: '25%' },
                  { label: 'Backlog grooming', value: '3,200', width: '18%' },
                ].map((bar, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-32 text-[13px] font-medium text-gray-600 truncate">{bar.label}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden relative">
                       <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-400 rounded-full" style={{ width: bar.width }}></div>
                    </div>
                    <div className="w-16 text-right text-[12px] font-mono font-bold text-gray-900">{bar.value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-gray-100 text-[11px] text-gray-400 font-medium italic">
                 Source: ahrefs · US · last 12 mo
              </div>
            </div>
          )}

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
                  <div key={exec.executionId || i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between group hover:border-pink-300 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-[10px] font-bold border ${
                        exec.status === 'SUCCEEDED' ? 'bg-green-50 text-green-700 border-green-100' :
                        exec.status === 'FAILED' ? 'bg-red-50 text-red-600 border-red-100' :
                        exec.status === 'RUNNING' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        'bg-gray-50 text-gray-500 border-gray-200'
                      }`}>
                        {exec.status === 'SUCCEEDED' ? 'DONE' : exec.status === 'FAILED' ? 'FAIL' : exec.status === 'RUNNING' ? 'RUN' : 'PEND'}
                      </div>
                      <div>
                        <div className="text-[14px] font-bold text-gray-900 group-hover:text-[#d92d78] transition-colors">
                          SEO Analysis
                          {exec.healthScore != null && <span className="ml-2 text-[12px] font-normal text-gray-500">· Score {exec.healthScore}</span>}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5 font-medium">
                          {exec.startedAt ? new Date(exec.startedAt).toLocaleString() : '—'}
                          {exec.siteUrl ? ` · ${exec.siteUrl}` : ''}
                        </div>
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full shrink-0 ${exec.status === 'SUCCEEDED' ? 'bg-green-500' : exec.status === 'RUNNING' ? 'bg-blue-500 animate-pulse' : exec.status === 'FAILED' ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                  </div>
                ))
              )}
            </div>
          )}

          {selectedOutputTab === 'map' && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 min-h-full flex flex-col items-center justify-center relative overflow-hidden">
              <div className="relative w-full h-[400px] flex items-center justify-center">
                {/* Connecting Lines (SVG) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <line x1="50%" y1="50%" x2="25%" y2="25%" stroke="#cbd5e1" strokeWidth="1.5" />
                  <line x1="50%" y1="50%" x2="50%" y2="20%" stroke="#cbd5e1" strokeWidth="1.5" />
                  <line x1="50%" y1="50%" x2="75%" y2="25%" stroke="#cbd5e1" strokeWidth="1.5" />
                  <line x1="50%" y1="50%" x2="25%" y2="75%" stroke="#cbd5e1" strokeWidth="1.5" />
                  <line x1="50%" y1="50%" x2="50%" y2="80%" stroke="#cbd5e1" strokeWidth="1.5" />
                  <line x1="50%" y1="50%" x2="75%" y2="75%" stroke="#cbd5e1" strokeWidth="1.5" />
                </svg>

                {/* Center Node */}
                <div className="z-10 bg-[#e65c4f] text-white px-6 py-3 rounded-xl font-bold text-[15px] shadow-lg shadow-red-100 border border-red-400">
                  Async standups
                </div>

                {/* Satellite Nodes */}
                <div className="absolute top-[20%] left-[20%] -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-200 px-5 py-2 rounded-xl text-[13px] font-semibold text-gray-700 shadow-sm hover:border-pink-300 transition-colors cursor-grab active:cursor-grabbing">
                  Definition
                </div>
                <div className="absolute top-[15%] left-[50%] -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-200 px-5 py-2 rounded-xl text-[13px] font-semibold text-gray-700 shadow-sm hover:border-pink-300 transition-colors cursor-grab active:cursor-grabbing">
                  Why it works
                </div>
                <div className="absolute top-[20%] right-[20%] translate-x-1/2 -translate-y-1/2 bg-white border border-gray-200 px-5 py-2 rounded-xl text-[13px] font-semibold text-gray-700 shadow-sm hover:border-pink-300 transition-colors cursor-grab active:cursor-grabbing">
                  Tools & rituals
                </div>
                <div className="absolute bottom-[20%] left-[20%] -translate-x-1/2 translate-y-1/2 bg-white border border-gray-200 px-5 py-2 rounded-xl text-[13px] font-semibold text-gray-700 shadow-sm hover:border-pink-300 transition-colors cursor-grab active:cursor-grabbing">
                  Templates
                </div>
                <div className="absolute bottom-[15%] left-[50%] -translate-x-1/2 translate-y-1/2 bg-white border border-gray-200 px-5 py-2 rounded-xl text-[13px] font-semibold text-gray-700 shadow-sm hover:border-pink-300 transition-colors cursor-grab active:cursor-grabbing">
                  Pitfalls
                </div>
                <div className="absolute bottom-[20%] right-[20%] translate-x-1/2 translate-y-1/2 bg-white border border-gray-200 px-5 py-2 rounded-xl text-[13px] font-semibold text-gray-700 shadow-sm hover:border-pink-300 transition-colors cursor-grab active:cursor-grabbing">
                  Examples
                </div>
              </div>

              <div className="absolute bottom-8 left-8 text-[12px] text-gray-400 font-medium">
                Outline draft — drag nodes to reorder. <span className="text-[#d92d78] cursor-pointer hover:underline">Open editor</span>
              </div>
            </div>
          )}
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
      />
    </div>
  );
};

export default AgentsLayout;
