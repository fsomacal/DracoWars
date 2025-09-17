const playerSprite = new Image();
playerSprite.src = 'images/dragonPlayer.png';

// Só começa o jogo quando a imagem carregar
playerSprite.onload = () => {
    console.log("Player sprite carregada!");
};

const frameWidth = 192;
const frameHeight = 192;
const row = 0;          
const totalFrames = 1;  
let currentFrame = 0;
let frameSpeed = 10;
let frameCounter = 0;

let player = { x: 0, y: 0 };


function updatePlayerAnimation() {
    frameCounter++;
    if (frameCounter >= frameSpeed) {
        frameCounter = 0;
        currentFrame++;
        if (currentFrame >= totalFrames) currentFrame = 0;
    }
}

function drawPlayer(ctx) {
    ctx.drawImage(
        playerSprite,
        currentFrame * frameWidth,
        row * frameHeight,
        frameWidth,
        frameHeight,
        player.x,
        player.y,
        frameWidth,
        frameHeight
    );
}
// --- variáveis de movimento ---
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;
const playerSpeed = 5; // pixels por frame

// --- detecta teclas pressionadas ---
window.addEventListener('keydown', (e) => {
    if (e.key === "ArrowLeft") moveLeft = true;
    if (e.key === "ArrowRight") moveRight = true;
    if (e.key === "ArrowUp") moveUp = true;
    if (e.key === "ArrowDown") moveDown = true;
});

window.addEventListener('keyup', (e) => {
    if (e.key === "ArrowLeft") moveLeft = false;
    if (e.key === "ArrowRight") moveRight = false;
    if (e.key === "ArrowUp") moveUp = false;
    if (e.key === "ArrowDown") moveDown = false;
});

// --- atualiza posição do player ---
function updatePlayerPosition(canvas) {
    if (moveLeft) player.x -= playerSpeed;
    if (moveRight) player.x += playerSpeed;
    if (moveUp) player.y -= playerSpeed;
    if (moveDown) player.y += playerSpeed;

    // limites do canvas
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - frameWidth) player.x = canvas.width - frameWidth;
    if (player.y < 0) player.y = 0;
    if (player.y > canvas.height - frameHeight) player.y = canvas.height - frameHeight;
}


export { drawPlayer, updatePlayerPosition, updatePlayerAnimation, playerSprite };
