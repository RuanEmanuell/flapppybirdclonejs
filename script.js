const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 500;
canvas.height = 500;

/* ================= IMAGENS ================= */
const birdImg = new Image();
birdImg.src = "./public/bird.png";

const pipeImg = new Image();
pipeImg.src = "./public/pipe.png"; // PIPE DE CIMA

const floorImg = new Image();
floorImg.src = "./public/floor.png";

const backgroundImg = new Image();
backgroundImg.src = "./public/background.png";

/* ================= BIRD ================= */
let bird = {
  x: 80,
  y: 150,
  w: 40,
  h: 30,
  vy: 0
};

/* ================= PIPE ================= */
let pipe = {
  x: canvas.width,
  width: 70,
  gap: 120,
  topHeight: randomPipeHeight()
};

/* ================= WORLD ================= */
const groundY = 430;
let floorX = 0;
let bgX = 0;

let score = 0;
let isGameOver = false;

/* ================= UTILS ================= */
function randomPipeHeight() {
  return Math.floor(Math.random() * (300 - 60) + 60);
}

/* ================= UPDATE ================= */
function update() {
  if (isGameOver) return;

  // Background
  bgX -= 0.5;
  if (bgX <= -canvas.width) bgX = 0;

  // Floor
  floorX -= 2;
  if (floorX <= -canvas.width) floorX = 0;

  // Bird
  bird.vy += 0.05;
  bird.y += bird.vy;

  // Pipe
  pipe.x -= 2 + (score * 0.2);
  if (pipe.x + pipe.width < 0) {
    pipe.x = canvas.width;
    pipe.topHeight = randomPipeHeight();
    score++;
  }

  checkCollision();
}

/* ================= DRAW ================= */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.drawImage(backgroundImg, bgX, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImg, bgX + canvas.width, 0, canvas.width, canvas.height);

  // Pipes
  drawPipes();

  // Bird
  ctx.drawImage(birdImg, bird.x, bird.y, bird.w, bird.h);

  // Floor
  ctx.drawImage(floorImg, floorX, groundY, canvas.width + 20, 120);
  ctx.drawImage(floorImg, floorX + canvas.width, groundY, canvas.width + 20, 120);

    //Score
    ctx.font = "32px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    const text = `${score}`;
    const x = canvas.width / 2;
    const y = 40;

    ctx.lineWidth = 4;
    ctx.strokeStyle = "black";
    ctx.strokeText(text, x, y);

    ctx.fillStyle = "orange";
    ctx.fillText(text, x, y);
}

/* ================= PIPES ================= */
function drawPipes() {
  // PIPE DE CIMA (invertido)
  ctx.save();
  ctx.translate(pipe.x, pipe.topHeight);
  ctx.scale(1, -1);
  ctx.drawImage(
    pipeImg,
    0,
    0,
    pipe.width,
    pipe.topHeight
  );
  ctx.restore();

  // PIPE DE BAIXO (normal)
  const bottomY = pipe.topHeight + pipe.gap;
  const bottomHeight = groundY - bottomY;

  ctx.drawImage(
    pipeImg,
    pipe.x,
    bottomY,
    pipe.width,
    bottomHeight
  );
}


/* ================= COLLISION ================= */
function rectsCollide(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function checkCollision() {
  const topPipe = {
    x: pipe.x,
    y: 0,
    w: pipe.width,
    h: pipe.topHeight
  };

  const bottomPipe = {
    x: pipe.x,
    y: pipe.topHeight + pipe.gap,
    w: pipe.width,
    h: groundY - (pipe.topHeight + pipe.gap)
  };

  if (
    rectsCollide(bird, topPipe) ||
    rectsCollide(bird, bottomPipe) ||
    bird.y + bird.h >= groundY
  ) {
    gameOver();
  }
}

/* ================= GAME OVER ================= */
function gameOver() {
  isGameOver = true;
  alert("Game Over");
  location.reload();
}

/* ================= LOOP ================= */
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

/* ================= INPUT ================= */
document.addEventListener("click", () => {
  bird.vy = -2.5;
});

loop();
