
import { supabase } from "@/integrations/supabase/client";
import { Movie } from "@/types/movie";

export async function fetchMovies(): Promise<Movie[]> {
  const { data, error } = await supabase
    .from('movies')
    .select('*');
  
  if (error) {
    console.error('Error fetching movies:', error);
    throw error;
  }
  
  // Ensure all movies have a rating value, default to 0 if null
  return (data || []).map(movie => ({
    ...movie,
    rating: movie.rating || 0
  }));
}

export async function addMoviesToSupabase(movies: Movie[]): Promise<void> {
  // Process in batches of 10 to avoid payload size issues
  const batchSize = 10;
  
  for (let i = 0; i < movies.length; i += batchSize) {
    const batch = movies.slice(i, i + batchSize);
    
    const { error } = await supabase
      .from('movies')
      .upsert(batch, { 
        onConflict: 'id',
        ignoreDuplicates: false
      });
    
    if (error) {
      console.error(`Error adding movies batch ${i}:`, error);
      throw error;
    }
    
    console.log(`Added batch ${i / batchSize + 1} of movies`);
  }
}

export async function syncWatchlist(movieIds: string[]): Promise<void> {
  // First get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  // Delete existing watchlist entries for this user
  const { error: deleteError } = await supabase
    .from('watchlist')
    .delete()
    .eq('user_id', user.id);
  
  if (deleteError) {
    console.error('Error clearing watchlist:', deleteError);
    throw deleteError;
  }
  
  // Insert new watchlist entries
  if (movieIds.length === 0) {
    return; // No entries to add
  }
  
  const watchlistEntries = movieIds.map(movieId => ({
    user_id: user.id,
    movie_id: movieId,
  }));
  
  const { error: insertError } = await supabase
    .from('watchlist')
    .insert(watchlistEntries);
  
  if (insertError) {
    console.error('Error updating watchlist:', insertError);
    throw insertError;
  }
}

export async function fetchWatchlist(): Promise<string[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('watchlist')
    .select('movie_id')
    .eq('user_id', user.id);
  
  if (error) {
    console.error('Error fetching watchlist:', error);
    throw error;
  }
  
  return (data || []).map(item => item.movie_id);
}

