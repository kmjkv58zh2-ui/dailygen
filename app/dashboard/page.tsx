"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type TabType = "command" | "planner" | "tasks" | "habits" | "goals" | "reflection";

interface ScheduleBlock {
  id: number;
  time: string;
  activity: string;
  tag: string;
}

interface Task {
  id: string | number;
  title: string;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
}

interface Habit {
  id: string | number;
  title: string;
  streak: number;
  completedToday: boolean;
}

interface Goal {
  id: string | number;
  title: string;
  progress: number;
}

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("command");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Pillar States
  const [primeObjective, setPrimeObjective] = useState("Scale Dailygen to MVP Release");
  const [schedule, setSchedule] = useState<ScheduleBlock[]>([
    { id: 1, time: "09:00 - 11:30", activity: "Deep Work: Command Deck Polish", tag: "Focus" },
    { id: 2, time: "12:00 - 13:30", activity: "Cloud Persistence & Auth Integration", tag: "Core" },
    { id: 3, time: "16:00 - 17:30", activity: "Architecture Review & Retro", tag: "Review" },
  ]);
  const [newTime, setNewTime] = useState("");
  const [newActivity, setNewActivity] = useState("");
  const [newTag, setNewTag] = useState("Focus");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"High" | "Medium" | "Low">("High");

  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitTitle, setNewHabitTitle] = useState("");

  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoalTitle, setNewGoalTitle] = useState("");

  const [reflectionText, setReflectionText] = useState("");
  const [dayRating, setDayRating] = useState<number | null>(5);
  const [statusMsg, setStatusMsg] = useState("System Ready");

  // Load Cloud Data when user logs in, fallback to LocalStorage
  const loadUserData = async (currentUser: User) => {
    try {
      setStatusMsg("Syncing Cloud...");

      // Fetch Tasks
      const { data: cloudTasks } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (cloudTasks && cloudTasks.length > 0) {
        setTasks(
          cloudTasks.map((t) => ({
            id: t.id,
            title: t.title,
            priority: (t.priority as "High" | "Medium" | "Low") || "High",
            completed: t.completed,
          }))
        );
      }

      // Fetch Habits
      const { data: cloudHabits } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (cloudHabits && cloudHabits.length > 0) {
        setHabits(
          cloudHabits.map((h) => ({
            id: h.id,
            title: h.title,
            streak: h.streak,
            completedToday: h.completed_today,
          }))
        );
      }

      // Fetch Goals
      const { data: cloudGoals } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (cloudGoals && cloudGoals.length > 0) {
        setGoals(
          cloudGoals.map((g) => ({
            id: g.id,
            title: g.title,
            progress: g.progress,
          }))
        );
      }

      setStatusMsg("Cloud Linked ✓");
    } catch {
      setStatusMsg("Offline Mode");
    }
  };

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
        loadUserData(data.user);
      } else {
        // Fallback to local storage
        try {
          const sTasks = localStorage.getItem("dg_pro_tasks");
          if (sTasks) setTasks(JSON.parse(sTasks));
          const sHabits = localStorage.getItem("dg_habits");
          if (sHabits) setHabits(JSON.parse(sHabits));
          const sGoals = localStorage.getItem("dg_pro_goals");
          if (sGoals) setGoals(JSON.parse(sGoals));
        } catch {}
      }
    }
    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) loadUserData(u);
    });

    setMounted(true);
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Auth Handler
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    if (authMode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setAuthError(error.message);
      else {
        setUser(data.user);
        setAuthModalOpen(false);
        setStatusMsg("Account Created ✓");
        if (data.user) loadUserData(data.user);
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthError(error.message);
      else {
        setUser(data.user);
        setAuthModalOpen(false);
        setStatusMsg("Cloud Sync Active ✓");
        if (data.user) loadUserData(data.user);
      }
    }
    setAuthLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setStatusMsg("Offline Mode");
  };

  // 1. Task Operations
  const toggleTask = async (id: string | number) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;
    const nextCompleted = !target.completed;

    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: nextCompleted } : t)));

    if (user && typeof id === "string") {
      await supabase.from("tasks").update({ completed: nextCompleted }).eq("id", id);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    if (user) {
      const { data } = await supabase
        .from("tasks")
        .insert([{ user_id: user.id, title: newTaskTitle.trim(), priority: newTaskPriority, completed: false }])
        .select()
        .single();

      if (data) {
        setTasks([{ id: data.id, title: data.title, priority: data.priority, completed: data.completed }, ...tasks]);
      }
    } else {
      setTasks([
        { id: Date.now(), title: newTaskTitle.trim(), priority: newTaskPriority, completed: false },
        ...tasks,
      ]);
    }
    setNewTaskTitle("");
  };

  const deleteTask = async (id: string | number) => {
    setTasks(tasks.filter((t) => t.id !== id));
    if (user && typeof id === "string") {
      await supabase.from("tasks").delete().eq("id", id);
    }
  };

  // 2. Habit Operations
  const toggleHabit = async (id: string | number) => {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;
    const nextCompleted = !habit.completedToday;
    const nextStreak = nextCompleted ? habit.streak + 1 : Math.max(0, habit.streak - 1);

    setHabits(
      habits.map((h) => (h.id === id ? { ...h, completedToday: nextCompleted, streak: nextStreak } : h))
    );

    if (user && typeof id === "string") {
      await supabase
        .from("habits")
        .update({ completed_today: nextCompleted, streak: nextStreak })
        .eq("id", id);
    }
  };

  const addHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;

    if (user) {
      const { data } = await supabase
        .from("habits")
        .insert([{ user_id: user.id, title: newHabitTitle.trim(), streak: 0, completed_today: false }])
        .select()
        .single();

      if (data) {
        setHabits([
          { id: data.id, title: data.title, streak: data.streak, completedToday: data.completed_today },
          ...habits,
        ]);
      }
    } else {
      setHabits([
        ...habits,
        { id: Date.now(), title: newHabitTitle.trim(), streak: 0, completedToday: false },
      ]);
    }
    setNewHabitTitle("");
  };

  const deleteHabit = async (id: string | number) => {
    setHabits(habits.filter((h) => h.id !== id));
    if (user && typeof id === "string") {
      await supabase.from("habits").delete().eq("id", id);
    }
  };

  // 3. Goal Operations
  const addGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    if (user) {
      const { data } = await supabase
        .from("goals")
        .insert([{ user_id: user.id, title: newGoalTitle.trim(), progress: 0 }])
        .select()
        .single();

      if (data) {
        setGoals([...goals, { id: data.id, title: data.title, progress: data.progress }]);
      }
    } else {
      setGoals([...goals, { id: Date.now(), title: newGoalTitle.trim(), progress: 0 }]);
    }
    setNewGoalTitle("");
  };

  const adjustGoal = async (id: string | number, delta: number) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;
    const nextProgress = Math.min(100, Math.max(0, goal.progress + delta));

    setGoals(goals.map((g) => (g.id === id ? { ...g, progress: nextProgress } : g)));

    if (user && typeof id === "string") {
      await supabase.from("goals").update({ progress: nextProgress }).eq("id", id);
    }
  };

  // 4. Schedule & Debrief
  const addSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTime.trim() || !newActivity.trim()) return;
    setSchedule([...schedule, { id: Date.now(), time: newTime.trim(), activity: newActivity.trim(), tag: newTag }]);
    setNewTime("");
    setNewActivity("");
  };

  const deleteSchedule = (id: number) => {
    setSchedule(schedule.filter((s) => s.id !== id));
  };

  const triggerSaveReflection = async () => {
    if (user) {
      await supabase.from("reflections").insert([
        { user_id: user.id, content: reflectionText, rating: dayRating },
      ]);
    }
    setStatusMsg("Reflection Saved ✓");
    setTimeout(() => setStatusMsg("Cloud Linked ✓"), 2500);
  };

  const switchTab = (tab: TabType) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  if (!mounted) return <div className="min-h-screen bg-[#050B14]" />;

  const completedCount = tasks.filter((t) => t.completed).length;
  const executionPercent = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
  const habitsDone = habits.filter((h) => h.completedToday).length;

  const navItems = [
    { id: "command", label: "Overview Deck", icon: "❖" },
    { id: "planner", label: "1. Daily Planner", icon: "◷" },
    { id: "tasks", label: "2. Task Matrix", icon: "✓" },
    { id: "habits", label: "3. Habits Tracker", icon: "⚡" },
    { id: "goals", label: "4. Goals & Milestones", icon: "◎" },
    { id: "reflection", label: "5. Evening Debrief", icon: "✦" },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#050B14] text-[#F4F4F5] antialiased relative">
      <div className="pointer-events-none fixed -top-40 left-1/3 w-[650px] h-[550px] bg-[#D8BC80]/[0.04] rounded-full blur-[150px]" />
      <div className="pointer-events-none fixed bottom-0 right-10 w-[600px] h-[600px] bg-[#1d3557]/15 rounded-full blur-[170px]" />

      {/* AUTH MODAL */}
      {authModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl border border-[#D8BC80]/30 bg-[#070E1A] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-[#D8BC80]">
                {authMode === "signin" ? "Executive Access" : "Create Account"}
              </span>
              <button onClick={() => setAuthModalOpen(false)} className="text-slate-500 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              <input
                type="email"
                required
                placeholder="founder@dailygen.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0A1424] border border-white/[0.09] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D8BC80]"
              />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0A1424] border border-white/[0.09] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D8BC80]"
              />

              {authError && <p className="text-rose-400 text-[11px]">{authError}</p>}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-[#D8BC80] text-[#050B14] font-bold text-xs py-2.5 rounded-xl hover:bg-[#e4cb93] transition disabled:opacity-50"
              >
                {authLoading ? "Authenticating..." : authMode === "signin" ? "Sign In" : "Sign Up"}
              </button>
            </form>

            <div className="text-center">
              <button
                onClick={() => {
                  setAuthMode(authMode === "signin" ? "signup" : "signin");
                  setAuthError("");
                }}
                className="text-[11px] text-slate-400 hover:text-[#D8BC80] transition"
              >
                {authMode === "signin" ? "Need an account? Sign up" : "Already registered? Sign in"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BACKDROP */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* EXECUTIVE DOCK */}
      <aside
        className={`fixed md:static top-0 bottom-0 left-0 w-64 border-r border-white/[0.07] bg-[#070E1A]/95 md:bg-[#070E1A]/80 flex flex-col justify-between p-5 select-none shrink-0 backdrop-blur-2xl z-50 transition-transform duration-300 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D8BC80] via-[#C5A563] to-[#8C6D34] flex items-center justify-center font-black text-[#050B14] text-base shadow-[0_0_25px_rgba(216,188,128,0.25)] group-hover:scale-105 transition duration-200">
                D
              </div>
              <div>
                <span className="font-extrabold tracking-tight text-white text-base block leading-tight">Dailygen</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#D8BC80]/70 block mt-0.5">Executive Dock</span>
              </div>
            </Link>
            <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-white text-base px-2 py-1">
              ✕
            </button>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => switchTab(item.id as TabType)}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition duration-150 ${
                    active
                      ? "bg-gradient-to-r from-[#D8BC80]/20 to-transparent text-[#D8BC80] border-l-2 border-[#D8BC80] shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <span className={`text-sm ${active ? "text-[#D8BC80]" : "text-slate-500"}`}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card */}
        <div className="pt-4 border-t border-white/[0.07] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#D8BC80]/20 to-[#D8BC80]/5 border border-[#D8BC80]/30 flex items-center justify-center text-xs font-bold text-[#D8BC80]">
                {user ? user.email?.slice(0, 2).toUpperCase() : "DG"}
              </div>
              <div className="truncate max-w-[120px]">
                <p className="text-xs font-bold text-white truncate">{user ? user.email : "Master Control"}</p>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {user ? "Cloud Linked" : statusMsg}
                </p>
              </div>
            </div>
          </div>

          {user ? (
            <button
              onClick={handleSignOut}
              className="w-full text-left text-[11px] text-slate-500 hover:text-rose-400 transition"
            >
              Sign Out →
            </button>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full bg-[#D8BC80]/10 hover:bg-[#D8BC80] text-[#D8BC80] hover:text-[#050B14] border border-[#D8BC80]/30 font-bold text-xs py-2 rounded-xl transition duration-150 text-center block"
            >
              Connect Supabase Cloud
            </button>
          )}
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative z-10">
        <header className="h-16 border-b border-white/[0.07] bg-[#050B14]/70 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-[#D8BC80] hover:bg-white/10 transition"
              title="Open Navigation"
            >
              ☰
            </button>
            <span className="text-xs font-bold uppercase tracking-widest text-[#D8BC80]">Dailygen</span>
            <span className="text-white/20">/</span>
            <span className="text-xs text-slate-300 font-medium capitalize truncate max-w-[120px] sm:max-w-none">
              {activeTab} View
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 sm:gap-2 bg-[#0A1424] border border-white/[0.08] px-2.5 sm:px-3.5 py-1.5 rounded-xl">
              <span className="text-slate-400 hidden xs:inline">Velocity:</span>
              <span className="text-white font-bold">{executionPercent}%</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 bg-[#0A1424] border border-white/[0.08] px-2.5 sm:px-3.5 py-1.5 rounded-xl">
              <span className="text-slate-400 hidden xs:inline">Habits:</span>
              <span className="text-[#D8BC80] font-bold">{habitsDone}/{habits.length}</span>
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT AREA */}
        <div className="p-4 sm:p-8 max-w-6xl w-full mx-auto space-y-6 sm:space-y-8 flex-1">
          {activeTab === "command" && (
            <div className="space-y-6 sm:space-y-8">
              <div className="glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#D8BC80]/[0.06] rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D8BC80] animate-ping" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#D8BC80]">Today's Strategic Focus</span>
                  </div>
                  <input
                    type="text"
                    value={primeObjective}
                    onChange={(e) => setPrimeObjective(e.target.value)}
                    className="w-full bg-transparent text-xl sm:text-3xl font-extrabold text-white tracking-tight focus:outline-none placeholder-slate-600 border-b border-transparent focus:border-[#D8BC80]/40 transition pb-1"
                  />
                  <p className="text-xs text-slate-400">Click to redefine today's single most critical priority.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div onClick={() => switchTab("tasks")} className="glass-panel p-5 sm:p-6 rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-white transition">Active Tasks</span>
                    <span className="text-xs font-mono text-[#D8BC80] bg-[#D8BC80]/10 border border-[#D8BC80]/20 px-2 py-0.5 rounded-md">
                      {tasks.filter((t) => !t.completed).length} Pending
                    </span>
                  </div>
                  <div className="text-3xl font-black text-white font-mono">{executionPercent}%</div>
                  <p className="text-xs text-slate-500 mt-2">Overall task completion velocity</p>
                </div>

                <div onClick={() => switchTab("habits")} className="glass-panel p-5 sm:p-6 rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-white transition">Habit Cadence</span>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-md">
                      {habitsDone} Done
                    </span>
                  </div>
                  <div className="text-3xl font-black text-white font-mono">{habits.length} Staked</div>
                  <p className="text-xs text-slate-500 mt-2">Daily discipline & routines</p>
                </div>

                <div onClick={() => switchTab("goals")} className="glass-panel p-5 sm:p-6 rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-white transition">Quarterly Goals</span>
                    <span className="text-xs font-mono text-[#D8BC80] bg-[#D8BC80]/10 border border-[#D8BC80]/20 px-2 py-0.5 rounded-md">
                      {goals.length} Targets
                    </span>
                  </div>
                  <div className="text-3xl font-black text-white font-mono">
                    {goals.length ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length) : 0}%
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Mean objective advancement</p>
                </div>
              </div>

              <div className="glass-panel rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#D8BC80]">Tactical Focus Matrix</h3>
                  <button onClick={() => switchTab("tasks")} className="text-xs text-slate-300 hover:text-[#D8BC80] font-semibold transition">
                    Open Task Matrix →
                  </button>
                </div>
                <div className="space-y-2">
                  {tasks.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-4">No tasks found. Add your first goal or task below.</p>
                  ) : (
                    tasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-white/[0.05] bg-white/[0.015] hover:bg-white/[0.03] cursor-pointer transition group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] transition ${
                            task.completed ? "bg-[#D8BC80] text-[#050B14] border-[#D8BC80] font-bold" : "border-white/30 group-hover:border-[#D8BC80]"
                          }`}>
                            {task.completed && "✓"}
                          </div>
                          <span className={`text-sm ${task.completed ? "line-through text-slate-500" : "text-slate-200 font-medium"}`}>
                            {task.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                          {task.priority}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "planner" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">1. Daily Planner</h2>
                <p className="text-xs text-slate-400 mt-1">Structure execution blocks with zero cognitive drift.</p>
              </div>

              <div className="space-y-3">
                {schedule.map((block) => (
                  <div key={block.id} className="glass-panel flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl gap-2 sm:gap-4 transition group">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <span className="text-xs font-mono text-[#D8BC80] bg-[#D8BC80]/10 border border-[#D8BC80]/20 px-3 py-1 rounded-md font-semibold shrink-0">
                        {block.time}
                      </span>
                      <span className="text-sm font-semibold text-slate-200">{block.activity}</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                        {block.tag}
                      </span>
                      <button onClick={() => deleteSchedule(block.id)} className="text-slate-500 hover:text-rose-400 text-xs px-2 py-1 transition">
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={addSchedule} className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/[0.07]">
                <input
                  type="text"
                  placeholder="09:00 - 11:30"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="bg-[#0A1424] border border-white/[0.09] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 sm:w-40 font-mono focus:outline-none focus:border-[#D8BC80]"
                />
                <input
                  type="text"
                  placeholder="Activity focus..."
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  className="flex-1 bg-[#0A1424] border border-white/[0.09] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D8BC80]"
                />
                <select
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="bg-[#0A1424] border border-white/[0.09] rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-[#D8BC80]"
                >
                  <option value="Focus">Focus</option>
                  <option value="Core">Core</option>
                  <option value="Review">Review</option>
                </select>
                <button type="submit" className="bg-[#D8BC80] text-[#050B14] font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-[#e4cb93] transition shrink-0">
                  + Add Block
                </button>
              </form>
            </div>
          )}

          {activeTab === "tasks" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">2. Task Matrix</h2>
                  <p className="text-xs text-slate-400 mt-1">High-leverage tasks prioritized by real impact.</p>
                </div>
                <span className="text-xs font-mono text-[#D8BC80] bg-[#D8BC80]/10 border border-[#D8BC80]/20 px-3 py-1 rounded-lg self-start sm:self-auto">
                  {completedCount} of {tasks.length} Completed
                </span>
              </div>

              <form onSubmit={addTask} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Enter high-leverage task..."
                  className="flex-1 bg-[#0A1424] border border-white/[0.09] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D8BC80] transition"
                />
                <div className="flex gap-2">
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as "High" | "Medium" | "Low")}
                    className="flex-1 sm:flex-initial bg-[#0A1424] border border-white/[0.09] rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-[#D8BC80]"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                  <button type="submit" className="bg-[#D8BC80] text-[#050B14] font-bold text-xs px-6 py-3 rounded-xl hover:bg-[#e4cb93] transition shrink-0">
                    + Add
                  </button>
                </div>
              </form>

              <div className="space-y-2.5">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`glass-panel flex items-center justify-between p-4 rounded-xl transition-all ${
                      task.completed ? "opacity-40" : "hover:border-white/20"
                    } group`}
                  >
                    <div onClick={() => toggleTask(task.id)} className="flex items-center gap-3.5 cursor-pointer flex-1 mr-2">
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center text-xs font-black transition ${
                        task.completed ? "bg-[#D8BC80] border-[#D8BC80] text-[#050B14]" : "border-white/25 hover:border-[#D8BC80]"
                      }`}>
                        {task.completed && "✓"}
                      </div>
                      <span className={`text-sm ${task.completed ? "line-through text-slate-500" : "text-white font-medium"}`}>
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        task.priority === "High" ? "text-amber-300 bg-amber-400/10 border-amber-300/20" : "text-slate-400 bg-white/5 border-white/10"
                      }`}>
                        {task.priority}
                      </span>
                      <button onClick={() => deleteTask(task.id)} className="text-slate-500 hover:text-rose-400 text-xs px-1">
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "habits" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">3. Habits Tracker</h2>
                <p className="text-xs text-slate-400 mt-1">Identity-driven routines built on unbreakable streaks.</p>
              </div>

              <form onSubmit={addHabit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newHabitTitle}
                  onChange={(e) => setNewHabitTitle(e.target.value)}
                  placeholder="Define daily habit routine..."
                  className="flex-1 bg-[#0A1424] border border-white/[0.09] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D8BC80]"
                />
                <button type="submit" className="bg-[#D8BC80] text-[#050B14] font-bold text-xs px-6 py-3 rounded-xl hover:bg-[#e4cb93] transition shrink-0">
                  + Add Habit
                </button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {habits.map((habit) => (
                  <div key={habit.id} className="glass-panel p-5 rounded-2xl flex items-center justify-between group">
                    <div>
                      <h4 className="text-sm font-bold text-white">{habit.title}</h4>
                      <p className="text-xs text-[#D8BC80] font-mono mt-1 font-semibold">🔥 {habit.streak} Consecutive Days</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleHabit(habit.id)}
                        className={`text-xs px-4 py-2 rounded-xl font-bold transition-all ${
                          habit.completedToday
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-white/5 text-slate-300 border border-white/10 hover:border-[#D8BC80] hover:text-[#D8BC80]"
                        }`}
                      >
                        {habit.completedToday ? "Completed ✓" : "Check-in"}
                      </button>
                      <button onClick={() => deleteHabit(habit.id)} className="text-slate-500 hover:text-rose-400 text-xs px-1">
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "goals" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">4. Goals & Milestones</h2>
                <p className="text-xs text-slate-400 mt-1">High-level vision calibrated into measurable metrics.</p>
              </div>

              <form onSubmit={addGoal} className="flex gap-3">
                <input
                  type="text"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  placeholder="Target outcome / milestone..."
                  className="flex-1 bg-[#0A1424] border border-white/[0.09] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D8BC80]"
                />
                <button type="submit" className="bg-[#D8BC80] text-[#050B14] font-bold text-xs px-6 py-3 rounded-xl hover:bg-[#e4cb93] transition shrink-0">
                  + Add Goal
                </button>
              </form>

              <div className="space-y-4">
                {goals.map((goal) => (
                  <div key={goal.id} className="glass-panel p-5 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-white tracking-tight">{goal.title}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[#D8BC80] font-extrabold">{goal.progress}%</span>
                        <div className="flex gap-1">
                          <button onClick={() => adjustGoal(goal.id, 10)} className="text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded text-slate-300 hover:bg-white/10 font-mono">
                            +10%
                          </button>
                          <button onClick={() => adjustGoal(goal.id, -10)} className="text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded text-slate-300 hover:bg-white/10 font-mono">
                            -10%
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden p-0.5">
                      <div className="h-full bg-gradient-to-r from-[#D8BC80]/70 to-[#D8BC80] rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(216,188,128,0.4)]" style={{ width: `${goal.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "reflection" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">5. Evening Debrief</h2>
                <p className="text-xs text-slate-400 mt-1">Review the day with candor. Close loops before tomorrow begins.</p>
              </div>

              <div className="glass-panel p-5 sm:p-6 rounded-2xl space-y-5">
                <textarea
                  rows={5}
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  placeholder="Record breakthroughs, friction points, and lessons..."
                  className="w-full bg-[#050B14] border border-white/[0.09] rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#D8BC80] transition resize-none"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-400">Daily Calibration:</span>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setDayRating(star)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                            dayRating === star ? "bg-[#D8BC80] text-[#050B14] shadow-[0_0_12px_rgba(216,188,128,0.4)]" : "border border-white/10 text-slate-400 hover:border-[#D8BC80]"
                          }`}
                        >
                          {star}★
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={triggerSaveReflection}
                    className="bg-[#D8BC80] text-[#050B14] font-bold text-xs px-6 py-2.5 rounded-xl hover:bg-[#e4cb93] transition shadow-md shadow-[#D8BC80]/15"
                  >
                    Lock Debrief
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}