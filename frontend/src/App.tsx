import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Play, Download, Clock } from 'lucide-react';
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
  { id: 'alarms', label: 'CloudWatch Alarms' },
  { id: 'financial-calc', label: 'Financial Calculator' },
  { id: 'dashboard', label: 'Dashboard Refresh' },
  { id: 'reports', label: 'Scheduled Reports' },
  { id: 'exceptions', label: 'Exception Monitoring' },
  { id: 'selfheal', label: 'Self-Healing' },
  { id: 'notifications', label: 'Alarm Notifications' },
  { id: 'consistency', label: 'Data Consistency' }
];

export default function App() {
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  const [mode, setMode] = useState<'dry-run' | 'mock' | 'live'>('mock');
  const [selectedSuites, setSelectedSuites] = useState<string[]>(['alarms', 'reports']);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentRun, setCurrentRun] = useState<TestRun | null>(null);
  const [runs, setRuns] = useState<TestRun[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'results' | 'history'>('results');

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
    pending: 'bg-yellow-100 text-yellow-800',
    running: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">QA Portal</h1>
          <p className="text-lg text-slate-600">Dynatrace Monitoring Validation & Test Execution</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Test Configuration</h2>

            {/* Mode Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">Mode</label>
              <div className="space-y-2">
                {['dry-run', 'mock', 'live'].map((m) => (
                  <label key={m} className="flex items-center">
                    <input
                      type="radio"
                      name="mode"
                      value={m}
                      checked={mode === m}
                      onChange={(e) => setMode(e.target.value as any)}
                      className="w-4 h-4"
                    />
                    <span className="ml-2 text-sm text-slate-700 capitalize">{m}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Suite Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">Test Suites</label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {SUITES.map((suite) => (
                  <label key={suite.id} className="flex items-center">
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
                      className="w-4 h-4"
                    />
                    <span className="ml-2 text-sm text-slate-700">{suite.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Execute Button */}
            <button
              onClick={executeTests}
              disabled={isExecuting || selectedSuites.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Play size={20} />
              Execute Tests
            </button>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow">
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setActiveTab('results')}
                  className={`flex-1 py-4 px-6 font-semibold ${
                    activeTab === 'results'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Current Results
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 py-4 px-6 font-semibold ${
                    activeTab === 'history'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  History
                </button>
              </div>

              {/* Results Tab */}
              {activeTab === 'results' && (
                <div className="p-6">
                  {currentRun ? (
                    <>
                      {/* Status Card */}
                      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-bold text-slate-900">Test Run {currentRun.run_id.slice(0, 8)}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor[currentRun.status]}`}>
                            {currentRun.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-600">Mode:</span>
                            <p className="font-semibold text-slate-900 capitalize">{currentRun.mode}</p>
                          </div>
                          <div>
                            <span className="text-slate-600">Started:</span>
                            <p className="font-semibold text-slate-900">{new Date(currentRun.created_at).toLocaleTimeString()}</p>
                          </div>
                        </div>
                      </div>

                      {/* Results Summary */}
                      {currentRun.results_summary && (
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="bg-green-50 rounded-lg p-4 text-center">
                            <p className="text-3xl font-bold text-green-600">{currentRun.results_summary.passed}</p>
                            <p className="text-sm text-slate-600">Passed</p>
                          </div>
                          <div className="bg-red-50 rounded-lg p-4 text-center">
                            <p className="text-3xl font-bold text-red-600">{currentRun.results_summary.failed}</p>
                            <p className="text-sm text-slate-600">Failed</p>
                          </div>
                          <div className="bg-yellow-50 rounded-lg p-4 text-center">
                            <p className="text-3xl font-bold text-yellow-600">{currentRun.results_summary.skipped}</p>
                            <p className="text-sm text-slate-600">Skipped</p>
                          </div>
                        </div>
                      )}

                      {/* Logs */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-slate-900 mb-2">Execution Logs</h4>
                        <div className="bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-sm max-h-48 overflow-y-auto">
                          {logs.length > 0 ? (
                            logs.map((log, i) => <div key={i}>{log}</div>)
                          ) : (
                            <div className="text-slate-500">Waiting for logs...</div>
                          )}
                        </div>
                      </div>

                      {/* Report Generation */}
                      {currentRun.status === 'completed' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => generateReport('html')}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                          >
                            <Download size={18} />
                            Download HTML Report
                          </button>
                          <button
                            onClick={() => generateReport('pdf')}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                          >
                            <Download size={18} />
                            Download PDF Report
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      <Clock size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Select test suites and click "Execute Tests" to begin</p>
                    </div>
                  )}
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="p-6">
                  <div className="space-y-2">
                    {runs.length > 0 ? (
                      runs.map((run) => (
                        <div
                          key={run.run_id}
                          onClick={() => setCurrentRun(run)}
                          className="p-4 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors border border-slate-200"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-slate-900">{run.run_id.slice(0, 8)}</p>
                              <p className="text-sm text-slate-600">{new Date(run.created_at).toLocaleString()}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor[run.status]}`}>
                              {run.status}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-slate-500 py-8">No test history yet</p>
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
