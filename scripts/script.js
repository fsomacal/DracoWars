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

// chama no início
resizeCanvas();

// atualiza ao redimensionar a janela
window.addEventListener("resize", resizeCanvas);


// Disparo com espaço
window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        // dispara do centro do player
        spawnFireball(player.x + player.width / 2 - 32, player.y);
    }
});

function startGame() {
    updateDragonPosition(canvas);
    updatePlayerPosition(canvas);

    function update() {
        updateDragonAnimation();
        updatePlayerAnimation();
        updatePlayerPosition(canvas);
        updateFireballs();

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

window.addEventListener("load", startGame);
