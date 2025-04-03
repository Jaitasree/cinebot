
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
  const movieRating = movie?.rating ?? rating ?? 0; // Use nullish coalescing to handle nulls
  const movieYear = movie?.year || year;

  const [isInWatchlist, setIsInWatchlist] = useState(inWatchlist);
  const [imgSrc, setImgSrc] = useState(movieImageUrl);
  const { toast } = useToast();

  // Sync the internal state with the prop when it changes
  useEffect(() => {
    setIsInWatchlist(inWatchlist);
  }, [inWatchlist]);

  // Update image source when movieImageUrl changes
  useEffect(() => {
    setImgSrc(movieImageUrl);
  }, [movieImageUrl]);

  // Verify that we have the required properties
  if (!movieId || !movieTitle) {
    console.error("MovieCard missing required properties:", { movieId, movieTitle });
    return null;
  }

  // Themed fallback images that more closely match the type of movie
  const getFallbackImage = (title: string) => {
    // Dictionary of known movie images for popular titles
    const knownMoviePosters: Record<string, string> = {
      "The Shawshank Redemption": "https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
      "The Godfather": "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
      "The Dark Knight": "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg",
      "The Godfather Part II": "https://m.media-amazon.com/images/M/MV5BMWMwMGQzZTItY2JlNC00OWZiLWIyMDctNDk2ZDQ2YjRjMWQ0XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
      "12 Angry Men": "https://m.media-amazon.com/images/M/MV5BMWU4N2FjNzYtNTVkNC00NzQ0LTg0MjAtYTJlMjFhNGUxZDFmXkEyXkFqcGdeQXVyNjc1NTYyMjg@._V1_.jpg",
      "Schindler's List": "https://m.media-amazon.com/images/M/MV5BNDE4OTMxMTctNmRhYy00NWE2LTg3YzItYTk3M2UwOTU5Njg4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
      "The Lord of the Rings: The Return of the King": "https://m.media-amazon.com/images/M/MV5BNzA5ZDNlZWMtM2NhNS00NDJjLTk4NDItYTRmY2EwMWZlMTY3XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
      "Pulp Fiction": "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
      "Fight Club": "https://m.media-amazon.com/images/M/MV5BMmEzNTkxYjQtZTc0MC00YTVjLTg5ZTEtZWMwOWVlYzY0NWIwXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
      "Inception": "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg",
      "The Matrix": "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI4ZjYtNWFkNWJlZWY0NWIyXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
      "Goodfellas": "https://m.media-amazon.com/images/M/MV5BY2NkZjEzMDgtN2RjYy00YzM1LWI4ZmQtMjIwYjFjNmI3ZGEwXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
      "Forrest Gump": "https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg",
      "Interstellar": "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjUtY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
      "The Silence of the Lambs": "https://m.media-amazon.com/images/M/MV5BNjNhZTk0ZmEtNjJhMi00YzFlLWE1MmEtYzM1M2ZmMGMwMTU4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
      "The Departed": "https://m.media-amazon.com/images/M/MV5BMTI1MTY2OTIxNV5BMl5BanBnXkFtZTYwNjQ4NjY3._V1_.jpg",
      "Whiplash": "https://m.media-amazon.com/images/M/MV5BOTA5NDZlZGUtMjAxOS00YTRkLTkwYmMtYWQ0NWEwZDZiNjEzXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
      "The Prestige": "https://m.media-amazon.com/images/M/MV5BMjA4NDI0MTIxNF5BMl5BanBnXkFtZTYwNTM0MzY2._V1_.jpg",
      "The Green Mile": "https://m.media-amazon.com/images/M/MV5BMTUxMzQyNjA5MF5BMl5BanBnXkFtZTYwOTU2NTY3._V1_.jpg",
      "Parasite": "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_.jpg"
    };

    // If we have a known poster for this exact movie title, use it
    if (knownMoviePosters[title]) {
      return knownMoviePosters[title];
    }

    // Genre-based fallbacks for movies not in our dictionary
    // Check title for keywords to guess the genre
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('star') || lowerTitle.includes('wars') || lowerTitle.includes('trek') || 
        lowerTitle.includes('alien') || lowerTitle.includes('interstellar') || lowerTitle.includes('martian')) {
      return "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjUtY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg"; // Interstellar
    }
    
    if (lowerTitle.includes('godfather') || lowerTitle.includes('mafia') || lowerTitle.includes('mob') || 
        lowerTitle.includes('crime') || lowerTitle.includes('gang')) {
      return "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg"; // The Godfather
    }
    
    if (lowerTitle.includes('war') || lowerTitle.includes('soldier') || lowerTitle.includes('battle') || 
        lowerTitle.includes('army') || lowerTitle.includes('military')) {
      return "https://m.media-amazon.com/images/M/MV5BZjhkMDM4MWItZTVjOC00ZDRhLThmYTAtM2I5NzBmNmNlMzI1XkEyXkFqcGdeQXVyNDYyMDk5MTU@._V1_.jpg"; // Saving Private Ryan
    }
    
    if (lowerTitle.includes('horror') || lowerTitle.includes('scary') || lowerTitle.includes('fear') || 
        lowerTitle.includes('terror') || lowerTitle.includes('nightmare')) {
      return "https://m.media-amazon.com/images/M/MV5BNjNhZTk0ZmEtNjJhMi00YzFlLWE1MmEtYzM1M2ZmMGMwMTU4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg"; // The Silence of the Lambs
    }
    
    // Default fallbacks for any other movie
    const genericFallbacks = [
      "https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg", // Shawshank
      "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg", // Dark Knight
      "https://m.media-amazon.com/images/M/MV5BNDE4OTMxMTctNmRhYy00NWE2LTg3YzItYTk3M2UwOTU5Njg4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg", // Schindler's List
      "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg", // Pulp Fiction
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI4ZjYtNWFkNWJlZWY0NWIyXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg"  // The Matrix
    ];
    
    // Use the movie title to deterministically select a fallback (same movie always gets same fallback)
    const hashCode = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return genericFallbacks[hashCode % genericFallbacks.length];
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const fallbackImage = getFallbackImage(movieTitle);
    
    // Only change the source if it's different to avoid infinite error loops
    if (fallbackImage !== imgSrc) {
      console.log(`Image failed to load for ${movieTitle}, using themed fallback`);
      setImgSrc(fallbackImage);
    } else {
      // Last resort fallback if somehow we got the same image again
      e.currentTarget.src = "https://placehold.co/300x450/333333/FFFFFF?text=Movie";
    }
  };

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

  // Format the rating to show one decimal place if it's not a whole number
  const formattedRating = 
    movieRating === null || movieRating === undefined 
      ? "N/A" 
      : Number(movieRating) % 1 === 0 
        ? movieRating.toString() 
        : Number(movieRating).toFixed(1);

  return (
    <div className={cn("movie-card aspect-[2/3] relative group cursor-pointer overflow-hidden rounded-md", className)}>
      <img
        src={imgSrc}
        alt={movieTitle}
        className="w-full h-full object-cover rounded-md transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
        onError={handleImageError}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md" />
      <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2">{movieTitle}</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-white/90">{formattedRating}</span>
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
