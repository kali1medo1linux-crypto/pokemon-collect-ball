const GRASS_CLASS = "grass",
  GRASS_COUNT = 50;
const BALL_CLASS = "pokeball",
  BALL_COUNT = 5;
const GOLD_BALL_CLASS = "gold-ball";

const PLAYER = document.querySelector(".player");
let playerPos = { x: 0, y: 0 };
let playerVel = { x: 0, y: 0 };
const PLAYER_SPEED = 3;
const BALL_GATHER_SPEED = 5;

let score = 0;
let scoreElement;

const SOUND = new Audio("assets/coin.mp3");

const keysPressed = new Set();
let canSpawnBalls = true;
let canSpawnGoldBall = true;

function createScoreDisplay() {
  scoreElement = document.createElement("div");
  scoreElement.style.position = "fixed";
  scoreElement.style.top = "20px";
  scoreElement.style.left = "20px";
  scoreElement.style.fontSize = "24px";
  scoreElement.style.fontWeight = "bold";
  scoreElement.style.color = "#ffffff";
  scoreElement.style.fontFamily = "sans-serif";
  scoreElement.style.textShadow = "2px 2px 4px #000000";
  scoreElement.style.zIndex = "1000";
  scoreElement.innerText = "Score: 0";
  document.body.appendChild(scoreElement);
}

function updateScore(amount) {
  score += amount;
  scoreElement.innerText = "Score: " + score;
}

function start() {
  createScoreDisplay();
  generateRandomElements(GRASS_CLASS, GRASS_COUNT);
  generateRandomElements(BALL_CLASS, BALL_COUNT);

  const playerWidth = PLAYER.offsetWidth || 80;
  const playerHeight = PLAYER.offsetHeight || 100;

  playerPos = {
    x: (window.innerWidth - playerWidth) / 2,
    y: (window.innerHeight - playerHeight) / 2,
  };
}

function update() {
  playerPos.x += playerVel.x;
  playerPos.y += playerVel.y;

  const playerWidth = PLAYER.offsetWidth || 80;
  const playerHeight = PLAYER.offsetHeight || 100;

  const maxX = window.innerWidth - playerWidth;
  const maxY = window.innerHeight - playerHeight;

  playerPos.x = Math.max(0, Math.min(playerPos.x, maxX));
  playerPos.y = Math.max(0, Math.min(playerPos.y, maxY));

  PLAYER.style.left = playerPos.x + "px";
  PLAYER.style.top = playerPos.y + "px";

  if (keysPressed.has("c")) {
    gatherBallsToPlayer();
  }

  if (keysPressed.has("m") && canSpawnBalls) {
    generateRandomElements(BALL_CLASS, 100);
    canSpawnBalls = false;
  }

  if (keysPressed.has("g") && canSpawnGoldBall) {
    generateRandomElements(GOLD_BALL_CLASS, 1);
    canSpawnGoldBall = false;
  }

  checkCollisions();

  requestAnimationFrame(update);
}

window.addEventListener("keydown", (e) => {
  keysPressed.add(e.key.toLowerCase());
  updatePlayerMovement();
});

window.addEventListener("keyup", (e) => {
  const keyReleased = e.key.toLowerCase();
  keysPressed.delete(keyReleased);

  if (keyReleased === "m") {
    canSpawnBalls = true;
  }
  if (keyReleased === "g") {
    canSpawnGoldBall = true;
  }

  updatePlayerMovement();
});

function updatePlayerMovement() {
  let moveX = 0;
  let moveY = 0;

  if (keysPressed.has("arrowup")) {
    moveY = -1;
    PLAYER.style.backgroundImage = "url('assets/player_back.png')";
  }
  if (keysPressed.has("arrowdown")) {
    moveY = 1;
    PLAYER.style.backgroundImage = "url('assets/player_front.png')";
  }
  if (keysPressed.has("arrowleft")) {
    moveX = -1;
    PLAYER.style.backgroundImage = "url('assets/player_left.png')";
  }
  if (keysPressed.has("arrowright")) {
    moveX = 1;
    PLAYER.style.backgroundImage = "url('assets/player_right.png')";
  }

  const isMoving = moveX !== 0 || moveY !== 0;

  if (moveX !== 0 && moveY !== 0) {
    moveX *= 0.7071;
    moveY *= 0.7071;
  }

  const speedMultiplier = keysPressed.has("r") ? 5 : 1;
  const currentSpeed = PLAYER_SPEED * speedMultiplier;

  playerVel.x = moveX * currentSpeed;
  playerVel.y = moveY * currentSpeed;

  if (isMoving) {
    PLAYER.classList.add("walk");
  } else {
    PLAYER.classList.remove("walk");
  }
}

function gatherBallsToPlayer() {
  const playerRect = PLAYER.getBoundingClientRect();
  const targetX = playerRect.left + playerRect.width / 2;
  const targetY = playerRect.top + playerRect.height / 2;

  const balls = document.querySelectorAll(".pokeball, .gold-ball");

  balls.forEach((ball) => {
    const rect = ball.getBoundingClientRect();
    const currentX = rect.left + rect.width / 2;
    const currentY = rect.top + rect.height / 2;

    const dx = targetX - currentX;
    const dy = targetY - currentY;
    const distance = Math.hypot(dx, dy);

    if (distance > BALL_GATHER_SPEED) {
      const stepX = (dx / distance) * BALL_GATHER_SPEED;
      const stepY = (dy / distance) * BALL_GATHER_SPEED;

      ball.style.left = rect.left + stepX + "px";
      ball.style.top = rect.top + stepY + "px";
    } else {
      ball.style.left = targetX - rect.width / 2 + "px";
      ball.style.top = targetY - rect.height / 2 + "px";
    }
  });
}

function generateRandomElements(className, elementCount) {
  for (let count = 0; count < elementCount; count++) {
    const newElement = document.createElement("div");
    newElement.classList.add(className);
    newElement.style.left = Math.random() * 85 + "%";
    newElement.style.top = Math.random() * 85 + "%";
    document.body.appendChild(newElement);
  }
}

function checkCollisions() {

  const balls = document.querySelectorAll(".pokeball");
  balls.forEach((ball) => {
    if (collision(ball, PLAYER)) {
      updateScore(1);

      if (document.querySelectorAll(".pokeball").length > BALL_COUNT) {
        ball.remove();
      } else {
        ball.style.left = Math.random() * 85 + "%";
        ball.style.top = Math.random() * 85 + "%";
      }
      SOUND.currentTime = 0;
      SOUND.play().catch(() => {});
    }
  });

  const goldBalls = document.querySelectorAll(".gold-ball");
  goldBalls.forEach((goldBall) => {
    if (collision(goldBall, PLAYER)) {
      updateScore(500);
      goldBall.remove();
      SOUND.currentTime = 0;
      SOUND.play().catch(() => {});
    }
  });
}

function collision($div1, $div2) {
  const r1 = $div1.getBoundingClientRect();
  const r2 = $div2.getBoundingClientRect();

  return !(
    r1.bottom < r2.top ||
    r1.top > r2.bottom ||
    r1.right < r2.left ||
    r1.left > r2.right
  );
}

start();
update();