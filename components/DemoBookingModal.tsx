'use client';

import React from 'react';
import { Slot } from '@/models/types';
import { CheckCircle2, ArrowRight, X, ShieldCheck, Clock, MapPin } from 'lucide-react';

interface DemoBookingModalProps {
  slot: Slot | null;
  releaseTitle?: string;
  mentorName?: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirmBooking?: (slotId: string) => Promise<void>;
}

export const DemoBookingModal: React.FC<DemoBookingModalProps> = ({
  slot,
  releaseTitle,
  mentorName,
  isOpen,
  onClose,
  onConfirmBooking,
}) => {
  const [loading, setLoading] = React.useState(false);
  const [confirmed, setConfirmed] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setConfirmed(false);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen || !slot) return null;

  const handleConfirm = async () => {
    if (!onConfirmBooking) return;
    setLoading(true);
    try {
      await onConfirmBooking(slot._id);
      setConfirmed(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Academic Header Banner */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 font-bold text-sm">
              PS
            </div>
            <div>
              <h3 className="text-sm font-semibold tracking-wide">Parthsaarthi Portal Handoff</h3>
              <p className="text-xs text-slate-300">Simulated Existing Booking Flow</p>
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
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs leading-relaxed flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block mb-0.5">MVP Boundary Reached</strong>
                  Scheduled Slot Release has successfully unlocked this slot at the scheduled time. In
                  production, clicking "Book Now" transitions the student directly into the existing
                  Parthsaarthi booking process (FCFS reservation & Google Meet confirmation).
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  Selected Session Slot
                </div>
                <div className="text-base font-bold text-slate-900">{releaseTitle || 'Mentoring Session'}</div>
                <div className="text-sm text-slate-600">Mentor: {mentorName || 'Rahul Sharma'}</div>

                <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-4 text-xs text-slate-700">
                  <span className="flex items-center gap-1 font-semibold text-slate-900">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    {slot.startTime} – {slot.endTime}
                  </span>
                  {slot.mode && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {slot.mode}
                    </span>
                  )}
                  {slot.note && <span className="italic text-slate-500 font-normal">"{slot.note}"</span>}
                </div>
              </div>

              <div className="text-center text-xs text-slate-500 italic">
                "Continuing to Parthsaarthi booking flow..."
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 shadow-sm"
                >
                  {loading ? 'Processing...' : 'Complete Demo Booking'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Demo Booking Confirmed!</h4>
              <p className="text-sm text-slate-600 max-w-sm mx-auto">
                Slot ({slot.startTime} – {slot.endTime}) has been marked as booked in the database to prevent duplicate allocation.
              </p>
              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="px-5 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
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
