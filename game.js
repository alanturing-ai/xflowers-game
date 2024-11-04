const GRID_SIZE = 6;
const GAME_TIME = 45;
const FLOWERS = ['🌹', '🌷', '🌻', '🍁'];

let score = 0;
let timer = GAME_TIME;
let isPlaying = false;
let selectedCell = null;
let timerInterval;
let board = [];

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
            board[i][j] = FLOWERS[Math.floor(Math.random() * FLOWERS.length)];
            cell.textContent = board[i][j];
            cell.addEventListener('click', handleCellClick);
            gameBoard.appendChild(cell);
        }
    }
    
    // Убираем начальные совпадения
    while (checkForMatches()) {
        refillBoard();
    }
}

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
        if (timer <= 0) {
            endGame();
        }
    }, 1000);
}

function endGame() {
    isPlaying = false;
    clearInterval(timerInterval);
    alert(`Игра окончена! Ваш счет: ${score}`);
}

function updateScore() {
    document.getElementById('scoreDisplay').textContent = score;
}

function updateTimer() {
    document.getElementById('timeDisplay').textContent = timer;
}

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
            if (!checkForMatches()) {
                // Если нет совпадений, меняем обратно
                setTimeout(() => {
                    swapCells(selectedCell, { row, col });
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
    
    updateBoardDisplay();
}

function checkForMatches() {
    let hasMatches = false;
    let matches = new Set();

    // Проверка горизонтальных совпадений
    for (let i = 0; i < GRID_SIZE; i++) {
        let count = 1;
        for (let j = 1; j < GRID_SIZE; j++) {
            if (board[i][j] === board[i][j-1]) {
                count++;
            } else {
                if (count >= 3) {
                    for (let k = 0; k < count; k++) {
                        matches.add(`${i},${j-1-k}`);
                    }
                    hasMatches = true;
                }
                count = 1;
            }
        }
        if (count >= 3) {
            for (let k = 0; k < count; k++) {
                matches.add(`${i},${GRID_SIZE-1-k}`);
            }
            hasMatches = true;
        }
    }

    // Проверка вертикальных совпадений
    for (let j = 0; j < GRID_SIZE; j++) {
        let count = 1;
        for (let i = 1; i < GRID_SIZE; i++) {
            if (board[i][j] === board[i-1][j]) {
                count++;
            } else {
                if (count >= 3) {
                    for (let k = 0; k < count; k++) {
                        matches.add(`${i-1-k},${j}`);
                    }
                    hasMatches = true;
                }
                count = 1;
            }
        }
        if (count >= 3) {
            for (let k = 0; k < count; k++) {
                matches.add(`${GRID_SIZE-1-k},${j}`);
            }
            hasMatches = true;
        }
    }

    if (hasMatches) {
        // Анимация и удаление совпадений
        matches.forEach(match => {
            const [row, col] = match.split(',').map(Number);
            const cell = document.querySelector(
                `.cell[data-row="${row}"][data-col="${col}"]`
            );
            cell.classList.add('matched');
        });

        // Начисление очков
        score += matches.size * 100;
        updateScore();

        // Задержка перед заполнением пустых ячеек
        setTimeout(() => {
            removeMatches(matches);
            dropCells();
            refillBoard();
            updateBoardDisplay();
            
            // Проверка на новые совпадения после падения
            setTimeout(() => {
                if (checkForMatches()) {
                    // Рекурсивная проверка новых совпадений
                }
            }, 300);
        }, 500);
    }

    return hasMatches;
}

function removeMatches(matches) {
    matches.forEach(match => {
        const [row, col] = match.split(',').map(Number);
        board[row][col] = null;
    });
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

function refillBoard() {
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (board[i][j] === null) {
                board[i][j] = FLOWERS[Math.floor(Math.random() * FLOWERS.length)];
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

// Инициализация игры
document.getElementById('startButton').addEventListener('click', startGame);
