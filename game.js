// Инициализация Telegram Mini App
window.Telegram.WebApp.ready();
window.Telegram.WebApp.expand();

// Настройки игры
const EMOJIS = ['🌹', '🌷', '🌻', '🍁'];
let score = 0;
let timeLeft = 45;
let timer = null;
let selectedCell = null;
let gameActive = false;

// Создание поля без начальных совпадений
function createGrid() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    const cells = [];
    
    for (let i = 0; i < 36; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        
        // Проверяем возможные совпадения перед добавлением эмодзи
        let possibleEmojis = [...EMOJIS];
        
        if (i >= 2 && cells[i-1] === cells[i-2]) {
            possibleEmojis = possibleEmojis.filter(emoji => emoji !== cells[i-1]);
        }
        if (i >= 12 && cells[i-6] === cells[i-12]) {
            possibleEmojis = possibleEmojis.filter(emoji => emoji !== cells[i-6]);
        }
        
        const emoji = possibleEmojis[Math.floor(Math.random() * possibleEmojis.length)];
        cell.textContent = emoji;
        cells.push(emoji);
        
        cell.onclick = () => handleCellClick(cell);
        grid.appendChild(cell);
    }
}

function startGame() {
    if (timer) return;
    
    gameActive = true;
    score = 0;
    timeLeft = 45;
    updateScore();
    createGrid();
    
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('time').textContent = timeLeft;
        if (timeLeft <= 0) endGame();
    }, 1000);
}

function handleCellClick(cell) {
    if (!gameActive) return;
    
    if (!selectedCell) {
        selectedCell = cell;
        cell.classList.add('selected');
        return;
    }
    
    if (cell === selectedCell) {
        cell.classList.remove('selected');
        selectedCell = null;
        return;
    }
    
    if (isAdjacent(selectedCell, cell)) {
        const tempEmoji = selectedCell.textContent;
        selectedCell.textContent = cell.textContent;
        cell.textContent = tempEmoji;
        
        if (!checkForMatches()) {
            // Если нет совпадений, возвращаем обратно
            setTimeout(() => {
                cell.textContent = selectedCell.textContent;
                selectedCell.textContent = tempEmoji;
            }, 200);
        }
    }
    
    selectedCell.classList.remove('selected');
    selectedCell = null;
}

function isAdjacent(cell1, cell2) {
    const cells = Array.from(document.getElementsByClassName('cell'));
    const pos1 = cells.indexOf(cell1);
    const pos2 = cells.indexOf(cell2);
    
    const row1 = Math.floor(pos1 / 6);
    const col1 = pos1 % 6;
    const row2 = Math.floor(pos2 / 6);
    const col2 = pos2 % 6;
    
    return (Math.abs(row1 - row2) === 1 && col1 === col2) || 
           (Math.abs(col1 - col2) === 1 && row1 === row2);
}

function checkForMatches() {
    const cells = Array.from(document.getElementsByClassName('cell'));
    const matches = new Set();
    let hasMatches = false;

    // Проверка горизонтальных совпадений
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 4; col++) {
            const pos = row * 6 + col;
            const emoji = cells[pos].textContent;
            let matchLength = 1;
            
            for (let i = 1; col + i < 6 && cells[pos + i].textContent === emoji; i++) {
                matchLength++;
            }
            
            if (matchLength >= 3) {
                hasMatches = true;
                for (let i = 0; i < matchLength; i++) {
                    matches.add(pos + i);
                }
            }
        }
    }

    // Проверка вертикальных совпадений
    for (let col = 0; col < 6; col++) {
        for (let row = 0; row < 4; row++) {
            const pos = row * 6 + col;
            const emoji = cells[pos].textContent;
            let matchLength = 1;
            
            for (let i = 1; row + i < 6 && cells[pos + i * 6].textContent === emoji; i++) {
                matchLength++;
            }
            
            if (matchLength >= 3) {
                hasMatches = true;
                for (let i = 0; i < matchLength; i++) {
                    matches.add(pos + i * 6);
                }
            }
        }
    }

    if (hasMatches) {
        const matchSize = matches.size;
        score += matchSize === 3 ? 100 : matchSize === 4 ? 200 : 300;
        updateScore();
        
        matches.forEach(pos => {
            cells[pos].textContent = '';
        });
        
        setTimeout(fillEmptyCells, 300);
    }

    return hasMatches;
}

function fillEmptyCells() {
    const cells = Array.from(document.getElementsByClassName('cell'));
    
    // Заполняем пустые ячейки
    for (let col = 0; col < 6; col++) {
        for (let row = 5; row >= 0; row--) {
            const pos = row * 6 + col;
            
            if (!cells[pos].textContent) {
                // Ищем непустую ячейку выше
                for (let above = row - 1; above >= 0; above--) {
                    const abovePos = above * 6 + col;
                    if (cells[abovePos].textContent) {
                        cells[pos].textContent = cells[abovePos].textContent;
                        cells[abovePos].textContent = '';
                        break;
                    }
                }
                
                // Если не нашли, добавляем новый случайный эмодзи
                if (!cells[pos].textContent) {
                    cells[pos].textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
                }
            }
        }
    }
    
    // Проверяем новые совпадения
    setTimeout(checkForMatches, 300);
}

function updateScore() {
    document.getElementById('score').textContent = score;
}

function endGame() {
    clearInterval(timer);
    timer = null;
    gameActive = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('popup').style.display = 'block';
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
}

// Инициализация игры
document.addEventListener('DOMContentLoaded', () => {
    createGrid();
    document.getElementById('time').textContent = timeLeft;
    document.getElementById('score').textContent = score;
});
