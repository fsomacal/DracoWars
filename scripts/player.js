// player.js
const playerSprite = new Image();
playerSprite.src = 'images/dragonPlayer.png';

const playerFrameWidth = 256;
const playerFrameHeight = 256;
const playerRow = 0;
const playerTotalFrames = 1;

let playerCurrentFrame = 0;
let playerFrameSpeed = 10;
let playerFrameCounter = 0;

export const player = {
    x: window.innerWidth / 2 - playerFrameWidth / 2, // centro da tela
    y: window.innerHeight - 300, // base da tela
    width: playerFrameWidth,
    height: playerFrameHeight,
    invulnerable: false,
    hp: 100,
    isCharging: false,
    takeDamage(dmg) {
        if (this.invulnerable) return;
        this.hp = Math.max(0, this.hp - dmg);
        this.invulnerable = true;
        setTimeout(() => this.invulnerable = false, 800);
    }
};

// 🎯 HITBOX EM FORMA DE “+”
player.hitboxes = [
    // Barra vertical
    {
        get x() { return player.x + player.width * 0.45; },
        get y() { return player.y + player.height * 0.1; },
        get width() { return player.width * 0.1; },
        get height() { return player.height * 0.8; }
    },
    // Barra horizontal
    {
        get x() { return player.x + player.width * 0.2; },
        get y() { return player.y + player.height * 0.45; },
        get width() { return player.width * 0.6; },
        get height() { return player.height * 0.1; }
    }
];

export function updatePlayerAnimation() {
    playerFrameCounter++;
    if (playerFrameCounter >= playerFrameSpeed) {
        playerFrameCounter = 0;
        playerCurrentFrame++;
        if (playerCurrentFrame >= playerTotalFrames) playerCurrentFrame = 0;
    }
}

export function drawPlayer(ctx) {
    ctx.drawImage(
        playerSprite,
        playerCurrentFrame * playerFrameWidth,
        playerRow * playerFrameHeight,
        playerFrameWidth,
        playerFrameHeight,
        player.x,
        player.y,
        playerFrameWidth,
        playerFrameHeight
    );
}


// Movimento
let moveLeft = false, moveRight = false, moveUp = false, moveDown = false;
const playerSpeed = 5;

window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") moveLeft = true;
    if (e.key === "ArrowRight") moveRight = true;
    if (e.key === "ArrowUp") moveUp = true;
    if (e.key === "ArrowDown") moveDown = true;
});

window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") moveLeft = false;
    if (e.key === "ArrowRight") moveRight = false;
    if (e.key === "ArrowUp") moveUp = false;
    if (e.key === "ArrowDown") moveDown = false;
});

export function updatePlayerPosition(canvas) {
    if (moveLeft) player.x -= playerSpeed;
    if (moveRight) player.x += playerSpeed;
    if (moveUp) player.y -= playerSpeed;
    if (moveDown) player.y += playerSpeed;

    if (player.x < 0) player.x = 0;
    if (player.y < 0) player.y = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
    if (player.y > canvas.height - player.height) player.y = canvas.height - player.height;
}



// ❤️ Sistema de vida com corações
player.maxHp = 6; // 6 pontos = 3 corações (cada coração = 2 pontos)
player.hp = player.maxHp;
player.invulnerable = false;
player.invulTimer = 0;
player.invulMs = 1200; // invulnerabilidade após levar dano

// Método para receber dano — é chamado por damagePlayer() em outros módulos
player.takeDamage = function(damage) {
    if (player.invulnerable) return;
    player.invulnerable = true;
    player.invulTimer = Date.now();
    player.hp = Math.max(0, player.hp - damage);
    
    // quando hp zera, game over (tratado no script.js)
    if (player.hp === 0) {
        console.log("Player morreu!");
    }
};

// Deve ser chamado no loop principal para atualizar temporizadores
export function updatePlayerTimers() {
    if (player.invulnerable) {
        if (Date.now() - player.invulTimer >= player.invulMs) {
            player.invulnerable = false;
        }
    }
}

