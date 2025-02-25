
import { Star, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MovieCardProps {
  title: string;
  imageUrl: string;
  rating: number;
  year: string;
  className?: string;
}

export const MovieCard = ({
  title,
  imageUrl,
  rating,
  year,
  className,
}: MovieCardProps) => {
  return (
    <div className={cn("movie-card", className)}>
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div className="movie-card-overlay" />
      <div className="movie-card-content">
        <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-white/90">{rating}</span>
            <span className="text-sm text-white/60">{year}</span>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
