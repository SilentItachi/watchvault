import React, { useState, useEffect } from "react";
import { SearchResult, StatusType, MediaType, WatchlistEntry } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../ui/Toast";
import { Button, Input, Select, Spinner } from "../ui/Primitives";
import { handleFirestoreError, OperationType, db } from "../../lib/firebase";
import { collection, addDoc, doc, setDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import { PageContainer } from "../layout/PageContainer";
import { Modal } from "../ui/Modal";
import { Search, Film, Calendar, Eye, Bookmark, LayoutGrid, AlertCircle, Sparkles } from "lucide-react";

interface SearchProps {
  existingEntries: WatchlistEntry[];
}

export const SearchPage: React.FC<SearchProps> = ({ existingEntries }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [queryText, setQueryText] = useState("");
  const [mediaType, setMediaType] = useState<MediaType | "all">("all");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  // Search info metadata
  const [searchInfo, setSearchInfo] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  // Modal target tracking
  const [selectedItem, setSelectedItem] = useState<SearchResult | null>(null);
  const [userStatus, setUserStatus] = useState<StatusType>("planning");

  // Run search routine
  const executeSearch = async (val: string, type: string) => {
    if (!val.trim()) {
      setResults([]);
      setSearchInfo(null);
      return;
    }
    
    setIsSearching(true);
    setSearchInfo(null);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(val)}&type=${type}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        setIsDemo(data.demoMode || false);
        if (data.results?.length === 0) {
          setSearchInfo("No matches found for this search title.");
        }
      } else {
        showToast("Error returning search data", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Failing to query remote catalogs", "error");
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search trigger helper
  useEffect(() => {
    const handler = setTimeout(() => {
      if (queryText.trim().length >= 2) {
        executeSearch(queryText, mediaType);
      }
    }, 450);
    return () => clearTimeout(handler);
  }, [queryText, mediaType]);

  const handleManualSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(queryText, mediaType);
  };

  // Entry insertion routine
  const handleAddEntry = async () => {
    if (!user || !selectedItem) return;
    setIsAdding(true);

    // Double-check if already tracked
    const isAlreadyAdded = existingEntries.some(
      entry => entry.externalId === selectedItem.externalId
    );
    if (isAlreadyAdded) {
      showToast(`'${selectedItem.title}' is already in your watchlist chest!`, "info");
      setIsAdding(false);
      setSelectedItem(null);
      return;
    }

    const colPath = `watchlist/${user.uid}/entries`;
    try {
      // Create Firestore Doc reference with custom auto id
      const newDocRef = doc(collection(db, colPath));
      
      const payload: WatchlistEntry = {
        id: newDocRef.id,
        externalId: selectedItem.externalId,
        type: selectedItem.type,
        title: selectedItem.title,
        posterURL: selectedItem.posterURL,
        status: userStatus,
        showStatus: selectedItem.showStatus || "complete",
        totalSeasons: selectedItem.totalSeasons || null,
        totalEpisodes: selectedItem.totalEpisodes || null,
        genres: selectedItem.genres || [],
        year: selectedItem.year || null,
        addedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(newDocRef, payload);
      showToast(`'${selectedItem.title}' saved to watchlist!`, "success");
      setSelectedItem(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${colPath}`);
    } finally {
      setIsAdding(false);
    }
  };

  const getMediaLabel = (type: MediaType) => {
    if (type === "anime") return "Anime";
    if (type === "tv") return "TV Series";
    return "Movie";
  };

  return (
    <PageContainer>
      
      {/* Search Header Banner */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
          Discover Catalogs <Sparkles className="h-5 shrink-0 text-amber-500 animate-pulse" />
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
          Type standard keywords to lookup files across general listings.
        </p>
      </div>

      {/* Primary search parameters form */}
      <form onSubmit={handleManualSearchSubmit} className="flex flex-col md:flex-row gap-4 items-end bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm shrink-0">
        <div className="flex-1 w-full">
          <Input
            label="Media Title Keyword"
            id="search-input"
            type="text"
            placeholder="Type 'Batman', 'Dune', 'Stranger Things', 'Jujutsu Kaisen'..."
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="w-full md:w-48 shrink-0">
          <Select
            label="Content Type Category"
            id="type-select"
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value as MediaType | "all")}
            options={[
              { value: "all", label: "All Formats" },
              { value: "anime", label: "Anime" },
              { value: "tv", label: "TV Series" },
              { value: "movie", label: "Movies" }
            ]}
          />
        </div>

        <Button type="submit" isLoading={isSearching} className="w-full md:w-auto shrink-0 py-3">
          <Search className="h-4 w-4 mr-2" /> Search Catalog
        </Button>
      </form>

      {/* Demo Developer Mode advisory banner if active */}
      {isDemo && results.length > 0 && (
        <div className="p-4 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div className="text-xs text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed">
            <span className="font-bold text-amber-600 dark:text-amber-400">Offline Developer Mode Active.</span> Anime queries (via Jikan) are live, while Movie/TV lookups use high-fidelity fallback catalogs. To browse the live global TMDB directory, register a private TMDB API key in your environment variables settings tab.
          </div>
        </div>
      )}

      {/* Search results rendering stage */}
      {isSearching ? (
        <div className="flex-1 py-16 flex flex-col items-center justify-center gap-3">
          <Spinner />
          <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">Querying live registries...</span>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {results.map((item) => {
            const isAdded = existingEntries.some(entry => entry.externalId === item.externalId);
            return (
              <div
                key={item.externalId}
                onClick={() => setSelectedItem(item)}
                className="bg-white dark:bg-neutral-900 border border-gray-150 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer hover:border-indigo-500/30 transition-all duration-200 flex flex-col relative group"
              >
                {/* Poster Box */}
                <div className="aspect-[2/3] w-full bg-neutral-950 overflow-hidden relative">
                  <img
                    src={item.posterURL}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Category overlay tags */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-15">
                    {item.type === "anime" && <span className="bg-fuchsia-600/90 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded shadow">Anime</span>}
                    {item.type === "tv" && <span className="bg-indigo-600/90 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded shadow">TV</span>}
                    {item.type === "movie" && <span className="bg-sky-600/90 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded shadow">Movie</span>}
                  </div>

                  {isAdded && (
                    <div className="absolute inset-0 bg-neutral-950/70 z-10 flex flex-col items-center justify-center text-center p-3">
                      <Bookmark className="h-8 w-8 text-indigo-400 fill-indigo-400 animate-bounce mb-1" />
                      <span className="text-xs font-bold text-indigo-300">Added to Vault</span>
                    </div>
                  )}
                </div>

                {/* Title Box */}
                <div className="p-3.5 flex flex-col gap-1 flex-1 min-w-0">
                  <h4 className="font-extrabold text-sm text-neutral-900 dark:text-neutral-100 truncate group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-neutral-400 font-bold shrink-0">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{item.year || "Unknown"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 py-16 flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-3xl min-h-[350px]">
          <LayoutGrid className="h-12 w-12 text-neutral-300 dark:text-neutral-700 animate-pulse mb-3" />
          <h3 className="font-bold text-neutral-800 dark:text-neutral-200">Catalog Registry Empty</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mt-1 mb-4 leading-relaxed">
            {searchInfo || "Enter keyword characters into the search bar at the top to list matches."}
          </p>
        </div>
      )}

      {/* Add Entry Modal Overlay */}
      <Modal
        isOpen={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        title="Track New Vault Item"
      >
        {selectedItem && (
          <div className="flex flex-col gap-5">
            <div className="flex gap-4">
              {/* Media Poster mini box */}
              <img
                src={selectedItem.posterURL}
                alt={selectedItem.title}
                referrerPolicy="no-referrer"
                className="w-24 aspect-[2/3] object-cover rounded-xl shadow-lg border border-neutral-800 shrink-0"
              />
              
              {/* Core summary metrics */}
              <div className="flex flex-col justify-center gap-2 min-w-0 flex-1">
                <h4 className="font-black text-base text-neutral-900 dark:text-neutral-50 leading-snug">
                  {selectedItem.title}
                </h4>
                
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500 font-semibold">
                  <span className="font-bold text-neutral-700 dark:text-neutral-300">Format:</span>
                  <span>{getMediaLabel(selectedItem.type)}</span>
                  <span>•</span>
                  <span className="font-bold text-neutral-700 dark:text-neutral-300">Released:</span>
                  <span>{selectedItem.year || "N/A"}</span>
                </div>

                {selectedItem.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedItem.genres.slice(0, 4).map((tag, i) => (
                      <span key={i} className="text-[10px] font-bold bg-gray-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Synopsis Description if exists */}
            {selectedItem.overview && (
              <div className="bg-gray-50 dark:bg-neutral-800/40 p-4 rounded-xl text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                <span className="font-bold block text-neutral-800 dark:text-neutral-200 mb-1">Synopsis:</span>
                {selectedItem.overview}
              </div>
            )}

            {/* Selector status choices */}
            <Select
              label="Select Personal Watch Status"
              id="status-choice"
              value={userStatus}
              onChange={(e) => setUserStatus(e.target.value as StatusType)}
              options={[
                { value: "planning", label: "Planning to watch / In backlog" },
                { value: "watching", label: "Currently Watching / In progress" },
                { value: "paused", label: "Temporarily Paused / On Hold" },
                { value: "completed", label: "Completed / Content finished" },
                { value: "dropped", label: "Dropped / Stopped watching" }
              ]}
            />

            {/* Final execution button block */}
            <div className="flex items-center gap-3 pt-3 shrink-0">
              <Button
                variant="secondary"
                onClick={() => setSelectedItem(null)}
                className="flex-1"
                disabled={isAdding}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAddEntry}
                isLoading={isAdding}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500"
              >
                Track In Watchlist
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </PageContainer>
  );
};
