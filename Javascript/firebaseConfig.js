// Läsbarheten. Lättare att ha "hjärnan" på ett och samma ställe, lättare att underhålla och återanväda kod.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyC37JB2GuK_BUji2ZdfLNcTsedCePkgvlA",
    authDomain: "de-va-de.firebaseapp.com",
    projectId: "de-va-de",
    storageBucket: "de-va-de.appspot.com",
    messagingSenderId: "49194667891", 
    appId: "1:49194667891:web:b69878da191517cc45ff06"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


export { db, firebaseConfig};