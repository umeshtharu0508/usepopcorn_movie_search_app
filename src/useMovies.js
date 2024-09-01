import { useState, useEffect } from "react";
const KEY = "b75edfb5";

export function useMovies(query /*callback*/) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(
    function () {
      //   callback?.(); //calling a function with optional chaining. means if this function is exist then only it will be called without giving any error.

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
      //   callback?.();

      //   handleCloseMovie(); //so that if inception movie details fetched and if some other movie data is fetched then automatically previous movie detail's should be closed.
      fetchMovies();
      //cleanup function for aborting fetch requests between re-renders
      return function () {
        controller.abort();
      };
    },
    [query]
  );
  return { movies, isLoading, error };
}
