
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
            <Star className="w-4 h-4 text-[#E50914]" />
            <span className="text-sm text-white/90">{rating}</span>
            <span className="text-sm text-white/60">{year}</span>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full bg-[#E50914] hover:bg-[#B81D24] border-none"
          >
            <Plus className="h-4 w-4 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
};
