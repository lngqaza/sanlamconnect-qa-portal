import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Play, Download, Clock, CheckCircle, AlertCircle, Loader, Copy, ChevronDown, Filter } from 'lucide-react';
import './App.css';

interface TestRun {
  run_id: string;
  mode: 'dry-run' | 'mock' | 'live';
  suites: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_at: string;
  duration_seconds?: number;
  results_summary?: {
    passed: number;
    failed: number;
    skipped: number;
  };
}

const SUITES = [
  { id: 'alarms', label: 'CloudWatch Alarms', description: '5 critical incident alarms' },
  { id: 'financial-calc', label: 'Financial Calculator', description: 'Cost impact validation' },
  { id: 'dashboard', label: 'Dashboard Refresh', description: 'KPI injection & metrics' },
  { id: 'reports', label: 'Scheduled Reports', description: 'Report generation pipeline' },
  { id: 'exceptions', label: 'Exception Monitoring', description: 'SLA threshold detection' },
  { id: 'selfheal', label: 'Self-Healing', description: 'Circuit breaker & recovery' },
  { id: 'notifications', label: 'Alarm Notifications', description: 'Alert delivery chain' },
  { id: 'consistency', label: 'Data Consistency', description: 'Cross-system validation' }
];

const MODE_INFO = {
  'dry-run': { label: 'Dry-Run', duration: '~2 min', color: 'blue', desc: 'Syntax validation only' },
  'mock': { label: 'Mock', duration: '~5 min', color: 'purple', desc: 'Logic validation with test data' },
  'live': { label: 'Live', duration: '~45 min', color: 'rose', desc: 'Full integration testing' }
};

