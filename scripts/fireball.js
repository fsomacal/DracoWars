// fireball.js
const fireballSprite = new Image();
fireballSprite.src = "images/fireball.png";
const fireballSound = new Audio("sounds/fireball.m4a");

let fireballLoaded = false;
fireballSprite.onload = () => {
    fireballLoaded = true;
};

const fbFrameWidth = 16;
const fbFrameHeight = 16;
const fbTotalFrames = 6; // 6 frames
let fbFrameSpeed = 6;

class Fireball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speedY = -7; // sobe para cima
        this.currentFrame = 0;
        this.frameCounter = 0;
        this.width = fbFrameWidth;
        this.height = fbFrameHeight;
    }

    update() {
        this.y += this.speedY;
        this.frameCounter++;
        if (this.frameCounter >= fbFrameSpeed) {
            this.frameCounter = 0;
            this.currentFrame = (this.currentFrame + 1) % fbTotalFrames;
        }
        return this.y + this.height > 0; // mantém na tela
    }

    draw(ctx) {
        if (!fireballLoaded) return;
    
        const drawWidth = this.width * 2;  // 2x maior
        const drawHeight = this.height * 2;
    
        ctx.save();
    
        ctx.translate(this.x + drawWidth / 2, this.y + drawHeight / 2);
    
        ctx.rotate(Math.PI * 1.5);
    
        ctx.drawImage(
            fireballSprite,
            this.currentFrame * fbFrameWidth,
            0,
            fbFrameWidth,
            fbFrameHeight,
            -drawWidth / 2,
            -drawHeight / 2,
            drawWidth,
            drawHeight
        );
    
        ctx.restore();
    }
    
}

export let fireballs = [];

export function spawnFireball(x, y) {
    fireballs.push(new Fireball(x, y));
    fireballSound.play();
}

export function updateFireballs() {
    fireballs = fireballs.filter(f => f.update());
}

export function drawFireballs(ctx) {
    fireballs.forEach(f => f.draw(ctx));
}
