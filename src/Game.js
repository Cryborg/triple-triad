const Card = require('./Card');
const Board = require('./Board');
const Player = require('./Player');
const CardLoader = require('./CardLoader');
const EventEmitter = require('./EventEmitter');

class Game extends EventEmitter {
    /**
     * Create a new Triple Triad game instance
     * @param {Object} player1Cards - Cards for player 1 (optional, will use database if not provided)
     * @param {Object} player2Cards - Cards for player 2 (optional, will use database if not provided)  
     * @param {Object} config - Game configuration object
     * @param {Object} config.rules - Rules configuration
     * @param {boolean} config.rules.open - Open rule (hands visible)
     * @param {boolean} config.rules.random - Random rule (random card selection)
     * @param {boolean} config.rules.elemental - Elemental rule
     * @param {boolean} config.rules.same - Same rule
     * @param {boolean} config.rules.plus - Plus rule
     * @param {boolean} config.rules.sameWall - Same Wall rule
     * @param {boolean} config.rules.combo - Combo rule
     * @param {boolean} config.rules.suddenDeath - Sudden Death rule
     * @param {string} config.tradeRule - Trade rule ('One', 'Diff', 'Direct', 'All')
     * @param {string} config.player1Type - Player 1 type ('human' or 'ai')
     * @param {string} config.player2Type - Player 2 type ('human' or 'ai')
     */
    constructor(player1Cards = null, player2Cards = null, config = {}) {
        super(); // Initialize EventEmitter
        
        // Handle legacy constructor calls (rules object passed directly)
        if (typeof player1Cards === 'object' && player1Cards !== null && !Array.isArray(player1Cards) && !player1Cards.hasOwnProperty('top')) {
            // Legacy call: new Game(rules)
            config = player1Cards;
            player1Cards = null;
            player2Cards = null;
        }

        // Default configuration
        const defaultConfig = {
            rules: {
                open: false,
                random: false,
                elemental: false,
                same: false,
                plus: false,
                sameWall: false,
                combo: false,
                suddenDeath: false
            },
            tradeRule: 'One',
            player1Type: 'human',
            player2Type: 'ai'
        };

        // Handle direct rules object (legacy compatibility)
        if (config.hasOwnProperty('open') || config.hasOwnProperty('random') || config.hasOwnProperty('elemental')) {
            // Legacy call with direct rules object
            config = { rules: config, tradeRule: config.tradeRule || 'One' };
        }

        // Merge with provided configuration
        this.config = this.mergeConfig(defaultConfig, config);
        this.rules = { ...this.config.rules, tradeRule: this.config.tradeRule };
        
        // Validate configuration
        this.validateConfiguration();

        this.board = new Board();
        this.players = {
            BLUE: new Player('BLUE', this.config.player1Type === 'ai'),
            RED: new Player('RED', this.config.player2Type === 'ai')
        };
        this.currentPlayer = null;
        this.turnCount = 0;
        this.suddenDeathCounter = 0;
        
        // Store custom cards if provided
        this.customPlayer1Cards = player1Cards;
        this.customPlayer2Cards = player2Cards;
    }

    /**
     * Deep merge configuration objects
     */
    mergeConfig(defaultConfig, userConfig) {
        const merged = { ...defaultConfig };
        
        if (userConfig.rules) {
            merged.rules = { ...defaultConfig.rules, ...userConfig.rules };
        }
        
        if (userConfig.tradeRule) merged.tradeRule = userConfig.tradeRule;
        if (userConfig.player1Type) merged.player1Type = userConfig.player1Type;
        if (userConfig.player2Type) merged.player2Type = userConfig.player2Type;
        
        return merged;
    }

    /**
     * Validate game configuration
     */
    validateConfiguration() {
        const validTradeRules = ['One', 'Diff', 'Direct', 'All'];
        const validPlayerTypes = ['human', 'ai'];
        
        if (!validTradeRules.includes(this.config.tradeRule)) {
            throw new Error(`Invalid trade rule: ${this.config.tradeRule}. Must be one of: ${validTradeRules.join(', ')}`);
        }
        
        if (!validPlayerTypes.includes(this.config.player1Type)) {
            throw new Error(`Invalid player1Type: ${this.config.player1Type}. Must be 'human' or 'ai'`);
        }
        
        if (!validPlayerTypes.includes(this.config.player2Type)) {
            throw new Error(`Invalid player2Type: ${this.config.player2Type}. Must be 'human' or 'ai'`);
        }
        
        // Validate rule dependencies
        if (this.config.rules.combo && !this.config.rules.same && !this.config.rules.plus) {
            console.warn('Warning: Combo rule is active but neither Same nor Plus rules are active. Combo will have no effect.');
        }
        
        if (this.config.rules.sameWall && !this.config.rules.same) {
            console.warn('Warning: Same Wall rule is active but Same rule is not active. Same Wall will have no effect.');
        }
    }