export default function App() {
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  const [mode, setMode] = useState<'dry-run' | 'mock' | 'live'>('mock');
  const [selectedSuites, setSelectedSuites] = useState<string[]>(['alarms', 'reports']);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentRun, setCurrentRun] = useState<TestRun | null>(null);
  const [runs, setRuns] = useState<TestRun[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'results' | 'history'>('results');
  const [showModeDropdown, setShowModeDropdown] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/test/history?limit=10`);
      setRuns(response.data.runs || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  }, [API_BASE]);

  // Fetch test history on mount
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Poll for test status every 5 seconds
  useEffect(() => {
    if (!currentRun || currentRun.status === 'completed' || currentRun.status === 'failed') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const response = await axios.get(
          `${API_BASE}/test/${currentRun.run_id}/status?created_at=${currentRun.created_at}`
        );
        setCurrentRun(response.data);

        // Fetch logs
        const logsResponse = await axios.get(`${API_BASE}/test/${currentRun.run_id}/logs`);
        setLogs(logsResponse.data.logs || []);
      } catch (error) {
        console.error('Error polling status:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [API_BASE, currentRun]);

  async function executeTests() {
    if (selectedSuites.length === 0) {
      alert('Select at least one test suite');
      return;
    }

    setIsExecuting(true);
    setLogs([]);

    try {
      const response = await axios.post(`${API_BASE}/test/execute`, {
        mode,
        suites: selectedSuites
      });

      const newRun: TestRun = {
        run_id: response.data.run_id,
        mode,
        suites: selectedSuites,
        status: 'pending',
        created_at: response.data.timestamp
      };

      setCurrentRun(newRun);
      setActiveTab('results');
      await fetchHistory();
    } catch (error) {
      alert('Failed to execute tests: ' + (error as any).message);
    } finally {
      setIsExecuting(false);
    }
  }

  async function generateReport(format: 'html' | 'pdf') {
    if (!currentRun) {
      alert('No test run selected');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/report/generate`, {
        run_id: currentRun.run_id,
        format
      });

      // Download report
      const link = document.createElement('a');
      link.href = response.data.url;
      link.download = `report.${format}`;
      link.click();
    } catch (error) {
      alert('Failed to generate report: ' + (error as any).message);
    }
  }

  const statusColor = {
    pending: 'bg-amber-50 text-amber-700 border border-amber-200',
    running: 'bg-blue-50 text-blue-700 border border-blue-200',
    completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    failed: 'bg-red-50 text-red-700 border border-red-200'
  };

  const statusIcon = {
    pending: <Clock size={16} className="animate-spin" />,
    running: <Loader size={16} className="animate-spin" />,
    completed: <CheckCircle size={16} />,
    failed: <AlertCircle size={16} />
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg"></div>
            <h1 className="text-3xl font-bold text-white">QA Portal</h1>
          </div>
          <p className="text-slate-400">Dynatrace Monitoring Validation & Test Execution</p>
        </div>

        <div className="p-6">

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 sticky top-6">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Filter size={18} />
                Test Configuration
              </h2>

              {/* Mode Selection */}
              <div className="mb-8">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Execution Mode</label>
                <div className="space-y-2">
                  {['dry-run', 'mock', 'live'].map((m) => {
                    const info = MODE_INFO[m as keyof typeof MODE_INFO];
                    return (
                      <label key={m} className="flex items-start p-3 rounded-lg border border-slate-700 hover:border-slate-600 hover:bg-slate-800 cursor-pointer transition-all group">
                        <input
                          type="radio"
                          name="mode"
                          value={m}
                          checked={mode === m}
                          onChange={(e) => setMode(e.target.value as any)}
                          className="w-4 h-4 mt-0.5 accent-blue-500"
                        />
                        <div className="ml-3 flex-1">
                          <div className="text-sm font-semibold text-white capitalize">{info.label}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{info.desc} • {info.duration}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Suite Selection */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">Test Suites</label>
                  <span className="text-xs text-slate-500">{selectedSuites.length} selected</span>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {SUITES.map((suite) => (
                    <label key={suite.id} className="flex items-start p-3 rounded-lg border border-slate-700 hover:border-slate-600 hover:bg-slate-800 cursor-pointer transition-all group">
                      <input
                        type="checkbox"
                        checked={selectedSuites.includes(suite.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSuites([...selectedSuites, suite.id]);
                          } else {
                            setSelectedSuites(selectedSuites.filter((s) => s !== suite.id));
                          }
                        }}
                        className="w-4 h-4 mt-0.5 accent-blue-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="text-sm font-semibold text-white">{suite.label}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{suite.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Execute Button */}
              <button
                onClick={executeTests}
                disabled={isExecuting || selectedSuites.length === 0}
                className={`w-full font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  isExecuting || selectedSuites.length === 0
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white hover:shadow-lg hover:shadow-blue-500/20'
                }`}
              >
                {isExecuting ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play size={20} />
                    Execute Tests
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tabs */}
            <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
              <div className="flex border-b border-slate-700 bg-slate-800/50">
                <button
                  onClick={() => setActiveTab('results')}
                  className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                    activeTab === 'results'
                      ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800'
                      : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  Current Results
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                    activeTab === 'history'
                      ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800'
                      : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  Test History
                </button>
              </div>

              {/* Results Tab */}
              {activeTab === 'results' && (
                <div className="p-6 space-y-6">
                  {currentRun ? (
                    <>
                      {/* Status Card */}
                      <div className={`rounded-lg p-6 border ${statusColor[currentRun.status]}`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {statusIcon[currentRun.status]}
                            <div>
                              <h3 className="text-lg font-bold">Test Run {currentRun.run_id.slice(0, 8)}</h3>
                              <p className="text-sm opacity-75 mt-0.5">{new Date(currentRun.created_at).toLocaleString()}</p>
                            </div>
                          </div>
                          <span className="px-4 py-2 rounded-full text-sm font-semibold bg-current bg-opacity-10">
                            {currentRun.status === 'completed' ? '✓ Completed' : currentRun.status === 'failed' ? '✗ Failed' : currentRun.status === 'running' ? '⟳ Running' : '○ Pending'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm pt-4 border-t border-current border-opacity-20">
                          <div>
                            <span className="opacity-75 text-sm">Mode</span>
                            <p className="font-semibold capitalize text-base mt-1">{currentRun.mode}</p>
                          </div>
                          <div>
                            <span className="opacity-75 text-sm">Suites</span>
                            <p className="font-semibold text-base mt-1">{currentRun.suites.length} selected</p>
                          </div>
                          <div>
                            <span className="opacity-75 text-sm">Duration</span>
                            <p className="font-semibold text-base mt-1">{currentRun.duration_seconds ? `${currentRun.duration_seconds}s` : 'Running...'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Results Summary */}
                      {currentRun.results_summary && (
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-emerald-950 border border-emerald-700 rounded-lg p-4 text-center hover:border-emerald-600 transition-colors">
                            <p className="text-3xl font-bold text-emerald-400">{currentRun.results_summary.passed}</p>
                            <p className="text-sm text-emerald-300 mt-1">Passed</p>
                          </div>
                          <div className="bg-red-950 border border-red-700 rounded-lg p-4 text-center hover:border-red-600 transition-colors">
                            <p className="text-3xl font-bold text-red-400">{currentRun.results_summary.failed}</p>
                            <p className="text-sm text-red-300 mt-1">Failed</p>
                          </div>
                          <div className="bg-amber-950 border border-amber-700 rounded-lg p-4 text-center hover:border-amber-600 transition-colors">
                            <p className="text-3xl font-bold text-amber-400">{currentRun.results_summary.skipped}</p>
                            <p className="text-sm text-amber-300 mt-1">Skipped</p>
                          </div>
                        </div>
                      )}

                      {/* Logs */}
                      <div>
                        <h4 className="font-semibold text-white mb-3">Execution Logs</h4>
                        <div className="bg-slate-950 border border-slate-700 text-slate-300 rounded-lg p-4 font-mono text-xs max-h-64 overflow-y-auto space-y-1 hover:border-slate-600 transition-colors">
                          {logs.length > 0 ? (
                            logs.map((log, i) => (
                              <div key={i} className="text-slate-400">
                                <span className="text-slate-600">{String(i + 1).padStart(4, '0')}</span>
                                <span className="mx-2">│</span>
                                <span className="text-slate-300">{log}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-slate-600 py-8 text-center">
                              {currentRun.status === 'running' ? (
                                <>
                                  <Loader size={20} className="animate-spin mx-auto mb-2 opacity-50" />
                                  <p>Waiting for logs...</p>
                                </>
                              ) : (
                                <p>No logs available</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Report Generation */}
                      {currentRun.status === 'completed' && (
                        <div className="flex gap-3 pt-4 border-t border-slate-700">
                          <button
                            onClick={() => generateReport('html')}
                            className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-emerald-500/20"
                          >
                            <Download size={18} />
                            HTML Report
                          </button>
                          <button
                            onClick={() => generateReport('pdf')}
                            className="flex-1 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-rose-500/20"
                          >
                            <Download size={18} />
                            PDF Report
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-16 px-6">
                      <Clock size={48} className="mx-auto mb-4 opacity-30 text-slate-500" />
                      <h3 className="text-xl font-semibold text-slate-300 mb-2">No Test Run Yet</h3>
                      <p className="text-slate-400 max-w-sm mx-auto">
                        Select one or more test suites on the left and click "Execute Tests" to begin validation.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="p-6">
                  <div className="space-y-3">
                    {runs.length > 0 ? (
                      runs.map((run) => (
                        <div
                          key={run.run_id}
                          onClick={() => setCurrentRun(run)}
                          className={`p-4 rounded-lg cursor-pointer transition-all border hover:border-slate-600 hover:bg-slate-800/50 ${statusColor[run.status]}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              {statusIcon[run.status]}
                              <div>
                                <p className="font-semibold">{run.run_id.slice(0, 8)}</p>
                                <p className="text-sm opacity-75 mt-0.5">{new Date(run.created_at).toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-right">
                              <div className="text-right">
                                <p className="text-sm font-semibold capitalize">{run.mode}</p>
                                {run.duration_seconds && <p className="text-xs opacity-75 mt-0.5">{run.duration_seconds}s</p>}
                              </div>
                              <ChevronDown size={16} className="opacity-50" />
                            </div>
                          </div>
                          {run.results_summary && (
                            <div className="flex gap-4 mt-3 pt-3 border-t border-current border-opacity-20">
                              <div className="text-sm">
                                <span className="opacity-75">Passed:</span>
                                <span className="ml-1 font-semibold">{run.results_summary.passed}</span>
                              </div>
                              <div className="text-sm">
                                <span className="opacity-75">Failed:</span>
                                <span className="ml-1 font-semibold">{run.results_summary.failed}</span>
                              </div>
                              <div className="text-sm">
                                <span className="opacity-75">Skipped:</span>
                                <span className="ml-1 font-semibold">{run.results_summary.skipped}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Clock size={32} className="mx-auto mb-3 opacity-30 text-slate-500" />
                        <p className="text-slate-400">No test history yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
