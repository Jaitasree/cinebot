
import { SearchBar } from "@/components/SearchBar";
import { MovieCard } from "@/components/MovieCard";

const SAMPLE_MOVIES = [
  {
    title: "Inception",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
    rating: 4.8,
    year: "2010",
  },
  {
    title: "The Matrix",
    imageUrl: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7",
    rating: 4.9,
    year: "1999",
  },
  {
    title: "Interstellar",
    imageUrl: "https://images.unsplash.com/photo-1473091534298-04dcbce3278c",
    rating: 4.7,
    year: "2014",
  },
  {
    title: "Avatar",
    imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
    rating: 4.5,
    year: "2009",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <header className="flex flex-col items-center gap-8">
          <h1 className="text-4xl font-bold text-white">CineBot</h1>
          <SearchBar />
        </header>

        {/* Featured Section */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">
            Featured Movies
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {SAMPLE_MOVIES.map((movie) => (
              <MovieCard key={movie.title} {...movie} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
