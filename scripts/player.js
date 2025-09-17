const playerSprite = new Image();
playerSprite.src = 'images/dragonPlayer.png';

const frameWidth = 192;
const frameHeight = 192;
const row = 0;
const totalFrames = 1;
let currentFrame = 0;
let frameSpeed = 0;
let frameCounter = 0;

let player = { x: 0, y: 0 };

function updatePlayerPosition(canvas) {
    player.x = canvas.width / 2 - frameWidth / 2;
    player.y = canvas.height - frameHeight - 10;
}

function updatePlayerAnimation() {
    frameCounter++;
    if (frameCounter >= frameSpeed) {
        frameCounter = 0;
        currentFrame++;
        if (currentFrame >= totalFrames) currentFrame = 0;
    }
}

function drawPlayer(ctx) {
    ctx.fillStyle = "red";
    ctx.fillRect(player.x, player.y, frameWidth, frameHeight); // caixa de teste
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

export { drawPlayer, updatePlayerPosition, updatePlayerAnimation, playerSprite, player };
