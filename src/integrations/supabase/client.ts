
import { createClient } from '@supabase/supabase-js';

// Since we're not using sensitive API keys in this mock implementation,
// we'll create a simple mock client that returns sample data
const mockMovies = [
  {
    id: 1,
    title: 'The Shawshank Redemption',
    year: '1994',
    description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    image_url: 'https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg'
  },
  {
    id: 2,
    title: 'The Godfather',
    year: '1972',
    description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
    image_url: 'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg'
  },
  {
    id: 3,
    title: 'The Dark Knight',
    year: '2008',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    image_url: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg'
  },
  {
    id: 4,
    title: 'Pulp Fiction',
    year: '1994',
    description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
    image_url: 'https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg'
  },
  {
    id: 5,
    title: 'Fight Club',
    year: '1999',
    description: 'An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into something much, much more.',
    image_url: 'https://m.media-amazon.com/images/M/MV5BMmEzNTkxYjQtZTc0MC00YTVjLTg5ZTEtZWMwOWVlYzY0NWIwXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg'
  },
  {
    id: 6,
    title: 'Inception',
    year: '2010',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    image_url: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg'
  },
  {
    id: 7,
    title: 'The Matrix',
    year: '1999',
    description: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
    image_url: 'https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg'
  },
  {
    id: 8,
    title: 'Interstellar',
    year: '2014',
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    image_url: 'https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg'
  }
];

// Create a mock Supabase client with the 'from' method
export const supabase = {
  from: (table: string) => {
    // Only support 'movies' table for now
    if (table === 'movies') {
      return {
        select: (columns: string) => {
          return {
            order: (column: string, { ascending }: { ascending: boolean }) => {
              // Sort the movies by title if that's what was requested
              const sortedMovies = [...mockMovies];
              if (column === 'title') {
                sortedMovies.sort((a, b) => {
                  return ascending 
                    ? a.title.localeCompare(b.title) 
                    : b.title.localeCompare(a.title);
                });
              }
              
              // Return a promise that resolves with the data
              return Promise.resolve({
                data: sortedMovies,
                error: null
              });
            }
          };
        }
      };
    }
    
    // Return empty data for other tables
    return {
      select: () => ({
        order: () => Promise.resolve({ data: [], error: null })
      })
    };
  }
};
