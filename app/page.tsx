"use client";

import React from "react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#05070e] text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950">
      {/* TOP NAVIGATION */}
      <header className="w-full max-w-6xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-200 text-slate-950 font-black flex items-center justify-center text-lg shadow-md shadow-amber-200/10">
            D
          </div>
          <div>
            <span className="text-base font-extrabold tracking-widest uppercase text-white">Dailygen</span>
            <span className="block text-[10px] uppercase tracking-widest text-amber-200/80 font-semibold">
              Executive OS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">
            Created by <span className="text-amber-200 font-semibold">Rishanth Velvijayan</span>
          </span>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:border-slate-700 transition-all tick-nav-btn"
          >
            Launch Command →
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="max-w-4xl mx-auto px-6 py-16 text-center space-y-8 flex-1 flex flex-col justify-center items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-bold tracking-wider uppercase">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          Personal Command Centre
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-3xl leading-[1.15]">
          Architect Your Daily Velocity & Discipline.
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
          The high-leverage operating system for high achievers. Plan priorities, monitor event countdowns, track habits, and archive daily debriefs with visual snapshots.
        </p>

        {/* LAUNCH COMMAND BUTTON */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-amber-300 hover:bg-amber-200 text-slate-950 text-sm font-extrabold tracking-wide uppercase shadow-lg shadow-amber-300/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
          >
            <span>Launch Command</span>
            <span>→</span>
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 text-slate-300 text-sm font-bold tracking-wide transition-all"
          >
            Explore System
          </a>
        </div>

        {/* FEATURE PILLS */}
        <div id="features" className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-12 max-w-3xl w-full">
          {[
            { label: "Tactical Matrix", desc: "Prioritize with speed" },
            { label: "Countdowns", desc: "Exams & Milestone dates" },
            { label: "Day Debrief", desc: "Reflections & 5 Snapshots" },
            { label: "Bespoke Themes", desc: "Greek & Classical styles" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-left space-y-1 hover:border-slate-700 transition-colors"
            >
              <h3 className="text-xs font-bold text-white">{item.label}</h3>
              <p className="text-[11px] text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
        <div>
          © 2026 Dailygen. Designed & Built by <span className="text-slate-300 font-semibold">Rishanth Velvijayan</span>.
        </div>
        <div className="flex items-center gap-4">
          <span>Enterprise Dock Edition</span>
          <span>•</span>
          <span className="text-emerald-400 font-medium">System Online</span>
        </div>
      </footer>
    </div>
  );
}