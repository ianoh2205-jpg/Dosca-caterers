// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";


// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCY1LCadM97af0SRgEska9ucgJZmq_XcWU",
    authDomain: "realdosca.firebaseapp.com",
    projectId: "realdosca",
    storageBucket: "realdosca.firebasestorage.app",
    messagingSenderId: "482892767197",
    appId: "1:482892767197:web:70b97a8c5cd183fe322034"
};


// Connect to Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// Get form elements
let form = document.getElementById("bookingForm");
let message = document.getElementById("message");


// Prevent past booking dates
let today = new Date().toISOString().split("T")[0];

document.getElementById("date").setAttribute("min", today);


// HANDLE FORM SUBMISSION
form.addEventListener("submit", async function(event) {

    event.preventDefault();


    // Get customer details
    let name = document.getElementById("name").value.trim();

    let phone = document.getElementById("phone").value.trim();

    let email = document.getElementById("email").value.trim();

    let eventType = document.getElementById("event").value;

    let date = document.getElementById("date").value;

    let location = document.getElementById("location").value.trim();

    let guests = Number(document.getElementById("guests").value);

    let details = document.getElementById("details").value.trim();


    // VALIDATE EMAIL
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!emailPattern.test(email)) {

        message.style.color = "red";

        message.innerText = "Please enter a valid email address.";

        return;

    }


    // VALIDATE PHONE NUMBER
    if(phone.length < 10 || phone.length > 15) {

        message.style.color = "red";

        message.innerText = "Please enter a valid phone number.";

        return;

    }


    // SHOW LOADING MESSAGE
    let button = form.querySelector("button");

    button.disabled = true;

    button.innerText = "Submitting...";

    message.style.color = "#555";

    message.innerText = "Please wait while we process your booking.";


    try {

        // SAVE BOOKING TO FIREBASE
        await addDoc(collection(db, "bookings"), {

            name: name,

            phone: phone,

            email: email,

            event: eventType,

            date: date,

            location: location,

            guests: guests,

            details: details,

            status: "Pending",

            createdAt: serverTimestamp()

        });


        // SUCCESS MESSAGE
        message.style.color = "green";

        message.innerText =
            "Thank you, " + name +
            "! Your booking request has been received. " +
            "DOSCA CATERERS will contact you shortly.";


        // CLEAR FORM
        form.reset();

    }

    catch(error) {

        console.error("Booking error:", error);

        message.style.color = "red";

        message.innerText =
            "Sorry! We couldn't submit your booking. Please try again.";

    }

    finally {

        button.disabled = false;

        button.innerText = "Submit Booking Request";

    }

});