'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { User, GraduationCap, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const handleSelectRole = (role: 'student' | 'mentor') => {
    localStorage.setItem('parthsaarthi_demo_role', role);
    if (role === 'mentor') {
      router.push('/mentor/releases');
    } else {
      router.push('/student');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 space-y-8">
      {/* Notice Banner */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block mb-0.5">Demo Environment Notice</strong>
          This is an evaluation prototype demonstrating the <em>Scheduled Slot Release</em> feature.
          Authentication is simplified to role selection so evaluators and students can instantly test both perspectives without full campus SSO integration.
        </div>
      </div>

      <div className="text-center space-y-3">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl font-black mx-auto shadow-md border border-blue-800">
          PS
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Select Demo Persona
        </h1>
        <p className="text-slate-600 text-sm max-w-md mx-auto">
          Choose a profile to experience how scheduled releases are configured by mentors and accessed by students.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Mentor Card */}
        <div
          onClick={() => handleSelectRole('mentor')}
          className="group relative bg-white border border-slate-200 hover:border-blue-500 rounded-2xl p-6 shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 bg-blue-50 text-blue-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <User className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Senior Batch Mentor
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-1">Rahul Sharma</h2>
              <p className="text-xs text-slate-500">SIP Mentor • Consulting Focus</p>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Create releases, add mentoring slots, schedule future release times, and use manual release fallback controls.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
            <span>Enter as Mentor</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Student Card */}
        <div
          onClick={() => handleSelectRole('student')}
          className="group relative bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl p-6 shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Junior Batch (580 Students)
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-1">Vaibhav Raj Sahni</h2>
              <p className="text-xs text-slate-500">Student • Seeking SIP Preparation</p>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              View upcoming sessions, watch real-time release countdowns, verify locked slot cards, and refresh to book once released.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
            <span>Enter as Student</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}
