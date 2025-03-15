
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
      fetchMovies();
      return;
    }

    // Check if user is logged in with Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (!session?.user) {
        navigate('/auth');
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

    // Get watchlist from localStorage
    const savedWatchlist = localStorage.getItem("watchlist");
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }

    // Fetch movies
    fetchMovies();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('title');
      
      if (error) throw error;
      setMovies(data || []);
      setFilteredMovies(data || []);
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

  useEffect(() => {
    // Filter movies for watchlist view
    if (showWatchlist) {
      const watchlistMovies = movies.filter(movie => watchlist.includes(movie.id));
      setFilteredMovies(watchlistMovies);
    } else {
      setFilteredMovies(movies);
    }
  }, [showWatchlist, watchlist, movies]);

  // Effect to update watchlist state when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const savedWatchlist = localStorage.getItem("watchlist");
      if (savedWatchlist) {
        setWatchlist(JSON.parse(savedWatchlist));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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
