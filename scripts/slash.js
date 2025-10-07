// scripts/slash.js
export const slashes = [];

export const slashConfig = {
  width: 128,
  height: 128,
  totalFrames: 6,
  speed: 4,
  spawnChancePerFrame: 0.007, // chance de spawn a cada frame
  damage: 20,
  playerInvulMs: 1000,
  frameDelay: 4 // maior = mais lenta a animação
};

// Sprite
export const slashSprite = new Image();
let slashSpriteLoaded = false;
let slashSpriteBroken = false;

slashSprite.src = "images/slash.png";

slashSprite.onload = () => {
  slashSpriteLoaded = true;
  console.log("slash: sprite carregado com sucesso.");
};
slashSprite.onerror = (e) => {
  slashSpriteBroken = true;
  console.warn("slash: falha ao carregar sprite 'images/slash.png'. Verifique o caminho.", e);
};

// Função de spawn — slash nasce no dragão e vai em direção ao player
export function spawnSlash(dragon, player) {
  const dx = (player.x + player.width / 2) - (dragon.x + dragon.width / 2);
  const dy = (player.y + player.height / 2) - (dragon.y + dragon.height / 2);
  const len = Math.hypot(dx, dy);
  const dirX = dx / len;
  const dirY = dy / len;

  slashes.push({
    x: dragon.x + dragon.width / 2 - slashConfig.width / 2,
    y: dragon.y + dragon.height / 2 - slashConfig.height / 2,
    dirX,
    dirY,
    frameIndex: 0,
    frameCounter: 0,
    width: slashConfig.width,
    height: slashConfig.height
  });
}

// chance de spawn automático
export function trySpawnSlash(dragon, player) {
  if (Math.random() < slashConfig.spawnChancePerFrame) {
    spawnSlash(dragon, player);
  }
}

// colisão simples
function aabbCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 < x2 + w2 && x1 + w1 > x2 && y1 + h1 > y2 && y1 < y2 + h2;
}

// aplicar dano
function damagePlayer(player, damage) {
  if (typeof player.takeDamage === "function") {
    player.takeDamage(damage);
    return;
  }
  if (player.invulnerable) return;
  if (typeof player.hp === "number") player.hp = Math.max(0, player.hp - damage);
  else player.hp = Math.max(0, 100 - damage);
  player.invulnerable = true;
  setTimeout(() => player.invulnerable = false, slashConfig.playerInvulMs);
}

// atualizar movimento e colisão
export function updateSlashes(player, canvasWidth, canvasHeight) {
  for (let i = slashes.length - 1; i >= 0; i--) {
    const s = slashes[i];

    s.x += s.dirX * slashConfig.speed;
    s.y += s.dirY * slashConfig.speed;

    // animação
    s.frameCounter++;
    if (s.frameCounter >= (s.frameDelay || slashConfig.frameDelay)) {
      s.frameCounter = 0;
      s.frameIndex = (s.frameIndex + 1) % slashConfig.totalFrames;
    }

    // colisão com player
    const pw = player.width || 32;
    const ph = player.height || 32;
    if (aabbCollision(s.x, s.y, s.width, s.height, player.x, player.y, pw, ph)) {
      damagePlayer(player, slashConfig.damage);
      slashes.splice(i, 1);
      continue;
    }

    // remove se sair da tela
    if (
      s.x < -s.width || s.x > canvasWidth + s.width ||
      s.y < -s.height || s.y > canvasHeight + s.height
    ) {
      slashes.splice(i, 1);
    }
  }
}

// desenhar
export function drawSlashes(ctx) {
  slashes.forEach(s => {
    if (!slashSpriteLoaded || slashSpriteBroken) {
      ctx.fillStyle = "yellow";
      ctx.fillRect(s.x, s.y, s.width, s.height);
      ctx.strokeStyle = "black";
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x + s.width, s.y + s.height);
      ctx.moveTo(s.x + s.width, s.y);
      ctx.lineTo(s.x, s.y + s.height);
      ctx.stroke();
      return;
    }

    try {
      ctx.drawImage(
        slashSprite,
        (s.frameIndex % slashConfig.totalFrames) * slashConfig.width, 0,
        slashConfig.width, slashConfig.height,
        s.x, s.y,
        slashConfig.width, slashConfig.height
      );
    } catch (err) {
      console.warn("Erro ao desenhar slash:", err);
      ctx.fillStyle = "yellow";
      ctx.fillRect(s.x, s.y, s.width, s.height);
    }
  });
}
