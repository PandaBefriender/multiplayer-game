const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerNameInput = document.getElementById('playerNameInput');
const joinGameButton = document.getElementById('joinGameButton');

const playersRef = database.ref('players');
let localPlayerId = null;
const players = {};
const PLAYER_SIZE = 30;

// Handle joining the game
joinGameButton.addEventListener('click', () => {
    const name = playerNameInput.value.trim() || 'Anonymous';
    if (name) {
        localPlayerId = firebase.database().ref().child('players').push().key; // Generate unique ID
        const playerRef = playersRef.child(localPlayerId);
        
        playerRef.set({
            name: name,
            x: Math.random() * (canvas.width - PLAYER_SIZE),
            y: canvas.height - PLAYER_SIZE - 10,
            color: `#${Math.floor(Math.random()*16777215).toString(16)}`
        });

        // Remove player from Firebase when they disconnect
        playerRef.onDisconnect().remove();

        // Hide controls and start game loop
        document.getElementById('controls').style.display = 'none';
        gameLoop();
    }
});

// Sync player data from Firebase
playersRef.onValue((snapshot) => {
    const playersData = snapshot.val();
    Object.keys(playersData).forEach(id => {
        players[id] = playersData[id];
    });
});

// Handle input (simple movement for demonstration, not a full platformer)
document.addEventListener('keydown', (e) => {
    if (!localPlayerId) return;

    const playerRef = playersRef.child(localPlayerId);
    let {x, y} = players[localPlayerId];
    const speed = 5;

    switch(e.key) {
        case 'ArrowLeft':
            x -= speed;
            break;
        case 'ArrowRight':
            x += speed;
            break;
        // Platformer physics (jumping, gravity) requires a game engine or more complex logic
    }

    // Constrain within canvas
    x = Math.max(0, Math.min(canvas.width - PLAYER_SIZE, x));
    y = Math.max(0, Math.min(canvas.height - PLAYER_SIZE, y));

    // Update position in Firebase
    playerRef.update({ x, y });
});

// Game loop for rendering
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw players
    Object.keys(players).forEach(id => {
        const player = players[id];
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
        ctx.fillStyle = 'black';
        ctx.fillText(player.name, player.x, player.y - 5);
    });

    requestAnimationFrame(gameLoop);
}
