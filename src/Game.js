const Card = require('./Card');
const Board = require('./Board');
const Player = require('./Player');
const CardDatabaseV3 = require('./CardDatabaseV3');

class Game {
    constructor(rules = { open: false, random: false, elemental: false, same: false, plus: false, sameWall: false, combo: false, suddenDeath: false, tradeRule: 'One' }) {
        this.board = new Board();
        this.players = {
            BLUE: new Player('BLUE', false),
            RED: new Player('RED', true)
        };
        this.currentPlayer = null;
        this.turnCount = 0;
        this.suddenDeathCounter = 0;
        this.rules = rules;
    }

    initialize() {
        if (this.rules.elemental) {
            this.board.initializeElementalSquares();
        }
        this.setupPlayerCollections();
        this.distributeCards();
        this.currentPlayer = Math.random() < 0.5 ? 'BLUE' : 'RED';
        console.log(`\n=== Triple Triad v0.6 ===`);
        console.log(`Rules: Open=${this.rules.open}, Random=${this.rules.random}, Elemental=${this.rules.elemental}, Same=${this.rules.same}, Plus=${this.rules.plus}, Same Wall=${this.rules.sameWall}, Combo=${this.rules.combo}, Sudden Death=${this.rules.suddenDeath}, Trade=${this.rules.tradeRule}`);
        console.log(`${this.currentPlayer} starts the game!\n`);
    }

    setupPlayerCollections() {
        const blueCollection = CardDatabaseV3.getPlayerCollection('BLUE');
        const redCollection = CardDatabaseV3.getPlayerCollection('RED');
        
        blueCollection.forEach(cardData => {
            const card = new Card(
                cardData.ranks[0],
                cardData.ranks[1],
                cardData.ranks[2],
                cardData.ranks[3],
                'BLUE',
                cardData.element
            );
            this.players.BLUE.addCardToCollection(card);
        });
        
        redCollection.forEach(cardData => {
            const card = new Card(
                cardData.ranks[0],
                cardData.ranks[1],
                cardData.ranks[2],
                cardData.ranks[3],
                'RED',
                cardData.element
            );
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
            const handCard = new Card(card.originalRanks.top, card.originalRanks.right, card.originalRanks.bottom, card.originalRanks.left, 'BLUE', card.element);
            this.players.BLUE.addCardToHand(handCard);
        });
        
        redCards.forEach(card => {
            const handCard = new Card(card.originalRanks.top, card.originalRanks.right, card.originalRanks.bottom, card.originalRanks.left, 'RED', card.element);
            this.players.RED.addCardToHand(handCard);
        });
        
        console.log('Cards randomly selected from collections');
    }

    distributeChosenCards() {
        const chosenCards = this.players.BLUE.collection.slice(0, 5);
        const aiChosenCards = this.players.RED.collection.slice(0, 5);
        
        chosenCards.forEach(card => {
            const handCard = new Card(card.originalRanks.top, card.originalRanks.right, card.originalRanks.bottom, card.originalRanks.left, 'BLUE', card.element);
            this.players.BLUE.addCardToHand(handCard);
        });
        
        aiChosenCards.forEach(card => {
            const handCard = new Card(card.originalRanks.top, card.originalRanks.right, card.originalRanks.bottom, card.originalRanks.left, 'RED', card.element);
            this.players.RED.addCardToHand(handCard);
        });
        
        console.log('Cards chosen from collections');
    }

    playTurn() {
        const player = this.players[this.currentPlayer];
        const opponent = this.players[this.currentPlayer === 'BLUE' ? 'RED' : 'BLUE'];
        
        if (this.rules.open) {
            console.log(`\n=== Open Rule: Both hands visible ===`);
            this.players.BLUE.displayHand();
            this.players.RED.displayHand();
        }
        
        if (player.isAI) {
            console.log(`\n${this.currentPlayer}'s turn (AI):`);
            const opponentHand = this.rules.open ? opponent.hand : null;
            const move = player.getSmartMove(this.board, opponentHand, this.rules.elemental);
            
            if (move) {
                const card = player.getCard(move.cardIndex);
                console.log(`AI plays ${card.toString()} at position (${move.row}, ${move.col})`);
                this.makeMove(move.cardIndex, move.row, move.col);
            }
        } else {
            this.board.display(this.rules.elemental);
            if (!this.rules.open) {
                player.displayHand();
            }
            console.log(`\n${this.currentPlayer}'s turn:`);
            return false;
        }
        
        return true;
    }

    makeMove(cardIndex, row, col) {
        const player = this.players[this.currentPlayer];
        
        if (!this.board.isPositionEmpty(row, col)) {
            console.error('Invalid move: This position is already occupied!');
            return false;
        }
        
        try {

            const card = player.playCard(cardIndex);
            this.board.placeCard(card, row, col);
            
            this.resolveCaptures(card, row, col);
            
            this.turnCount++;
            this.currentPlayer = this.currentPlayer === 'BLUE' ? 'RED' : 'BLUE';
            
            return true;
        } catch (error) {
            console.error(`Invalid move: ${error.message}`);
            return false;
        }
    }

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
                console.log(`${placedCard.owner} captured ${basicCaptures.length} card(s)!`);
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
            console.log(`${currentOwner} captured ${comboCount} additional card(s) by Combo!`);
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
        
        console.log(`${placedCard.owner} captured ${captures.length} card(s) by ${ruleTypes.join('/')}!`);
    }

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

    applyFinalCaptures(cardsFlippedThisTurn, newOwner) {
        cardsFlippedThisTurn.forEach(card => {
            card.changeOwner(newOwner);
        });
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
            return { result: 'WINNER_DETERMINED', winner: 'BLUE' };
        } else if (redScore > blueScore) {
            console.log('RED wins!');
            this.applyTradeRule(redPlayer, bluePlayer, redScore, blueScore);
            this.suddenDeathCounter = 0;
            return { result: 'WINNER_DETERMINED', winner: 'RED' };
        } else {
            if (this.rules.suddenDeath) {
                this.suddenDeathCounter++;
                
                if (this.suddenDeathCounter < 5) {
                    console.log(`\nMort Subite! Nouvelle partie... (${this.suddenDeathCounter}/5)`);
                    this.initializeSuddenDeath();
                    return { result: 'SUDDEN_DEATH_CONTINUE' };
                } else {
                    console.log('\nÉgalité finale après Mort Subite!');
                    return { result: 'FINAL_DRAW' };
                }
            } else {
                console.log('\nC\'est une égalité!');
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