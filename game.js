const GRID_SIZE = 6;
const GAME_TIME = 45;
const FLOWERS = ['🌹', '🌷', '🌻', '🍁'];
const MAX_CASCADES = 3;
const MATCH_DELAY = 300;
const DROP_DELAY = 200;

let score = 0;
let timer = GAME_TIME;
let isPlaying = false;
let selectedCell = null;
let timerInterval;
let board = [];
let cascadeCount = 0;
let isProcessing = false;

function initializeGame() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    board = [];
    cascadeCount = 0;
    isProcessing = false;

    // Создаем доску
    for (let i = 0; i < GRID_SIZE; i++) {
        board[i] = [];
        for (let j = 0; j < GRID_SIZE; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            board[i][j] = generateRandomFlower();
            cell.textContent = board[i][j];
            cell.addEventListener('click', handleCellClick);
            gameBoard.appendChild(cell);
        }
    }
    
    // Убираем начальные совпадения
    while (findMatches().size > 0) {
        shuffleBoard();
    }
    updateBoardDisplay();
}

function generateRandomFlower() {
    return FLOWERS[Math.floor(Math.random() * FLOWERS.length)];
}

function shuffleBoard() {
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            board[i][j] = generateRandomFlower();
        }
    }
}

function startGame() {
    score = 0;
    timer = GAME_TIME;
    isPlaying = true;
    isProcessing = false;
    updateScore();
    updateTimer();
    initializeGame();

    if (timerInterval) {
        clearInterval(timerInterval);
    }
    timerInterval = setInterval(() => {
        timer--;
        updateTimer();
        if (timer <= 0) {
            endGame();
        }
    }, 1000);
}

function endGame() {
    isPlaying = false;
    clearInterval(timerInterval);
    timerInterval = null;
    alert(`Игра окончена! Ваш счет: ${score}`);
}

function updateScore() {
    document.getElementById('scoreDisplay').textContent = score;
}

function updateTimer() {
    document.getElementById('timeDisplay').textContent = timer;
}

async function handleCellClick(event) {
    if (!isPlaying || isProcessing) return;

    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    if (selectedCell === null) {
        selectedCell = { row, col };
        event.target.classList.add('selected');
    } else {
        const previousCell = document.querySelector(
            `.cell[data-row="${selectedCell.row}"][data-col="${selectedCell.col}"]`
        );
        previousCell.classList.remove('selected');

        if (isAdjacent(selectedCell, { row, col })) {
            isProcessing = true;
            await makeMove(selectedCell, { row, col });
            isProcessing = false;
        }
        selectedCell = null;
    }
}

function isAdjacent(cell1, cell2) {
    return (
        (Math.abs(cell1.row - cell2.row) === 1 && cell1.col === cell2.col) ||
        (Math.abs(cell1.col - cell2.col) === 1 && cell1.row === cell2.row)
    );
}

async function makeMove(cell1, cell2) {
    swapCells(cell1, cell2);
    
    if (!(await processCascade())) {
        swapCells(cell1, cell2);
        updateBoardDisplay();
    }
}

function swapCells(cell1, cell2) {
    const temp = board[cell1.row][cell1.col];
    board[cell1.row][cell1.col] = board[cell2.row][cell2.col];
    board[cell2.row][cell2.col] = temp;
    updateBoardDisplay();
}

async function processCascade() {
    cascadeCount = 0;
    let hasMatched = false;

    while (cascadeCount < MAX_CASCADES) {
        const matches = findMatches();
        if (matches.size === 0) break;

        hasMatched = true;
        cascadeCount++;

        // Анимация и удаление совпадений
        await animateMatches(matches);
        removeMatches(matches);
        await delay(MATCH_DELAY);

        // Падение и заполнение
        await dropCells();
        fillEmptyCells();
        updateBoardDisplay();
        await delay(DROP_DELAY);
    }

    return hasMatched;
}

function findMatches() {
    const matches = new Set();

    // Проверка горизонтальных совпадений
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE - 2; j++) {
            if (board[i][j] &&
                board[i][j] === board[i][j + 1] &&
                board[i][j] === board[i][j + 2]) {
                matches.add(`${i},${j}`);
                matches.add(`${i},${j + 1}`);
                matches.add(`${i},${j + 2}`);
                
                // Проверяем дополнительные совпадения
                if (j + 3 < GRID_SIZE && board[i][j] === board[i][j + 3]) {
                    matches.add(`${i},${j + 3}`);
                    if (j + 4 < GRID_SIZE && board[i][j] === board[i][j + 4]) {
                        matches.add(`${i},${j + 4}`);
                    }
                }
            }
        }
    }

    // Проверка вертикальных совпадений
    for (let j = 0; j < GRID_SIZE; j++) {
        for (let i = 0; i < GRID_SIZE - 2; i++) {
            if (board[i][j] &&
                board[i][j] === board[i + 1][j] &&
                board[i][j] === board[i + 2][j]) {
                matches.add(`${i},${j}`);
                matches.add(`${i + 1},${j}`);
                matches.add(`${i + 2},${j}`);
                
                // Проверяем дополнительные совпадения
                if (i + 3 < GRID_SIZE && board[i][j] === board[i + 3][j]) {
                    matches.add(`${i + 3},${j}`);
                    if (i + 4 < GRID_SIZE && board[i][j] === board[i + 4][j]) {
                        matches.add(`${i + 4},${j}`);
                    }
                }
            }
        }
    }

    return matches;
}

async function animateMatches(matches) {
    matches.forEach(match => {
        const [row, col] = match.split(',').map(Number);
        const cell = document.querySelector(
            `.cell[data-row="${row}"][data-col="${col}"]`
        );
        cell.classList.add('matched');
    });
    await delay(300);
}

function removeMatches(matches) {
    matches.forEach(match => {
        const [row, col] = match.split(',').map(Number);
        board[row][col] = null;
    });
    score += matches.size * 100 * cascadeCount;
    updateScore();
}

async function dropCells() {
    for (let col = 0; col < GRID_SIZE; col++) {
        let emptyRow = GRID_SIZE - 1;
        for (let row = GRID_SIZE - 1; row >= 0; row--) {
            if (board[row][col] !== null) {
                if (emptyRow !== row) {
                    board[emptyRow][col] = board[row][col];
                    board[row][col] = null;
                    const cell = document.querySelector(
                        `.cell[data-row="${emptyRow}"][data-col="${col}"]`
                    );
                    cell.style.animation = `drop ${DROP_DELAY}ms ease-in`;
                }
                emptyRow--;
            }
        }
    }
    await delay(DROP_DELAY);
}

function fillEmptyCells() {
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (board[i][j] === null) {
                board[i][j] = generateRandomFlower();
                const cell = document.querySelector(
                    `.cell[data-row="${i}"][data-col="${j}"]`
                );
                cell.style.animation = `drop ${DROP_DELAY}ms ease-in`;
            }
        }
    }
}

function updateBoardDisplay() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        cell.textContent = board[row][col];
        cell.classList.remove('matched');
    });
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
    document.getElementById('startButton').addEventListener('click', startGame);
});
