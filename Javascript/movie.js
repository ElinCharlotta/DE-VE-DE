import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc, getDoc, query, where } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { firebaseConfig } from "./firebaseConfig.js";

const titleInput = document.querySelector('#title');
const genreInput = document.querySelector('#genre');
const releaseDateInput = document.querySelector('#releaseDate');
const addMovieButton = document.querySelector('#addMovieButton');
const searchMovieByTitle = document.querySelector('#searchMovieByTitle')
const showAllMoviesButton = document.querySelector('#showAllMovies');
let searchedMessageContainer = document.querySelector('#searchedMessageContainer');


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function clearMessages() {
    searchedMessageContainer.innerHTML = '';
}

async function addMovieToList() {

    const newMovie = {
        title: titleInput.value,
        genre: genreInput.value,
        releaseDate: releaseDateInput.value,
        watched: false
    };
    try {
        const movieCollections = collection(db, 'movie');
        await addDoc(movieCollections, newMovie);
        console.log('Movie added successfully!');
        await getMovie();
    } catch (error) {
        console.error('Error adding movie:', error);
    }

}


async function getMovie() {
    clearMessages();

    // Reset the searched movie container
    const searchedMovieContainer = document.querySelector('#searchedMovieContainer');
    searchedMovieContainer.innerHTML = '';

    const fetchMovies = await getDocs(collection(db, 'movie'));
    const allMovies = [];

    fetchMovies.forEach((doc) => {
        const movieData = doc.data();
        const movie = {
            id: doc.id,
            title: movieData.title,
            genre: movieData.genre,
            releaseDate: movieData.releaseDate,
            watched: movieData.watched

        };
        allMovies.push(movie);
    });

    displayMovies(allMovies);
}

showAllMoviesButton.addEventListener('click', getMovie);


async function displayMovies(movies) {
    try {
        const movieListContainer = document.querySelector('#movieList');
        movieListContainer.innerHTML = '';

        movies.forEach((movie) => {
            const movieElement = document.createElement('article');
            movieElement.innerHTML = `
                <h3>${movie.title}</h3>
                <p>Genre: ${movie.genre}</p>
                <p>ReleaseDate: ${movie.releaseDate}</p>
                <p>Watched: <strong>${movie.watched ? 'Yes' : 'No'}</p>
            `;
            const watchedButton = document.createElement('button');
            const deleteButton = document.createElement('button');


            deleteButton.classList.add('delete-button');
            watchedButton.classList.add('watched-button');
            movieElement.classList.add('movie-list-article')

            deleteButton.innerText = 'Delete';
            watchedButton.innerText = movie.watched ? 'Not Watched' : 'Watched';

            movieElement.appendChild(deleteButton);
            movieElement.appendChild(watchedButton);

            movieListContainer.append(movieElement);

            deleteButton.addEventListener('click', async () => {
                try {
                    await deleteMovieById(movie.id);
                } catch (error) {
                    console.log(`ERROR: ${error}`);
                }
            });

            watchedButton.addEventListener('click', async () => {
                try {
                    await handleWatchedButtonClick(movie.id, watchedButton)
                    await getMovie();
                } catch (error) {
                    console.log(`ERROR: ${error}`);
                }
            });
        });
    } catch (error) {
        console.error("Error displaying movies:", error);
    }
}


// Add movie to list BBUTTON EVENT
addMovieButton.addEventListener('click', async (movie) => {

    const title = titleInput.value;
    const genre = genreInput.value;
    const releaseDate = releaseDateInput.value;

    if (!title || !genre || !releaseDate) {
        searchedMessageContainer.innerHTML = 'Please enter information about movie in all fields!'
    } else {
        const existingMovie = await checkIfMovieExists(movie.title);
        if (existingMovie) {
            searchedMessageContainer.innerHTML = 'Movie already exists!';
        } else {
            await addMovieToList(movie);
            searchedMessageContainer.innerHTML = 'Movie added to your list!';

        }
    }
});



// Function to remove movie when you press delete button. Event attached in displayMovie and displaySearchedMovie
async function deleteMovieById(movieId) {
    try {
        const movieDocument = doc(db, 'movie', movieId);
        await deleteDoc(movieDocument);
        getMovie();
        searchedMessageContainer.innerHTML = 'Movie deleted from list';

    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

// SEARCHED MOVIE DISPLAY
async function displaySearchedMovie(foundMovie) {
    clearMessages();
    const searchedMovieContainer = document.querySelector('#searchedMovieContainer');
    searchedMovieContainer.innerHTML = '';

    if (foundMovie) {
        const movieData = foundMovie.data();

        const movieElement = document.createElement('article');
        movieElement.innerHTML = `
        
        <h3>${movieData.title}</h3>
        <p> Genre: ${movieData.genre}</p>
        <p> releasedate: ${movieData.releaseDate}</p>
        <p>Watched: <strong>${movieData.watched ? 'Yes' : 'No'}</p>
        `;

        searchedMovieContainer.appendChild(movieElement);
        const watchedButton = document.createElement('button');
        const deleteButton = document.createElement('button');


        deleteButton.classList.add('delete-button');
        watchedButton.classList.add('watched-button');

        deleteButton.innerText = 'Delete';
        watchedButton.innerText = movieData.watched ? 'Not Watched' : 'Watched';

        movieElement.appendChild(deleteButton);
        movieElement.appendChild(watchedButton);

        const movieId = foundMovie.id;

        deleteButton.addEventListener('click', async () => {
            try {
                deleteMovieById(movieId)

                getMovie();
            } catch (error) {
                console.log(`ERROR: ${error}`);
            }
        });

        watchedButton.addEventListener('click', async () => {
            try {
                await handleWatchedButtonClick(movieId, watchedButton)

                const updatedMovie = await getDoc(doc(db, 'movie', movieId));
                await displaySearchedMovie(updatedMovie)
            } catch (error) {

                console.log(`ERROR: ${error}`);
            }
        });
    } else {
        searchedMovieContainer.innerHTML = 'Movie not found, would you like to add movie to list,<br> Please enter GENRE and RELEASE DATE'

    }
}

// SearchButton event - check if movie exists with checkIfMovieExists(searchMovieTitle) -  if movie exxists display searched movie
searchMovieByTitle.addEventListener('click', async () => {
    const searchMovieTitle = document.querySelector('#title').value;
    const foundMovie = await checkIfMovieExists(searchMovieTitle);
    await displaySearchedMovie(foundMovie);
});


// check if movie is in Firebase 
async function checkIfMovieExists() {
    const movieTitle = document.querySelector('#title').value;
    const titleQuery = query(collection(db, 'movie'), where('title', '==', movieTitle))
    const titles = await getDocs(titleQuery);

    let foundMovie;
    titles.forEach((title) => {
        console.log(title.id);
        console.log(title.data());
        foundMovie = title;
    });

    return foundMovie;
}


// WatchedButton Function - what happens when I click  WatchedButton
async function handleWatchedButtonClick(movieId, watchedButton) {
    try {
        const getMovieById = doc(db, 'movie', movieId);
        const watchedMovieId = await getDoc(getMovieById);
        const watched = watchedMovieId.data().watched;

        // Update the watched property in Firestore to true/false
        await updateDoc(getMovieById, { watched: !watched });

        watchedButton.innerText = !watched ? 'Not Watched' : 'Watched';

    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}