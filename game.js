class Game {
   constructor() {
       this.flowers = ['🌹', '🌷', '🌻', '🍁'];
       this.score = 0;
       this.timeLeft = 45;
       this.isPlaying = false;
       this.selectedCell = null;
       this.timer = null;
       
       // DOM элементы
       this.board = document.querySelector('.game-board');
       this.startButton = document.getElementById('startButton');
       this.scoreCounter = document.getElementById('scoreCounter');
       this.timeCounter = document.getElementById('timeCounter');
       this.modalResult = document.getElementById('modalResult');
       this.finalScore = document.getElementById('finalScore');
       this.okButton = document.getElementById('okButton');

       // Привязка методов к контексту
       this.handleCellClick = this.handleCellClick.bind(this);
       this.startGame = this.startGame.bind(this);
       this.endGame = this.endGame.bind(this);
   }

   initialize() {
       // Инициализация обработчиков событий
       this.startButton.addEventListener('click', this.startGame);
       this.board.addEventListener('click', this.handleCellClick);
       this.okButton.addEventListener('click', () => {
           this.modalResult.style.display = 'none';
       });
   }

   createBoard() {
       this.board.innerHTML = '';
       for (let i = 0; i < 36; i++) {
           const cell = document.createElement('div');
           cell.classList.add('cell');
           cell.dataset.index = i;
           cell.textContent = this.flowers[Math.floor(Math.random() * this.flowers.length)];
           this.board.appendChild(cell);
       }
   }

   handleCellClick(e) {
       if (!this.isPlaying) return;
       
       const cell = e.target;
       if (!cell.classList.contains('cell')) return;

       if (!this.selectedCell) {
           this.selectedCell = cell;
           cell.style.background = '#e0e0e0';
       } else {
           const firstIndex = parseInt(this.selectedCell.dataset.index);
           const secondIndex = parseInt(cell.dataset.index);
           
           if (this.isAdjacent(firstIndex, secondIndex)) {
               this.swapCells(this.selectedCell, cell);
               this.checkMatches();
           }
           
           this.selectedCell.style.background = '';
           this.selectedCell = null;
       }
   }

   isAdjacent(index1, index2) {
       const row1 = Math.floor(index1 / 6);
       const col1 = index1 % 6;
       const row2 = Math.floor(index2 / 6);
       const col2 = index2 % 6;

       return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
   }

   swapCells(cell1, cell2) {
       const temp = cell1.textContent;
       cell1.textContent = cell2.textContent;
       cell2.textContent = temp;
   }

   checkMatches() {
       const cells = Array.from(document.querySelectorAll('.cell'));
       let matched = new Set();

       // Проверка горизонтальных совпадений
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
                   this.updateScore(matchLength);
               }
           }
       }

       // Проверка вертикальных совпадений
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
                   this.updateScore(matchLength);
               }
           }
       }

       // Замена совпавших цветов
       if (matched.size > 0) {
           matched.forEach(index => {
               cells[index].textContent = this.flowers[Math.floor(Math.random() * this.flowers.length)];
           });
       }
   }

   updateScore(matchLength) {
       switch(matchLength) {
           case 3:
               this.score += 100;
               break;
           case 4:
               this.score += 200;
               break;
           case 5:
               this.score += 300;
               break;
       }
       this.scoreCounter.textContent = this.score;
   }

   startTimer() {
       this.timer = setInterval(() => {
           this.timeLeft--;
           this.timeCounter.textContent = this.timeLeft;
           
           if (this.timeLeft <= 0) {
               this.endGame();
           }
       }, 1000);
   }

   endGame() {
       clearInterval(this.timer);
       this.isPlaying = false;
       this.modalResult.style.display = 'block';
       this.finalScore.textContent = this.score;
   }

   startGame() {
       this.score = 0;
       this.timeLeft = 45;
       this.isPlaying = true;
       this.scoreCounter.textContent = '0';
       this.timeCounter.textContent = '45';
       this.createBoard();
       this.startTimer();
   }
}

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
   const game = new Game();
   game.initialize();
});
