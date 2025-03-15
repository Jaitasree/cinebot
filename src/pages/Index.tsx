
import { useEffect, useState, useCallback } from "react";
import { SearchBar } from "@/components/SearchBar";
import { MovieCard } from "@/components/MovieCard";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Bookmark } from "lucide-react";

interface Movie {
  id: string;
  title: string;
  image_url: string;
  year: string;
  description: string;
  rating: number;
}

// Add a list of additional movies with ratings according to Google
const additionalMovies: Movie[] = [
  {
    id: "movie-1001",
    title: "The Shawshank Redemption",
    image_url: "https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
    year: "1994",
    description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    rating: 9.3
  },
  {
    id: "movie-1002",
    title: "The Godfather",
    image_url: "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
    year: "1972",
    description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    rating: 9.2
  },
  {
    id: "movie-1003",
    title: "The Dark Knight",
    image_url: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg",
    year: "2008",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    rating: 9.0
  },
  {
    id: "movie-1004",
    title: "The Godfather Part II",
    image_url: "https://m.media-amazon.com/images/M/MV5BMWMwMGQzZTItY2JlNC00OWZiLWIyMDctNDk2ZDQ2YjRjMWQ0XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
    year: "1974",
    description: "The early life and career of Vito Corleone in 1920s New York City is portrayed, while his son, Michael, expands and tightens his grip on the family crime syndicate.",
    rating: 9.0
  },
  {
    id: "movie-1005",
    title: "12 Angry Men",
    image_url: "https://m.media-amazon.com/images/M/MV5BMWU4N2FjNzYtNTVkNC00NzQ0LTg0MjAtYTJlMjFhNGUxZDFmXkEyXkFqcGdeQXVyNjc1NTYyMjg@._V1_.jpg",
    year: "1957",
    description: "A jury holdout attempts to prevent a miscarriage of justice by forcing his colleagues to reconsider the evidence.",
    rating: 9.0
  },
  {
    id: "movie-1006",
    title: "Schindler's List",
    image_url: "https://m.media-amazon.com/images/M/MV5BNDE4OTMxMTctNmRhYy00NWE2LTg3YzItYTk3M2UwOTU5Njg4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
    year: "1993",
    description: "In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.",
    rating: 8.9
  },
  {
    id: "movie-1007",
    title: "The Lord of the Rings: The Return of the King",
    image_url: "https://m.media-amazon.com/images/M/MV5BNzA5ZDNlZWMtM2NhNS00NDJjLTk4NDItYTRmY2EwMWZlMTY3XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
    year: "2003",
    description: "Gandalf and Aragorn lead the World of Men against Sauron's army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.",
    rating: 8.9
  },
  {
    id: "movie-1008",
    title: "Pulp Fiction",
    image_url: "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
    year: "1994",
    description: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    rating: 8.9
  },
  {
    id: "movie-1009",
    title: "Inception",
    image_url: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg",
    year: "2010",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    rating: 8.8
  },
  {
    id: "movie-1010",
    title: "Fight Club",
    image_url: "https://m.media-amazon.com/images/M/MV5BMmEzNTkxYjQtZTc0MC00YTVjLTg5ZTEtZWMwOWVlYzY0NWIwXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
    year: "1999",
    description: "An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into something much, much more.",
    rating: 8.8
  },
  {
    id: "movie-1011",
    title: "Forrest Gump",
    image_url: "https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg",
    year: "1994",
    description: "The presidencies of Kennedy and Johnson, the events of Vietnam, Watergate, and other historical events unfold through the perspective of an Alabama man with an IQ of 75, whose only desire is to be reunited with his childhood sweetheart.",
    rating: 8.8
  },
  {
    id: "movie-1012",
    title: "The Matrix",
    image_url: "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
    year: "1999",
    description: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
    rating: 8.7
  },
  {
    id: "movie-1013",
    title: "Goodfellas",
    image_url: "https://m.media-amazon.com/images/M/MV5BY2NkZjEzMDgtN2RjYy00YzM1LWI4ZmQtMjIwYjFjNmI3ZGEwXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
    year: "1990",
    description: "The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners Jimmy Conway and Tommy DeVito in the Italian-American crime syndicate.",
    rating: 8.7
  },
  {
    id: "movie-1014",
    title: "Interstellar",
    image_url: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
    year: "2014",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    rating: 8.6
  },
  {
    id: "movie-1015",
    title: "The Silence of the Lambs",
    image_url: "https://m.media-amazon.com/images/M/MV5BNjNhZTk0ZmEtNjJhMi00YzFlLWE1MmEtYzM1M2ZmMGMwMTU4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
    year: "1991",
    description: "A young F.B.I. cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer, a madman who skins his victims.",
    rating: 8.6
  },
  {
    id: "movie-1016",
    title: "The Departed",
    image_url: "https://m.media-amazon.com/images/M/MV5BMTI1MTY2OTIxNV5BMl5BanBnXkFtZTYwNjQ4NjY3._V1_.jpg",
    year: "2006",
    description: "An undercover cop and a mole in the police attempt to identify each other while infiltrating an Irish gang in South Boston.",
    rating: 8.5
  },
  {
    id: "movie-1017",
    title: "Whiplash",
    image_url: "https://m.media-amazon.com/images/M/MV5BOTA5NDZlZGUtMjAxOS00YTRkLTkwYmMtYWQ0NWEwZDZiNjEzXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
    year: "2014",
    description: "A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student's potential.",
    rating: 8.5
  },
  {
    id: "movie-1018",
    title: "The Prestige",
    image_url: "https://m.media-amazon.com/images/M/MV5BMjA4NDI0MTIxNF5BMl5BanBnXkFtZTYwNTM0MzY2._V1_.jpg",
    year: "2006",
    description: "After a tragic accident, two stage magicians engage in a battle to create the ultimate illusion while sacrificing everything they have to outwit each other.",
    rating: 8.5
  },
  {
    id: "movie-1019",
    title: "The Green Mile",
    image_url: "https://m.media-amazon.com/images/M/MV5BMTUxMzQyNjA5MF5BMl5BanBnXkFtZTYwOTU2NTY3._V1_.jpg",
    year: "1999",
    description: "The lives of guards on Death Row are affected by one of their charges: a black man accused of child murder and rape, yet who has a mysterious gift.",
    rating: 8.6
  },
  {
    id: "movie-1020",
    title: "Parasite",
    image_url: "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_.jpg",
    year: "2019",
    description: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    rating: 8.5
  }
];

