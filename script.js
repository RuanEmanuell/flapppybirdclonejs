const dpr = window.devicePixelRatio || 1;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const logicalWidth = 360;
const logicalHeight = 640;

canvas.width = logicalWidth * dpr;
canvas.height = logicalHeight * dpr;

canvas.style.width = logicalWidth + "px";
canvas.style.height = logicalHeight + "px";

ctx.scale(dpr, dpr);

const scale = Math.min(window.innerWidth / 360, window.innerHeight / 640, 1.5);
canvas.style.transform = `scale(${scale})`;

const TARGET_FPS = 60;
const FRAME_TIME = 1000 / TARGET_FPS;

let lastTime = 0;
let accumulator = 0;

/* ================= IMAGENS ================= */
const birdImg = new Image();
birdImg.src = "./public/bird.png";

const pipeImg = new Image();
pipeImg.src = "./public/pipe.png";

const floorImg = new Image();
floorImg.src = "./public/floor.png";

const backgroundImg = new Image();
backgroundImg.src = "./public/background.png";

/* ================= SONS ================= */
const AudioContextClass = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContextClass();

let flapBuffer;
let scoreBuffer;

async function loadSound(url) {
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  return await audioCtx.decodeAudioData(arrayBuffer);
}

Promise.all([
  loadSound("./public/sounds/flap.mp3"),
  loadSound("./public/sounds/score.mp3")
]).then(([flap, score]) => {
  flapBuffer = flap;
  scoreBuffer = score;
});

function playSound(buffer, volume = 1) {
  if (!buffer || audioCtx.state !== "running") return;

  const source = audioCtx.createBufferSource();
  source.buffer = buffer;

  const gain = audioCtx.createGain();
  gain.gain.value = volume;

  source.connect(gain);
  gain.connect(audioCtx.destination);

  source.start(0);
}


/* ================= WORLD ================= */
const FLOOR_HEIGHT = 120;
const groundY = logicalHeight - FLOOR_HEIGHT;

let floorX = 0;
let bgX = 0;

let score = 0;
let isGameOver = false;

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
  x: logicalWidth,
  width: 70,
  gap: 120,
  topHeight: randomPipeHeight()
};

/* ================= UTILS ================= */
function randomPipeHeight() {
  const min = 80;
  const max = groundY - 120 - min;
  return Math.floor(Math.random() * (max - min) + min);
}

/* ================= UPDATE ================= */
function update() {
  if (isGameOver) return;

  bgX -= 0.5;
  if (bgX <= -logicalWidth) bgX = 0;

  floorX -= 2;
  if (floorX <= -logicalWidth) floorX = 0;

  bird.vy += 0.5;
  bird.y += bird.vy;

  pipe.x -= 3 + score * 0.2;
  if (pipe.x + pipe.width < 0) {
    pipe.x = logicalWidth;
    pipe.topHeight = randomPipeHeight();
    score++;
  playSound(scoreBuffer);
  }

  checkCollision();
}

/* ================= DRAW ================= */
function draw() {
  if (isGameOver) {
    drawGameOver();
    return;
  }

  ctx.clearRect(0, 0, logicalWidth, logicalHeight);

  ctx.drawImage(backgroundImg, bgX, 0, logicalWidth + 5, logicalHeight);
  ctx.drawImage(backgroundImg, bgX + logicalWidth, 0, logicalWidth, logicalHeight);

  drawPipes();

  ctx.drawImage(birdImg, bird.x, bird.y, bird.w, bird.h);

  ctx.drawImage(floorImg, floorX, groundY, logicalWidth + 5, 120);
  ctx.drawImage(floorImg, floorX + logicalWidth, groundY, logicalWidth, 120);

  ctx.font = "32px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  const text = `${score}`;
  const x = logicalWidth / 2;
  const y = 40;

  ctx.lineWidth = 4;
  ctx.strokeStyle = "black";
  ctx.strokeText(text, x, y);

  ctx.fillStyle = "orange";
  ctx.fillText(text, x, y);
}

/* ================= PIPES ================= */
function drawPipes() {
  ctx.save();
  ctx.translate(pipe.x, pipe.topHeight);
  ctx.scale(1, -1);
  ctx.drawImage(pipeImg, 0, 0, pipe.width, pipe.topHeight);
  ctx.restore();

  const bottomY = pipe.topHeight + pipe.gap;
  const bottomHeight = groundY - bottomY;

  ctx.drawImage(pipeImg, pipe.x, bottomY, pipe.width, bottomHeight);
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
}

function drawGameOver() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, 0, logicalWidth, logicalHeight);

  ctx.font = "48px Arial Black";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.lineWidth = 4;
  ctx.strokeStyle = "black";
  ctx.strokeText("GAME OVER", logicalWidth / 2, logicalHeight / 2);

  ctx.fillStyle = "red";
  ctx.fillText("GAME OVER", logicalWidth / 2, logicalHeight / 2);

  ctx.font = "18px Arial";

  ctx.fillStyle = "orange";

  ctx.fillText(
    `Score: ${score} pontos`,
    logicalWidth / 2,
    logicalHeight / 2 + 30
  );

  ctx.fillStyle = "white";

  ctx.fillText(
    "Clique para reiniciar",
    logicalWidth / 2,
    logicalHeight / 2 + 50
  );
}

function resetGame() {
  // BIRD
  bird.x = 80;
  bird.y = 150;
  bird.vy = 0;

  // PIPE
  pipe.x = logicalWidth;
  pipe.topHeight = randomPipeHeight();

  // WORLD
  bgX = 0;
  floorX = 0;

  // STATE
  score = 0;
  isGameOver = false;
}


/* ================= LOOP ================= */
function loop(time) {
  if (!lastTime) lastTime = time;

  const delta = time - lastTime;
  lastTime = time;

  accumulator += delta;

  while (accumulator >= FRAME_TIME) {
    update();          
    accumulator -= FRAME_TIME;
  }

  draw();              

  requestAnimationFrame(loop);
}


/* ================= INPUT ================= */
document.addEventListener("click", () => {
  if (isGameOver) {
    resetGame();
    return;
  }

  playSound(flapBuffer, 0.6);
  bird.vy = -6;
});

document.addEventListener("click", () => {
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}, { once: true });


requestAnimationFrame(loop);
