
export async function fetchMoreMovies(): Promise<Movie[]> {
  // Adding more high-quality, critically acclaimed movies
  const additionalMovies: Movie[] = [
    // Add 10-15 more movies with comprehensive details
    {
      id: "movie-3001",
      title: "Pulp Fiction",
      image_url: "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWIxMTUtZTIwMWNiYjQzNzM2XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
      year: "1994",
      description: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
      rating: 8.9,
      genre: "Crime"
    },
    {
      id: "movie-3002",
      title: "The Shawshank Redemption",
      image_url: "https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWVhXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
      year: "1994",
      description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
      rating: 9.3,
      genre: "Drama"
    },
    {
      id: "movie-3003",
      title: "Schindler's List",
      image_url: "https://m.media-amazon.com/images/M/MV5BNDE4OTMxMTctODBlOC00ZmFmLWI4Y2UtYzQ0OGM0MWExMGU1XkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg",
      year: "1993",
      description: "In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.",
      rating: 9.0,
      genre: "Biography"
    },
    {
      id: "movie-3004",
      title: "Fight Club",
      image_url: "https://m.media-amazon.com/images/M/MV5BMmEzNTU0YzAtNGNiNC00MjA3LTkxNDctMTViN2RkNzE1MjU1XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
      year: "1999",
      description: "An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into something much, much more.",
      rating: 8.8,
      genre: "Drama"
    },
    {
      id: "movie-3005",
      title: "The Matrix",
      image_url: "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZTNhZjNiZTEyXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
      year: "1999",
      description: "A computer programmer discovers that reality as he knows it is a simulation created by machines, and joins a rebellion to break free.",
      rating: 8.7,
      genre: "Sci-Fi"
    }
  ];
  
  // Add these movies to Supabase for future use
  try {
    console.log("Starting to add additional movies to database");
    await addMoviesToSupabase(additionalMovies);
    console.log("Successfully added additional movies to database");
    // Also store in local storage for offline access
    setLocalMovies(additionalMovies);
    return additionalMovies;
  } catch (error) {
    console.error("Error adding additional movies:", error);
    // Store locally even if Supabase fails
    setLocalMovies(additionalMovies);
    return additionalMovies;
  }
}
