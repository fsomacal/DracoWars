import { drawDragon, updateDragonAnimation, updateDragonPosition } from './dragon.js';
import { drawPlayer, updatePlayerAnimation, updatePlayerPosition } from './player.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function startGame() {
    // Atualiza posições iniciais
    updateDragonPosition(canvas);
    updatePlayerPosition(canvas);

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawDragon(ctx);
        drawPlayer(ctx);
    }

    function update() {
        updateDragonAnimation();
        updatePlayerAnimation();
        updatePlayerPosition(canvas);
    }

    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    gameLoop();
}

// 🚀 Só inicia quando imagens estiverem prontas
window.addEventListener("load", startGame);
