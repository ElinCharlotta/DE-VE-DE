/*Till skillnad från Moviefuntions så är detta allt vi ser på sidan. Desssa funktioner tar 
hand om det visuella. Förutom watched-kappen, den snackar lite med firebase för att kolla om filmen kommer från sökfältet eller ej. Men den hör ju ihop med createMovieElement*/ 

import { db } from "./firebaseConfig.js";
import { handleWatchedButtonClick, getMovie, deleteMovieById } from "./movieFunctions.js";
import { doc,  getDoc, } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

function clearMessages() {
    messageContainer.innerHTML = '';
}

async function displayMovies(movies) {
    try {
        const movieListContainer = document.querySelector('#movieList');
        movieListContainer.innerHTML = '';
        movies.forEach((movie) => {
            const movieElement = createMovieElement(movie);
            movieListContainer.appendChild(movieElement);
            console.log(movie);
        });
    } catch (error) {
        console.error("Error displaying movies:", error);
    }
}

// SEARCHED MOVIE DISPLAY
async function displaySearchedMovie(foundMovie) {
    clearMessages();
    const messageContainer = document.querySelector('#messageContainer');
    messageContainer.innerHTML = '';

    if (foundMovie) {
        const movieData = foundMovie.data();
        const movieElement = createMovieElement(
            {
                id: foundMovie.id,
                title: movieData.title,
                genre: movieData.genre,
                releaseDate: movieData.releaseDate,
                watched: movieData.watched
            },
            true // signals that the movie being handled is a searched movie. 
        );

        messageContainer.appendChild(movieElement);
    } else {
        messageContainer.innerHTML = 'Movie not found, would you like to add movie to list,<br> Please enter GENRE and RELEASE DATE';
    }
}


function createMovieElement(movie, isSearched) {
    const containerElem = document.createElement('article');

    const headingElem = document.createElement('h3');
    const genreElem = document.createElement('p');
    const releaseDateElem = document.createElement('p');
    const watchedElem = document.createElement('p');
    const deleteButton = document.createElement('button');
    const watchedButton = document.createElement('button');

    headingElem.innerText = movie.title;
    genreElem.innerText = `Genre: ${movie.genre}`;
    releaseDateElem.innerText = `Release Date: ${movie.releaseDate}`;
    watchedElem.innerText = `Watched: ${movie.watched ? 'Yes' : 'No'}`;
    deleteButton.innerText = 'Delete';
    watchedButton.innerText = movie.watched ? 'Not Watched' : 'Watched';

    watchedElem.style.fontWeight = movie.watched ? 'bold' : 'bold';
    watchedElem.style.color = movie.watched ? 'green' : 'red';

    containerElem.append(headingElem);
    containerElem.append(genreElem);
    containerElem.append(releaseDateElem);
    containerElem.append(watchedElem);
    containerElem.append(deleteButton);
    containerElem.append(watchedButton);

    containerElem.classList.add('Movie-element-container')
    deleteButton.classList.add('delete-button')
    watchedButton.classList.add('watched-button')

    deleteButton.addEventListener('click', async () => {
        try {
            await deleteMovieById(movie.id, messageContainer);
            messageContainer.innerHTML = 'Movie deleted from list';
           
        } catch (error) {
            console.log(`ERROR: ${error}`);
        }
    });

    watchedButton.addEventListener('click', async () => {
        try {
            const type = isSearched ? 'searched-watched' : 'not-searched-watched';
            await handleWatchedButtonClick(movie.id, watchedButton, type);
            if (type === 'searched-watched') {
                const updatedMovie = await getDoc(doc(db, 'movie', movie.id));
                await displaySearchedMovie(updatedMovie);
            } else  {
                await getMovie();
            }
        } catch (error) {
            console.log(`ERROR: ${error}`);
        }
    });
    return containerElem; 
}
export{
    clearMessages,
    displayMovies,
    displaySearchedMovie
}