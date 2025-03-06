
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const SearchBar = () => {
  return (
    <div className="relative w-full max-w-xl flex items-center justify-between">
      <div className="relative flex-grow">
        <input
          type="search"
          placeholder="Search movies..."
          className="search-bar w-full pr-12"
        />
        <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
      </div>
      <Link to="/login" className="ml-4">
        <Button 
          variant="outline"
          className="border-[#E50914] text-[#E50914] hover:bg-[#E50914]/10">
          Sign In
        </Button>
      </Link>
    </div>
  );
};
