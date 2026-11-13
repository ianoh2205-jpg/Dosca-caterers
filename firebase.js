
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCY1LCadM97af0SRgEska9ucgJZmq_XcWU",
    authDomain: "realdosca.firebaseapp.com",
    projectId: "realdosca",
    storageBucket: "realdosca.firebasestorage.app",
    messagingSenderId: "482892767197",
    appId: "1:482892767197:web:70b97a8c5cd183fe322034"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);
