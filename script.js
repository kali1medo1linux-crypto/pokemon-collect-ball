const GRASS_CLASS = "grass", GRASS_COUNT = 40;
const BALL_CLASS = "pokeball", BALL_COUNT = 8;
const GOLD_BALL_CLASS = "gold-ball";

const PLAYER = document.querySelector(".player");
let playerPos = { x: 0, y: 0 };
let playerVel = { x: 0, y: 0 };

let baseSpeed = 3;
let score = 0;

const BALL_GATHER_SPEED = 7;

const SOUND = new Audio("assets/coin.mp3");

const keysPressed = new Set();
let canSpawnBalls = true;
let canSpawnGoldBall = true;

function start() {
  generateRandomElements(GRASS_CLASS, GRASS_COUNT);
  generateRandomElements(BALL_CLASS, BALL_COUNT);

  const playerWidth = PLAYER.offsetWidth || 80;
  const playerHeight = PLAYER.offsetHeight || 100;

  playerPos = {
    x: (window.innerWidth - playerWidth) / 2,
    y: (window.innerHeight - playerHeight) / 2,
  };

  setupTouchControls();
}

function updateScoreUI(amount) {
  score += amount;
  if (score < 0) score = 0;

  document.querySelector("#score span").innerText = score;
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
    generateRandomElements(BALL_CLASS, 30, true);
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

  if (keyReleased === "m") canSpawnBalls = true;
  if (keyReleased === "g") canSpawnGoldBall = true;

  updatePlayerMovement();
});

function bindTouchButton(element, keyName) {
  if (!element) return;

  const handleStart = (e) => {
    e.preventDefault();
    keysPressed.add(keyName);
    updatePlayerMovement();
  };

  const handleEnd = (e) => {
    e.preventDefault();
    keysPressed.delete(keyName);
    if (keyName === "m") canSpawnBalls = true;
    if (keyName === "g") canSpawnGoldBall = true;
    updatePlayerMovement();
  };

  element.addEventListener("touchstart", handleStart, { passive: false });
  element.addEventListener("touchend", handleEnd, { passive: false });
  element.addEventListener("mousedown", handleStart);
  element.addEventListener("mouseup", handleEnd);
}

function setupTouchControls() {
  bindTouchButton(document.getElementById("btn-up"), "arrowup");
  bindTouchButton(document.getElementById("btn-down"), "arrowdown");
  bindTouchButton(document.getElementById("btn-left"), "arrowleft");
  bindTouchButton(document.getElementById("btn-right"), "arrowright");


  const keys = document.querySelectorAll("#cheat-keyboard .key-btn");
  keys.forEach((keyBtn) => {
    const key = keyBtn.getAttribute("data-key");
    bindTouchButton(keyBtn, key);
  });
}

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

  const speedBoost = keysPressed.has("r") ? 2 : 1;
  const currentSpeed = baseSpeed * speedBoost;

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
    }
  });
}

function generateRandomElements(className, elementCount, isExtra = false) {
  for (let count = 0; count < elementCount; count++) {
    const newElement = document.createElement("div");
    newElement.classList.add(className);
    if (isExtra) {
      newElement.classList.add("extra-ball");
    }
    newElement.style.left = Math.random() * 85 + "%";
    newElement.style.top = Math.random() * 85 + "%";
    document.body.appendChild(newElement);
  }
}

function checkCollisions() {
  document.querySelectorAll(".pokeball").forEach((ball) => {
    if (collision(ball, PLAYER)) {
      updateScoreUI(10);


      if (ball.classList.contains("extra-ball")) {
        ball.remove();
      } else {

        ball.style.left = Math.random() * 85 + "%";
        ball.style.top = Math.random() * 85 + "%";
      }

      SOUND.currentTime = 0;
      SOUND.play().catch(() => {});
    }
  });

  document.querySelectorAll(".gold-ball").forEach((goldBall) => {
    if (collision(goldBall, PLAYER)) {
      updateScoreUI(500);
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