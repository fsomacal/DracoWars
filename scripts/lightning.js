// lightning.js

export let dragonRays = [];
export let lightningIndicators = [];

export const lightningConfig = {
    frameWidth: 64,    // aumentei para ficar visível
    frameHeight: 128,  // altura maior
    totalFrames: 6,
    collisionHeight: 20,
    speed: 8
};

export const lightningSprite = new Image();
lightningSprite.src = 'images/lightning.png';
let lightningLoaded = false;
lightningSprite.onload = () => { lightningLoaded = true; };
export { lightningLoaded };

// Spawn indicador aleatório em toda a largura do canvas
export function spawnLightningIndicator(canvasWidth) {
    const x = Math.random() * (canvasWidth - lightningConfig.frameWidth);
    const y = 0; // começa do topo
    lightningIndicators.push({ x, y, timer: 60 });
}

export function spawnDragonRayFromIndicator(indicator) {
    dragonRays.push({
        x: indicator.x,
        y: indicator.y,
        width: lightningConfig.frameWidth,
        height: lightningConfig.frameHeight,
        frameIndex: 0
    });
}