import React from 'react';
import { MentorReleaseForm } from '@/components/MentorReleaseForm';
import { Sparkles, Calendar, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function MentorCreatePage() {
  return (
    <div className="space-y-6 pb-16">
      {/* Header breadcrumb & title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <Link href="/mentor/releases" className="hover:text-slate-900 transition-colors">
              Mentor Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">New Scheduled Release</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Schedule Slot Release
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Configure mentoring slots and define the authoritative date & time they become bookable.
          </p>
        </div>

        <Link
          href="/mentor/releases"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Releases</span>
        </Link>
      </div>

      <MentorReleaseForm />
    </div>
  );
}
