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
        if (!card) {
            throw new Error('Cannot add null or undefined card to collection');
        }
        
        // Prevent duplicates
        if (this.collection.includes(card)) {
            console.warn(`Card ${card.toString()} is already in ${this.id}'s collection`);
            return false;
        }
        
        this.collection.push(card);
        return true;
    }

    removeCardFromCollection(card) {
        if (!card) {
            throw new Error('Cannot remove null or undefined card from collection');
        }
        
        const index = this.collection.indexOf(card);
        if (index > -1) {
            this.collection.splice(index, 1);
            return true;
        }
        
        console.warn(`Card ${card.toString()} not found in ${this.id}'s collection`);
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

    getSmartMove(board, opponentHand = null, elementalRuleActive = false, gameRules = {}) {
        if (!this.isAI || this.hand.length === 0) {
            return null;
        }

        const emptyPositions = board.getEmptyPositions();
        if (emptyPositions.length === 0) {
            return null;
        }

        let bestMove = null;
        let maxScore = -1;

        // Evaluate all possible moves with sophisticated scoring
        for (let cardIndex = 0; cardIndex < this.hand.length; cardIndex++) {
            const card = this.hand[cardIndex];
            
            for (const position of emptyPositions) {
                const score = this.evaluateMove(board, card, position.row, position.col, elementalRuleActive, gameRules);
                
                if (score > maxScore) {
                    maxScore = score;
                    bestMove = {
                        cardIndex,
                        row: position.row,
                        col: position.col,
                        score: score
                    };
                }
            }
        }

        return bestMove || this.getRandomMove(board);
    }

    /**
     * Evaluate a move with sophisticated scoring that considers all rules
     * @param {Board} board - The game board
     * @param {Card} card - The card to place
     * @param {number} row - Row position
     * @param {number} col - Column position
     * @param {boolean} elementalRuleActive - Whether elemental rule is active
     * @param {Object} gameRules - Game rules configuration
     * @returns {number} Move score (higher is better)
     */
    evaluateMove(board, card, row, col, elementalRuleActive = false, gameRules = {}) {
        let score = 0;

        // Base score: basic captures
        const basicCaptures = this.countPotentialCaptures(board, card, row, col, elementalRuleActive);
        score += basicCaptures * 10;

        // Bonus for special rule triggers
        if (gameRules.same || gameRules.plus) {
            const specialCaptures = this.countSpecialRuleCaptures(board, card, row, col, gameRules);
            score += specialCaptures * 25; // Higher value for special captures
        }

        // Combo potential (if combo rule is active)
        if (gameRules.combo && (gameRules.same || gameRules.plus)) {
            const comboCaptures = this.estimateComboCaptures(board, card, row, col, elementalRuleActive);
            score += comboCaptures * 15;
        }

        // Strategic positioning score
        score += this.evaluateStrategicPosition(board, card, row, col, elementalRuleActive);

        // Defensive score (protecting own cards)
        const protectionValue = this.evaluateProtection(board, card, row, col, elementalRuleActive);
        score += protectionValue * 5;

        // Card value consideration (save strong cards for better opportunities)
        const cardStrength = this.evaluateCardStrength(card);
        const boardState = this.evaluateBoardState(board);
        if (boardState.early && cardStrength > 8) {
            score -= 5; // Penalty for using strong cards early
        }

        return score;
    }

    /**
     * Count potential captures from Same/Plus rules
     */
    countSpecialRuleCaptures(board, card, row, col, gameRules) {
        const adjacent = board.getAdjacentCards(row, col);
        let captures = 0;

        if (gameRules.same) {
            captures += this.checkSameRule(card, adjacent, board, row, col);
        }

        if (gameRules.plus) {
            captures += this.checkPlusRule(card, adjacent, board, row, col);
        }

        return captures;
    }

    /**
     * Check for Same rule triggers
     */
    checkSameRule(card, adjacent, board, row, col) {
        const sides = ['top', 'right', 'bottom', 'left'];
        const adjacentCards = [adjacent.top, adjacent.right, adjacent.bottom, adjacent.left];
        let sameCount = 0;
        let captures = 0;

        for (let i = 0; i < sides.length; i++) {
            const adjacentCard = adjacentCards[i];
            if (adjacentCard && adjacentCard.owner !== this.id) {
                const myRank = card.getOriginalRank(sides[i]);
                const theirRank = adjacentCard.getOriginalRank(this.getOppositeSide(sides[i]));
                
                if (myRank === theirRank) {
                    sameCount++;
                }
            }
        }

        // If 2 or more same matches, capture all adjacent
        if (sameCount >= 2) {
            for (const adjacentCard of adjacentCards) {
                if (adjacentCard && adjacentCard.owner !== this.id) {
                    captures++;
                }
            }
        }

        return captures;
    }

    /**
     * Check for Plus rule triggers
     */
    checkPlusRule(card, adjacent, board, row, col) {
        const checks = [
            { mySide: 'top', theirSide: 'bottom', card: adjacent.top },
            { mySide: 'right', theirSide: 'left', card: adjacent.right },
            { mySide: 'bottom', theirSide: 'top', card: adjacent.bottom },
            { mySide: 'left', theirSide: 'right', card: adjacent.left }
        ];

        const sums = [];
        const captureableCards = [];

        for (const check of checks) {
            if (check.card && check.card.owner !== this.id) {
                const myRank = card.getOriginalRank(check.mySide);
                const theirRank = check.card.getOriginalRank(check.theirSide);
                const sum = myRank + theirRank;
                
                sums.push(sum);
                captureableCards.push(check.card);
            }
        }

        // Check for matching sums
        const sumCounts = {};
        sums.forEach(sum => {
            sumCounts[sum] = (sumCounts[sum] || 0) + 1;
        });

        let captures = 0;
        for (const count of Object.values(sumCounts)) {
            if (count >= 2) {
                captures = captureableCards.length; // All adjacent cards if plus triggers
                break;
            }
        }

        return captures;
    }

    /**
     * Estimate potential combo captures
     */
    estimateComboCaptures(board, card, row, col, elementalRuleActive) {
        // Simplified combo estimation - check if captured cards could capture others
        let comboEstimate = 0;
        const adjacent = board.getAdjacentCards(row, col);
        
        for (const adjacentCard of Object.values(adjacent)) {
            if (adjacentCard && adjacentCard.owner !== this.id) {
                // If we capture this card, check if it could capture others
                const adjacentPos = this.findCardPosition(board, adjacentCard);
                if (adjacentPos) {
                    const secondaryAdjacent = board.getAdjacentCards(adjacentPos.row, adjacentPos.col);
                    for (const secondaryCard of Object.values(secondaryAdjacent)) {
                        if (secondaryCard && secondaryCard.owner !== this.id) {
                            comboEstimate += 0.5; // Partial score for potential combo
                        }
                    }
                }
            }
        }
        
        return comboEstimate;
    }

    /**
     * Evaluate strategic positioning value
     */
    evaluateStrategicPosition(board, card, row, col, elementalRuleActive) {
        let score = 0;

        // Center positions are generally better
        if (row === 1 && col === 1) score += 3;
        else if ((row === 1 || col === 1) && !(row === 1 && col === 1)) score += 2;

        // Corner positions can be good for defense
        if ((row === 0 || row === 2) && (col === 0 || col === 2)) score += 1;

        // Bonus for elemental square matching
        if (elementalRuleActive) {
            const squareElement = board.getSquareElement(row, col);
            if (card.element === squareElement) {
                score += 4; // Good bonus for element matching
            } else if (card.element !== 'None' && squareElement !== 'None') {
                score -= 2; // Penalty for element mismatch
            }
        }

        return score;
    }

    /**
     * Evaluate protection value (how well this move protects our cards)
     */
    evaluateProtection(board, card, row, col, elementalRuleActive) {
        const blocks = this.countPotentialBlocks(board, card, row, col, elementalRuleActive);
        return blocks;
    }

    /**
     * Evaluate card strength (average of all ranks)
     */
    evaluateCardStrength(card) {
        const ranks = card.originalRanks;
        return (ranks.top + ranks.right + ranks.bottom + ranks.left) / 4;
    }

    /**
     * Evaluate current board state
     */
    evaluateBoardState(board) {
        const emptyPositions = board.getEmptyPositions();
        const totalPositions = 9;
        const filledPositions = totalPositions - emptyPositions.length;
        
        return {
            early: filledPositions <= 3,
            middle: filledPositions > 3 && filledPositions <= 6,
            late: filledPositions > 6
        };
    }

    /**
     * Helper method to find card position on board
     */
    findCardPosition(board, targetCard) {
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (board.getCard(row, col) === targetCard) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    /**
     * Get opposite side for rank comparison
     */
    getOppositeSide(side) {
        const opposites = {
            'top': 'bottom',
            'bottom': 'top',
            'left': 'right',
            'right': 'left'
        };
        return opposites[side];
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
                    cardRank = card.getOriginalRank(side);
                    adjacentRank = adjacentCard.getOriginalRank(cardSide);
                }
                
                if (cardRank > adjacentRank) {
                    captures++;
                }
            }
        }

        return captures;
    }

    countPotentialBlocks(board, card, row, col, elementalRuleActive = false) {
        // Simple blocking heuristic: count adjacent opponent cards that would be threatened
        let blocks = 0;
        const adjacent = board.getAdjacentCards(row, col);
        const adjacentPositions = {
            top: { row: row - 1, col },
            right: { row, col: col + 1 },
            bottom: { row: row + 1, col },
            left: { row, col: col - 1 }
        };

        const comparisons = [
            { side: 'top', adjacentCard: adjacent.top },
            { side: 'right', adjacentCard: adjacent.right },
            { side: 'bottom', adjacentCard: adjacent.bottom },
            { side: 'left', adjacentCard: adjacent.left }
        ];

        for (const { side, adjacentCard } of comparisons) {
            if (adjacentCard && adjacentCard.owner === this.id) {
                // This is our card that could be protected by placing here
                blocks++;
            }
        }
        
        return blocks;
    }
}

module.exports = Player;