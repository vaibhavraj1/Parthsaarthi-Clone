'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { formatTimeIST } from '@/lib/time-utils';
import { Calendar, User, Clock, ArrowRightLeft, Sparkles, GraduationCap } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [currentIST, setCurrentIST] = useState<string>('');
  const [currentRole, setCurrentRole] = useState<'student' | 'mentor'>('student');
  const [userName, setUserName] = useState<string>('Vaibhav Raj Sahni');

  // Load session/role from cookie or localStorage
  useEffect(() => {
    const role = localStorage.getItem('parthsaarthi_demo_role') as 'student' | 'mentor';
    if (role === 'mentor') {
      setCurrentRole('mentor');
      setUserName('Rahul Sharma');
    } else {
      setCurrentRole('student');
      setUserName('Vaibhav Raj Sahni');
    }

    const updateClock = () => {
      setCurrentIST(formatTimeIST(new Date()));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [pathname]);

  const switchRole = (newRole: 'student' | 'mentor') => {
    localStorage.setItem('parthsaarthi_demo_role', newRole);
    setCurrentRole(newRole);
    if (newRole === 'mentor') {
      setUserName('Rahul Sharma');
      router.push('/mentor/releases');
    } else {
      setUserName('Vaibhav Raj Sahni');
      router.push('/student');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Academic Sub-bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-8 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
          <span className="font-semibold tracking-wider uppercase text-slate-200">
            IIM Lucknow Portal Extension
          </span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-slate-400 hidden sm:inline">
            Feature Prototype: Scheduled Slot Release
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-200 font-medium">{currentIST || 'IST'}</span>
            <span className="text-slate-500 hidden md:inline">(Asia/Kolkata)</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-[11px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded border border-slate-700 font-medium">
            Demo Environment
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Portal Branding */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-900 to-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm border border-blue-800/40 group-hover:scale-105 transition-transform">
                PS
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold text-slate-900 tracking-tight">Parthsaarthi</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200">
                    Release MVP
                  </span>
                </div>
                <p className="text-xs text-slate-500 -mt-0.5">Mentoring & SIP Slot Booking</p>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 ml-8">
              <Link
                href="/student"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/student'
                    ? 'bg-blue-50 text-blue-800 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Student View
              </Link>
              <Link
                href="/mentor/releases"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/mentor/releases'
                    ? 'bg-blue-50 text-blue-800 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Scheduled Releases
              </Link>
              <Link
                href="/mentor/create"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/mentor/create'
                    ? 'bg-blue-50 text-blue-800 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                + Schedule Release
              </Link>
            </nav>
          </div>

          {/* User Role Switcher & Profile */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-900">{userName}</span>
              <span className="text-[11px] text-slate-500 capitalize">
                {currentRole === 'mentor' ? 'Senior Mentor' : 'Junior Batch (580)'}
              </span>
            </div>

            <button
              onClick={() => switchRole(currentRole === 'mentor' ? 'student' : 'mentor')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-300 transition-colors"
              title="Toggle between Student and Mentor persona"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-slate-600" />
              <span>Switch to {currentRole === 'mentor' ? 'Student' : 'Mentor'}</span>
            </button>

            <Link
              href="/login"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Change User / Login"
            >
              <User className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
