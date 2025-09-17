import { drawDragon, updateDragonAnimation, updateDragonPosition } from './dragon.js';
import { drawPlayer, updatePlayerAnimation, updatePlayerPosition } from './player.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Atualiza posições iniciais
updateDragonPosition(canvas);
updatePlayerPosition(canvas);

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha o dragão
    drawDragon(ctx);

    // Desenha o player
    drawPlayer(ctx);
}

function update() {
    updateDragonAnimation();
    updatePlayerAnimation();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
