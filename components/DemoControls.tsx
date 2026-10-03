'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, RotateCcw, Wrench, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Clock } from 'lucide-react';

interface DemoControlsProps {
  currentReleaseId?: string;
  onActionComplete?: () => void;
}

export const DemoControls: React.FC<DemoControlsProps> = ({
  currentReleaseId,
  onActionComplete,
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const simulateRelease = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const url = currentReleaseId
        ? `/api/releases/${currentReleaseId}/simulate-release`
        : `/api/releases/simulate-all`;
      const res = await fetch(url, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMessage('Simulated release applied! Refresh to see OPEN slots.');
        if (onActionComplete) onActionComplete();
        else router.refresh();
      } else {
        setMessage(`Error: ${data.error || 'Failed to simulate release'}`);
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const seedSampleData = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/demo/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed_consulting' }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Seeded Consulting Case Prep session scheduled for 3 mins from now!');
        if (onActionComplete) onActionComplete();
        else router.refresh();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetAllData = async () => {
    if (!confirm('Reset all releases and bookings to clean seed state?')) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/demo/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clean_reset' }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Database reset to initial demo state.');
        if (onActionComplete) onActionComplete();
        else router.refresh();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 overflow-hidden w-80 sm:w-96 transition-all duration-200">
        {/* Toggle Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-amber-300">
              Demo Simulation Controls
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <span>{isOpen ? 'Collapse' : 'Expand'}</span>
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </button>

        {/* Panel Content */}
        {isOpen && (
          <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/80 text-xs">
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 text-[11px] leading-relaxed">
              <strong className="text-slate-200 block mb-0.5">Evaluation & Presentation Aid:</strong>
              Production relies strictly on scheduled server timestamps. Use these controls to
              simulate the passage of time without waiting for real countdowns.
            </div>

            {message && (
              <div className="p-2 bg-blue-950 text-blue-300 border border-blue-800 rounded-md text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-blue-400" />
                <span>{message}</span>
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={simulateRelease}
                disabled={loading}
                className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Simulate Release Now (Fast-Forward)</span>
              </button>

              <button
                onClick={seedSampleData}
                disabled={loading}
                className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 border border-slate-700 disabled:opacity-50"
              >
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Seed Sample Consulting Session (+3m)</span>
              </button>

              <button
                onClick={resetAllData}
                disabled={loading}
                className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 border border-slate-700 disabled:opacity-50 text-[11px]"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span>Reset All Demo Data</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
