
export interface SearchFilters {
  query: string;
  genre?: string;
  year?: string;
  minRating?: number;
}

// Genre options
export const genres = [
  "Action",
  "Adventure",
  "Animation",
  "Biography",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Fantasy",
  "History",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "War",
  "Western",
];

// Generate year options from 1930 to current year
const currentYear = new Date().getFullYear();
export const years = Array.from(
  { length: currentYear - 1929 },
  (_, i) => `${currentYear - i}`
);

// Rating options for the filter
export const ratingOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9];
