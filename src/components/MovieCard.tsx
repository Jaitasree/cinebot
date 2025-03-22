
import { Star, Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { syncWatchlist } from "@/services/movieService";
import { Movie } from "@/types/movie";

interface MovieCardProps {
  id?: string;
  title?: string;
  imageUrl?: string;
  rating?: number | null;
  year?: string;
  className?: string;
  inWatchlist?: boolean;
  movie?: Movie;
}

export const MovieCard = ({
  id,
  title,
  imageUrl,
  rating = 0,
  year,
  className,
  inWatchlist = false,
  movie,
}: MovieCardProps) => {
  // If a movie object is provided, use its properties
  const movieId = movie?.id || id;
  const movieTitle = movie?.title || title;
  const movieImageUrl = movie?.image_url || imageUrl;
  const movieRating = movie?.rating || rating;
  const movieYear = movie?.year || year;

  const [isInWatchlist, setIsInWatchlist] = useState(inWatchlist);
  const { toast } = useToast();

  // Sync the internal state with the prop when it changes
  useEffect(() => {
    setIsInWatchlist(inWatchlist);
  }, [inWatchlist]);

  // Verify that we have the required properties
  if (!movieId || !movieTitle || !movieImageUrl) {
    console.error("MovieCard missing required properties");
    return null;
  }

  const handleWatchlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newWatchlistState = !isInWatchlist;
    setIsInWatchlist(newWatchlistState);
    
    // Get existing watchlist from localStorage
    const existingWatchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
    let updatedWatchlist;
    
    if (newWatchlistState) {
      // Add to watchlist if not already present
      if (!existingWatchlist.includes(movieId)) {
        updatedWatchlist = [...existingWatchlist, movieId];
      } else {
        updatedWatchlist = existingWatchlist;
      }
      
      toast({
        title: "Added to Watchlist",
        description: `${movieTitle} has been added to your watchlist`,
      });
    } else {
      // Remove from watchlist
      updatedWatchlist = existingWatchlist.filter((id: string) => id !== movieId);
      
      toast({
        title: "Removed from Watchlist",
        description: `${movieTitle} has been removed from your watchlist`,
      });
    }
    
    // Update localStorage
    localStorage.setItem("watchlist", JSON.stringify(updatedWatchlist));
    
    // Sync with Supabase
    try {
      await syncWatchlist(updatedWatchlist);
    } catch (error) {
      console.error("Failed to sync watchlist with Supabase:", error);
      // Continue with local updates even if server sync fails
    }
    
    // Dispatch a custom event to notify other components
    window.dispatchEvent(new Event('watchlistUpdated'));
  };

  return (
    <div className={cn("movie-card aspect-[2/3] relative group cursor-pointer overflow-hidden rounded-md", className)}>
      <img
        src={movieImageUrl}
        alt={movieTitle}
        className="w-full h-full object-cover rounded-md transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md" />
      <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="text-lg font-semibold text-white mb-1">{movieTitle}</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-white/90">{movieRating ? movieRating.toFixed(1) : "N/A"}</span>
            <span className="text-sm text-white/60">{movieYear}</span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleWatchlistToggle}
            className={cn(
              "h-8 w-8 rounded-full border-none",
              isInWatchlist 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-[#E50914] hover:bg-[#B81D24]"
            )}
          >
            {isInWatchlist ? (
              <BookmarkCheck className="h-4 w-4 text-white" />
            ) : (
              <Bookmark className="h-4 w-4 text-white" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
