// --- SPRITESHEET DO DRAGÃO ---
const dragonSprite = new Image();
dragonSprite.src = 'dragonBoss.png'; // sua spritesheet

const frameWidth = 128;
const frameHeight = 128;
const row = 0;          // linha da animação
const totalFrames = 13;  // frames na linha
let currentFrame = 0;
let frameSpeed = 10;
let frameCounter = 0;

// Objeto do dragão (posição no canvas)
let dragon = {
    x: 100,
    y: 100,
};

// Atualiza animação do dragão
function updateDragonAnimation() {
    frameCounter++;
    if (frameCounter >= frameSpeed) {
        frameCounter = 0;
        currentFrame++;
        if (currentFrame >= totalFrames) currentFrame = 0;
    }
}

// Desenha o dragão no canvas
function drawDragon(ctx) {
    ctx.drawImage(
        dragonSprite,
        currentFrame * frameWidth,
        row * frameHeight,
        frameWidth,
        frameHeight,
        dragon.x,
        dragon.y,
        frameWidth,
        frameHeight
    );
}

dragonSprite.onload = () => {
};
