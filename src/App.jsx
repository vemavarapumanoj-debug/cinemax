import { useEffect, useState } from "react";
import "./App.css";

import {
  getMoviesByGenre,
  getMovieDetails,
  searchMovies,
} from "./tmdb";

const genres = [
  { name: "Action", id: 28 },
  { name: "Horror", id: 27 },
  { name: "Science Fiction", id: 878 },
  { name: "Romance", id: 10749 },
  { name: "Comedy", id: 35 },
  { name: "Drama", id: 18 },
  { name: "Thriller", id: 53 },
  { name: "Adventure", id: 12 },
  { name: "Fantasy", id: 14 },
  { name: "Animation", id: 16 },
  { name: "Mystery", id: 9648 },
  { name: "Musical", id: 10402 },
];

const IMAGE_BASE_URL =
  "https://image.tmdb.org/t/p/w500";

function App() {
  const [page, setPage] = useState("intro");

  const [selectedGenre, setSelectedGenre] =
    useState(null);

  const [releasedMovies, setReleasedMovies] =
    useState([]);

  const [upcomingMovies, setUpcomingMovies] =
    useState([]);

  const [selectedMovie, setSelectedMovie] =
    useState(null);

  const [movieDetails, setMovieDetails] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // =========================
  // SEARCH
  // =========================

  const [searchQuery, setSearchQuery] =
    useState("");

  const [searchResults, setSearchResults] =
    useState([]);

  const [searchLoading, setSearchLoading] =
    useState(false);

  const [searchError, setSearchError] =
    useState("");

  // =========================
  // FAVORITES
  // =========================

  const [favorites, setFavorites] =
    useState(() => {
      try {
        const saved =
          localStorage.getItem(
            "cinemax-favorites"
          );

        return saved
          ? JSON.parse(saved)
          : [];
      } catch {
        return [];
      }
    });

  // Save favorites whenever they change
  useEffect(() => {
    localStorage.setItem(
      "cinemax-favorites",
      JSON.stringify(favorites)
    );
  }, [favorites]);

  // Add / Remove Favorite
  function toggleFavorite(movie) {
    setFavorites((currentFavorites) => {
      const alreadyFavorite =
        currentFavorites.some(
          (favorite) =>
            favorite.id === movie.id
        );

      if (alreadyFavorite) {
        return currentFavorites.filter(
          (favorite) =>
            favorite.id !== movie.id
        );
      }

      return [
        ...currentFavorites,
        movie,
      ];
    });
  }

  function isFavorite(movieId) {
    return favorites.some(
      (movie) => movie.id === movieId
    );
  }

  // =========================
  // LOAD GENRE MOVIES
  // =========================

  useEffect(() => {
    if (
      page !== "movies" ||
      !selectedGenre
    ) {
      return;
    }

    async function loadMovies() {
      try {
        setLoading(true);
        setError("");

        const [
          released,
          upcoming,
        ] = await Promise.all([
          getMoviesByGenre(
            selectedGenre.id,
            "released"
          ),

          getMoviesByGenre(
            selectedGenre.id,
            "upcoming"
          ),
        ]);

        setReleasedMovies(
          released
            .filter(
              (movie) =>
                movie.poster_path
            )
            .slice(0, 8)
        );

        setUpcomingMovies(
          upcoming
            .filter(
              (movie) =>
                movie.poster_path
            )
            .slice(0, 8)
        );
      } catch (err) {
        console.error(err);

        setError(
          "Unable to load movies from TMDB."
        );
      } finally {
        setLoading(false);
      }
    }

    loadMovies();
  }, [page, selectedGenre]);

  // =========================
  // SEARCH MOVIES
  // =========================

  async function handleSearch(event) {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) {
      return;
    }

    try {
      setSearchLoading(true);
      setSearchError("");

      const results =
        await searchMovies(query);

      setSearchResults(
        results
          .filter(
            (movie) =>
              movie.poster_path
          )
          .slice(0, 12)
      );

      setPage("search");
    } catch (err) {
      console.error(err);

      setSearchError(
        "Unable to search movies."
      );
    } finally {
      setSearchLoading(false);
    }
  }

  // =========================
  // OPEN MOVIE DETAILS
  // =========================

  async function openMovieDetails(movie) {
    try {
      setSelectedMovie(movie);

      setMovieDetails(null);

      setDetailsLoading(true);

      setError("");

      setPage("details");

      const details =
        await getMovieDetails(movie.id);

      setMovieDetails(details);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load movie details."
      );
    } finally {
      setDetailsLoading(false);
    }
  }

  // =========================
  // INTRO
  // =========================

  if (page === "intro") {
    return (
      <div className="intro">
        <div className="intro-overlay"></div>

        <div className="intro-content">
          <p className="quote quote-one">
            “One screen. Infinite worlds.”
          </p>

          <p className="quote quote-two">
            “Every frame holds a story.
            Every story leaves a mark.”
          </p>

          <h1>CINEMAX</h1>

          <p className="tagline">
            Discover stories worth remembering.
          </p>

          <div className="intro-buttons">
            <button
              className="primary-button"
              onClick={() =>
                setPage("genres")
              }
            >
              EXPLORE MOVIES
            </button>

            <button
              className="secondary-button"
              onClick={() =>
                setPage("genres")
              }
            >
              SKIP INTRO
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // GENRES
  // =========================

  if (page === "genres") {
    return (
      <div className="genres-page">
        <header className="navbar">
          <div className="logo">
            CINEMAX
          </div>

          <form
            className="search-bar"
            onSubmit={handleSearch}
          >
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value
                )
              }
            />

            <button type="submit">
              🔍
            </button>
          </form>

          <div className="nav-actions">
            <button
              className="favorites-nav-button"
              onClick={() =>
                setPage("favorites")
              }
            >
              ❤️ Favorites
              <span>
                {favorites.length}
              </span>
            </button>

            <button
              className="back-button"
              onClick={() =>
                setPage("intro")
              }
            >
              ← Intro
            </button>
          </div>
        </header>

        <main className="genres-container">
          <p className="section-label">
            WELCOME TO CINEMAX
          </p>

          <h2>
            What do you want to watch?
          </h2>

          <p className="genre-description">
            Choose a genre and discover
            movies that match your mood.
          </p>

          <div className="genre-grid">
            {genres.map((genre) => (
              <button
                key={genre.id}
                className="genre-card"
                onClick={() => {
                  setSelectedGenre(
                    genre
                  );

                  setPage("movies");
                }}
              >
                <span>
                  {genre.name}
                </span>

                <small>
                  Explore →
                </small>
              </button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // =========================
  // MOVIES
  // =========================

  if (page === "movies") {
    return (
      <div className="movies-page">
        <header className="navbar">
          <div className="logo">
            CINEMAX
          </div>

          <form
            className="search-bar"
            onSubmit={handleSearch}
          >
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value
                )
              }
            />

            <button type="submit">
              🔍
            </button>
          </form>

          <div className="nav-actions">
            <button
              className="favorites-nav-button"
              onClick={() =>
                setPage("favorites")
              }
            >
              ❤️ Favorites
              <span>
                {favorites.length}
              </span>
            </button>

            <button
              className="back-button"
              onClick={() =>
                setPage("genres")
              }
            >
              ← Genres
            </button>
          </div>
        </header>

        <main className="movies-container">
          <p className="section-label">
            {selectedGenre?.name.toUpperCase()}
          </p>

          <h2>
            {selectedGenre?.name} Movies
          </h2>

          {loading && (
            <div className="coming-message">
              <div>🎬</div>

              <h3>
                Loading movies...
              </h3>
            </div>
          )}

          {error && (
            <div className="coming-message">
              <div>⚠️</div>

              <h3>
                Something went wrong
              </h3>

              <p>{error}</p>
            </div>
          )}

          {!loading &&
            !error && (
              <>
                <section className="movie-section">
                  <h3>
                    🎬 Released Movies
                  </h3>

                  <div className="movie-grid">
                    {releasedMovies.map(
                      (movie) => (
                        <MovieCard
                          key={movie.id}
                          movie={movie}
                          onOpen={
                            openMovieDetails
                          }
                          isFavorite={isFavorite(
                            movie.id
                          )}
                          onToggleFavorite={
                            toggleFavorite
                          }
                        />
                      )
                    )}
                  </div>
                </section>

                <section className="movie-section">
                  <h3>
                    📅 Upcoming Movies
                  </h3>

                  <div className="movie-grid">
                    {upcomingMovies.map(
                      (movie) => (
                        <MovieCard
                          key={movie.id}
                          movie={movie}
                          onOpen={
                            openMovieDetails
                          }
                          isFavorite={isFavorite(
                            movie.id
                          )}
                          onToggleFavorite={
                            toggleFavorite
                          }
                        />
                      )
                    )}
                  </div>
                </section>
              </>
            )}
        </main>
      </div>
    );
  }

  // =========================
  // SEARCH RESULTS
  // =========================

  if (page === "search") {
    return (
      <div className="movies-page">
        <header className="navbar">
          <div className="logo">
            CINEMAX
          </div>

          <form
            className="search-bar"
            onSubmit={handleSearch}
          >
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value
                )
              }
            />

            <button type="submit">
              🔍
            </button>
          </form>

          <div className="nav-actions">
            <button
              className="favorites-nav-button"
              onClick={() =>
                setPage("favorites")
              }
            >
              ❤️ Favorites
              <span>
                {favorites.length}
              </span>
            </button>

            <button
              className="back-button"
              onClick={() =>
                setPage("genres")
              }
            >
              ← Genres
            </button>
          </div>
        </header>

        <main className="movies-container">
          <p className="section-label">
            SEARCH
          </p>

          <h2>
            Results for "{searchQuery}"
          </h2>

          {searchLoading && (
            <div className="coming-message">
              <div>🔎</div>

              <h3>
                Searching...
              </h3>
            </div>
          )}

          {searchError && (
            <div className="coming-message">
              <div>⚠️</div>

              <h3>
                Search failed
              </h3>

              <p>
                {searchError}
              </p>
            </div>
          )}

          {!searchLoading &&
            !searchError &&
            searchResults.length ===
              0 && (
              <div className="coming-message">
                <div>🎬</div>

                <h3>
                  No movies found
                </h3>

                <p>
                  Try another movie title.
                </p>
              </div>
            )}

          {!searchLoading &&
            !searchError &&
            searchResults.length >
              0 && (
              <div className="movie-grid">
                {searchResults.map(
                  (movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onOpen={
                        openMovieDetails
                      }
                      isFavorite={isFavorite(
                        movie.id
                      )}
                      onToggleFavorite={
                        toggleFavorite
                      }
                    />
                  )
                )}
              </div>
            )}
        </main>
      </div>
    );
  }

  // =========================
  // FAVORITES
  // =========================

  if (page === "favorites") {
    return (
      <div className="movies-page favorites-page">
        <header className="navbar">
          <div className="logo">
            CINEMAX
          </div>

          <form
            className="search-bar"
            onSubmit={handleSearch}
          >
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value
                )
              }
            />

            <button type="submit">
              🔍
            </button>
          </form>

          <button
            className="back-button"
            onClick={() =>
              setPage("genres")
            }
          >
            ← Browse Movies
          </button>
        </header>

        <main className="movies-container">
          <p className="section-label">
            YOUR COLLECTION
          </p>

          <h2>
            ❤️ Favorite Movies
          </h2>

          <p className="genre-description">
            {favorites.length === 0
              ? "Your favorite movies will appear here."
              : `${favorites.length} movie${
                  favorites.length === 1
                    ? ""
                    : "s"
                } saved in your collection.`}
          </p>

          {favorites.length === 0 ? (
            <div className="empty-favorites">
              <div className="empty-heart">
                ❤️
              </div>

              <h3>
                Your collection is empty
              </h3>

              <p>
                Browse movies and tap the
                heart to save your favorites.
              </p>

              <button
                className="primary-button"
                onClick={() =>
                  setPage("genres")
                }
              >
                EXPLORE MOVIES
              </button>
            </div>
          ) : (
            <div className="movie-grid">
              {favorites.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onOpen={
                    openMovieDetails
                  }
                  isFavorite={true}
                  onToggleFavorite={
                    toggleFavorite
                  }
                />
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  // =========================
  // MOVIE DETAILS
  // =========================

  if (page === "details") {
    return (
      <div className="details-page">
        <header className="navbar">
          <div className="logo">
            CINEMAX
          </div>

          <form
            className="search-bar"
            onSubmit={handleSearch}
          >
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value
                )
              }
            />

            <button type="submit">
              🔍
            </button>
          </form>

          <div className="nav-actions">
            <button
              className="favorites-nav-button"
              onClick={() =>
                setPage("favorites")
              }
            >
              ❤️ Favorites
              <span>
                {favorites.length}
              </span>
            </button>

            <button
              className="back-button"
              onClick={() =>
                setPage("movies")
              }
            >
              ← Back to Movies
            </button>
          </div>
        </header>

        {detailsLoading && (
          <div className="details-loading">
            <div>🎬</div>

            <h2>
              Loading movie details...
            </h2>
          </div>
        )}

        {!detailsLoading &&
          movieDetails && (
            <main className="details-container">
              <div className="details-poster">
                {movieDetails.poster_path ? (
                  <img
                    src={`${IMAGE_BASE_URL}${movieDetails.poster_path}`}
                    alt={
                      movieDetails.title
                    }
                  />
                ) : (
                  <div className="details-no-poster">
                    CINEMAX
                  </div>
                )}
              </div>

              <div className="details-content">
                <p className="section-label">
                  {movieDetails.genres
                    ?.map(
                      (genre) =>
                        genre.name
                    )
                    .join(" • ")}
                </p>

                <h1>
                  {movieDetails.title}
                </h1>

                {movieDetails.tagline && (
                  <p className="details-tagline">
                    “
                    {
                      movieDetails.tagline
                    }
                    ”
                  </p>
                )}

                <div className="details-meta">
                  <span>
                    ⭐{" "}
                    {movieDetails.vote_average
                      ? movieDetails.vote_average.toFixed(
                          1
                        )
                      : "N/A"}
                  </span>

                  <span>
                    📅{" "}
                    {movieDetails.release_date ||
                      "Unknown"}
                  </span>

                  <span>
                    ⏱️{" "}
                    {movieDetails.runtime
                      ? `${movieDetails.runtime} min`
                      : "N/A"}
                  </span>
                </div>

                <button
                  className={`details-favorite-button ${
                    isFavorite(
                      movieDetails.id
                    )
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    toggleFavorite(
                      movieDetails
                    )
                  }
                >
                  {isFavorite(
                    movieDetails.id
                  )
                    ? "❤️ In Favorites"
                    : "♡ Add to Favorites"}
                </button>

                <h2>
                  About the Movie
                </h2>

                <p className="overview">
                  {movieDetails.overview ||
                    "No overview available."}
                </p>

                <h2>
                  Cast & Crew
                </h2>

                <div className="cast-list">
                  {movieDetails.credits?.cast
                    ?.slice(0, 8)
                    .map(
                      (person) => (
                        <div
                          className="cast-card"
                          key={person.id}
                        >
                          {person.profile_path ? (
                            <img
                              src={`${IMAGE_BASE_URL}${person.profile_path}`}
                              alt={
                                person.name
                              }
                            />
                          ) : (
                            <div className="cast-placeholder">
                              👤
                            </div>
                          )}

                          <strong>
                            {person.name}
                          </strong>

                          <small>
                            {person.character ||
                              "Cast"}
                          </small>
                        </div>
                      )
                    )}
                </div>

                <h2>
                  Director
                </h2>

                <div className="director-list">
                  {movieDetails.credits?.crew
                    ?.filter(
                      (person) =>
                        person.job ===
                        "Director"
                    )
                    .slice(0, 3)
                    .map(
                      (director) => (
                        <div
                          className="director-card"
                          key={
                            director.id
                          }
                        >
                          {director.profile_path ? (
                            <img
                              src={`${IMAGE_BASE_URL}${director.profile_path}`}
                              alt={
                                director.name
                              }
                            />
                          ) : (
                            <div className="cast-placeholder">
                              🎬
                            </div>
                          )}

                          <div>
                            <strong>
                              {
                                director.name
                              }
                            </strong>

                            <small>
                              Director
                            </small>
                          </div>
                        </div>
                      )
                    )}
                </div>
              </div>
            </main>
          )}
      </div>
    );
  }

  return null;
}

// =========================
// MOVIE CARD COMPONENT
// =========================

function MovieCard({
  movie,
  onOpen,
  isFavorite,
  onToggleFavorite,
}) {
  function handleFavoriteClick(event) {
    event.stopPropagation();

    onToggleFavorite(movie);
  }

  return (
    <div
      className="movie-card"
      onClick={() => onOpen(movie)}
    >
      <div className="poster-wrapper">
        <img
          src={`${IMAGE_BASE_URL}${movie.poster_path}`}
          alt={movie.title}
        />

        <button
          className={`card-favorite-button ${
            isFavorite ? "active" : ""
          }`}
          onClick={handleFavoriteClick}
          aria-label={
            isFavorite
              ? "Remove from favorites"
              : "Add to favorites"
          }
        >
          {isFavorite ? "❤️" : "♡"}
        </button>
      </div>

      <div className="movie-info">
        <h4>{movie.title}</h4>

        <div className="movie-meta">
          <span>
            {movie.release_date
              ? movie.release_date.slice(
                  0,
                  4
                )
              : "N/A"}
          </span>

          <span>
            ⭐{" "}
            {movie.vote_average
              ? movie.vote_average.toFixed(
                  1
                )
              : "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default App;