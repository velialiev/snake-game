// settings
const BLOCK_W = 10;
const BLOCK_H = 10;
const GAME_AREA_COLOR = '#000';
const SNAKE_COLOR = '#099f00';
const DEFAULT_MOVE_SPEED = 5;
const SCORE_UP_RATE = 1;
const SPEED_UP_RATE = 1;

const GAME_AREA = document.querySelector('#game-area');
const CTX = GAME_AREA.getContext('2d');
const SCORE_FIELD = document.querySelector('.score');
const PAUSE_BTN = document.querySelector('.pause');
const RESTART_BTN = document.querySelector('.restart');
const W = GAME_AREA.width;
const H = GAME_AREA.height;
const X = 0;
const Y = 0;
const GAME_OVER_IMAGE = new Image();
GAME_OVER_IMAGE.src = 'img/game-over.png';
const BG_AUDIO = new Audio('audio/audio.mp3');
const EATING_AUDIO = new Audio('audio/jump.mp3');
const DEFAULT_SNAKE = [
    {x: BLOCK_W * 4, y: 0},
    {x: BLOCK_W * 3, y: 0},
    {x: BLOCK_W * 2, y: 0},
    {x: BLOCK_W, y: 0},
    {x: 0, y: 0}
];

let game;
let moveSpeed = DEFAULT_MOVE_SPEED;
let snake = DEFAULT_SNAKE;
let food = {x: 0, y: 0};
let dx = BLOCK_W;
let dy = 0;
let score = 0;
let isPaused = false;
let isPlaying = false;

const drawGameArea = () => {
    CTX.fillStyle = GAME_AREA_COLOR;
    CTX.fillRect(X, Y, W, H);
};

const drawSnake = () => {
    snake.forEach(block => drawBlock(block));
};

const drawBlock = (block) => {
    CTX.beginPath();
    CTX.moveTo(block.x, block.y);
    CTX.lineTo(block.x + 0, block.y + BLOCK_H);
    CTX.lineTo(block.x + BLOCK_W, block.y + BLOCK_H);
    CTX.lineTo(block.x + BLOCK_W, block.y + 0);
    CTX.lineTo(block.x + 0, block.y + 0);
    CTX.fillStyle = SNAKE_COLOR;
    if (snake.indexOf(block) === 0) {
        CTX.fillStyle = 'red'
    }
    if (snake.indexOf(block) === -1) {
        CTX.fillStyle = 'blue'
    }
    CTX.fill();
};

const move = () => {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);
    snake.pop();

    if (isCrashed()) {
        gameOver();
        return;
    }
    if (isAte()) {
        foodAte();
    }

    drawGameArea();
    drawSnake();
    drawBlock(food);
};

const changeMoveDirection = (e) => {
    const key = e.key;

    if (key === 'ArrowUp' && !isGoingDown()) {
        dx = 0;
        dy = -BLOCK_H;
    }
    if (key === 'ArrowDown' && !isGoingUp()) {
        dx = 0;
        dy = BLOCK_H;
    }
    if (key === 'ArrowLeft' && !isGoingRight()) {
        dx = -BLOCK_W;
        dy = 0;
    }
    if (key === 'ArrowRight' && !isGoingLeft()) {
        dx = BLOCK_W;
        dy = 0;
    }
};

const createFood = () => {
    food.x = getRandom(0, W - 10);
    food.y = getRandom(0, H - 10);
};

const foodAte = () => {
    EATING_AUDIO.play();
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);
    createFood();
    moveSpeed += SPEED_UP_RATE;
    clearInterval(game);
    game = setInterval(move, getMoveInterval());
    score += SCORE_UP_RATE;
    setScore(score);
};

const startGame = () => {
    isPlaying = true;
    clearGameArea();
    drawGameArea();
    drawSnake();
    game = setInterval(move, getMoveInterval());
    createFood();
    drawBlock(food);
};

const gameOver = () => {
    isPlaying = false;
    clearInterval(game);
    clearGameArea();
    CTX.drawImage(GAME_OVER_IMAGE, 0, 0);
    CTX.fillStyle = 'white';
    CTX.font = '30px Arial';
    CTX.fillText('Press R to restart game', 150, 50);
};

const restart = () => {
    playAudio();
    resetVariables();
    clearInterval(game);
    startGame();
};
const pause = () => {
    if (!isPlaying) return;

    isPaused = !isPaused;

    if (isPaused) {
        clearInterval(game);
        PAUSE_BTN.innerHTML = 'Play <span>Press Space</span>';
        document.removeEventListener('keydown', changeMoveDirection);
        CTX.fillStyle = 'white';
        CTX.font = '30px Arial';
        CTX.fillText('Press SPACE to continue game', 90, 50);
    } else {
        drawSnake();
        game = setInterval(move, getMoveInterval());
        PAUSE_BTN.innerHTML = 'Pause <span>Press Space</span>';
        document.addEventListener('keydown', changeMoveDirection);
    }
};

const setScore = (score) => {
    SCORE_FIELD.innerHTML = score.toString();
};

const isAte = () => {
    return snake[0].x === food.x && snake[0].y === food.y;
};

const isCrashed = () => {
    let isCrossed = false;
    snake.forEach((b, index) => {
        if (index === 0) return;
        if (snake[0].x === b.x && snake[0].y === b.y) {
            isCrossed = true;
        }
    });
    return snake[0].x >= W || snake[0].x < 0 || snake[0].y >= H || snake[0].y < 0 || isCrossed;
};

const resetVariables = () => {
    score = 0;
    setScore(score);
    snake = [
        {x: 40, y: 0},
        {x: 30, y: 0},
        {x: 20, y: 0},
        {x: 10, y: 0},
        {x: 0, y: 0}
    ];
    moveSpeed = DEFAULT_MOVE_SPEED;
    dx = BLOCK_W;
    dy = 0;
    if (isPaused) pause(); // unpausing
    isPaused = false;
    isPlaying = false;
};
const clearGameArea = () => CTX.clearRect(X, Y, W, H);

const getMoveInterval = () => 1000 / moveSpeed;

const getRandom = (min, max) => Math.round((Math.random() * (max - min) + min) / BLOCK_W) * BLOCK_W;

isGoingUp = () => dy === -BLOCK_H;
isGoingDown = () => dy === BLOCK_H;
isGoingLeft = () => dx === -BLOCK_W;
isGoingRight = () => dx === BLOCK_W;

async function playAudio() {
    try {
        await BG_AUDIO.play()
    } catch(e) {
        console.log('An error occurred with playing sound!');
        console.log(e);
    }
}

const showIntroductoryMsg = () => {
    CTX.fillStyle = 'white';
    CTX.font = '30px Arial';
    CTX.fillText('Press R to start game', 150, 50);
    CTX.font = '20px Arial';
    CTX.fillText('Use arrows to control Snake', 160, 85);
    CTX.fillText('Be prepared that we are using loud music in game!', 70, 140);
};

document.addEventListener('keydown', changeMoveDirection);
RESTART_BTN.addEventListener('click', restart);
PAUSE_BTN.addEventListener('click', pause);
document.addEventListener('keydown', e => e.code === 'Space' ? pause() : e.code === 'KeyR' ? restart() : null);

showIntroductoryMsg();
