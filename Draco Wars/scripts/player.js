// --- SPRITESHEET DO PLAYER ---
const playerSprite = new Image();
playerSprite.src = 'images/dragonPlayer.png';

const frameWidth = 128;
const frameHeight = 128;
const row = 0;          
const totalFrames = 1;  
let currentFrame = 0;
let frameSpeed = 10;
let frameCounter = 0;

// Objeto do player (posição inicial 0,0)
let player = {
    x: 0,
    y: 0
};

function updatePlayerPosition(canvas) {
    player.x = canvas.width / 2 - frameWidth / 2;
    player.y = canvas.height - frameHeight - 10;
}

// Atualiza animação do player
function updatePlayerAnimation() {
    frameCounter++;
    if (frameCounter >= frameSpeed) {
        frameCounter = 0;
        currentFrame++;
        if (currentFrame >= totalFrames) currentFrame = 0;
    }
}

// Desenha o player no canvas
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

// Exporta funções
export { drawPlayer, updatePlayerPosition, updatePlayerAnimation };
