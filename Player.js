class Player {
    constructor(id, isAI = false) {
        this.id = id;
        this.hand = [];
        this.isAI = isAI;
    }

    addCardToHand(card) {
        this.hand.push(card);
    }

    hasCards() {
        return this.hand.length > 0;
    }

    getCard(index) {
        if (index < 0 || index >= this.hand.length) {
            throw new Error('Invalid card index');
        }
        return this.hand[index];
    }

    playCard(index) {
        if (index < 0 || index >= this.hand.length) {
            throw new Error('Invalid card index');
        }
        return this.hand.splice(index, 1)[0];
    }

    displayHand() {
        console.log(`\n${this.id}'s hand:`);
        this.hand.forEach((card, index) => {
            console.log(`${index}: ${card.toString()}`);
        });
    }

    getRandomMove(board) {
        if (!this.isAI || this.hand.length === 0) {
            return null;
        }

        const emptyPositions = board.getEmptyPositions();
        if (emptyPositions.length === 0) {
            return null;
        }

        const cardIndex = Math.floor(Math.random() * this.hand.length);
        const positionIndex = Math.floor(Math.random() * emptyPositions.length);
        const position = emptyPositions[positionIndex];

        return {
            cardIndex,
            row: position.row,
            col: position.col
        };
    }

    getSmartMove(board) {
        if (!this.isAI || this.hand.length === 0) {
            return null;
        }

        const emptyPositions = board.getEmptyPositions();
        if (emptyPositions.length === 0) {
            return null;
        }

        let bestMove = null;
        let maxCaptures = -1;

        for (let cardIndex = 0; cardIndex < this.hand.length; cardIndex++) {
            const card = this.hand[cardIndex];
            
            for (const position of emptyPositions) {
                const captures = this.countPotentialCaptures(board, card, position.row, position.col);
                
                if (captures > maxCaptures) {
                    maxCaptures = captures;
                    bestMove = {
                        cardIndex,
                        row: position.row,
                        col: position.col
                    };
                }
            }
        }

        return bestMove || this.getRandomMove(board);
    }

    countPotentialCaptures(board, card, row, col) {
        const adjacent = board.getAdjacentCards(row, col);
        let captures = 0;

        const comparisons = [
            { side: 'top', adjacentCard: adjacent.top, cardSide: 'bottom' },
            { side: 'right', adjacentCard: adjacent.right, cardSide: 'left' },
            { side: 'bottom', adjacentCard: adjacent.bottom, cardSide: 'top' },
            { side: 'left', adjacentCard: adjacent.left, cardSide: 'right' }
        ];

        for (const { side, adjacentCard, cardSide } of comparisons) {
            if (adjacentCard && adjacentCard.owner !== this.id) {
                if (card.getRank(side) > adjacentCard.getRank(cardSide)) {
                    captures++;
                }
            }
        }

        return captures;
    }
}

module.exports = Player;