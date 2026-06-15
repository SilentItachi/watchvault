import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// High-Fidelity Movie / TV mock library for when TMDB_API_KEY is not defined
const MOCK_MOVIES = [
  {
    externalId: "m_1",
    type: "movie" as const,
    title: "Dune: Part Two",
    posterURL: "https://images.unsplash.com/photo-1547483238-f400e65ccd56?q=80&w=600&auto=format&fit=crop",
    year: 2024,
    showStatus: "complete",
    genres: ["Sci-Fi", "Adventure", "Drama"],
    overview: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family."
  },
  {
    externalId: "m_2",
    type: "movie" as const,
    title: "Interstellar",
    posterURL: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop",
    year: 2014,
    showStatus: "complete",
    genres: ["Sci-Fi", "Drama", "Adventure"],
    overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival."
  },
  {
    externalId: "m_3",
    type: "movie" as const,
    title: "Inception",
    posterURL: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop",
    year: 2010,
    showStatus: "complete",
    genres: ["Action", "Sci-Fi", "Thriller"],
    overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea."
  },
  {
    externalId: "m_4",
    type: "movie" as const,
    title: "Spider-Man: Across the Spider-Verse",
    posterURL: "https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=600&auto=format&fit=crop",
    year: 2023,
    showStatus: "complete",
    genres: ["Animation", "Action", "Adventure"],
    overview: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence."
  },
  {
    externalId: "m_5",
    type: "movie" as const,
    title: "The Dark Knight",
    posterURL: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=600&auto=format&fit=crop",
    year: 2008,
    showStatus: "complete",
    genres: ["Action", "Drama", "Crime"],
    overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests."
  },
  {
    externalId: "m_6",
    type: "movie" as const,
    title: "Everything Everywhere All at Once",
    posterURL: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop",
    year: 2022,
    showStatus: "complete",
    genres: ["Sci-Fi", "Action", "Comedy", "Drama"],
    overview: "A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save existence by exploring other universes."
  },
  {
    externalId: "m_7",
    type: "movie" as const,
    title: "Gladiator II",
    posterURL: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=600&auto=format&fit=crop",
    year: 2024,
    showStatus: "complete",
    genres: ["Action", "Adventure", "Drama"],
    overview: "Years after witnessing the death of the revered hero Maximus, Lucius is forced to enter the Colosseum after his home is conquered by tyrants."
  },
  {
    externalId: "m_8",
    type: "movie" as const,
    title: "Avatar: The Way of Water",
    posterURL: "https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=600&auto=format&fit=crop",
    year: 2022,
    showStatus: "complete",
    genres: ["Adventure", "Sci-Fi", "Action"],
    overview: "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns, Jake must work with Neytiri."
  }
];

const MOCK_TV = [
  {
    externalId: "t_1",
    type: "tv" as const,
    title: "Breaking Bad",
    posterURL: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?q=80&w=600&auto=format&fit=crop",
    year: 2008,
    showStatus: "complete",
    totalSeasons: 5,
    totalEpisodes: 62,
    genres: ["Drama", "Crime", "Thriller"],
    overview: "A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student."
  },
  {
    externalId: "t_2",
    type: "tv" as const,
    title: "Stranger Things",
    posterURL: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop",
    year: 2016,
    showStatus: "ongoing",
    totalSeasons: 4,
    totalEpisodes: 34,
    genres: ["Sci-Fi", "Drama", "Mystery"],
    overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl."
  },
  {
    externalId: "t_3",
    type: "tv" as const,
    title: "The Last of Us",
    posterURL: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=600&auto=format&fit=crop",
    year: 2023,
    showStatus: "ongoing",
    totalSeasons: 1,
    totalEpisodes: 9,
    genres: ["Drama", "Action", "Adventure"],
    overview: "After a global pandemic destroys civilization, a hardened survivor takes charge of a 14-year-old girl who may be humanity's last hope."
  },
  {
    externalId: "t_4",
    type: "tv" as const,
    title: "Succession",
    posterURL: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop",
    year: 2018,
    showStatus: "complete",
    totalSeasons: 4,
    totalEpisodes: 39,
    genres: ["Drama"],
    overview: "The Roy family is known for controlling the biggest media and entertainment company in the world. However, their world changes when their father steps down."
  },
  {
    externalId: "t_5",
    type: "tv" as const,
    title: "The Office",
    posterURL: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop",
    year: 2005,
    showStatus: "complete",
    totalSeasons: 9,
    totalEpisodes: 201,
    genres: ["Comedy"],
    overview: "A mockumentary on a group of typical office workers, where the workday is consists of ego clashes, inappropriate behavior, and tedium."
  },
  {
    externalId: "t_6",
    type: "tv" as const,
    title: "Severance",
    posterURL: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop",
    year: 2022,
    showStatus: "ongoing",
    totalSeasons: 1,
    totalEpisodes: 9,
    genres: ["Sci-Fi", "Drama", "Mystery"],
    overview: "Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives."
  }
];

