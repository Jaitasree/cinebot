
import { useEffect, useState, useCallback } from "react";
import { SearchBar } from "@/components/SearchBar";
import { MovieCard } from "@/components/MovieCard";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Bookmark, Loader2 } from "lucide-react";
import { Movie } from "@/types/movie";
import { fetchMovies, addMoviesToSupabase, fetchWatchlist } from "@/services/movieService";

// Extended movie list with 50 movies from the IMDb Top 250
const additionalMovies: Movie[] = [
  {
    id: "movie-1001",
    title: "The Shawshank Redemption",
    image_url: "https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
    year: "1994",
    description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    rating: 9.3
  },
  {
    id: "movie-1002",
    title: "The Godfather",
    image_url: "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
    year: "1972",
    description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    rating: 9.2
  },
  {
    id: "movie-1003",
    title: "The Dark Knight",
    image_url: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg",
    year: "2008",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    rating: 9.0
  },
  {
    id: "movie-1004",
    title: "The Godfather Part II",
    image_url: "https://m.media-amazon.com/images/M/MV5BMWMwMGQzZTItY2JlNC00OWZiLWIyMDctNDk2ZDQ2YjRjMWQ0XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
    year: "1974",
    description: "The early life and career of Vito Corleone in 1920s New York City is portrayed, while his son, Michael, expands and tightens his grip on the family crime syndicate.",
    rating: 9.0
  },
  {
    id: "movie-1005",
    title: "12 Angry Men",
    image_url: "https://m.media-amazon.com/images/M/MV5BMWU4N2FjNzYtNTVkNC00NzQ0LTg0MjAtYTJlMjFhNGUxZDFmXkEyXkFqcGdeQXVyNjc1NTYyMjg@._V1_.jpg",
    year: "1957",
    description: "A jury holdout attempts to prevent a miscarriage of justice by forcing his colleagues to reconsider the evidence.",
    rating: 9.0
  },
  {
    id: "movie-1006",
    title: "Schindler's List",
    image_url: "https://m.media-amazon.com/images/M/MV5BNDE4OTMxMTctNmRhYy00NWE2LTg3YzItYTk3M2UwOTU5Njg4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
    year: "1993",
    description: "In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.",
    rating: 8.9
  },
  {
    id: "movie-1007",
    title: "The Lord of the Rings: The Return of the King",
    image_url: "https://m.media-amazon.com/images/M/MV5BNzA5ZDNlZWMtM2NhNS00NDJjLTk4NDItYTRmY2EwMWZlMTY3XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
    year: "2003",
    description: "Gandalf and Aragorn lead the World of Men against Sauron's army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.",
    rating: 8.9
  },
  {
    id: "movie-1008",
    title: "Pulp Fiction",
    image_url: "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
    year: "1994",
    description: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    rating: 8.9
  },
  {
    id: "movie-1009",
    title: "Inception",
    image_url: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg",
    year: "2010",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    rating: 8.8
  },
  {
    id: "movie-1010",
    title: "Fight Club",
    image_url: "https://m.media-amazon.com/images/M/MV5BMmEzNTkxYjQtZTc0MC00YTVjLTg5ZTEtZWMwOWVlYzY0NWIwXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
    year: "1999",
    description: "An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into something much, much more.",
    rating: 8.8
  },
  {
    id: "movie-1011",
    title: "Forrest Gump",
    image_url: "https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg",
    year: "1994",
    description: "The presidencies of Kennedy and Johnson, the events of Vietnam, Watergate, and other historical events unfold through the perspective of an Alabama man with an IQ of 75, whose only desire is to be reunited with his childhood sweetheart.",
    rating: 8.8
  },
  {
    id: "movie-1012",
    title: "The Matrix",
    image_url: "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
    year: "1999",
    description: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
    rating: 8.7
  },
  {
    id: "movie-1013",
    title: "Goodfellas",
    image_url: "https://m.media-amazon.com/images/M/MV5BY2NkZjEzMDgtN2RjYy00YzM1LWI4ZmQtMjIwYjFjNmI3ZGEwXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
    year: "1990",
    description: "The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners Jimmy Conway and Tommy DeVito in the Italian-American crime syndicate.",
    rating: 8.7
  },
  {
    id: "movie-1014",
    title: "Interstellar",
    image_url: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
    year: "2014",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    rating: 8.6
  },
  {
    id: "movie-1015",
    title: "The Silence of the Lambs",
    image_url: "https://m.media-amazon.com/images/M/MV5BNjNhZTk0ZmEtNjJhMi00YzFlLWE1MmEtYzM1M2ZmMGMwMTU4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
    year: "1991",
    description: "A young F.B.I. cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer, a madman who skins his victims.",
    rating: 8.6
  },
  {
    id: "movie-1016",
    title: "The Departed",
    image_url: "https://m.media-amazon.com/images/M/MV5BMTI1MTY2OTIxNV5BMl5BanBnXkFtZTYwNjQ4NjY3._V1_.jpg",
    year: "2006",
    description: "An undercover cop and a mole in the police attempt to identify each other while infiltrating an Irish gang in South Boston.",
    rating: 8.5
  },
  {
    id: "movie-1017",
    title: "Whiplash",
    image_url: "https://m.media-amazon.com/images/M/MV5BOTA5NDZlZGUtMjAxOS00YTRkLTkwYmMtYWQ0NWEwZDZiNjEzXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
    year: "2014",
    description: "A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student's potential.",
    rating: 8.5
  },
  {
    id: "movie-1018",
    title: "The Prestige",
    image_url: "https://m.media-amazon.com/images/M/MV5BMjA4NDI0MTIxNF5BMl5BanBnXkFtZTYwNTM0MzY2._V1_.jpg",
    year: "2006",
    description: "After a tragic accident, two stage magicians engage in a battle to create the ultimate illusion while sacrificing everything they have to outwit each other.",
    rating: 8.5
  },
  {
    id: "movie-1019",
    title: "The Green Mile",
    image_url: "https://m.media-amazon.com/images/M/MV5BMTUxMzQyNjA5MF5BMl5BanBnXkFtZTYwOTU2NTY3._V1_.jpg",
    year: "1999",
    description: "The lives of guards on Death Row are affected by one of their charges: a black man accused of child murder and rape, yet who has a mysterious gift.",
    rating: 8.6
  },
  {
    id: "movie-1020",
    title: "Parasite",
    image_url: "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_.jpg",
    year: "2019",
    description: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    rating: 8.5
  },
  {
    id: "movie-1021",
    title: "One Flew Over the Cuckoo's Nest",
    image_url: "https://m.media-amazon.com/images/M/MV5BZjA0OWVhOTAtYWQxNi00YzNhLWI4ZjYtNjFjZTEyYjJlNDVlL2ltYWdlL2ltYWdlXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg",
    year: "1975",
    description: "A criminal pleads insanity and is admitted to a mental institution, where he rebels against the oppressive nurse and rallies up the scared patients.",
    rating: 8.7
  },
  {
    id: "movie-1022",
    title: "Saving Private Ryan",
    image_url: "https://m.media-amazon.com/images/M/MV5BZjhkMDM4MWItZTVjOC00ZDRhLThmYTAtM2I5NzBmNmNlMzI1XkEyXkFqcGdeQXVyNDYyMDk5MTU@._V1_.jpg",
    year: "1998",
    description: "Following the Normandy Landings, a group of U.S. soldiers go behind enemy lines to retrieve a paratrooper whose brothers have been killed in action.",
    rating: 8.6
  },
  {
    id: "movie-1023",
    title: "Spirited Away",
    image_url: "https://m.media-amazon.com/images/M/MV5BMjlmZmI5MDctNDE2YS00YWE0LWE5ZWItZDBhYWQ0NTcxNWRhXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
    year: "2001",
    description: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.",
    rating: 8.6
  },
  {
    id: "movie-1024",
    title: "Back to the Future",
    image_url: "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg",
    year: "1985",
    description: "Marty McFly, a 17-year-old high school student, is accidentally sent thirty years into the past in a time-traveling DeLorean invented by his close friend, the eccentric scientist Doc Brown.",
    rating: 8.5
  },
  {
    id: "movie-1025",
    title: "Psycho",
    image_url: "https://m.media-amazon.com/images/M/MV5BNTQwNDM1YzItNDAxZC00NWY2LTk0M2UtNDIwNWI5OGUyNWUxXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
    year: "1960",
    description: "A Phoenix secretary embezzles $40,000 from her employer's client, goes on the run, and checks into a remote motel run by a young man under the domination of his mother.",
    rating: 8.5
  },
  {
    id: "movie-1026",
    title: "Gladiator",
    image_url: "https://m.media-amazon.com/images/M/MV5BMDliMmNhNDEtODUyOS00MjNlLTgxODEtN2U3NzIxMGVkZTA1L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
    year: "2000",
    description: "A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.",
    rating: 8.5
  },
  {
    id: "movie-1027",
    title: "The Lion King",
    image_url: "https://m.media-amazon.com/images/M/MV5BYTYxNGMyZTYtMjE3MS00MzNjLWFjNmYtMDk3N2FmM2JiM2M1XkEyXkFqcGdeQXVyNjY5NDU4NzI@._V1_.jpg",
    year: "1994",
    description: "Lion prince Simba and his father are targeted by his bitter uncle, who wants to ascend the throne himself.",
    rating: 8.5
  },
  {
    id: "movie-1028",
    title: "The Pianist",
    image_url: "https://m.media-amazon.com/images/M/MV5BOWRiZDIxZjktMTA1NC00MDQ2LWEzMjUtMTliZmY3NjQ3ODJiXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
    year: "2002",
    description: "A Polish Jewish musician struggles to survive the destruction of the Warsaw ghetto of World War II.",
    rating: 8.5
  },
  {
    id: "movie-1029",
    title: "The Intouchables",
    image_url: "https://m.media-amazon.com/images/M/MV5BMTYxNDA3MDQwNl5BMl5BanBnXkFtZTcwNTU4Mzc1Nw@@._V1_.jpg",
    year: "2011",
    description: "After he becomes a quadriplegic from a paragliding accident, an aristocrat hires a young man from the projects to be his caregiver.",
    rating: 8.5
  },
  {
    id: "movie-1030",
    title: "Modern Times",
    image_url: "https://m.media-amazon.com/images/M/MV5BYjJiZjMzYzktNjU0NS00OTkxLWEwYzItYzdhYWJjN2QzMTRlL2ltYWdlL2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
    year: "1936",
    description: "The Tramp struggles to live in modern industrial society with the help of a young homeless woman.",
    rating: 8.5
  },
  {
    id: "movie-1031",
    title: "City Lights",
    image_url: "https://m.media-amazon.com/images/M/MV5BY2I4MmM1N2EtM2YzOS00OWUzLTkzYzctNDc5NDg2N2IyODJmXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
    year: "1931",
    description: "With the aid of a wealthy erratic tippler, a dewy-eyed tramp who has fallen in love with a sightless flower girl accumulates money to be able to help her medically.",
    rating: 8.5
  },
  {
    id: "movie-1032",
    title: "Alien",
    image_url: "https://m.media-amazon.com/images/M/MV5BMmQ2MmU3NzktZjAxOC00ZDZhLTk4YzEtMDMyMzcxY2IwMDAyXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
    year: "1979",
    description: "After a space merchant vessel receives an unknown transmission as a distress call, one of the crew is attacked by a mysterious life form and they soon realize that its life cycle has merely begun.",
    rating: 8.5
  },
  {
    id: "movie-1033",
    title: "Apocalypse Now",
    image_url: "https://m.media-amazon.com/images/M/MV5BMDdhODg0MjYtYzBiOS00ZmI5LWEwZGYtZDEyNDU4MmQyNzFkXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
    year: "1979",
    description: "A U.S. Army officer serving in Vietnam is tasked with assassinating a renegade Special Forces Colonel who sees himself as a god.",
    rating: 8.4
  },
  {
    id: "movie-1034",
    title: "Memento",
    image_url: "https://m.media-amazon.com/images/M/MV5BZTcyNjk1MjgtOWI3Mi00YzQwLWI5MTktMzY4ZmI2NDAyNzYzXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
    year: "2000",
    description: "A man with short-term memory loss attempts to track down his wife's murderer.",
    rating: 8.4
  },
  {
    id: "movie-1035",
    title: "Django Unchained",
    image_url: "https://m.media-amazon.com/images/M/MV5BMjIyNTQ5NjQ1OV5BMl5BanBnXkFtZTcwODg1MDU4OA@@._V1_.jpg",
    year: "2012",
    description: "With the help of a German bounty-hunter, a freed slave sets out to rescue his wife from a brutal plantation-owner in Mississippi.",
    rating: 8.4
  },
  {
    id: "movie-1036",
    title: "Raiders of the Lost Ark",
    image_url: "https://m.media-amazon.com/images/M/MV5BMjA0ODEzMTc1Nl5BMl5BanBnXkFtZTcwODM2MjAxNA@@._V1_.jpg",
    year: "1981",
    description: "In 1936, archaeologist and adventurer Indiana Jones is hired by the U.S. government to find the Ark of the Covenant before Adolf Hitler's Nazis can obtain its awesome powers.",
    rating: 8.4
  },
  {
    id: "movie-1037",
    title: "WALL·E",
    image_url: "https://m.media-amazon.com/images/M/MV5BMjExMTg5OTU0NF5BMl5BanBnXkFtZTcwMjMxMzMzMw@@._V1_.jpg",
    year: "2008",
    description: "In the distant future, a small waste-collecting robot inadvertently embarks on a space journey that will ultimately decide the fate of mankind.",
    rating: 8.4
  },
  {
    id: "movie-1038",
    title: "The Lives of Others",
    image_url: "https://m.media-amazon.com/images/M/MV5BOTNmZjA2ZmQtYWU1Yy00ZmVlLTg2NmItM2JlNzU5ZTBiNzM4XkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
    year: "2006",
    description: "In 1984 East Berlin, an agent of the secret police, conducting surveillance on a writer and his lover, finds himself becoming increasingly absorbed by their lives.",
    rating: 8.4
  },
  {
    id: "movie-1039",
    title: "Sunset Blvd.",
    image_url: "https://m.media-amazon.com/images/M/MV5BMTU0NTkyNzYwMF5BMl5BanBnXkFtZTgwMDU0NDk5MTI@._V1_.jpg",
    year: "1950",
    description: "A screenwriter develops a dangerous relationship with a faded film star determined to make a triumphant return.",
    rating: 8.4
  },
  {
    id: "movie-1040",
    title: "Paths of Glory",
    image_url: "https://m.media-amazon.com/images/M/MV5BOTI5Nzc0OTMtYzBkMS00NjkxLThmM2UtNjM2ODgxN2M5NjNkXkEyXkFqcGdeQXVyNjQ2MjQ5NzM@._V1_.jpg",
    year: "1957",
    description: "After refusing to attack an enemy position, a general accuses the soldiers of cowardice and their commanding officer must defend them.",
    rating: 8.4
  }
];

