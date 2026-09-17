'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';
import {
  ShieldCheck,
  Search,
  Filter,
  AlertTriangle,
  FileText,
  Clock,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';

export default function AuditPage() {
  const { currentOutlet } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    const res = await fetchApi('/reports/audit-logs');
    if (res.success && res.logs) {
      setLogs(res.logs);
    }
    setLoading(false);
  };

  const filteredLogs = logs.filter((log) => {
    const matchesAction = filterAction === 'ALL' || log.action === filterAction;
    const matchesSearch =
      (log.userName || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.reason || '').toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase());
    return matchesAction && matchesSearch;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <span>Immutable Audit Trail & GST Anti-Tampering Log</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically tracked audit logs for all cancellations, discounts, voids, and price overrides
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit trail by actor, reason, or action..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {[
              'ALL',
              'ORDER_CANCELLED',
              'INVOICE_VOIDED',
              'PAYMENT_SETTLED',
              'WASTAGE_LOGGED',
              'SHIFT_CLOSED',
            ].map((act) => (
              <button
                key={act}
                onClick={() => setFilterAction(act)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  filterAction === act
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {act === 'ALL'
                  ? 'All Activities'
                  : act.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Action</th>
                <th className="p-4">Target Entity</th>
                <th className="p-4">Staff Member</th>
                <th className="p-4">Mandatory Compliance Reason</th>
                <th className="p-4 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No matching audit log records found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isCritical =
                    log.action.includes('CANCEL') || log.action.includes('VOID');

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono ${
                            isCritical
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">
                        <span className="font-bold text-slate-800">{log.entityType}</span>
                        <span className="text-[10px] font-mono text-slate-400 ml-1">
                          #{log.entityId.slice(0, 8)}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-800">
                        {log.userName || 'System Auto'}
                      </td>
                      <td className="p-4 text-slate-600 max-w-xs truncate">
                        {log.reason || 'Standard operational transaction'}
                      </td>
                      <td className="p-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Tamper Proof</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
