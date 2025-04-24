
import { supabase } from "@/integrations/supabase/client";
import { Movie } from "@/types/movie";

export async function addMoviesToSupabase(movies: Movie[]): Promise<void> {
  try {
    for (const movie of movies) {
      const { error } = await supabase.from("movies").upsert({
        id: movie.id,
        title: movie.title,
        image_url: movie.image_url,
        year: movie.year,
        description: movie.description,
        rating: movie.rating,
        genre: movie.genre || null
      });
      
      if (error) {
        console.error("Error adding movie to Supabase:", error);
      }
    }
  } catch (error) {
    console.error("Error in addMoviesToSupabase:", error);
    throw error;
  }
}

export function setLocalMovies(movies: Movie[]): void {
  try {
    const existingMovies = JSON.parse(localStorage.getItem("movies") || "[]");
    const updatedMovies = [...existingMovies];
    
    for (const movie of movies) {
      if (!updatedMovies.some(m => m.id === movie.id)) {
        updatedMovies.push(movie);
      }
    }
    
    localStorage.setItem("movies", JSON.stringify(updatedMovies));
  } catch (error) {
    console.error("Error setting local movies:", error);
  }
}

export async function fetchMovies(): Promise<Movie[]> {
  try {
    const { data, error } = await supabase
      .from("movies")
      .select("*")
      .order("rating", { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error fetching movies:", error);
    
    // Fallback to local storage
    try {
      const localMovies = JSON.parse(localStorage.getItem("movies") || "[]");
      return localMovies;
    } catch (e) {
      console.error("Error fetching local movies:", e);
      return [];
    }
  }
}

export async function fetchWatchlist(userId?: string): Promise<string[]> {
  try {
    // Try to get from local storage first
    const localWatchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
    
    if (!userId) {
      return localWatchlist;
    }
    
    // If we have a user ID, try to get from Supabase
    const { data, error } = await supabase
      .from("watchlist")
      .select("movie_id")
      .eq("user_id", userId);
    
    if (error) {
      throw error;
    }
    
    const movieIds = data.map(item => item.movie_id);
    
    // Update local storage with server data
    localStorage.setItem("watchlist", JSON.stringify(movieIds));
    
    return movieIds;
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return JSON.parse(localStorage.getItem("watchlist") || "[]");
  }
}

export async function syncWatchlist(movieIds: string[]): Promise<void> {
  try {
    const userString = localStorage.getItem("user");
    if (!userString) {
      console.log("No user found, only updating local watchlist");
      return;
    }
    
    const user = JSON.parse(userString);
    if (!user || !user.id) {
      console.log("Invalid user data, only updating local watchlist");
      return;
    }
    
    // First, delete all existing watchlist entries for this user
    const { error: deleteError } = await supabase
      .from("watchlist")
      .delete()
      .eq("user_id", user.id);
    
    if (deleteError) {
      console.error("Error deleting watchlist entries:", deleteError);
    }
    
    // Then insert new entries
    for (const movieId of movieIds) {
      const { error: insertError } = await supabase
        .from("watchlist")
        .insert({
          user_id: user.id,
          movie_id: movieId
        });
      
      if (insertError) {
        console.error(`Error adding movie ${movieId} to watchlist:`, insertError);
      }
    }
  } catch (error) {
    console.error("Error syncing watchlist:", error);
  }
}

export async function searchMoviesByGenre(searchTerm: string): Promise<Movie[]> {
  try {
    const { data, error } = await supabase
      .rpc("search_movies_by_genre", { search_term: searchTerm });
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error searching movies by genre:", error);
    return [];
  }
}

export async function deleteMoviesByTitle(titles: string[]): Promise<void> {
  try {
    for (const title of titles) {
      const { error } = await supabase
        .from("movies")
        .delete()
        .eq("title", title);
      
      if (error) {
        console.error(`Error deleting movie "${title}":`, error);
      } else {
        console.log(`Successfully deleted movie "${title}"`);
      }
    }
  } catch (error) {
    console.error("Error deleting movies by title:", error);
  }
}

export async function fetchMoreMovies(): Promise<Movie[]> {
  // Adding more high-quality, critically acclaimed movies
  const additionalMovies: Movie[] = [
    // Add 10-15 more movies with comprehensive details
    {
      id: "movie-3001",
      title: "Pulp Fiction",
      image_url: "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYTIwMWNiYjQzNzM2XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
      year: "1994",
      description: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
      rating: 8.9,
      genre: "Crime"
    },
    {
      id: "movie-3002",
      title: "The Shawshank Redemption",
      image_url: "https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFhXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
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
    },
    {
      id: "movie-3006",
      title: "Casablanca",
      image_url: "https://m.media-amazon.com/images/M/MV5BY2IzZGY2YmEtYzljNS00NTM5LTgwMzUtMzM1NjQ4NGI0OTk0XkEyXkFqcGdeQXVyNDYyMDk5MTU@._V1_.jpg",
      year: "1942",
      description: "A cynical American expatriate struggles to decide whether or not he should help his former lover and her fugitive husband escape French Morocco.",
      rating: 8.5,
      genre: "Drama"
    },
    {
      id: "movie-3007",
      title: "The Godfather: Part II",
      image_url: "https://m.media-amazon.com/images/M/MV5BMWMwMGQzZTItY2JlNC00OWZiLWIyMDctNDk2ZDQ2YjRjMWQ0XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
      year: "1974",
      description: "The early life and career of Vito Corleone in 1920s New York City is portrayed, while his son, Michael, expands and tightens his grip on the family crime syndicate.",
      rating: 9.0,
      genre: "Crime"
    },
    {
      id: "movie-3008",
      title: "Seven Samurai",
      image_url: "https://m.media-amazon.com/images/M/MV5BNWQ3OTM4ZGItMWEwZi00MjI5LWI3YzgtNTYwNWRkNmIzMGI5XkEyXkFqcGdeQXVyNDY2MTk1ODk@._V1_.jpg",
      year: "1954",
      description: "A poor village under attack by bandits recruits seven unemployed samurai to help them defend themselves.",
      rating: 8.6,
      genre: "Action"
    },
    {
      id: "movie-3009",
      title: "The Lord of the Rings: The Fellowship of the Ring",
      image_url: "https://m.media-amazon.com/images/M/MV5BN2EyZjM3NzUtNWUzMi00MTgxLWI0NTctMzY4M2VlOTdjZWRiXkEyXkFqcGdeQXVyNDUzOTQ5MjY@._V1_.jpg",
      year: "2001",
      description: "A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.",
      rating: 8.8,
      genre: "Adventure"
    },
    {
      id: "movie-3010",
      title: "Citizen Kane",
      image_url: "https://m.media-amazon.com/images/M/MV5BYjBiOTYxZWItMzdiZi00NjlkLWIzZTYtYmFhZjhiMTljOTdkXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
      year: "1941",
      description: "Following the death of publishing tycoon Charles Foster Kane, reporters scramble to uncover the meaning of his final utterance: 'Rosebud.'",
      rating: 8.3,
      genre: "Drama"
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
