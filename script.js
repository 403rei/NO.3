class Tetris {
    constructor() {
        this.stageWidth = 10;
        this.stageHeight = 20;

        this.stageCanvas = document.getElementById("stage");
        this.nextCanvas = document.getElementById("next");

        let cellWidth = this.stageCanvas.width / this.stageWidth;
        let cellHeight = this.stageCanvas.height / this.stageHeight;
        this.cellSize = cellWidth < cellHeight ? cellWidth : cellHeight;

        this.stageLeftPadding = (this.stageCanvas.width - this.cellSize * this.stageWidth) / 2;
        this.stageTopPadding = (this.stageCanvas.height - this.cellSize * this.stageHeight) / 2;

        this.blocks = this.createBlocks();
        this.deletedLines = 0;

        window.onkeydown = (e) => {
            if (e.keyCode === 37) {
                this.moveLeft();
            } else if (e.keyCode === 38) {
                this.hardDrop();
            } else if (e.keyCode === 39) {
                this.moveRight();
            } else if (e.keyCode === 40) {
                this.fall();
            } else if (e.keyCode === 90) {
                this.rotateLeft();
            } else if (e.keyCode === 88) {
                this.rotateRight();
            }
        }
    }

    createBlocks() {
        let blocks = [
            {  // I
                shape: [[[-1, 0], [0, 0], [1, 0], [2, 0]],
                        [[0, -1], [0, 0], [0, 1], [0, 2]],
                        [[-1, 0], [0, 0], [1, 0], [2, 0]],
                        [[0, -1], [0, 0], [0, 1], [0, 2]]],
                color: "rgb(0, 255, 255)",
                highlight: "rgb(255, 255, 255)",
                shadow: "rgb(0, 128, 128)"
            },
            {  // O
                shape: [[[0, 0], [1, 0], [0, 1], [1, 1]],
                        [[0, 0], [1, 0], [0, 1], [1, 1]],
                        [[0, 0], [1, 0], [0, 1], [1, 1]],
                        [[0, 0], [1, 0], [0, 1], [1, 1]]],
                color: "rgb(255, 255, 0)",
                highlight: "rgb(255, 255, 255)",
                shadow: "rgb(128, 128, 0)"
            },
            {  // S
                shape: [[[0, 0], [1, 0], [-1, 1], [0, 1]],
                        [[-1, -1], [-1, 0], [0, 0], [0, 1]],
                        [[0, 0], [1, 0], [-1, 1], [0, 1]],
                        [[-1, -1], [-1, 0], [0, 0], [0, 1]]],
                color: "rgb(0, 255, 0)",
                highlight: "rgb(255, 255, 255)",
                shadow: "rgb(0, 128, 0)"
            },
            {  // Z
                shape: [[[-1, 0], [0, 0], [0, 1], [1, 1]],
                        [[0, -1], [-1, 0], [0, 0], [-1, 1]],
                        [[-1, 0], [0, 0], [0, 1], [1, 1]],
                        [[0, -1], [-1, 0], [0, 0], [-1, 1]]],
                color: "rgb(255, 0, 0)",
                highlight: "rgb(255, 255, 255)",
                shadow: "rgb(128, 0, 0)"
            },
            {  // J
                shape: [[[-1, -1], [-1, 0], [0, 0], [1, 0]],
                        [[0, -1], [1, -1], [0, 0], [0, 1]],
                        [[-1, 0], [0, 0], [1, 0], [1, 1]],
                        [[0, -1], [0, 0], [-1, 1], [0, 1]]],
                color: "rgb(0, 0, 255)",
                highlight: "rgb(255, 255, 255)",
                shadow: "rgb(0, 0, 128)"
            },
            {  // L
                shape: [[[1, -1], [-1, 0], [0, 0], [1, 0]],
                        [[0, -1], [0, 0], [0, 1], [1, 1]],
                        [[-1, 0], [0, 0], [1, 0], [-1, 1]],
                        [[-1, -1], [0, -1], [0, 0], [0, 1]]],
                color: "rgb(255, 128, 0)",
                highlight: "rgb(255, 255, 255)",
                shadow: "rgb(128, 64, 0)"
            },
            {  // T
                shape: [[[0, -1], [-1, 0], [0, 0], [1, 0]],
                        [[0, -1], [0, 0], [1, 0], [0, 1]],
                        [[-1, 0], [0, 0], [1, 0], [0, 1]],
                        [[0, -1], [-1, 0], [0, 0], [0, 1]]],
                color: "rgb(255, 0, 255)",
                highlight: "rgb(255, 255, 255)",
                shadow: "rgb(128, 0, 128)"
            }
        ];
        return blocks;
    }

    startGame() {
        this.lines = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.currentDir = 0;
        this.stage = this.createStage();
        this.nextBlock = this.generateRandomBlock();
        this.generateBlock();
        this.update();
    }

    createStage() {
        let stage = new Array(this.stageHeight);
        for (let y = 0; y < this.stageHeight; y++) {
            stage[y] = new Array(this.stageWidth).fill(null);
        }
        return stage;
    }

    generateRandomBlock() {
        let index = Math.floor(Math.random() * this.blocks.length);
        let block = this.blocks[index];
        return {
            shape: block.shape,
            color: block.color,
            highlight: block.highlight,
            shadow: block.shadow
        };
    }

    generateBlock() {
        this.currentBlock = this.nextBlock;
        this.currentX = Math.floor(this.stageWidth / 2);
        this.currentY = 0;
        this.currentDir = 0;
        this.nextBlock = this.generateRandomBlock();

        this.draw();
        this.drawNextBlock();
    }

    isBlockOverlapping(shape, x, y) {
        for (let i = 0; i < shape.length; i++) {
            let cell = shape[i];
            let cellX = x + cell[0];
            let cellY = y + cell[1];
            if (cellX < 0 || cellX >= this.stageWidth || cellY < 0 || cellY >= this.stageHeight || this.stage[cellY][cellX] !== null) {
                return true;
            }
        }
        return false;
    }

    update() {
        this.draw();
        this.timer = setInterval(() => {
            this.fall();
        }, 500);
    }

    draw() {
        let ctx = this.stageCanvas.getContext("2d");
        ctx.clearRect(0, 0, this.stageCanvas.width, this.stageCanvas.height);
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, this.stageCanvas.width, this.stageCanvas.height);
        ctx.save();
        ctx.translate(this.stageLeftPadding, this.stageTopPadding);
        this.drawStage(ctx);
        this.drawBlock(ctx, this.currentBlock.shape[this.currentDir], this.currentX, this.currentY, this.currentBlock.color, this.currentBlock.highlight, this.currentBlock.shadow);
        ctx.restore();
    }

    drawNextBlock() {
        let ctx = this.nextCanvas.getContext("2d");
        ctx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        ctx.save();
        ctx.translate(this.cellSize, this.cellSize);
        this.drawBlock(ctx, this.nextBlock.shape[0], 0, 0, this.nextBlock.color, this.nextBlock.highlight, this.nextBlock.shadow);
        ctx.restore();
    }

    drawStage(ctx) {
        for (let y = 0; y < this.stage.length; y++) {
            for (let x = 0; x < this.stage[y].length; x++) {
                let cell = this.stage[y][x];
                if (cell !== null) {
                    ctx.fillStyle = cell.color;
                    ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
                    ctx.fillStyle = cell.highlight;
                    ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize / 4);
                    ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize / 4, this.cellSize);
                    ctx.fillStyle = cell.shadow;
                    ctx.fillRect(x * this.cellSize, (y + 1) * this.cellSize - this.cellSize / 4, this.cellSize, this.cellSize / 4);
                    ctx.fillRect((x + 1) * this.cellSize - this.cellSize / 4, y * this.cellSize, this.cellSize / 4, this.cellSize);
                }
            }
        }
    }

    drawBlock(ctx, shape, x, y, color, highlight, shadow) {
        for (let i = 0; i < shape.length; i++) {
            let cell = shape[i];
            let cellX = (x + cell[0]) * this.cellSize;
            let cellY = (y + cell[1]) * this.cellSize;
            ctx.fillStyle = color;
            ctx.fillRect(cellX, cellY, this.cellSize, this.cellSize);
            ctx.fillStyle = highlight;
            ctx.fillRect(cellX, cellY, this.cellSize, this.cellSize / 4);
            ctx.fillRect(cellX, cellY, this.cellSize / 4, this.cellSize);
            ctx.fillStyle = shadow;
            ctx.fillRect(cellX, cellY + this.cellSize - this.cellSize / 4, this.cellSize, this.cellSize / 4);
            ctx.fillRect(cellX + this.cellSize - this.cellSize / 4, cellY, this.cellSize / 4, this.cellSize);
        }
    }

    moveLeft() {
        if (!this.isBlockOverlapping(this.currentBlock.shape[this.currentDir], this.currentX - 1, this.currentY)) {
            this.currentX--;
            this.draw();
        }
    }

    moveRight() {
        if (!this.isBlockOverlapping(this.currentBlock.shape[this.currentDir], this.currentX + 1, this.currentY)) {
            this.currentX++;
            this.draw();
        }
    }

    fall() {
        if (!this.isBlockOverlapping(this.currentBlock.shape[this.currentDir], this.currentX, this.currentY + 1)) {
            this.currentY++;
            this.draw();
        } else {
            this.fixBlock();
        }
    }

    hardDrop() {
        while (!this.isBlockOverlapping(this.currentBlock.shape[this.currentDir], this.currentX, this.currentY + 1)) {
            this.currentY++;
        }
        this.fixBlock();
    }

    rotateLeft() {
        let nextDir = (this.currentDir + 3) % 4;
        if (!this.isBlockOverlapping(this.currentBlock.shape[nextDir], this.currentX, this.currentY)) {
            this.currentDir = nextDir;
            this.draw();
        }
    }

    rotateRight() {
        let nextDir = (this.currentDir + 1) % 4;
        if (!this.isBlockOverlapping(this.currentBlock.shape[nextDir], this.currentX, this.currentY)) {
            this.currentDir = nextDir;
            this.draw();
        }
    }

    fixBlock() {
        let shape = this.currentBlock.shape[this.currentDir];
        for (let i = 0; i < shape.length; i++) {
            let cell = shape[i];
            let cellX = this.currentX + cell[0];
            let cellY = this.currentY + cell[1];
            if (cellY >= 0) {
                this.stage[cellY][cellX] = this.currentBlock;
            }
        }
        this.clearLines();
        this.generateBlock();
    }

    clearLines() {
        let lines = 0;
        for (let y = this.stage.length - 1; y >= 0; y--) {
            let isLine = this.stage[y].every(cell => cell !== null);
            if (isLine) {
                this.stage.splice(y, 1);
                this.stage.unshift(new Array(this.stageWidth).fill(null));
                lines++;
                y++;
            }
        }
        this.lines += lines;
        document.getElementById("lines").innerText = this.lines;
    }
}
