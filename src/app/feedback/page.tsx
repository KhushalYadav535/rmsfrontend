'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';
import {
  Star,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  X,
} from 'lucide-react';

export default function FeedbackPage() {
  const { currentOutlet } = useAuth();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolveModalItem, setResolveModalItem] = useState<any>(null);
  const [resolutionNote, setResolutionNote] = useState('Offered complimentary dessert & addressed kitchen delay');

  useEffect(() => {
    if (currentOutlet) {
      loadFeedbacks();
    }
  }, [currentOutlet]);

  const loadFeedbacks = async () => {
    setLoading(true);
    const res = await fetchApi(`/feedback?outletId=${currentOutlet?.id}`);
    if (res.success && res.feedbacks) {
      setFeedbacks(res.feedbacks);
    }
    setLoading(false);
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveModalItem) return;

    const res = await fetchApi(`/feedback/${resolveModalItem.id}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ resolution: resolutionNote }),
    });

    if (res.success) {
      setResolveModalItem(null);
      loadFeedbacks();
    } else {
      alert(`Error resolving feedback: ${res.error}`);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
            <span>Customer Feedback & Service Quality</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Diner ratings, food reviews, and guest complaint resolution tickets for {currentOutlet?.name}
          </p>
        </div>

        {/* Feedback Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {feedbacks.length === 0 ? (
            <div className="col-span-3 bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
              No diner feedback entries recorded yet
            </div>
          ) : (
            feedbacks.map((f) => (
              <div
                key={f.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xs font-black text-slate-900">
                        {f.customerName || 'Anonymous Diner'}
                      </h3>
                      <p className="text-[10px] text-slate-400">
                        {f.tableNumber ? `Table ${f.tableNumber}` : 'Online / Takeaway'} •{' '}
                        {new Date(f.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        f.status === 'RESOLVED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {f.status}
                    </span>
                  </div>

                  {/* Ratings */}
                  <div className="flex items-center gap-3 py-2 text-xs border-y border-slate-100 my-2">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-bold">Food:</span>
                      <span className="font-black text-amber-500">⭐ {f.ratingFood}/5</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-bold">Service:</span>
                      <span className="font-black text-amber-500">⭐ {f.ratingService}/5</span>
                    </div>
                  </div>

                  {f.comments && (
                    <p className="text-xs text-slate-700 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      "{f.comments}"
                    </p>
                  )}

                  {f.resolution && (
                    <div className="text-[11px] text-emerald-700 bg-emerald-50/60 p-2 rounded-xl border border-emerald-100 mt-2">
                      <span className="font-bold block">Resolution Note:</span>
                      <span>{f.resolution}</span>
                    </div>
                  )}
                </div>

                {f.status === 'OPEN' && (
                  <button
                    onClick={() => setResolveModalItem(f)}
                    className="w-full py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs rounded-xl transition-all"
                  >
                    Resolve Complaint Ticket
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Resolve Modal */}
      {resolveModalItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleResolve}
            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Resolve Complaint</h3>
              <button
                type="button"
                onClick={() => setResolveModalItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Resolution Action / Notes
              </label>
              <textarea
                rows={3}
                required
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20"
            >
              Mark Ticket as Resolved
            </button>
          </form>
        </div>
      )}
    </AppLayout>
  );
}
