
// GAME CLASS
class Game{
    constructor(canvas, width, height){
        this.gameOver = false;
        // data for main animation loop
        this.timer = 0;
        this.fps = 60;
        this.interval = 1000 / this.fps;

        // data for Tetromino animation
        this.tetrominoTimer = 0;
        this.tetrominoFps = 1;
        this.tetrominoInterval = 1000 / this.tetrominoFps;
        // for speed up Tetromino, after Arrow Down
        this.tetrominoSpeedFactor = 20;   
        this.tetrominoAccelerated = false;
        
        // data for deleting completed rows animation
        this.deleteRowTimer = 0;
        this.deleteRowFps = 10;
        this.deleteRowInterval = 1000 / this.deleteRowFps;
        this.deleteRowFrameCount = 6;
        this.deleteRowFrameCounter = 0;

        this.score = 0;

        // width and height of board,  #block
        this.width = width;
        if(this.width > maxWidthSize)
            this.width = maxWidthSize;
        this.height = height;
        if(this.height > maxHeightSize)
            this.height = maxHeightSize;
        
        // a 2D array for board data, 0 for free, 99 for border, 1-7 for fixed Tetrominos 
        // and -1 for deleted cells
        this.board = [];
        this.initBoard();
        console.log(this.board);

        this.tetromino = null;

        this.canvas = canvas;
        this.canvas.width = (leftBorderSize + this.width + rightBorderSize) * blockSize;
        this.canvas.height = (topBorderSize + this.height + bottomBorderSize) * blockSize;
        
        this.context = this.canvas.getContext('2d');

        this.context.strokeWidth = 5;
        this.context.strokeStyle = '#fff';
        this.context.font = '25px Helvetica';
        this.context.textAlign = 'center';

        this.bordersImg = document.querySelector('#bordersImg');
        this.tetrominosImg = document.querySelector('#tetrominosImg');
        this.deletingRowImg = document.querySelector('#deletingRowImg');

        // attach event listeners 
        window.addEventListener('keydown', e => {
            this.checkKeyDown(e.key);
        });
        window.addEventListener('keyup', e => {
            this.checkKeyUp(e.key);
        });
        
    }

    render(deltaTime){
        if(this.timer >= this.interval){
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawBorder();
            this.drawBoard();

            this.checkForNewTetromino();
            this.checkForDrawTetromino();
            this.checkForAnimateTetromino();

            this.checkForAnimateDeletedRows();
            this.drawScore();

            if(this. gameOver){
                this.drawGameOver();
                console.log('Game Over');
                cancelAnimationFrame(requestId);
            };

            this.timer = 0;
        }
        this.timer += deltaTime;
        this.tetrominoTimer += deltaTime;
        this.deleteRowTimer += deltaTime;
    }

    initBoard(){
        // we add one cell at the start and end of each row as border with value of 99
        for(let i = 0; i < this.height; i++){
            this.board.push(new Array(2 + this.width).fill(0));
            this.board[this.board.length - 1][0] = 99;
            this.board[this.board.length - 1][this.width + 1] = 99;
        }
        // we add three rows as bottom border with values of 99
        for(let i = 0; i < 3; i++){
            this.board.push(new Array(2 + this.width).fill(99));
        }
    }

    checkForNewTetromino(){
        if(!this.gameOver){
            if(this.tetromino == null){
                this.addTetromino();
                // check if the Tetromino can fit in the board 
                this.gameOver = !this.locateTetromino();
                if(this.gameOver)
                    this.tetromino = null;            
            }
        }
    }

    checkForDrawTetromino(){
        if(!this.gameOver && this.tetromino != null && this.tetromino.located){
            this.drawTetromino();
        }
    }

    checkForAnimateTetromino(){
        if(this.tetromino != null && this.tetrominoTimer >= this.tetrominoInterval){
            //check if the Tetromino can fit in next position in the board 
            if(this.tetrominoNextPositionIsClear(1, 0)){
                this.tetromino.y += 1;
                if(this.tetrominoAccelerated)
                    this.score++;
            } else {
                // if the Tetromino couldn't move to next position, add it to the board as fix blocks
                this.addTetrominoToBoard();
                this.tetromino = null;
            }
            this.tetrominoTimer =0;
        };
    }

    checkForAnimateDeletedRows(){
        if(this.deleteRowFrameCounter === 0) {
            // check if there are completed rows
            if(this.markCompletedRows()){
                this.deleteRowFrameCounter = this.deleteRowFrameCount;
            }
        } else {
            if(this.deleteRowTimer >= this.deleteRowInterval){
                // darw animation for deleted rows
                this.drawDeletedRow();
                this.deleteRowFrameCounter--;
                this.deleteRowTimer =0;
                // at the end of animation, romve deleted rows and shif upper rows to down
                if(this.deleteRowFrameCounter == 0){
                    this.removeDeletedRows();
                }
            };    
        }
    }

