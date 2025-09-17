import { drawDragon, updateDragonAnimation, updateDragonPosition } from './dragon.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Atualiza posição inicial do dragão
updateDragonPosition(canvas);

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha o dragão
    drawDragon(ctx);
}

function update() {
    updateDragonAnimation();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
