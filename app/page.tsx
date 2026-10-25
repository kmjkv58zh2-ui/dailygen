"use client";

import React, { useState, useEffect } from "react";

interface Task {
  id: string;
  title: string;
  completed: boolean;
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

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", title: "today gym", completed: true },
    { id: "2", title: "test task", completed: false },
  ]);
  const [newTaskInput, setNewTaskInput] = useState("");

  // Countdowns state (replacing Goals & Milestones)
  const [countdowns, setCountdowns] = useState<CountdownItem[]>([
    { id: "c1", title: "Board Exams", targetDate: "2027-03-01T09:00" },
    { id: "c2", title: "Friend's Birthday", targetDate: "2026-11-15T00:00" },
  ]);
  const [newCountTitle, setNewCountTitle] = useState("");
  const [newCountDate, setNewCountDate] = useState("");

  // Day Debrief state - initialized without top-level new Date() to pass Next.js build
  const [selectedDebriefDate, setSelectedDebriefDate] = useState<string>("");
  const [debriefEntries, setDebriefEntries] = useState<Record<string, DebriefEntry>>({});
  const [currentNotes, setCurrentNotes] = useState("");
  const [currentRating, setCurrentRating] = useState("Great");
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [saveBanner, setSaveBanner] = useState(false);

  // Load from LocalStorage safely on client mount
  useEffect(() => {
    setMounted(true);
    const today = new Date().toISOString().split("T")[0];
    setSelectedDebriefDate(today);

    const savedTasks = localStorage.getItem("dg_tasks");
    if (savedTasks) {
      try { setTasks(JSON.parse(savedTasks)); } catch {}
    }

    const savedCounts = localStorage.getItem("dg_countdowns");
    if (savedCounts) {
      try { setCountdowns(JSON.parse(savedCounts)); } catch {}
    }

    const savedDebriefs = localStorage.getItem("dg_debriefs");
    if (savedDebriefs) {
      try {
        const parsed = JSON.parse(savedDebriefs);
        setDebriefEntries(parsed);
        if (parsed[today]) {
          setCurrentNotes(parsed[today].notes || "");
          setCurrentRating(parsed[today].rating || "Great");
          setCurrentImages(parsed[today].images || []);
        }
      } catch {}
    }
  }, []);

  // Update debrief fields when selecting a date
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

  // Save debrief
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

  // Image Upload Handler (Max 5)
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

  // Task Handlers
  const toggleTask = (id: string) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    setTasks(updated);
    localStorage.setItem("dg_tasks", JSON.stringify(updated));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    const updated = [...tasks, { id: Date.now().toString(), title: newTaskInput.trim(), completed: false }];
    setTasks(updated);
    setNewTaskInput("");
    localStorage.setItem("dg_tasks", JSON.stringify(updated));
  };

  // Countdown Handlers
  const addCountdown = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCountTitle.trim() || !newCountDate) return;
    const updated = [...countdowns, { id: Date.now().toString(), title: newCountTitle.trim(), targetDate: newCountDate }];
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

  const getDaysLeft = (targetStr: string) => {
    if (!mounted) return { days: 0, hours: 0, expired: false };
    const diff = new Date(targetStr).getTime() - new Date().getTime();
    if (diff <= 0) return { days: 0, hours: 0, expired: true };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    return { days, hours, expired: false };
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 antialiased selection:bg-amber-400 selection:text-slate-900">
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col justify-between p-5 select-none transition-all">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-xl bg-amber-200 text-slate-950 font-bold flex items-center justify-center text-base shadow-sm">
              D
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-wide uppercase text-slate-100">Dailygen</h1>
              <p className="text-[11px] tracking-wider text-slate-400 uppercase font-medium">Executive Dock</p>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { id: "overview", label: "Overview Deck", icon: "❖" },
              { id: "planner", label: "1. Daily Planner", icon: "🕒" },
              { id: "matrix", label: "2. Task Matrix", icon: "✓" },
              { id: "habits", label: "3. Habits Tracker", icon: "⚡" },
              { id: "countdown", label: "4. Countdown", icon: "⏳" },
              { id: "debrief", label: "5. Day Debrief", icon: "✦" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  activeTab === tab.id
                    ? "bg-slate-800/80 text-white shadow-sm ring-1 ring-slate-700/50"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
              >
                <span className="text-sm">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-900 flex items-center gap-2.5 px-2">
          <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
            RS
          </div>
          <div className="truncate">
            <p className="text-xs font-medium text-slate-200 truncate">rshznth@gmail.com</p>
            <p className="text-[10px] text-emerald-400 font-medium">● Cloud Linked</p>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* HEADER BAR */}
        <header className="h-16 border-b border-slate-800 px-8 flex items-center justify-between bg-slate-950/40 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
            <span>Dailygen</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-200">{activeTab}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-900 border border-slate-800 text-slate-200 shadow-sm">
              {completionRate}%
            </div>
            <div className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-900 border border-slate-800 text-slate-200 shadow-sm">
              {completedCount}/{tasks.length}
            </div>
          </div>
        </header>

        {/* CONTENT PANELS */}
        <div className="p-8 max-w-5xl w-full mx-auto space-y-8">
          {/* TAB 1: OVERVIEW DECK */}
          {activeTab === "overview" && (
            <div className="space-y-8 task-enter">
              <div className="space-y-2">
                <span className="text-[11px] font-bold tracking-widest uppercase text-amber-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  Today's Strategic Focus
                </span>
                <h2 className="text-3xl font-extrabold tracking-tight text-white">Scale Dailygen to MVP Release</h2>
                <p className="text-xs text-slate-400">Click to redefine today's single most critical priority.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 tick-card space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <span>Active Tasks</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
                      {tasks.filter((t) => !t.completed).length} Pending
                    </span>
                  </div>
                  <div className="text-3xl font-extrabold text-white">{completionRate}%</div>
                  <p className="text-[11px] text-slate-400">Overall task completion velocity</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 tick-card space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <span>Habit Cadence</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">0 Done</span>
                  </div>
                  <div className="text-3xl font-extrabold text-white">0 Staked</div>
                  <p className="text-[11px] text-slate-400">Daily discipline & routines</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 tick-card space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <span>Next Countdown</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
                      {countdowns.length} Events
                    </span>
                  </div>
                  <div className="text-3xl font-extrabold text-white">
                    {countdowns[0] ? `${getDaysLeft(countdowns[0].targetDate).days}d` : "None"}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {countdowns[0] ? countdowns[0].title : "Add an event in Countdown"}
                  </p>
                </div>
              </div>

              {/* TACTICAL FOCUS MATRIX */}
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Tactical Focus Matrix</h3>
                  <button
                    onClick={() => setActiveTab("matrix")}
                    className="text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 px-3.5 py-1.5 rounded-lg transition-all"
                  >
                    Open Task Matrix →
                  </button>
                </div>

                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 cursor-pointer tick-card group"
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => {}}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-amber-400 focus:ring-0 tick-check cursor-pointer"
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

          {/* TAB 2, 3: TASK MATRIX / PLANNER / HABITS */}
          {(activeTab === "matrix" || activeTab === "planner" || activeTab === "habits") && (
            <div className="space-y-6 task-enter">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Execution Board</h2>
                  <p className="text-xs text-slate-400">Capture, organize, and execute priorities instantly.</p>
                </div>
              </div>

              <form onSubmit={addTask} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a new task (press enter)..."
                  value={newTaskInput}
                  onChange={(e) => setNewTaskInput(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 transition-colors"
                />
                <button
                  type="submit"
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-all"
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
                        className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-amber-400 tick-check cursor-pointer"
                      />
                      <span className={`text-sm ${task.completed ? "line-through text-slate-500" : "text-slate-200"}`}>
                        {task.title}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTasks(tasks.filter((t) => t.id !== task.id));
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

          {/* TAB 4: COUNTDOWN */}
          {activeTab === "countdown" && (
            <div className="space-y-6 task-enter">
              <div>
                <h2 className="text-xl font-bold text-white">Event Countdowns</h2>
                <p className="text-xs text-slate-400">Keep critical deadlines, birthdays, and exams front of mind.</p>
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
                {countdowns.map((cd) => {
                  const left = getDaysLeft(cd.targetDate);
                  return (
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
                          <div className="text-2xl font-black text-amber-300">
                            {left.expired ? "Passed" : `${left.days}d ${left.hours}h`}
                          </div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Remaining</p>
                        </div>
                        <button
                          onClick={() => removeCountdown(cd.id)}
                          className="text-slate-600 hover:text-rose-400 text-sm p-1"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: DAY DEBRIEF */}
          {activeTab === "debrief" && (
            <div className="space-y-6 task-enter">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Day Debrief & Journal</h2>
                  <p className="text-xs text-slate-400">Capture what unfolded today, document highlights, and archive snapshots.</p>
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
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <span>✓</span> Entry for {selectedDebriefDate} saved successfully!
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
                            ? "bg-amber-400 text-slate-950 font-bold"
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
                    Daily Reflections & Debrief Notes
                  </label>
                  <textarea
                    rows={6}
                    value={currentNotes}
                    onChange={(e) => setCurrentNotes(e.target.value)}
                    placeholder="Write what all happened today, accomplishments, lessons, and thoughts..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400/50 resize-y"
                  />
                </div>

                {/* IMAGE UPLOAD SECTION */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Day Snapshots ({currentImages.length}/5)
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
                      <label className="inline-block mt-2 text-xs font-semibold text-amber-400 hover:text-amber-300 cursor-pointer">
                        Upload up to 5 pictures
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
    </div>
  );
}