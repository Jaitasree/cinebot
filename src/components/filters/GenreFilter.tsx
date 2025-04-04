
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { genres, SearchFilters } from "./types";

interface GenreFilterProps {
  selectedGenre: string | undefined;
  setSelectedGenre: (genre: string | undefined) => void;
  onSearch: (filters: SearchFilters) => void;
  searchQuery: string;
  selectedYear: string | undefined;
  minRating: number | undefined;
}

export const GenreFilter = ({
  selectedGenre,
  setSelectedGenre,
  onSearch,
  searchQuery,
  selectedYear,
  minRating,
}: GenreFilterProps) => {
  const [tempSelectedGenre, setTempSelectedGenre] = useState<string | undefined>(undefined);
  const [genrePopoverOpen, setGenrePopoverOpen] = useState(false);

  const applyGenreFilter = () => {
    setSelectedGenre(tempSelectedGenre);
    setGenrePopoverOpen(false); // Close popover after applying
    onSearch({
      query: searchQuery,
      genre: tempSelectedGenre,
      year: selectedYear,
      minRating: minRating,
    });
  };

  const cancelGenreFilter = () => {
    setTempSelectedGenre(selectedGenre); // Reset to previous selection
    setGenrePopoverOpen(false); // Close popover without applying
  };

  return (
    <div>
      <p className="text-sm font-medium text-white/70 mb-2">Genre</p>
      <Popover open={genrePopoverOpen} onOpenChange={setGenrePopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start bg-[#2a2a2a] border-[#333] text-white hover:bg-[#333]"
          >
            {selectedGenre || "Select Genre"}
            {selectedGenre && (
              <span className="ml-2 w-2 h-2 rounded-full bg-[#E50914]"></span>
            )}
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
          <div className="p-2 flex justify-between border-t border-[#333]">
            <Button 
              onClick={cancelGenreFilter}
              variant="outline"
              className="bg-transparent border-[#333] text-white hover:bg-[#333]"
            >
              Cancel
            </Button>
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
  );
};
