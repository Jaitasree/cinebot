
import { supabase } from "@/integrations/supabase/client";
import { Movie } from "@/types/movie";
import { v4 as uuidv4 } from 'uuid';

// Local storage key for movies
const LOCAL_MOVIES_KEY = "local_movies";

export async function fetchMovies(): Promise<Movie[]> {
  try {
    console.log("Fetching movies from Supabase...");
    const { data, error } = await supabase
      .from('movies')
      .select('*');
    
    if (error) {
      console.error('Error fetching movies from Supabase:', error);
      // Try to get movies from local storage as fallback
      const localMovies = getLocalMovies();
      console.log(`Retrieved ${localMovies.length} movies from local storage as fallback`);
      return localMovies;
    }
    
    if (!data || data.length === 0) {
      console.log("No movies found in Supabase, checking local storage");
      // Try to get movies from local storage as fallback
      const localMovies = getLocalMovies();
      console.log(`Retrieved ${localMovies.length} movies from local storage as fallback`);
      return localMovies;
    }
    
    console.log(`Successfully fetched ${data.length} movies from Supabase`);
    
    // Ensure all movies have a rating value, default to 0 if null
    const movies = data.map(movie => ({
      ...movie,
      rating: movie.rating || 0
    }));
    
    // Store in local storage as a backup
    setLocalMovies(movies);
    
    return movies;
  } catch (error) {
    console.error("Unexpected error fetching movies:", error);
    // Fallback to local storage
    const localMovies = getLocalMovies();
    console.log(`Retrieved ${localMovies.length} movies from local storage after error`);
    return localMovies;
  }
}

// Get movies from local storage
function getLocalMovies(): Movie[] {
  try {
    const storedMovies = localStorage.getItem(LOCAL_MOVIES_KEY);
    if (!storedMovies) return [];
    
    const movies: Movie[] = JSON.parse(storedMovies);
    return movies;
  } catch (error) {
    console.error("Error reading movies from local storage:", error);
    return [];
  }
}

// Store movies in local storage
function setLocalMovies(movies: Movie[]): void {
  try {
    localStorage.setItem(LOCAL_MOVIES_KEY, JSON.stringify(movies));
    console.log(`Stored ${movies.length} movies in local storage`);
  } catch (error) {
    console.error("Error storing movies in local storage:", error);
  }
}

