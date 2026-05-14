import React, { useState } from 'react';
import { 
  XMarkIcon,
  SparklesIcon,
  ViewColumnsIcon,
  Square2StackIcon,
  CommandLineIcon,
  BoltIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import { PlayIcon } from '@heroicons/react/24/solid';

const Toggle = ({ checked, onChange }) => (
  <div 
    onClick={(e) => {
      e.stopPropagation();
      onChange && onChange(!checked);
    }}
    className={`w-[40px] h-[22px] rounded-full relative shadow-inner transition-colors cursor-pointer ${checked ? 'bg-[#d92d78]' : 'bg-gray-200'}`}
  >
    <div className={`w-[18px] h-[18px] bg-white rounded-full absolute top-[2px] shadow-sm transition-all ${checked ? 'left-[20px]' : 'left-[2px]'}`}></div>
  </div>
);

const NewAgentModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('identity');
  const [selectedModel, setSelectedModel] = useState('GPT-4o');
  
  // Model settings
  const [temperature, setTemperature] = useState(0.4);
  const [topP, setTopP] = useState(0.9);
  
  // RAG settings
  const [ragSources, setRagSources] = useState([
    { id: 1, name: 'seo-playbook.notion', meta: 'Notion · 12 docs · synced 2m ago', checked: true },
    { id: 2, name: 'pm-keywords.csv', meta: 'CSV · 2,432 rows · 412 KB', checked: true },
    { id: 3, name: 'brand-voice.md', meta: 'Markdown · 8 KB · pinned', checked: true },
    { id: 4, name: 'competitor-pages-2026.zip', meta: 'Web crawl · 1,204 pages · 38 MB', checked: true },
    { id: 5, name: 'gsc-export-2026q1.csv', meta: 'GSC · 8,012 rows · synced daily', checked: false },
  ]);
  const [embeddingModel, setEmbeddingModel] = useState('text-embedding-3-large');

  // Tools settings
  const [toolsState, setToolsState] = useState([
    {
      category: 'SEARCH & SEO',
      items: [
        { id: 'serp', name: 'serp_api', desc: 'Google SERP scraping', secret: '•••••••• 9f3a', checked: true },
        { id: 'ahrefs', name: 'ahrefs_export', desc: 'Backlinks & keyword data', secret: '•••••••• a012', checked: true },
        { id: 'gsc', name: 'google_search_console', desc: 'Site queries & impressions', secret: 'OAuth · sarah@', checked: true },
        { id: 'screaming', name: 'screaming_frog_cli', desc: 'Technical site crawl', secret: 'Not connected', checked: false },
      ]
    },
    {
      category: 'WRITING & WEB',
      items: [
        { id: 'web_fetch', name: 'web_fetch', desc: 'Read public URLs', secret: '-', checked: true },
        { id: 'grammar', name: 'grammar_api', desc: 'Style + grammar pass', secret: 'Not connected', checked: false },
      ]
    },
    {
      category: 'WORKSPACE',
      items: [
        { id: 'linear', name: 'linear_api', desc: 'Push tasks to Linear', secret: '•••••••• 84cd', checked: true },
      ]
    }
  ]);

  // Memory settings
  const [memoryMode, setMemoryMode] = useState('Session');
  
  // Output settings
  const [outputFormat, setOutputFormat] = useState('Markdown');
  const [citations, setCitations] = useState('Inline footnotes');
  const [exportDestinations, setExportDestinations] = useState([
    { id: 1, name: 'Notion → SEO/Reports', checked: true },
    { id: 2, name: 'Google Drive → /seo', checked: false },
    { id: 3, name: 'Email digest · weekly', checked: true },
  ]);

  // Guardrails settings
  const [riskProfile, setRiskProfile] = useState('Standard');
  const [policies, setPolicies] = useState([
    { id: 1, label: 'Allow autonomous tool calls', checked: true },
    { id: 2, label: 'Require approval for writes', checked: true },
    { id: 3, label: 'Mask PII in logs', checked: true },
    { id: 4, label: 'Block external email sending', checked: false },
    { id: 5, label: 'Allow code execution', checked: false },
    { id: 6, label: 'Stay on registered domains only', checked: true }
  ]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'identity', label: 'Identity', icon: SparklesIcon },
    { id: 'model', label: 'Model', icon: ViewColumnsIcon },
    { id: 'rag', label: 'RAG sources', icon: Square2StackIcon },
    { id: 'tools', label: 'Tools & APIs', icon: CommandLineIcon },
    { id: 'memory', label: 'Memory', icon: BoltIcon },
    { id: 'output', label: 'Output format', icon: DocumentTextIcon },
    { id: 'guardrails', label: 'Guardrails', icon: ShieldCheckIcon }
  ];

  const models = [
    { provider: 'OPENAI', name: 'GPT-4o', desc: 'Balanced reasoning, broad tool use.', badge: 'Recommended' },
    { provider: 'OPENAI', name: 'GPT-4o-mini', desc: '10x cheaper. Good for routing & summarisation.', badge: 'Fast' },
    { provider: 'ANTHROPIC', name: 'Claude Sonnet 4.5', desc: 'Strong long-form drafts.', badge: 'Long context' },
    { provider: 'ANTHROPIC', name: 'Claude Haiku 4.5', desc: 'Snappy. Good for QA & validation.', badge: 'Fast' },
    { provider: 'LOCAL', name: 'Llama 3.1 70B', desc: 'Your hardware, your data.', badge: 'On-prem' },
    { provider: 'GOOGLE', name: 'Gemini 1.5 Pro', desc: 'Strong code & math.', badge: '' },
  ];

  const facts = [
    { key: 'brand_voice', value: 'confident, plain English, no jargon' },
    { key: 'geo_targets', value: 'US, UK, AU' },
    { key: 'tone_avoid', value: 'superlatives, exclamation marks' },
  ];

  const toggleRagSource = (id) => {
    setRagSources(prev => prev.map(s => s.id === id ? { ...s, checked: !s.checked } : s));
  };

  const toggleTool = (id) => {
    setToolsState(prev => prev.map(cat => ({
      ...cat,
      items: cat.items.map(t => t.id === id ? { ...t, checked: !t.checked } : t)
    })));
  };

  const toggleExport = (id) => {
    setExportDestinations(prev => prev.map(d => d.id === id ? { ...d, checked: !d.checked } : d));
  };

  const togglePolicy = (id) => {
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, checked: !p.checked } : p));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-[960px] h-[650px] max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ffe6f0] border border-[#ffcce0]"></div>
            <div>
              <div className="text-[15px] font-bold text-gray-900 leading-tight">New agent</div>
              <div className="text-[12px] text-gray-500 mt-0.5">Spin up a new specialist for your workspace.</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 border border-gray-200 hover:bg-gray-50 rounded-lg text-gray-500 transition-colors">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-[200px] bg-[#fbfbfc] border-r border-gray-100 flex flex-col p-3 space-y-0.5 shrink-0">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${activeTab === tab.id ? 'bg-white text-gray-800 font-medium shadow-sm border border-gray-200' : 'text-gray-600 hover:bg-gray-100 border border-transparent'}`}
                >
                  <Icon className="w-4 h-4" /> {tab.label}
                </button>
              )
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-white">
            {activeTab === 'identity' && (
              <div className="max-w-[700px]">
                <div className="mb-5">
                  <div className="text-[18px] font-bold text-gray-900 mb-1">Identity</div>
                  <p className="text-[13px] text-gray-500">A clear persona makes the agent's outputs more consistent and steerable.</p>
                </div>

                <div className="flex gap-6 mb-5">
                  <div className="flex-1">
                    <label className="block text-[13px] font-bold text-gray-800 mb-2">Display name</label>
                    <input type="text" placeholder="e.g. SEO Specialist" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:border-[#d92d78] focus:ring-1 focus:ring-[#d92d78]" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[13px] font-bold text-gray-800 mb-2">Short code <span className="text-gray-400 font-medium">· shown in avatars</span></label>
                    <input type="text" placeholder="SEO" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:border-[#d92d78] focus:ring-1 focus:ring-[#d92d78]" />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-[13px] font-bold text-gray-800 mb-2">Accent color</label>
                  <div className="flex gap-3">
                    {['#e65c69', '#df6c4f', '#d97d26', '#31a651', '#0ca7a6', '#0ea5e9', '#3e82f7', '#7c59e6', '#c451b6'].map((color, i) => (
                      <div key={i} className={`w-[34px] h-[34px] rounded-lg cursor-pointer flex items-center justify-center ${i === 0 ? 'ring-2 ring-gray-200 ring-offset-2' : ''}`}>
                        <div className="w-full h-full rounded-md border border-black/10" style={{ backgroundColor: color }}></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-[13px] font-bold text-gray-800 mb-2">System prompt <span className="text-gray-400 font-medium">· markdown supported</span></label>
                  <textarea rows="5" placeholder="You are a senior..." className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] font-mono focus:outline-none focus:border-[#d92d78] focus:ring-1 focus:ring-[#d92d78] resize-y"></textarea>
                </div>

                <div className="mb-2">
                  <label className="block text-[13px] font-bold text-gray-800 mb-2">Description <span className="text-gray-400 font-medium">· shown to teammates</span></label>
                  <input type="text" placeholder="What does this agent do best?" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:border-[#d92d78] focus:ring-1 focus:ring-[#d92d78]" />
                </div>
              </div>
            )}

            {activeTab === 'model' && (
              <div className="max-w-[700px]">
                <div className="mb-4">
                  <div className="text-[18px] font-bold text-gray-900 mb-0.5">Model</div>
                  <p className="text-[13px] text-gray-500">Pick the LLM, then tune sampling and limits.</p>
                </div>

                <div className="mb-4">
                  <label className="block text-[13px] font-bold text-gray-800 mb-1.5">Provider & model</label>
                  <div className="grid grid-cols-2 gap-2">
                    {models.map((m, i) => (
                      <div 
                        key={i} 
                        onClick={() => setSelectedModel(m.name)}
                        className={`py-1.5 px-3 border rounded-xl cursor-pointer transition-colors ${selectedModel === m.name ? 'border-[#d92d78] bg-white ring-1 ring-[#d92d78]' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{m.provider}</span>
                          {m.badge && <span className="text-[9px] font-medium px-1.5 py-0 bg-gray-100 text-gray-600 rounded-md">{m.badge}</span>}
                        </div>
                        <div className="text-[13px] font-bold text-gray-900 mb-0">{m.name}</div>
                        <div className="text-[11px] text-gray-500 leading-tight">{m.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-6 mb-4">
                  <div className="flex-1">
                    <label className="block text-[13px] font-bold text-gray-800 mb-1 flex gap-1">
                      Temperature <span className="text-gray-500 font-medium">· {temperature}</span>
                    </label>
                    <input 
                      type="range" min="0" max="1" step="0.1" 
                      value={temperature} 
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full accent-[#d92d78]" 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[13px] font-bold text-gray-800 mb-1 flex gap-1">
                      Top-p <span className="text-gray-500 font-medium">· {topP}</span>
                    </label>
                    <input 
                      type="range" min="0" max="1" step="0.1" 
                      value={topP} 
                      onChange={(e) => setTopP(parseFloat(e.target.value))}
                      className="w-full accent-[#d92d78]" 
                    />
                  </div>
                </div>

                <div className="flex gap-6 mb-1">
                  <div className="flex-1">
                    <label className="block text-[13px] font-bold text-gray-800 mb-1.5">Max output tokens</label>
                    <input type="number" defaultValue="4096" className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:border-[#d92d78] focus:ring-1 focus:ring-[#d92d78]" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[13px] font-bold text-gray-800 mb-1.5">Timeout (s)</label>
                    <input type="number" defaultValue="60" className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:border-[#d92d78] focus:ring-1 focus:ring-[#d92d78]" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rag' && (
              <div className="max-w-[700px]">
                <div className="mb-3">
                  <div className="text-[18px] font-bold text-gray-900 mb-0.5">RAG sources</div>
                  <p className="text-[13px] text-gray-500">Documents and datasets this agent can retrieve from before answering.</p>
                </div>

                <div className="space-y-1 mb-3">
                  {ragSources.map((s, i) => (
                    <div 
                      key={i} 
                      onClick={() => toggleRagSource(s.id)}
                      className="flex items-center justify-between py-1.5 px-3 border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-gray-400">
                          <DocumentIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[13px] font-bold text-gray-900">{s.name}</div>
                          <div className="text-[11px] text-gray-500">{s.meta}</div>
                        </div>
                      </div>
                      <Toggle checked={s.checked} onChange={() => toggleRagSource(s.id)} />
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 bg-white rounded-lg text-[12px] font-bold text-gray-800 shadow-sm hover:bg-gray-50 transition-colors mr-1">
                    + Connect source
                  </button>
                  {['Notion', 'Google Drive', 'Confluence', 'Web URL', 'Upload', 'S3'].map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[11px] font-medium rounded-full">{tag}</span>
                  ))}
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-gray-800 mb-1.5">Embedding model</label>
                  <div className="flex flex-wrap gap-2">
                    {['text-embedding-3-large', 'text-embedding-3-small', 'voyage-3'].map(m => (
                      <button 
                        key={m}
                        onClick={() => setEmbeddingModel(m)}
                        className={`px-3 py-1 text-[12px] font-bold rounded-lg transition-colors ${embeddingModel === m ? 'bg-[#1f2937] text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tools' && (
              <div className="max-w-[700px]">
                <div className="mb-3">
                  <div className="text-[18px] font-bold text-gray-900 mb-0.5">Tools & APIs</div>
                  <p className="text-[13px] text-gray-500">Functions the agent may call autonomously. Each call is logged.</p>
                </div>

                {toolsState.map((category, i) => (
                  <div key={i} className="mb-4 last:mb-0">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{category.category}</div>
                    <div className="space-y-1">
                      {category.items.map((t, j) => (
                        <div 
                          key={j} 
                          onClick={() => toggleTool(t.id)}
                          className="flex items-center justify-between py-1.5 px-3 border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-gray-400">
                              <BoltIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-[13px] font-bold text-gray-900">{t.name}</div>
                              <div className="text-[11px] text-gray-500">{t.desc}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-mono ${t.checked ? 'text-gray-500' : 'text-gray-400'}`}>{t.secret}</span>
                            <Toggle checked={t.checked} onChange={() => toggleTool(t.id)} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'memory' && (
              <div className="max-w-[700px]">
                <div className="mb-4">
                  <div className="text-[18px] font-bold text-gray-900 mb-0.5">Memory</div>
                  <p className="text-[13px] text-gray-500">How much the agent remembers between turns and threads.</p>
                </div>

                <div className="mb-5">
                  <label className="block text-[13px] font-bold text-gray-800 mb-2">Memory mode</label>
                  <div className="inline-flex bg-gray-100 p-1 rounded-lg">
                    {['Session', 'Persistent', 'Off'].map(mode => (
                      <button 
                        key={mode}
                        onClick={() => setMemoryMode(mode)}
                        className={`px-5 py-1.5 text-[12px] font-bold rounded-md transition-all ${memoryMode === mode ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:bg-gray-200'}`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-8 mb-6">
                  <div className="flex-[2]">
                    <label className="block text-[13px] font-bold text-gray-800 mb-2 flex gap-1">
                      Context window <span className="text-gray-500 font-medium">· messages</span>
                    </label>
                    <div className="pt-1">
                      <input type="range" min="0" max="100" defaultValue="40" className="w-full accent-[#d92d78]" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-[13px] font-bold text-gray-800 mb-1.5 flex gap-1">
                      Summarise after <span className="text-gray-500 font-medium">· 32 turns</span>
                    </label>
                    <input type="text" defaultValue="32" className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:border-[#d92d78] focus:ring-1 focus:ring-[#d92d78]" />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-gray-800 mb-3 flex gap-1">
                    Pinned facts <span className="text-gray-500 font-medium">· always in context</span>
                  </label>
                  <div className="space-y-2 mb-3">
                    {facts.map((f, i) => (
                      <div key={i} className="flex gap-2 text-[12px] pb-2 border-b border-gray-100 border-dashed last:border-0 last:pb-0">
                        <span className="font-mono text-gray-700">{f.key}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-gray-500">{f.value}</span>
                      </div>
                    ))}
                  </div>
                  <button className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-[12px] font-medium text-gray-600 transition-colors border border-gray-200 flex items-center gap-2">
                    + Pin a fact
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'output' && (
              <div className="max-w-[700px]">
                <div className="mb-4">
                  <div className="text-[18px] font-bold text-gray-900 mb-0.5">Output format</div>
                  <p className="text-[13px] text-gray-500">Default shape of artifacts in the output panel.</p>
                </div>

                <div className="mb-4">
                  <label className="block text-[13px] font-bold text-gray-800 mb-2">Default format</label>
                  <div className="flex flex-wrap gap-2">
                    {['Markdown', 'JSON', 'Plain text', 'HTML'].map(f => (
                      <button 
                        key={f}
                        onClick={() => setOutputFormat(f)}
                        className={`px-4 py-1.5 text-[12px] font-bold rounded-lg transition-colors ${outputFormat === f ? 'bg-[#1f2937] text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-[13px] font-bold text-gray-800 mb-2">Citations</label>
                  <div className="inline-flex bg-gray-100 p-1 rounded-lg">
                    {['Inline footnotes', 'End notes', 'Off'].map(c => (
                      <button 
                        key={c}
                        onClick={() => setCitations(c)}
                        className={`px-4 py-1.5 text-[12px] font-bold rounded-md transition-all ${citations === c ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:bg-gray-200'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-gray-800 mb-2">Auto-export to</label>
                  <div className="space-y-2">
                    {exportDestinations.map((d, i) => (
                      <div 
                        key={i} 
                        onClick={() => toggleExport(d.id)}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-gray-400">
                            <DocumentIcon className="w-5 h-5" />
                          </div>
                          <div className="text-[13px] font-medium text-gray-700">{d.name}</div>
                        </div>
                        <Toggle checked={d.checked} onChange={() => toggleExport(d.id)} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'guardrails' && (
              <div className="max-w-[700px]">
                <div className="mb-4">
                  <div className="text-[18px] font-bold text-gray-900 mb-0.5">Guardrails</div>
                  <p className="text-[13px] text-gray-500">Establish boundaries and security policies for this agent.</p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-[13px] font-bold text-gray-800 mb-2">Risk profile</label>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    {['Strict', 'Standard', 'Permissive'].map(p => (
                      <button 
                        key={p}
                        onClick={() => setRiskProfile(p)}
                        className={`flex-1 py-1.5 text-[12px] font-bold rounded-md transition-all ${riskProfile === p ? 'bg-white shadow-sm text-gray-900 font-bold' : 'text-gray-600 hover:bg-gray-200 font-medium'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-[13px] font-bold text-gray-800 mb-3">Security policies</label>
                  <div className="space-y-2">
                    {policies.map((policy, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-[13px] text-gray-800 font-medium">{policy.label}</span>
                        <Toggle checked={policy.checked} onChange={() => togglePolicy(policy.id)} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <label className="block text-[13px] font-bold text-gray-800 mb-2 flex justify-between items-end">
                    <span>Daily token budget</span>
                    <span className="text-gray-500 font-normal">50,000</span>
                  </label>
                  <input type="range" min="1000" max="100000" defaultValue="50000" className="w-full accent-[#d92d78]" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-[#fbfbfc] flex items-center justify-between shrink-0">
          <button onClick={onClose} className="text-[13px] font-medium text-[#0f172a] hover:text-[#d92d78] transition-colors">
            Cancel
          </button>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 text-[13px] font-bold text-[#0f172a] hover:text-[#d92d78] transition-colors">
              <PlayIcon className="w-3.5 h-3.5" /> Test run
            </button>
            <button className="px-5 py-2 text-[13px] font-bold text-white bg-[#d92d78] hover:bg-[#c2185b] rounded-lg shadow-sm transition-colors">
              Create agent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewAgentModal;
