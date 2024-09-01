//http://www.omdbapi.com/?i=tt3896198&apikey=b75edfb5

import { useState, useEffect, useRef } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
/**
 * App component
 *
 */
const KEY = "b75edfb5";
export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  console.log(selectedId);
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  // const { movies, isLoading, error } = useMovies(query /*handleCloseMovie*/); //custom hook for searching movies.
  // const [watched, setWatched] = useState([]);
  // const [watched, setWatched] = useLocalStorageState([], "watched"); //custom hook for setting watched list.

  // transferred to custom hook useLocalStorageState
  const [watched, setWatched] = useState(function () {
    const storedValue = JSON.parse(localStorage.getItem("watched"));
    return storedValue; //this can be done inside useEffect() function. but this can also be an optimal solution. again this function here executes only on initial render. and is simply ignored on sub-sequent re-renders.
  });
  // const [watched, setWatched] = useState(
  //   JSON.parse(localStorage.getItem("watched"))
  // );
  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (selectedId === id ? null : id));
  }
  // const handleCloseMovie = () => {
  //   setSelectedId(null);
  // };//hoisting not possible in function expression.
  function handleCloseMovie() {
    setSelectedId(null);
  }
  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);

    // localStorage.setItem("watched", JSON.stringify([...watched, movie])); //this should be executed inside useEffect() because later this storing data into local storage will be reused.
  }
  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }
  // transferred to custom hook useLocalStorageState
  useEffect(
    function () {
      localStorage.setItem("watched", JSON.stringify(watched)); //here we don't need to destructure the watched array because anyhow this effect will run iff at the initial render or later watched array is updated or become a new state . therefore directly we can use the watched array name.
    },
    [watched]
  );

  /**
   * the below useEffect is commented because in place of this custom hook useMovies() is   used above.
   */
  useEffect(
    function () {
      // handleCloseMovie(); //i observed that before function is defined handleCloseMovie() is called or before calling fetchMovies() below, we can call handleCloseMovie(). both are same in output. because anyhow we are calling handleCloseMovie() before fetchMovies()
      const controller = new AbortController();
      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");
          const response = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );
          if (!response.ok) {
            throw new Error("Something went wrong with movie fetching...");
          }

          const data = await response.json();
          console.log(data);
          if (data.Response === "False") {
            throw new Error("Movie not found!!");
          }
          setMovies(data.Search);
          // console.log(data.Search);
          setError("");
        } catch (error) {
          // console.error(error.message);
          if (error.name !== "AbortError") {
            console.log(error.message);
            setError(error.message);
          }
        } finally {
          setIsLoading(false);
        }
      }
      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }
      handleCloseMovie(); //so that if inception movie details fetched and if some other movie data is fetched in between then automatically previous movie detail's should be closed.
      fetchMovies();
      // cleanup function for aborting fetch requests between re-renders
      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
function Loader() {
  return <h1 className="loader">Loading...</h1>;
}
function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔</span>
      {message}
    </p>
  );
}
/**
 * NavBar component
 */
function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}
function Search({ query, setQuery }) {
  /**
   * code to automatic focus on movie search bar using useEffect() hook..
   */
  // useEffect(function () {
  //   const element = document.querySelector(".search");
  //   console.log(element);
  //   element.focus();
  // }, []);

  /**
   * code to automatic focus on movie search bar using useRef() hook..
   */
  const inputElement = useRef(null);
  useEffect(
    function () {
      // console.log(inputElement.current);
      function callback(e) {
        if (document.activeElement === inputElement.current) return; //for stopping to remove written texts on search bar when we mistakenly hit the enter.
        if (e.code === "Enter") {
          inputElement.current.focus(); //we placed this call here to use it in cleanup function for removal of event.
          setQuery(""); //for setting search bar to empty by hitting the enter key.
        }
      }
      document.addEventListener("keydown", callback);
      //cleanup function
      return () => document.addEventListener("keydown", callback);
    },
    [setQuery]
  );
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputElement}
    />
  );
}
function NumResults({ movies }) {
  // if (movies.length === 0) return;
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}
/**
 * Main component
 */
function Main({ children }) {
  return <main className="main">{children}</main>;
}
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}
// function WatchedBox({ children }) {
//   const [isOpen2, setIsOpen2] = useState(true);

//   return (
//     <div className="box">
//       <button
//         className="btn-toggle"
//         onClick={() => setIsOpen2((open) => !open)}
//       >
//         {isOpen2 ? "–" : "+"}
//       </button>
//       {isOpen2 && children}
//     </div>
//   );
// }
function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}
function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}
/**
 * MovieDetails component
 */
function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const countRef = useRef(0);
  // let count = 0;
  useEffect(
    function () {
      if (userRating) countRef.current++;
      // if (userRating) count++;
    },
    [userRating /*count*/]
  );

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);

  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  //   /* eslint-disable */
  //   if (imdbRating > 8) [isTop, setIsTop] = useState(true); //conditional rendering to disturb react's hook list.
  //   if (imdbRating > 8) return <p>Greatest Ever!</p>; //disturbing react's hook list by making early return statement

  /**
   * for testing asynchronous state update in react
   *
   */
  // const [isTop, setIsTop] = useState(imdbRating > 8);
  // console.log(isTop);
  // useEffect(
  //   function () {
  //     setIsTop(imdbRating > 8);
  //   },
  //   [imdbRating]
  // );
  // const isTop = imdbRating > 8;
  // console.log(isTop);

  // const [avgRating, setAvgRating] = useState(0);

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
      countRatingDecisions: countRef.current,
      // count,
    };
    onAddWatched(newWatchedMovie);
    onCloseMovie(); //so that after adding movie to watched list, immediately it will close the fetched movie details and redirect to watched list because selectedId state will be set to null.

    /**
     * testing asynchronous state updating mechanism of react
     */
    // setAvgRating(Number(imdbRating));
    // alert(avgRating);
    // setAvgRating((avgRating) => (avgRating + userRating) / 2);
  }
  /**
   * useEffect for escape closing
   */
  useEffect(
    function () {
      function callback(e) {
        if (e.code === "Escape") {
          onCloseMovie();
          // console.log("CLOSING");
        }
      }
      document.addEventListener("keydown", callback);
      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [onCloseMovie]
  );

  /**
   * useEffect-1 which will fetch selected movie's details.
   */
  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const response = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );
        const data = await response.json();
        // console.log(data);
        setMovie(data);
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [selectedId]
  );
  /**
   * useEffect-2
   */
  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;
      /**
       * cleanup function
       */
      return function () {
        document.title = "usePopcorn";
        // console.log(`Clean up effect for movie ${title}`);
      };
    },
    [title]
  );
  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie.title} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          {/* <p>{avgRating}</p> //for testing asynchronous state updating  */}
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}{" "}
                </>
              ) : (
                <p>
                  You rated this movie{" "}
                  <span style={{ color: "gold" }}>{watchedUserRating}</span>
                  <span>⭐</span>
                </p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}
function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} mins</span>
        </p>
      </div>
    </div>
  );
}
function WatchedMovieList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  );
}
function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
