
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
  const [hasValidImage, setHasValidImage] = useState(true);
  const { toast } = useToast();

  // Sync the internal state with the prop when it changes
  useEffect(() => {
    setIsInWatchlist(inWatchlist);
  }, [inWatchlist]);

  // Update image source when movieImageUrl changes
  useEffect(() => {
    setImgSrc(movieImageUrl);
    setHasValidImage(true); // Reset the valid image flag when the source changes
  }, [movieImageUrl]);

  // Verify that we have the required properties
  if (!movieId || !movieTitle) {
    console.error("MovieCard missing required properties:", { movieId, movieTitle });
    return null;
  }

  // Improved dictionary of verified working movie posters based on movie titles
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
    "Parasite": "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_.jpg",
    "One Flew Over the Cuckoo's Nest": "https://m.media-amazon.com/images/M/MV5BZjA0OWVhOTAtYWQxNi00YzNhLWI4ZjYtNjFjZTEyYjJlNDVlL2ltYWdlL2ltYWdlXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg",
    "Saving Private Ryan": "https://m.media-amazon.com/images/M/MV5BZjhkMDM4MWItZTVjOC00ZDRhLThmYTAtM2I5NzBmNmNlMzI1XkEyXkFqcGdeQXVyNDYyMDk5MTU@._V1_.jpg",
    "Spirited Away": "https://m.media-amazon.com/images/M/MV5BMjlmZmI5MDctNDE2YS00YWE0LWE5ZWItZDBhYWQ0NTcxNWRhXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
    "Back to the Future": "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg",
    "Psycho": "https://m.media-amazon.com/images/M/MV5BNTQwNDM1YzItNDAxZC00NWY2LTk0M2UtYzM1M2ZkNWIyODZiXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
    "Gladiator": "https://m.media-amazon.com/images/M/MV5BMDliMmNhNDEtODUyOS00MjNlLTgxODEtN2U3NzIxMGVkZTA1L2ltYWdlL2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
    "The Lion King": "https://m.media-amazon.com/images/M/MV5BYTYxNGMyZTYtMjE3MS00MzNjLWFjNmYtMDk3N2FmM2JiM2M1XkEyXkFqcGdeQXVyNjY5NDU4NzI@._V1_.jpg",
    "The Pianist": "https://m.media-amazon.com/images/M/MV5BOWRiZDIxZjktMTA1NC00MDQ2LWEzMjUtMTliZmY3NjQ3ODJiXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
    "Alien": "https://m.media-amazon.com/images/M/MV5BMmQ2MmU3NzktZjAxOC00ZDZhLTk4YzEtMDMyMzcxY2IwMDAyXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
    "Apocalypse Now": "https://m.media-amazon.com/images/M/MV5BMDdhODg0MjYtYzBiOS00ZmI5LWEwZGYtZDEyNDU4MmQyNzFkXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
    "Memento": "https://m.media-amazon.com/images/M/MV5BZTcyNjk1MjgtOWI3Mi00YzQwLWI5MTktMzY4ZmI2NDAyNzYzXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
    "Django Unchained": "https://m.media-amazon.com/images/M/MV5BMjIyNTQ5NjQ1OV5BMl5BanBnXkFtZTcwODg1MDU4OA@@._V1_.jpg",
    "Raiders of the Lost Ark": "https://m.media-amazon.com/images/M/MV5BMjA0ODEzMTc1Nl5BMl5BanBnXkFtZTcwODM2MjAxNA@@._V1_.jpg",
    "WALL·E": "https://m.media-amazon.com/images/M/MV5BMjExMTg5OTU0NF5BMl5BanBnXkFtZTcwMjMxMzMzMw@@._V1_.jpg",
    "The Lives of Others": "https://m.media-amazon.com/images/M/MV5BOTNmZjA2ZmQtYWU1Yy00ZmVlLTg2NmItM2JlNzU5ZTBiNzM4XkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
    "Sunset Blvd.": "https://m.media-amazon.com/images/M/MV5BMTU0NTkyNzYwMF5BMl5BanBnXkFtZTgwMDU0NDk5MTI@._V1_.jpg",
    "Paths of Glory": "https://m.media-amazon.com/images/M/MV5BOTI5Nzc0OTMtYzBkMS00NjkxLThmM2UtNjM2ODgxN2M5NjNkXkEyXkFqcGdeQXVyNjQ2MjQ5NzM@._V1_.jpg",
    "City Lights": "https://m.media-amazon.com/images/M/MV5BY2I4MmM1N2EtM2YzOS00OWUzLTkzYzctNDc5NDg2N2IyODJmXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
    "The Intouchables": "https://m.media-amazon.com/images/M/MV5BMTYxNDA3MDQwNl5BMl5BanBnXkFtZTcwNTU4Mzc1Nw@@._V1_.jpg",
    "Modern Times": "https://m.media-amazon.com/images/M/MV5BYjJiZjMzYzktNjU0NS00OTkxLWEwYzItYzdhYWJjN2QzMTRlL2ltYWdlL2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg"
  };

  // Generic, unique fallback posters by category
  const categoryFallbacks = {
    scifi: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1934&auto=format&fit=crop&ixlib=rb-4.0.3", // Space theme
    drama: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1918&auto=format&fit=crop&ixlib=rb-4.0.3", // Theater theme
    action: "https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3", // Action theme
    crime: "https://images.unsplash.com/photo-1556741533-6e6a62bd8b49?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3", // Crime theme
    war: "https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3", // War theme
    horror: "https://images.unsplash.com/photo-1626194062394-02b562f2dce1?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3", // Horror theme
    animation: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.0.3", // Animation theme
    western: "https://images.unsplash.com/photo-1517817828584-ca00e1056a4d?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3", // Western theme
    historical: "https://images.unsplash.com/photo-1503409335829-423abe35a6d5?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3" // Historical theme
  };

  // Completely unique generic fallbacks for any title that doesn't fit a category
  const uniqueFallbacks = [
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1918&auto=format&fit=crop&ixlib=rb-4.0.3", // Theater
    "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3", // Film reel
    "https://images.unsplash.com/photo-1581905764498-f1b60bae941a?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3", // Popcorn
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3", // Theater seating
    "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3", // Film strip
    "https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3", // Audience
    "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3", // Cinema
    "https://images.unsplash.com/photo-1533488765986-dfa2a9939acd?q=80&w=1878&auto=format&fit=crop&ixlib=rb-4.0.3", // Movie ticket
    "https://images.unsplash.com/photo-1574267432553-4b4628081c31?q=80&w=1631&auto=format&fit=crop&ixlib=rb-4.0.3", // Clapper board
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1925&auto=format&fit=crop&ixlib=rb-4.0.3" // Camera
  ];

  // Function to get a unique movie poster based on title
  const getUniqueMoviePoster = (title: string) => {
    // First try the known movie poster dictionary
    if (knownMoviePosters[title]) {
      return knownMoviePosters[title];
    }
    
    // Then try to categorize by keywords in the title
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('star') || lowerTitle.includes('wars') || lowerTitle.includes('trek') || 
        lowerTitle.includes('alien') || lowerTitle.includes('interstellar') || lowerTitle.includes('space')) {
      return categoryFallbacks.scifi;
    }
    
    if (lowerTitle.includes('godfather') || lowerTitle.includes('mafia') || lowerTitle.includes('mob') || 
        lowerTitle.includes('crime') || lowerTitle.includes('gang')) {
      return categoryFallbacks.crime;
    }
    
    if (lowerTitle.includes('war') || lowerTitle.includes('soldier') || lowerTitle.includes('battle') || 
        lowerTitle.includes('army') || lowerTitle.includes('military')) {
      return categoryFallbacks.war;
    }
    
    if (lowerTitle.includes('horror') || lowerTitle.includes('scary') || lowerTitle.includes('fear') || 
        lowerTitle.includes('terror') || lowerTitle.includes('nightmare')) {
      return categoryFallbacks.horror;
    }
    
    if (lowerTitle.includes('animation') || lowerTitle.includes('cartoon') || lowerTitle.includes('pixar') || 
        lowerTitle.includes('disney')) {
      return categoryFallbacks.animation;
    }
    
    if (lowerTitle.includes('western') || lowerTitle.includes('cowboy') || lowerTitle.includes('wild west')) {
      return categoryFallbacks.western;
    }
    
    if (lowerTitle.includes('history') || lowerTitle.includes('historical') || lowerTitle.includes('century') || 
        lowerTitle.includes('ancient') || lowerTitle.includes('kingdom')) {
      return categoryFallbacks.historical;
    }
    
    // If no category matches, use the hash of the title to pick a unique fallback
    // This ensures consistent fallbacks for the same title
    const hashCode = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return uniqueFallbacks[hashCode % uniqueFallbacks.length];
  };

  // Handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const uniqueFallback = getUniqueMoviePoster(movieTitle);
    
    // Only change the source if it's different to avoid infinite error loops
    if (uniqueFallback !== imgSrc) {
      console.log(`Image failed to load for ${movieTitle}, using unique fallback`);
      setImgSrc(uniqueFallback);
    } else {
      // Last resort if somehow we got the same image again
      setHasValidImage(false);
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

  // Don't render movies without valid images
  if (!hasValidImage) {
    return null;
  }

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
