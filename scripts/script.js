// game.js
import { drawDragon, updateDragonAnimation, updateDragonPosition, dragon } from './dragon.js';
import { drawPlayer, updatePlayerAnimation, updatePlayerPosition, player } from './player.js';
import { spawnFireball, updateFireballs, drawFireballs, fireballs } from './fireball.js';
import { dragonRays, lightningIndicators, lightningConfig, lightningSprite, spawnLightningIndicator, spawnDragonRayFromIndicator } from './lightning.js';

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
const maxChargeTime = 4000;
const chargeSprite = new Image();
chargeSprite.src = "images/charging.png";
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
// BLOQUEIO DE ZOOM
// ---------------------
window.addEventListener("wheel", function(e){ if(e.ctrlKey || e.metaKey) e.preventDefault(); }, {passive:false});
window.addEventListener("keydown", function(e){
    if((e.ctrlKey || e.metaKey) && ['+','-','=','0'].includes(e.key)) e.preventDefault();
});

// ---------------------
// GAME LOOP
// ---------------------
function startGame(){
    updateDragonPosition(canvas);
    updatePlayerPosition(canvas);

    function update(){
        updateDragonAnimation();
        updatePlayerAnimation();
        updatePlayerPosition(canvas);
        updateFireballs();

        // CHARGING ATTACK
        if(charging){
            chargeTime = Date.now() - chargeStart;
            if(chargeTime >= maxChargeTime){
                spawnFireball(player.x + player.width/2 - 12, player.y);
                chargeStart = Date.now();
                chargeTime = 0;
            }
        }

        // colisão fireball -> dragão
        for(let i = fireballs.length-1; i>=0; i--){
            const f = fireballs[i];
            if(f.x < dragon.x + dragon.width && f.x + f.width > dragon.x && f.y < dragon.y + dragon.height && f.y + f.height > dragon.y){
                fireballs.splice(i,1);
                dragon.hp -= 5;
                if(dragon.hp<0) dragon.hp=0;
            }
        }

        // ---------------------
        // ATAQUE DO DRAGÃO (RAIOS)
        // ---------------------
        // gera indicador aleatório
        if(Math.random() < 0.01) spawnLightningIndicator(dragon);

        // atualiza indicadores
        for(let i=lightningIndicators.length-1; i>=0; i--){
            let ind = lightningIndicators[i];
            ind.timer--;
            if(ind.timer <=0){
                spawnDragonRayFromIndicator(ind);
                lightningIndicators.splice(i,1);
            }
        }

        // atualiza raios
        for(let i=dragonRays.length-1; i>=0; i--){
            const ray = dragonRays[i];
            ray.y += lightningConfig.speed;

            // colisão com jogador (só base)
            if(ray.x < player.x + player.width && ray.x + ray.width > player.x &&
               ray.y + lightningConfig.collisionHeight > player.y && ray.y + ray.height < player.y + player.height){
                console.log("Player atingido por raio!");
                dragonRays.splice(i,1);
            } else if(ray.y > canvas.height){
                dragonRays.splice(i,1);
            }
        }
    }

    function draw(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        drawDragon(ctx);
        drawPlayer(ctx);
        drawFireballs(ctx);
        drawCharging(ctx);

        // BARRA DE VIDA DO DRAGÃO
        const barWidth = dragon.width;
        const barHeight = 7.5;
        const barX = dragon.x + dragon.width/2 - barWidth/2;
        const barY = dragon.y - 20;
        ctx.fillStyle = "black";
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = "red";
        ctx.fillRect(barX, barY, dragon.hp, barHeight);

        // DESENHO DOS INDICADORES
        ctx.fillStyle = "rgba(255,255,0,0.5)";
        lightningIndicators.forEach(ind => ctx.fillRect(ind.x, dragon.y + dragon.height, lightningConfig.frameWidth, 10));

        // DESENHO DOS RAIOS (spritesheet)
        dragonRays.forEach(ray => {
            ray.frameIndex = (ray.frameIndex + 1) % lightningConfig.totalFrames;
            ctx.drawImage(
                lightningSprite,
                ray.frameIndex * lightningConfig.frameWidth, 0,
                lightningConfig.frameWidth, lightningConfig.frameHeight,
                ray.x, ray.y,
                lightningConfig.frameWidth, lightningConfig.frameHeight
            );
        });
    }

    function gameLoop(){
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    gameLoop();
}

// CHARGING DRAW
function drawCharging(ctx){
    if(!player.isCharging) return;
    let progress = chargeTime/maxChargeTime;
    if(progress>1) progress=1;
    let frameIndex = Math.floor(progress*chargeFrames);
    if(frameIndex>=chargeFrames) frameIndex=chargeFrames-1;
    const scale = 1 + progress*1.1;
    const chargeX = player.x + player.width + 10;
    const chargeY = player.y + player.height/2 - (chargeFrameHeight*scale)/2;
    ctx.drawImage(
        chargeSprite,
        frameIndex*chargeFrameWidth,0,
        chargeFrameWidth, chargeFrameHeight,
        chargeX, chargeY,
        chargeFrameWidth*scale, chargeFrameHeight*scale
    );
}

window.addEventListener("load", startGame);