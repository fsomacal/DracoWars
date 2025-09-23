// scripts/script.js
import { drawDragon, updateDragonAnimation, updateDragonPosition, dragon } from './dragon.js';
import { drawPlayer, updatePlayerAnimation, updatePlayerPosition, player } from './player.js';
import { spawnFireball, updateFireballs, drawFireballs, fireballs } from './fireball.js';
import { dragonBalls, trySpawnDragonBall, updateDragonBalls, drawDragonBalls } from './electroBall.js';

// Canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

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

  // tocar rapidamente e pausar para desbloquear autoplay/make user gesture
  [backgroundMusic, dragonRoar, dragonGrowl].forEach(a => {
    a.play().then(() => { a.pause(); a.currentTime = 0; }).catch(()=>{});
  });

  // opcional: iniciar a música imediatamente
  backgroundMusic.play().catch(()=>{});
}
window.addEventListener('pointerdown', unlockAudio, { once: true });
window.addEventListener('keydown', unlockAudio, { once: true });

// garante dragon.hitbox (fallback)
if (!dragon.hitbox) {
  dragon.hitbox = {
    offsetX: 40,
    offsetY: 40,
    width: Math.max(100, (dragon.width || 200) - 80),
    height: Math.max(100, (dragon.height || 200) - 80)
  };
}

// util AABB
function aabbCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

// game loop
function startGame() {
  // inicializações
  updateDragonPosition(canvas);
  updatePlayerPosition(canvas);

  // start async dragon behavior
  dragonBehavior(dragon);

  function update() {
    // atualiza posição/inputs do player primeiro
    updatePlayerPosition(canvas);
    updatePlayerAnimation();
    updateDragonAnimation();

    // atualizações de entidades
    updateFireballs();
    trySpawnDragonBall(canvas.width);        // spawn das bolinhas do boss
    updateDragonBalls(player, canvas.height);

    // charging attack
    if (charging) {
      chargeTime = Date.now() - chargeStart;
      if (chargeTime >= maxChargeTime) {
        spawnFireball(player.x + player.width / 2 - 12, player.y);
        chargeStart = Date.now();
        chargeTime = 0;
      }
    }

    // colisão: fireball -> dragon (usa dragon.hitbox)
    for (let i = fireballs.length - 1; i >= 0; i--) {
      const f = fireballs[i];
      const hb = dragon.hitbox;
      const dragonHBX = dragon.x + hb.offsetX;
      const dragonHBY = dragon.y + hb.offsetY;
      if (aabbCollision(f.x, f.y, f.width, f.height, dragonHBX, dragonHBY, hb.width, hb.height)) {
        fireballs.splice(i, 1);
        // aplicar dano caso queira
        if (typeof dragon.hp === "number") {
          dragon.hp = Math.max(0, dragon.hp - 5);
        }
      }
    }

    // (Lightning removido) — nada relacionado a lightning aqui
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawDragon(ctx);
    drawPlayer(ctx);
    drawFireballs(ctx);
    drawCharging(ctx);
    drawDragonBalls(ctx);

    // barra de vida do dragão (visual)
    const barWidth = dragon.width;
    const barHeight = 7.5;
    const barX = dragon.x + dragon.width / 2 - barWidth / 2;
    const barY = dragon.y - 20;
    ctx.fillStyle = "black";
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = "red";
    ctx.fillRect(barX, barY, dragon.hp || barWidth, barHeight);

    // (Lightning removido) — não há indicadores nem raios desenhados

    // debug hitboxes
    if (showHitboxes) {
      // dragon hitbox
      const hb = dragon.hitbox;
      ctx.strokeStyle = "lime";
      ctx.lineWidth = 2;
      ctx.strokeRect(dragon.x + hb.offsetX, dragon.y + hb.offsetY, hb.width, hb.height);

      // player
      ctx.strokeStyle = "cyan";
      ctx.strokeRect(player.x, player.y, player.width, player.height);

      // fireballs
      ctx.strokeStyle = "orange";
      fireballs.forEach(f => ctx.strokeRect(f.x, f.y, f.width, f.height));

      // dragonBalls
      ctx.strokeStyle = "magenta";
      dragonBalls.forEach(b => ctx.strokeRect(b.x, b.y, b.width, b.height));
    }
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }
  loop();
}

// desenho do charging (mantive sua lógica)
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

// comportamento assíncrono do dragão (rugidos etc)
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function dragonBehavior(dragon) {
  while (dragon.hp === undefined || dragon.hp > 0) {
    await sleep(2000 + Math.random() * 3000);
    if (Math.random() < 0.15) {
      const sfx = choose([dragonGrowl, dragonRoar]);
      sfx.currentTime = 0;
      sfx.play().catch(() => {});
      // opcional: iniciar música ao primeiro rugido
      //backgroundMusic.play().catch(()=>{});
    }
  }
}

function choose(array) {
  const idx = Math.floor(Math.random() * array.length);
  return array[idx];
}

window.addEventListener("load", startGame);
