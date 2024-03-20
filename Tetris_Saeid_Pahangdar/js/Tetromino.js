
// CLASS TETROMINO
class Tetromino{
    constructor(shapeID, x, y){
        let tempShapeID = shapeID;
        // we have only 7 tetromino, 1-7
        if(tempShapeID < 1 || tempShapeID > 7)
            tempShapeID = 1;

        this.shapeID = tempShapeID;
        this.blocks = tetrominos[tempShapeID - 1];
        this.rotationID = 0;    // we have 4 rotation shape, 0-3 
        this.height = this.blocks[this.rotationID].length;
        this.width = this.blocks[this.rotationID][0].length;
        this.x = x;
        this.y = y;
        this.located = false;  // is tetromino located in the board
    }

    rotate(){
        if(this.rotationID == 3)
            this.rotationID =0
        else
            this.rotationID++;
    }
    
}