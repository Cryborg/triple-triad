class Board {
    constructor() {
        this.grid = Array(3).fill(null).map(() => Array(3).fill(null));
        this.elementalSquares = Array(3).fill(null).map(() => Array(3).fill('None'));
    }

    isValidPosition(row, col) {
        return row >= 0 && row < 3 && col >= 0 && col < 3;
    }

    isPositionEmpty(row, col) {
        return this.isValidPosition(row, col) && this.grid[row][col] === null;
    }

    isPositionOccupied(row, col) {
        return this.isValidPosition(row, col) && this.grid[row][col] !== null;
    }

    placeCard(card, row, col) {
        if (!this.isValidPosition(row, col)) {
            throw new Error(`Position (${row}, ${col}) is out of bounds`);
        }
        if (this.isPositionOccupied(row, col)) {
            throw new Error(`Position (${row}, ${col}) is already occupied`);
        }
        if (!card) {
            throw new Error('Cannot place null or undefined card');
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

    getAllCardsOnBoardWithOwners() {
        const cardsWithOwners = [];
        
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const card = this.grid[row][col];
                if (card) {
                    cardsWithOwners.push({
                        card: card,
                        owner: card.owner,
                        position: { row, col }
                    });
                }
            }
        }
        
        return cardsWithOwners;
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

    initializeElementalSquares() {
        const elements = ['Fire', 'Ice', 'Thunder', 'Earth', 'Poison', 'Wind', 'Water', 'Holy'];
        const numberOfElementalSquares = Math.floor(Math.random() * 4) + 1;
        
        for (let i = 0; i < numberOfElementalSquares; i++) {
            const row = Math.floor(Math.random() * 3);
            const col = Math.floor(Math.random() * 3);
            const elementIndex = Math.floor(Math.random() * elements.length);
            this.elementalSquares[row][col] = elements[elementIndex];
        }
        
        console.log(`Initialized ${numberOfElementalSquares} elemental square(s)`);
    }

    getSquareElement(row, col) {
        if (!this.isValidPosition(row, col)) {
            return 'None';
        }
        return this.elementalSquares[row][col];
    }

    display(showElements = false) {
        console.log('\n  0   1   2');
        console.log(' ┌───┬───┬───┐');
        
        for (let row = 0; row < 3; row++) {
            let line = row + '│';
            for (let col = 0; col < 3; col++) {
                const card = this.grid[row][col];
                const element = this.elementalSquares[row][col];
                
                if (card) {
                    // Display card with owner color: P1 cards in blue, P2 cards in red
                    const ownerSymbol = card.owner === 'Player1' ? '\x1b[34mP1\x1b[0m' : '\x1b[31mP2\x1b[0m';
                    line += ownerSymbol;
                } else if (showElements && element !== 'None') {
                    // Display elemental square
                    line += ` ${element[0]} `;
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
        console.log(' └───┴───┴───┘');
        
        // Always show the card count
        const counts = this.countCardsByOwner();
        console.log(`\nScore: \x1b[34mPlayer1\x1b[0m: ${counts['Player1'] || 0} - \x1b[31mPlayer2\x1b[0m: ${counts['Player2'] || 0}`);
        
        if (showElements) {
            console.log('\nElements: F=Fire, I=Ice, T=Thunder, E=Earth, P=Poison, W=Wind/Water, H=Holy');
        }
    }
}

module.exports = Board;