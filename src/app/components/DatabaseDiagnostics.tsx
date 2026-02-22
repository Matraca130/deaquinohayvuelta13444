// TEMPORARY DIAGNOSTICS PAGE — Remove after inspection
// Connects to the REAL backend (make-server-6569f786) to inspect what's there
import { useState, useCallback } from 'react';

// ── The REAL backend (user's deployed Edge Function) ──
const REAL_BASE = 'https://xdnciktarvxyhkrokbng.supabase.co/functions/v1/make-server-6569f786';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkbmNpa3RhcnZ4eWhrcm9rYm5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMTM4NjAsImV4cCI6MjA4Njc4OTg2MH0._nCGOiOh1bMWvqtQ62d368LlYj5xPI6e7pcsdjDEiYQ';

// ── The Figma Make backend (KV store, AI) ──
const FIGMA_BASE = 'https://xdnciktarvxyhkrokbng.supabase.co/functions/v1/make-server-9e5922ee';

async function callApi(base: string, path: string, accessToken?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ANON_KEY}`,
  };
  if (accessToken) {
    headers['X-Access-Token'] = accessToken;
  }
  const res = await fetch(`${base}${path}`, { headers });
  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch { json = { _raw: text }; }
  return { status: res.status, ok: res.ok, data: json };
}

interface ProbeResult {
  path: string;
  status: number;
  ok: boolean;
  data: any;
}

export function DatabaseDiagnostics() {
  const [results, setResults] = useState<ProbeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [customPath, setCustomPath] = useState('');
  const [customResult, setCustomResult] = useState<ProbeResult | null>(null);
  const [customLoading, setCustomLoading] = useState(false);
  const [selectedBase, setSelectedBase] = useState<'real' | 'figma'>('real');

  // Routes to probe on the REAL backend (based on user's API spec)
  const PROBE_ROUTES = [
    // Health
    '/health',
    // Auth (no X-Access-Token needed)
    '/signup',
    // Content hierarchy (need auth for most)
    '/courses?limit=3&offset=0',
    '/semesters?limit=3&offset=0',
    '/sections?limit=3&offset=0',
    '/topics?limit=3&offset=0',
    '/summaries?limit=3&offset=0',
    '/chunks?limit=3&offset=0',
    '/keywords?limit=3&offset=0',
    '/flashcards?limit=3&offset=0',
    '/quiz-questions?limit=3&offset=0',
    // New entities from spec
    '/keyword-connections?limit=3&offset=0',
    '/kw-prof-notes?limit=3&offset=0',
    '/kw-student-notes?limit=3&offset=0',
    '/text-annotations?limit=3&offset=0',
    '/subtopics?limit=3&offset=0',
    '/videos?limit=3&offset=0',
    // Institutions & memberships
    '/institutions',
    '/memberships',
    // Study
    '/study-sessions?limit=3&offset=0',
    '/study-plans?limit=3&offset=0',
    '/reading-states?limit=3&offset=0',
    // Admin
    '/platform-plans?limit=3&offset=0',
    '/institution-plans?limit=3&offset=0',
    '/institution-subscriptions?limit=3&offset=0',
    '/plan-access-rules?limit=3&offset=0',
    '/admin-scopes',
    // 3D Models
    '/models-3d?limit=3&offset=0',
    // AI
    '/ai-generations?limit=3&offset=0',
    // Reorder
    '/reorder',
    // FSRS / BKT
    '/fsrs-states?limit=3&offset=0',
    '/bkt-states?limit=3&offset=0',
    // Daily activities
    '/daily-activities?limit=3&offset=0',
    // Student stats
    '/student-stats',
    // Summary diagnostics
    '/summary-diagnostics',
    // Reviews
    '/reviews',
  ];

  const runProbes = useCallback(async () => {
    setLoading(true);
    setResults([]);
    const base = selectedBase === 'real' ? REAL_BASE : FIGMA_BASE;
    
    // Run in batches of 5 to avoid overwhelming
    const allResults: ProbeResult[] = [];
    for (let i = 0; i < PROBE_ROUTES.length; i += 5) {
      const batch = PROBE_ROUTES.slice(i, i + 5);
      const batchResults = await Promise.all(
        batch.map(async (path) => {
          try {
            const { status, ok, data } = await callApi(base, path);
            return { path, status, ok, data };
          } catch (err: any) {
            return { path, status: 0, ok: false, data: { _error: err.message } };
          }
        })
      );
      allResults.push(...batchResults);
      setResults([...allResults]);
    }
    setLoading(false);
  }, [selectedBase]);

  const runCustom = useCallback(async () => {
    if (!customPath) return;
    setCustomLoading(true);
    const base = selectedBase === 'real' ? REAL_BASE : FIGMA_BASE;
    const path = customPath.startsWith('/') ? customPath : `/${customPath}`;
    try {
      const { status, ok, data } = await callApi(base, path);
      setCustomResult({ path, status, ok, data });
    } catch (err: any) {
      setCustomResult({ path, status: 0, ok: false, data: { _error: err.message } });
    }
    setCustomLoading(false);
  }, [customPath, selectedBase]);

  const getStatusColor = (status: number, ok: boolean) => {
    if (ok) return 'text-green-400';
    if (status === 401) return 'text-yellow-400';
    if (status === 404) return 'text-red-400';
    if (status === 405) return 'text-orange-400';
    return 'text-red-500';
  };

  const getStatusLabel = (status: number, ok: boolean) => {
    if (ok) return '✅ OK';
    if (status === 401) return '🔒 Auth Required';
    if (status === 404) return '❌ Not Found';
    if (status === 405) return '⚠️ Method Not Allowed';
    if (status === 0) return '💥 Network Error';
    return `❌ ${status}`;
  };

  // Count results by category
  const okCount = results.filter(r => r.ok).length;
  const authCount = results.filter(r => r.status === 401).length;
  const notFoundCount = results.filter(r => r.status === 404).length;
  const otherErrorCount = results.filter(r => !r.ok && r.status !== 401 && r.status !== 404).length;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 font-mono text-sm">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-teal-400">
          Axon API Diagnostics
        </h1>
        <a
          href="/"
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 px-4 py-2 rounded font-bold text-gray-200 text-sm transition-colors"
        >
          Voltar ao Axon
        </a>
      </div>
      
      <div className="bg-gray-900 border border-gray-700 rounded p-4 mb-6">
        <h2 className="text-purple-400 font-bold mb-2">Connection Info</h2>
        <p className="text-gray-400">
          Project: <span className="text-white font-bold">xdnciktarvxyhkrokbng</span>
        </p>
        <p className="text-gray-400">
          Real Backend: <span className="text-teal-300 text-xs">{REAL_BASE}</span>
        </p>
        <p className="text-gray-400">
          Figma Backend: <span className="text-blue-300 text-xs">{FIGMA_BASE}</span>
        </p>
        <p className="text-gray-400 mt-2">
          Auth Pattern: <span className="text-yellow-300">Authorization: Bearer ANON_KEY</span> + <span className="text-yellow-300">X-Access-Token: JWT</span>
        </p>
      </div>

      {/* Backend selector */}
      <div className="flex gap-4 mb-4 items-center">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={selectedBase === 'real'}
            onChange={() => setSelectedBase('real')}
            className="accent-teal-500"
          />
          <span className={selectedBase === 'real' ? 'text-teal-400 font-bold' : 'text-gray-400'}>
            Real Backend (make-server-6569f786)
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={selectedBase === 'figma'}
            onChange={() => setSelectedBase('figma')}
            className="accent-blue-500"
          />
          <span className={selectedBase === 'figma' ? 'text-blue-400 font-bold' : 'text-gray-400'}>
            Figma Backend (make-server-9e5922ee)
          </span>
        </label>
      </div>

      {/* Probe all routes */}
      <button
        onClick={runProbes}
        disabled={loading}
        className="bg-teal-600 hover:bg-teal-500 disabled:bg-gray-700 px-6 py-2 rounded font-bold text-white mb-6"
      >
        {loading ? `Probing... (${results.length}/${PROBE_ROUTES.length})` : `Probe ${PROBE_ROUTES.length} Routes`}
      </button>

      {/* Summary */}
      {results.length > 0 && (
        <div className="flex gap-4 mb-4 text-sm">
          <span className="text-green-400">✅ OK: {okCount}</span>
          <span className="text-yellow-400">🔒 Auth: {authCount}</span>
          <span className="text-red-400">❌ 404: {notFoundCount}</span>
          <span className="text-red-500">💥 Other: {otherErrorCount}</span>
        </div>
      )}

      {/* Results table */}
      {results.length > 0 && (
        <div className="bg-gray-900 border border-gray-700 rounded overflow-hidden mb-8">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-800 border-b border-gray-700">
                <th className="py-2 px-3 w-12">#</th>
                <th className="py-2 px-3">Route</th>
                <th className="py-2 px-3 w-40">Status</th>
                <th className="py-2 px-3 w-20">Expand</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <>
                  <tr key={r.path} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-1.5 px-3 text-gray-500">{i + 1}</td>
                    <td className="py-1.5 px-3 text-white">{r.path}</td>
                    <td className={`py-1.5 px-3 ${getStatusColor(r.status, r.ok)}`}>
                      {getStatusLabel(r.status, r.ok)}
                    </td>
                    <td className="py-1.5 px-3">
                      <button
                        onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                        className="text-teal-500 hover:text-teal-300 text-xs"
                      >
                        {expandedIdx === i ? '[close]' : '[view]'}
                      </button>
                    </td>
                  </tr>
                  {expandedIdx === i && (
                    <tr key={`${r.path}-detail`}>
                      <td colSpan={4} className="p-3 bg-gray-950">
                        <pre className="overflow-auto max-h-60 text-xs text-gray-300">
                          {JSON.stringify(r.data, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Custom probe */}
      <div className="bg-gray-900 border border-gray-700 rounded p-4 mb-8">
        <h3 className="text-purple-400 font-bold mb-3">Manual Probe</h3>
        <div className="flex gap-2 items-center">
          <span className="text-gray-500 text-xs">
            {selectedBase === 'real' ? REAL_BASE : FIGMA_BASE}
          </span>
          <input
            value={customPath}
            onChange={(e) => setCustomPath(e.target.value)}
            placeholder="/health or /courses?limit=5"
            className="bg-gray-800 border border-gray-600 rounded px-3 py-1.5 text-white flex-1"
            onKeyDown={(e) => e.key === 'Enter' && runCustom()}
          />
          <button
            onClick={runCustom}
            disabled={customLoading || !customPath}
            className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 px-4 py-1.5 rounded text-white"
          >
            {customLoading ? '...' : 'Probe'}
          </button>
        </div>

        {customResult && (
          <div className="mt-3">
            <p className={`font-bold ${getStatusColor(customResult.status, customResult.ok)}`}>
              {customResult.path} → {getStatusLabel(customResult.status, customResult.ok)}
            </p>
            <pre className="bg-gray-950 p-3 rounded overflow-auto max-h-80 text-xs mt-2 text-gray-300">
              {JSON.stringify(customResult.data, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Discrepancy report */}
      <div className="bg-gray-900 border border-yellow-700 rounded p-4">
        <h3 className="text-yellow-400 font-bold mb-3">⚠️ Known Discrepancies (Code vs Real API)</h3>
        <div className="space-y-3 text-xs">
          <div>
            <span className="text-red-400 font-bold">1. REAL_BACKEND_URL wrong:</span>
            <p className="text-gray-400 ml-4">
              Code: <code className="text-red-300">/functions/v1/server</code><br />
              Real: <code className="text-green-300">/functions/v1/make-server-6569f786</code>
            </p>
          </div>
          <div>
            <span className="text-red-400 font-bold">2. Auth headers wrong:</span>
            <p className="text-gray-400 ml-4">
              Code: <code className="text-red-300">Authorization: Bearer USER_JWT</code><br />
              Real: <code className="text-green-300">Authorization: Bearer ANON_KEY</code> + <code className="text-green-300">X-Access-Token: USER_JWT</code>
            </p>
          </div>
          <div>
            <span className="text-red-400 font-bold">3. Response format wrong:</span>
            <p className="text-gray-400 ml-4">
              Code expects: <code className="text-red-300">{`{ success: true, data: ... }`}</code><br />
              Real returns: <code className="text-green-300">{`{ data: ... }`}</code> or <code className="text-green-300">{`{ error: "..." }`}</code>
            </p>
          </div>
          <div>
            <span className="text-red-400 font-bold">4. Route patterns differ:</span>
            <p className="text-gray-400 ml-4">
              Code: <code className="text-red-300">/topics/ID/summaries</code> (nested)<br />
              Real: <code className="text-green-300">/summaries?topic_id=ID</code> (flat + query param)
            </p>
          </div>
          <div>
            <span className="text-red-400 font-bold">5. Login approach differs:</span>
            <p className="text-gray-400 ml-4">
              Code: <code className="text-red-300">POST /auth/signin</code> (server route)<br />
              Real: <code className="text-green-300">supabase.auth.signInWithPassword()</code> (client-side Supabase Auth)
            </p>
          </div>
          <div>
            <span className="text-red-400 font-bold">6. Missing entities in code:</span>
            <p className="text-gray-400 ml-4">
              chunks, subtopics, keyword-connections, kw-prof-notes, kw-student-notes,
              text-annotations, reading-states, quiz-questions, videos, study-plans,
              study-plan-tasks, models-3d, model-3d-pins, model-3d-notes, summary-diagnostics,
              daily-activities, ai-generations, video-notes, reorder
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}