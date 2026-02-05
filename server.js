const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const MAP_WIDTH = 3000;
const MAP_HEIGHT = 3000;
const MAX_FOOD = 300;

let players = {};
let food = [];
let sockets = {};
let nameList = ['Invitado', 'SinNombre', 'Jugador', 'Anonimo', 'Bola'];

const listPath = path.join(__dirname, 'public', 'namelists.txt');
if (fs.existsSync(listPath)) {
    try {
        const data = fs.readFileSync(listPath, 'utf-8');
        const lines = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        if (lines.length > 0) {
            nameList = lines;
        }
    } catch (err) {
        console.log("No se pudo leer namelists.txt, usando defecto.");
    }
}

function spawnFood() {
    return {
        x: Math.floor(Math.random() * MAP_WIDTH),
        y: Math.floor(Math.random() * MAP_HEIGHT),
        color: `hsl(${Math.random() * 360}, 100%, 50%)`,
        id: Math.random().toString(36).substr(2, 9)
    };
}

for (let i = 0; i < MAX_FOOD; i++) food.push(spawnFood());

app.use(express.static('public'));

io.on('connection', (socket) => {
    sockets[socket.id] = socket;

    socket.on('join_game', (data) => {
        let cleanName = data.nickname ? data.nickname.trim() : '';
        
        if (cleanName === '') {
            cleanName = nameList[Math.floor(Math.random() * nameList.length)];
        }

        if (cleanName.length > 12) cleanName = cleanName.substring(0, 12);

        players[socket.id] = {
            id: socket.id,
            x: Math.floor(Math.random() * MAP_WIDTH),
            y: Math.floor(Math.random() * MAP_HEIGHT),
            radius: 20,
            score: 0,
            nickname: cleanName,
            skinType: data.skinType,
            color1: data.color1,
            color2: data.color2,
            nameColorType: data.nameColorType,
            nameColor1: data.nameColor1,
            nameColor2: data.nameColor2,
            effect: data.effect,
            angle: 0
        };
        socket.emit('game_started', { id: socket.id });
    });

    socket.on('mouse_move', (data) => {
        const player = players[socket.id];
        if (player) {
            const dx = data.x - (data.screenWidth / 2);
            const dy = data.y - (data.screenHeight / 2);
            player.angle = Math.atan2(dy, dx);
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        delete sockets[socket.id];
    });
});

setInterval(() => {
    const leaderboard = Object.values(players)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(p => ({ name: p.nickname, score: Math.floor(p.score) }));

    const playerList = Object.values(players).map(p => p.nickname);

    for (let id in players) {
        const p = players[id];
        if (p.angle !== undefined) {
            const speed = 500 / (p.radius + 50) + 2;
            p.x += Math.cos(p.angle) * speed;
            p.y += Math.sin(p.angle) * speed;
            p.x = Math.max(0, Math.min(MAP_WIDTH, p.x));
            p.y = Math.max(0, Math.min(MAP_HEIGHT, p.y));
        }

        food = food.filter(f => {
            const dist = Math.hypot(p.x - f.x, p.y - f.y);
            if (dist < p.radius) {
                p.radius += 0.5;
                p.score += 1;
                return false;
            }
            return true;
        });
    }

    while (food.length < MAX_FOOD) {
        food.push(spawnFood());
    }

    const playerIds = Object.keys(players);
    for (let i = 0; i < playerIds.length; i++) {
        for (let j = 0; j < playerIds.length; j++) {
            if (i === j) continue;
            const p1 = players[playerIds[i]];
            const p2 = players[playerIds[j]];
            if (!p1 || !p2) continue;

            const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
            if (p1.radius > p2.radius * 1.1 && dist < p1.radius) {
                p1.radius += p2.radius * 0.2;
                p2.radius = 0;
                if (sockets[playerIds[j]]) {
                    sockets[playerIds[j]].emit('dead', 'Te comieron.');
                }
                delete players[playerIds[j]];
            }
        }
    }

    io.emit('state_update', { players, food, leaderboard, playerList });

}, 1000 / 25);

http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});