// Unified API Search Endpoint
app.get("/api/search", async (req, res) => {
  const query = (req.query.q as string || "").trim();
  const type = req.query.type as string || "all"; // 'movie' | 'tv' | 'anime' | 'all'

  if (!query) {
    return res.json({ results: [], info: "Query string is empty" });
  }

  try {
    let results: any[] = [];
    const isTMDBConfigured = !!process.env.TMDB_API_KEY;

    // 1. ANIME search using Jikan API (always active/dynamic, no key needed)
    if (type === "anime" || type === "all") {
      try {
        const jikanUrl = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=10`;
        const response = await fetch(jikanUrl);
        if (response.ok) {
          const data = await response.json();
          const animeList = (data.data || []).map((item: any) => ({
            externalId: String(item.mal_id),
            type: "anime" as const,
            title: item.title_english || item.title,
            posterURL: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || "",
            year: item.year || (item.aired?.from ? new Date(item.aired.from).getFullYear() : null),
            showStatus: item.status === "Currently Airing" ? "ongoing" : (item.status === "Not yet aired" ? "upcoming" : "complete"),
            totalEpisodes: item.episodes || null,
            genres: (item.genres || []).map((g: any) => g.name),
            overview: item.synopsis || ""
          }));
          results = [...results, ...animeList];
        }
      } catch (err) {
        console.error("Jikan API error:", err);
      }
    }

    // 2. MOVIE & TV search using TMDB API (falls back to premium pre-built lists if TMDB_API_KEY is not defined)
    if (type === "movie" || type === "tv" || type === "all") {
      if (isTMDBConfigured) {
        // Query TMDB API directly
        const tmdbApiKey = process.env.TMDB_API_KEY;
        const promises = [];

        if (type === "movie" || type === "all") {
          promises.push((async () => {
            const url = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(query)}&language=en-US&page=1`;
            const resp = await fetch(url);
            if (resp.ok) {
              const d = await resp.json();
              return (d.results || []).map((item: any) => ({
                externalId: `tmdb_m_${item.id}`,
                type: "movie" as const,
                title: item.title,
                posterURL: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "https://images.unsplash.com/photo-1547483238-f400e65ccd56?q=80&w=600",
                year: item.release_date ? new Date(item.release_date).getFullYear() : null,
                showStatus: "complete",
                genres: ["Movie"],
                overview: item.overview || ""
              }));
            }
            return [];
          })());
        }

        if (type === "tv" || type === "all") {
          promises.push((async () => {
            const url = `https://api.themoviedb.org/3/search/tv?api_key=${tmdbApiKey}&query=${encodeURIComponent(query)}&language=en-US&page=1`;
            const resp = await fetch(url);
            if (resp.ok) {
              const d = await resp.json();
              return (d.results || []).map((item: any) => ({
                externalId: `tmdb_t_${item.id}`,
                type: "tv" as const,
                title: item.name,
                posterURL: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=600",
                year: item.first_air_date ? new Date(item.first_air_date).getFullYear() : null,
                showStatus: "ongoing",
                genres: ["TV Series"],
                overview: item.overview || ""
              }));
            }
            return [];
          })());
        }

        const subResults = await Promise.all(promises);
        results = [...results, ...subResults.flat()];
      } else {
        // Fallback filter over pre-built local library (Offline Developer Mode)
        const queryLower = query.toLowerCase();
        
        if (type === "movie" || type === "all") {
          const matchedMovies = MOCK_MOVIES.filter(m => 
            m.title.toLowerCase().includes(queryLower) || 
            m.genres.some(g => g.toLowerCase().includes(queryLower))
          );
          results = [...results, ...matchedMovies];
        }

        if (type === "tv" || type === "all") {
          const matchedTVs = MOCK_TV.filter(t => 
            t.title.toLowerCase().includes(queryLower) || 
            t.genres.some(g => g.toLowerCase().includes(queryLower))
          );
          results = [...results, ...matchedTVs];
        }

        // If no results matched, but search query is not empty, let's auto-generate a smart search response to keep user flow happy
        if (results.length === 0) {
          const computedYear = 2024;
          if (type === "movie" || type === "all") {
            results.push({
              externalId: `mock_m_${Math.random().toString(36).substr(2, 9)}`,
              type: "movie" as const,
              title: query.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
              posterURL: "https://images.unsplash.com/photo-1547483238-f400e65ccd56?q=80&w=600&auto=format&fit=crop",
              year: computedYear,
              showStatus: "complete",
              genres: ["Movie", "Drama"],
              overview: `This is a movie title generated for your search '${query}'. Setup a TMDB API Key inside your environment settings to search the live global movie registry!`
            });
          } else if (type === "tv") {
            results.push({
              externalId: `mock_t_${Math.random().toString(36).substr(2, 9)}`,
              type: "tv" as const,
              title: query.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
              posterURL: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=600&auto=format&fit=crop",
              year: computedYear,
              showStatus: "ongoing",
              totalSeasons: 1,
              totalEpisodes: 10,
              genres: ["TV Series", "Adventure"],
              overview: `This is a TV series generated for your search '${query}'. Setup a TMDB API Key inside your environment settings to search the live global TV show database!`
            });
          }
        }
      }
    }

    res.json({
      results,
      isTMDBConfigured,
      demoMode: !isTMDBConfigured
    });
  } catch (err: any) {
    console.error("Search API Error:", err);
    res.status(500).json({ error: "Failed to perform database search" });
  }
});

// Start server initialization
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Vite Dev Server Middleware Context
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`WatchVault Server active at http://localhost:${PORT}`);
  });
}

startServer();
