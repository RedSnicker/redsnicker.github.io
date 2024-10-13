// fit.js

function resizeElement() {
    const card = document.querySelector('.card');
    if (card) {
        // Set a new width based on window size
        const newWidth = window.innerWidth < 768 ? '90%' : '70%'; // Adjust as needed
        card.style.width = newWidth;
    }
}

// Call the function on page load
window.onload = resizeElement;

// Call the function on window resize
window.onresize = resizeElement;
