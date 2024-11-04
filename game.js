// game.js
const GAME_TIME = 45;
const FLOWERS = ['🌷', '🌻', '🌹', '🍁'];
let score = 0;
let timeLeft = GAME_TIME;
let selectedCell = null;

function initGame() {
    createGrid();
    startTimer();
    updateScore(0);
}

function createGrid() {
    const grid = document.getElementById('grid');
    for(let i = 0; i < 36; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.textContent = FLOWERS[Math.floor(Math.random() * FLOWERS.length)];
        cell.addEventListener('click', () => handleCellClick(cell));
        grid.appendChild(cell);
    }
}

function handleCellClick(cell) {
    if (selectedCell === null) {
        selectedCell = cell;
        cell.classList.add('selected');
    } else {
        if (canSwap(selectedCell, cell)) {
            swapCells(selectedCell, cell);
            checkMatches();
        }
        selectedCell.classList.remove('selected');
        selectedCell = null;
    }
}

function canSwap(cell1, cell2) {
    const pos1 = Array.from(cell1.parentNode.children).indexOf(cell1);
    const pos2 = Array.from(cell2.parentNode.children).indexOf(cell2);
    return Math.abs(pos1 - pos2) === 1 || Math.abs(pos1 - pos2) === 6;
}

function swapCells(cell1, cell2) {
    const temp = cell1.textContent;
    cell1.textContent = cell2.textContent;
    cell2.textContent = temp;
}

function checkMatches() {
    const grid = document.getElementById('grid');
    const cells = Array.from(grid.children);
    let points = 0;

    // Проверка горизонтальных совпадений
    for(let row = 0; row < 6; row++) {
        let count = 1;
        let current = cells[row * 6].textContent;
        
        for(let col = 1; col < 6; col++) {
            if(cells[row * 6 + col].textContent === current) {
                count++;
            } else {
                if(count >= 3) points += calculatePoints(count);
                count = 1;
                current = cells[row * 6 + col].textContent;
            }
        }
        if(count >= 3) points += calculatePoints(count);
    }

    // Проверка вертикальных совпадений
    for(let col = 0; col < 6; col++) {
        let count = 1;
        let current = cells[col].textContent;
        
        for(let row = 1; row < 6; row++) {
            if(cells[row * 6 + col].textContent === current) {
                count++;
            } else {
                if(count >= 3) points += calculatePoints(count);
                count = 1;
                current = cells[row * 6 + col].textContent;
            }
        }
        if(count >= 3) points += calculatePoints(count);
    }

    if(points > 0) {
        updateScore(points);
        setTimeout(fillGaps, 300);
    }
}

function calculatePoints(count) {
    switch(count) {
        case 3: return 100;
        case 4: return 200;
        case 5: return 300;
        default: return 0;
    }
}

function updateScore(points) {
    score += points;
    document.getElementById('score').textContent = score;
}

function fillGaps() {
    // Заполнение пустых ячеек новыми цветами
    const grid = document.getElementById('grid');
    Array.from(grid.children).forEach(cell => {
        if (!cell.textContent) {
            cell.textContent = FLOWERS[Math.floor(Math.random() * FLOWERS.length)];
        }
    });
}

function startTimer() {
    const timerElement = document.getElementById('timer');
    const timer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        
        if(timeLeft <= 0) {
            clearInterval(timer);
            endGame();
        }
    }, 1000);
}

function endGame() {
    alert(`Игра окончена! Ваш счет: ${score}`);
    // Отключаем обработчики событий
    const grid = document.getElementById('grid');
    Array.from(grid.children).forEach(cell => {
        cell.removeEventListener('click', handleCellClick);
    });
}

initGame();