    /**
     * Create a game with preset rule configurations
     * @param {string} preset - Preset name
     * @param {Object} overrides - Additional configuration overrides
     * @returns {Game} New game instance
     */
    static createWithPreset(preset, overrides = {}) {
        const presets = {
            'basic': { rules: {} },
            'elemental': { rules: { elemental: true } },
            'advanced': { rules: { same: true, plus: true, combo: true } },
            'complete': { 
                rules: { 
                    open: true, 
                    random: true, 
                    elemental: true, 
                    same: true, 
                    plus: true, 
                    sameWall: true, 
                    combo: true, 
                    suddenDeath: true 
                },
                tradeRule: 'All'
            },
            'tournament': {
                rules: {
                    elemental: true,
                    same: true,
                    plus: true,
                    combo: true
                },
                tradeRule: 'Diff'
            }
        };

        if (!presets[preset]) {
            throw new Error(`Unknown preset: ${preset}. Available presets: ${Object.keys(presets).join(', ')}`);
        }

        const config = { ...presets[preset], ...overrides };
        return new Game(null, null, config);
    }

    initialize() {
        if (this.rules.elemental) {
            this.board.initializeElementalSquares();
        }
        this.setupPlayerCollections();
        this.distributeCards();
        this.currentPlayer = Math.random() < 0.5 ? 'BLUE' : 'RED';
        console.log(`\n=== Triple Triad v0.9 ===`);
        console.log(`Active Rules: ${this.formatActiveRules()}`);
        console.log(`Trade Rule: ${this.rules.tradeRule}`);
        console.log(`${this.currentPlayer} starts the game!\n`);
        
        // Emit game started event
        this.emit('game:started', {
            rules: this.rules,
            startingPlayer: this.currentPlayer,
            players: {
                BLUE: { isAI: this.players.BLUE.isAI, hand: this.players.BLUE.hand.length },
                RED: { isAI: this.players.RED.isAI, hand: this.players.RED.hand.length }
            }
        });
    }

    formatActiveRules() {
        const activeRules = [];
        if (this.rules.open) activeRules.push('Open');
        if (this.rules.random) activeRules.push('Random');
        if (this.rules.elemental) activeRules.push('Elemental');
        if (this.rules.same) activeRules.push('Same');
        if (this.rules.plus) activeRules.push('Plus');
        if (this.rules.sameWall) activeRules.push('Same Wall');
        if (this.rules.combo) activeRules.push('Combo');
        if (this.rules.suddenDeath) activeRules.push('Sudden Death');
        
        return activeRules.length > 0 ? activeRules.join(', ') : 'Basic rules only';
    }

    /**
     * Initialize card collections for both players using external card data
     */
    setupPlayerCollections() {
        const blueCollection = CardLoader.getPlayerCollection(20);
        const redCollection = CardLoader.getPlayerCollection(20);
        
        blueCollection.forEach(cardData => {
            const card = Card.fromJSON(cardData, 'BLUE');
            this.players.BLUE.addCardToCollection(card);
        });
        
        redCollection.forEach(cardData => {
            const card = Card.fromJSON(cardData, 'RED');
            this.players.RED.addCardToCollection(card);
        });
    }

    distributeCards() {
        this.players.BLUE.clearHand();
        this.players.RED.clearHand();
        
        if (this.rules.random) {
            this.distributeRandomCards();
        } else {
            this.distributeChosenCards();
        }
    }

    distributeRandomCards() {
        const blueCards = [...this.players.BLUE.collection].sort(() => Math.random() - 0.5).slice(0, 5);
        const redCards = [...this.players.RED.collection].sort(() => Math.random() - 0.5).slice(0, 5);
        
        blueCards.forEach(card => {
            const handCard = new Card(card.originalRanks.top, card.originalRanks.right, card.originalRanks.bottom, card.originalRanks.left, 'BLUE', card.element, { id: card.id, name: card.name });
            this.players.BLUE.addCardToHand(handCard);
        });
        
        redCards.forEach(card => {
            const handCard = new Card(card.originalRanks.top, card.originalRanks.right, card.originalRanks.bottom, card.originalRanks.left, 'RED', card.element, { id: card.id, name: card.name });
            this.players.RED.addCardToHand(handCard);
        });
        
        console.log('Cards randomly selected from collections');
    }

