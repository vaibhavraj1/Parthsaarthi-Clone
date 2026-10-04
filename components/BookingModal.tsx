'use client';

import React, { useState, useEffect } from 'react';
import { Slot, CvHrOption } from '@/models/types';
import { CheckCircle2, ArrowRight, X, Clock, MapPin } from 'lucide-react';

interface BookingModalProps {
  slot: Slot | null;
  releaseTitle?: string;
  mentorName?: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirmBooking?: (params: {
    slotId: string;
    bookingRole?: 'solver' | 'shadow';
    cvHrSelection?: CvHrOption;
  }) => Promise<void>;
}

const CV_HR_OPTIONS: CvHrOption[] = ['Entire CV', 'Workex', 'POR', 'HR Questions'];

export const BookingModal: React.FC<BookingModalProps> = ({
  slot,
  releaseTitle,
  mentorName = 'Gayathri Arvind',
  isOpen,
  onClose,
  onConfirmBooking,
}) => {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Case Slot selection: 'solver' | 'shadow'
  const [caseRole, setCaseRole] = useState<'solver' | 'shadow' | null>(null);

  // CV/HR Slot selection
  const [cvHrChoice, setCvHrChoice] = useState<CvHrOption | null>(null);

  useEffect(() => {
    if (isOpen && slot) {
      setConfirmed(false);
      setLoading(false);
      setError(null);

      setCaseRole(null);
      setCvHrChoice(null);
    }
  }, [isOpen, slot]);

  if (!isOpen || !slot) return null;

  const isCase = slot.slotType === 'case';
  const shadowCount = slot.shadowCount ?? 0;
  const currentShadows = slot.shadowsBooked || [];
  const shadowsLeft = Math.max(0, shadowCount - currentShadows.length);
  const isSolverAvailable = !slot.solverBooked;
  const isShadowAvailable = shadowCount > 0 && shadowsLeft > 0;

  const handleConfirm = async () => {
    if (!onConfirmBooking || (isCase ? !caseRole : !cvHrChoice)) return;
    setError(null);
    setLoading(true);

    try {
      await onConfirmBooking({
        slotId: slot._id,
        bookingRole: isCase ? caseRole ?? undefined : undefined,
        cvHrSelection: !isCase ? cvHrChoice ?? undefined : undefined,
      });
      setConfirmed(true);
    } catch (err: any) {
      setError(err.message || 'Failed to complete booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 font-bold text-sm">
              PS
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-wide">
                Book Mentoring Slot
              </h3>
              <p className="text-[11px] text-slate-300">
                {isCase ? 'Case Interview Slot' : 'CV / HR Review Slot'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {!confirmed ? (
            <div className="space-y-5">
              {/* Selected Slot Information */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    {releaseTitle || 'Mentoring Session'}
                  </span>
                  <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-semibold">
                    Mentor: {mentorName}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-semibold text-slate-900 font-mono">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    {slot.startTime} – {slot.endTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {slot.mode}
                  </span>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                  {error}
                </div>
              )}

              {/* CASE SLOT: Solver vs Shadow Selection */}
              {isCase && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Select Your Role for this Case:
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Solver Option */}
                    <button
                      onClick={() => {
                        if (isSolverAvailable) setCaseRole('solver');
                      }}
                      type="button"
                      disabled={!isSolverAvailable}
                      aria-pressed={caseRole === 'solver'}
                      className={`p-3.5 rounded-xl border transition-all ${
                        !isSolverAvailable
                          ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                          : caseRole === 'solver'
                          ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 cursor-pointer'
                          : 'bg-white border-slate-200 hover:border-slate-300 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900">Solver</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isSolverAvailable
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {isSolverAvailable ? '1 spot open' : 'Filled'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        Solve the case live with mentor {mentorName} and receive 1-on-1 feedback.
                      </p>
                    </button>

                    {/* Shadow Option */}
                    <button
                      onClick={() => {
                        if (isShadowAvailable) setCaseRole('shadow');
                      }}
                      type="button"
                      disabled={!isShadowAvailable}
                      aria-pressed={caseRole === 'shadow'}
                      className={`p-3.5 rounded-xl border transition-all ${
                        !isShadowAvailable
                          ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                          : caseRole === 'shadow'
                          ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 cursor-pointer'
                          : 'bg-white border-slate-200 hover:border-slate-300 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900">Shadow Observer</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isShadowAvailable
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {shadowCount === 0
                            ? 'No shadows'
                            : isShadowAvailable
                            ? `${shadowsLeft} / ${shadowCount} open`
                            : 'Filled'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        Observe the live case solving and listen to the mentor's evaluation.
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* CV/HR SLOT: student chooses a focus area */}
              {!isCase && (
                <div className="space-y-3">
                  <label htmlFor="cv-hr-focus" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Select CV / HR Focus Area:
                  </label>
                  <select
                    id="cv-hr-focus"
                    value={cvHrChoice || ''}
                    onChange={(event) => setCvHrChoice(event.target.value as CvHrOption)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                  >
                    <option value="" disabled>Select a focus area</option>
                    {CV_HR_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={loading || (isCase ? !caseRole : !cvHrChoice)}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
                >
                  {loading ? 'Completing...' : 'Complete Booking'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Booking Confirmed!</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                You have successfully reserved the slot ({slot.startTime} – {slot.endTime}) with mentor {mentorName} as{' '}
                <strong>{isCase ? (caseRole === 'solver' ? 'Solver' : 'Shadow') : cvHrChoice}</strong>.
              </p>
              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
