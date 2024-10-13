// resizer.js - Adjusts the background image size to fit the screen
function resizeBackground() {
    const body = document.getElementById('body');
    const imgSrc = 'images/cave.jpg';
    
    const img = new Image();
    img.src = imgSrc;
    
    img.onload = function() {
        const imgRatio = img.width / img.height;
        const screenRatio = window.innerWidth / window.innerHeight;

        if (screenRatio > imgRatio) {
            body.style.backgroundSize = '100% auto';
        } else {
            body.style.backgroundSize = 'auto 100%';
        }
    };

    body.style.backgroundImage = `url('${imgSrc}')`;
    body.style.backgroundPosition = 'center';
    body.style.backgroundRepeat = 'no-repeat';
}

window.onload = resizeBackground;
window.onresize = resizeBackground;
