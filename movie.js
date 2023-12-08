import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyC37JB2GuK_BUji2ZdfLNcTsedCePkgvlA",
    authDomain: "de-va-de.firebaseapp.com",
    projectId: "de-va-de",
    storageBucket: "de-va-de.appspot.com",
    messagingSenderId: "49194667891",
    appId: "1:49194667891:web:b69878da191517cc45ff06"
};

const titleInput = document.querySelector('#title');
const genreInput = document.querySelector('#genre');
const releaseDateInput = document.querySelector('#releaseDate');
const addMovieButton = document.getElementById('addMovieButton');


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.onload = function () {
    getMovie();
};

async function addMovieToList(movie) {
    try {
        const movieAdd = collection(db, 'movie');
        await addDoc(movieAdd, movie);
        console.log('Movie added successfully!');
        await getMovie();
    } catch (error) {
        console.error('Error adding movie:', error);
    }
}

async function getMovie() {
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

async function displayMovies(movies) {
    try {
        const movieListContainer = document.querySelector('#movieList');
        movieListContainer.innerHTML = ''; // Clear previous movies

        movies.forEach((movie) => {
            const movieElement = document.createElement('article');
            movieElement.innerHTML = `
                <h3>${movie.title}</h3>
                <p>${movie.genre}</p>
                <p>${movie.releaseDate}</p>
                <p>${movie.watched}</p>
            `;
            const removeButton = document.createElement('button');
            const watchedButton = document.createElement('button');

            removeButton.classList.add('remove-button');
            watchedButton.classList.add('watched-button');

            removeButton.innerText = 'Ta bort från listan';
            watchedButton.innerText = 'Denna har jag redan sett!';

            movieElement.appendChild(removeButton);
            movieElement.appendChild(watchedButton);

            movieListContainer.append(movieElement);

            removeButton.addEventListener('click', async () => {
                try {
                    // Get the movie ID directly from the movie object
                    const movieDeleteById = doc(db, 'movie', movie.id);
                    await deleteDoc(movieDeleteById);
                } catch (error) {
                    console.log(`ERROR: ${error}`);
                }
            });
        });
        } catch (error) {
            console.error("Error displaying movies:", error);
        }
    }

addMovieButton.addEventListener('click', () => {
    const movie = {
        title: titleInput.value,
        genre: genreInput.value,
        releaseDate: releaseDateInput.value,
        watched: false
    };

    addMovieToList(movie);
});

