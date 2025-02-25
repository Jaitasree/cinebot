
import { Search } from "lucide-react";

export const SearchBar = () => {
  return (
    <div className="relative w-full max-w-xl">
      <input
        type="search"
        placeholder="Search movies..."
        className="search-bar"
      />
      <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
    </div>
  );
};
