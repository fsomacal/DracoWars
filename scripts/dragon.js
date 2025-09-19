// dragon.js
const dragonSprite = new Image();
dragonSprite.src = 'images/dragonBoss.png';

const dragonFrameWidth = 512;
const dragonFrameHeight = 512;
const dragonRow = 0;
const dragonTotalFrames = 13;

let dragonCurrentFrame = 0;
let dragonFrameSpeed = 10;
let dragonFrameCounter = 0;

export const dragon = {
    x: window.innerWidth / 2 - dragonFrameWidth / 2,
    y: 50, 
    width: dragonFrameWidth,
    height: dragonFrameHeight,
    hp: 520
};

export function updateDragonPosition(canvas) {
    dragon.x = canvas.width / 2 - dragon.width / 2;
    dragon.y = 50;    
}

export function updateDragonAnimation() {
    dragonFrameCounter++;
    if (dragonFrameCounter >= dragonFrameSpeed) {
        dragonFrameCounter = 0;
        dragonCurrentFrame++;
        if (dragonCurrentFrame >= dragonTotalFrames) dragonCurrentFrame = 0;
    }
}

export function drawDragon(ctx) {
    ctx.drawImage(
        dragonSprite,
        dragonCurrentFrame * dragonFrameWidth,
        dragonRow * dragonFrameHeight,
        dragonFrameWidth,
        dragonFrameHeight,
        dragon.x,
        dragon.y,
        dragonFrameWidth * 0.8,
        dragonFrameHeight * 0.8
    );
}
