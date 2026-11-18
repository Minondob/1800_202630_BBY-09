
// Get the Zoom and Call buttons from HTML
const zoomBtn = document.getElementById("zoomBtn");
const callBtn = document.getElementById("callBtn");

// Get the connection information message
const infoMessage = document.querySelector(".alert-info");

// Example connection details
// These will be replaced with actual meeting details later.
const meetingLink = "";
const phoneLink = "";

// Check if a Zoom link exists
if (meetingLink !== "") {

    zoomBtn.disabled = false;

    zoomBtn.addEventListener("click", function() {
        window.open(meetingLink, "_blank");
    });

}

// Check if a phone connection link exists
if (phoneLink !== "") {

    callBtn.disabled = false;

    callBtn.addEventListener("click", function() {
        window.location.href = phoneLink;
    });

}

// Display a message if no connection details are available
if (meetingLink === "" && phoneLink === "") {

    infoMessage.textContent =
        "Connection details are not available yet. Please wait for your session details.";

}