    addTetromino(){
        // a random shape ID
        let tetrominoShapeID = 1 + Math.floor(Math.random() * 7);
        let tetrominoX = 0;
        let tetrominoY = 0;
        if(tetrominoShapeID == 1)
            tetrominoY = -1;

        this.tetromino = new Tetromino(tetrominoShapeID, tetrominoX, tetrominoY);
        // random x position
        this.tetromino.x = 1 + Math.floor(Math.random() * ( this.width - this.tetromino.width + 1));
        // reset speed
        this.tetrominoInterval = 1000 / this.tetrominoFps;
        this.tetrominoAccelerated = false;
    }

    removeDeletedRows(){
        let row = this.height - 1;
        while(row > 0){
            if(this.board[row][1] == -1){
                for(let y = row - 1; y >0; y--){
                    for(let x = 0; x < this.width; x++){
                        this.board[y + 1][x + 1] = this.board[y][x + 1]; 
                    }
                }
                this.score += 100;
            } else{
                row--;
            }
        }
        soundEffect.src = './assets/soundFX/deleterow.wav';
        soundEffect.play();
    }

    drawDeletedRow(){
        for(let row = 0; row < this.height; row++){
            for(let col = 0; col < this.width; col++){
                if(this.board[row][col + 1] == -1){
                    this.context.drawImage(this.deletingRowImg,
                        (6 - this.deleteRowFrameCounter) * blockSize, 0,
                        blockSize, blockSize,
                        (col + leftBorderSize ) * blockSize, (row + topBorderSize) * blockSize,
                        blockSize, blockSize
                        );                                    
                }
            }
        }
    }

    markCompletedRows(){
        let completed = false;
        for(let row = 0; row < this.height; row++){
            let completedRow = true;
            for(let col = 0; col < this.width; col++){
                if(this.board[row][col + 1] == 0){
                    completedRow = false
                }
            }
            if(completedRow){
                completed = completedRow;
                for(let col = 0; col < this.width; col++){
                    this.board[row][col + 1] = -1;
                }
            }
        }
        return completed;
    }

    locateTetromino(){
        let located = true;
        for(let y = 0; y < this.tetromino.height; y++){
            for(let x = 0; x < this.tetromino.width; x++){
                if(this.tetromino.blocks[this.tetromino.rotationID][y][x] == 1){
                    if(this.board[this.tetromino.y + y][this.tetromino.x + x] != 0){
                        located = false;
                    }
                }
            }
        }
        this.tetromino.located = located;
        return located;
    }

    tetrominoNextPositionIsClear(yOffset, xOffset, rotationStep){
        let rotation = this.tetromino.rotationID
        if(!(rotationStep === undefined)){
            rotation += rotationStep
        }
        if(rotation === 4)
            rotation = 0;
        let clear = true;
        for(let y = 0; y < this.tetromino.height; y++){
            for(let x = 0; x < this.tetromino.width; x++){
                if(this.tetromino.blocks[rotation][y][x] == 1){
                    if((this.tetromino.x + x + xOffset) < 0 || (this.tetromino.y + y + yOffset) < 0){
                        clear = false
                    } else {
                        if(this.board[this.tetromino.y + y + yOffset][this.tetromino.x + x + xOffset] != 0){
                            clear = false;
                        }    
                    }
                }
            }
    
        }
        return clear;
    }

    addTetrominoToBoard(){
        for(let row = 0; row < this.tetromino.height; row++){
            for(let col = 0; col < this.tetromino.width; col++){
                if(this.tetromino.blocks[this.tetromino.rotationID][row][col] == 1){
                    this.board[this.tetromino.y + row][this.tetromino.x + col] = this.tetromino.shapeID;
                }
            }
        }
        soundEffect.src = './assets/soundFX/addtoboard.wav';
        soundEffect.play();
        // console.log(this.board);
    }

    checkKeyDown(key) {
        if(this.gameOver || this.tetromino == null)
            return;
        this.tetrominoInterval = 1000 / this.tetrominoFps;
        this.tetrominoAccelerated = false;
        if(key === 'ArrowRight') {
            if(this.tetrominoNextPositionIsClear(0, 1)){
                this.tetromino.x += 1;
            }
        }
        if(key === 'ArrowLeft') {
            if(this.tetrominoNextPositionIsClear(0, -1)){
                this.tetromino.x -= 1;
            }
        }
        if(key === 'ArrowUp') {
            if(this.tetrominoNextPositionIsClear(0, 0, 1)){
                this.tetromino.rotate();
            }            
        }
        if(key === 'ArrowDown') {
            this.tetrominoInterval = 1000 / (this.tetrominoFps * this.tetrominoSpeedFactor);
            this.tetrominoAccelerated = true;
        }
    }

