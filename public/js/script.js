const sentences = [
    "What we can do for our clients ",
    "we build strong and lasting rela ",
    "we create and deliver exceptional digital experiences. ",
    "we always put our clients' needs first ",
    "we dont just code we build "
];

let sentenceIndex = 0; // which sentence we are on
let charIndex = 0; // position within the current sentence
const typeSpeed = 90;
const eraseSpeed = 50;
const pauseBeforeErase = 1000;

function type() {
    const currentSentence = sentences[sentenceIndex];
    if (charIndex < currentSentence.length) {
        document.getElementById("typing-text").innerHTML = currentSentence.substring(0, charIndex + 1);
        charIndex++;
        setTimeout(type, typeSpeed);
    } else {
        setTimeout(erase, pauseBeforeErase);
    }
}

function erase() {
    const currentSentence = sentences[sentenceIndex];
    if (charIndex > 0) {
        document.getElementById("typing-text").innerHTML = currentSentence.substring(0, charIndex - 1);
        charIndex--;
        setTimeout(erase, eraseSpeed);
    } else {
        // move to next sentence
        sentenceIndex = (sentenceIndex + 1) % sentences.length;
        setTimeout(type, typeSpeed);
    }
}

window.onload = type;