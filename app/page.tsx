'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Layers,
  GraduationCap,
  Play,
  RotateCcw,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-12 pb-16">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-800">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            IIM Lucknow • Parthsaarthi Enhancement MVP
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Scheduled Slot Release
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Eliminating coordination delays and unfair FCFS scrambles for 580 junior batch students.
            The mentor decides when slots release; the system guarantees they become bookable at
            that exact second.
          </p>

          {/* Quick CTA row */}
          <div className="pt-4 flex flex-wrap items-center gap-3">
            <Link
              href="/student"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center gap-2 group"
            >
              <span>Explore Student View</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/mentor/releases"
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition-all border border-slate-700 flex items-center gap-2"
            >
              <span>Mentor Releases Dashboard</span>
            </Link>

            <Link
              href="/mentor/create"
              className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl text-sm transition-all border border-white/20 flex items-center gap-2"
            >
              <span>+ Schedule New Release</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Problem vs Solution Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-rose-200/80 p-6 sm:p-8 space-y-4 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm">
            ✕
          </div>
          <h2 className="text-lg font-bold text-slate-900">The Existing Problem</h2>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">•</span>
              <span>
                <strong>580 students</strong> competing for scarce mentoring/SIP slots (often 4 to
                15 slots total per mentor).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">•</span>
              <span>
                Mentors broadcast expected release times on student channels (WhatsApp/Slack/Teams).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">•</span>
              <span>
                Actual release relied on mentors manually returning to the portal and hitting
                release. If the mentor is busy, in class, or delayed, waiting students miss the window.
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-200/80 p-6 sm:p-8 space-y-4 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
            ✓
          </div>
          <h2 className="text-lg font-bold text-slate-900">The Scheduled Release Solution</h2>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>
                <strong>Automated Release:</strong> The mentor sets date & time once. The server
                authoritatively makes all slots bookable at that exact instant.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>
                <strong>Visual Countdown:</strong> Students see an exact countdown timer and locked
                slot previews before release.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>
                <strong>Manual Override Fallback:</strong> Mentors retain a manual release fallback
                button in case of unexpected schedule adjustments.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Guided Walkthrough / Acceptance Test Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            Interactive Acceptance Test Flow
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            How to Evaluate the Prototype in 2 Minutes
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Follow this standard sequence to verify the end-to-end functionality required by the project spec:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="text-xs font-bold text-blue-700 uppercase">Step 1</div>
            <div className="text-sm font-bold text-slate-900">Schedule Release</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Go to <Link href="/mentor/create" className="text-blue-600 underline font-semibold">Schedule Release</Link>. Add 4 slots (3:00, 3:30, 4:00, 4:30) and set release time +3 mins.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="text-xs font-bold text-blue-700 uppercase">Step 2</div>
            <div className="text-sm font-bold text-slate-900">Check Locked State</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Open <Link href="/student" className="text-blue-600 underline font-semibold">Student View</Link>. Verify the live countdown and locked <code>[ BOOK NOW ]</code> buttons.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="text-xs font-bold text-amber-700 uppercase">Step 3</div>
            <div className="text-sm font-bold text-slate-900">Simulate Release</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              In the floating <strong>Demo Controls</strong> (bottom right), click <em>Simulate Release Now</em> to fast-forward server time.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="text-xs font-bold text-emerald-700 uppercase">Step 4</div>
            <div className="text-sm font-bold text-slate-900">Refresh & Book</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Refresh the Student page. The slots turn <strong>OPEN</strong>. Click <code>[ BOOK NOW ]</code> to see Parthsaarthi booking handoff.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
