
import { Search, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { SearchFilters } from "@/components/filters/types";

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<string | undefined>(undefined);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const filtersRef = useRef<HTMLDivElement>(null);

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

  // Trigger search when searchQuery or minRating changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch({
        query: searchQuery,
        genre: selectedGenre,
        year: selectedYear,
        minRating: minRating,
      });
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedGenre, selectedYear, minRating, onSearch]);

  const hasActiveFilters = selectedGenre || selectedYear || minRating;

  return (
    <div className="relative w-full max-w-xl">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            type="search"
            placeholder="Search movies..."
            className="search-bar pl-4 pr-10 py-6 bg-[#1a1a1a] border-[#333] text-white placeholder:text-white/60 focus-visible:ring-[#E50914] focus-visible:ring-offset-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
        </div>

        <Button
          variant="outline"
          className={`flex items-center gap-2 px-4 py-6 bg-[#1a1a1a] border-[#333] text-white hover:bg-[#2a2a2a] ${
            hasActiveFilters ? "border-[#E50914]" : ""
          }`}
          onClick={() => setShowFilters(!showFilters)}
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

      {showFilters && (
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
          hasActiveFilters={hasActiveFilters}
        />
      )}
    </div>
  );
};
