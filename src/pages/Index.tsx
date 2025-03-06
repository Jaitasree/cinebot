
import { useEffect, useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { MovieCard } from "@/components/MovieCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Movie {
  id: number;
  title: string;
  year: string;
  description: string;
  image_url: string;
}

const Index = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const { data, error } = await supabase
          .from('movies')
          .select('*')
          .order('title', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        setMovies(data || []);
      } catch (error: any) {
        console.error('Error fetching movies:', error);
        toast({
          variant: "destructive",
          title: "Error loading movies",
          description: error.message || "Failed to load movies"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [toast]);

  return (
    <div className="min-h-screen bg-[#141414] px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <header className="flex flex-col items-center gap-8">
          <h1 className="text-4xl font-bold text-white">
            <span className="text-[#E50914]">Cine</span>Bot
          </h1>
          <SearchBar />
        </header>

        {/* Featured Section */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">
            Featured Movies
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="aspect-[2/3] bg-gray-800 animate-pulse rounded-md"></div>
              ))}
            </div>
          ) : movies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {movies.map((movie) => (
                <MovieCard 
                  key={movie.id} 
                  title={movie.title} 
                  imageUrl={movie.image_url} 
                  rating={4.8} // This would come from a ratings field in your database
                  year={movie.year} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">No movies found. Please add some movies to your database.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Index;
