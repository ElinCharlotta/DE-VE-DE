// I stora drag visar eventlistners what it is all about. Alltså vad denna webpage gör/ska ådstakomma!

import { getMovie, checkIfMovieExists, addMovieToList, titleInput,genreInput,releaseDateInput } from "./movieFunctions.js";
import { displaySearchedMovie } from "./UI.js";

const addMovieButton = document.querySelector('#addMovieButton');
const searchMovieByTitle = document.querySelector('#searchMovieByTitle')
const showAllMoviesButton = document.querySelector('#showAllMovies');
let messageContainer = document.querySelector('#messageContainer');

showAllMoviesButton.addEventListener('click', async () => {
    await getMovie()
});

// Add movie to list BBUTTON EVENT
addMovieButton.addEventListener('click', async (movie) => {

    const title = titleInput.value;
    const genre = genreInput.value;
    const releaseDate = releaseDateInput.value;

    if (!title || !genre || !releaseDate) {
        messageContainer.innerHTML = 'Please enter information about movie in all fields!'
    } else {
        const existingMovie = await checkIfMovieExists(movie.title);
        if (existingMovie) {
            messageContainer.innerHTML = 'Movie already exists!';
        } else {
            await addMovieToList(movie);
            messageContainer.innerHTML = 'Movie added to your list!';
            
        }
    }
});

// SearchButton event - check if movie exists with checkIfMovieExists(searchMovieTitle) -  if movie exists display searched movie
searchMovieByTitle.addEventListener('click', async () => {
    const searchMovieTitle = document.querySelector('#title').value;
    const foundMovie = await checkIfMovieExists(searchMovieTitle);
    await displaySearchedMovie(foundMovie);
});