    distributeChosenCards() {
        const chosenCards = this.players.BLUE.collection.slice(0, 5);
        const aiChosenCards = this.players.RED.collection.slice(0, 5);
        
        chosenCards.forEach(card => {
            const handCard = new Card(card.originalRanks.top, card.originalRanks.right, card.originalRanks.bottom, card.originalRanks.left, 'BLUE', card.element, { id: card.id, name: card.name });
            this.players.BLUE.addCardToHand(handCard);
        });
        
        aiChosenCards.forEach(card => {
            const handCard = new Card(card.originalRanks.top, card.originalRanks.right, card.originalRanks.bottom, card.originalRanks.left, 'RED', card.element, { id: card.id, name: card.name });
            this.players.RED.addCardToHand(handCard);
        });
        
        console.log('Cards chosen from collections');
    }

    playTurn() {
        const player = this.players[this.currentPlayer];
        const opponent = this.players[this.currentPlayer === 'BLUE' ? 'RED' : 'BLUE'];
        
        // Emit turn started event
        this.emit('turn:started', {
            currentPlayer: this.currentPlayer,
            turnCount: this.turnCount,
            isAI: player.isAI,
            cardsRemaining: player.hand.length
        });
        
        if (this.rules.open) {
            console.log(`\n=== Open Rule: Both hands visible ===`);
            this.players.BLUE.displayHand();
            this.players.RED.displayHand();
        }
        
        if (player.isAI) {
            console.log(`\n=== Turn ${this.turnCount + 1}/9 - ${this.currentPlayer} (AI) ===`);
            const opponentHand = this.rules.open ? opponent.hand : null;
            const move = player.getSmartMove(this.board, opponentHand, this.rules.elemental, this.rules);
            
            if (move) {
                const card = player.getCard(move.cardIndex);
                console.log(`🤖 AI places ${card.toString()} at position (${move.row}, ${move.col})`);
                this.makeMove(move.cardIndex, move.row, move.col);
            }
        } else {
            console.log(`\n=== Turn ${this.turnCount + 1}/9 - ${this.currentPlayer} (Human) ===`);
            this.board.display(this.rules.elemental);
            if (!this.rules.open) {
                console.log(`\n${this.currentPlayer} has ${player.hand.length} cards remaining:`);
                player.displayHand();
            }
            console.log(`Choose your move:`);
            return false;
        }
        
        return true;
    }

    /**
     * Make a move in the game
     * @param {number} cardIndex - Index of card in player's hand (0-4)
     * @param {number} row - Row position on board (0-2)
     * @param {number} col - Column position on board (0-2)
     * @returns {boolean} True if move was successful, false otherwise
     */
    makeMove(cardIndex, row, col) {
        // Validate game state
        if (this.checkGameEnd()) {
            console.error('Invalid move: Game has already ended!');
            return false;
        }

        const player = this.players[this.currentPlayer];
        
        // Validate inputs
        const validation = this.validateMoveInputs(cardIndex, row, col, player);
        if (!validation.valid) {
            console.error(`Invalid move: ${validation.error}`);
            return false;
        }
        
        try {
            const card = player.playCard(cardIndex);
            this.board.placeCard(card, row, col);
            
            // Emit card placed event
            this.emit('card:placed', {
                card: {
                    ranks: card.originalRanks,
                    element: card.element,
                    owner: card.owner,
                    id: card.id,
                    name: card.name
                },
                position: { row, col },
                player: this.currentPlayer,
                turnCount: this.turnCount
            });
            
            this.resolveCaptures(card, row, col);
            
            this.turnCount++;
            this.currentPlayer = this.currentPlayer === 'BLUE' ? 'RED' : 'BLUE';
            
            return true;
        } catch (error) {
            console.error(`Move failed: ${error.message}`);
            return false;
        }
    }

