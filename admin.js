import { auth, db } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

import {
    collection,
    onSnapshot,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";


// ADMIN EMAIL
const adminEmail = "ianoh2205@gmail.com";


// PAGE ELEMENTS
const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const logoutBtn = document.getElementById("logoutBtn");


// BOOKING DETAILS MODAL
const bookingModal = document.getElementById("bookingModal");
const bookingDetails = document.getElementById("bookingDetails");
const closeModal = document.getElementById("closeModal");
const approveModal = document.getElementById("approveModal");
const rejectModal = document.getElementById("rejectModal");

let selectedBookingId = null;
let unsubscribeBookings = null;


// LOGIN
loginForm.addEventListener("submit", async function(e) {

    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {

        loginError.innerText = "";

        await signInWithEmailAndPassword(auth, email, password);

    } catch(error) {

        loginError.innerText = "Login failed. Check your details.";

        console.error(error);

    }

});


// LOGOUT
logoutBtn.addEventListener("click", function() {

    signOut(auth);

});


// CHECK ADMIN
onAuthStateChanged(auth, function(user) {

    if(user && user.email === adminEmail) {

        loginSection.style.display = "none";
        dashboardSection.style.display = "block";

        if(!unsubscribeBookings) {
            loadBookings();
        }

    } else {

        loginSection.style.display = "flex";
        dashboardSection.style.display = "none";

        if(unsubscribeBookings) {
            unsubscribeBookings();
            unsubscribeBookings = null;
        }

        bookingModal.style.display = "none";

    }

});


// LOAD BOOKINGS
function loadBookings() {

    const bookingTable = document.getElementById("bookingTable");

    unsubscribeBookings = onSnapshot(
        collection(db, "bookings"),

        function(snapshot) {

            let total = 0;
            let pending = 0;
            let approved = 0;
            let rejected = 0;

            bookingTable.innerHTML = "";

            const bookings = [];

            snapshot.forEach(function(documentData) {

                const booking = documentData.data();

                bookings.push({
                    id: documentData.id,
                    ...booking
                });

            });


            // SORT NEWEST BOOKINGS FIRST
            bookings.sort(function(a, b) {

                const dateA = a.createdAt?.toMillis?.() || 0;
                const dateB = b.createdAt?.toMillis?.() || 0;

                return dateB - dateA;

            });


            // DISPLAY BOOKINGS
            bookings.forEach(function(booking) {

                total++;

                if(booking.status === "Pending") pending++;
                if(booking.status === "Approved") approved++;
                if(booking.status === "Rejected") rejected++;


                const row = document.createElement("tr");


                // BOOKING INFORMATION
                const values = [
                    booking.name || "N/A",
                    booking.event || "N/A",
                    booking.date || "N/A",
                    booking.guests || "N/A",
                    booking.status || "Pending"
                ];

                values.forEach(function(value) {

                    const cell = document.createElement("td");

                    cell.textContent = value;

                    row.appendChild(cell);

                });


                // ACTION BUTTONS
                const actionCell = document.createElement("td");


                // VIEW BUTTON
                const viewBtn = document.createElement("button");

                viewBtn.textContent = "VIEW";

                viewBtn.onclick = function() {

                    openBookingDetails(booking);

                };


                // APPROVE BUTTON
                const approveBtn = document.createElement("button");

                approveBtn.textContent = "Approve";

                approveBtn.onclick = function() {

                    changeStatus(booking.id, "Approved");

                };


                // REJECT BUTTON
                const rejectBtn = document.createElement("button");

                rejectBtn.textContent = "Reject";

                rejectBtn.onclick = function() {

                    changeStatus(booking.id, "Rejected");

                };


                actionCell.appendChild(viewBtn);
                actionCell.appendChild(approveBtn);
                actionCell.appendChild(rejectBtn);

                row.appendChild(actionCell);

                bookingTable.appendChild(row);

            });


            // UPDATE STATISTICS
            document.getElementById("totalBookings").innerText = total;

            document.getElementById("pendingBookings").innerText = pending;

            document.getElementById("approvedBookings").innerText = approved;

            document.getElementById("rejectedBookings").innerText = rejected;


            // EMPTY BOOKINGS MESSAGE
            if(total === 0) {

                bookingTable.innerHTML =
                    '<tr><td colspan="6">No bookings received yet.</td></tr>';

            }

        },

        function(error) {

            console.error("Booking error:", error);

            bookingTable.innerHTML =
                '<tr><td colspan="6">Unable to load bookings. Check database permissions.</td></tr>';

        }
    );

}


// OPEN BOOKING DETAILS
function openBookingDetails(booking) {

    selectedBookingId = booking.id;

    bookingDetails.innerHTML = "";


    const details = [

        ["Customer Name", booking.name],
        ["Email Address", booking.email],
        ["Phone Number", booking.phone],
        ["Event", booking.event],
        ["Event Date", booking.date],
        ["Location", booking.location],
        ["Number of Guests", booking.guests],
        ["Additional Details", booking.details],
        ["Booking Status", booking.status || "Pending"]

    ];


    details.forEach(function(item) {

        const div = document.createElement("div");

        div.className = "detail-item";


        const label = document.createElement("strong");

        label.textContent = item[0] + ": ";


        const value = document.createElement("span");

        value.textContent = item[1] || "Not provided";


        div.appendChild(label);

        div.appendChild(value);

        bookingDetails.appendChild(div);

    });


    bookingModal.style.display = "flex";

}


// CLOSE POPUP
closeModal.onclick = function() {

    bookingModal.style.display = "none";

    selectedBookingId = null;

};


// CLOSE WHEN CLICKING OUTSIDE
window.addEventListener("click", function(event) {

    if(event.target === bookingModal) {

        bookingModal.style.display = "none";

        selectedBookingId = null;

    }

});


// APPROVE FROM POPUP
approveModal.onclick = async function() {

    if(selectedBookingId) {

        const id = selectedBookingId;

        bookingModal.style.display = "none";

        selectedBookingId = null;

        await changeStatus(id, "Approved");

    }

};


// REJECT FROM POPUP
rejectModal.onclick = async function() {

    if(selectedBookingId) {

        const id = selectedBookingId;

        bookingModal.style.display = "none";

        selectedBookingId = null;

        await changeStatus(id, "Rejected");

    }

};


// UPDATE BOOKING STATUS
async function changeStatus(id, status) {

    try {

        await updateDoc(doc(db, "bookings", id), {

            status: status

        });

        alert("Booking successfully " + status);

    } catch(error) {

        alert("Unable to update booking.");

        console.error(error);

    }

}