// Tic Tac Toe Game Class
class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.gameMode = 'pvp'; // 'pvp' or 'pvc'
        this.aiDifficulty = 'medium'; // 'easy', 'medium', 'hard'
        this.scores = { X: 0, O: 0, tie: 0 };
        this.gameHistory = [];
        this.winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];
        this.init();
    }

    init() {
        this.createBoard();
        this.setupEventListeners();
        this.updateScores();
        this.setCurrentYear();
    }

    createBoard() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';
        
        this.board.forEach((cell, index) => {
            const cellElement = document.createElement('div');
            cellElement.className = 'cell';
            cellElement.dataset.index = index;
            
            if (cell) {
                cellElement.textContent = cell;
                cellElement.classList.add('occupied', cell.toLowerCase());
            }
            
            cellElement.addEventListener('click', () => this.handleCellClick(index));
            gameBoard.appendChild(cellElement);
        });
    }

    handleCellClick(index) {
        if (!this.gameActive || this.board[index] !== '') return;
        
        this.makeMove(index);
        
        // If playing against AI and it's AI's turn
        if (this.gameMode === 'pvc' && this.gameActive && this.currentPlayer === 'O') {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    makeMove(index) {
        this.board[index] = this.currentPlayer;
        this.updateBoard();
        
        if (this.checkWin()) {
            this.handleWin();
        } else if (this.checkTie()) {
            this.handleTie();
        } else {
            this.switchPlayer();
        }
    }

    makeAIMove() {
        if (!this.gameActive || this.currentPlayer !== 'O') return;
        
        let index;
        
        switch (this.aiDifficulty) {
            case 'easy':
                index = this.getRandomMove();
                break;
            case 'medium':
                index = this.getMediumMove();
                break;
            case 'hard':
                index = this.getBestMove();
                break;
        }
        
        if (index !== -1) {
            this.makeMove(index);
        }
    }

    getRandomMove() {
        const availableMoves = this.board
            .map((cell, index) => cell === '' ? index : null)
            .filter(index => index !== null);
        
        return availableMoves.length > 0 
            ? availableMoves[Math.floor(Math.random() * availableMoves.length)] 
            : -1;
    }

    getMediumMove() {
        // Try to win if possible
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                if (this.checkWin('O')) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        
        // Block player's winning move
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'X';
                if (this.checkWin('X')) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        
        // Take center if available
        if (this.board[4] === '') return 4;
        
        // Take a random corner
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(i => this.board[i] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        // Take a random edge
        const edges = [1, 3, 5, 7];
        const availableEdges = edges.filter(i => this.board[i] === '');
        if (availableEdges.length > 0) {
            return availableEdges[Math.floor(Math.random() * availableEdges.length)];
        }
        
        return -1;
    }

    getBestMove() {
        // Minimax algorithm for optimal AI play
        const scores = {
            X: -10,
            O: 10,
            tie: 0
        };
        
        const minimax = (board, depth, isMaximizing) => {
            const winner = this.evaluateBoard(board);
            if (winner !== null) {
                return scores[winner];
            }
            
            if (isMaximizing) {
                let bestScore = -Infinity;
                for (let i = 0; i < board.length; i++) {
                    if (board[i] === '') {
                        board[i] = 'O';
                        const score = minimax(board, depth + 1, false);
                        board[i] = '';
                        bestScore = Math.max(score, bestScore);
                    }
                }
                return bestScore;
            } else {
                let bestScore = Infinity;
                for (let i = 0; i < board.length; i++) {
                    if (board[i] === '') {
                        board[i] = 'X';
                        const score = minimax(board, depth + 1, true);
                        board[i] = '';
                        bestScore = Math.min(score, bestScore);
                    }
                }
                return bestScore;
            }
        };
        
        let bestScore = -Infinity;
        let move = -1;
        
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                const score = minimax(this.board, 0, false);
                this.board[i] = '';
                
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        
        return move;
    }

    evaluateBoard(board) {
        for (const combo of this.winningCombinations) {
            const [a, b, c] = combo;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        
        if (!board.includes('')) {
            return 'tie';
        }
        
        return null;
    }

    checkWin(player = this.currentPlayer) {
        return this.winningCombinations.some(combo => {
            const [a, b, c] = combo;
            return this.board[a] === player && 
                   this.board[a] === this.board[b] && 
                   this.board[a] === this.board[c];
        });
    }

    checkTie() {
        return !this.board.includes('') && !this.checkWin();
    }

    handleWin() {
        this.gameActive = false;
        this.scores[this.currentPlayer]++;
        this.updateScores();
        
        // Highlight winning cells
        const winningCombo = this.winningCombinations.find(combo => {
            const [a, b, c] = combo;
            return this.board[a] === this.currentPlayer && 
                   this.board[a] === this.board[b] && 
                   this.board[a] === this.board[c];
        });
        
        if (winningCombo) {
            winningCombo.forEach(index => {
                const cell = document.querySelector(`.cell[data-index="${index}"]`);
                cell.classList.add('winning');
            });
        }
        
        // Add to history
        this.addToHistory(`Player ${this.currentPlayer} Wins!`);
        
        // Show status modal
        this.showStatusModal(`Player ${this.currentPlayer} Wins!`, `Congratulations! Player ${this.currentPlayer} has won the game.`);
    }

    handleTie() {
        this.gameActive = false;
        this.scores.tie++;
        this.updateScores();
        
        this.addToHistory('Game Tied');
        this.showStatusModal('Game Tied!', 'The game ended in a draw. Try again!');
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updatePlayerDisplay();
    }

    updateBoard() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            cell.textContent = this.board[index];
            cell.className = 'cell';
            
            if (this.board[index]) {
                cell.classList.add('occupied', this.board[index].toLowerCase());
            }
        });
    }

    updatePlayerDisplay() {
        const currentPlayerDiv = document.getElementById('currentPlayer');
        const icon = currentPlayerDiv.querySelector('.player-icon');
        const text = currentPlayerDiv.querySelector('span');
        
        icon.className = 'player-icon';
        icon.classList.add(this.currentPlayer === 'X' ? 'x-icon' : 'o-icon');
        
        icon.innerHTML = this.currentPlayer === 'X' 
            ? '<i class="fas fa-times"></i>' 
            : '<i class="far fa-circle"></i>';
        
        text.textContent = this.gameMode === 'pvc' && this.currentPlayer === 'O'
            ? "AI's Turn"
            : `Player ${this.currentPlayer}'s Turn`;
    }

    updateScores() {
        document.getElementById('scoreX').textContent = this.scores.X;
        document.getElementById('scoreO').textContent = this.scores.O;
        document.getElementById('scoreTie').textContent = this.scores.tie;
    }

    addToHistory(result) {
        const historyItem = {
            date: new Date().toLocaleString(),
            result: result,
            board: [...this.board],
            winner: result.includes('Wins') ? result.split(' ')[1] : 'tie'
        };
        
        this.gameHistory.unshift(historyItem);
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historyList = document.getElementById('historyList');
        
        if (this.gameHistory.length === 0) {
            historyList.innerHTML = `
                <div class="no-history">
                    <i class="fas fa-scroll"></i>
                    <p>No games played yet</p>
                </div>
            `;
            return;
        }
        
        historyList.innerHTML = this.gameHistory.map((item, index) => `
            <div class="history-item ${item.winner === 'X' ? 'win-x' : item.winner === 'O' ? 'win-o' : 'tie'}">
                <div class="history-result">
                    ${item.winner === 'X' ? '<i class="fas fa-times" style="color: #FF416C;"></i>' : 
                      item.winner === 'O' ? '<i class="far fa-circle" style="color: #2193b0;"></i>' : 
                      '<i class="fas fa-handshake" style="color: #8E2DE2;"></i>'}
                    ${item.result}
                </div>
                <div class="history-date">${item.date}</div>
            </div>
        `).join('');
    }

    showStatusModal(title, message) {
        const statusModal = document.getElementById('gameStatus');
        const statusTitle = document.getElementById('statusTitle');
        const statusMessage = document.getElementById('statusMessage');
        
        statusTitle.textContent = title;
        statusMessage.textContent = message;
        statusModal.classList.add('active');
    }

    hideStatusModal() {
        document.getElementById('gameStatus').classList.remove('active');
    }

    resetGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.createBoard();
        this.updatePlayerDisplay();
        this.hideStatusModal();
    }

    newGame() {
        this.resetGame();
    }

    clearHistory() {
        this.gameHistory = [];
        this.updateHistoryDisplay();
    }

    setGameMode(mode) {
        this.gameMode = mode;
        this.resetGame();
        
        // Update UI
        const pvpBtn = document.getElementById('pvpBtn');
        const pvcBtn = document.getElementById('pvcBtn');
        const difficultySelector = document.getElementById('difficultySelector');
        
        if (mode === 'pvp') {
            pvpBtn.classList.add('active');
            pvcBtn.classList.remove('active');
            difficultySelector.style.display = 'none';
        } else {
            pvpBtn.classList.remove('active');
            pvcBtn.classList.add('active');
            difficultySelector.style.display = 'flex';
        }
        
        this.updatePlayerDisplay();
    }

    setDifficulty(difficulty) {
        this.aiDifficulty = difficulty;
        
        // Update UI
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.difficulty === difficulty) {
                btn.classList.add('active');
            }
        });
        
        if (this.gameMode === 'pvc' && this.currentPlayer === 'O' && this.gameActive) {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    setCurrentYear() {
        document.getElementById('currentYear').textContent = new Date().getFullYear();
    }

    setupEventListeners() {
        // Mode buttons
        document.getElementById('pvpBtn').addEventListener('click', () => this.setGameMode('pvp'));
        document.getElementById('pvcBtn').addEventListener('click', () => this.setGameMode('pvc'));
        
        // Difficulty buttons
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => this.setDifficulty(btn.dataset.difficulty));
        });
        
        // Control buttons
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
        document.getElementById('clearHistoryBtn').addEventListener('click', () => this.clearHistory());
        
        // Status modal
        document.getElementById('continueBtn').addEventListener('click', () => this.hideStatusModal());
        document.getElementById('gameStatus').addEventListener('click', (e) => {
            if (e.target === document.getElementById('gameStatus')) {
                this.hideStatusModal();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape') {
                this.hideStatusModal();
            }
            if (e.code === 'Space' && !this.gameActive) {
                this.resetGame();
            }
            if (e.code === 'KeyN' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.newGame();
            }
        });
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new TicTacToe();
    
    // Add some initial instructions to history
    setTimeout(() => {
        const welcomeItem = {
            date: new Date().toLocaleString(),
            result: 'Welcome to Tic Tac Toe Pro!',
            winner: 'tie'
        };
        game.gameHistory.unshift(welcomeItem);
        game.updateHistoryDisplay();
    }, 1000);
});
