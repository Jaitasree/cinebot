
import { Star, Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface MovieCardProps {
  title: string;
  imageUrl: string;
  rating: number | null;
  year: string;
  id: string;
  className?: string;
  inWatchlist?: boolean;
}

export const MovieCard = ({
  title,
  imageUrl,
  rating = 0,
  year,
  id,
  className,
  inWatchlist = false,
}: MovieCardProps) => {
  const [isInWatchlist, setIsInWatchlist] = useState(inWatchlist);
  const { toast } = useToast();

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsInWatchlist(!isInWatchlist);
    
    // Get existing watchlist from localStorage
    const existingWatchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
    
    if (!isInWatchlist) {
      // Add to watchlist
      localStorage.setItem("watchlist", JSON.stringify([...existingWatchlist, id]));
      toast({
        title: "Added to Watchlist",
        description: `${title} has been added to your watchlist`,
      });
    } else {
      // Remove from watchlist
      const updatedWatchlist = existingWatchlist.filter((movieId: string) => movieId !== id);
      localStorage.setItem("watchlist", JSON.stringify(updatedWatchlist));
      toast({
        title: "Removed from Watchlist",
        description: `${title} has been removed from your watchlist`,
      });
    }
  };

  return (
    <div className={cn("movie-card aspect-[2/3]", className)}>
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover rounded-md"
        loading="lazy"
      />
      <div className="movie-card-overlay rounded-md" />
      <div className="movie-card-content">
        <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-white/90">{rating ? rating.toFixed(1) : "N/A"}</span>
            <span className="text-sm text-white/60">{year}</span>
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