const Index = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [showWatchlist, setShowWatchlist] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // First check if we have a test user in localStorage
    const testUser = localStorage.getItem("user");
    if (testUser) {
      setUser(JSON.parse(testUser));
      
      // Get watchlist from localStorage before fetching movies
      const savedWatchlist = localStorage.getItem("watchlist");
      if (savedWatchlist) {
        setWatchlist(JSON.parse(savedWatchlist));
      } else {
        // Initialize empty watchlist if none exists
        localStorage.setItem("watchlist", JSON.stringify([]));
      }
      
      fetchMovies();
      return;
    }

    // Check if user is logged in with Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (!session?.user) {
        navigate('/auth');
      } else {
        // Get watchlist from localStorage
        const savedWatchlist = localStorage.getItem("watchlist");
        if (savedWatchlist) {
          setWatchlist(JSON.parse(savedWatchlist));
        } else {
          // Initialize empty watchlist if none exists
          localStorage.setItem("watchlist", JSON.stringify([]));
        }
      }
    });

    // Setup auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (!session?.user) {
        navigate('/auth');
      }
    });

    // Fetch movies
    fetchMovies();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      
      // Use only additional movies to avoid duplicates
      // We're removing the Supabase fetch to eliminate old or duplicate movies
      setMovies(additionalMovies);
      setFilteredMovies(additionalMovies);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch movies"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    // Clear both Supabase session and localStorage
    await supabase.auth.signOut();
    localStorage.removeItem("user");
    navigate('/auth');
  };

  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setFilteredMovies(movies);
      return;
    }
    
    const filtered = movies.filter(movie => 
      movie.title.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredMovies(filtered);
  }, [movies]);

  const toggleWatchlist = () => {
    setShowWatchlist(!showWatchlist);
  };

  // Update useEffect to properly filter watchlist movies
  useEffect(() => {
    if (showWatchlist) {
      const watchlistMovies = movies.filter(movie => watchlist.includes(movie.id));
      setFilteredMovies(watchlistMovies);
    } else {
      setFilteredMovies(movies);
    }
  }, [showWatchlist, watchlist, movies]);

  // Effect to update watchlist state when localStorage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "watchlist") {
        const savedWatchlist = localStorage.getItem("watchlist");
        if (savedWatchlist) {
          setWatchlist(JSON.parse(savedWatchlist));
        }
      }
    };

    // Handle when watchlist changes in this tab
    const handleLocalStorageChange = () => {
      const savedWatchlist = localStorage.getItem("watchlist");
      if (savedWatchlist) {
        setWatchlist(JSON.parse(savedWatchlist));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Add a custom event listener for changes in the same window
    window.addEventListener('watchlistUpdated', handleLocalStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('watchlistUpdated', handleLocalStorageChange);
    };
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#141414] px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <header className="flex flex-col items-center gap-8">
          <div className="w-full flex justify-between items-center">
            <h1 className="text-4xl font-bold text-white">
              <span className="text-[#E50914]">Cine</span>Bot
            </h1>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline"
                onClick={toggleWatchlist}
                className={`bg-transparent border-white/20 text-white hover:bg-white/10 ${showWatchlist ? 'bg-white/20' : ''}`}
              >
                <Bookmark className="mr-2 h-4 w-4" />
                My Watchlist
                {watchlist.length > 0 && (
                  <span className="ml-2 bg-[#E50914] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {watchlist.length}
                  </span>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={handleSignOut}
                className="bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                Sign Out
              </Button>
            </div>
          </div>
          <SearchBar onSearch={handleSearch} />
        </header>

        {/* Featured Section */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">
            {showWatchlist ? "My Watchlist" : "Featured Movies"}
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="aspect-[2/3] bg-gray-800 animate-pulse rounded-md" />
              ))}
            </div>
          ) : filteredMovies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  id={movie.id}
                  title={movie.title}
                  imageUrl={movie.image_url}
                  rating={movie.rating}
                  year={movie.year}
                  inWatchlist={watchlist.includes(movie.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">
                {showWatchlist 
                  ? "Your watchlist is empty. Add some movies to watch later!" 
                  : "No movies found. Please try a different search term."}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Index;
