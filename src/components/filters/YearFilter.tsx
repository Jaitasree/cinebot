
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
import { years, SearchFilters } from "./types";

interface YearFilterProps {
  selectedYear: string | undefined;
  setSelectedYear: (year: string | undefined) => void;
  onSearch: (filters: SearchFilters) => void;
  searchQuery: string;
  selectedGenre: string | undefined;
  minRating: number | undefined;
}

export const YearFilter = ({
  selectedYear,
  setSelectedYear,
  onSearch,
  searchQuery,
  selectedGenre,
  minRating,
}: YearFilterProps) => {
  const [tempSelectedYear, setTempSelectedYear] = useState<string | undefined>(selectedYear);
  const [yearPopoverOpen, setYearPopoverOpen] = useState(false);

  const applyYearFilter = () => {
    setSelectedYear(tempSelectedYear);
    setYearPopoverOpen(false); // Close popover after applying
    onSearch({
      query: searchQuery,
      genre: selectedGenre,
      year: tempSelectedYear,
      minRating: minRating,
    });
  };

  const cancelYearFilter = () => {
    setTempSelectedYear(selectedYear); // Reset to previous selection
    setYearPopoverOpen(false); // Close popover without applying
  };

  return (
    <div>
      <p className="text-sm font-medium text-white/70 mb-2">Year</p>
      <Popover open={yearPopoverOpen} onOpenChange={setYearPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start bg-[#2a2a2a] border-[#333] text-white hover:bg-[#333]"
          >
            {selectedYear || "Select Year"}
            {selectedYear && (
              <span className="ml-2 w-2 h-2 rounded-full bg-[#E50914]"></span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 bg-black border-[#333] text-white">
          <Command className="bg-black text-white">
            <CommandInput placeholder="Search year..." className="h-9 text-white bg-black" />
            <CommandList className="max-h-48">
              <CommandEmpty className="text-white">No year found</CommandEmpty>
              <CommandGroup className="bg-black text-white">
                {years.map((year) => (
                  <CommandItem
                    key={year}
                    onSelect={() => {
                      setTempSelectedYear(
                        tempSelectedYear === year ? undefined : year
                      );
                    }}
                    className={`cursor-pointer text-white bg-black ${
                      tempSelectedYear === year ? "bg-[#E50914] text-white" : ""
                    }`}
                  >
                    {year}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
          <div className="p-2 flex justify-between border-t border-[#333]">
            <Button 
              onClick={cancelYearFilter}
              variant="outline"
              className="bg-transparent border-[#333] text-white hover:bg-[#333]"
            >
              Cancel
            </Button>
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
  );
};