// New function to fetch more movie data from TMDB
export async function fetchMoreMovies(): Promise<Movie[]> {
  // This would typically call an API, but for now we'll add more static data
  const additionalMovies: Movie[] = [
    {
      id: "movie-2001",
      title: "The Godfather: Part III",
      image_url: "https://m.media-amazon.com/images/M/MV5BNWFlYWY2YjYtNjdhNi00MzVlLTg2MTMtMWExNzg4NmM5NmEzXkEyXkFqcGdeQXVyMDk5Mzc5MQ@@._V1_.jpg",
      year: "1990",
      description: "In the midst of trying to legitimize his business dealings in New York City and Italy in 1979, aging Mafia Don Michael Corleone seeks to avow for his sins, while taking his nephew Vincent Mancini under his wing.",
      rating: 7.6
    },
    {
      id: "movie-2002",
      title: "Seven Samurai",
      image_url: "https://m.media-amazon.com/images/M/MV5BNWQ3OTM4ZGItMWEwZi00MjI5LWI3YzgtNTYwNWRkNmIzMGI5XkEyXkFqcGdeQXVyNDY2MTk1ODk@._V1_.jpg",
      year: "1954",
      description: "A poor village under attack by bandits recruits seven unemployed samurai to help them defend themselves.",
      rating: 8.6
    },
    {
      id: "movie-2003",
      title: "Casablanca",
      image_url: "https://m.media-amazon.com/images/M/MV5BY2IzZGY2YmEtYzljNS00NTM5LTgwMzUtMzM1NjQ4NGI0OTk0XkEyXkFqcGdeQXVyNDYyMDk5MTU@._V1_.jpg",
      year: "1942",
      description: "A cynical expatriate American cafe owner struggles to decide whether or not to help his former lover and her fugitive husband escape the Nazis in French Morocco.",
      rating: 8.5
    },
    {
      id: "movie-2004",
      title: "Harakiri",
      image_url: "https://m.media-amazon.com/images/M/MV5BYjBmYTQ1NjItZWU5MS00YjI0LTg2OTYtYmFkN2JkMmNiNWVkXkEyXkFqcGdeQXVyMTMxMTY0OTQ@._V1_.jpg",
      year: "1962",
      description: "When a ronin requesting seppuku at a feudal lord's palace is told of the brutal suicide of another ronin who previously visited, he reveals how their pasts are intertwined - and in doing so challenges the clan's integrity.",
      rating: 8.7
    },
    {
      id: "movie-2005",
      title: "Grave of the Fireflies",
      image_url: "https://m.media-amazon.com/images/M/MV5BZmY2NjUzNDQtNTgxNC00M2Q4LTljOWQtMjNjNDBjNWUxNmJlXkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_.jpg",
      year: "1988",
      description: "A young boy and his little sister struggle to survive in Japan during World War II.",
      rating: 8.5
    },
    {
      id: "movie-2006",
      title: "Rear Window",
      image_url: "https://m.media-amazon.com/images/M/MV5BNGUxYWM3M2MtMGM3Mi00ZmRiLWE0NGQtZjE5ODI2OTJhNTU0XkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg",
      year: "1954",
      description: "A wheelchair-bound photographer spies on his neighbors from his apartment window and becomes convinced one of them has committed murder.",
      rating: 8.5
    },
    {
      id: "movie-2007",
      title: "Cinema Paradiso",
      image_url: "https://m.media-amazon.com/images/M/MV5BM2FhYjEyYmYtMDI1Yy00YTdlLWI2NWQtYmEzNzAxOGY1NjY2XkEyXkFqcGdeQXVyNTA3NTIyNDg@._V1_.jpg",
      year: "1988",
      description: "A filmmaker recalls his childhood when falling in love with the pictures at the cinema of his home village and forms a deep friendship with the cinema's projectionist.",
      rating: 8.5
    },
    {
      id: "movie-2008",
      title: "Witness for the Prosecution",
      image_url: "https://m.media-amazon.com/images/M/MV5BNDQwODU5OWYtNDcyNi00MDQ1LThiOGMtZDkwNWJiM2Y3MDg0XkEyXkFqcGdeQXVyMDI2NDg0NQ@@._V1_.jpg",
      year: "1957",
      description: "A veteran British barrister must defend his client in a murder trial that has surprise after surprise.",
      rating: 8.4
    },
    {
      id: "movie-2009",
      title: "Vertigo",
      image_url: "https://m.media-amazon.com/images/M/MV5BYTY1MDljZDMtNWY1Ni00N2QxLTgxNmYtYzYwYmM0ZjkzOTcxXkEyXkFqcGdeQXVyMDM2NDM2MQ@@._V1_.jpg",
      year: "1958",
      description: "A former San Francisco police detective juggles wrestling with his personal demons and becoming obsessed with the hauntingly beautiful woman he has been hired to trail, who may be deeply disturbed.",
      rating: 8.3
    },
    {
      id: "movie-2010",
      title: "The Thing",
      image_url: "https://m.media-amazon.com/images/M/MV5BNGViZWZmM2EtNGYzZi00ZDAyLTk3ODMtNzIyZTBjN2Y1NmM1XkEyXkFqcGdeQXVyNTAyODkwOQ@@._V1_.jpg",
      year: "1982",
      description: "A research team in Antarctica is hunted by a shape-shifting alien that assumes the appearance of its victims.",
      rating: 8.2
    }
  ];
  
  // Add these movies to Supabase for future use
  try {
    await addMoviesToSupabase(additionalMovies);
    console.log("Added additional movies to database");
  } catch (error) {
    console.error("Error adding additional movies:", error);
  }
  
  return additionalMovies;
}