const Index = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingMovies, setSyncingMovies] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [showWatchlist, setShowWatchlist] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);

  // Initial setup - check authentication and load data
  useEffect(() => {
    const initApp = async () => {
      // First check if we have a test user in localStorage
      const testUser = localStorage.getItem("user");
      if (testUser) {
        setUser(JSON.parse(testUser));
        await loadInitialData();
        return;
      }

      // Check if user is logged in with Supabase
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      if (!session?.user) {
        navigate('/auth');
      } else {
        await loadInitialData();
      }
    };

    // Setup auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null);
      if (!session?.user) {
        navigate('/auth');
      }
    });

    initApp();
    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Try to load movies from Supabase first
      let moviesData: Movie[] = [];
      try {
        moviesData = await fetchMovies();
      } catch (error) {
        console.error("Error fetching movies from Supabase:", error);
      }
      
      // If no movies in Supabase yet, sync the additional movies
      if (moviesData.length === 0) {
        setSyncingMovies(true);
        toast({
          title: "First time setup",
          description: "Adding movies to database...",
        });
        
        try {
          await addMoviesToSupabase(additionalMovies);
          moviesData = additionalMovies;
        } catch (error) {
          console.error("Error adding movies to Supabase:", error);
          // Fallback to local data
          moviesData = additionalMovies;
        } finally {
          setSyncingMovies(false);
        }
      }
      
      setMovies(moviesData);
      setFilteredMovies(moviesData);
      
      // Get watchlist from Supabase
      try {
        const watchlistIds = await fetchWatchlist();
        setWatchlist(watchlistIds);
        
        // Update localStorage to keep it in sync
        localStorage.setItem("watchlist", JSON.stringify(watchlistIds));
      } catch (error) {
        console.error("Error fetching watchlist from Supabase:", error);
        
        // Fallback to localStorage
        const savedWatchlist = localStorage.getItem("watchlist");
        if (savedWatchlist) {
          setWatchlist(JSON.parse(savedWatchlist));
        } else {
          // Initialize empty watchlist if none exists
          localStorage.setItem("watchlist", JSON.stringify([]));
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load data"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    // Clear both Supabase session and localStorage
    await supabase.auth.signOut();
    localStorage.removeItem("user");
    localStorage.removeItem("watchlist");
    navigate('/auth');
  };

  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setFilteredMovies(movies);
      return;
    }
    
    const filtered = movies.filter(movie => 
      movie.title.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredMovies(filtered);
  }, [movies]);

  const toggleWatchlist = () => {
    setShowWatchlist(!showWatchlist);
  };

  // Update useEffect to properly filter watchlist movies
  useEffect(() => {
    if (showWatchlist) {
      const watchlistMovies = movies.filter(movie => watchlist.includes(movie.id));
      setFilteredMovies(watchlistMovies);
    } else {
      setFilteredMovies(movies);
    }
  }, [showWatchlist, watchlist, movies]);

  // Effect to update watchlist state when localStorage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "watchlist") {
        const savedWatchlist = localStorage.getItem("watchlist");
        if (savedWatchlist) {
          setWatchlist(JSON.parse(savedWatchlist));
        }
      }
    };

    // Handle when watchlist changes in this tab
    const handleLocalStorageChange = () => {
      const savedWatchlist = localStorage.getItem("watchlist");
      if (savedWatchlist) {
        setWatchlist(JSON.parse(savedWatchlist));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Add a custom event listener for changes in the same window
    window.addEventListener('watchlistUpdated', handleLocalStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('watchlistUpdated', handleLocalStorageChange);
    };
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#141414] px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <header className="flex flex-col items-center gap-8">
          <div className="w-full flex justify-between items-center">
            <h1 className="text-4xl font-bold text-white">
              <span className="text-[#E50914]">Cine</span>Bot
            </h1>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline"
                onClick={toggleWatchlist}
                className={`bg-transparent border-white/20 text-white hover:bg-white/10 ${showWatchlist ? 'bg-white/20' : ''}`}
              >
                <Bookmark className="mr-2 h-4 w-4" />
                My Watchlist
                {watchlist.length > 0 && (
                  <span className="ml-2 bg-[#E50914] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {watchlist.length}
                  </span>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={handleSignOut}
                className="bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                Sign Out
              </Button>
            </div>
          </div>
          <SearchBar onSearch={handleSearch} />
        </header>

        {/* Featured Section */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Featured Movies</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          ) : filteredMovies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-white text-xl">
                {showWatchlist 
                  ? "Your watchlist is empty" 
                  : "No movies match your search"}
              </p>
            </div>
          )}
        </section>
        
        {/* Loading indicator for first-time movie sync */}
        {syncingMovies && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-xl flex flex-col items-center">
              <Loader2 className="h-12 w-12 text-[#E50914] animate-spin mb-4" />
              <p className="text-white text-lg">Setting up your movie database...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
