// Конфигурация игры
const BOARD_SIZE = 6;
const GAME_TIME = 45;
const MATCH_SCORES = {
    3: 100,
    4: 200,
    5: 300
};

// Эмодзи цветов
const FLOWERS = [
    '🍁',    // кленовый лист
    '🌻',    // подсолнух
    '🌷',    // тюльпан
    '🌹'     // роза
];

// Состояние игры
let board = [];
let score = 0;
let timeLeft = GAME_TIME;
let isPlaying = false;
let selectedCell = null;
let gameTimer = null;

// DOM элементы
const gameBoard = document.getElementById('gameBoard');
const startBtn = document.getElementById('startBtn');
const timeDisplay = document.getElementById('time');
const scoreDisplay = document.getElementById('score');
const modal = document.getElementById('gameOverModal');
const finalScoreDisplay = document.getElementById('finalScore');
const okBtn = document.getElementById('okBtn');

// Инициализация игры
function initGame() {
    board = createBoard();
    score = 0;
    timeLeft = GAME_TIME;
    isPlaying = true;
    selectedCell = null;
    
    updateDisplay();
    renderBoard();
    startTimer();
}

// Создание случайного игрового поля
function createBoard() {
    const newBoard = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
        newBoard[i] = [];
        for (let j = 0; j < BOARD_SIZE; j++) {
            newBoard[i][j] = Math.floor(Math.random() * FLOWERS.length);
        }
    }
    return newBoard;
}

// Отрисовка игрового поля
function renderBoard() {
    gameBoard.innerHTML = '';
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const cell = createCell(i, j);
            gameBoard.appendChild(cell);
        }
    }
}

// Создание ячейки
function createCell(row, col) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.textContent = FLOWERS[board[row][col]];
    cell.addEventListener('click', () => handleCellClick(row, col, cell));
    return cell;
}

// Обработка клика по ячейке
function handleCellClick(row, col, cell) {
    if (!isPlaying) return;
    
    if (!selectedCell) {
        selectedCell = { row, col, element: cell };
        cell.classList.add('selected');
    } else {
        if (isAdjacent(selectedCell, { row, col })) {
            swapCells(selectedCell, { row, col });
        }
        selectedCell.element.classList.remove('selected');
        selectedCell = null;
    }
}

// Проверка соседства ячеек
function isAdjacent(cell1, cell2) {
    return (
        (Math.abs(cell1.row - cell2.row) === 1 && cell1.col === cell2.col) ||
        (Math.abs(cell1.col - cell2.col) === 1 && cell1.row === cell2.row)
    );
}

// Обмен ячеек
async function swapCells(cell1, cell2) {
    const temp = board[cell1.row][cell1.col];
    board[cell1.row][cell1.col] = board[cell2.row][cell2.col];
    board[cell2.row][cell2.col] = temp;
    
    const matches = findMatches();
    if (matches.length > 0) {
        await processMatches(matches);
    } else {
        // Отменяем обмен, если нет совпадений
        board[cell2.row][cell2.col] = board[cell1.row][cell1.col];
        board[cell1.row][cell1.col] = temp;
        renderBoard();
    }
}

// Поиск совпадений
function findMatches() {
    const matches = [];
    
    // Проверка горизонтальных совпадений
    for (let i = 0; i < BOARD_SIZE; i++) {
        let count = 1;
        let type = board[i][0];
        
        for (let j = 1; j < BOARD_SIZE; j++) {
            if (board[i][j] === type) {
                count++;
            } else {
                if (count >= 3) {
                    matches.push({
                        row: i,
                        startCol: j - count,
                        endCol: j - 1,
                        length: count,
                        type: 'horizontal'
                    });
                }
                count = 1;
                type = board[i][j];
            }
        }
        if (count >= 3) {
            matches.push({
                row: i,
                startCol: BOARD_SIZE - count,
                endCol: BOARD_SIZE - 1,
                length: count,
                type: 'horizontal'
            });
        }
    }
    
    // Проверка вертикальных совпадений
    for (let j = 0; j < BOARD_SIZE; j++) {
        let count = 1;
        let type = board[0][j];
        
        for (let i = 1; i < BOARD_SIZE; i++) {
            if (board[i][j] === type) {
                count++;
            } else {
                if (count >= 3) {
                    matches.push({
                        col: j,
                        startRow: i - count,
                        endRow: i - 1,
                        length: count,
                        type: 'vertical'
                    });
                }
                count = 1;
                type = board[i][j];
            }
        }
        if (count >= 3) {
            matches.push({
                col: j,
                startRow: BOARD_SIZE - count,
                endRow: BOARD_SIZE - 1,
                length: count,
                type: 'vertical'
            });
        }
    }
    
    return matches;
}

// Обработка совпадений
async function processMatches(matches) {
    // Начисление очков
    matches.forEach(match => {
        score += MATCH_SCORES[match.length] || 0;
    });
    updateDisplay();
    
    // Удаление совпавших элементов и добавление анимации
    matches.forEach(match => {
        if (match.type === 'horizontal') {
            for (let j = match.startCol; j <= match.endCol; j++) {
                const cell = gameBoard.children[match.row * BOARD_SIZE + j];
                cell.classList.add('match');
                board[match.row][j] = null;
            }
        } else {
            for (let i = match.startRow; i <= match.endRow; i++) {
                const cell = gameBoard.children[i * BOARD_SIZE + match.col];
                cell.classList.add('match');
                board[i][match.col] = null;
            }
        }
    });

    // Ждем завершения анимации
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Падение элементов
    await dropElements();
    
    // Заполнение пустых ячеек
    fillEmptyCells();
    
    // Проверка новых совпадений
    const newMatches = findMatches();
    if (newMatches.length > 0) {
        await processMatches(newMatches);
    }
    
    renderBoard();
}

// Падение элементов
async function dropElements() {
    let moved = false;
    
    for (let j = 0; j < BOARD_SIZE; j++) {
        let emptySpaces = 0;
        
        for (let i = BOARD_SIZE - 1; i >= 0; i--) {
            if (board[i][j] === null) {
                emptySpaces++;
            } else if (emptySpaces > 0) {
                board[i + emptySpaces][j] = board[i][j];
                board[i][j] = null;
                moved = true;
            }
        }
    }
    
    if (moved) {
        renderBoard();
        // Добавляем небольшую задержку для анимации падения
        await new Promise(resolve => setTimeout(resolve, 200));
    }
}

// Заполнение пустых ячеек
function fillEmptyCells() {
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] === null) {
                board[i][j] = Math.floor(Math.random() * FLOWERS.length);
            }
        }
    }
}

// Обновление отображения
function updateDisplay() {
    scoreDisplay.textContent = score;
    timeDisplay.textContent = timeLeft;
}

// Таймер игры
function startTimer() {
    if (gameTimer) clearInterval(gameTimer);
    
    gameTimer = setInterval(() => {
        timeLeft--;
        updateDisplay();
        
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// Завершение игры
function endGame() {
    isPlaying = false;
    clearInterval(gameTimer);
    finalScoreDisplay.textContent = score;
    modal.classList.add('show');
}

// Обработчики событий
startBtn.addEventListener('click', initGame);
okBtn.addEventListener('click', () => {
    modal.classList.remove('show');
});

// Инициализация страницы
renderBoard();
