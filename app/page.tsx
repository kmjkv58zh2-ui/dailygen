import React from "react";
import Link from "next/link";

export default function Home() {
  const pillars = [
    {
      num: "01",
      title: "Daily Planner",
      desc: "Structure your hours with clarity. Map out high-focus blocks before cognitive drift sets in.",
      badge: "Focus",
    },
    {
      num: "02",
      title: "Task Matrix",
      desc: "Execute high-leverage tasks grouped by real priority, clear impact, and zero noise.",
      badge: "Velocity",
    },
    {
      num: "03",
      title: "Habit Tracker",
      desc: "Build consistency through identity-based routines backed by consecutive streak accountability.",
      badge: "Cadence",
    },
    {
      num: "04",
      title: "Goals & Milestones",
      desc: "Calibrate broad quarterly ambition into concrete, trackable percentage targets.",
      badge: "Vision",
    },
    {
      num: "05",
      title: "Evening Debrief",
      desc: "End each day with deliberate reflection, lesson capture, and a clean mental reset.",
      badge: "Clarity",
    },
  ];

  return (
    <main className="min-h-screen bg-[#050B14] text-[#F4F4F5] flex flex-col relative overflow-hidden selection:bg-[#D8BC80] selection:text-[#050B14]">
      {/* Ambient Royal Gold Glows */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#D8BC80]/[0.05] rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute top-1/3 -right-20 w-[500px] h-[500px] bg-[#1d3557]/15 rounded-full blur-[160px]" />

      {/* Top Dock Header */}
      <header className="w-full border-b border-white/[0.07] bg-[#050B14]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D8BC80] to-[#99773F] flex items-center justify-center font-black text-[#050B14] text-sm shadow-[0_0_20px_rgba(216,188,128,0.25)]">
              D
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-white text-base block">Dailygen</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#D8BC80]/70 block">Command Engine</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-slate-300 hover:text-white transition hidden sm:block"
            >
              Command Overview
            </Link>
            <Link
              href="/dashboard"
              className="text-xs font-bold bg-[#D8BC80] text-[#050B14] px-4 py-2 rounded-xl hover:bg-[#e4cb93] transition shadow-[0_0_15px_rgba(216,188,128,0.2)]"
            >
              Launch Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto pt-24 pb-20 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#D8BC80]/30 bg-[#D8BC80]/10 text-[#D8BC80] text-[11px] font-bold uppercase tracking-widest mb-8">
          Your life. Your direction.
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
          The personal command centre for{" "}
          <span className="bg-gradient-to-r from-[#D8BC80] via-[#F3E5AB] to-[#D8BC80] bg-clip-text text-transparent">
            disciplined achievers
          </span>
          .
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mb-10 leading-relaxed font-light">
          Dailygen integrates your planner, execution matrix, habits, targets, and evening debrief into a focused, unified environment.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto bg-[#D8BC80] text-[#050B14] font-extrabold text-sm px-8 py-4 rounded-xl hover:bg-[#e4cb93] transition duration-200 shadow-xl shadow-[#D8BC80]/20 text-center"
          >
            Open Command Deck
          </Link>
          <a
            href="#pillars"
            className="w-full sm:w-auto border border-white/[0.1] bg-white/[0.02] hover:bg-white/[0.06] text-white font-semibold text-sm px-8 py-4 rounded-xl transition duration-200 text-center"
          >
            Explore 5 Pillars
          </a>
        </div>
      </section>

      {/* 5 Core Pillars Section */}
      <section id="pillars" className="max-w-6xl mx-auto px-6 py-20 w-full relative z-10 border-t border-white/[0.07]">
        <div className="text-center mb-14">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#D8BC80] block mb-2">Architecture</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Built for execution, not passive note-taking.
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-xl mx-auto">
            Five synchronized modules engineered to help you execute consistently without workflow friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-white/[0.07] bg-[#0A1424]/60 backdrop-blur-md hover:border-[#D8BC80]/40 transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono text-[#D8BC80] font-bold">{item.num}</span>
                  <span className="text-[10px] font-bold text-[#D8BC80] uppercase tracking-wider bg-[#D8BC80]/10 px-2.5 py-1 rounded-md border border-[#D8BC80]/20">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#D8BC80] transition">{item.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-white/[0.07] py-8 text-center text-xs text-slate-500 relative z-10">
        <p>© 2026 Dailygen. Created by Rishanth Velvijayan. Built for purposeful living.</p>
      </footer>
    </main>
  );
}