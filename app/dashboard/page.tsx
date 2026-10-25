"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface ScheduleBlock {
  id: string;
  time: string;
  activity: string;
  done: boolean;
}

interface Task {
  id: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
}

interface Habit {
  id: string;
  name: string;
  completed: boolean;
  streak: number;
}

interface CountdownItem {
  id: string;
  title: string;
  targetDate: string;
}

interface DebriefEntry {
  notes: string;
  rating: string;
  images: string[];
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Strategic Focus
  const [mainGoal, setMainGoal] = useState("Finish project deliverables & workout");
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState("");

  // TAB 1: DAILY PLANNER (Schedule)
  const [schedule, setSchedule] = useState<ScheduleBlock[]>([
    { id: "s1", time: "07:00 AM - 08:30 AM", activity: "Morning Routine & Gym", done: true },
    { id: "s2", time: "09:00 AM - 12:30 PM", activity: "Deep Study & Project Work", done: false },
    { id: "s3", time: "02:00 PM - 05:00 PM", activity: "Classes / Coding Execution", done: false },
    { id: "s4", time: "08:00 PM - 09:30 PM", activity: "Review & Day Debrief", done: false },
  ]);
  const [newScheduleTime, setNewScheduleTime] = useState("");
  const [newScheduleAct, setNewScheduleAct] = useState("");

  // TAB 2: TASK MATRIX
  const [tasks, setTasks] = useState<Task[]>([
    { id: "t1", title: "Complete math sample questions", priority: "High", completed: false },
    { id: "t2", title: "Review Dailygen push", priority: "Medium", completed: true },
    { id: "t3", title: "Pack bag for tomorrow", priority: "Low", completed: false },
  ]);
  const [newTaskInput, setNewTaskInput] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"High" | "Medium" | "Low">("Medium");

  // TAB 3: HABITS TRACKER
  const [habits, setHabits] = useState<Habit[]>([
    { id: "h1", name: "Drink 3L Water", completed: true, streak: 5 },
    { id: "h2", name: "Gym / 45m Exercise", completed: false, streak: 3 },
    { id: "h3", name: "No Phone 30m Before Bed", completed: false, streak: 2 },
  ]);
  const [newHabitName, setNewHabitName] = useState("");

  // TAB 4: COUNTDOWNS
  const [countdowns, setCountdowns] = useState<CountdownItem[]>([
    { id: "c1", title: "Board Exams", targetDate: "2027-03-01T09:00" },
    { id: "c2", title: "Friend's Birthday", targetDate: "2026-11-15T00:00" },
  ]);
  const [newCountTitle, setNewCountTitle] = useState("");
  const [newCountDate, setNewCountDate] = useState("");

  // TAB 5: DAY DEBRIEF
  const [selectedDebriefDate, setSelectedDebriefDate] = useState<string>("");
  const [debriefEntries, setDebriefEntries] = useState<Record<string, DebriefEntry>>({});
  const [currentNotes, setCurrentNotes] = useState("");
  const [currentRating, setCurrentRating] = useState("Great");
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [saveBanner, setSaveBanner] = useState(false);