    /**
     * Validate move inputs
     * @param {number} cardIndex - Card index to validate
     * @param {number} row - Row to validate
     * @param {number} col - Column to validate
     * @param {Player} player - Player making the move
     * @returns {Object} Validation result with valid flag and error message
     */
    validateMoveInputs(cardIndex, row, col, player) {
        // Check if inputs are numbers
        if (!Number.isInteger(cardIndex) || !Number.isInteger(row) || !Number.isInteger(col)) {
            return { valid: false, error: 'Card index, row, and column must be integers' };
        }

        // Check card index bounds
        if (cardIndex < 0 || cardIndex >= player.hand.length) {
            return { valid: false, error: `Card index must be between 0 and ${player.hand.length - 1}` };
        }

        // Check position bounds
        if (row < 0 || row > 2 || col < 0 || col > 2) {
            return { valid: false, error: 'Position must be between (0,0) and (2,2)' };
        }

        // Check if position is empty
        if (!this.board.isPositionEmpty(row, col)) {
            return { valid: false, error: `Position (${row}, ${col}) is already occupied` };
        }

        // Check if player has cards
        if (player.hand.length === 0) {
            return { valid: false, error: 'Player has no cards to play' };
        }

        return { valid: true };
    }

    /**
     * Resolve all captures triggered by placing a card
     * @param {Card} placedCard - The card that was just placed
     * @param {number} row - Row where the card was placed
     * @param {number} col - Column where the card was placed
     */
    resolveCaptures(placedCard, row, col) {
        const cardsFlippedThisTurn = new Set();
        const comboCheckQueue = [];
        let specialRuleTriggered = false;
        
        if (this.rules.same || this.rules.plus) {
            const initialCaptures = this.checkSpecialRules(placedCard, row, col);
            
            if (initialCaptures.length > 0) {
                specialRuleTriggered = true;
                initialCaptures.forEach(card => {
                    cardsFlippedThisTurn.add(card);
                    comboCheckQueue.push(card);
                });
                
                this.logSpecialCaptures(initialCaptures, placedCard);
            }
        }
        
        if (this.rules.combo && specialRuleTriggered) {
            this.processComboChain(comboCheckQueue, cardsFlippedThisTurn, placedCard.owner);
        }
        
        if (!specialRuleTriggered) {
            const basicCaptures = this.getBasicCaptures(placedCard, row, col);
            basicCaptures.forEach(card => cardsFlippedThisTurn.add(card));
            if (basicCaptures.length > 0) {
                const captureDesc = basicCaptures.map(card => card.toString()).join(', ');
                console.log(`⚔️  ${placedCard.owner} captured ${basicCaptures.length} card(s) by Basic rule: ${captureDesc}`);
            }
        }
        
        this.applyFinalCaptures(cardsFlippedThisTurn, placedCard.owner);
    }

    getAdjacentCardsInfo(row, col) {
        const adjacent = this.board.getAdjacentCards(row, col);
        const adjacentPositions = {
            top: { row: row - 1, col },
            right: { row, col: col + 1 },
            bottom: { row: row + 1, col },
            left: { row, col: col - 1 }
        };

        return [
            {
                side: 'top',
                card: adjacent.top,
                adjacentSide: 'bottom',
                position: adjacentPositions.top
            },
            {
                side: 'right',
                card: adjacent.right,
                adjacentSide: 'left',
                position: adjacentPositions.right
            },
            {
                side: 'bottom',
                card: adjacent.bottom,
                adjacentSide: 'top',
                position: adjacentPositions.bottom
            },
            {
                side: 'left',
                card: adjacent.left,
                adjacentSide: 'right',
                position: adjacentPositions.left
            }
        ];
    }

    /**
     * Check for Same and Plus rule triggers
     * @param {Card} placedCard - The card that was placed
     * @param {number} row - Row position
     * @param {number} col - Column position
     * @returns {Array} Array of captured cards
     */
    checkSpecialRules(placedCard, row, col) {
        const adjacentCards = this.getAdjacentCardsInfo(row, col);
        const captures = [];
        
        if (this.rules.same) {
            const sameCaptures = this.getSameCaptures(placedCard, row, col, adjacentCards);
            captures.push(...sameCaptures);
        }
        
        if (this.rules.plus) {
            const plusCaptures = this.getPlusCaptures(placedCard, adjacentCards);
            captures.push(...plusCaptures);
        }
        
        return [...new Set(captures)];
    }

