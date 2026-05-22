import React, { useState, useEffect, useCallback } from 'react';
import {
  XMarkIcon,
  SparklesIcon,
  ViewColumnsIcon,
  Square2StackIcon,
  CommandLineIcon,
  BoltIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  DocumentIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { PlayIcon } from '@heroicons/react/24/solid';
import {
  getModelConfig,
  saveModelConfig,
  testModelConfig,
  getCredentials,
  saveCredential,
  testCredential,
  deleteCredential,
  getGSCAuthURL,
  disconnectGSC,
} from './agentApi';

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

// ─── Model Tab ───────────────────────────────────────────────────────────────

const PROVIDER_MODELS = [
  { provider: 'OPENAI', name: 'GPT-4o', modelId: 'gpt-4o', desc: 'Balanced reasoning, broad tool use.', badge: 'Recommended' },
  { provider: 'OPENAI', name: 'GPT-4o-mini', modelId: 'gpt-4o-mini', desc: '10x cheaper. Good for routing & summarisation.', badge: 'Fast' },
  { provider: 'ANTHROPIC', name: 'Claude Sonnet 4.5', modelId: 'claude-sonnet-4-5', desc: 'Strong long-form drafts.', badge: 'Long context' },
  { provider: 'ANTHROPIC', name: 'Claude Haiku 4.5', modelId: 'claude-haiku-4-5-20251001', desc: 'Snappy. Good for QA & validation.', badge: 'Fast' },
  { provider: 'LOCAL', name: 'Local / Ollama', modelId: '', desc: 'Your hardware, your data.', badge: 'On-prem' },
  { provider: 'GOOGLE', name: 'Gemini 1.5 Pro', modelId: 'gemini-1.5-pro', desc: 'Strong code & math.', badge: '' },
];

const ModelTab = ({ agentType }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [selectedCard, setSelectedCard] = useState(null); // PROVIDER_MODELS index
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [baseURL, setBaseURL] = useState('');
  const [customModelId, setCustomModelId] = useState('');
  const [temperature, setTemperature] = useState(0.4);
  const [topP, setTopP] = useState(0.9);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [timeoutSecs, setTimeoutSecs] = useState(60);

  const [isConfigured, setIsConfigured] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [testResult, setTestResult] = useState(null); // { ok, message }
  const [saveResult, setSaveResult] = useState(null);
  const [error, setError] = useState(null);

  const selectedModel = selectedCard !== null ? PROVIDER_MODELS[selectedCard] : null;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cfg = await getModelConfig(agentType);
      if (cfg && cfg.aiProvider) {
        const idx = PROVIDER_MODELS.findIndex(
          (m) => m.provider === cfg.aiProvider && (m.modelId === cfg.modelID || m.provider === 'LOCAL')
        );
        setSelectedCard(idx >= 0 ? idx : null);
        setCustomModelId(cfg.modelID || '');
        setBaseURL(cfg.baseURL || '');
        setTemperature(parseFloat(cfg.temperature) || 0.4);
        setTopP(parseFloat(cfg.topP) || 0.9);
        setMaxTokens(cfg.maxTokens || 4096);
        setTimeoutSecs(cfg.timeoutSeconds || 60);
        setIsConfigured(!!cfg.isConfigured);
        setHasApiKey(!!cfg.hasApiKey);
      }
    } catch (e) {
      const status = e?.response?.status;
      if (!status || status >= 500) setError('Failed to load model config. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [agentType]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!selectedModel) return;
    setSaving(true);
    setSaveResult(null);
    setTestResult(null);
    try {
      const payload = {
        aiProvider: selectedModel.provider,
        modelID: selectedModel.provider === 'LOCAL' ? customModelId : selectedModel.modelId,
        temperature,
        topP,
        maxTokens,
        timeoutSeconds: timeoutSecs,
        ...(selectedModel.provider === 'LOCAL' ? { baseURL } : {}),
        ...(apiKey ? { apiKey } : {}),
      };
      await saveModelConfig(agentType, payload);
      setHasApiKey(hasApiKey || !!apiKey);
      setApiKey('');
      setSaveResult({ ok: true, message: 'Saved. Click "Test connection" to activate.' });
      setIsConfigured(false);
    } catch (e) {
      setSaveResult({ ok: false, message: e?.response?.data?.error || 'Save failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testModelConfig(agentType);
      if (result.connected) {
        setIsConfigured(true);
        setTestResult({ ok: true, message: `Connected${result.response ? ` · "${result.response.trim()}"` : ''}` });
      } else {
        setIsConfigured(false);
        setTestResult({ ok: false, message: result.error || 'Connection failed.' });
      }
    } catch (e) {
      setTestResult({ ok: false, message: 'Connection test failed.' });
    } finally {
      setTesting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Remove AI model configuration?')) return;
    setDeleting(true);
    try {
      await deleteModelConfig(agentType);
      setSelectedCard(null);
      setApiKey('');
      setBaseURL('');
      setCustomModelId('');
      setIsConfigured(false);
      setHasApiKey(false);
      setTestResult(null);
      setSaveResult(null);
    } catch (e) {
      setSaveResult({ ok: false, message: 'Delete failed.' });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-[13px]">
        <ArrowPathIcon className="w-4 h-4 animate-spin mr-2" /> Loading…
      </div>
    );
  }

  return (
    <div className="max-w-[700px]">
      <div className="mb-4">
        <div className="text-[18px] font-bold text-gray-900 mb-0.5">Model</div>
        <p className="text-[13px] text-gray-500">Pick the LLM and supply your API key. Settings are saved per agent type.</p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          <ExclamationCircleIcon className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Status badge */}
      {selectedCard !== null && (
        <div className={`mb-4 flex items-center gap-2 text-[12px] font-medium px-3 py-1.5 rounded-lg border w-fit ${isConfigured ? 'bg-green-50 border-green-200 text-green-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
          {isConfigured
            ? <><CheckCircleIcon className="w-3.5 h-3.5" /> Connected & active</>
            : <><ExclamationCircleIcon className="w-3.5 h-3.5" /> Not yet tested — run a connection test to activate</>
          }
        </div>
      )}

      {/* Provider & model cards */}
      <div className="mb-4">
        <label className="block text-[13px] font-bold text-gray-800 mb-1.5">Provider & model</label>
        <div className="grid grid-cols-2 gap-2">
          {PROVIDER_MODELS.map((m, i) => (
            <div
              key={i}
              onClick={() => { setSelectedCard(i); setTestResult(null); setSaveResult(null); }}
              className={`py-1.5 px-3 border rounded-xl cursor-pointer transition-colors ${selectedCard === i ? 'border-[#d92d78] bg-white ring-1 ring-[#d92d78]' : 'border-gray-200 bg-white hover:border-gray-300'}`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{m.provider}</span>
                {m.badge && <span className="text-[9px] font-medium px-1.5 py-0 bg-gray-100 text-gray-600 rounded-md">{m.badge}</span>}
              </div>
              <div className="text-[13px] font-bold text-gray-900">{m.name}</div>
              <div className="text-[11px] text-gray-500 leading-tight">{m.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Credentials section — shown when a card is selected */}
      {selectedModel && (
        <div className="mb-4 p-4 border border-gray-200 rounded-xl bg-gray-50 space-y-3">
          <div className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">
            {selectedModel.provider === 'LOCAL' ? 'Local model settings' : 'API credentials'}
          </div>

          {selectedModel.provider === 'LOCAL' ? (
            <>
              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-1">Ollama base URL</label>
                <input
                  type="text"
                  placeholder="http://localhost:11434"
                  value={baseURL}
                  onChange={(e) => setBaseURL(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:border-[#d92d78] focus:ring-1 focus:ring-[#d92d78]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-gray-700 mb-1">Model name</label>
                <input
                  type="text"
                  placeholder="llama3.1:70b"
                  value={customModelId}
                  onChange={(e) => setCustomModelId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:border-[#d92d78] focus:ring-1 focus:ring-[#d92d78]"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-[12px] font-bold text-gray-700 mb-1">
                API key
                {hasApiKey && !apiKey && (
                  <span className="ml-2 text-[10px] font-medium text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-md">key saved</span>
                )}
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  placeholder={hasApiKey ? '•••••••••••••• (leave blank to keep existing)' : 'sk-…'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-1.5 pr-9 bg-white border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:border-[#d92d78] focus:ring-1 focus:ring-[#d92d78] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showKey ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sampling params */}
      <div className="flex gap-6 mb-4">
        <div className="flex-1">
          <label className="block text-[13px] font-bold text-gray-800 mb-1 flex gap-1">
            Temperature <span className="text-gray-500 font-medium">· {temperature}</span>
          </label>
          <input type="range" min="0" max="1" step="0.1" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} className="w-full accent-[#d92d78]" />
        </div>
        <div className="flex-1">
          <label className="block text-[13px] font-bold text-gray-800 mb-1 flex gap-1">
            Top-p <span className="text-gray-500 font-medium">· {topP}</span>
          </label>
          <input type="range" min="0" max="1" step="0.1" value={topP} onChange={(e) => setTopP(parseFloat(e.target.value))} className="w-full accent-[#d92d78]" />
        </div>
      </div>

      <div className="flex gap-6 mb-5">
        <div className="flex-1">
          <label className="block text-[13px] font-bold text-gray-800 mb-1.5">Max output tokens</label>
          <input type="number" value={maxTokens} onChange={(e) => setMaxTokens(parseInt(e.target.value) || 4096)} className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:border-[#d92d78] focus:ring-1 focus:ring-[#d92d78]" />
        </div>
        <div className="flex-1">
          <label className="block text-[13px] font-bold text-gray-800 mb-1.5">Timeout (s)</label>
          <input type="number" value={timeoutSecs} onChange={(e) => setTimeoutSecs(parseInt(e.target.value) || 60)} className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:border-[#d92d78] focus:ring-1 focus:ring-[#d92d78]" />
        </div>
      </div>

      {/* Feedback messages */}
      {saveResult && (
        <div className={`mb-3 flex items-center gap-2 text-[12px] px-3 py-2 rounded-lg border ${saveResult.ok ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-100 text-red-600'}`}>
          {saveResult.ok ? <CheckCircleIcon className="w-4 h-4 shrink-0" /> : <ExclamationCircleIcon className="w-4 h-4 shrink-0" />}
          {saveResult.message}
        </div>
      )}
      {testResult && (
        <div className={`mb-3 flex items-center gap-2 text-[12px] px-3 py-2 rounded-lg border ${testResult.ok ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-100 text-red-600'}`}>
          {testResult.ok ? <CheckCircleIcon className="w-4 h-4 shrink-0" /> : <ExclamationCircleIcon className="w-4 h-4 shrink-0" />}
          {testResult.message}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving || !selectedModel}
            className="px-4 py-2 text-[13px] font-bold text-white bg-[#d92d78] hover:bg-[#c2185b] rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {saving && <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />}
            Save
          </button>
          <button
            onClick={handleTest}
            disabled={testing || !selectedModel}
            className="px-4 py-2 text-[13px] font-bold text-gray-800 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {testing ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <PlayIcon className="w-3.5 h-3.5" />}
            Test connection
          </button>
        </div>
        {isConfigured && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-[12px] text-red-500 hover:text-red-700 font-medium transition-colors disabled:opacity-50"
          >
            {deleting ? 'Removing…' : 'Remove config'}
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Tools & APIs Tab ────────────────────────────────────────────────────────

const ProviderRow = ({ provider, label, description, type, status, onSave, onTest, onDelete, onConnect, onDisconnect, testDisabled }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSave = async () => {
    if (!apiKey) return;
    setSaving(true);
    setFeedback(null);
    try {
      await onSave(apiKey);
      setApiKey('');
      setFeedback({ ok: true, message: 'Saved' });
    } catch (e) {
      setFeedback({ ok: false, message: e?.response?.data?.error || 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setFeedback(null);
    try {
      const result = await onTest();
      setFeedback({ ok: result.connected, message: result.connected ? 'Connected' : (result.error || 'Connection failed') });
    } catch (e) {
      setFeedback({ ok: false, message: 'Test failed' });
    } finally {
      setTesting(false);
    }
  };

  const isConnected = status === 'connected';

  if (type === 'oauth') {
    return (
      <div className="border border-gray-200 rounded-xl bg-white p-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-gray-400"><BoltIcon className="w-4 h-4" /></div>
            <div>
              <div className="text-[13px] font-bold text-gray-900">{label}</div>
              <div className="text-[11px] text-gray-500">{description}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <span className="text-[11px] text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                  <CheckCircleIcon className="w-3 h-3" /> Connected
                </span>
                <button
                  onClick={onDisconnect}
                  className="text-[12px] text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded transition-colors"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={onConnect}
                className="px-3 py-1.5 text-[12px] font-bold text-white bg-[#d92d78] hover:bg-[#c2185b] rounded-lg transition-colors"
              >
                Connect with Google
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'no-key') {
    return (
      <div className="border border-gray-200 rounded-xl bg-white p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-gray-400"><BoltIcon className="w-4 h-4" /></div>
          <div>
            <div className="text-[13px] font-bold text-gray-900">{label}</div>
            <div className="text-[11px] text-gray-500">{description}</div>
          </div>
        </div>
        <span className="text-[11px] text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md font-medium">No key required</span>
      </div>
    );
  }

  // type === 'apikey'
  return (
    <div className="border border-gray-200 rounded-xl bg-white p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-gray-400"><BoltIcon className="w-4 h-4" /></div>
          <div>
            <div className="text-[13px] font-bold text-gray-900">{label}</div>
            <div className="text-[11px] text-gray-500">{description}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isConnected && (
            <span className="text-[11px] text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
              <CheckCircleIcon className="w-3 h-3" /> Connected
            </span>
          )}
          {isConnected && (
            <button
              onClick={onDelete}
              className="text-[12px] text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type={showKey ? 'text' : 'password'}
            placeholder={isConnected ? '•••••••• (replace key)' : 'Enter API key…'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3 py-1.5 pr-9 bg-white border border-gray-200 rounded-lg text-[13px] font-mono focus:outline-none focus:border-[#d92d78] focus:ring-1 focus:ring-[#d92d78]"
          />
          <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showKey ? <EyeSlashIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
          </button>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !apiKey}
          className="px-3 py-1.5 text-[12px] font-bold text-white bg-gray-900 hover:bg-black rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
        >
          {saving && <ArrowPathIcon className="w-3 h-3 animate-spin" />}
          Save
        </button>
        {isConnected && (
          <button
            onClick={handleTest}
            disabled={testing || testDisabled}
            className="px-3 py-1.5 text-[12px] font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-40 flex items-center gap-1"
          >
            {testing ? <ArrowPathIcon className="w-3 h-3 animate-spin" /> : <PlayIcon className="w-3 h-3" />}
            Test
          </button>
        )}
      </div>

      {feedback && (
        <div className={`flex items-center gap-1.5 text-[11px] font-medium ${feedback.ok ? 'text-green-600' : 'text-red-600'}`}>
          {feedback.ok ? <CheckCircleIcon className="w-3.5 h-3.5" /> : <ExclamationCircleIcon className="w-3.5 h-3.5" />}
          {feedback.message}
        </div>
      )}
    </div>
  );
};

const ToolsTab = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creds, setCreds] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCredentials();
      const map = {};
      for (const c of data.credentials || []) {
        map[c.provider] = c;
      }
      setCreds(map);
    } catch (e) {
      const status = e?.response?.status;
      // 4xx = no credentials configured yet — show empty state, not an error
      if (!status || status >= 500) setError('Failed to load credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const gscStatus = creds['GSC']?.isConnected ? 'connected' : 'disconnected';
  const dfsStatus = creds['DATAFORSEO']?.isConnected ? 'connected' : 'disconnected';

  const handleGSCConnect = async () => {
    try {
      const { authUrl } = await getGSCAuthURL();
      window.location.href = authUrl;
    } catch (e) {
      console.error('GSC connect error', e);
    }
  };

  const handleGSCDisconnect = async () => {
    if (!window.confirm('Disconnect Google Search Console?')) return;
    try {
      await disconnectGSC();
      setCreds((prev) => ({ ...prev, GSC: { ...prev.GSC, isConnected: false } }));
    } catch (e) {
      console.error('GSC disconnect error', e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-[13px]">
        <ArrowPathIcon className="w-4 h-4 animate-spin mr-2" /> Loading…
      </div>
    );
  }

  return (
    <div className="max-w-[700px]">
      <div className="mb-4">
        <div className="text-[18px] font-bold text-gray-900 mb-0.5">Tools & APIs</div>
        <p className="text-[13px] text-gray-500">Connect data sources the SEO agent uses during each run.</p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          <ExclamationCircleIcon className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <div className="space-y-2">
        <ProviderRow
          provider="DATAFORSEO"
          label="DataForSEO"
          description="Site crawl, backlink data & SERP analysis"
          type="apikey"
          status={dfsStatus}
          onSave={(key) => saveCredential('dataforseo', { apiKey: key }).then(() => setCreds((p) => ({ ...p, DATAFORSEO: { isConnected: true } })))}
          onTest={() => testCredential('dataforseo')}
          onDelete={() => deleteCredential('dataforseo').then(() => setCreds((p) => ({ ...p, DATAFORSEO: { isConnected: false } })))}
        />

        <ProviderRow
          provider="GSC"
          label="Google Search Console"
          description="Site queries, impressions & click data"
          type="oauth"
          status={gscStatus}
          onConnect={handleGSCConnect}
          onDisconnect={handleGSCDisconnect}
        />

        <ProviderRow
          provider="PAGESPEED"
          label="Google PageSpeed Insights"
          description="Core Web Vitals — LCP, CLS, FID per page"
          type="no-key"
          status="connected"
        />
      </div>
    </div>
  );
};

// ─── Main Modal ──────────────────────────────────────────────────────────────

const ConfigureAgentModal = ({ isOpen, onClose, agent }) => {
  const [activeTab, setActiveTab] = useState('identity');

  const [temperature, setTemperature] = useState(0.4);
  const [topP, setTopP] = useState(0.9);

  const [ragSources, setRagSources] = useState([]);
  const [embeddingModel, setEmbeddingModel] = useState('text-embedding-3-large');

  const [memoryMode, setMemoryMode] = useState('Session');
  const [outputFormat, setOutputFormat] = useState('Markdown');
  const [citations, setCitations] = useState('Inline footnotes');
  const [exportDestinations, setExportDestinations] = useState([]);

  const [riskProfile, setRiskProfile] = useState('Standard');
  const [policies, setPolicies] = useState([
    { id: 1, label: 'Allow autonomous tool calls', checked: true },
    { id: 2, label: 'Require approval for writes', checked: true },
    { id: 3, label: 'Mask PII in logs', checked: true },
    { id: 4, label: 'Block external email sending', checked: false },
    { id: 5, label: 'Allow code execution', checked: false },
    { id: 6, label: 'Stay on registered domains only', checked: true },
  ]);

  const facts = [
    { key: 'brand_voice', value: 'confident, plain English, no jargon' },
    { key: 'geo_targets', value: 'US, UK, AU' },
    { key: 'tone_avoid', value: 'superlatives, exclamation marks' },
  ];

  if (!isOpen) return null;

  const agentType = agent?.agentType || 'SEO';

  const tabs = [
    { id: 'identity', label: 'Identity', icon: SparklesIcon },
    { id: 'model', label: 'Model', icon: ViewColumnsIcon },
    { id: 'rag', label: 'RAG sources', icon: Square2StackIcon },
    { id: 'tools', label: 'Tools & APIs', icon: CommandLineIcon },
    { id: 'memory', label: 'Memory', icon: BoltIcon },
    { id: 'output', label: 'Output format', icon: DocumentTextIcon },
    { id: 'guardrails', label: 'Guardrails', icon: ShieldCheckIcon },
  ];

  const toggleRagSource = (id) =>
    setRagSources((prev) => prev.map((s) => (s.id === id ? { ...s, checked: !s.checked } : s)));
  const toggleExport = (id) =>
    setExportDestinations((prev) => prev.map((d) => (d.id === id ? { ...d, checked: !d.checked } : d)));
  const togglePolicy = (id) =>
    setPolicies((prev) => prev.map((p) => (p.id === id ? { ...p, checked: !p.checked } : p)));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-[960px] h-[650px] max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold ${agent?.color || 'bg-orange-400 text-white'}`}>
              {agent?.init || 'SEO'}
            </div>
            <div>
              <div className="text-[15px] font-bold text-gray-900 leading-tight">Configure {agent?.name || 'Agent'}</div>
              <div className="text-[12px] text-gray-500 mt-0.5">Persona, runtime, knowledge and integrations.</div>
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
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${activeTab === tab.id ? 'bg-white text-gray-800 font-medium shadow-sm border border-gray-200' : 'text-gray-600 hover:bg-gray-100 border border-transparent'}`}
                >
                  <Icon className="w-4 h-4" /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-white">

            {/* ── Identity (unchanged) ── */}
            {activeTab === 'identity' && (
              <div className="max-w-[700px]">
                <div className="mb-5">
                  <div className="text-[18px] font-bold text-gray-900 mb-1">Identity</div>
                  <p className="text-[13px] text-gray-500">A clear persona makes the agent's outputs more consistent and steerable.</p>
                </div>
                <div className="flex gap-6 mb-5">
                  <div className="flex-1">
                    <label className="block text-[13px] font-bold text-gray-800 mb-2">Display name</label>
                    <input type="text" defaultValue={agent?.name || ''} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:border-[#d92d78] focus:ring-1 focus:ring-[#d92d78]" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[13px] font-bold text-gray-800 mb-2">Short code <span className="text-gray-400 font-medium">· shown in avatars</span></label>
                    <input type="text" defaultValue={agent?.init || ''} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:border-[#d92d78] focus:ring-1 focus:ring-[#d92d78]" />
                  </div>
                </div>
                <div className="mb-5">
                  <label className="block text-[13px] font-bold text-gray-800 mb-2">Accent color</label>
                  <div className="flex gap-3">
                    {['#e65c69', '#df6c4f', '#d97d26', '#31a651', '#0ca7a6', '#0ea5e9', '#3e82f7', '#7c59e6', '#c451b6'].map((color, i) => (
                      <div key={i} className={`w-[34px] h-[34px] rounded-lg cursor-pointer flex items-center justify-center ${i === 1 ? 'ring-2 ring-gray-200 ring-offset-2' : ''}`}>
                        <div className="w-full h-full rounded-md border border-black/10" style={{ backgroundColor: color }}></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mb-5">
                  <label className="block text-[13px] font-bold text-gray-800 mb-2">System prompt <span className="text-gray-400 font-medium">· markdown supported</span></label>
                  <textarea rows="5" defaultValue="Technical SEO strategist. Audits sites, identifies keyword gaps, drafts on-page recommendations and tracks SERP movement." className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] font-mono focus:outline-none focus:border-[#d92d78] focus:ring-1 focus:ring-[#d92d78] resize-y"></textarea>
                </div>
                <div className="mb-2">
                  <label className="block text-[13px] font-bold text-gray-800 mb-2">Description <span className="text-gray-400 font-medium">· shown to teammates</span></label>
                  <input type="text" defaultValue="Owns SEO strategy and execution for affooh.com." className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:border-[#d92d78] focus:ring-1 focus:ring-[#d92d78]" />
                </div>
              </div>
            )}

            {/* ── Model (LIVE) ── */}
            {activeTab === 'model' && <ModelTab agentType={agentType} />}

            {/* ── RAG sources (unchanged) ── */}
            {activeTab === 'rag' && (
              <div className="max-w-[700px]">
                <div className="mb-3">
                  <div className="text-[18px] font-bold text-gray-900 mb-0.5">RAG sources</div>
                  <p className="text-[13px] text-gray-500">Documents and datasets this agent can retrieve from before answering.</p>
                </div>
                {ragSources.length > 0 && (
                  <div className="space-y-1 mb-3">
                    {ragSources.map((s, i) => (
                      <div key={i} onClick={() => toggleRagSource(s.id)} className="flex items-center justify-between py-1.5 px-3 border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="text-gray-400"><DocumentIcon className="w-4 h-4" /></div>
                          <div>
                            <div className="text-[13px] font-bold text-gray-900">{s.name}</div>
                            <div className="text-[11px] text-gray-500">{s.meta}</div>
                          </div>
                        </div>
                        <Toggle checked={s.checked} onChange={() => toggleRagSource(s.id)} />
                      </div>
                    ))}
                  </div>
                )}
                {ragSources.length === 0 && (
                  <div className="mb-3 py-8 text-center text-[13px] text-gray-400 border border-dashed border-gray-200 rounded-xl">No RAG sources connected yet.</div>
                )}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 bg-white rounded-lg text-[12px] font-bold text-gray-800 shadow-sm hover:bg-gray-50 transition-colors mr-1">+ Connect source</button>
                  {['Notion', 'Google Drive', 'Confluence', 'Web URL', 'Upload', 'S3'].map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[11px] font-medium rounded-full">{tag}</span>
                  ))}
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-800 mb-1.5">Embedding model</label>
                  <div className="flex flex-wrap gap-2">
                    {['text-embedding-3-large', 'text-embedding-3-small', 'voyage-3'].map((m) => (
                      <button key={m} onClick={() => setEmbeddingModel(m)} className={`px-3 py-1 text-[12px] font-bold rounded-lg transition-colors ${embeddingModel === m ? 'bg-[#1f2937] text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{m}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Tools & APIs (LIVE) ── */}
            {activeTab === 'tools' && <ToolsTab />}

            {/* ── Memory (unchanged) ── */}
            {activeTab === 'memory' && (
              <div className="max-w-[700px]">
                <div className="mb-4">
                  <div className="text-[18px] font-bold text-gray-900 mb-0.5">Memory</div>
                  <p className="text-[13px] text-gray-500">How much the agent remembers between turns and threads.</p>
                </div>
                <div className="mb-5">
                  <label className="block text-[13px] font-bold text-gray-800 mb-2">Memory mode</label>
                  <div className="inline-flex bg-gray-100 p-1 rounded-lg">
                    {['Session', 'Persistent', 'Off'].map((mode) => (
                      <button key={mode} onClick={() => setMemoryMode(mode)} className={`px-5 py-1.5 text-[12px] font-bold rounded-md transition-all ${memoryMode === mode ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:bg-gray-200'}`}>{mode}</button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-8 mb-6">
                  <div className="flex-[2]">
                    <label className="block text-[13px] font-bold text-gray-800 mb-2 flex gap-1">Context window <span className="text-gray-500 font-medium">· messages</span></label>
                    <div className="pt-1"><input type="range" min="0" max="100" defaultValue="40" className="w-full accent-[#d92d78]" /></div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-[13px] font-bold text-gray-800 mb-1.5 flex gap-1">Summarise after <span className="text-gray-500 font-medium">· 32 turns</span></label>
                    <input type="text" defaultValue="32" className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:border-[#d92d78] focus:ring-1 focus:ring-[#d92d78]" />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-800 mb-3 flex gap-1">Pinned facts <span className="text-gray-500 font-medium">· always in context</span></label>
                  <div className="space-y-2 mb-3">
                    {facts.map((f, i) => (
                      <div key={i} className="flex gap-2 text-[12px] pb-2 border-b border-gray-100 border-dashed last:border-0 last:pb-0">
                        <span className="font-mono text-gray-700">{f.key}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-gray-500">{f.value}</span>
                      </div>
                    ))}
                  </div>
                  <button className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-[12px] font-medium text-gray-600 transition-colors border border-gray-200 flex items-center gap-2">+ Pin a fact</button>
                </div>
              </div>
            )}

            {/* ── Output format (unchanged) ── */}
            {activeTab === 'output' && (
              <div className="max-w-[700px]">
                <div className="mb-4">
                  <div className="text-[18px] font-bold text-gray-900 mb-0.5">Output format</div>
                  <p className="text-[13px] text-gray-500">Default shape of artifacts in the output panel.</p>
                </div>
                <div className="mb-4">
                  <label className="block text-[13px] font-bold text-gray-800 mb-2">Default format</label>
                  <div className="flex flex-wrap gap-2">
                    {['Markdown', 'JSON', 'Plain text', 'HTML'].map((f) => (
                      <button key={f} onClick={() => setOutputFormat(f)} className={`px-4 py-1.5 text-[12px] font-bold rounded-lg transition-colors ${outputFormat === f ? 'bg-[#1f2937] text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{f}</button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-[13px] font-bold text-gray-800 mb-2">Citations</label>
                  <div className="inline-flex bg-gray-100 p-1 rounded-lg">
                    {['Inline footnotes', 'End notes', 'Off'].map((c) => (
                      <button key={c} onClick={() => setCitations(c)} className={`px-4 py-1.5 text-[12px] font-bold rounded-md transition-all ${citations === c ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:bg-gray-200'}`}>{c}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-800 mb-2">Auto-export to</label>
                  {exportDestinations.length === 0 && (
                    <div className="py-6 text-center text-[13px] text-gray-400 border border-dashed border-gray-200 rounded-xl">No export destinations configured.</div>
                  )}
                  <div className="space-y-2">
                    {exportDestinations.map((d, i) => (
                      <div key={i} onClick={() => toggleExport(d.id)} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="text-gray-400"><DocumentIcon className="w-5 h-5" /></div>
                          <div className="text-[13px] font-medium text-gray-700">{d.name}</div>
                        </div>
                        <Toggle checked={d.checked} onChange={() => toggleExport(d.id)} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Guardrails (unchanged) ── */}
            {activeTab === 'guardrails' && (
              <div className="max-w-[700px]">
                <div className="mb-4">
                  <div className="text-[18px] font-bold text-gray-900 mb-0.5">Guardrails</div>
                  <p className="text-[13px] text-gray-500">Establish boundaries and security policies for this agent.</p>
                </div>
                <div className="mb-4">
                  <label className="block text-[13px] font-bold text-gray-800 mb-2">Risk profile</label>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    {['Strict', 'Standard', 'Permissive'].map((p) => (
                      <button key={p} onClick={() => setRiskProfile(p)} className={`flex-1 py-1.5 text-[12px] font-bold rounded-md transition-all ${riskProfile === p ? 'bg-white shadow-sm text-gray-900 font-bold' : 'text-gray-600 hover:bg-gray-200 font-medium'}`}>{p}</button>
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
            {activeTab !== 'model' && activeTab !== 'tools' && (
              <button onClick={onClose} className="px-5 py-2 text-[13px] font-bold text-white bg-[#d92d78] hover:bg-[#c2185b] rounded-lg shadow-sm transition-colors">
                Save changes
              </button>
            )}
            {(activeTab === 'model' || activeTab === 'tools') && (
              <span className="text-[12px] text-gray-400 italic">Use the Save button in the tab above.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigureAgentModal;
