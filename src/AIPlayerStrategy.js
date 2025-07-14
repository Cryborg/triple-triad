/**
 * AIPlayerStrategy - Advanced AI strategy module for Triple Triad v0.9
 * Implements sophisticated AI with multi-criteria evaluation, limited simulation,
 * and strategic hand management
 */
class AIPlayerStrategy {
    constructor() {
        this.simulationDepth = 2; // Look ahead 2 moves
        this.weights = {
            capture: 10,        // Base capture value
            block: 5,           // Blocking opponent captures
            sameRule: 15,       // Same rule potential
            plusRule: 15,       // Plus rule potential
            comboRule: 25,      // Combo rule potential
            elemental: 3,       // Elemental advantage
            position: 2,        // Strategic positioning
            handManagement: 4   // Keep strong cards for later
        };
    }

    /**
     * Choose the best move using advanced AI strategy
     * @param {Board} board - Current board state
     * @param {Array} hand - AI's current hand
     * @param {Array} opponentHand - Opponent's hand (if open rule active)
     * @param {boolean} elementalActive - Whether elemental rule is active
     * @param {Object} gameRules - Active game rules
     * @returns {Object} Best move {cardIndex, row, col, score}
     */
    chooseBestMove(board, hand, opponentHand = null, elementalActive = false, gameRules = {}) {
        const possibleMoves = this.generateAllPossibleMoves(board, hand);
        
        if (possibleMoves.length === 0) {
            return null;
        }

        let bestMove = null;
        let bestScore = -Infinity;

        for (const move of possibleMoves) {
            let score = this.evaluateMove(board, move, hand, opponentHand, elementalActive, gameRules);
            
            // Add limited simulation for deeper analysis
            if (this.simulationDepth > 0 && opponentHand) {
                score += this.simulateOpponentResponse(board, move, hand, opponentHand, elementalActive, gameRules);
            }

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return { ...bestMove, score: bestScore };
    }

    /**
     * Generate all possible moves
     * @param {Board} board - Current board state
     * @param {Array} hand - Player's hand
     * @returns {Array} Array of possible moves
     */
    generateAllPossibleMoves(board, hand) {
        const moves = [];
        
        for (let cardIndex = 0; cardIndex < hand.length; cardIndex++) {
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    if (board.isPositionEmpty(row, col)) {
                        moves.push({ cardIndex, row, col });
                    }
                }
            }
        }
        
