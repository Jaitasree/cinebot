
import { SearchBar } from "@/components/SearchBar";
import { MovieCard } from "@/components/MovieCard";

const SAMPLE_MOVIES = [
  {
    title: "Inception",
    imageUrl: "https://image.tmdb.org/t/p/w500/8IB2e4r4oVhHnANbnm7O3Tj6tF8.jpg",
    rating: 4.8,
    year: "2010",
  },
  {
    title: "The Matrix",
    imageUrl: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    rating: 4.9,
    year: "1999",
  },
  {
    title: "Interstellar",
    imageUrl: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    rating: 4.7,
    year: "2014",
  },
  {
    title: "The Dark Knight",
    imageUrl: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    rating: 4.9,
    year: "2008",
  },
  {
    title: "Pulp Fiction",
    imageUrl: "https://image.tmdb.org/t/p/w500/fIE3lAGcZDV1G6XM5KmuWnNsPp1.jpg",
    rating: 4.8,
    year: "1994",
  },
  {
    title: "Fight Club",
    imageUrl: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    rating: 4.8,
    year: "1999",
  },
  {
    title: "Goodfellas",
    imageUrl: "https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg",
    rating: 4.7,
    year: "1990",
  },
  {
    title: "The Shawshank Redemption",
    imageUrl: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    rating: 4.9,
    year: "1994",
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-[#141414] px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <header className="flex flex-col items-center gap-8">
          <h1 className="text-4xl font-bold text-white">
            <span className="text-[#E50914]">Cine</span>Bot
          </h1>
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
