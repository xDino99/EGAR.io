const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let myId = null;
let players = {};
let food = [];
let isPlaying = false;
let rotAngle = 0;
let spectatorTargetId = null;
let spectatorInterval = null;

let config = {
    voidAlpha: 0.8,
    mapAlpha: 0.2,
    gridAlpha: 0.3,
    foodColorType: 'random',
    foodColorSolid: '#00ff00',
    bgColor: '#111111',
    bgImage: '',
    nickname: '',
    skinType: 'solid',
    color1: '#ff0000',
    color2: '#0000ff',
    nameColorType: 'solid',
    nameColor1: '#ffffff',
    nameColor2: '#ffff00',
    effect: 'none'
};

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function loadSavedConfig() {
    const saved = localStorage.getItem('lanagario_full_config');
    if (saved) {
        config = JSON.parse(saved);
        
        document.getElementById('voidAlpha').value = config.voidAlpha;
        document.getElementById('mapAlpha').value = config.mapAlpha;
        document.getElementById('gridAlpha').value = config.gridAlpha;
        document.getElementById('bgColorPicker').value = config.bgColor;
        document.getElementById('bgImageInput').value = config.bgImage;
        document.getElementById('foodColorType').value = config.foodColorType;
        document.getElementById('foodColorSolid').value = config.foodColorSolid;

        document.getElementById('nickname').value = config.nickname || '';
        document.getElementById('skinType').value = config.skinType;
        document.getElementById('color1').value = config.color1;
        document.getElementById('color2').value = config.color2;
        document.getElementById('nameColorType').value = config.nameColorType;
        document.getElementById('nameColor1').value = config.nameColor1;
        document.getElementById('nameColor2').value = config.nameColor2;
        document.getElementById('effect').value = config.effect;

        toggleSkinColors();
        toggleNameColors();
        toggleFoodColors();
        applySettings(false);
    }
}

function applySettings(shouldSave = true) {
    config.bgColor = document.getElementById('bgColorPicker').value;
    config.bgImage = document.getElementById('bgImageInput').value;
    config.voidAlpha = parseFloat(document.getElementById('voidAlpha').value);
    config.mapAlpha = parseFloat(document.getElementById('mapAlpha').value);
    config.gridAlpha = parseFloat(document.getElementById('gridAlpha').value);
    config.foodColorType = document.getElementById('foodColorType').value;
    config.foodColorSolid = document.getElementById('foodColorSolid').value;

    if (config.bgImage && config.bgImage.trim() !== '') {
        document.body.style.backgroundImage = `url('${config.bgImage}')`;
    } else {
        document.body.style.backgroundImage = 'none';
        document.body.style.backgroundColor = config.bgColor;
    }

    if (shouldSave) saveAllToLocal();
}

function saveAllToLocal() {
    config.nickname = document.getElementById('nickname').value;
    config.skinType = document.getElementById('skinType').value;
    config.color1 = document.getElementById('color1').value;
    config.color2 = document.getElementById('color2').value;
    config.nameColorType = document.getElementById('nameColorType').value;
    config.nameColor1 = document.getElementById('nameColor1').value;
    config.nameColor2 = document.getElementById('nameColor2').value;
    config.effect = document.getElementById('effect').value;

    localStorage.setItem('lanagario_full_config', JSON.stringify(config));
}

function joinGame() {
    saveAllToLocal();
    socket.emit('join_game', config);
}

window.onload = () => {
    loadSavedConfig();
    resize();
};

function exitGame() {
    location.reload();
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function toggleSkinColors() {
    const type = document.getElementById('skinType').value;
    const c2 = document.getElementById('color2');
    if (c2) c2.style.display = (type === 'gradient') ? 'block' : 'none';
}

function toggleNameColors() {
    const type = document.getElementById('nameColorType').value;
    const nc2 = document.getElementById('nameColor2');
    if (nc2) nc2.style.display = (type === 'gradient') ? 'block' : 'none';
}

function toggleFoodColors() {
    const type = document.getElementById('foodColorType').value;
    const fc = document.getElementById('foodColorContainer');
    if (fc) fc.style.display = (type === 'solid') ? 'block' : 'none';
    applySettings();
}

function toggleSettings(show) {
    document.getElementById('main-menu').style.display = show ? 'none' : 'flex';
    document.getElementById('settings-menu').style.display = show ? 'flex' : 'none';
}

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-header button').forEach(el => el.classList.remove('active'));
    document.getElementById(tab + '-tab').classList.add('active');
    if (event && event.target) event.target.classList.add('active');
}

function autoSpectate() {
    const ids = Object.keys(players);
    if (ids.length > 0) {
        spectatorTargetId = ids[Math.floor(Math.random() * ids.length)];
    }
}

