// game.js
import { drawDragon, updateDragonAnimation, updateDragonPosition, dragon } from './dragon.js';
import { drawPlayer, updatePlayerAnimation, updatePlayerPosition, player } from './player.js';
import { spawnFireball, updateFireballs, drawFireballs, fireballs } from './fireball.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ---------------------
// CHARGING ATTACK SETUP
// ---------------------
let charging = false;
let chargeStart = 0;
let chargeTime = 0;
const maxChargeTime = 4000; // 4 segundos

// spritesheet do charging
const chargeSprite = new Image();
chargeSprite.src = "images/charging.png"; // seu caminho
const chargeFrameWidth = 32;
const chargeFrameHeight = 32;
const chargeFrames = 9;

// ---------------------
// TECLADO
// ---------------------
window.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !charging) {
        charging = true;
        chargeStart = Date.now();
        player.isCharging = true;
    }
});

window.addEventListener("keyup", (e) => {
    if (e.code === "Space") {
        charging = false;
        chargeTime = 0;
        player.isCharging = false;
    }
});

// ---------------------
// GAME
// ---------------------
function startGame() {
    updateDragonPosition(canvas);
    updatePlayerPosition(canvas);

    function update() {
        updateDragonAnimation();
        updatePlayerAnimation();
        updatePlayerPosition(canvas);
        updateFireballs();

        // CHARGING ATTACK LOGIC
        if (charging) {
            chargeTime = Date.now() - chargeStart;

            if (chargeTime >= maxChargeTime) {
                // dispara ataque
                spawnFireball(player.x + player.width / 2 - 12, player.y);

                // reinicia o carregamento automaticamente para continuar atacando se Space continuar pressionado
                chargeStart = Date.now();
                chargeTime = 0;
            }
        }

        // colisão fireball -> dragão
        for (let i = fireballs.length - 1; i >= 0; i--) {
            const f = fireballs[i];
            if (
                f.x < dragon.x + dragon.width &&
                f.x + f.width > dragon.x &&
                f.y < dragon.y + dragon.height &&
                f.y + f.height > dragon.y
            ) {
                fireballs.splice(i, 1);
                dragon.hp -= 5;
                if (dragon.hp < 0) dragon.hp = 0;
                console.log("Dragon HP:", dragon.hp);
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawDragon(ctx);
        drawPlayer(ctx);
        drawFireballs(ctx);
        drawCharging(ctx);   

        // barra de vida do dragão
        ctx.fillStyle = "black";
        ctx.fillRect(dragon.x, dragon.y - 20, dragon.width, 7.5);
        ctx.fillStyle = "red";
        ctx.fillRect(dragon.x, dragon.y - 20, dragon.hp, 7.5);
    }

    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    gameLoop();
}

// ---------------------
// DESENHO DA ANIMAÇÃO DE CHARGING (crescimento de energia)
// ---------------------
function drawCharging(ctx) {
    if (!player.isCharging) return;

    // calcula o progresso (0 a 1)
    let progress = chargeTime / maxChargeTime;
    if (progress > 1) progress = 1;

    // frame linear baseado no tempo
    let frameIndex = Math.floor(progress * chargeFrames);
    if (frameIndex >= chargeFrames) frameIndex = chargeFrames - 1;

    // efeito de crescimento: escala proporcional ao progresso
    const scale = 1 + progress * 1.5; // de 1x até 2.5x

    ctx.drawImage(
        chargeSprite,
        frameIndex * chargeFrameWidth, 0,
        chargeFrameWidth, chargeFrameHeight,
        player.x + player.width/2 - (chargeFrameWidth*scale)/2,
        player.y - 40 - (chargeFrameHeight*scale)/2,
        chargeFrameWidth * scale,
        chargeFrameHeight * scale
    );
}

window.addEventListener("load", startGame);
