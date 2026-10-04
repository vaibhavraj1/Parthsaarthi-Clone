'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Release, ReleaseStatus } from '@/models/types';
import { StatusBadge } from '@/components/StatusBadge';
import { formatTimeIST, formatDateIST, getCurrentISTParts, istToUtcIso } from '@/lib/time-utils';
import {
  Plus,
  Play,
  XCircle,
  Edit,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface ReleaseRow extends Release {
  slotsCount: number;
  computedStatus: ReleaseStatus;
  isBookable: boolean;
}

export default function MentorReleasesPage() {
  const [releases, setReleases] = useState<ReleaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manual release modal state
  const [manualReleaseTarget, setManualReleaseTarget] = useState<ReleaseRow | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Cancel release confirmation state
  const [cancelTarget, setCancelTarget] = useState<ReleaseRow | null>(null);

  // Edit release modal state
  const [editTarget, setEditTarget] = useState<ReleaseRow | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');

  const fetchReleases = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    setError(null);
    try {
      const res = await fetch('/api/releases');
      if (!res.ok) throw new Error('Failed to load releases');
      const data = await res.json();
      setReleases(data.releases || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching releases');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReleases(false);
  }, [fetchReleases]);

  // Trigger manual release
  const handleConfirmManualRelease = async () => {
    if (!manualReleaseTarget) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/releases/${manualReleaseTarget._id}/manual-release`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to manually release slots');
      setManualReleaseTarget(null);
      await fetchReleases(true);
    } catch (err: any) {
      alert(err.message || 'Error executing manual release');
    } finally {
      setActionLoading(false);
    }
  };

  // Trigger cancel
  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/releases/${cancelTarget._id}/cancel`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to cancel release');
      setCancelTarget(null);
      await fetchReleases(true);
    } catch (err: any) {
      alert(err.message || 'Error cancelling release');
    } finally {
      setActionLoading(false);
    }
  };

  // Open edit modal
  const openEditModal = (rel: ReleaseRow) => {
    setEditTarget(rel);
    setEditTitle(rel.title);
    setEditDescription(rel.description || '');
    setEditCategory(rel.category || '');
    // format date & time for HTML inputs
    const relDate = new Date(rel.releaseAt);
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(relDate);
    const year = parts.find((p) => p.type === 'year')?.value || '';
    const month = parts.find((p) => p.type === 'month')?.value || '';
    const day = parts.find((p) => p.type === 'day')?.value || '';
    let hour = parts.find((p) => p.type === 'hour')?.value || '';
    if (hour === '24') hour = '00';
    const minute = parts.find((p) => p.type === 'minute')?.value || '';

    setEditDate(`${year}-${month}-${day}`);
    setEditTime(`${hour}:${minute}`);
  };

  // Save edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setActionLoading(true);

    try {
      const newReleaseAtUtc = istToUtcIso(editDate, editTime);
      const res = await fetch(`/api/releases/${editTarget._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          category: editCategory,
          releaseAt: newReleaseAtUtc,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update release');
      }
      setEditTarget(null);
      await fetchReleases(true);
    } catch (err: any) {
      alert(err.message || 'Error saving changes');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            Mentor Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Scheduled Releases
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Monitor upcoming slot releases, verify scheduled timers, or trigger manual override fallbacks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchReleases(false)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
            title="Refresh releases"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/mentor/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Release</span>
          </Link>
        </div>
      </div>

      {/* Manual Release Deliberate Fallback Callout */}
      <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 text-xs leading-relaxed flex items-start gap-3 shadow-sm">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white block mb-0.5">
            Deliberate Fallback: Manual Release Available
          </strong>
          The scheduled automation unlocks slots seamlessly at the designated time. However, if a
          scheduling change or coordination need arises, the mentor can trigger{' '}
          <strong className="text-amber-300">Manual Release</strong> at any time to open slots
          immediately.
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm">
          {error}
        </div>
      )}

      {/* Releases Table / Cards */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
          Loading scheduled releases...
        </div>
      ) : releases.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <h3 className="text-lg font-bold text-slate-800">No Releases Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            You haven't scheduled any mentoring releases yet. Click below to create your first release.
          </p>
          <Link
            href="/mentor/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 text-white rounded-xl text-xs font-bold hover:bg-blue-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Schedule Release
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Session / Topic</th>
                  <th className="py-3.5 px-4">Slots</th>
                  <th className="py-3.5 px-4">Release Date & Time (IST)</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {releases.map((rel) => {
                  const isScheduled = rel.computedStatus === 'scheduled';
                  const isCancelled = rel.computedStatus === 'cancelled';
                  const releaseDateDisplay = formatDateIST(rel.releaseAt);
                  const releaseTimeDisplay = formatTimeIST(rel.releaseAt);

                  return (
                    <tr key={rel._id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Session Name & Category */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="font-bold text-slate-900 text-sm">{rel.title}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-1.5">
                          <span>{rel.category || 'Mentoring'}</span>
                          <span>•</span>
                          <span>Mentor: {rel.mentorName}</span>
                        </div>
                      </td>

                      {/* Number of slots */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                          <Layers className="w-3.5 h-3.5 text-slate-500" />
                          {rel.slotsCount} {rel.slotsCount === 1 ? 'slot' : 'slots'}
                        </span>
                      </td>

                      {/* Release date & time */}
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-900 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {releaseTimeDisplay} IST
                        </div>
                        <div className="text-slate-500 text-[11px] flex items-center gap-1.5 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {releaseDateDisplay}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <StatusBadge status={rel.computedStatus} size="sm" />
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isScheduled && (
                            <>
                              <button
                                onClick={() => openEditModal(rel)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                                title="Edit Scheduled Release"
                              >
                                <Edit className="w-3 h-3" />
                                <span>Edit</span>
                              </button>

                              <button
                                onClick={() => setManualReleaseTarget(rel)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-800 rounded-lg text-xs font-bold transition-colors shadow-2xs"
                                title="Manually Release Slots immediately"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>Manual Release</span>
                              </button>

                              <button
                                onClick={() => setCancelTarget(rel)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-lg text-xs font-medium transition-colors"
                                title="Cancel Release"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>Cancel</span>
                              </button>
                            </>
                          )}

                          {!isScheduled && (
                            <Link
                              href="/student"
                              className="text-xs text-blue-700 hover:underline font-semibold"
                            >
                              View in Student
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG: Manual Release */}
      {manualReleaseTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900">Release these slots now?</h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  "Students will immediately be able to book them."
                </p>
                <div className="text-xs font-semibold text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-2">
                  Session: {manualReleaseTarget.title} ({manualReleaseTarget.slotsCount} slots)
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed text-center">
                This manual override bypasses the original scheduled timer ({formatTimeIST(manualReleaseTarget.releaseAt)} IST).
              </p>

              <div className="flex items-center justify-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setManualReleaseTarget(null)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmManualRelease}
                  disabled={actionLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {actionLoading ? 'Releasing...' : 'Release Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG: Cancel Release */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mx-auto">
                <XCircle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900">Cancel Scheduled Release?</h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Are you sure you want to cancel <strong>"{cancelTarget.title}"</strong>?
                </p>
                <div className="text-xs text-rose-800 bg-rose-50 p-2.5 rounded-lg border border-rose-200 mt-2">
                  Rule 7: A cancelled release will never become bookable, even if its scheduled time passes.
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCancelTarget(null)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Keep Release
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={actionLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {actionLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edit Scheduled Release */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <form onSubmit={handleSaveEdit}>
              <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                <h3 className="text-sm font-bold tracking-wide">Edit Scheduled Release</h3>
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold uppercase mb-1">
                    Session Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold uppercase mb-1">
                      Release Date (IST)
                    </label>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold uppercase mb-1">
                      Release Time (IST)
                    </label>
                    <input
                      type="time"
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold uppercase mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold uppercase mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs leading-relaxed"
                  />
                </div>
              </div>

              <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
