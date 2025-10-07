// scripts/script.js
import { drawDragon, updateDragonAnimation, updateDragonPosition, dragon } from './dragon.js';
import { drawPlayer, updatePlayerAnimation, updatePlayerPosition, player, drawPlayerHitbox } from './player.js';
import { spawnFireball, updateFireballs, drawFireballs, fireballs } from './fireball.js';
import { dragonBalls, trySpawnDragonBall, updateDragonBalls, drawDragonBalls } from './electroBall.js';
import { slashes, trySpawnSlash, updateSlashes, drawSlashes } from './slash.js';

// Canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let isPaused = false;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Charging attack
let charging = false;
let chargeStart = 0;
let chargeTime = 0;
const maxChargeTime = 2500;
const chargeSprite = new Image();
chargeSprite.src = "images/charging.png";
const chargeFrameWidth = 32;
const chargeFrameHeight = 32;
const chargeFrames = 9;

// Input
window.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !charging) {
    charging = true;
    chargeStart = Date.now();
    player.isCharging = true;
  }

  // toggle hitbox debug
  if (e.key && e.key.toLowerCase() === 'h') showHitboxes = !showHitboxes;
});
window.addEventListener("keyup", (e) => {
  if (e.code === "Space") {
    charging = false;
    chargeTime = 0;
    player.isCharging = false;
  }
});

// prevent zoom shortcuts
window.addEventListener("wheel", function (e) { if (e.ctrlKey || e.metaKey) e.preventDefault(); }, { passive: false });
window.addEventListener("keydown", function (e) {
  if ((e.ctrlKey || e.metaKey) && ['+', '-', '=', '0'].includes(e.key)) e.preventDefault();
});

// Debug flag
let showHitboxes = false;

// Audio
const backgroundMusic = new Audio('sounds/backgroundSoundtrack.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.25;

const dragonRoar = new Audio('sounds/dragonRoar.mp3');
const dragonGrowl = new Audio('sounds/dragonGrowl.mp3');
dragonRoar.volume = 0.6;
dragonGrowl.volume = 0.9;

let audioUnlocked = false;
function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  [backgroundMusic, dragonRoar, dragonGrowl].forEach(a => {
    a.play().then(() => { a.pause(); a.currentTime = 0; }).catch(() => { });
  });
  backgroundMusic.play().catch(() => { });
}
window.addEventListener('pointerdown', unlockAudio, { once: true });
window.addEventListener('keydown', unlockAudio, { once: true });


// util AABB
function aabbCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

// animação de fade out do dragão
function fadeOutDragon(dragon, duration = 2000) {
  dragon.fading = true;
  dragon.opacity = 1;
  const fadeStep = 1 / (duration / 16.67); // 60fps
  const fadeInterval = setInterval(() => {
    dragon.opacity -= fadeStep;
    if (dragon.opacity <= 0) {
      dragon.opacity = 0;
      clearInterval(fadeInterval);
      setTimeout(() => {
        alert("You defeated the dragon! Congratulations!");
      }, 500);
    }
  }, 16.67);
}

// explosão
const explosionSprite = new Image();
explosionSprite.src = 'images/explosion.png';
const explosionFrames = 6;
const explosionCols = 3;
const explosionRows = 2;
const explosionFrameWidth = 189;
const explosionFrameHeight = 220;
const explosions = [];

function createExplosion(x, y) {
  explosions.push({
    x,
    y,
    currentFrame: 0,
    frameDelay: 5,
    frameCounter: 0
  });
}

// retorna a hitbox atual do player (usa offset + width/height definidos em player.hitbox)
function getPlayerHitbox() {
  const hb = player.hitbox;
  return {
    x: player.x + (hb.offsetX || 0),
    y: player.y + (hb.offsetY || 0),
    width: hb.width,
    height: hb.height
  };
}

function spawnRandomExplosions(entity, count) {
  const explosionSound = new Audio('sounds/explosion.mp3');
  explosionSound.volume = 0.7;
  for (let i = 0; i < count; i++) {
    const delay = Math.random() * 2000;
    setTimeout(() => {
      const explosionX = entity.x + Math.random() * entity.width;
      const explosionY = entity.y + Math.random() * entity.height;
      createExplosion(explosionX, explosionY);
      explosionSound.currentTime = 0;
      explosionSound.play().catch(() => { });
    }, delay);
  }
}

