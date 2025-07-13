const Card = require('./Card');
const Board = require('./Board');
const Player = require('./Player');
const CardDatabaseV3 = require('./CardDatabaseV3');

class Game {
    constructor(rules = { open: false, random: false, elemental: false, same: false, plus: false, sameWall: false }) {
        this.board = new Board();
        this.players = {
            BLUE: new Player('BLUE', false),
            RED: new Player('RED', true)
        };
        this.currentPlayer = null;
        this.turnCount = 0;
        this.rules = rules;
    }

    initialize() {
        if (this.rules.elemental) {
            this.board.initializeElementalSquares();
        }
        this.setupPlayerCollections();
        this.distributeCards();
        this.currentPlayer = Math.random() < 0.5 ? 'BLUE' : 'RED';
        console.log(`\n=== Triple Triad v0.4 ===`);
        console.log(`Rules: Open=${this.rules.open}, Random=${this.rules.random}, Elemental=${this.rules.elemental}, Same=${this.rules.same}, Plus=${this.rules.plus}, Same Wall=${this.rules.sameWall}`);
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
        const cardsToFlipThisTurn = new Set();
        const adjacentCards = this.getAdjacentCardsInfo(row, col);
        
        if (this.rules.same || this.rules.plus) {
            if (this.rules.same) {
                this.checkSameRule(placedCard, row, col, adjacentCards, cardsToFlipThisTurn);
            }
            
            if (this.rules.plus) {
                this.checkPlusRule(placedCard, adjacentCards, cardsToFlipThisTurn);
            }
            
            if (cardsToFlipThisTurn.size > 0) {
                this.applySpecialRuleCaptures(cardsToFlipThisTurn, placedCard);
                return;
            }
        }
        
        this.applyBasicCaptures(placedCard, row, col, adjacentCards);
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

    checkSameRule(placedCard, row, col, adjacentCards, cardsToFlipThisTurn) {
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
            sameCandidates.forEach(card => {
                if (card.owner !== placedCard.owner) {
                    cardsToFlipThisTurn.add(card);
                }
            });
        }
    }

    checkPlusRule(placedCard, adjacentCards, cardsToFlipThisTurn) {
        const validPairs = [];
        const adjacentCardsArray = adjacentCards.filter(info => info.card);

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
                        cardsToFlipThisTurn.add(card);
                    }
                });
            });
        }
    }

    applySpecialRuleCaptures(cardsToFlipThisTurn, placedCard) {
        let capturedCount = 0;
        const ruleTypes = [];

        if (this.rules.same) ruleTypes.push('Same');
        if (this.rules.plus) ruleTypes.push('Plus');

        cardsToFlipThisTurn.forEach(card => {
            card.changeOwner(placedCard.owner);
            capturedCount++;
        });

        if (capturedCount > 0) {
            console.log(`${placedCard.owner} captured ${capturedCount} card(s) by ${ruleTypes.join('/')}!`);
        }
    }

    applyBasicCaptures(placedCard, row, col, adjacentCards) {
        let capturedCount = 0;
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
                    card.changeOwner(placedCard.owner);
                    capturedCount++;
                }
            }
        }

        if (capturedCount > 0) {
            console.log(`${placedCard.owner} captured ${capturedCount} card(s)!`);
        }
    }

    isGameOver() {
        return this.board.isFull();
    }

    getWinner() {
        const counts = this.board.countCardsByOwner();
        
        const bluePlayer = this.players.BLUE;
        const redPlayer = this.players.RED;
        
        let blueTotal = counts.BLUE || 0;
        let redTotal = counts.RED || 0;
        
        if (bluePlayer.hasCards()) blueTotal += bluePlayer.hand.length;
        if (redPlayer.hasCards()) redTotal += redPlayer.hand.length;

        console.log(`\nFinal Score:`);
        console.log(`BLUE: ${blueTotal} cards`);
        console.log(`RED: ${redTotal} cards`);

        if (blueTotal > redTotal) {
            return 'BLUE';
        } else if (redTotal > blueTotal) {
            return 'RED';
        } else {
            return 'DRAW';
        }
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