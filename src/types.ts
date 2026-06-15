export type StatusType = "planning" | "watching" | "paused" | "completed" | "dropped";
export type MediaType = "anime" | "tv" | "movie";

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  theme: "light" | "dark";
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

export interface WatchlistEntry {
  id: string; // Firestore Doc ID
  externalId: string; // TMDB or Jikan ID
  type: MediaType;
  title: string;
  posterURL: string;
  status: StatusType;
  showStatus?: "ongoing" | "complete" | "upcoming" | string;
  totalSeasons?: number | null;
  totalEpisodes?: number | null;
  genres: string[];
  year?: number | null;
  addedAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

// Struct of results returned by search API
export interface SearchResult {
  externalId: string;
  type: MediaType;
  title: string;
  posterURL: string;
  year?: number | null;
  showStatus?: string;
  genres: string[];
  totalEpisodes?: number | null;
  totalSeasons?: number | null;
  overview?: string;
}