        return moves;
    }

    /**
     * Evaluate a single move using multiple criteria
     * @param {Board} board - Current board state
     * @param {Object} move - Move to evaluate
     * @param {Array} hand - Player's hand
     * @param {Array} opponentHand - Opponent's hand
     * @param {boolean} elementalActive - Whether elemental rule is active
     * @param {Object} gameRules - Active game rules
     * @returns {number} Move score
     */
    evaluateMove(board, move, hand, opponentHand, elementalActive, gameRules) {
        const { cardIndex, row, col } = move;
        const card = hand[cardIndex];
        let score = 0;

        // Basic capture evaluation
        const basicCaptures = this.countBasicCaptures(board, card, row, col, elementalActive);
        score += basicCaptures * this.weights.capture;

        // Special rules evaluation
        if (gameRules.same || gameRules.plus) {
            const specialCaptures = this.evaluateSpecialRules(board, card, row, col, gameRules);
            if (gameRules.same) score += specialCaptures.same * this.weights.sameRule;
            if (gameRules.plus) score += specialCaptures.plus * this.weights.plusRule;
        }

        // Combo potential
        if (gameRules.combo) {
            const comboScore = this.evaluateComboChain(board, card, row, col, gameRules);
            score += comboScore * this.weights.comboRule;
        }

        // Defensive evaluation - block opponent captures
        if (opponentHand) {
            const blockValue = this.evaluateDefensiveValue(board, card, row, col, opponentHand, elementalActive, gameRules);
            score += blockValue * this.weights.block;
        }

        // Elemental positioning
        if (elementalActive) {
            const elementalScore = this.evaluateElementalPositioning(board, card, row, col);
            score += elementalScore * this.weights.elemental;
        }

        // Strategic positioning
        const positionScore = this.evaluatePositionalValue(board, row, col);
        score += positionScore * this.weights.position;

        // Hand management - keep strong cards for crucial moments
        const handManagementScore = this.evaluateHandManagement(hand, cardIndex, board);
        score += handManagementScore * this.weights.handManagement;

        return score;
    }

    /**
     * Count basic captures (opponent cards that would be captured)
     * @param {Board} board - Current board state
     * @param {Card} card - Card to place
     * @param {number} row - Row position
     * @param {number} col - Column position
     * @param {boolean} elementalActive - Whether elemental rule is active
     * @returns {number} Number of basic captures
     */
    countBasicCaptures(board, card, row, col, elementalActive) {
        const adjacent = board.getAdjacentCards(row, col);
        let captures = 0;

        const checkCapture = (myRank, opponentRank) => myRank > opponentRank;

        if (adjacent.top && adjacent.top.owner !== card.owner) {
            const myRank = card.getEffectiveRank('top', board.getSquareElement(row, col), elementalActive);
            const oppRank = adjacent.top.getEffectiveRank('bottom', board.getSquareElement(row - 1, col), elementalActive);
            if (checkCapture(myRank, oppRank)) captures++;
        }

        if (adjacent.right && adjacent.right.owner !== card.owner) {
            const myRank = card.getEffectiveRank('right', board.getSquareElement(row, col), elementalActive);
            const oppRank = adjacent.right.getEffectiveRank('left', board.getSquareElement(row, col + 1), elementalActive);
            if (checkCapture(myRank, oppRank)) captures++;
        }

        if (adjacent.bottom && adjacent.bottom.owner !== card.owner) {
            const myRank = card.getEffectiveRank('bottom', board.getSquareElement(row, col), elementalActive);
            const oppRank = adjacent.bottom.getEffectiveRank('top', board.getSquareElement(row + 1, col), elementalActive);
            if (checkCapture(myRank, oppRank)) captures++;
        }

        if (adjacent.left && adjacent.left.owner !== card.owner) {
            const myRank = card.getEffectiveRank('left', board.getSquareElement(row, col), elementalActive);
            const oppRank = adjacent.left.getEffectiveRank('right', board.getSquareElement(row, col - 1), elementalActive);
            if (checkCapture(myRank, oppRank)) captures++;
        }

        return captures;
    }

    /**
     * Evaluate special rules (Same and Plus)
     * @param {Board} board - Current board state
     * @param {Card} card - Card to place
     * @param {number} row - Row position
     * @param {number} col - Column position
     * @param {Object} gameRules - Active game rules
     * @returns {Object} Special rule evaluation scores
     */
    evaluateSpecialRules(board, card, row, col, gameRules) {
        const adjacent = board.getAdjacentCards(row, col);
        const result = { same: 0, plus: 0 };

        if (gameRules.same) {
            result.same = this.checkSameRuleCaptures(card, adjacent, row, col);
        }

        if (gameRules.plus) {
            result.plus = this.checkPlusRuleCaptures(card, adjacent, row, col);
        }

        return result;
    }

    /**
     * Check for Same rule captures
     * @param {Card} card - Card to place
     * @param {Object} adjacent - Adjacent cards
     * @param {number} row - Row position
     * @param {number} col - Column position
     * @returns {number} Number of Same rule captures
     */
    checkSameRuleCaptures(card, adjacent, row, col) {
        const matches = [];
        
        if (adjacent.top && adjacent.top.owner !== card.owner) {
            if (card.originalRanks.top === adjacent.top.originalRanks.bottom) {
                matches.push('top');
            }
        }
        
        if (adjacent.right && adjacent.right.owner !== card.owner) {
            if (card.originalRanks.right === adjacent.right.originalRanks.left) {
                matches.push('right');
            }
        }
        
        if (adjacent.bottom && adjacent.bottom.owner !== card.owner) {
            if (card.originalRanks.bottom === adjacent.bottom.originalRanks.top) {
                matches.push('bottom');
            }
        }
        
        if (adjacent.left && adjacent.left.owner !== card.owner) {
            if (card.originalRanks.left === adjacent.left.originalRanks.right) {
                matches.push('left');
            }
        }

        return matches.length >= 2 ? matches.length : 0;
    }

    /**
     * Check for Plus rule captures
     * @param {Card} card - Card to place
     * @param {Object} adjacent - Adjacent cards
     * @param {number} row - Row position
     * @param {number} col - Column position
     * @returns {number} Number of Plus rule captures
     */
    checkPlusRuleCaptures(card, adjacent, row, col) {
        const sums = [];
        
        if (adjacent.top && adjacent.top.owner !== card.owner) {
            sums.push(card.originalRanks.top + adjacent.top.originalRanks.bottom);
        }
        
        if (adjacent.right && adjacent.right.owner !== card.owner) {
            sums.push(card.originalRanks.right + adjacent.right.originalRanks.left);
        }
        
        if (adjacent.bottom && adjacent.bottom.owner !== card.owner) {
            sums.push(card.originalRanks.bottom + adjacent.bottom.originalRanks.top);
        }
        
        if (adjacent.left && adjacent.left.owner !== card.owner) {
            sums.push(card.originalRanks.left + adjacent.left.originalRanks.right);
        }

        // Check for matching sums
        const uniqueSums = [...new Set(sums)];
        for (const sum of uniqueSums) {
            const count = sums.filter(s => s === sum).length;
            if (count >= 2) {
                return count;
            }
        }

        return 0;
    }

    /**
     * Evaluate combo chain potential
     * @param {Board} board - Current board state
     * @param {Card} card - Card to place
     * @param {number} row - Row position
     * @param {number} col - Column position
     * @param {Object} gameRules - Active game rules
     * @returns {number} Combo chain score
     */
    evaluateComboChain(board, card, row, col, gameRules) {
        // Simplified combo evaluation - in a full implementation this would simulate the entire combo chain
        const specialCaptures = this.evaluateSpecialRules(board, card, row, col, gameRules);
        const totalSpecialCaptures = specialCaptures.same + specialCaptures.plus;
        
        // Combo multiplier based on number of special captures
        return totalSpecialCaptures > 0 ? totalSpecialCaptures * 2 : 0;
    }

    /**
     * Evaluate defensive value (blocking opponent moves)
     * @param {Board} board - Current board state
     * @param {Card} card - Card to place
     * @param {number} row - Row position
     * @param {number} col - Column position
     * @param {Array} opponentHand - Opponent's hand
     * @param {boolean} elementalActive - Whether elemental rule is active
     * @param {Object} gameRules - Active game rules
     * @returns {number} Defensive value score
     */
    evaluateDefensiveValue(board, card, row, col, opponentHand, elementalActive, gameRules) {
        // Simulate what opponent could do if we don't place here
        let maxOpponentThreat = 0;
        
        for (const opponentCard of opponentHand) {
            if (board.isPositionEmpty(row, col)) {
                const opponentCaptures = this.countBasicCaptures(board, opponentCard, row, col, elementalActive);
                const specialThreat = this.evaluateSpecialRules(board, opponentCard, row, col, gameRules);
                const totalThreat = opponentCaptures + specialThreat.same + specialThreat.plus;
                maxOpponentThreat = Math.max(maxOpponentThreat, totalThreat);
            }
        }
        
        return maxOpponentThreat;
    }

    /**
     * Evaluate elemental positioning advantages
     * @param {Board} board - Current board state
     * @param {Card} card - Card to place
     * @param {number} row - Row position
     * @param {number} col - Column position
     * @returns {number} Elemental positioning score
     */
    evaluateElementalPositioning(board, card, row, col) {
        const squareElement = board.getSquareElement(row, col);
        
        if (!squareElement || squareElement === 'None') {
            return 0;
        }
        
        // Bonus for matching element, penalty for non-matching
        if (card.element === squareElement) {
            return 3; // +1 to all ranks
        } else if (card.element !== 'None') {
            return -1; // -1 to all ranks
        }
        
        return 0;
    }

    /**
     * Evaluate positional value (corners, edges, center)
     * @param {Board} board - Current board state
     * @param {number} row - Row position
     * @param {number} col - Column position
     * @returns {number} Positional value score
     */
    evaluatePositionalValue(board, row, col) {
        // Center is generally good (more adjacent positions)
        if (row === 1 && col === 1) {
            return 3;
        }
        
        // Corners have fewer adjacent positions but can be strategic
        if ((row === 0 || row === 2) && (col === 0 || col === 2)) {
            return 1;
        }
        
        // Edges are middle ground
        return 2;
    }

    /**
     * Evaluate hand management strategy
     * @param {Array} hand - Current hand
     * @param {number} cardIndex - Index of card being considered
     * @param {Board} board - Current board state
     * @returns {number} Hand management score
     */
    evaluateHandManagement(hand, cardIndex, board) {
        const card = hand[cardIndex];
        const emptySquares = board.getEmptySquareCount();
        
        // Calculate card strength (sum of ranks)
        const cardStrength = card.originalRanks.top + card.originalRanks.right + 
                           card.originalRanks.bottom + card.originalRanks.left;
        
        // If late in game (few empty squares), prefer using weaker cards
        // If early in game, save strong cards for later
        if (emptySquares <= 3) {
            // Late game: use stronger cards
            return cardStrength / 40; // Normalize to 0-1 range
        } else {
            // Early game: prefer using weaker cards (negative score for strong cards)
            return -(cardStrength / 40);
        }
    }

    /**
     * Simulate opponent response to our move (limited lookahead)
     * @param {Board} board - Current board state
     * @param {Object} ourMove - Our proposed move
     * @param {Array} ourHand - Our hand
     * @param {Array} opponentHand - Opponent's hand
     * @param {boolean} elementalActive - Whether elemental rule is active
     * @param {Object} gameRules - Active game rules
     * @returns {number} Simulation score adjustment
     */
    simulateOpponentResponse(board, ourMove, ourHand, opponentHand, elementalActive, gameRules) {
        // This is a simplified simulation - in a full implementation you'd actually
        // apply the move to a board copy and simulate the opponent's best response
        
        // For now, just estimate the threat level
        let maxOpponentResponse = 0;
        
        const remainingSquares = board.getEmptySquareCount() - 1; // After our move
        
        for (const opponentCard of opponentHand) {
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    if (board.isPositionEmpty(row, col) && !(row === ourMove.row && col === ourMove.col)) {
                        const opponentCaptures = this.countBasicCaptures(board, opponentCard, row, col, elementalActive);
                        maxOpponentResponse = Math.max(maxOpponentResponse, opponentCaptures);
                    }
                }
            }
        }
        
        // Return negative score to account for opponent's potential
        return -maxOpponentResponse * 0.5; // Weight opponent threat lower than our gains
    }
}

module.exports = AIPlayerStrategy;