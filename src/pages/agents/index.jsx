import React, { useState } from 'react';
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
  SparklesIcon
} from '@heroicons/react/24/outline';
import { PlayIcon } from '@heroicons/react/24/solid';
import { useHistory } from 'react-router-dom';
import NewAgentModal from './NewAgentModal';

const AgentsLayout = () => {
  const [selectedAgent, setSelectedAgent] = useState('seo');
  const [activeTab, setActiveTab] = useState('chat'); // Set to chat by default as per screenshot
  const [isNewAgentModalOpen, setIsNewAgentModalOpen] = useState(false);
  const [selectedOutputTab, setSelectedOutputTab] = useState('report');

  const agents = [
    { id: 'ba', name: 'Business Analyst', model: 'GPT-4o', init: 'BA', color: 'bg-blue-600 text-white', sources: 3, tools: 2 },
    { id: 'pm', name: 'Product Manager', model: 'Claude Sonnet 3.5', init: 'PM', color: 'bg-purple-500 text-white', sources: 5, tools: 4 },
    { id: 'seo', name: 'SEO Specialist', model: 'GPT-4o', init: 'SEO', color: 'bg-gradient-to-br from-orange-400 to-pink-500 text-white', active: true, running: true, sources: 8, tools: 6 },
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

  const tasks = [
    { id: 1, title: "Draft pillar page: 'Async standups for distributed teams'", priority: 'High', owner: 'CW', done: false },
    { id: 2, title: "Brief 8 supporting articles for the async cluster", priority: 'High', owner: 'SEO', done: false },
    { id: 3, title: "Audit existing /standup-meeting page for cannibalisation", priority: 'Med', owner: 'SEO', done: true },
    { id: 4, title: "Build internal-link plan from /pm-templates → new pillar", priority: 'Med', owner: 'SEO', done: false },
    { id: 5, title: "Source 2 customer quotes from CS team", priority: 'Med', owner: 'MK', done: false },
    { id: 6, title: "Request 3 original screenshots from Design", priority: 'Low', owner: 'DS', done: false },
    { id: 7, title: "Sprint planning cluster — keyword research", priority: 'Med', owner: 'SEO', done: false },
    { id: 8, title: "RICE cluster — competitor outline scrape", priority: 'Low', owner: 'SEO', done: false },
  ];

  const files = [
    { name: 'content-gap-may13.pdf', type: 'PDF', size: '284 KB', category: 'Report' },
    { name: 'keyword-gaps.csv', type: 'CSV', size: '42 KB', category: 'Data' },
    { name: 'async-standups-brief.md', type: 'MD', size: '8 KB', category: 'Brief' },
    { name: 'competitor-serps.json', type: 'JSON', size: '118 KB', category: 'Raw' },
    { name: 'schema-article.json', type: 'JSON', size: '1 KB', category: 'Snippet' },
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
              <button className="flex items-center gap-1.5 hover:text-gray-900 bg-white border border-gray-200 shadow-sm px-3 py-1.5 rounded-lg text-[13px]"><AdjustmentsHorizontalIcon className="w-4 h-4" /> Configure</button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 border-b border-gray-100">
            <div className="flex items-center gap-6">
              <div
                className={`flex items-center gap-2 pb-2 border-b-2 font-medium text-[13px] cursor-pointer transition-colors ${activeTab === 'chat' ? 'border-[#d92d78] text-[#d92d78]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('chat')}
              >
                <ChatBubbleLeftEllipsisIcon className="w-4 h-4" /> Chat <span className={`text-[10px] px-1.5 rounded-md font-bold ${activeTab === 'chat' ? 'bg-pink-50 text-[#d92d78]' : 'bg-gray-100 text-gray-500'}`}>{selectedAgent === 'ba' ? '2' : '5'}</span>
              </div>
              <div
                className={`flex items-center gap-2 pb-2 border-b-2 font-medium text-[13px] cursor-pointer transition-colors ${activeTab === 'configure' ? 'border-[#d92d78] text-[#d92d78]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('configure')}
              >
                <AdjustmentsHorizontalIcon className="w-4 h-4" /> Configure
              </div>
            </div>
            <div className="text-[12px] text-gray-400 pb-2">
              Thread <span className="font-medium text-gray-500">#{selectedAgent === 'ba' ? 'billing-portal-reqs' : 'seo-content-gap-may13'}</span>
            </div>
          </div>
        </div>

        {activeTab === 'chat' ? (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
              {selectedAgent === 'ba' ? (
                <>
                  {/* BA Message 1 */}
                  <div className="flex justify-end gap-3">
                    <div className="flex flex-col items-end max-w-[75%]">
                      <div className="bg-[#d92d78] text-white p-3.5 px-5 rounded-2xl rounded-tr-sm text-[14px] shadow-sm font-medium">
                        Capture requirements for the new billing portal.
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-[#c17a65] text-white rounded-full flex items-center justify-center font-bold text-[11px] shrink-0">SP</div>
                      <div className="text-[10px] text-gray-400 mt-1 whitespace-nowrap">You • 8:12</div>
                    </div>
                  </div>

                  {/* BA Response 1 */}
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center mt-1">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold bg-blue-600 text-white shrink-0 border border-gray-100 shadow-sm">BA</div>
                    </div>
                    <div className="max-w-[75%]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[12px] text-gray-400">Business Analyst • 8:13</span>
                      </div>
                      <div className="bg-[#f5f5f5] text-gray-800 p-4 rounded-2xl rounded-tl-sm text-[14px] leading-relaxed">
                        <p>I have 4 clarifying questions before I draft. (1) Are we supporting metered + seat-based on day one? (2) Do tax rules need to handle EU VAT? (3) Is dunning in scope? (4) Who's the executive sponsor?</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* SEO Message 1 */}
                  <div className="flex justify-end gap-3">
                    <div className="flex flex-col items-end max-w-[75%]">
                      <div className="bg-[#d92d78] text-white p-3.5 px-4 rounded-2xl rounded-tr-sm text-[14px] shadow-sm">
                        Run a content gap analysis for affooh.com vs our top 3 competitors in the project-management space.
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-[#c17a65] text-white rounded-full flex items-center justify-center font-bold text-[11px] shrink-0">SP</div>
                      <div className="text-[10px] text-gray-400 mt-1 whitespace-nowrap">You • 9:41</div>
                    </div>
                  </div>

                  {/* SEO Response 1 */}
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center mt-1">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold bg-gradient-to-br from-orange-400 to-pink-500 text-white shrink-0 border border-gray-100 shadow-sm">SEO</div>
                    </div>
                    <div className="max-w-[75%]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[12px] text-gray-400">SEO Specialist • 9:41</span>
                      </div>
                      <div className="bg-[#f5f5f5] text-gray-800 p-4 rounded-2xl rounded-tl-sm text-[14px]">
                        <p>On it. I'll pull SERP data for the seed terms in your 'pm-keywords' RAG source, cluster intent, and flag gaps where competitors rank top-10 and you don't.</p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex gap-2">
                            <span className="text-[11px] bg-white text-gray-600 px-2 py-1 rounded-md border border-gray-200 flex items-center gap-1 shadow-sm"><BoltIcon className="w-3 h-3 text-gray-400" /> serp_api</span>
                            <span className="text-[11px] bg-white text-gray-600 px-2 py-1 rounded-md border border-gray-200 flex items-center gap-1 shadow-sm"><BoltIcon className="w-3 h-3 text-gray-400" /> ahrefs_export</span>
                          </div>
                          <span className="text-[11px] text-gray-400">2.4s</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SEO Response 2 */}
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center mt-1">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold bg-gradient-to-br from-orange-400 to-pink-500 text-white shrink-0 border border-gray-100 shadow-sm">SEO</div>
                    </div>
                    <div className="max-w-[75%]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[12px] text-gray-400">SEO Specialist • 9:43</span>
                      </div>
                      <div className="bg-[#f5f5f5] text-gray-800 p-4 rounded-2xl rounded-tl-sm text-[14px]">
                        <p>Found 47 high-value gap keywords across 6 clusters. Top cluster is "async standups" — 8,400 mo. searches, all three competitors rank, affooh doesn't have a page. Full report and a draft brief are in the output panel -></p>
                        <button className="mt-4 bg-pink-50 text-[#d92d78] px-3 py-1.5 rounded-lg text-[13px] font-medium border border-pink-100 hover:bg-pink-100 flex items-center gap-1 shadow-sm">
                          <DocumentTextIcon className="w-4 h-4" /> View in output panel &gt;
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* SEO Message 2 */}
                  <div className="flex justify-end gap-3">
                    <div className="flex flex-col items-end max-w-[75%]">
                      <div className="bg-[#d92d78] text-white p-3.5 px-4 rounded-2xl rounded-tr-sm text-[14px] shadow-sm">
                        Nice. Draft an outline for the async-standups pillar page and prioritise the rest as tasks.
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-[#c17a65] text-white rounded-full flex items-center justify-center font-bold text-[11px] shrink-0">SP</div>
                      <div className="text-[10px] text-gray-400 mt-1 whitespace-nowrap">You • 9:44</div>
                    </div>
                  </div>

                  {/* SEO Response 3 */}
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center mt-1">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold bg-gradient-to-br from-orange-400 to-pink-500 text-white shrink-0 border border-gray-100 shadow-sm">SEO</div>
                    </div>
                    <div className="max-w-[75%]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[12px] text-gray-400">SEO Specialist • 9:44</span>
                      </div>
                      <div className="bg-[#f5f5f5] text-gray-800 p-4 rounded-2xl rounded-tl-sm text-[14px]">
                        <p>Outline drafted (8 H2s, 2,400 words target) and 12 follow-up tasks pushed to the task list. Want me to hand the outline to the Content Writer agent?</p>
                        <div className="mt-4 flex gap-2">
                          <button className="bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-[13px] font-medium hover:bg-gray-50 shadow-sm">
                            Hand off to CW
                          </button>
                          <button className="bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-[13px] font-medium hover:bg-gray-50 shadow-sm">
                            Edit outline
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              <div className="h-4"></div>
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
            {/* Configure Tab Content */}
            <div className="bg-[#fff0f6] rounded-xl p-5 border border-pink-100 flex items-center justify-between shadow-sm mb-6">
              <div>
                <div className="text-[14px] font-bold text-gray-900 mb-0.5">Automated tasks</div>
                <p className="text-[13px] text-gray-600">Recurring jobs SEO Specialist runs on its own. 6 of 8 enabled · model & persona live in <span className="text-pink-600 underline cursor-pointer hover:text-pink-700">advanced settings</span>.</p>
              </div>
              <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-[13px] font-medium shadow-sm hover:bg-gray-50 flex items-center gap-2">
                <PlusIcon className="w-4 h-4" /> Add task
              </button>
            </div>

            {/* Task 1: Site crawl (Expanded) */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 border border-pink-100">
                    <ArrowPathIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-[14px] text-gray-900">Site crawl</div>
                    <div className="text-[13px] text-gray-500 mt-0.5">Discover URLs, status codes, redirects, orphan pages.</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-[13px] font-semibold text-gray-500 flex items-center justify-end gap-1"><ArrowPathIcon className="w-3.5 h-3.5" /> Daily · 03:00 UTC</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">Last run · 2h ago</div>
                  </div>
                  <div className="w-9 h-5 bg-[#d92d78] rounded-full relative cursor-pointer shadow-inner">
                    <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                  </div>
                  <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="px-5 pb-5 pt-4 bg-white">
                <div className="flex gap-6 mb-5">
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Start URL</label>
                    <input type="text" defaultValue="https://affooh.com" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-800 font-medium focus:outline-none focus:ring-1 focus:ring-pink-500 shadow-sm" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Max Depth</label>
                    <input type="text" defaultValue="5" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-800 font-medium focus:outline-none focus:ring-1 focus:ring-pink-500 shadow-sm" />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Schedule</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-1 flex text-[13px] font-medium text-gray-500">
                    <div className="px-4 py-1.5 rounded-md cursor-pointer hover:text-gray-700">Realtime</div>
                    <div className="px-4 py-1.5 rounded-md cursor-pointer hover:text-gray-700">Hourly</div>
                    <div className="px-4 py-1.5 rounded-md bg-white border border-gray-200 text-gray-900 shadow-sm cursor-pointer">Daily · 03:00 UTC</div>
                    <div className="px-4 py-1.5 rounded-md cursor-pointer hover:text-gray-700">Weekly · Mon 06:00</div>
                    <div className="px-4 py-1.5 rounded-md cursor-pointer hover:text-gray-700">Monthly · 1st</div>
                    <div className="px-4 py-1.5 rounded-md cursor-pointer hover:text-gray-700">Off</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100">
                  <div className="text-[12px] text-gray-400 flex items-center gap-1.5 font-medium">
                    <BoltIcon className="w-3.5 h-3.5 text-gray-400" /> 142 total runs · Output → output panel
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-[13px] text-gray-500 font-medium cursor-pointer hover:text-gray-800">... Logs</div>
                    <button className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-[13px] font-medium flex items-center gap-1.5 hover:bg-black shadow-sm">
                      <PlayIcon className="w-3.5 h-3.5" /> Run now
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Task 2: Meta audit (Collapsed) */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 border border-pink-100">
                  <DocumentTextIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-[14px] text-gray-900">Meta audit</div>
                  <div className="text-[13px] text-gray-500 mt-0.5">Title, description, canonical, OG and Twitter cards.</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-[13px] font-semibold text-gray-500 flex items-center justify-end gap-1"><ArrowPathIcon className="w-3.5 h-3.5" /> Daily · 04:00 UTC</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">Last run · 2h ago</div>
                </div>
                <div className="w-9 h-5 bg-[#d92d78] rounded-full relative cursor-pointer shadow-inner">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Task 3: Site speed */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 border border-pink-100">
                  <BoltIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-[14px] text-gray-900">Site speed (Core Web Vitals)</div>
                  <div className="text-[13px] text-gray-500 mt-0.5">LCP, INP, CLS for mobile + desktop. Lighthouse run.</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-[13px] font-semibold text-gray-500 flex items-center justify-end gap-1"><ArrowPathIcon className="w-3.5 h-3.5" /> Weekly · Mon 06:00</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">Last run · 3d ago</div>
                </div>
                <div className="w-9 h-5 bg-[#d92d78] rounded-full relative cursor-pointer shadow-inner">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Task 4: Keyword rank tracking */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 border border-pink-100">
                  <ChartBarIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-[14px] text-gray-900">Keyword rank tracking</div>
                  <div className="text-[13px] text-gray-500 mt-0.5">Track positions for a keyword set across locations.</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-[13px] font-semibold text-gray-500 flex items-center justify-end gap-1"><ArrowPathIcon className="w-3.5 h-3.5" /> Daily · 08:00 UTC</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">Last run · 6h ago</div>
                </div>
                <div className="w-9 h-5 bg-[#d92d78] rounded-full relative cursor-pointer shadow-inner">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Task 5: Backlink monitoring */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 border border-pink-100">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-[14px] text-gray-900">Backlink monitoring</div>
                  <div className="text-[13px] text-gray-500 mt-0.5">New/lost referring domains, anchor-text shifts.</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-[13px] font-semibold text-gray-500 flex items-center justify-end gap-1"><ArrowPathIcon className="w-3.5 h-3.5" /> Weekly · Fri 09:00</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">Last run · 4d ago</div>
                </div>
                <div className="w-9 h-5 bg-[#d92d78] rounded-full relative cursor-pointer shadow-inner">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Task 6: Content gap analysis (OFF) */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-200">
                  <SparklesIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-[14px] text-gray-900">Content gap analysis</div>
                  <div className="text-[13px] text-gray-500 mt-0.5">Find keywords competitors rank for and you don't.</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right text-gray-300">
                  <div className="text-[13px] font-semibold flex items-center justify-end gap-1"><ArrowPathIcon className="w-3.5 h-3.5" /> Monthly · 1st</div>
                  <div className="text-[11px] mt-0.5">Last run · never</div>
                </div>
                <div className="w-9 h-5 bg-white border border-gray-300 rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-gray-300 rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Task 7: Broken-link scan */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 border border-pink-100">
                  <ShieldExclamationIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-[14px] text-gray-900">Broken-link scan</div>
                  <div className="text-[13px] text-gray-500 mt-0.5">4xx/5xx internal links and external dead-ends.</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-[13px] font-semibold text-gray-500 flex items-center justify-end gap-1"><ArrowPathIcon className="w-3.5 h-3.5" /> Weekly · Wed 02:00</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">Last run · 1d ago</div>
                </div>
                <div className="w-9 h-5 bg-[#d92d78] rounded-full relative cursor-pointer shadow-inner">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-gray-400" />
              </div>
            </div>
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
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 min-h-full max-w-full overflow-hidden">
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-6 font-medium">
                <span className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded text-gray-700">v3 • draft</span>
                <span>Generated 9:43 • 1,420 words</span>
              </div>

              <div className="text-2xl font-bold text-gray-900 mb-4 tracking-tight leading-snug">Content gap analysis — Project management space</div>
              <p className="text-sm text-gray-600 mb-8 leading-relaxed">
                affooh.com vs monday.com, asana.com, clickup.com. SERP data pulled May 13, 2026 from US desktop, top 20.
              </p>

              <div className="mb-6">
                <div className="text-xs font-bold text-gray-500 tracking-wider mb-2 uppercase">Summary</div>
                <p className="text-sm text-gray-800 leading-relaxed">
                  We found <strong className="font-semibold text-gray-900">47 high-value keyword gaps across 6 thematic clusters</strong> where all three competitors rank in the top 10 and affooh does not appear in the top 50. Combined monthly search volume is <strong className="font-semibold text-gray-900">158k</strong>.
                </p>
              </div>

              <div className="mb-6">
                <div className="text-xs font-bold text-gray-500 tracking-wider mb-3 uppercase">Top Clusters</div>
                <ol className="list-decimal pl-4 space-y-2.5 text-sm text-gray-800 marker:text-gray-500">
                  <li><strong className="font-semibold text-gray-900">Async standups</strong> — 8,400 mo. • 12 keywords • all 3 competitors rank</li>
                  <li><strong className="font-semibold text-gray-900">Sprint planning templates</strong> — 14,200 mo. • 9 keywords</li>
                  <li><strong className="font-semibold text-gray-900">RICE prioritisation</strong> — 6,100 mo. • 7 keywords</li>
                  <li><strong className="font-semibold text-gray-900">OKR examples</strong> — 22,400 mo. • 11 keywords</li>
                  <li><strong className="font-semibold text-gray-900">Roadmap visualisation</strong> — 4,800 mo. • 4 keywords</li>
                </ol>
              </div>

              <div>
                <div className="text-xs font-bold text-gray-500 tracking-wider mb-3 uppercase">Recommended Next Steps</div>
                <p className="text-sm text-gray-800 leading-relaxed">
                  Start with the <em className="bg-gray-100 px-1 py-0.5 rounded text-sm not-italic border border-gray-200">async standups</em> cluster — lowest difficulty (KD 28) and highest topical authority overlap with existing affooh content. Draft brief is queued for the Content Writer agent.
                </p>
              </div>
            </div>
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
              {files.map((file, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between group hover:border-pink-300 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-[10px] font-bold border ${
                      file.type === 'PDF' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      file.type === 'CSV' ? 'bg-green-50 text-green-600 border-green-100' :
                      file.type === 'MD' ? 'bg-pink-50 text-pink-600 border-pink-100' :
                      'bg-orange-50 text-orange-600 border-orange-100'
                    }`}>
                      {file.type}
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-gray-900 group-hover:text-[#d92d78] transition-colors">{file.name}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5 font-medium">{file.category} · {file.size}</div>
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                    <ArrowDownTrayIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
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
    </div>
  );
};

export default AgentsLayout;
