const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Bird (player)
let birdX = 80;
let birdY = 220;
let birdVelocityY = 0;

// Pipe (obstacle)
let pipeX = canvas.width;
let pipeWidth = 80;

let gap = 160;  
let minPipeHeight = 80;
let maxPipeHeight = 320;

// altura do cano de cima
let pipeTopHeight = randomPipeHeight();

// World
const groundY = 440;

let isGameOver = false;
let score = 0;

function randomPipeHeight() {
    return Math.floor(
        Math.random() * (maxPipeHeight - minPipeHeight) + minPipeHeight
    );
}

function update() {
    if (isGameOver) return;

    birdY += birdVelocityY;

    birdVelocityY /= 1.1;

    pipeX -= 3;

    if (pipeX < -pipeWidth) {
        pipeX = canvas.width;
        pipeTopHeight = randomPipeHeight();
        score += 1;
    }

    if (birdY < groundY) {
        birdY += 3;
    }

    checkCollision();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBird(birdX, birdY);
    drawPipe();
    drawScore();
}

function drawScore() {
    ctx.font = "48px arial";
    ctx.fillText(`Score: ${score}`, 10, 50);
}



function drawPipe() {
    ctx.fillStyle = "green";

    ctx.fillRect(
        pipeX,
        0,
        pipeWidth,
        pipeTopHeight
    );

    ctx.fillRect(
        pipeX,
        pipeTopHeight + gap,
        pipeWidth,
        canvas.height - (pipeTopHeight + gap)
    );
}

function drawBird(x, y) {
    ctx.fillStyle = "yellow";
    ctx.fillRect(x, y, 60, 60);
}

function drawPipe2(x, y) {
    ctx.fillStyle = "green";
    ctx.fillRect(x, y, 80, 100);
}

function rectsCollide(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function gameOver() {
    if (isGameOver) return;

    isGameOver = true;

    alert("O jogo acabou!");
    location.reload();
}

function checkCollision() {
    const birdRect = {
        x: birdX,
        y: birdY,
        width: 60,
        height: 60
    };

    const topPipeRect = {
        x: pipeX,
        y: 0,
        width: pipeWidth,
        height: pipeTopHeight
    };

    const bottomPipeRect = {
        x: pipeX,
        y: pipeTopHeight + gap,
        width: pipeWidth,
        height: canvas.height
    };

    if (
        rectsCollide(birdRect, topPipeRect) ||
        rectsCollide(birdRect, bottomPipeRect) ||
        birdY >= 440
    ) {
        gameOver();
    }
}


function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

document.addEventListener("click", () => {
    birdVelocityY = -12;
});

gameLoop();
