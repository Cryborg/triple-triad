class Board {
    constructor() {
        this.grid = Array(3).fill(null).map(() => Array(3).fill(null));
    }

    isValidPosition(row, col) {
        return row >= 0 && row < 3 && col >= 0 && col < 3;
    }

    isPositionEmpty(row, col) {
        return this.isValidPosition(row, col) && this.grid[row][col] === null;
    }

    placeCard(card, row, col) {
        if (!this.isPositionEmpty(row, col)) {
            throw new Error(`Position (${row}, ${col}) is not empty or invalid`);
        }
        this.grid[row][col] = card;
    }

    getCard(row, col) {
        if (!this.isValidPosition(row, col)) {
            return null;
        }
        return this.grid[row][col];
    }

    getAdjacentCards(row, col) {
        const adjacent = {
            top: null,
            right: null,
            bottom: null,
            left: null
        };

        if (row > 0) adjacent.top = this.getCard(row - 1, col);
        if (col < 2) adjacent.right = this.getCard(row, col + 1);
        if (row < 2) adjacent.bottom = this.getCard(row + 1, col);
        if (col > 0) adjacent.left = this.getCard(row, col - 1);

        return adjacent;
    }

    countCardsByOwner() {
        const count = {};
        
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const card = this.grid[row][col];
                if (card) {
                    count[card.owner] = (count[card.owner] || 0) + 1;
                }
            }
        }
        
        return count;
    }

    isFull() {
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (this.grid[row][col] === null) {
                    return false;
                }
            }
        }
        return true;
    }

    getEmptyPositions() {
        const positions = [];
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (this.grid[row][col] === null) {
                    positions.push({ row, col });
                }
            }
        }
        return positions;
    }

    display() {
        console.log('\n  0   1   2');
        console.log(' ┌───┬───┬───┐');
        
        for (let row = 0; row < 3; row++) {
            let line = row + '│';
            for (let col = 0; col < 3; col++) {
                const card = this.grid[row][col];
                if (card) {
                    line += ` ${card.owner[0]} `;
                } else {
                    line += '   ';
                }
                line += '│';
            }
            console.log(line);
            
            if (row < 2) {
                console.log(' ├───┼───┼───┤');
            }
        }
        console.log(' └───┴───┴───┘\n');
    }
}

module.exports = Board;