class Player {
    constructor(id, isAI = false) {
        this.id = id;
        this.hand = [];
        this.collection = [];
        this.isAI = isAI;
    }

    addCardToHand(card) {
        this.hand.push(card);
    }

    addCardToCollection(card) {
        this.collection.push(card);
    }

    removeCardFromCollection(card) {
        const index = this.collection.indexOf(card);
        if (index > -1) {
            this.collection.splice(index, 1);
            return true;
        }
        return false;
    }

    getCardsControlledOnBoard(board) {
        const controlledCards = [];
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const card = board.getCard(row, col);
                if (card && card.owner === this.id) {
                    controlledCards.push(card);
                }
            }
        }
        return controlledCards;
    }

    clearHand() {
        this.hand = [];
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

    getSmartMove(board, opponentHand = null, elementalRuleActive = false) {
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
                const captures = this.countPotentialCaptures(board, card, position.row, position.col, elementalRuleActive);
                
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

    countPotentialCaptures(board, card, row, col, elementalRuleActive = false) {
        const adjacent = board.getAdjacentCards(row, col);
        const adjacentPositions = {
            top: { row: row - 1, col },
            right: { row, col: col + 1 },
            bottom: { row: row + 1, col },
            left: { row, col: col - 1 }
        };
        let captures = 0;

        const placedSquareElement = board.getSquareElement(row, col);

        const comparisons = [
            { side: 'top', adjacentCard: adjacent.top, cardSide: 'bottom', adjacentPos: adjacentPositions.top },
            { side: 'right', adjacentCard: adjacent.right, cardSide: 'left', adjacentPos: adjacentPositions.right },
            { side: 'bottom', adjacentCard: adjacent.bottom, cardSide: 'top', adjacentPos: adjacentPositions.bottom },
            { side: 'left', adjacentCard: adjacent.left, cardSide: 'right', adjacentPos: adjacentPositions.left }
        ];

        for (const { side, adjacentCard, cardSide, adjacentPos } of comparisons) {
            if (adjacentCard && adjacentCard.owner !== this.id) {
                let cardRank, adjacentRank;
                
                if (elementalRuleActive) {
                    const adjacentSquareElement = board.getSquareElement(adjacentPos.row, adjacentPos.col);
                    cardRank = card.getEffectiveRank(side, placedSquareElement, true);
                    adjacentRank = adjacentCard.getEffectiveRank(cardSide, adjacentSquareElement, true);
                } else {
                    cardRank = card.getRank(side);
                    adjacentRank = adjacentCard.getRank(cardSide);
                }
                
                if (cardRank > adjacentRank) {
                    captures++;
                }
            }
        }

        return captures;
    }
}

module.exports = Player;