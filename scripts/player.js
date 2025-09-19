// player.js
const playerSprite = new Image();
playerSprite.src = 'images/dragonPlayer.png';

const playerFrameWidth = 256;
const playerFrameHeight = 256;
const playerRow = 0;
const playerTotalFrames = 1;

let playerCurrentFrame = 0;
let playerFrameSpeed = 10;
let playerFrameCounter = 0;

export const player = {
    x: window.innerWidth / 2 - playerFrameWidth / 2, // centro da tela
    y: window.innerHeight - 300, // base da tela
    width: playerFrameWidth,
    height: playerFrameHeight
};

export function updatePlayerAnimation() {
    playerFrameCounter++;
    if (playerFrameCounter >= playerFrameSpeed) {
        playerFrameCounter = 0;
        playerCurrentFrame++;
        if (playerCurrentFrame >= playerTotalFrames) playerCurrentFrame = 0;
    }
}

export function drawPlayer(ctx) {
    ctx.drawImage(
        playerSprite,
        playerCurrentFrame * playerFrameWidth,
        playerRow * playerFrameHeight,
        playerFrameWidth,
        playerFrameHeight,
        player.x,
        player.y,
        playerFrameWidth,
        playerFrameHeight
    );
}

// Movimento
let moveLeft = false, moveRight = false, moveUp = false, moveDown = false;
const playerSpeed = 5;

window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") moveLeft = true;
    if (e.key === "ArrowRight") moveRight = true;
    if (e.key === "ArrowUp") moveUp = true;
    if (e.key === "ArrowDown") moveDown = true;
});

window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") moveLeft = false;
    if (e.key === "ArrowRight") moveRight = false;
    if (e.key === "ArrowUp") moveUp = false;
    if (e.key === "ArrowDown") moveDown = false;
});

export function updatePlayerPosition(canvas) {
    if (moveLeft) player.x -= playerSpeed;
    if (moveRight) player.x += playerSpeed;
    if (moveUp) player.y -= playerSpeed;
    if (moveDown) player.y += playerSpeed;

    if (player.x < 0) player.x = 0;
    if (player.y < 0) player.y = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
    if (player.y > canvas.height - player.height) player.y = canvas.height - player.height;
    }
