import React from "react";
import { WatchlistEntry } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { PageContainer } from "../layout/PageContainer";
import { Play, CheckCircle, Pause, Compass, Clock, Clapperboard, FolderOpen, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { StatusBadge, TypeBadge } from "../ui/Primitives";

interface DashboardProps {
  entries: WatchlistEntry[];
  loading: boolean;
  setTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ entries, loading, setTab }) => {
  const { profile } = useAuth();

  // 1. Calculate General statistics
  const total = entries.length;
  const completed = entries.filter(e => e.status === "completed").length;
  const watching = entries.filter(e => e.status === "watching").length;
  const planning = entries.filter(e => e.status === "planning").length;
  const onHold = entries.filter(e => e.status === "paused").length;
  const dropped = entries.filter(e => e.status === "dropped").length;

  // 2. Breakdown counts by Media Type
  const animeCount = entries.filter(e => e.type === "anime").length;
  const tvCount = entries.filter(e => e.type === "tv").length;
  const movieCount = entries.filter(e => e.type === "movie").length;

  // 3. Sorting for Recent Activity Feed (top 5 sorted by last updated)
  const recentActivity = [...entries]
    .sort((a, b) => {
      const aTime = a.updatedAt?.seconds || 0;
      const bTime = b.updatedAt?.seconds || 0;
      return bTime - aTime;
    })
    .slice(0, 5);

  // Format activity timestamp
  const formatTimeGap = (timestamp: any) => {
    if (!timestamp) return "just now";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const msDiff = Date.now() - date.getTime();
    const minutes = Math.floor(msDiff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Safe division helper for responsive charts
  const percentageOfTotal = (count: number) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  const completedRatio = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Render Skeleton cells if records are loading
  if (loading) {
    return (
      <PageContainer>
        <div className="h-10 bg-gray-250 dark:bg-neutral-800 rounded-xl w-1/3 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-150 dark:bg-neutral-800 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 lg:col-span-2 bg-gray-150 dark:bg-neutral-800 rounded-2xl animate-pulse" />
          <div className="h-64 bg-gray-150 dark:bg-neutral-800 rounded-2xl animate-pulse" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* 1. Header Greeting Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
            Welcome back, {profile?.displayName || "Watcher"}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
            Your watchtreasury is synced. {total === 0 ? "Add your first show to begin!" : `You are tracking ${total} media items.`}
          </p>
        </div>
        
        {total === 0 && (
          <button
            onClick={() => setTab("search")}
            className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/15"
          >
            Add First Entry <ArrowRight className="h-4.5 w-4.5" />
          </button>
        )}
      </div>

      {/* 2. Core Stats Bento grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* TOTAL CARDS */}
        <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 hover:border-indigo-500/30 transition-all duration-200 group shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">Total Items</span>
            <span className="text-3xl font-black text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">{total}</span>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <FolderOpen className="h-6 w-6" />
          </div>
        </div>

        {/* WATCHING CARDS */}
        <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 hover:border-amber-500/30 transition-all duration-200 group shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">Active In Progress</span>
            <span className="text-3xl font-black text-gray-900 dark:text-white group-hover:text-amber-500 transition-colors">{watching}</span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
            <Play className="h-6 w-6" />
          </div>
        </div>

        {/* COMPLETED CARDS */}
        <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 hover:border-emerald-500/30 transition-all duration-200 group shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">Completed</span>
            <span className="text-3xl font-black text-gray-900 dark:text-white group-hover:text-emerald-500 transition-colors">{completed}</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle className="h-6 w-6" />
          </div>
        </div>

        {/* PLANNING CARDS */}
        <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 hover:border-blue-500/30 transition-all duration-200 group shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">Want to watch</span>
            <span className="text-3xl font-black text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">{planning}</span>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <Compass className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* 3. Primary row: Visual Distributions & Activity log */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* LEFT COLUMN: VISUAL CHARTS (Span 3) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Chart 1: Media Type Breakdown */}
          <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm flex flex-col gap-6">
            <div>
              <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-50">Media Distribution</h3>
              <p className="text-xs text-neutral-400">Ratios comparing Anime, TV, and Movies</p>
            </div>

            {total === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-center text-gray-400 dark:text-neutral-500 bg-gray-50 dark:bg-neutral-800/40 rounded-xl">
                <Clapperboard className="h-8 w-8 mb-2 opacity-50" />
                <span className="text-xs font-semibold">No data to display. Please search items to add first!</span>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {/* Custom glowing horizontal visual distribution bar */}
                <div className="h-5.5 w-full bg-gray-100 dark:bg-neutral-800 rounded-full flex overflow-hidden">
                  {animeCount > 0 && (
                    <div 
                      style={{ width: `${(animeCount / total) * 100}%` }}
                      title={`Anime: ${animeCount}`}
                      className="bg-fuchsia-500 h-full transition-all duration-500 relative group"
                    />
                  )}
                  {tvCount > 0 && (
                    <div 
                      style={{ width: `${(tvCount / total) * 100}%` }}
                      title={`TV Shows: ${tvCount}`}
                      className="bg-indigo-500 h-full transition-all duration-500 relative group"
                    />
                  )}
                  {movieCount > 0 && (
                    <div 
                      style={{ width: `${(movieCount / total) * 105}%` }}
                      title={`Movies: ${movieCount}`}
                      className="bg-sky-500 h-full transition-all duration-500 relative group"
                    />
                  )}
                </div>

                {/* Legend list */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Anime bar */}
                  <div className="flex flex-col gap-1 p-3 bg-fuchsia-500/5 dark:bg-fuchsia-500/10 border border-fuchsia-100 dark:border-fuchsia-550/10 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-fuchsia-500" />
                      <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300">Anime</span>
                    </div>
                    <span className="text-lg font-black text-fuchsia-600 dark:text-fuchsia-400 pl-4">
                      {animeCount} <span className="text-[10px] font-semibold text-neutral-400">({percentageOfTotal(animeCount)}%)</span>
                    </span>
                  </div>

                  {/* TV bar */}
                  <div className="flex flex-col gap-1 p-3 bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-550/10 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                      <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300">TV Series</span>
                    </div>
                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 pl-4">
                      {tvCount} <span className="text-[10px] font-semibold text-neutral-400">({percentageOfTotal(tvCount)}%)</span>
                    </span>
                  </div>

                  {/* Movie bar */}
                  <div className="flex flex-col gap-1 p-3 bg-sky-500/5 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-550/10 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                      <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300">Movies</span>
                    </div>
                    <span className="text-lg font-black text-sky-600 dark:text-sky-400 pl-4">
                      {movieCount} <span className="text-[10px] font-semibold text-neutral-400">({percentageOfTotal(movieCount)}%)</span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chart 2: Watch Status Breakdowns */}
          <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm flex flex-col gap-5">
            <div>
              <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-50">Watch Status Distribution</h3>
              <p className="text-xs text-neutral-400">Progress metrics across all tracked entries</p>
            </div>

            {total === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-center text-gray-400 dark:text-neutral-500 bg-gray-50 dark:bg-neutral-800/40 rounded-xl">
                <Compass className="h-8 w-8 mb-2 opacity-50" />
                <span className="text-xs font-semibold">Ready to map your status once items are logged!</span>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Progress ratio overview banner */}
                <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 block">Watch Vault Completed Ratio</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Great progress! Keep logging.</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{completedRatio}%</span>
                    <span className="text-xs text-neutral-400 font-semibold">done</span>
                  </div>
                </div>

                {/* List of 5 levels */}
                <div className="flex flex-col gap-3">
                  {[
                    { label: "Watching", count: watching, color: "bg-amber-500" },
                    { label: "Completed", count: completed, color: "bg-emerald-500" },
                    { label: "Planning", count: planning, color: "bg-blue-500" },
                    { label: "Paused", count: onHold, color: "bg-purple-500" },
                    { label: "Dropped", count: dropped, color: "bg-rose-500" }
                  ].map((lvl, index) => {
                    const widthPercent = total > 0 ? (lvl.count / total) * 100 : 0;
                    return (
                      <div key={index} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                          <span className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${lvl.color}`} />
                            {lvl.label}
                          </span>
                          <span>
                            {lvl.count} <span className="text-neutral-400 font-normal">({Math.round(widthPercent)}%)</span>
                          </span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${widthPercent}%` }}
                            transition={{ duration: 0.6, delay: 0.1 * index }}
                            className={`h-full rounded-full ${lvl.color}`} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: RECENT ACTIVITIES FEED (Span 2) */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm flex flex-col gap-5">
          <div>
            <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-50">Recent Activities</h3>
            <p className="text-xs text-neutral-400">Latest updates in your library</p>
          </div>

          {recentActivity.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-400 dark:text-neutral-500 bg-gray-50/50 dark:bg-neutral-800/20 rounded-xl min-h-[300px]">
              <Clock className="h-10 w-10 mb-2 opacity-40 animate-pulse" />
              <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Vault Activity is secure and silent.</p>
              <p className="text-[10px] text-neutral-400 mt-1">Actions like editing or status changes log here instantly.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-4">
              {recentActivity.map((entry) => (
                <div 
                  key={entry.id}
                  className="flex gap-3.5 p-3.5 rounded-xl bg-gray-55/60 dark:bg-neutral-800/40 hover:bg-gray-100 dark:hover:bg-neutral-800/80 transition-colors border border-gray-100/50 dark:border-neutral-800/40 relative"
                >
                  {/* Poster Thumbnail */}
                  <img
                    src={entry.posterURL}
                    alt={entry.title}
                    referrerPolicy="no-referrer"
                    className="h-14 w-10 object-cover rounded-md bg-neutral-850 shadow-sm shrink-0"
                  />

                  {/* Actions Description */}
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <span className="text-xs font-bold text-gray-800 dark:text-neutral-200 truncate pr-4">
                      {entry.title}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <StatusBadge status={entry.status} />
                      <TypeBadge type={entry.type} />
                    </div>
                  </div>

                  {/* Logging Time gap */}
                  <span className="absolute top-3 right-3 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 flex items-center gap-1 shrink-0">
                    <Clock className="h-2.5 w-2.5" />
                    {formatTimeGap(entry.updatedAt || entry.addedAt)}
                  </span>
                </div>
              ))}
              
              <button
                onClick={() => setTab("watchlist")}
                className="cursor-pointer mt-auto py-2.5 w-full bg-gray-50 hover:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-300 flex items-center justify-center gap-2 border border-gray-100 dark:border-neutral-800"
              >
                Access Full Watchlist <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

      </div>
    </PageContainer>
  );
};