// GAME LOOP
function startGame() {
  dragon.hp = 100;
  dragon.opacity = 1;
  updateDragonPosition(canvas);
  updatePlayerPosition(canvas);
  dragonBehavior(dragon);

  function update() {
    updatePlayerPosition(canvas);
    updatePlayerAnimation();
    updateDragonAnimation();

    updateFireballs();
    trySpawnDragonBall(canvas.width);
    updateDragonBalls(player, canvas.height);

    // ---- slash: spawn/update ----
    trySpawnSlash(dragon, player); // chance de spawn vindo do dragão (slash.js controla spawnChance)
    updateSlashes(player, canvas.width, canvas.height);
    // -----------------------------

    // explosões
    for (let i = explosions.length - 1; i >= 0; i--) {
      const exp = explosions[i];
      exp.frameCounter++;
      if (exp.frameCounter >= exp.frameDelay) {
        exp.frameCounter = 0;
        exp.currentFrame++;
        if (exp.currentFrame >= explosionFrames) {
          explosions.splice(i, 1);
        }
      }
    }

    // charging attack
    if (charging) {
      chargeTime = Date.now() - chargeStart;
      if (chargeTime >= maxChargeTime) {
        spawnFireball(player.x + player.width / 2 - 12, player.y);
        chargeStart = Date.now();
        chargeTime = 0;
      }
    }

    // colisão fireball -> dragon
    for (let i = fireballs.length - 1; i >= 0; i--) {
      const f = fireballs[i];
  
      // pegar a hitbox do dragão
      const hb = dragon.hitbox;
      const dragonX = dragon.x + hb.offsetX;
      const dragonY = dragon.y + hb.offsetY;
  
      // checar colisão
      if (aabbCollision(f.x, f.y, f.width, f.height, dragonX, dragonY, hb.width, hb.height)) {
          // remover fireball
          fireballs.splice(i, 1);
  
          // reduzir HP do dragão
          if (dragon.hp > 0) {
              dragon.hp = Math.max(0, dragon.hp - 5);
              createExplosion(dragon.x + dragon.width / 2, dragon.y + dragon.height / 2);
          }
      }
    }
  

    // morte do dragão
    if (dragon.hp <= 0 && !dragon.death) {
      dragon.death = true;
      spawnRandomExplosions(dragon, 10);
      fadeOutDragon(dragon, 2000);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // aplica fade no dragão
    if (dragon.fading) ctx.globalAlpha = dragon.opacity || 1;
    drawDragon(ctx);
    ctx.globalAlpha = 1;

    // desenha slashes (vindo do dragão) logo depois do dragão, antes do player
    drawSlashes(ctx);

    drawPlayer(ctx);
    drawFireballs(ctx);
    drawCharging(ctx);
    drawDragonBalls(ctx);

    // barra de HP
    const barWidth = dragon.width;
    const barHeight = 7.5;
    const barX = dragon.x + dragon.width / 2 - barWidth / 2;
    const barY = dragon.y - 20;
    ctx.fillStyle = "black";
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = "red";
    const currentHP = (dragon.hp / 100) * barWidth;
    ctx.fillRect(barX, barY, currentHP, barHeight);

    // hitboxes
    if (showHitboxes) {
      ctx.strokeStyle = "lime";
      ctx.lineWidth = 2;
      const dragonX = dragon.x + dragon.hitbox.offsetX;
      const dragonY = dragon.y + dragon.hitbox.offsetY;
      ctx.strokeRect(dragonX, dragonY, dragon.hitbox.width, dragon.hitbox.height);
      drawPlayerHitbox(ctx);

      // projetéis e bolas
      ctx.strokeStyle = "orange";
      fireballs.forEach(f => ctx.strokeRect(f.x, f.y, f.width, f.height));
      ctx.strokeStyle = "magenta";
      dragonBalls.forEach(b => ctx.strokeRect(b.x, b.y, b.width, b.height));
      
      // slashes (debug) — mostra a área do slash
      ctx.strokeStyle = "cyan";
      slashes.forEach(s => ctx.strokeRect(s.x, s.y, s.width, s.height));
    }

    // desenha explosões
    explosions.forEach(exp => {
      const col = exp.currentFrame % explosionCols;
      const row = Math.floor(exp.currentFrame / explosionCols);
      ctx.drawImage(
        explosionSprite,
        col * explosionFrameWidth,
        row * explosionFrameHeight,
        explosionFrameWidth,
        explosionFrameHeight,
        exp.x - explosionFrameWidth / 2,
        exp.y - explosionFrameHeight / 2,
        explosionFrameWidth,
        explosionFrameHeight
      );
    });
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }
  loop();
}

// charging visual
function drawCharging(ctx) {
  if (!player.isCharging) return;
  let progress = chargeTime / maxChargeTime;
  if (progress > 1) progress = 1;
  let frameIndex = Math.floor(progress * chargeFrames);
  if (frameIndex >= chargeFrames) frameIndex = chargeFrames - 1;
  const scale = 1 + progress * 1.1;
  const chargeX = player.x + player.width + 10;
  const chargeY = player.y + player.height / 2 - (chargeFrameHeight * scale) / 2;
  ctx.drawImage(
    chargeSprite,
    frameIndex * chargeFrameWidth, 0,
    chargeFrameWidth, chargeFrameHeight,
    chargeX, chargeY,
    chargeFrameWidth * scale, chargeFrameHeight * scale
  );
}

// comportamento assíncrono do dragão
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
async function dragonBehavior(dragon) {
  while (dragon.hp > 0) {
    await sleep(2000 + Math.random() * 3000);
    if (Math.random() < 0.15) {
      const sfx = choose([dragonGrowl, dragonRoar]);
      sfx.currentTime = 0;
      sfx.play().catch(() => { });
    }
  }
}

function choose(array) {
  const idx = Math.floor(Math.random() * array.length);
  return array[idx];
}

window.addEventListener("load", startGame);