    getSameCaptures(placedCard, row, col, adjacentCards) {
        let sameMatches = 0;
        const sameCandidates = [];

        for (const { side, card, adjacentSide } of adjacentCards) {
            if (card) {
                const placedRank = placedCard.getOriginalRank(side);
                const adjacentRank = card.getOriginalRank(adjacentSide);
                
                if (placedRank === adjacentRank) {
                    sameMatches++;
                    sameCandidates.push(card);
                }
            }
        }

        if (this.rules.sameWall) {
            const wallSides = [];
            if (row === 0) wallSides.push('top');
            if (row === 2) wallSides.push('bottom');
            if (col === 0) wallSides.push('left');
            if (col === 2) wallSides.push('right');

            for (const wallSide of wallSides) {
                const wallRank = placedCard.getOriginalRank(wallSide);
                if (wallRank === 10) {
                    sameMatches++;
                }
            }
        }

        if (sameMatches >= 2) {
            return sameCandidates.filter(card => card.owner !== placedCard.owner);
        }
        
        return [];
    }

    getPlusCaptures(placedCard, adjacentCards) {
        const validPairs = [];
        const adjacentCardsArray = adjacentCards.filter(info => info.card);
        const captures = [];

        for (let i = 0; i < adjacentCardsArray.length; i++) {
            for (let j = i + 1; j < adjacentCardsArray.length; j++) {
                const card1 = adjacentCardsArray[i];
                const card2 = adjacentCardsArray[j];
                
                const sum1 = placedCard.getOriginalRank(card1.side) + card1.card.getOriginalRank(card1.adjacentSide);
                const sum2 = placedCard.getOriginalRank(card2.side) + card2.card.getOriginalRank(card2.adjacentSide);
                
                if (sum1 === sum2) {
                    validPairs.push([card1.card, card2.card]);
                }
            }
        }

        if (validPairs.length > 0) {
            validPairs.forEach(pair => {
                pair.forEach(card => {
                    if (card.owner !== placedCard.owner) {
                        captures.push(card);
                    }
                });
            });
        }
        
        return captures;
    }

    /**
     * Process combo chain reactions from captured cards
     * @param {Array} comboCheckQueue - Queue of cards to check for combo triggers
     * @param {Set} cardsFlippedThisTurn - Set of all cards flipped this turn
     * @param {string} currentOwner - Owner of the cards doing the capturing
     */
    processComboChain(comboCheckQueue, cardsFlippedThisTurn, currentOwner) {
        let comboCount = 0;
        
        while (comboCheckQueue.length > 0) {
            const cardToComboCheck = comboCheckQueue.shift();
            const cardPosition = this.findCardPosition(cardToComboCheck);
            
            if (!cardPosition) continue;
            
            const adjacentCards = this.getAdjacentCardsInfo(cardPosition.row, cardPosition.col);
            
            for (const { side, card, adjacentSide, position } of adjacentCards) {
                if (card && card.owner !== currentOwner && !cardsFlippedThisTurn.has(card)) {
                    const cardToComboRank = this.getEffectiveRankForCombo(cardToComboCheck, side, cardPosition);
                    const neighborRank = this.getEffectiveRankForCombo(card, adjacentSide, position);
                    
                    if (cardToComboRank > neighborRank) {
                        cardsFlippedThisTurn.add(card);
                        comboCheckQueue.push(card);
                        comboCount++;
                    }
                }
            }
        }
        
        if (comboCount > 0) {
            console.log(`🔗 ${currentOwner} captured ${comboCount} additional card(s) by Combo chain!`);
        }
    }

