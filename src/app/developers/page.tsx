'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { fetchApi } from '../../lib/api';
import {
  Code2,
  KeyRound,
  Webhook,
  Plus,
  Trash2,
  Copy,
  CheckCircle,
  Play,
  ShieldAlert,
  Send,
  Sparkles,
} from 'lucide-react';

export default function DevelopersPage() {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'keys' | 'webhooks'>('keys');
  const [loading, setLoading] = useState(true);

  // Key creation state
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

  // Webhook creation state
  const [webhookModalOpen, setWebhookModalOpen] = useState(false);
  const [webhookName, setWebhookName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['order.created']);

  // Test ping state
  const [pingResult, setPingResult] = useState<any>(null);
  const [pinging, setPinging] = useState(false);

  useEffect(() => {
    loadDevData();
  }, []);

  const loadDevData = async () => {
    setLoading(true);
    const [keysRes, whRes] = await Promise.all([
      fetchApi('/developers/keys'),
      fetchApi('/developers/webhooks'),
    ]);

    if (keysRes.success) setApiKeys(keysRes.apiKeys || []);
    if (whRes.success) setWebhooks(whRes.webhooks || []);
    setLoading(false);
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetchApi('/developers/keys', {
      method: 'POST',
      body: { name: keyName, permissions: ['orders.read', 'orders.write', 'menu.read'] },
    });

    if (res.success) {
      setNewlyCreatedKey(res.apiKey.fullKey);
      loadDevData();
    } else {
      alert(`Error: ${res.error}`);
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? Any integrated terminals will be disconnected.')) return;
    const res = await fetchApi(`/developers/keys/${id}`, { method: 'DELETE' });
    if (res.success) loadDevData();
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetchApi('/developers/webhooks', {
      method: 'POST',
      body: { name: webhookName, url: webhookUrl, events: selectedEvents },
    });

    if (res.success) {
      setWebhookModalOpen(false);
      setWebhookName('');
      setWebhookUrl('');
      loadDevData();
    } else {
      alert(`Error: ${res.error}`);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm('Delete this webhook endpoint?')) return;
    const res = await fetchApi(`/developers/webhooks/${id}`, { method: 'DELETE' });
    if (res.success) loadDevData();
  };

  const handleTestPing = async (webhookId: string) => {
    setPinging(true);
    const res = await fetchApi('/developers/webhooks/test-ping', {
      method: 'POST',
      body: { webhookId, eventType: 'order.created' },
    });
    if (res.success) {
      setPingResult(res);
      loadDevData();
    } else {
      alert(`Ping error: ${res.error}`);
    }
    setPinging(false);
  };

  const toggleEvent = (evt: string) => {
    if (selectedEvents.includes(evt)) {
      setSelectedEvents(selectedEvents.filter((e) => e !== evt));
    } else {
      setSelectedEvents([...selectedEvents, evt]);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
                Phase 5 — Developer API Platform
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">Extensibility & Webhooks</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
              <Code2 className="w-6 h-6 text-indigo-600" /> Developer Platform & Open API
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === 'keys' ? (
              <button
                onClick={() => {
                  setNewlyCreatedKey(null);
                  setKeyName('');
                  setKeyModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" /> Generate API Key
              </button>
            ) : (
              <button
                onClick={() => setWebhookModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" /> Add Webhook Endpoint
              </button>
            )}
          </div>
        </header>

        {/* Content Container */}
        <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active API Keys</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{apiKeys.length}</p>
              <span className="text-xs font-medium text-emerald-600 mt-1 block">POS, Captain, ERP connections</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Webhook Subscriptions</p>
              <p className="text-2xl font-black text-indigo-600 mt-1">{webhooks.length}</p>
              <span className="text-xs font-medium text-slate-500 mt-1 block">Real-time event listeners</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Architecture</p>
              <p className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                <ShieldAlert className="w-5 h-5 text-indigo-600" /> HMAC-SHA256
              </p>
              <span className="text-xs font-medium text-slate-500 mt-1 block">Signed webhook payloads</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab('keys')}
              className={`px-4 py-2 font-bold text-sm rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'keys'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <KeyRound className="w-4 h-4" /> API Keys ({apiKeys.length})
            </button>
            <button
              onClick={() => setActiveTab('webhooks')}
              className={`px-4 py-2 font-bold text-sm rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'webhooks'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Webhook className="w-4 h-4" /> Outbound Webhooks ({webhooks.length})
            </button>
          </div>

          {/* Tab 1: API Keys */}
          {activeTab === 'keys' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Registered API Keys</h3>
                  <p className="text-xs text-slate-500">Authenticate external applications, accounting systems, and Kiosk devices</p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {apiKeys.map((key) => (
                  <div key={key.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{key.name}</span>
                        <code className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700">
                          {key.keyPrefix}
                        </code>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {key.permissions.map((p: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-400">Created: {new Date(key.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleRevokeKey(key.id)}
                        className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs rounded-xl transition-colors"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Webhooks */}
          {activeTab === 'webhooks' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Webhook Event Subscriptions</h3>
                  <p className="text-xs text-slate-500">Receive instant HTTP POST callbacks on order punch, bill settlement, or low stock</p>
                </div>
              </div>

              <div className="space-y-4">
                {webhooks.map((wh) => (
                  <div
                    key={wh.id}
                    className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{wh.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          HTTP 200 OK
                        </span>
                      </div>
                      <code className="text-xs text-slate-600 block break-all font-mono">{wh.url}</code>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {wh.events.map((e: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-200 text-slate-700"
                          >
                            {e}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleTestPing(wh.id)}
                        disabled={pinging}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Send className="w-3 h-3" /> Send Test Ping
                      </button>
                      <button
                        onClick={() => handleDeleteWebhook(wh.id)}
                        className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-white transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Ping Result Inspector */}
              {pingResult && (
                <div className="mt-6 p-4 bg-slate-900 text-slate-100 rounded-2xl space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center text-emerald-400 font-bold border-b border-slate-800 pb-2">
                    <span>{pingResult.message}</span>
                    <span>Status: {pingResult.httpStatus}</span>
                  </div>
                  <pre className="overflow-x-auto text-[11px] text-slate-300">
                    {JSON.stringify(pingResult.payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal: Generate API Key */}
        {keyModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-600" /> Generate New API Key
              </h2>

              {newlyCreatedKey ? (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-2">
                    <p className="font-bold text-emerald-900">API Key Created Successfully!</p>
                    <p className="text-emerald-700">Make sure to copy your API key now as you will not be able to see it again.</p>
                    <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-emerald-300">
                      <code className="font-mono text-xs font-bold text-slate-900 flex-1 truncate">
                        {newlyCreatedKey}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(newlyCreatedKey);
                          alert('API key copied to clipboard!');
                        }}
                        className="p-1.5 hover:bg-slate-100 rounded text-slate-600"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => setKeyModalOpen(false)}
                    className="w-full py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreateKey} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Key Name / Client App *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Zomato Menu Webhook, Tally Sync"
                      value={keyName}
                      onChange={(e) => setKeyName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setKeyModalOpen(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
                    >
                      Generate Key
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Modal: Add Webhook */}
        {webhookModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Webhook className="w-5 h-5 text-indigo-600" /> Register Webhook Endpoint
              </h2>

              <form onSubmit={handleCreateWebhook} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Webhook Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ERP Invoice Exporter"
                    value={webhookName}
                    onChange={(e) => setWebhookName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Payload URL (HTTPS) *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://your-domain.com/webhook"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Event Subscriptions *</label>
                  <div className="space-y-1.5 text-xs text-slate-700 pt-1">
                    {[
                      { id: 'order.created', label: 'order.created (New order punched)' },
                      { id: 'order.ready', label: 'order.ready (Kitchen food ready)' },
                      { id: 'invoice.settled', label: 'invoice.settled (Bill paid & closed)' },
                      { id: 'stock.low', label: 'stock.low (Ingredient below buffer)' },
                    ].map((evt) => (
                      <label key={evt.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedEvents.includes(evt.id)}
                          onChange={() => toggleEvent(evt.id)}
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <span>{evt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setWebhookModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
                  >
                    Save Endpoint
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
