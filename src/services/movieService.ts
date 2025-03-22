
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
  
  return data || [];
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
