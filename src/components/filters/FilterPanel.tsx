
import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { GenreFilter } from "./GenreFilter";
import { YearFilter } from "./YearFilter";
import { RatingFilter } from "./RatingFilter";
import { SearchFilters } from "./types";

interface FilterPanelProps {
  selectedGenre: string | undefined;
  setSelectedGenre: (genre: string | undefined) => void;
  selectedYear: string | undefined;
  setSelectedYear: (year: string | undefined) => void;
  minRating: number | undefined;
  setMinRating: (rating: number | undefined) => void;
  onSearch: (filters: SearchFilters) => void;
  searchQuery: string;
  hasActiveFilters: boolean;
}

export const FilterPanel = forwardRef<HTMLDivElement, FilterPanelProps>(
  (
    {
      selectedGenre,
      setSelectedGenre,
      selectedYear,
      setSelectedYear,
      minRating,
      setMinRating,
      onSearch,
      searchQuery,
      hasActiveFilters,
    },
    ref
  ) => {
    const resetFilters = () => {
      setSelectedGenre(undefined);
      setSelectedYear(undefined);
      setMinRating(undefined);
      
      // Trigger search with reset filters
      onSearch({
        query: searchQuery,
        genre: undefined,
        year: undefined,
        minRating: undefined,
      });
    };

    return (
      <div
        ref={ref}
        className="absolute mt-2 w-full p-4 bg-[#1a1a1a] border border-[#333] rounded-md shadow-lg z-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GenreFilter
            selectedGenre={selectedGenre}
            setSelectedGenre={setSelectedGenre}
            onSearch={onSearch}
            searchQuery={searchQuery}
            selectedYear={selectedYear}
            minRating={minRating}
          />

          <YearFilter
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            onSearch={onSearch}
            searchQuery={searchQuery}
            selectedGenre={selectedGenre}
            minRating={minRating}
          />

          <RatingFilter
            minRating={minRating}
            setMinRating={setMinRating}
            onSearch={onSearch}
            searchQuery={searchQuery}
            selectedGenre={selectedGenre}
            selectedYear={selectedYear}
          />
        </div>

        {/* Reset filters button */}
        {hasActiveFilters && (
          <Button
            variant="link"
            className="mt-4 text-[#E50914] hover:text-[#ff6b78] p-0"
            onClick={resetFilters}
          >
            Reset filters
          </Button>
        )}
      </div>
    );
  }
);

FilterPanel.displayName = "FilterPanel";
