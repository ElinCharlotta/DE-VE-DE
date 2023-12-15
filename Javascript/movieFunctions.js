/* Alla dessa funktioner "pratar" med firebase. 
De tar bort lägger till eller förändrar saker i firebase. Man kan säga att detta är med backend stuff. Det som pågår i bakrunden men kanske inte syns så mycket. */
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, getDoc, query, where } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { db } from "./firebaseConfig.js";
import { clearMessages, displayMovies } from "./UI.js"

const titleInput = document.querySelector('#title');
const genreInput = document.querySelector('#genre');
const releaseDateInput = document.querySelector('#releaseDate');

async function getMovie() {
    clearMessages();

    // Reset the searched movie container
    const messageContainer = document.querySelector('#messageContainer');
    messageContainer.innerHTML = '';

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
// check if movie exists in Firebase 
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

// Function to remove movie when you press delete button. Event attached in displayMovie and displaySearchedMovie
async function deleteMovieById(movieId) {
    try {
        const movieDocument = doc(db, 'movie', movieId);
        await deleteDoc(movieDocument);
        getMovie();


    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

export {
    addMovieToList,
    getMovie,
    handleWatchedButtonClick,
    deleteMovieById,
    checkIfMovieExists,
    titleInput,
    genreInput,
    releaseDateInput
}