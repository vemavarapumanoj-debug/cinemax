const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN;

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const headers = {
  Authorization: `Bearer ${TMDB_TOKEN}`,
  accept: "application/json",
};

export async function getMoviesByGenre(genreId, type = "released") {
  const today = new Date().toISOString().split("T")[0];

  let url;

  if (type === "upcoming") {
    url =
      `${TMDB_BASE_URL}/discover/movie` +
      `?with_genres=${genreId}` +
      `&sort_by=primary_release_date.asc` +
      `&primary_release_date.gte=${today}` +
      `&include_adult=false` +
      `&language=en-US`;
  } else {
    url =
      `${TMDB_BASE_URL}/discover/movie` +
      `?with_genres=${genreId}` +
      `&sort_by=popularity.desc` +
      `&primary_release_date.lte=${today}` +
      `&include_adult=false` +
      `&language=en-US`;
  }

  const response = await fetch(url, {
    headers,
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.status}`);
  }

  const data = await response.json();

  return data.results || [];
}

export async function getMovieDetails(movieId) {
  const url =
    `${TMDB_BASE_URL}/movie/${movieId}` +
    `?append_to_response=credits` +
    `&language=en-US`;

  const response = await fetch(url, {
    headers,
  });

  if (!response.ok) {
    throw new Error(
      `Movie details request failed: ${response.status}`
    );
  }

  return await response.json();
}
export async function searchMovies(query) {
  const url =
    `${TMDB_BASE_URL}/search/movie` +
    `?query=${encodeURIComponent(query)}` +
    `&include_adult=false` +
    `&language=en-US`;

  const response = await fetch(url, {
    headers,
  });

  if (!response.ok) {
    throw new Error(
      `Movie search failed: ${response.status}`
    );
  }

  const data = await response.json();

  return data.results || [];
}