
import { Search, Filter, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { SearchFilters } from "@/components/filters/types";
import { useDebounce } from "@/hooks/useDebounce";
import { toastService } from "@/services/toastService";

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  onRecommend: (enabled: boolean) => void;
  watchlist: string[];
  disabled?: boolean;
  isRecommending?: boolean;
}

export const SearchBar = ({ onSearch, onRecommend, watchlist = [], disabled = false, isRecommending = false }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedGenre, setSelectedGenre] = useState<string | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<string | undefined>(undefined);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const filtersRef = useRef<HTMLDivElement>(null);
  
  // Use debounced search query for better UX
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Handle outside click to close filters
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filtersRef.current &&
        !filtersRef.current.contains(event.target as Node)
      ) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilters]);

  // Trigger search when search parameters change
  useEffect(() => {
    if (!disabled) {
      onSearch({
        query: debouncedSearchQuery,
        genre: selectedGenre,
        year: selectedYear,
        minRating: minRating,
      });
    }
  }, [debouncedSearchQuery, selectedGenre, selectedYear, minRating, onSearch, disabled]);

  const hasActiveFilters = selectedGenre || selectedYear || minRating;

  const toggleRecommendations = () => {
    const action = !isRecommending;
    onRecommend(action);
    
    // Show toast notification based on the action
    if (action) {
      if (watchlist.length === 0) {
        toastService.info("Add movies to your watchlist to get better recommendations", "Recommendations Enabled");
      } else {
        toastService.success(`Showing personalized recommendations based on ${watchlist.length} watchlisted movies`, "Recommendations Enabled");
      }
    } else {
      toastService.info("Showing all movies", "Recommendations Disabled");
    }
  };

  // Reset filters when disabled
  useEffect(() => {
    if (disabled) {
      setShowFilters(false);
    }
  }, [disabled]);

  return (
    <div className="relative w-full max-w-xl">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            type="search"
            placeholder="Search movies or genres..."
            className={`search-bar pl-10 pr-4 py-6 bg-[#1a1a1a] border-[#333] text-white placeholder:text-white/60 focus-visible:ring-[#E50914] focus-visible:ring-offset-0 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={disabled}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
        </div>

        <Button
          variant="outline"
          className={`flex items-center gap-2 px-4 py-6 bg-[#1a1a1a] border-[#333] text-white hover:bg-[#2a2a2a] ${
            isRecommending ? "border-[#E50914]" : ""
          }`}
          onClick={toggleRecommendations}
          title="Get personalized recommendations based on your watchlist"
        >
          <Sparkles
            className={`w-5 h-5 ${isRecommending ? "text-[#E50914]" : "text-white/60"}`}
          />
        </Button>

        <Button
          variant="outline"
          className={`flex items-center gap-2 px-4 py-6 bg-[#1a1a1a] border-[#333] text-white hover:bg-[#2a2a2a] ${
            !!hasActiveFilters ? "border-[#E50914]" : ""
          } ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
          onClick={() => {
            if (!disabled) {
              const newState = !showFilters;
              setShowFilters(newState);
              if (newState && hasActiveFilters) {
                toastService.info(`${Object.entries({genre: selectedGenre, year: selectedYear, rating: minRating})
                  .filter(([_, value]) => value !== undefined)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(', ')}`, 
                  "Active Filters");
              }
            }
          }}
          disabled={disabled}
        >
          <Filter
            className={`w-5 h-5 ${hasActiveFilters ? "text-[#E50914]" : "text-white/60"}`}
          />
          {showFilters ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </div>

      {showFilters && !disabled && (
        <FilterPanel
          ref={filtersRef}
          selectedGenre={selectedGenre}
          setSelectedGenre={setSelectedGenre}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          minRating={minRating}
          setMinRating={setMinRating}
          onSearch={onSearch}
          searchQuery={searchQuery}
          hasActiveFilters={!!hasActiveFilters}
        />
      )}
    </div>
  );
}
