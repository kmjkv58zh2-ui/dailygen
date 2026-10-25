"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LandingPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (supabase) {
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user?.email) setUserEmail(data.user.email);
      }).catch(() => {});
    }
    const saved = localStorage.getItem("dg_user_email");
    if (saved) setUserEmail(saved);
  }, []);

  const handleGoogleAuth = async (action: "login" | "signup") => {
    if (!supabase) {
      const email = prompt(`[${action.toUpperCase()}] Enter your Google email to test account:`);
      if (email && email.includes("@")) {
        setUserEmail(email);
        localStorage.setItem("dg_user_email", email);
        setIsAuthModalOpen(false);
      }
      return;
    }

    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined,
        },
      });
    } catch (err) {
      console.error(err);
      const email = prompt(`[${action.toUpperCase()}] Enter your Google email to test account:`);
      if (email && email.includes("@")) {
        setUserEmail(email);
        localStorage.setItem("dg_user_email", email);
        setIsAuthModalOpen(false);
      }
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      try { await supabase.auth.signOut(); } catch {}
    }
    localStorage.removeItem("dg_user_email");
    setUserEmail(null);
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* HEADER */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-200 text-slate-950 font-black flex items-center justify-center text-lg shadow-sm">
            D
          </div>
          <span className="text-base font-extrabold tracking-widest uppercase text-white">Dailygen</span>
        </div>

        {/* TOP RIGHT AUTH AREA */}
        <div className="flex items-center gap-3">
          {userEmail ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl font-medium">
                {userEmail}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 px-2 py-1.5"
              >
                Log out
              </button>
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-300 text-slate-950 hover:bg-amber-200 transition-all ml-1"
              >
                Open Dashboard →
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-700/80 text-white hover:bg-slate-800 transition-all shadow-sm"
              >
                Login / Sign up
              </button>
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-300 text-slate-950 hover:bg-amber-200 transition-all shadow-sm"
              >
                Launch App →
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="max-w-4xl mx-auto px-6 py-16 text-center space-y-8 flex-1 flex flex-col justify-center items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-bold tracking-wider uppercase">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          Your Daily Planner & Tracker
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-3xl leading-[1.15]">
          Organize your day, finish tasks, and never miss big dates.
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
          Plan hour-by-hour schedules, check off tasks, count down to board exams and birthdays, and save your daily debrief with photos.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-amber-300 hover:bg-amber-200 text-slate-950 text-sm font-extrabold tracking-wide uppercase shadow-lg shadow-amber-300/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
          >
            <span>Open Planner</span>
            <span>→</span>
          </Link>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 text-slate-200 text-sm font-bold flex items-center justify-center gap-2.5 transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z" />
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
              <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.1-2 .4-2.7L1.6 6.4C.6 8.3 0 10.1 0 12s.6 3.7 1.6 5.6l3.7-2.9z" />
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z" />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-10 max-w-3xl w-full text-left">
          {[
            { title: "Daily Schedule", desc: "Hour-by-hour timeblocks" },
            { title: "Task Matrix", desc: "Snappy checklist" },
            { title: "Countdowns", desc: "Exams & Birthdays" },
            { title: "Day Debrief", desc: "Journal & 5 photos" },
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1">
              <h3 className="text-xs font-bold text-white">{item.title}</h3>
              <p className="text-[11px] text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-400">
        <div>
          Designed and Built by <span className="text-slate-200 font-bold">Rishanth Velvijayan</span>
        </div>
        <div>© 2026 Dailygen. All rights reserved.</div>
      </footer>

      {/* GOOGLE AUTH POPUP MODAL */}
      {isAuthModalOpen && (
        <div
          onClick={() => setIsAuthModalOpen(false)}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 tick-anim-fade"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-6 tick-modal-pop"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white">Welcome to Dailygen</h3>
                <p className="text-xs text-slate-400 mt-1">Sign up or access your saved command dashboard.</p>
              </div>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleGoogleAuth("signup")}
                className="w-full flex items-center justify-center gap-3 p-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs transition-all shadow-sm active:scale-95"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                  <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.1-2 .4-2.7L1.6 6.4C.6 8.3 0 10.1 0 12s.6 3.7 1.6 5.6l3.7-2.9z" />
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z" />
                </svg>
                <span>Sign up with Google account</span>
              </button>

              <button
                onClick={() => handleGoogleAuth("login")}
                className="w-full flex items-center justify-center gap-3 p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white font-bold text-xs transition-all active:scale-95"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                  <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.1-2 .4-2.7L1.6 6.4C.6 8.3 0 10.1 0 12s.6 3.7 1.6 5.6l3.7-2.9z" />
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z" />
                </svg>
                <span>Log in with Google (Already have account)</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 text-center">
              Secured with Google OAuth. Your daily items will automatically sync.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}