  useEffect(() => {
    setMounted(true);
    const today = new Date().toISOString().split("T")[0];
    setSelectedDebriefDate(today);

    if (supabase) {
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user?.email) setCurrentUserEmail(data.user.email);
      }).catch(() => {});
    }
    const savedEmail = localStorage.getItem("dg_user_email");
    if (savedEmail) setCurrentUserEmail(savedEmail);

    try {
      const g = localStorage.getItem("dg_main_goal");
      if (g) setMainGoal(g);

      const sch = localStorage.getItem("dg_schedule");
      if (sch) setSchedule(JSON.parse(sch));

      const t = localStorage.getItem("dg_tasks");
      if (t) setTasks(JSON.parse(t));

      const h = localStorage.getItem("dg_habits");
      if (h) setHabits(JSON.parse(h));

      const c = localStorage.getItem("dg_countdowns");
      if (c) setCountdowns(JSON.parse(c));

      const d = localStorage.getItem("dg_debriefs");
      if (d) {
        const parsed = JSON.parse(d);
        setDebriefEntries(parsed);
        if (parsed[today]) {
          setCurrentNotes(parsed[today].notes || "");
          setCurrentRating(parsed[today].rating || "Great");
          setCurrentImages(parsed[today].images || []);
        }
      }
    } catch {}
  }, []);

  const handleGoogleAuth = async (action: "login" | "signup") => {
    if (!supabase) {
      const email = prompt(`[${action.toUpperCase()}] Enter your Google email to connect:`);
      if (email && email.includes("@")) {
        setCurrentUserEmail(email);
        localStorage.setItem("dg_user_email", email);
        setIsAuthModalOpen(false);
      }
      return;
    }

    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: typeof window !== "undefined" ? window.location.href : undefined,
        },
      });
    } catch {
      const email = prompt(`[${action.toUpperCase()}] Enter your Google email:`);
      if (email && email.includes("@")) {
        setCurrentUserEmail(email);
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
    setCurrentUserEmail(null);
  };

  // SCHEDULE HANDLERS
  const addScheduleBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScheduleAct.trim()) return;
    const updated = [
      ...schedule,
      {
        id: Date.now().toString(),
        time: newScheduleTime.trim() || "All Day",
        activity: newScheduleAct.trim(),
        done: false,
      },
    ];
    setSchedule(updated);
    setNewScheduleTime("");
    setNewScheduleAct("");
    localStorage.setItem("dg_schedule", JSON.stringify(updated));
  };

  const toggleScheduleBlock = (id: string) => {
    const updated = schedule.map((s) => (s.id === id ? { ...s, done: !s.done } : s));
    setSchedule(updated);
    localStorage.setItem("dg_schedule", JSON.stringify(updated));
  };

  const deleteScheduleBlock = (id: string) => {
    const updated = schedule.filter((s) => s.id !== id);
    setSchedule(updated);
    localStorage.setItem("dg_schedule", JSON.stringify(updated));
  };

  // TASK HANDLERS
  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    const updated = [
      ...tasks,
      {
        id: Date.now().toString(),
        title: newTaskInput.trim(),
        priority: newTaskPriority,
        completed: false,
      },
    ];
    setTasks(updated);
    setNewTaskInput("");
    localStorage.setItem("dg_tasks", JSON.stringify(updated));
  };

  const toggleTask = (id: string) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    setTasks(updated);
    localStorage.setItem("dg_tasks", JSON.stringify(updated));
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    localStorage.setItem("dg_tasks", JSON.stringify(updated));
  };

  // HABITS HANDLERS
  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    const updated = [
      ...habits,
      { id: Date.now().toString(), name: newHabitName.trim(), completed: false, streak: 0 },
    ];
    setHabits(updated);
    setNewHabitName("");
    localStorage.setItem("dg_habits", JSON.stringify(updated));
  };

  const toggleHabit = (id: string) => {
    const updated = habits.map((h) => {
      if (h.id === id) {
        const next = !h.completed;
        return {
          ...h,
          completed: next,
          streak: next ? h.streak + 1 : Math.max(0, h.streak - 1),
        };
      }
      return h;
    });
    setHabits(updated);
    localStorage.setItem("dg_habits", JSON.stringify(updated));
  };

  const deleteHabit = (id: string) => {
    const updated = habits.filter((h) => h.id !== id);
    setHabits(updated);
    localStorage.setItem("dg_habits", JSON.stringify(updated));
  };

  // COUNTDOWNS
  const addCountdown = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCountTitle.trim() || !newCountDate) return;
    const updated = [
      ...countdowns,
      { id: Date.now().toString(), title: newCountTitle.trim(), targetDate: newCountDate },
    ];
    setCountdowns(updated);
    setNewCountTitle("");
    setNewCountDate("");
    localStorage.setItem("dg_countdowns", JSON.stringify(updated));
  };

  const removeCountdown = (id: string) => {
    const updated = countdowns.filter((c) => c.id !== id);
    setCountdowns(updated);
    localStorage.setItem("dg_countdowns", JSON.stringify(updated));
  };

  // FULL-FORM COUNTDOWN FORMATTING FUNCTION
  const getFullCountdownText = (targetStr: string) => {
    if (!mounted) return "Calculating remaining time...";
    const diff = new Date(targetStr).getTime() - new Date().getTime();
    if (diff <= 0) return "Passed";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

    const dayText = days === 1 ? "1 day" : `${days} days`;
    const hourText = hours === 1 ? "1 hour" : `${hours} hours`;

    return `${dayText} and ${hourText} remaining`;
  };

  // DAY DEBRIEF
  const handleDateChange = (dateStr: string) => {
    setSelectedDebriefDate(dateStr);
    const entry = debriefEntries[dateStr];
    if (entry) {
      setCurrentNotes(entry.notes || "");
      setCurrentRating(entry.rating || "Great");
      setCurrentImages(entry.images || []);
    } else {
      setCurrentNotes("");
      setCurrentRating("Great");
      setCurrentImages([]);
    }
  };

  const handleSaveDebrief = () => {
    if (!selectedDebriefDate) return;
    const updated = {
      ...debriefEntries,
      [selectedDebriefDate]: {
        notes: currentNotes,
        rating: currentRating,
        images: currentImages,
      },
    };
    setDebriefEntries(updated);
    localStorage.setItem("dg_debriefs", JSON.stringify(updated));
    setSaveBanner(true);
    setTimeout(() => setSaveBanner(false), 2200);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (currentImages.length + files.length > 5) {
      alert("You can upload a maximum of 5 images per day.");
      return;
    }

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === "string") {
          setCurrentImages((prev) => {
            if (prev.length < 5) return [...prev, reader.result as string];
            return prev;
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setCurrentImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const completedTasks = tasks.filter((t) => t.completed).length;
  const taskRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const doneHabits = habits.filter((h) => h.completed).length;

  return (
    <div className="min-h-screen flex bg-[#060913] text-slate-100 antialiased selection:bg-amber-400 selection:text-slate-900 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-slate-800 bg-[#060913] flex flex-col justify-between p-5 select-none shrink-0">
        <div className="space-y-6">
          {/* Logo clean without any text below */}
          <Link href="/" className="flex items-center gap-3 px-2 py-1 group">
            <div className="w-9 h-9 rounded-xl bg-amber-200 text-slate-950 font-black flex items-center justify-center text-base shadow-sm group-hover:scale-105 transition-transform">
              D
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-widest uppercase text-white">Dailygen</h1>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="space-y-1">
            {[
              { id: "overview", label: "Overview", icon: "❖" },
              { id: "planner", label: "1. Daily Planner", icon: "🕒" },
              { id: "matrix", label: "2. Task Matrix", icon: "✓" },
              { id: "habits", label: "3. Habits Tracker", icon: "⚡" },
              { id: "countdown", label: "4. Countdowns", icon: "⏳" },
              { id: "debrief", label: "5. Day Debrief", icon: "✦" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide tick-nav-btn ${
                  activeTab === tab.id
                    ? "bg-slate-800 text-white shadow-sm ring-1 ring-slate-700/60"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
              >
                <span className="text-sm">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* BOTTOM SECTION WITH ONLY DESIGNED AND BUILT CREDIT */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-3 px-1 text-center">
          <p className="text-[11px] font-medium text-slate-400 leading-relaxed">
            Designed and Built by <br />
            <span className="text-amber-200 font-bold tracking-wide">Rishanth Velvijayan</span>
          </p>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* HEADER BAR WITH TOP-RIGHT LOGIN / SIGNUP */}
        <header className="h-16 border-b border-slate-800 px-8 flex items-center justify-between bg-[#060913]/60 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
            <span>Dailygen</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-200">{activeTab}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-900 border border-slate-800 text-slate-200 shadow-sm hidden sm:inline-block">
              Tasks: {completedTasks}/{tasks.length} ({taskRate}%)
            </div>

            {/* TOP-RIGHT LOGIN / SIGNUP BUTTON */}
            {currentUserEmail ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl font-medium">
                  {currentUserEmail}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 px-2 py-1"
                >
                  Log out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-700/80 text-white hover:bg-slate-800 transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>Login / Sign up</span>
              </button>
            )}
          </div>
        </header>

        {/* CONTENT PANELS */}
        <div className="p-8 max-w-5xl w-full mx-auto space-y-8">
          {/* TAB 0: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-8 tick-anim-fade">
              <div className="space-y-2">
                <span className="text-[11px] font-bold tracking-widest uppercase text-amber-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  Today's Main Goal
                </span>

                {isEditingGoal ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!goalInput.trim()) return;
                      setMainGoal(goalInput.trim());
                      localStorage.setItem("dg_main_goal", goalInput.trim());
                      setIsEditingGoal(false);
                    }}
                    className="flex gap-2 max-w-xl pt-1"
                  >
                    <input
                      type="text"
                      autoFocus
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      className="flex-1 bg-slate-900 border border-amber-400/60 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="bg-amber-300 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs hover:bg-amber-200"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingGoal(false)}
                      className="bg-slate-800 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div
                    onClick={() => {
                      setGoalInput(mainGoal);
                      setIsEditingGoal(true);
                    }}
                    className="cursor-pointer group inline-block"
                  >
                    <h2 className="text-3xl font-extrabold tracking-tight text-white group-hover:text-amber-200 transition-colors">
                      {mainGoal}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Click to edit today's main goal ✎</p>
                  </div>
                )}
              </div>

              {/* THREE SUMMARY CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div
                  onClick={() => setActiveTab("planner")}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 tick-card space-y-3 cursor-pointer"
                >
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <span>Schedule</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
                      {schedule.filter((s) => !s.done).length} Pending
                    </span>
                  </div>
                  <div className="text-3xl font-extrabold text-white">
                    {schedule.filter((s) => s.done).length} / {schedule.length}
                  </div>
                  <p className="text-[11px] text-slate-400">Daily planner schedule items completed</p>
                </div>

                <div
                  onClick={() => setActiveTab("matrix")}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 tick-card space-y-3 cursor-pointer"
                >
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <span>Tasks</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
                      {tasks.filter((t) => !t.completed).length} Incomplete
                    </span>
                  </div>
                  <div className="text-3xl font-extrabold text-white">{taskRate}%</div>
                  <p className="text-[11px] text-slate-400">Task matrix checklist completion</p>
                </div>

                <div
                  onClick={() => setActiveTab("countdown")}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 tick-card space-y-3 cursor-pointer"
                >
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <span>Next Countdown</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
                      {countdowns.length} Events
                    </span>
                  </div>
                  <div className="text-base font-extrabold text-amber-300 leading-snug">
                    {countdowns[0] ? getFullCountdownText(countdowns[0].targetDate) : "None"}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {countdowns[0] ? countdowns[0].title : "Add an event in Countdowns"}
                  </p>
                </div>
              </div>

              {/* QUICK TASKS PREVIEW */}
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Quick Tasks</h3>
                  <button
                    onClick={() => setActiveTab("matrix")}
                    className="text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 px-3.5 py-1.5 rounded-lg transition-all"
                  >
                    View All Tasks →
                  </button>
                </div>

                <div className="space-y-2">
                  {tasks.slice(0, 4).map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 cursor-pointer tick-card"
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => {}}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-amber-400 focus:ring-0 tick-checkbox cursor-pointer"
                      />
                      <span
                        className={`text-sm font-medium transition-all ${
                          task.completed ? "line-through text-slate-500" : "text-slate-200"
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: DAILY PLANNER */}
          {activeTab === "planner" && (
            <div className="space-y-6 tick-anim-fade">
              <div>
                <h2 className="text-xl font-bold text-white">Daily Schedule & Time Blocks</h2>
                <p className="text-xs text-slate-400">Map out your day by time from morning to evening.</p>
              </div>

              <form onSubmit={addScheduleBlock} className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <input
                  type="text"
                  placeholder="Time (e.g. 02:00 PM - 04:00 PM)"
                  value={newScheduleTime}
                  onChange={(e) => setNewScheduleTime(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                />
                <input
                  type="text"
                  placeholder="What are you doing? (e.g. Study Chemistry)"
                  value={newScheduleAct}
                  onChange={(e) => setNewScheduleAct(e.target.value)}
                  className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="bg-amber-300 hover:bg-amber-200 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm"
                >
                  + Add to Schedule
                </button>
              </form>

              <div className="space-y-3">
                {schedule.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleScheduleBlock(item.id)}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer tick-card"
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => {}}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-amber-400 tick-checkbox cursor-pointer"
                      />
                      <div>
                        <span className="text-[11px] font-bold text-amber-300/90 block uppercase tracking-wide">
                          {item.time}
                        </span>
                        <span className={`text-sm font-medium ${item.done ? "line-through text-slate-500" : "text-slate-100"}`}>
                          {item.activity}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteScheduleBlock(item.id);
                      }}
                      className="text-xs text-slate-500 hover:text-rose-400 px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: TASK MATRIX */}
          {activeTab === "matrix" && (
            <div className="space-y-6 tick-anim-fade">
              <div>
                <h2 className="text-xl font-bold text-white">Task Matrix</h2>
                <p className="text-xs text-slate-400">Capture your tasks, set priorities, and check them off.</p>
              </div>

              <form onSubmit={addTask} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="What do you need to do? (press Enter)..."
                  value={newTaskInput}
                  onChange={(e) => setNewTaskInput(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as "High" | "Medium" | "Low")}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="High">🔴 High Priority</option>
                  <option value="Medium">🟡 Medium</option>
                  <option value="Low">🟢 Low</option>
                </select>
                <button
                  type="submit"
                  className="bg-amber-300 hover:bg-amber-200 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-sm transition-all"
                >
                  Add Task
                </button>
              </form>

              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer tick-card"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => {}}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-amber-400 tick-checkbox cursor-pointer"
                      />
                      <span className={`text-sm ${task.completed ? "line-through text-slate-500" : "text-slate-200"}`}>
                        {task.title}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                          task.priority === "High"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : task.priority === "Medium"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(task.id);
                      }}
                      className="text-xs text-slate-500 hover:text-rose-400 px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: HABITS TRACKER */}
          {activeTab === "habits" && (
            <div className="space-y-6 tick-anim-fade">
              <div>
                <h2 className="text-xl font-bold text-white">Habits Tracker</h2>
                <p className="text-xs text-slate-400">Build streaks and track daily routines.</p>
              </div>

              <form onSubmit={addHabit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="New habit (e.g. Read 20 pages, Gym, Drink water)..."
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="bg-amber-300 hover:bg-amber-200 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-sm transition-all"
                >
                  Add Habit
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {habits.map((habit) => (
                  <div
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 flex justify-between items-center cursor-pointer tick-card"
                  >
                    <div>
                      <h4 className={`text-sm font-bold ${habit.completed ? "text-emerald-400" : "text-white"}`}>
                        {habit.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        🔥 Streak: <span className="font-bold text-slate-200">{habit.streak} days</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                          habit.completed
                            ? "bg-emerald-500 text-slate-950 shadow-md"
                            : "bg-slate-800 text-slate-500 border border-slate-700"
                        }`}
                      >
                        {habit.completed ? "✓" : "○"}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteHabit(habit.id);
                        }}
                        className="text-xs text-slate-500 hover:text-rose-400 p-1"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: COUNTDOWN (WITH FULL-FORM WORDING) */}
          {activeTab === "countdown" && (
            <div className="space-y-6 tick-anim-fade">
              <div>
                <h2 className="text-xl font-bold text-white">Event Countdowns</h2>
                <p className="text-xs text-slate-400">Track exams, birthdays, and deadlines in complete days and hours.</p>
              </div>

              <form onSubmit={addCountdown} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <input
                  type="text"
                  placeholder="Event name (e.g. Board Exam, Alex's Birthday)..."
                  value={newCountTitle}
                  onChange={(e) => setNewCountTitle(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                />
                <input
                  type="datetime-local"
                  value={newCountDate}
                  onChange={(e) => setNewCountDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="bg-sky-500 hover:bg-sky-400 text-white font-bold py-2 rounded-xl text-xs transition-all shadow-sm"
                >
                  Create Countdown
                </button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {countdowns.map((cd) => (
                  <div
                    key={cd.id}
                    className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex justify-between items-center tick-card"
                  >
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-white">{cd.title}</h4>
                      <p className="text-xs text-slate-400">
                        Target: {new Date(cd.targetDate).toLocaleDateString(undefined, { dateStyle: "medium" })}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        {/* FULL FORM STRING: e.g. "130 days and 2 hours remaining" */}
                        <div className="text-base sm:text-lg font-black text-amber-300">
                          {getFullCountdownText(cd.targetDate)}
                        </div>
                      </div>
                      <button
                        onClick={() => removeCountdown(cd.id)}
                        className="text-slate-600 hover:text-rose-400 text-sm p-1"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: DAY DEBRIEF */}
          {activeTab === "debrief" && (
            <div className="space-y-6 tick-anim-fade">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Day Debrief & Journal</h2>
                  <p className="text-xs text-slate-400">Save how your day went and upload up to 5 photos.</p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    value={selectedDebriefDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={handleSaveDebrief}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-1.5 rounded-xl text-xs transition-all shadow-sm"
                  >
                    Save Entry
                  </button>
                </div>
              </div>

              {saveBanner && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 tick-anim-fade">
                  <span>✓</span> Entry for {selectedDebriefDate} saved!
                </div>
              )}

              <div className="space-y-4 p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    How was your day?
                  </label>
                  <div className="flex gap-2">
                    {["Outstanding", "Great", "Neutral", "Challenging"].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setCurrentRating(rate)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          currentRating === rate
                            ? "bg-amber-300 text-slate-950 font-bold"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                        }`}
                      >
                        {rate}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    What happened today?
                  </label>
                  <textarea
                    rows={6}
                    value={currentNotes}
                    onChange={(e) => setCurrentNotes(e.target.value)}
                    placeholder="Write what all happened today, accomplishments, and lessons..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400/50 resize-y"
                  />
                </div>

                {/* IMAGE UPLOAD SECTION */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Photos ({currentImages.length}/5)
                    </label>
                    {currentImages.length < 5 && (
                      <label className="cursor-pointer text-xs font-semibold text-sky-400 hover:text-sky-300">
                        + Add Photos
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {currentImages.length === 0 ? (
                    <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center">
                      <p className="text-xs text-slate-500">No photos attached for {selectedDebriefDate}.</p>
                      <label className="inline-block mt-2 text-xs font-semibold text-amber-300 hover:text-amber-200 cursor-pointer">
                        Upload up to 5 photos
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {currentImages.map((imgSrc, index) => (
                        <div key={index} className="relative group rounded-xl overflow-hidden border border-slate-800 aspect-square bg-slate-950">
                          <img
                            src={imgSrc}
                            alt={`Debrief capture ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1.5 right-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

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
                <h3 className="text-lg font-bold text-white">Dailygen Account</h3>
                <p className="text-xs text-slate-400 mt-1">Connect your Google account to sync your schedule & debriefs.</p>
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
          </div>
        </div>
      )}
    </div>
  );
}