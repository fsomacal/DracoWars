function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha objetos do jogo (seu jogador, obstáculos etc.)
    drawPlayer();

    // Desenha o dragão
    drawDragon(ctx);
}

function update() {
    updatePlayer();
    updateDragonAnimation();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
