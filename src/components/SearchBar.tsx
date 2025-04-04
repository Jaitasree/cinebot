
import { Search, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export interface SearchFilters {
  query: string;
  genre?: string;
  year?: string;
  minRating?: number;
}

export const genres = [
  "Action",
  "Adventure",
  "Animation",
  "Biography",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Fantasy",
  "History",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "War",
  "Western",
];

// Generate year options from 1930 to current year
const currentYear = new Date().getFullYear();
export const years = Array.from(
  { length: currentYear - 1929 },
  (_, i) => `${currentYear - i}`
);

export const ratingOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9];

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  const [tempSelectedGenre, setTempSelectedGenre] = useState<string | undefined>(undefined);
  const [selectedGenre, setSelectedGenre] = useState<string | undefined>(undefined);
  
  const [tempSelectedYear, setTempSelectedYear] = useState<string | undefined>(undefined);
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

  // Only trigger search when searchQuery or minRating changes, genre and year will use Apply button
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

  const resetFilters = () => {
    setTempSelectedGenre(undefined);
    setSelectedGenre(undefined);
    setTempSelectedYear(undefined);
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

  const applyGenreFilter = () => {
    setSelectedGenre(tempSelectedGenre);
    onSearch({
      query: searchQuery,
      genre: tempSelectedGenre,
      year: selectedYear,
      minRating: minRating,
    });
  };

  const applyYearFilter = () => {
    setSelectedYear(tempSelectedYear);
    onSearch({
      query: searchQuery,
      genre: selectedGenre,
      year: tempSelectedYear,
      minRating: minRating,
    });
  };

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
        <div
          ref={filtersRef}
          className="absolute mt-2 w-full p-4 bg-[#1a1a1a] border border-[#333] rounded-md shadow-lg z-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Genre filter */}
            <div>
              <p className="text-sm font-medium text-white/70 mb-2">Genre</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-[#2a2a2a] border-[#333] text-white hover:bg-[#333]"
                  >
                    {tempSelectedGenre || selectedGenre || "Select Genre"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 bg-[#2a2a2a] border-[#333] text-white">
                  <Command>
                    <CommandInput placeholder="Search genre..." className="h-9" />
                    <CommandList className="max-h-48">
                      <CommandEmpty>No genre found</CommandEmpty>
                      <CommandGroup>
                        {genres.map((genre) => (
                          <CommandItem
                            key={genre}
                            onSelect={() => {
                              setTempSelectedGenre(
                                tempSelectedGenre === genre ? undefined : genre
                              );
                            }}
                            className={`cursor-pointer ${
                              tempSelectedGenre === genre ? "bg-[#E50914] text-white" : ""
                            } hover:bg-[#333]`}
                          >
                            {genre}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                  <div className="p-2 flex justify-end border-t border-[#333]">
                    <Button 
                      onClick={applyGenreFilter}
                      className="bg-[#E50914] text-white hover:bg-[#C30813]"
                    >
                      Apply
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Year filter */}
            <div>
              <p className="text-sm font-medium text-white/70 mb-2">Year</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-[#2a2a2a] border-[#333] text-white hover:bg-[#333]"
                  >
                    {tempSelectedYear || selectedYear || "Select Year"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 bg-[#2a2a2a] border-[#333] text-white">
                  <Command>
                    <CommandInput placeholder="Search year..." className="h-9" />
                    <CommandList className="max-h-48">
                      <CommandEmpty>No year found</CommandEmpty>
                      <CommandGroup>
                        {years.map((year) => (
                          <CommandItem
                            key={year}
                            onSelect={() => {
                              setTempSelectedYear(
                                tempSelectedYear === year ? undefined : year
                              );
                            }}
                            className={`cursor-pointer ${
                              tempSelectedYear === year ? "bg-[#E50914] text-white" : ""
                            } hover:bg-[#333]`}
                          >
                            {year}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                  <div className="p-2 flex justify-end border-t border-[#333]">
                    <Button 
                      onClick={applyYearFilter}
                      className="bg-[#E50914] text-white hover:bg-[#C30813]"
                    >
                      Apply
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Rating filter */}
            <div>
              <p className="text-sm font-medium text-white/70 mb-2">
                Minimum Rating
              </p>
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
      )}
    </div>
  );
};
