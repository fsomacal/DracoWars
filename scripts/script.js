// --- SPRITESHEET DO DRAGÃO ---
const dragonSprite = new Image();
dragonSprite.src = '../images/dragonBoss.png';

const frameWidth = 512;
const frameHeight = 512;
const row = 0;
const totalFrames = 13;
let currentFrame = 0;
let frameSpeed = 10;
let frameCounter = 0;

// Objeto do dragão (posição no canvas)
let dragon = { x: 0, y: 0 };

function updateDragonPosition(canvas) {
    dragon.x = canvas.width / 2 - frameWidth / 2;
    dragon.y = 0;
}

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

export { drawDragon, updateDragonAnimation, updateDragonPosition };
