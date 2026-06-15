import { useState, useEffect } from "react";
import { doc, getDocFromServer, collection, onSnapshot } from "firebase/firestore";
import { useAuth, AuthProvider } from "./context/AuthContext";
import { useTheme, ThemeProvider } from "./context/ThemeContext";
import { ToastProvider, useToast } from "./components/ui/Toast";
import { db, handleFirestoreError, OperationType } from "./lib/firebase";
import { WatchlistEntry } from "./types";
import { Navbar } from "./components/layout/Navbar";
import { AuthPages } from "./components/auth/AuthPages";
import { Dashboard } from "./components/dashboard/Dashboard";
import { WatchlistPage } from "./components/watchlist/Watchlist";
import { SearchPage } from "./components/search/Search";
import { ProfilePage } from "./components/profile/Profile";
import { Spinner } from "./components/ui/Primitives";

function MainApp() {
  const { user, profile, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [entries, setEntries] = useState<WatchlistEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(true);

  // 1. Mandatory Firestore Network Connection Check
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, "test", "connection"));
      } catch (error) {
        if (error instanceof Error && error.message.includes("the client is offline")) {
          console.warn("WatchVault is running Offline / Firestore server sandbox unavailable.");
        }
      }
    }
    testConnection();
  }, []);

  // 2. Real-time entries Firestore subscriber
  useEffect(() => {
    if (!profile?.uid) {
      setEntries([]);
      setEntriesLoading(false);
      return;
    }

    setEntriesLoading(true);
    const colPath = `watchlist/${profile.uid}/entries`;

    const unsubscribe = onSnapshot(
      collection(db, colPath),
      (snapshot) => {
        const list: WatchlistEntry[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            externalId: data.externalId,
            type: data.type,
            title: data.title,
            posterURL: data.posterURL || "",
            status: data.status,
            showStatus: data.showStatus,
            totalSeasons: data.totalSeasons,
            totalEpisodes: data.totalEpisodes,
            genres: data.genres || [],
            year: data.year,
            addedAt: data.addedAt,
            updatedAt: data.updatedAt,
          });
        });
        setEntries(list);
        setEntriesLoading(false);
      },
      (error) => {
        setEntriesLoading(false);
        handleFirestoreError(error, OperationType.GET, colPath);
      }
    );

    return () => unsubscribe();
  }, [profile?.uid]);

  // Loading Splash Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center gap-4 text-white">
        <Spinner className="h-10 w-10 text-indigo-400" />
        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Unlocking WatchVault...</span>
      </div>
    );
  }

  // Auth Guard
  if (!user || !profile) {
    return <AuthPages />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-neutral-100 flex flex-col transition-colors duration-150">
      {/* Dynamic Glassmorphic Navbar */}
      <Navbar currentTab={currentTab} setTab={setCurrentTab} />

      {/* Pages Container & Router */}
      <div className="flex-1 flex flex-col">
        {currentTab === "dashboard" && (
          <Dashboard entries={entries} loading={entriesLoading} setTab={setCurrentTab} />
        )}
        {currentTab === "watchlist" && (
          <WatchlistPage entries={entries} loading={entriesLoading} />
        )}
        {currentTab === "search" && (
          <SearchPage existingEntries={entries} />
        )}
        {currentTab === "profile" && (
          <ProfilePage />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <MainApp />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
