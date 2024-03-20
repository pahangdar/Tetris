const blockSize = 25;   // width and height in pixel
const leftBorderSize = 2;
const rightBorderSize = 5;
const topBorderSize = 0;
const bottomBorderSize = 2;
const maxWidthSize = Math.floor(1280 / blockSize) - leftBorderSize - rightBorderSize;
const maxHeightSize = Math.floor(720 / blockSize) - topBorderSize - bottomBorderSize;

let backgroundMusic = document.querySelector('#music');
backgroundMusic.src = './assets/music/background1.mp3';
backgroundMusic.volume = .2;
backgroundMusic.loop = true;

let requestId = 0;