import React, { useState } from "react";
import { WatchlistEntry, StatusType, MediaType } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../ui/Toast";
import { doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { handleFirestoreError, OperationType, db } from "../../lib/firebase";
import { PageContainer } from "../layout/PageContainer";
import { Modal } from "../ui/Modal";
import { Button, Select, StatusBadge, TypeBadge } from "../ui/Primitives";
import { Search, Clapperboard, Edit2, ArchiveX, RefreshCw, Calendar, EyeOff, Hash } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface WatchlistProps {
  entries: WatchlistEntry[];
  loading: boolean;
}

export const WatchlistPage: React.FC<WatchlistProps> = ({ entries, loading }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [localSearch, setLocalSearch] = useState("");
  const [filterType, setFilterType] = useState<MediaType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<StatusType | "all">("all");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal targets tracking
  const [selectedEntry, setSelectedEntry] = useState<WatchlistEntry | null>(null);
  const [editedStatus, setEditedStatus] = useState<StatusType>("planning");

  // Filter computations
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = entry.title.toLowerCase().includes(localSearch.toLowerCase());
    const matchesType = filterType === "all" ? true : entry.type === filterType;
    const matchesStatus = filterStatus === "all" ? true : entry.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const launchEditModal = (entry: WatchlistEntry) => {
    setSelectedEntry(entry);
    setEditedStatus(entry.status);
  };

  // Status edit write trigger
  const handleUpdateStatus = async () => {
    if (!user || !selectedEntry) return;
    setIsUpdating(true);
    
    const docPath = `watchlist/${user.uid}/entries/${selectedEntry.id}`;
    const docRef = doc(db, docPath);

    try {
      await updateDoc(docRef, {
        status: editedStatus,
        updatedAt: serverTimestamp()
      });
      showToast(`'${selectedEntry.title}' status updated to '${editedStatus}'`, "success");
      setSelectedEntry(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${docPath}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Deletion trigger
  const handleRemoveEntry = async () => {
    if (!user || !selectedEntry) return;
    
    const confirmation = window.confirm(`Are you sure you want to remove '${selectedEntry.title}' from your watchlist?`);
    if (!confirmation) return;

    setIsDeleting(true);
    const docPath = `watchlist/${user.uid}/entries/${selectedEntry.id}`;
    const docRef = doc(db, docPath);

    try {
      await deleteDoc(docRef);
      showToast(`'${selectedEntry.title}' removed from watchlist`, "success");
      setSelectedEntry(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${docPath}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const getMediaLabel = (type: MediaType) => {
    if (type === "anime") return "Anime";
    if (type === "tv") return "TV Series";
    return "Movie";
  };

  return (
    <PageContainer>
      
      {/* Page Title Context */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
          Your Watchlist Vault <Clapperboard className="h-5 text-indigo-500 shrink-0" />
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
          Filter, search, or update status items in real-time.
        </p>
      </div>

      {/* Sorting filters & local search tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm shrink-0">
        
        {/* Local Search Input */}
        <div className="flex items-center relative">
          <Search className="absolute left-3.5 h-4 w-4 text-neutral-400 dark:text-neutral-500" />
          <input
            type="text"
            placeholder="Search within your vault..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-transparent text-gray-950 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        {/* Media format select */}
        <Select
          id="filter-type-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as MediaType | "all")}
          options={[
            { value: "all", label: "All Formats" },
            { value: "anime", label: "Anime format" },
            { value: "tv", label: "TV Series format" },
            { value: "movie", label: "Movie format" }
          ]}
        />

        {/* Watch Progress category select */}
        <Select
          id="filter-status-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as StatusType | "all")}
          options={[
            { value: "all", label: "All Progress States" },
            { value: "planning", label: "Planning / In Backlog" },
            { value: "watching", label: "Watching / In Progress" },
            { value: "paused", label: "Paused / On hold" },
            { value: "completed", label: "Completed watch" },
            { value: "dropped", label: "Dropped / Abandoned" }
          ]}
        />

      </div>

      {/* Watchlist display zone */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="aspect-[2/3] w-full rounded-2xl bg-gray-100 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : filteredEntries.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          <AnimatePresence>
            {filteredEntries.map((entry) => (
              <motion.div
                layout
                key={entry.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-neutral-900 border border-gray-150 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer hover:border-indigo-500/20 transition-all duration-200 flex flex-col relative group"
                onClick={() => launchEditModal(entry)}
              >
                {/* Poster Frame */}
                <div className="aspect-[2/3] w-full bg-neutral-950 overflow-hidden relative">
                  <img
                    src={entry.posterURL}
                    alt={entry.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Floating labels overlay */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10">
                    <StatusBadge status={entry.status} />
                    <TypeBadge type={entry.type} />
                  </div>

                  {/* Hover Quick Edit Action Panel */}
                  <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-xs opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200 z-10">
                    <div className="h-10 w-10 bg-indigo-650 text-white rounded-full flex items-center justify-center shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-all duration-200">
                      <Edit2 className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* Listing metadata Details */}
                <div className="p-3.5 flex flex-col gap-1.5 flex-1 min-w-0">
                  <h4 className="font-extrabold text-sm text-neutral-900 dark:text-neutral-100 truncate">
                    {entry.title}
                  </h4>
                  
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 font-bold">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{entry.year || "Unknown"}</span>
                    </div>

                    {(entry.totalEpisodes || entry.totalSeasons) && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Hash className="h-3 w-3" />
                        <span>
                          {entry.totalEpisodes ? `${entry.totalEpisodes} eps` : `${entry.totalSeasons} seasons`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex-1 py-16 flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-3xl min-h-[350px]">
          <EyeOff className="h-12 w-12 text-neutral-300 dark:text-neutral-700 animate-pulse mb-3" />
          <h3 className="font-bold text-neutral-800 dark:text-neutral-200">Watchlist Vault Empty</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mt-1 leading-relaxed">
            {localSearch || filterType !== "all" || filterStatus !== "all"
              ? "No items match current filter parameters. Try expanding your choices!"
              : "You do not have any media files tracked inside your catalog chest."}
          </p>
        </div>
      )}

      {/* Edit Entry Modal details */}
      <Modal
        isOpen={selectedEntry !== null}
        onClose={() => setSelectedEntry(null)}
        title="Edit Vault Entry Status"
      >
        {selectedEntry && (
          <div className="flex flex-col gap-5">
            <div className="flex gap-4">
              <img
                src={selectedEntry.posterURL}
                alt={selectedEntry.title}
                referrerPolicy="no-referrer"
                className="w-20 aspect-[2/3] object-cover rounded-xl shadow-md border border-neutral-800 shrink-0"
              />
              <div className="flex flex-col justify-center gap-2 min-w-0 flex-1">
                <h4 className="font-extrabold text-base text-neutral-900 dark:text-neutral-50 truncate">
                  {selectedEntry.title}
                </h4>
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500 font-semibold shrink-0">
                  <span>Format: {getMediaLabel(selectedEntry.type)}</span>
                  <span>•</span>
                  <span>Released: {selectedEntry.year || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Selector Status options */}
            <Select
              label="Modify Watch Progress Status"
              id="edit-status-choice"
              value={editedStatus}
              onChange={(e) => setEditedStatus(e.target.value as StatusType)}
              options={[
                { value: "planning", label: "Planning / In backlog" },
                { value: "watching", label: "Currently Watching / In progress" },
                { value: "paused", label: "Temporarily Paused / On Hold" },
                { value: "completed", label: "Completed / Content finished" },
                { value: "dropped", label: "Dropped / Stopped watching" }
              ]}
            />

            {/* Core updating / deletions dashboard button tray */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 shrink-0">
              
              <Button
                variant="danger"
                onClick={handleRemoveEntry}
                isLoading={isDeleting}
                disabled={isUpdating}
                className="w-full sm:w-auto shrink-0"
              >
                <ArchiveX className="h-4 w-4 mr-2" /> Remove Entry
              </Button>

              <div className="flex items-center gap-3 w-full sm:flex-1">
                <Button
                  variant="secondary"
                  onClick={() => setSelectedEntry(null)}
                  disabled={isUpdating || isDeleting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleUpdateStatus}
                  isLoading={isUpdating}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin-slow" /> Save Status
                </Button>
              </div>

            </div>
          </div>
        )}
      </Modal>

    </PageContainer>
  );
};
