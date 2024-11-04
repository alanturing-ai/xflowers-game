const GRID_SIZE = 6;
const GAME_TIME = 45;
const FLOWERS = ['🌹', '🌷', '🌻', '🍁'];

let score = 0;
let timer = GAME_TIME;
let isPlaying = false;
let selectedCell = null;
let timerInterval;
let board = [];

// Инициализация игры
function initializeGame() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    board = [];

    // Создаем доску
    for (let i = 0; i < GRID_SIZE; i++) {
        board[i] = [];
        for (let j = 0; j < GRID_SIZE; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            board[i][j] = getRandomFlower();
            cell.textContent = board[i][j];
            cell.addEventListener('click', handleCellClick);
            gameBoard.appendChild(cell);
        }
    }

    // Убираем начальные совпадения
    while (hasMatches()) {
        shuffleBoard();
        updateBoard();
    }
}

function getRandomFlower() {
    return FLOWERS[Math.floor(Math.random() * FLOWERS.length)];
}

function shuffleBoard() {
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            board[i][j] = getRandomFlower();
        }
    }
}

function updateBoard() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        cell.textContent = board[row][col];
        cell.classList.remove('matched');
    });
}

// Управление игрой
function startGame() {
    score = 0;
    timer = GAME_TIME;
    isPlaying = true;
    updateScore();
    updateTimer();
    initializeGame();

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timer--;
        updateTimer();
        if (timer <= 0) endGame();
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

// Обработка кликов
function handleCellClick(event) {
    if (!isPlaying) return;

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
            swapCells(selectedCell, { row, col });
            if (!checkAndProcessMatches()) {
                setTimeout(() => {
                    swapCells(selectedCell, { row, col });
                    updateBoard();
                }, 300);
            }
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

function swapCells(cell1, cell2) {
    const temp = board[cell1.row][cell1.col];
    board[cell1.row][cell1.col] = board[cell2.row][cell2.col];
    board[cell2.row][cell2.col] = temp;
    updateBoard();
}

// Проверка совпадений
function hasMatches() {
    // Проверка горизонтальных совпадений
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE - 2; j++) {
            if (board[i][j] && 
                board[i][j] === board[i][j + 1] && 
                board[i][j] === board[i][j + 2]) {
                return true;
            }
        }
    }

    // Проверка вертикальных совпадений
    for (let i = 0; i < GRID_SIZE - 2; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (board[i][j] && 
                board[i][j] === board[i + 1][j] && 
                board[i][j] === board[i + 2][j]) {
                return true;
            }
        }
    }

    return false;
}

function checkAndProcessMatches() {
    let matched = false;
    let matchCount = 0;

    do {
        const matches = findMatches();
        if (matches.size === 0) break;

        matched = true;
        matchCount++;

        // Удаляем совпадения
        matches.forEach(match => {
            const [row, col] = match.split(',').map(Number);
            const cell = document.querySelector(
                `.cell[data-row="${row}"][data-col="${col}"]`
            );
            cell.classList.add('matched');
            board[row][col] = null;
        });

        score += matches.size * 100 * matchCount;
        updateScore();

        // Даем время на анимацию
        setTimeout(() => {
            dropCells();
            fillEmptyCells();
            updateBoard();
        }, 300);

    } while (matchCount < 3 && hasMatches());

    return matched;
}

function findMatches() {
    const matches = new Set();

    // Проверяем горизонтальные совпадения
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE - 2; j++) {
            if (board[i][j] && 
                board[i][j] === board[i][j + 1] && 
                board[i][j] === board[i][j + 2]) {
                matches.add(`${i},${j}`);
                matches.add(`${i},${j + 1}`);
                matches.add(`${i},${j + 2}`);
            }
        }
    }

    // Проверяем вертикальные совпадения
    for (let i = 0; i < GRID_SIZE - 2; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (board[i][j] && 
                board[i][j] === board[i + 1][j] && 
                board[i][j] === board[i + 2][j]) {
                matches.add(`${i},${j}`);
                matches.add(`${i + 1},${j}`);
                matches.add(`${i + 2},${j}`);
            }
        }
    }

    return matches;
}

function dropCells() {
    for (let col = 0; col < GRID_SIZE; col++) {
        let emptyRow = GRID_SIZE - 1;
        for (let row = GRID_SIZE - 1; row >= 0; row--) {
            if (board[row][col] !== null) {
                if (emptyRow !== row) {
                    board[emptyRow][col] = board[row][col];
                    board[row][col] = null;
                }
                emptyRow--;
            }
        }
    }
}

function fillEmptyCells() {
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (board[i][j] === null) {
                board[i][j] = getRandomFlower();
            }
        }
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    document.getElementById('startButton').addEventListener('click', startGame);
});
