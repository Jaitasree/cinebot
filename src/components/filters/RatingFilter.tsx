
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ratingOptions, SearchFilters } from "./types";

interface RatingFilterProps {
  minRating: number | undefined;
  setMinRating: (rating: number | undefined) => void;
  onSearch: (filters: SearchFilters) => void;
  searchQuery: string;
  selectedGenre: string | undefined;
  selectedYear: string | undefined;
}

export const RatingFilter = ({
  minRating,
  setMinRating,
  onSearch,
  searchQuery,
  selectedGenre,
  selectedYear,
}: RatingFilterProps) => {
  return (
    <div>
      <p className="text-sm font-medium text-white/70 mb-2">Minimum Rating</p>
      <div className="flex flex-wrap gap-1">
        <ToggleGroup
          type="single"
          value={minRating?.toString()}
          onValueChange={(value) => {
            const newRating = value ? parseInt(value) : undefined;
            setMinRating(newRating);
            onSearch({
              query: searchQuery,
              genre: selectedGenre,
              year: selectedYear,
              minRating: newRating,
            });
          }}
        >
          {ratingOptions.map((rating) => (
            <ToggleGroupItem
              key={rating}
              value={rating.toString()}
              className="w-8 h-8 bg-[#2a2a2a] border-[#333] text-white data-[state=on]:bg-[#E50914] data-[state=on]:text-white"
            >
              {rating}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
};
