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
    const movie = {
        title: titleInput.value,
        genre: genreInput.value,
        releaseDate: releaseDateInput.value,
        watched: false
    };
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
                <p>Watched: ${movie.watched ? 'Yes' : 'No'}</p>
            `;
            const removeButton = document.createElement('button');
            const watchedButton = document.createElement('button');

            removeButton.classList.add('remove-button');
            watchedButton.classList.add('watched-button');
            movieElement.classList.add('movie-list-article')

            removeButton.innerText = 'Delete';
            watchedButton.innerText = movie.watched ? 'Not Watched' : 'Watched';

            movieElement.appendChild(removeButton);
            movieElement.appendChild(watchedButton);

            movieListContainer.append(movieElement);

            removeButton.addEventListener('click', async () => {
                try {
                    await removeMovie(movie.id);    
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


addMovieButton.addEventListener('click', async (movie) => {

    const existingMovie = await checkIfMovieExists(movie.title);
    if (existingMovie) {
     
        searchedMessageContainer.innerHTML = 'Movie already exists!';

    } else {
        await addMovieToList(movie);
       
        searchedMessageContainer.innerHTML = 'Movie added to your list!';
        
    }

});
async function removeMovie(movieId){
    try {
        const movieDeleteById = doc(db, 'movie', movieId);
        await deleteDoc(movieDeleteById);
        getMovie();
        searchedMessageContainer.innerHTML = 'Movie deleted from list';

    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

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
        <p>Watched: ${movieData.watched ? 'Yes' : 'No'}</p>
        `;

        searchedMovieContainer.appendChild(movieElement);
        const removeButton = document.createElement('button');
        const watchedButton = document.createElement('button');

        removeButton.classList.add('remove-button');
        watchedButton.classList.add('watched-button');

        removeButton.innerText = 'Delete';
        watchedButton.innerText = movieData.watched ? 'Not Watched' : 'Watched';

        movieElement.appendChild(removeButton);
        movieElement.appendChild(watchedButton);

        const movieId = foundMovie.id;

        removeButton.addEventListener('click', async () => {
            try {
                removeMovie(movieId)
      
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
    }else {
        searchedMovieContainer.innerHTML = 'Movie not found, would you like to add movie to list,<br> Please enter GENRE and RELEASE DATE'
                
    }
}

// Attach the event by with function
searchMovieByTitle.addEventListener('click', async () => {
    const searchMovieTitle = document.querySelector('#title').value;
    const foundMovie = await checkIfMovieExists(searchMovieTitle);
    await displaySearchedMovie(foundMovie);
});

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