    checkKeyUp(key){
        if(this.gameOver || this.tetromino == null)
            return;
        if(key === 'ArrowDown'){
            this.tetrominoInterval = 1000 / this.tetrominoFps;
            this.tetrominoAccelerated = false;
        }
    }

    drawTetromino(){
        for(let y = 0; y < this.tetromino.height; y++){
            for(let x = 0; x < this.tetromino.width; x++){
                if(this.tetromino.blocks[this.tetromino.rotationID][y][x] == 1){
                    this.context.drawImage(this.tetrominosImg,
                        this.tetromino.shapeID * blockSize, 0,
                        blockSize, blockSize,
                        (this.tetromino.x + x + leftBorderSize - 1) * blockSize, (this.tetromino.y + y + topBorderSize) * blockSize,
                        blockSize, blockSize
                        );                
                }
            }
        }
    }

    drawBoard(){
        for(let row = 0; row < this.height; row++){
            for(let col = 0; col < this.width + 2; col++){
                if(this.board[row][col] != 0 && this.board[row][col] != 99 && this.board[row][col] != -1){
                    this.context.drawImage(this.tetrominosImg,
                        this.board[row][col] * blockSize, 0,
                        blockSize, blockSize,
                        (col + leftBorderSize - 1) * blockSize, (row + topBorderSize) * blockSize,
                        blockSize, blockSize
                        );                
                }
            }
        }
    }

    drawScore(){       
        this.context.fillStyle = "#020";
        this.context.fillRect((leftBorderSize + this.width + 1) * blockSize - 10, 10 + (0) * blockSize,
                                4 * blockSize, 2* blockSize);
        this.context.strokeRect((leftBorderSize + this.width + 1) * blockSize - 10, 10 + (0) * blockSize,
                                4 * blockSize, 2* blockSize);
        this.context.fillStyle = '#5f5';
        this.context.fillText(this.score,
                              (leftBorderSize + this.width + 2) * blockSize + 10, 15 + (1) * blockSize)
    }

    drawGameOver(){
        backgroundMusic.pause();
        // soundEffect.src = './assets/soundFX/gameover.wav';
        // soundEffect.play();

        this.context.save();
        this.context.globalAlpha = 0.7;
        this.context.fillStyle = "#fff";
        this.context.fillRect((leftBorderSize + 1) * blockSize, 2 * blockSize,
                                (this.width - 2) * blockSize, 4 * blockSize);
        this.context.restore();

        this.context.fillStyle = '#a00';
        this.context.fillText("GAME OVER",
                                (leftBorderSize + this.width / 2 ) * blockSize,  4 * blockSize);
    }

    drawBorder() {
        // draw top border 
        this.context.drawImage(this.bordersImg,
            0, 0 ,
            (leftBorderSize + rightBorderSize + this.width) * blockSize, topBorderSize * blockSize,
            0, 0,
            (leftBorderSize + rightBorderSize + this.width) * blockSize, topBorderSize * blockSize            
            );
       // draw left border
        this.context.drawImage(this.bordersImg,
            0, topBorderSize * blockSize,
            leftBorderSize * blockSize , this.height * blockSize,
            0, topBorderSize * blockSize,
            leftBorderSize * blockSize , this.height * blockSize);
        // draw right border
        this.context.drawImage(this.bordersImg,
            (leftBorderSize + this.width) * blockSize, topBorderSize * blockSize,
             rightBorderSize * blockSize, this.height * blockSize,
             (leftBorderSize + this.width) * blockSize, topBorderSize * blockSize,
             rightBorderSize * blockSize, this.height * blockSize);  
        // draw bottom border
        this.context.drawImage(this.bordersImg,
             0, (topBorderSize + this.height) * blockSize ,
             (leftBorderSize + rightBorderSize + this.width) * blockSize, bottomBorderSize * blockSize,
             0, (topBorderSize + this.height) * blockSize ,
             (leftBorderSize + rightBorderSize + this.width) * blockSize, bottomBorderSize * blockSize
             );

        this.context.strokeStyle = '#aaa';
        this.context.beginPath();
        this.context.moveTo(leftBorderSize * blockSize - 1, topBorderSize * blockSize);
        this.context.lineTo(leftBorderSize * blockSize - 1, (topBorderSize + this.height) * blockSize);
        this.context.lineTo((leftBorderSize + this.width) * blockSize + 1, (topBorderSize + this.height) * blockSize);
        this.context.lineTo((leftBorderSize + this.width) * blockSize + 1, topBorderSize * blockSize);
        this.context.stroke();
    }
}