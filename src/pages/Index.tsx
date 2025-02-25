
import { useEffect, useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { MovieCard } from "@/components/MovieCard";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Movie {
  id: string;
  title: string;
  image_url: string;
  year: string;
  description: string;
}

const Index = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
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

    // Fetch movies
    fetchMovies();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchMovies = async () => {
    try {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('title');
      
      if (error) throw error;
      setMovies(data || []);
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
    await supabase.auth.signOut();
    navigate('/auth');
  };

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
            <Button 
              variant="outline"
              onClick={handleSignOut}
              className="bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              Sign Out
            </Button>
          </div>
          <SearchBar />
        </header>

        {/* Featured Section */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">
            Featured Movies
          </h2>
          {loading ? (
            <div className="text-white/60 text-center py-12">Loading movies...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  title={movie.title}
                  imageUrl={movie.image_url}
                  year={movie.year}
                  rating={0}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Index;