socket.on('game_started', (data) => {
    myId = data.id;
    isPlaying = true;
    if (spectatorInterval) clearInterval(spectatorInterval);
    document.getElementById('menu-overlay').style.display = 'none';
    document.getElementById('game-ui').style.display = 'block';
    showToast('¡Partida iniciada!', 'info');
});

socket.on('dead', (msg) => {
    showToast(msg, 'error');
    setTimeout(() => location.reload(), 2000);
});

socket.on('state_update', (data) => {
    players = data.players;
    food = data.food;
    updateMenuStats(data.leaderboard, data.playerList);
    if (isPlaying) updateGameUI(data.leaderboard);
});

function gameLoop() {
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();

spectatorInterval = setInterval(autoSpectate, 3000);

function updateMenuStats(lb, list) {
    if (isPlaying) return;
    const lbEl = document.getElementById('menu-leaderboard');
    if (lbEl) lbEl.innerHTML = lb.map((p, i) => `<li>#${i+1} ${p.name} - ${p.score}</li>`).join('');
    const plEl = document.getElementById('menu-playerlist');
    if (plEl) plEl.innerHTML = list.map(name => `<li>${name}</li>`).join('');
}

function updateGameUI(lb) {
    const lbEl = document.getElementById('lb-list');
    if (lbEl) lbEl.innerHTML = lb.map((p, i) => `<li>#${i+1} ${p.name} (${p.score})</li>`).join('');
    const scoreEl = document.getElementById('score');
    if (players[myId] && scoreEl) scoreEl.innerText = Math.floor(players[myId].score);
}

window.addEventListener('mousemove', (e) => {
    if (!isPlaying) return;
    socket.emit('mouse_move', {
        x: e.clientX,
        y: e.clientY,
        screenWidth: canvas.width,
        screenHeight: canvas.height
    });
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let camX = 1500;
    let camY = 1500;

    if (isPlaying && players[myId]) {
        camX = players[myId].x;
        camY = players[myId].y;
    } else if (!isPlaying && players[spectatorTargetId]) {
        camX = players[spectatorTargetId].x;
        camY = players[spectatorTargetId].y;
    }

    ctx.save();
    ctx.translate(canvas.width / 2 - camX, canvas.height / 2 - camY);

    ctx.fillStyle = `rgba(0,0,0,${config.voidAlpha})`;
    ctx.fillRect(camX - canvas.width, camY - canvas.height, canvas.width * 2, canvas.height * 2);

    ctx.clearRect(0, 0, 3000, 3000); 
    ctx.fillStyle = `rgba(0,0,0,${config.mapAlpha})`;
    ctx.fillRect(0, 0, 3000, 3000);

    ctx.strokeStyle = `rgba(255, 255, 255, ${config.gridAlpha})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= 3000; x += 100) { ctx.moveTo(x, 0); ctx.lineTo(x, 3000); }
    for (let y = 0; y <= 3000; y += 100) { ctx.moveTo(0, y); ctx.lineTo(3000, y); }
    ctx.stroke();

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 5;
    ctx.strokeRect(0, 0, 3000, 3000);

    food.forEach(f => {
        ctx.beginPath();
        ctx.arc(f.x, f.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = (config.foodColorType === 'solid') ? config.foodColorSolid : f.color;
        ctx.fill();
    });

    rotAngle += 0.05;

    for (let id in players) {
        const p = players[id];
        ctx.save();
        
        if (p.effect === 'glow') {
            ctx.shadowBlur = 20;
            ctx.shadowColor = p.color1;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        
        if (p.skinType === 'gradient') {
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
            grad.addColorStop(0, p.color1);
            grad.addColorStop(1, p.color2);
            ctx.fillStyle = grad;
        } else {
            ctx.fillStyle = p.color1;
        }
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (p.effect === 'star') {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(rotAngle);
            ctx.beginPath();
            ctx.strokeStyle = 'gold';
            ctx.lineWidth = 3;
            for (let i = 0; i < 5; i++) {
                ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * (p.radius + 15), Math.sin((18 + i * 72) * Math.PI / 180) * (p.radius + 15));
                ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (p.radius + 8), Math.sin((54 + i * 72) * Math.PI / 180) * (p.radius + 8));
            }
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        }

        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (p.nameColorType === 'gradient') {
            const nameGrad = ctx.createLinearGradient(p.x - 20, p.y, p.x + 20, p.y);
            nameGrad.addColorStop(0, p.nameColor1);
            nameGrad.addColorStop(1, p.nameColor2);
            ctx.fillStyle = nameGrad;
        } else {
            ctx.fillStyle = p.nameColor1 || 'white';
        }
        
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.strokeText(p.nickname, p.x, p.y);
        ctx.fillText(p.nickname, p.x, p.y);

        ctx.restore();
    }
    ctx.restore();
}