// Retorna dois retângulos (horizontal e vertical) que compõem o '+'
// cada retângulo no formato {x,y,width,height}
export function getPlayerPlusRects(p = player, opts = {}) {
    const centerX = p.x + (p.width || 32) / 2;
    const centerY = p.y + (p.height || 32) / 2;
    // tamanho dos braços (proporcional ao sprite)
    const lengthX = (p.width || 32) * 0.6;
    const lengthY = (p.height || 32) * 0.6;
    const thickness = Math.max(8, Math.floor((p.width || 32) * 0.12));
    const horiz = {
        x: centerX - lengthX / 2,
        y: centerY - thickness / 2,
        width: lengthX,
        height: thickness
    };
    const vert = {
        x: centerX - thickness / 2,
        y: centerY - lengthY / 2,
        width: thickness,
        height: lengthY
    };
    return [horiz, vert];
}

// Checa colisão AABB entre dois retângulos
export function rectOverlap(ax,ay,aw,ah, bx,by,bw,bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

// Checa se um retângulo (por exemplo, projétil) colide com o '+' do jogador
export function entityHitsPlayerPlus(ex, ey, ew, eh, p = player) {
    const [horiz, vert] = getPlayerPlusRects(p);
    return rectOverlap(ex,ey,ew,eh, horiz.x,horiz.y,horiz.width,horiz.height) ||
           rectOverlap(ex,ey,ew,eh, vert.x,vert.y,vert.width,vert.height);
}

// Desenha a hitbox em '+' (útil para debug). Chame drawPlayerHitbox(ctx) no loop de render.
export function drawPlayerHitbox(ctx, p = player) {
    const [horiz, vert] = getPlayerPlusRects(p);
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = "rgba(255,0,0,0.6)";
    ctx.fillRect(horiz.x, horiz.y, horiz.width, horiz.height);
    ctx.fillRect(vert.x, vert.y, vert.width, vert.height);
    // centro
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(p.x + p.width/2 - 2, p.y + p.height/2 - 2, 4, 4);
    ctx.restore();
}

// ❤️ Desenha corações na UI (cada coração = 2 pontos de vida)
export function drawPlayerUI(ctx) {
    const padding = 20;
    const heartSize = 32;
    const heartSpacing = 8;
    const maxHearts = 3; // 3 corações = 6 pontos de vida
    
    ctx.save();
    
    // Desenha cada coração
    for (let i = 0; i < maxHearts; i++) {
        const x = padding + i * (heartSize + heartSpacing);
        const y = padding;
        
        // Calcula quantos pontos de vida este coração representa
        const heartHp = player.hp - (i * 2);
        
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        
        // Desenha a forma do coração
        const centerX = x + heartSize / 2;
        const centerY = y + heartSize / 2;
        const width = heartSize;
        const height = heartSize;
        const topCurveHeight = height * 0.3;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + height / 4);
        
        // Curva esquerda
        ctx.bezierCurveTo(
            centerX, centerY - height / 4,
            centerX - width / 2, centerY - height / 4,
            centerX - width / 2, centerY + topCurveHeight / 2
        );
        ctx.bezierCurveTo(
            centerX - width / 2, centerY + (height / 4),
            centerX, centerY + (height / 2),
            centerX, centerY + height / 4
        );
        
        // Curva direita
        ctx.bezierCurveTo(
            centerX, centerY + (height / 2),
            centerX + width / 2, centerY + (height / 4),
            centerX + width / 2, centerY + topCurveHeight / 2
        );
        ctx.bezierCurveTo(
            centerX + width / 2, centerY - height / 4,
            centerX, centerY - height / 4,
            centerX, centerY + height / 4
        );
        
        ctx.closePath();
        
        // Determina a cor do coração baseado no HP
        if (heartHp >= 2) {
            // Coração cheio
            ctx.fillStyle = "#E74C3C";
        } else if (heartHp === 1) {
            // Meio coração
            ctx.fillStyle = "#E74C3C";
            ctx.fill();
            
            // Adiciona máscara para mostrar só metade
            ctx.save();
            ctx.fillStyle = "rgba(50, 50, 50, 0.7)";
            ctx.fillRect(x + heartSize / 2, y, heartSize / 2, heartSize);
            ctx.restore();
            
            // Contorno
            ctx.strokeStyle = "#C0392B";
            ctx.lineWidth = 2;
            ctx.stroke();
            continue;
        } else {
            // Coração vazio
            ctx.fillStyle = "rgba(50, 50, 50, 0.5)";
        }
        
        ctx.fill();
        
        // Contorno
        ctx.strokeStyle = heartHp > 0 ? "#C0392B" : "rgba(100, 100, 100, 0.5)";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    ctx.restore();
}
