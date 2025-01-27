class Tetris {
    constructor() {
        this.board = Array(20).fill().map(() => Array(10).fill(0));
        this.score = 0;
        this.currentPiece = null;
        this.gameOver = false;
        this.gameSpeed = 400;
        this.colors = ['blue', 'green', 'yellow', 'orange', 'purple', 'red', 'cyan'];
        
        this.pieces = [
            [[1, 1, 1, 1]], // I
            [[1, 1], [1, 1]], // O
            [[1, 1, 1], [0, 1, 0]], // T
            [[1, 1, 1], [1, 0, 0]], // L
            [[1, 1, 1], [0, 0, 1]], // J
            [[1, 1, 0], [0, 1, 1]], // S
            [[0, 1, 1], [1, 1, 0]]  // Z
        ];

        this.init();
    }

    init() {
        this.boardElement = document.getElementById('board');
        this.scoreElement = document.getElementById('score');
        this.createBoard();
        this.bindControls();
        this.spawnPiece();
        this.gameLoop();
    }

    createBoard() {
        this.boardElement.innerHTML = '';
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 10; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.setAttribute('data-row', i);
                cell.setAttribute('data-col', j);
                this.boardElement.appendChild(cell);
            }
        }
    }

    bindControls() {
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;
            switch(e.key) {
                case 'ArrowLeft':
                    this.movePiece(-1);
                    break;
                case 'ArrowRight':
                    this.movePiece(1);
                    break;
                case 'ArrowUp':
                    this.rotatePiece();
                    break;
                case 'ArrowDown':
                    this.dropPiece();
                    break;
            }
        });

        document.getElementById('leftBtn').addEventListener('click', () => this.movePiece(-1));
        document.getElementById('rightBtn').addEventListener('click', () => this.movePiece(1));
        document.getElementById('rotateBtn').addEventListener('click', () => this.rotatePiece());
        document.getElementById('dropBtn').addEventListener('click', () => this.dropPiece());
    }

    spawnPiece() {
        const pieceIndex = Math.floor(Math.random() * this.pieces.length);
        const colorIndex = Math.floor(Math.random() * this.colors.length);
        this.currentPiece = {
            shape: JSON.parse(JSON.stringify(this.pieces[pieceIndex])),
            color: this.colors[colorIndex],
            x: 3,
            y: 0
        };

        if (this.checkCollision()) {
            this.gameOver = true;
            alert('Game Over! Score: ' + this.score);
            location.reload();
        }
    }

    checkCollision() {
        return this.currentPiece.shape.some((row, dy) => {
            return row.some((cell, dx) => {
                if (!cell) return false;
                const newX = this.currentPiece.x + dx;
                const newY = this.currentPiece.y + dy;
                return newX < 0 || newX >= 10 || newY >= 20 || 
                       (newY >= 0 && this.board[newY][newX]);
            });
        });
    }

    movePiece(dir) {
        this.currentPiece.x += dir;
        if (this.checkCollision()) {
            this.currentPiece.x -= dir;
        }
        this.render();
    }

    rotatePiece() {
        const rotated = this.currentPiece.shape[0].map((_, i) =>
            this.currentPiece.shape.map(row => row[row.length - 1 - i])
        );
        const originalShape = this.currentPiece.shape;
        this.currentPiece.shape = rotated;
        
        if (this.checkCollision()) {
            this.currentPiece.shape = originalShape;
        }
        this.render();
    }

    dropPiece() {
        while (!this.checkCollision()) {
            this.currentPiece.y++;
        }
        this.currentPiece.y--;
        this.lockPiece();
    }

    lockPiece() {
        this.currentPiece.shape.forEach((row, dy) => {
            row.forEach((cell, dx) => {
                if (cell) {
                    const y = this.currentPiece.y + dy;
                    const x = this.currentPiece.x + dx;
                    if (y >= 0) {
                        this.board[y][x] = this.currentPiece.color;
                    }
                }
            });
        });

        this.clearLines();
        this.spawnPiece();
    }

    clearLines() {
        let linesCleared = 0;
        for (let y = 19; y >= 0; y--) {
            if (this.board[y].every(cell => cell)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(10).fill(0));
                linesCleared++;
                y++;
            }
        }
        if (linesCleared) {
            this.score += [40, 100, 300, 1200][linesCleared - 1];
            this.scoreElement.textContent = this.score;
        }
    }

    render() {
        // Clear the board
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.className = 'cell';
        });

        // Render locked pieces
        this.board.forEach((row, y) => {
            row.forEach((color, x) => {
                if (color) {
                    const cell = document.querySelector(`[data-row="${y}"][data-col="${x}"]`);
                    cell.classList.add('piece', color);
                }
            });
        });

        // Render current piece
        this.currentPiece.shape.forEach((row, dy) => {
            row.forEach((cell, dx) => {
                if (cell) {
                    const y = this.currentPiece.y + dy;
                    const x = this.currentPiece.x + dx;
                    if (y >= 0) {
                        const cell = document.querySelector(`[data-row="${y}"][data-col="${x}"]`);
                        cell.classList.add('piece', this.currentPiece.color, 'active');
                    }
                }
            });
        });
    }

    gameLoop() {
        if (!this.gameOver) {
            this.currentPiece.y++;
            if (this.checkCollision()) {
                this.currentPiece.y--;
                this.lockPiece();
            }
            this.render();
            setTimeout(() => this.gameLoop(), this.gameSpeed);
        }
    }
}

// Start the game
window.onload = () => new Tetris();