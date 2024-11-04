document.addEventListener('DOMContentLoaded', function() {
    const board = document.querySelector('.game-board');
    const startButton = document.getElementById('startButton');
    const timeCounter = document.getElementById('timeCounter');
    const scoreCounter = document.getElementById('scoreCounter');
    const modalResult = document.getElementById('modalResult');
    const finalScore = document.getElementById('finalScore');
    const okButton = document.getElementById('okButton');

    const flowers = ['🌹', '🌷', '🌻', '🍁'];
    let score = 0;
    let timeLeft = 45;
    let isPlaying = false;
    let timer;
    let selectedCell = null;

    // Сразу создаем поле при загрузке
    createBoard();

    function createBoard() {
        board.innerHTML = '';
        for (let i = 0; i < 36; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.index = i;
            cell.textContent = flowers[Math.floor(Math.random() * flowers.length)];
            board.appendChild(cell);
        }
    }

    function startGame() {
        // Сброс предыдущей игры
        clearInterval(timer);
        isPlaying = true;
        score = 0;
        timeLeft = 45;
        scoreCounter.textContent = '0';
        timeCounter.textContent = '45';
        createBoard();
        startTimer();
    }

    function startTimer() {
        timer = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                timeCounter.textContent = timeLeft;
                if (timeLeft === 0) {
                    endGame();
                }
            }
        }, 1000);
    }

    function endGame() {
        clearInterval(timer);
        isPlaying = false;
        modalResult.style.display = 'block';
        finalScore.textContent = score;
        // Разрешаем начать новую игру
        startButton.disabled = false;
    }

    // Обработчики
    startButton.addEventListener('click', startGame);
    board.addEventListener('click', handleCellClick);
    okButton.addEventListener('click', () => {
        modalResult.style.display = 'none';
    });

    function handleCellClick(e) {
        if (!isPlaying) return;
        
        const cell = e.target;
        if (!cell.classList.contains('cell')) return;

        if (!selectedCell) {
            selectedCell = cell;
            cell.style.background = '#e0e0e0';
        } else {
            const firstIndex = parseInt(selectedCell.dataset.index);
            const secondIndex = parseInt(cell.dataset.index);
            
            if (isAdjacent(firstIndex, secondIndex)) {
                swapCells(selectedCell, cell);
                checkMatches();
            }
            
            selectedCell.style.background = '';
            selectedCell = null;
        }
    }

    function isAdjacent(index1, index2) {
        const row1 = Math.floor(index1 / 6);
        const col1 = index1 % 6;
        const row2 = Math.floor(index2 / 6);
        const col2 = index2 % 6;
        return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
    }

    function swapCells(cell1, cell2) {
        const temp = cell1.textContent;
        cell1.textContent = cell2.textContent;
        cell2.textContent = temp;
    }

    function checkMatches() {
        const cells = Array.from(document.querySelectorAll('.cell'));
        let matched = new Set();

        // Горизонтальные совпадения
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 4; col++) {
                const index = row * 6 + col;
                const flower = cells[index].textContent;
                let matchLength = 1;
                
                for (let i = 1; i < 6 - col; i++) {
                    if (cells[index + i].textContent === flower) {
                        matchLength++;
                    } else break;
                }

                if (matchLength >= 3) {
                    for (let i = 0; i < matchLength; i++) {
                        matched.add(index + i);
                    }
                    updateScore(matchLength);
                }
            }
        }

        // Вертикальные совпадения
        for (let col = 0; col < 6; col++) {
            for (let row = 0; row < 4; row++) {
                const index = row * 6 + col;
                const flower = cells[index].textContent;
                let matchLength = 1;
                
                for (let i = 1; i < 6 - row; i++) {
                    if (cells[index + i * 6].textContent === flower) {
                        matchLength++;
                    } else break;
                }

                if (matchLength >= 3) {
                    for (let i = 0; i < matchLength; i++) {
                        matched.add(index + i * 6);
                    }
                    updateScore(matchLength);
                }
            }
        }

        if (matched.size > 0) {
            matched.forEach(index => {
                cells[index].textContent = flowers[Math.floor(Math.random() * flowers.length)];
            });
        }
    }

    function updateScore(matchLength) {
        switch(matchLength) {
            case 3: score += 100; break;
            case 4: score += 200; break;
            case 5: score += 300; break;
        }
        scoreCounter.textContent = score;
    }
});
