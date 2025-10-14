import { player, entityHitsPlayerPlus } from './player.js';
// scripts/electroBall.js (com delay de frames configurável)
export const dragonBalls = [];

export const ballConfig = {
  width: 48,
  height: 48,
  totalFrames: 4,
  speedMin: 1.2,
  speedMax: 3.2,
  homingChance: 0.05,
  spawnChancePerFrame: 0.005,
  maxPerSpawn: 2,
  damage: 1, // ❤️ Cada hit tira 1 ponto de vida
  playerInvulMs: 1000,
  frameDelay: 8 // <-- troque esse valor para ajustar a velocidade da animação (maior = mais lento)
};

export const ballSprite = new Image();
let ballSpriteLoaded = false;
let ballSpriteBroken = false;

ballSprite.src = "images/electroBall.png";

ballSprite.onload = () => {
  ballSpriteLoaded = true;
  console.log("electroBall: sprite carregado com sucesso.");
};
ballSprite.onerror = (e) => {
  ballSpriteBroken = true;
  console.warn("electroBall: falha ao carregar sprite 'images/electroBall.png'. Verifique o caminho (404).", e);
};

export function spawnDragonBall(canvasWidth) {
  const x = Math.random() * Math.max(0, canvasWidth - ballConfig.width);
  const speed = Math.random() * (ballConfig.speedMax - ballConfig.speedMin) + ballConfig.speedMin;

  dragonBalls.push({
    x,
    y: -ballConfig.height - Math.random() * 40,
    frameIndex: 0,
    frameCounter: 0, // contador para controlar o delay entre frames
    speed,
    width: ballConfig.width,
    height: ballConfig.height
  });
}

export function trySpawnDragonBall(canvasWidth) {
  if (Math.random() < ballConfig.spawnChancePerFrame) {
    const n = Math.floor(Math.random() * ballConfig.maxPerSpawn) + 1;
    for (let i = 0; i < n; i++) spawnDragonBall(canvasWidth);
  }
}

function aabbCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

function damagePlayer(player, damage) {
  if (typeof player.takeDamage === "function") {
    player.takeDamage(damage);
    return;
  }
  if (player.invulnerable) return;
  if (typeof player.hp === "number") player.hp = Math.max(0, player.hp - damage);
  else player.hp = Math.max(0, 100 - damage);
  player.invulnerable = true;
  setTimeout(() => player.invulnerable = false, ballConfig.playerInvulMs);
}

// ---------- NOVA FUNÇÃO: pega a hitbox "real" do player (usa player.hitbox se existir) ----------
function getPlayerHitbox(player) {
  // Se o player definiu uma hitbox (esperado: { offsetX, offsetY, width, height }), usa ela.
  if (player && player.hitbox && typeof player.hitbox === 'object') {
    const hb = player.hitbox;
    return {
      x: player.x + (hb.offsetX || 0),
      y: player.y + (hb.offsetY || 0),
      width: (typeof hb.width === 'number') ? hb.width : 8,
      height: (typeof hb.height === 'number') ? hb.height : 8
    };
  }

  // Fallback: usar bounding box da sprite (compatibilidade)
  return {
    x: player.x || 0,
    y: player.y || 0,
    width: player.width || 32,
    height: player.height || 32
  };
}
// ---------------------------------------------------------------------------------------------

export function updateDragonBalls(player, canvasHeight) {
  for (let i = dragonBalls.length - 1; i >= 0; i--) {
    const ball = dragonBalls[i];

    if (Math.random() < ballConfig.homingChance) {
      const dx = (player.x + (player.width || 0) / 2) - (ball.x + ball.width / 2);
      ball.x += dx * 0.02;
    }

    ball.y += ball.speed;

    // ----- animação com delay -----
    ball.frameCounter = (ball.frameCounter || 0) + 1;
    if (ball.frameCounter >= (ball.frameDelay || ballConfig.frameDelay)) {
      ball.frameCounter = 0;
      ball.frameIndex = (ball.frameIndex + 1) % ballConfig.totalFrames;
    }
    // -----------------------------

    // ---------- USANDO A HITBOX REAL DO PLAYER AQUI ----------
    const phb = getPlayerHitbox(player);
    if (entityHitsPlayerPlus(ball.x, ball.y, ball.width, ball.height, player)) {
      damagePlayer(player, ballConfig.damage);
      dragonBalls.splice(i, 1);
      continue;
    }
    // ---------------------------------------------------------

    if (ball.y > canvasHeight + 50) dragonBalls.splice(i, 1);
  }
}

export function drawDragonBalls(ctx) {
  dragonBalls.forEach(ball => {
    // Se sprite não carregou ou está quebrado, desenha placeholder
    if (!ballSpriteLoaded || ballSpriteBroken) {
      ctx.fillStyle = "magenta";
      ctx.fillRect(ball.x, ball.y, ball.width, ball.height);
      // opcional: desenha um X pra indicar asset faltando
      ctx.strokeStyle = "black";
      ctx.beginPath();
      ctx.moveTo(ball.x, ball.y);
      ctx.lineTo(ball.x + ball.width, ball.y + ball.height);
      ctx.moveTo(ball.x + ball.width, ball.y);
      ctx.lineTo(ball.x, ball.y + ball.height);
      ctx.stroke();
      return;
    }

    // Desenha a bola elétrica animada
    try {
      ctx.drawImage(
        ballSprite,
        (ball.frameIndex % ballConfig.totalFrames) * ballConfig.width, 0,
        ballConfig.width, ballConfig.height,
        ball.x, ball.y,
        ballConfig.width, ballConfig.height
      );
    } catch (err) {
      console.warn("Erro ao desenhar electroBall:", err);
      ctx.fillStyle = "cyan";
      ctx.fillRect(ball.x, ball.y, ball.width, ball.height);
    }
  });
}  