    findCardPosition(targetCard) {
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (this.board.getCard(row, col) === targetCard) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    getEffectiveRankForCombo(card, side, position) {
        if (this.rules.elemental) {
            const squareElement = this.board.getSquareElement(position.row, position.col);
            return card.getEffectiveRank(side, squareElement, true);
        } else {
            return card.getRank(side);
        }
    }

    logSpecialCaptures(captures, placedCard) {
        const ruleTypes = [];
        if (this.rules.same) ruleTypes.push('Same');
        if (this.rules.plus) ruleTypes.push('Plus');
        
        if (captures.length > 0) {
            const captureDesc = captures.map(card => card.toString()).join(', ');
            console.log(`⚡ ${placedCard.owner} captured ${captures.length} card(s) by ${ruleTypes.join('/')}: ${captureDesc}`);
        }
    }

    /**
     * Get cards captured by basic rank comparison rules
     * @param {Card} placedCard - The card that was placed
     * @param {number} row - Row position
     * @param {number} col - Column position
     * @returns {Array} Array of captured cards
     */
    getBasicCaptures(placedCard, row, col) {
        const captures = [];
        const adjacentCards = this.getAdjacentCardsInfo(row, col);
        const placedSquareElement = this.board.getSquareElement(row, col);

        for (const { side, card, adjacentSide, position } of adjacentCards) {
            if (card && card.owner !== placedCard.owner) {
                let placedRank, adjacentRank;
                
                if (this.rules.elemental) {
                    const adjacentSquareElement = this.board.getSquareElement(position.row, position.col);
                    placedRank = placedCard.getEffectiveRank(side, placedSquareElement, true);
                    adjacentRank = card.getEffectiveRank(adjacentSide, adjacentSquareElement, true);
                } else {
                    placedRank = placedCard.getRank(side);
                    adjacentRank = card.getRank(adjacentSide);
                }
                
                if (placedRank > adjacentRank) {
                    captures.push(card);
                }
            }
        }

        return captures;
    }

    /**
     * Apply final captures and emit events
     * @param {Set} cardsFlippedThisTurn - Set of cards to capture
     * @param {string} newOwner - New owner for the cards
     */
    applyFinalCaptures(cardsFlippedThisTurn, newOwner) {
        cardsFlippedThisTurn.forEach(card => {
            const oldOwner = card.owner;
            card.changeOwner(newOwner);
            
            // Emit card captured event
            this.emit('card:captured', {
                card: {
                    ranks: card.originalRanks,
                    element: card.element,
                    id: card.id,
                    name: card.name
                },
                oldOwner: oldOwner,
                newOwner: newOwner,
                captureRule: this.determineCaptureRule(),
                turnCount: this.turnCount
            });
        });
    }

    /**
     * Determine which rule caused the capture (for event emission)
     * This is a simplified version - in a real implementation you'd track this more precisely
     * @returns {string} The rule that caused the capture
     */
    determineCaptureRule() {
        // This is a simplified implementation
        // In a full implementation, we'd track the actual rule that triggered each capture
        if (this.rules.same) return 'Same';
        if (this.rules.plus) return 'Plus';
        if (this.rules.combo) return 'Combo';
        return 'Basic';
    }

    checkGameEnd() {
        return this.turnCount >= 9;
    }

    determineWinner() {
        const counts = this.board.countCardsByOwner();
        
        const bluePlayer = this.players.BLUE;
        const redPlayer = this.players.RED;
        
        let blueScore = counts.BLUE || 0;
        let redScore = counts.RED || 0;
        
        if (bluePlayer.hasCards()) blueScore += bluePlayer.hand.length;
        if (redPlayer.hasCards()) redScore += redPlayer.hand.length;

        console.log(`\nFinal Score:`);
        console.log(`BLUE: ${blueScore} cards`);
        console.log(`RED: ${redScore} cards`);

        if (blueScore > redScore) {
            console.log('BLUE wins!');
            this.applyTradeRule(bluePlayer, redPlayer, blueScore, redScore);
            this.suddenDeathCounter = 0;
            
            // Emit game ended event
            this.emit('game:ended', {
                result: 'WINNER_DETERMINED',
                winner: 'BLUE',
                scores: { BLUE: blueScore, RED: redScore },
                totalTurns: this.turnCount
            });
            
            return { result: 'WINNER_DETERMINED', winner: 'BLUE' };
        } else if (redScore > blueScore) {
            console.log('RED wins!');
            this.applyTradeRule(redPlayer, bluePlayer, redScore, blueScore);
            this.suddenDeathCounter = 0;
            
            // Emit game ended event
            this.emit('game:ended', {
                result: 'WINNER_DETERMINED',
                winner: 'RED',
                scores: { BLUE: blueScore, RED: redScore },
                totalTurns: this.turnCount
            });
            
            return { result: 'WINNER_DETERMINED', winner: 'RED' };
        } else {
            if (this.rules.suddenDeath) {
                this.suddenDeathCounter++;
                
                if (this.suddenDeathCounter < 5) {
                    console.log(`\nMort Subite! Nouvelle partie... (${this.suddenDeathCounter}/5)`);
                    
                    // Emit sudden death triggered event
                    this.emit('suddenDeath:triggered', {
                        attempt: this.suddenDeathCounter,
                        maxAttempts: 5
                    });
                    
                    this.initializeSuddenDeath();
                    return { result: 'SUDDEN_DEATH_CONTINUE' };
                } else {
                    console.log('\nÉgalité finale après Mort Subite!');
                    
                    // Emit game ended event for final draw
                    this.emit('game:ended', {
                        result: 'FINAL_DRAW',
                        winner: null,
                        scores: { BLUE: blueScore, RED: redScore },
                        totalTurns: this.turnCount,
                        suddenDeathAttempts: this.suddenDeathCounter
                    });
                    
                    return { result: 'FINAL_DRAW' };
                }
            } else {
                console.log('\nC\'est une égalité!');
                
                // Emit game ended event for draw
                this.emit('game:ended', {
                    result: 'DRAW',
                    winner: null,
                    scores: { BLUE: blueScore, RED: redScore },
                    totalTurns: this.turnCount
                });
                
                return { result: 'DRAW' };
            }
        }
    }

    applyTradeRule(winnerPlayer, loserPlayer, winnerScore, loserScore) {
        console.log(`\nApplying trade rule: ${this.rules.tradeRule}`);
        
        switch (this.rules.tradeRule) {
            case 'One':
                this.applyOneRule(winnerPlayer, loserPlayer);
                break;
            case 'Diff':
                const diff = winnerScore - loserScore;
                this.applyDiffRule(winnerPlayer, loserPlayer, diff);
                break;
            case 'Direct':
                this.applyDirectRule(winnerPlayer, loserPlayer);
                break;
            case 'All':
                this.applyAllRule(winnerPlayer, loserPlayer);
                break;
            default:
                console.log('Unknown trade rule, no cards exchanged.');
        }
    }

    applyOneRule(winnerPlayer, loserPlayer) {
        if (loserPlayer.collection.length === 0) {
            console.log(`${loserPlayer.id} has no cards to trade.`);
            return;
        }

        let chosenCard;
        if (winnerPlayer.isAI) {
            chosenCard = this.chooseCardForAI(loserPlayer.collection);
        } else {
            console.log(`\n${winnerPlayer.id} chooses 1 card from ${loserPlayer.id}'s collection:`);
            loserPlayer.collection.forEach((card, index) => {
                console.log(`${index}: ${card.toString()}`);
            });
            
            const index = 0;
            chosenCard = loserPlayer.collection[index];
        }

        if (loserPlayer.removeCardFromCollection(chosenCard)) {
            winnerPlayer.addCardToCollection(chosenCard);
            console.log(`${winnerPlayer.id} takes ${chosenCard.toString()} from ${loserPlayer.id}`);
            
            // Emit trade applied event
            this.emit('trade:applied', {
                rule: 'One',
                winner: winnerPlayer.id,
                loser: loserPlayer.id,
                cardsTraded: [chosenCard.toString()]
            });
        }
    }

    applyDiffRule(winnerPlayer, loserPlayer, diff) {
        if (loserPlayer.collection.length === 0) {
            console.log(`${loserPlayer.id} has no cards to trade.`);
            return;
        }

        const cardsToTake = Math.min(diff, loserPlayer.collection.length);
        console.log(`${winnerPlayer.id} takes ${cardsToTake} card(s) from ${loserPlayer.id}`);

        for (let i = 0; i < cardsToTake; i++) {
            let chosenCard;
            if (winnerPlayer.isAI) {
                chosenCard = this.chooseCardForAI(loserPlayer.collection);
            } else {
                console.log(`\nChoose card ${i + 1}/${cardsToTake} from ${loserPlayer.id}'s collection:`);
                loserPlayer.collection.forEach((card, index) => {
                    console.log(`${index}: ${card.toString()}`);
                });
                
                const index = 0;
                chosenCard = loserPlayer.collection[index];
            }

            if (loserPlayer.removeCardFromCollection(chosenCard)) {
                winnerPlayer.addCardToCollection(chosenCard);
                console.log(`${winnerPlayer.id} takes ${chosenCard.toString()}`);
            }
        }
    }

    applyDirectRule(winnerPlayer, loserPlayer) {
        const boardCards = this.board.getAllCardsOnBoardWithOwners();
        let winnerCardsMoved = 0;
        let loserCardsMoved = 0;

        boardCards.forEach(({ card, owner }) => {
            if (owner === winnerPlayer.id) {
                const cardInCollection = winnerPlayer.collection.find(c => 
                    c.originalRanks.top === card.originalRanks.top &&
                    c.originalRanks.right === card.originalRanks.right &&
                    c.originalRanks.bottom === card.originalRanks.bottom &&
                    c.originalRanks.left === card.originalRanks.left &&
                    c.element === card.element
                );
                
                if (!cardInCollection) {
                    const cardCopy = new (require('./Card'))(
                        card.originalRanks.top,
                        card.originalRanks.right,
                        card.originalRanks.bottom,
                        card.originalRanks.left,
                        winnerPlayer.id,
                        card.element
                    );
                    winnerPlayer.addCardToCollection(cardCopy);
                    winnerCardsMoved++;
                }
            } else if (owner === loserPlayer.id) {
                const cardInCollection = loserPlayer.collection.find(c => 
                    c.originalRanks.top === card.originalRanks.top &&
                    c.originalRanks.right === card.originalRanks.right &&
                    c.originalRanks.bottom === card.originalRanks.bottom &&
                    c.originalRanks.left === card.originalRanks.left &&
                    c.element === card.element
                );
                
                if (!cardInCollection) {
                    const cardCopy = new (require('./Card'))(
                        card.originalRanks.top,
                        card.originalRanks.right,
                        card.originalRanks.bottom,
                        card.originalRanks.left,
                        loserPlayer.id,
                        card.element
                    );
                    loserPlayer.addCardToCollection(cardCopy);
                    loserCardsMoved++;
                }
            }
        });

        console.log(`Direct rule: ${winnerPlayer.id} gained ${winnerCardsMoved} cards, ${loserPlayer.id} gained ${loserCardsMoved} cards`);
    }

    applyAllRule(winnerPlayer, loserPlayer) {
        const cardsToMove = [...loserPlayer.collection];
        console.log(`${winnerPlayer.id} takes all ${cardsToMove.length} cards from ${loserPlayer.id}`);

        cardsToMove.forEach(card => {
            loserPlayer.removeCardFromCollection(card);
            winnerPlayer.addCardToCollection(card);
        });
    }

    chooseCardForAI(collection) {
        return collection.reduce((best, current) => {
            const bestTotal = best.originalRanks.top + best.originalRanks.right + best.originalRanks.bottom + best.originalRanks.left;
            const currentTotal = current.originalRanks.top + current.originalRanks.right + current.originalRanks.bottom + current.originalRanks.left;
            return currentTotal > bestTotal ? current : best;
        });
    }

    initializeSuddenDeath() {
        const blueControlledCards = this.players.BLUE.getCardsControlledOnBoard(this.board);
        const redControlledCards = this.players.RED.getCardsControlledOnBoard(this.board);

        if (this.players.BLUE.hasCards()) {
            blueControlledCards.push(...this.players.BLUE.hand);
        }
        if (this.players.RED.hasCards()) {
            redControlledCards.push(...this.players.RED.hand);
        }

        this.board = new Board();
        if (this.rules.elemental) {
            this.board.initializeElementalSquares();
        }

        this.players.BLUE.clearHand();
        this.players.RED.clearHand();

        blueControlledCards.forEach(card => {
            const newCard = new (require('./Card'))(
                card.originalRanks.top,
                card.originalRanks.right,
                card.originalRanks.bottom,
                card.originalRanks.left,
                'BLUE',
                card.element
            );
            this.players.BLUE.addCardToHand(newCard);
        });

        redControlledCards.forEach(card => {
            const newCard = new (require('./Card'))(
                card.originalRanks.top,
                card.originalRanks.right,
                card.originalRanks.bottom,
                card.originalRanks.left,
                'RED',
                card.element
            );
            this.players.RED.addCardToHand(newCard);
        });

        this.turnCount = 0;
        this.currentPlayer = Math.random() < 0.5 ? 'BLUE' : 'RED';

        console.log(`\nSudden Death initialized!`);
        console.log(`BLUE starts with ${this.players.BLUE.hand.length} cards`);
        console.log(`RED starts with ${this.players.RED.hand.length} cards`);
        console.log(`${this.currentPlayer} starts the sudden death round!\n`);
    }

    displayGameState() {
        console.log('\n=== Current Game State ===');
        this.board.display(this.rules.elemental);
        
        const counts = this.board.countCardsByOwner();
        console.log('Cards on board:');
        console.log(`BLUE: ${counts.BLUE || 0}`);
        console.log(`RED: ${counts.RED || 0}`);
        console.log(`Turn: ${this.turnCount + 1}/9`);
    }
}

module.exports = Game;