export async function addMoviesToSupabase(movies: Movie[]): Promise<void> {
  // Process in batches of 10 to avoid payload size issues
  const batchSize = 10;
  console.log(`Adding ${movies.length} movies to Supabase in batches of ${batchSize}...`);
  
  try {
    for (let i = 0; i < movies.length; i += batchSize) {
      const batch = movies.slice(i, i + batchSize).map(movie => {
        // Use existing ID if it's a UUID, otherwise generate a new one
        const id = movie.id && !movie.id.startsWith('movie-') ? movie.id : uuidv4();
        
        return {
          id,
          title: movie.title,
          image_url: movie.image_url,
          year: movie.year,
          description: movie.description,
          rating: Number(movie.rating) || 0
        };
      });
      
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1} with ${batch.length} movies`);
      
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
      
      console.log(`Successfully added batch ${Math.floor(i / batchSize) + 1} of movies`);
    }
    
    // After adding to Supabase, also store locally
    setLocalMovies(movies);
    
    console.log(`Finished adding ${movies.length} movies to Supabase`);
  } catch (error) {
    console.error("Error in addMoviesToSupabase:", error);
    // At least save to local storage
    setLocalMovies(movies);
    throw error;
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

// Function to delete movies by title
export async function deleteMoviesByTitle(titles: string[]): Promise<void> {
  if (!titles || titles.length === 0) {
    console.log("No titles provided for deletion");
    return;
  }
  
  console.log(`Attempting to delete movies with titles: ${titles.join(', ')}`);
  
  try {
    // Delete from Supabase
    for (const title of titles) {
      const { error } = await supabase
        .from('movies')
        .delete()
        .ilike('title', title);
      
      if (error) {
        console.error(`Error deleting movie "${title}" from Supabase:`, error);
      } else {
        console.log(`Successfully deleted movie "${title}" from Supabase`);
      }
    }
    
    // Update local storage to reflect the changes
    const localMovies = getLocalMovies();
    const updatedMovies = localMovies.filter(movie => 
      !titles.some(title => movie.title.toLowerCase() === title.toLowerCase())
    );
    
    setLocalMovies(updatedMovies);
    console.log(`Updated local storage after deletion. Remaining movies: ${updatedMovies.length}`);
    
  } catch (error) {
    console.error("Error in deleteMoviesByTitle:", error);
    throw error;
  }
}

// Function to fetch additional movies with real IMDb ratings
export async function fetchMoreMovies(): Promise<Movie[]> {
  // Adding 50 additional movies with real IMDb ratings
  const additionalMovies: Movie[] = [
    {
      id: "movie-2001",
      title: "The Godfather: Part III",
      image_url: "https://m.media-amazon.com/images/M/MV5BNWFlYWY2YjYtNjdhNi00MzVlLTg2MTMtMWExNzg4NmM5NmEzXkEyXkFqcGdeQXVyMDk5Mzc5MQ@@._V1_.jpg",
      year: "1990",
      description: "In the midst of trying to legitimize his business dealings in New York City and Italy in 1979, aging Mafia Don Michael Corleone seeks to avow for his sins, while taking his nephew Vincent Mancini under his wing.",
      rating: 7.6
    },
    // Remove "Seven Samurai" movie
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
    },
    // Remove "The Third Man" movie
    {
      id: "movie-2012",
      title: "North by Northwest",
      image_url: "https://m.media-amazon.com/images/M/MV5BZDA3NDExMTUtMDlhOC00ZDZhLTk4YzEtMDMyMzcxY2IwMDAyXkEyXkFqcGdeQXVyNjc1NTYyMjg@._V1_.jpg",
      year: "1959",
      description: "A New York City advertising executive goes on the run after being mistaken for a government agent by a group of foreign spies.",
      rating: 8.3
    },
    {
      id: "movie-2013",
      title: "Lawrence of Arabia",
      image_url: "https://m.media-amazon.com/images/M/MV5BYWY5ZjhjNGYtZmI2Ny00ODM0LWFkNzgtZmI1YzA2N2MxMzA0XkEyXkFqcGdeQXVyNjUwNzk3NDc@._V1_.jpg",
      year: "1962",
      description: "The story of T.E. Lawrence, the English officer who successfully united and led the diverse, often warring, Arab tribes during World War I in order to fight the Turks.",
      rating: 8.3
    },
    {
      id: "movie-2014",
      title: "Ikiru",
      image_url: "https://m.media-amazon.com/images/M/MV5BZmM0NGY3Y2MtMTA1YS00YmQzLTk2YTctYWFhMDkzMDRjZWQzXkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_.jpg",
      year: "1952",
      description: "A bureaucrat tries to find meaning in his life after he discovers he has terminal cancer.",
      rating: 8.3
    },
    {
      id: "movie-2015",
      title: "Ran",
      image_url: "https://m.media-amazon.com/images/M/MV5BNTEyNjg0MDM4OF5BMl5BanBnXkFtZTgwODI0NjUxODE@._V1_.jpg",
      year: "1985",
      description: "In Medieval Japan, an elderly warlord retires, handing over his empire to his three sons. However, he vastly underestimates how the new-found power will corrupt them and cause them to turn on each other...and him.",
      rating: 8.2
    },
    {
      id: "movie-2016",
      title: "Stalker",
      image_url: "https://m.media-amazon.com/images/M/MV5BMDgwODNmMGItMDcwYi00OWZjLTgyZjAtMGYwMmI4N2Q0NmJmXkEyXkFqcGdeQXVyNzY1MTU0Njk@._V1_.jpg",
      year: "1979",
      description: "A guide leads two men through an area known as the Zone to find a room that grants wishes.",
      rating: 8.2
    },
    {
      id: "movie-2017",
      title: "Touch of Evil",
      image_url: "https://m.media-amazon.com/images/M/MV5BOTA1MjA3M2EtMmJjZS00OWViLTkwMTMtMDcyNTY5NjAyZDhlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
      year: "1958",
      description: "A stark, perverse story of murder, kidnapping, and police corruption in a Mexican border town.",
      rating: 8.0
    },
    {
      id: "movie-2018",
      title: "Come and See",
      image_url: "https://m.media-amazon.com/images/M/MV5BODM4Njg0NTAtYjI5Ny00ZjAxLTkwNmItZTMxMWU5M2U3M2RjXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
      year: "1985",
      description: "After finding an old rifle, a young boy joins the Soviet resistance movement against ruthless German forces and experiences the horrors of World War II.",
      rating: 8.4
    },
    {
      id: "movie-2019",
      title: "2001: A Space Odyssey",
      image_url: "https://m.media-amazon.com/images/M/MV5BMmNlYzRiNDctZWNhMi00MzI4LThkZTctMTUzMmZkMmFmNThmXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
      year: "1968",
      description: "After uncovering a mysterious artifact buried beneath the Lunar surface, a spacecraft is sent to Jupiter to find its origins: a spacecraft manned by two men and the supercomputer HAL 9000.",
      rating: 8.3
    },
    {
      id: "movie-2020",
      title: "Alien",
      image_url: "https://m.media-amazon.com/images/M/MV5BOGQzZTBjMjQtOTVmMS00NGE5LWEyYmMtOGQ1ZGZjNmRkYjFhXkEyXkFqcGdeQXVyMjUzOTY1NTc@._V1_.jpg",
      year: "1979",
      description: "The crew of a commercial spacecraft encounter a deadly lifeform after investigating an unknown transmission.",
      rating: 8.5
    },
    {
      id: "movie-2021",
      title: "Bicycle Thieves",
      image_url: "https://m.media-amazon.com/images/M/MV5BNmI1ODdjODctMDlmMC00ZWViLWI5MzYtYzRhNDdjYmM3MzFjXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
      year: "1948",
      description: "In post-war Italy, a working-class man's bicycle is stolen, endangering his efforts to find work. He and his son set out to find it.",
      rating: 8.3
    },
    {
      id: "movie-2022",
      title: "M",
      image_url: "https://m.media-amazon.com/images/M/MV5BODA4ODk3OTEzMF5BMl5BanBnXkFtZTgwMTQ2ODMwMzE@._V1_.jpg",
      year: "1931",
      description: "When the police in a German city are unable to catch a child-murderer, other criminals join in the manhunt.",
      rating: 8.3
    },
    {
      id: "movie-2023",
      title: "Amadeus",
      image_url: "https://m.media-amazon.com/images/M/MV5BNWJlNzUzNGMtYTAwMS00ZjI2LWFmNWQtODcxNWUxODA5YmU1XkEyXkFqcGdeQXVyNTIzOTk5ODM@._V1_.jpg",
      year: "1984",
      description: "The life, success and troubles of Wolfgang Amadeus Mozart, as told by Antonio Salieri, the contemporaneous composer who was deeply jealous of Mozart's talent and claimed to have murdered him.",
      rating: 8.4
    },
    {
      id: "movie-2024",
      title: "Double Indemnity",
      image_url: "https://m.media-amazon.com/images/M/MV5BOTdlNjgyZGUtOTczYi00MDdhLTljZmMtYTEwZmRiOWFkYjRhXkEyXkFqcGdeQXVyNDY2MTk1ODk@._V1_.jpg",
      year: "1944",
      description: "An insurance salesman gets roped into a murderous scheme by a femme fatale.",
      rating: 8.3
    },
    {
      id: "movie-2025",
      title: "The Great Dictator",
      image_url: "https://m.media-amazon.com/images/M/MV5BMmExYWJjNTktNGUyZS00ODhmLTkxYzAtNWIzOGEyMGNiMmUwXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
      year: "1940",
      description: "Dictator Adenoid Hynkel tries to expand his empire while a poor Jewish barber tries to avoid persecution from Hynkel's regime.",
      rating: 8.4
    },
    {
      id: "movie-2026",
      title: "The General",
      image_url: "https://m.media-amazon.com/images/M/MV5BYmRiMDFlYjYtOTMwYy00OGY2LWE0Y2QtYzQxOGNhZmUwNTIxXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
      year: "1926",
      description: "After being rejected by the Confederate military, not realizing it was due to his crucial civilian role, an engineer must single-handedly recapture his beloved locomotive after it is seized by Union spies and return it to Southern lines.",
      rating: 8.1
    },
    {
      id: "movie-2027",
      title: "For a Few Dollars More",
      image_url: "https://m.media-amazon.com/images/M/MV5BNWM1NmYyM2ItMTFhNy00NDU0LTk2ODItYWEyOWQ1MjYwNDczXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
      year: "1965",
      description: "Two bounty hunters with the same intentions team up to track down a Western outlaw.",
      rating: 8.2
    },
    {
      id: "movie-2028",
      title: "Once Upon a Time in America",
      image_url: "https://m.media-amazon.com/images/M/MV5BMGFkNWI4MTMtNGQ0OC00MWVmLTk3MTktOGYxN2Y2YWVkZWE2XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
      year: "1984",
      description: "A former Prohibition-era Jewish gangster returns to the Lower East Side of Manhattan 35 years later, where he must once again confront the ghosts and regrets of his old life.",
      rating: 8.3
    },
    {
      id: "movie-2029",
      title: "Good, the Bad and the Ugly",
      image_url: "https://m.media-amazon.com/images/M/MV5BNjJlYmNkZGItM2NhYy00MjlmLTk5NmQtNjg1NmM2ODU4OTMwXkEyXkFqcGdeQXVyMjUzOTY1NTc@._V1_.jpg",
      year: "1966",
      description: "A bounty hunting scam joins two men in an uneasy alliance against a third in a race to find a fortune in gold buried in a remote cemetery.",
      rating: 8.8
    },
    {
      id: "movie-2030",
      title: "High and Low",
      image_url: "https://m.media-amazon.com/images/M/MV5BZGQ1NWZlYjctNDJmOS00MmU2LTg1ODItNmZiM2ZkNzJhNDI0XkEyXkFqcGdeQXVyNjc1NTYyMjg@._V1_.jpg",
      year: "1963",
      description: "An executive of a Yokohama shoe company becomes a victim of extortion when his chauffeur's son is kidnapped by mistake and held for ransom.",
      rating: 8.4
    },
    {
      id: "movie-2031",
      title: "Once Upon a Time in the West",
      image_url: "https://m.media-amazon.com/images/M/MV5BODQ3NDExOGYtMzI3Mi00NWRlLTkwNjAtNjc4MDgzZGJiZTA1XkEyXkFqcGdeQXVyMjUzOTY1NTc@._V1_.jpg",
      year: "1968",
      description: "A mysterious stranger with a harmonica joins forces with a notorious desperado to protect a beautiful widow from a ruthless assassin working for the railroad.",
      rating: 8.5
    },
    {
      id: "movie-2032",
      title: "To Kill a Mockingbird",
      image_url: "https://m.media-amazon.com/images/M/MV5BNmVmYzcwNzMtMWM1NS00MWIyLThlMDEtYzUwZDgzODE1NmE2XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
      year: "1962",
      description: "Atticus Finch, a lawyer in the Depression-era South, defends a black man against an undeserved rape charge, and his children against prejudice.",
      rating: 8.3
    },
    {
      id: "movie-2033",
      title: "Taxi Driver",
      image_url: "https://m.media-amazon.com/images/M/MV5BM2M1MmVhNDgtNmI0YS00ZDNmLTkyNjctNTJiYTQ2N2NmYzc2XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
      year: "1976",
      description: "A mentally unstable veteran works as a nighttime taxi driver in New York City, where the perceived decadence and sleaze fuels his urge for violent action.",
      rating: 8.2
    },
    {
      id: "movie-2034",
      title: "L.A. Confidential",
      image_url: "https://m.media-amazon.com/images/M/MV5BMDQ2YzEyZGItYWRhOS00MjBmLTkzMDUtMTdjYzkyMmQxZTJlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
      year: "1997",
      description: "As corruption grows in 1950s Los Angeles, three policemen - one strait-laced, one brutal, and one sleazy - investigate a series of murders with their own brand of justice.",
      rating: 8.2
    },
    {
      id: "movie-2035",
      title: "Eternal Sunshine of the Spotless Mind",
      image_url: "https://m.media-amazon.com/images/M/MV5BMTY4NzcwODg3Nl5BMl5BanBnXkFtZTcwNTEwOTMyMw@@._V1_.jpg",
      year: "2004",
      description: "When their relationship turns sour, a couple undergoes a medical procedure to have each other erased from their memories.",
      rating: 8.3
    },
    {
      id: "movie-2036",
      title: "The Apartment",
      image_url: "https://m.media-amazon.com/images/M/MV5BNzkwODFjNzItMmMwNi00MTU5LWE2MzktM2M4ZDczZGM1MmViXkEyXkFqcGdeQXVyNDY2MTk1ODk@._V1_.jpg",
      year: "1960",
      description: "A man tries to rise in his company by letting its executives use his apartment for trysts, but complications and a romance of his own ensue.",
      rating: 8.3
    },
    {
      id: "movie-2037",
      title: "Heat",
      image_url: "https://m.media-amazon.com/images/M/MV5BNDc0YTQ5NGEtM2NkYS00MWRhLThiNzAtNmY3NWU3YzNkMjIyXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
      year: "1995",
      description: "A group of professional bank robbers start to feel the heat from police when they unknowingly leave a clue at their latest heist.",
      rating: 8.3
    },
    {
      id: "movie-2038",
      title: "Full Metal Jacket",
      image_url: "https://m.media-amazon.com/images/M/MV5BNzkxODk0NjEtYjc4Mi00ZDI0LTgyYjEtYzc1NDkxY2YzYTgyXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
      year: "1987",
      description: "A pragmatic U.S. Marine observes the dehumanizing effects the Vietnam War has on his fellow recruits from their brutal boot camp training to the bloody street fighting in Hue.",
      rating: 8.3
    },
    {
      id: "movie-2039",
      title: "The Sting",
      image_url: "https://m.media-amazon.com/images/M/MV5BNGU3NjQ4YTMtZGJjOS00YTQ3LThmNmItMTI5MDE2ODI3NzY3XkEyXkFqcGdeQXVyMjUzOTY1NTc@._V1_.jpg",
      year: "1973",
      description: "Two grifters team up to pull off the ultimate con.",
      rating: 8.3
    },
    {
      id: "movie-2040",
      title: "Indiana Jones and the Raiders of the Lost Ark",
      image_url: "https://m.media-amazon.com/images/M/MV5BNTU2ODkyY2MtMjU1NC00NjE1LWEzYjgtMWQ3MzRhMTE0NDc0XkEyXkFqcGdeQXVyMjM4MzQ4OTQ@._V1_.jpg",
      year: "1981",
      description: "In 1936, archaeologist and adventurer Indiana Jones is hired by the U.S. government to find the Ark of the Covenant before the Nazis can obtain its awesome powers.",
      rating: 8.4
    },
    {
      id: "movie-2041",
      title: "There Will Be Blood",
      image_url: "https://m.media-amazon.com/images/M/MV5BMjAxODQ4MDU5NV5BMl5BanBnXkFtZTcwMDU4MjU1MQ@@._V1_.jpg",
      year: "2007",
      description: "A story of family, religion, hatred, oil and madness, focusing on a turn-of-the-century prospector in the early days of the business.",
      rating: 8.2
    },
    {
      id: "movie-2042",
      title: "A Clockwork Orange",
      image_url: "https://m.media-amazon.com/images/M/MV5BMTY3MjM1Mzc4N15BMl5BanBnXkFtZTgwODM0NzAxMDE@._V1_.jpg",
      year: "1971",
      description: "In the future, a sadistic gang leader is imprisoned and volunteers for a conduct-aversion experiment, but it doesn't go as planned.",
      rating: 8.3
    },
    {
      id: "movie-2043",
      title: "Reservoir Dogs",
      image_url: "https://m.media-amazon.com/images/M/MV5BZmExNmEwYWItYmQzOS00YjA5LTk2MjktZjEyZDE1Y2QxNjA1XkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg",
      year: "1992",
      description: "When a simple jewelry heist goes horribly wrong, the surviving criminals begin to suspect that one of them is a police informant.",
      rating: 8.3
    },
    {
      id: "movie-2044",
      title: "Metropolis",
      image_url: "https://m.media-amazon.com/images/M/MV5BMTg5YWIyMWUtZDY5My00Zjc1LTljOTctYmI0MWRmY2M2NmRkXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
      year: "1927",
      description: "In a futuristic city sharply divided between the working class and the city planners, the son of the city's mastermind falls in love with a working-class prophet who predicts the coming of a savior to mediate their differences.",
      rating: 8.3
    },
    {
      id: "movie-2045",
      title: "Unforgiven",
      image_url: "https://m.media-amazon.com/images/M/MV5BODM3YWY4NmQtN2Y3Ni00OTg0LWFhZGQtZWE3ZWY4MTJlOWU4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
      year: "1992",
      description: "Retired Old West gunslinger William Munny reluctantly takes on one last job, with the help of his old partner Ned Logan and a young man, The 'Schofield Kid.'",
      rating: 8.2
    },
    {
      id: "movie-2046",
      title: "Requiem for a Dream",
      image_url: "https://m.media-amazon.com/images/M/MV5BOTdiNzJlOWUtNWMwNS00NmFlLWI0YTEtZmI3YjIzZWUyY2Y3XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
      year: "2000",
      description: "The drug-induced utopias of four Coney Island people are shattered when their addictions run deep.",
      rating: 8.3
    },
    {
      id: "movie-2047",
      title: "The Treasure of the Sierra Madre",
      image_url: "https://m.media-amazon.com/images/M/MV5BZjJhNTBmNTgtMDViOC00NDY2LWE4N2ItMDJiM2ZiYmQzYzliXkEyXkFqcGdeQXVyMzg1ODEwNQ@@._V1_.jpg",
      year: "1948",
      description: "Two down-on-their-luck Americans searching for work in Mexico convince an old prospector to help them mine for gold in the Sierra Madre Mountains.",
      rating: 8.2
    },
    {
      id: "movie-2048",
      title: "Rashomon",
      image_url: "https://m.media-amazon.com/images/M/MV5BMjEzMzA4NDE2OF5BMl5BanBnXkFtZTcwNTc5MDI2NQ@@._V1_.jpg",
      year: "1950",
      description: "The rape of a bride and the murder of her samurai husband are recalled from the perspectives of a bandit, the bride, the samurai's ghost and a woodcutter.",
      rating: 8.2
    },
    {
      id: "movie-2049",
      title: "Inglourious Basterds",
      image_url: "https://m.media-amazon.com/images/M/MV5BOTJiNDEzOWYtMTVjOC00ZjlmLWE0NGMtZmE1OWVmZDQ2OWJhXkEyXkFqcGdeQXVyNTIzOTk5ODM@._V1_.jpg",
      year: "2009",
      description: "In Nazi-occupied France during World War II, a plan to assassinate Nazi leaders by a group of Jewish U.S. soldiers coincides with a theatre owner's vengeful plans for the same.",
      rating: 8.3
    },
    {
      id: "movie-2050",
      title: "All About Eve",
      image_url: "https://m.media-amazon.com/images/M/MV5BMTY2MTAzODI5NV5BMl5BanBnXkFtZTgwMjM4NzQ0MjE@._V1_.jpg",
      year: "1950",
      description: "A seemingly timid but secretly ruthless ingénue insinuates herself into the lives of an aging Broadway star and her circle of theater friends.",
      rating: 8.2
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
