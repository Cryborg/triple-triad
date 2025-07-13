const Card = require('./Card');
const Board = require('./Board');
const Player = require('./Player');

class Game {
    constructor() {
        this.board = new Board();
        this.players = {
            BLUE: new Player('BLUE', false),
            RED: new Player('RED', true)
        };
        this.currentPlayer = null;
        this.turnCount = 0;
    }

    initialize() {
        this.distributeCards();
        this.currentPlayer = Math.random() < 0.5 ? 'BLUE' : 'RED';
        console.log(`\n=== Triple Triad v0.1 ===`);
        console.log(`${this.currentPlayer} starts the game!\n`);
    }

    distributeCards() {
        const baseCards = [
            { ranks: [3, 5, 2, 5], name: 'Geezard' },
            { ranks: [5, 1, 3, 5], name: 'Funguar' },
            { ranks: [5, 3, 2, 1], name: 'Bite Bug' },
            { ranks: [6, 2, 4, 3], name: 'Red Bat' },
            { ranks: [2, 5, 5, 3], name: 'Blobra' },
            { ranks: [4, 4, 5, 2], name: 'Gayla' },
            { ranks: [1, 4, 6, 2], name: 'Gesper' },
            { ranks: [7, 1, 3, 1], name: 'Fastitocalon-F' },
            { ranks: [3, 5, 5, 1], name: 'Blood Soul' },
            { ranks: [4, 2, 6, 2], name: 'Caterchipillar' }
        ];

        const shuffled = [...baseCards].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < 5; i++) {
            const blueCardData = shuffled[i];
            const blueCard = new Card(
                blueCardData.ranks[0],
                blueCardData.ranks[1],
                blueCardData.ranks[2],
                blueCardData.ranks[3],
                'BLUE'
            );
            this.players.BLUE.addCardToHand(blueCard);

            const redCardData = shuffled[i + 5];
            const redCard = new Card(
                redCardData.ranks[0],
                redCardData.ranks[1],
                redCardData.ranks[2],
                redCardData.ranks[3],
                'RED'
            );
            this.players.RED.addCardToHand(redCard);
        }
    }

    playTurn() {
        const player = this.players[this.currentPlayer];
        
        if (player.isAI) {
            console.log(`\n${this.currentPlayer}'s turn (AI):`);
            const move = player.getSmartMove(this.board);
            
            if (move) {
                const card = player.getCard(move.cardIndex);
                console.log(`AI plays ${card.toString()} at position (${move.row}, ${move.col})`);
                this.makeMove(move.cardIndex, move.row, move.col);
            }
        } else {
            this.board.display();
            player.displayHand();
            console.log(`\n${this.currentPlayer}'s turn:`);
            return false;
        }
        
        return true;
    }

    makeMove(cardIndex, row, col) {
        const player = this.players[this.currentPlayer];
        
        try {
            if (!this.board.isPositionEmpty(row, col)) {
                throw new Error('This position is already occupied!');
            }

            const card = player.playCard(cardIndex);
            this.board.placeCard(card, row, col);
            
            this.captureAdjacentCards(card, row, col);
            
            this.turnCount++;
            this.currentPlayer = this.currentPlayer === 'BLUE' ? 'RED' : 'BLUE';
            
            return true;
        } catch (error) {
            console.error(`Invalid move: ${error.message}`);
            return false;
        }
    }

    captureAdjacentCards(placedCard, row, col) {
        const adjacent = this.board.getAdjacentCards(row, col);
        let capturedCount = 0;

        const comparisons = [
            { 
                adjacentCard: adjacent.top, 
                placedRank: placedCard.getRank('top'),
                adjacentRank: adjacent.top ? adjacent.top.getRank('bottom') : null
            },
            { 
                adjacentCard: adjacent.right, 
                placedRank: placedCard.getRank('right'),
                adjacentRank: adjacent.right ? adjacent.right.getRank('left') : null
            },
            { 
                adjacentCard: adjacent.bottom, 
                placedRank: placedCard.getRank('bottom'),
                adjacentRank: adjacent.bottom ? adjacent.bottom.getRank('top') : null
            },
            { 
                adjacentCard: adjacent.left, 
                placedRank: placedCard.getRank('left'),
                adjacentRank: adjacent.left ? adjacent.left.getRank('right') : null
            }
        ];

        for (const { adjacentCard, placedRank, adjacentRank } of comparisons) {
            if (adjacentCard && adjacentCard.owner !== placedCard.owner) {
                if (placedRank > adjacentRank) {
                    adjacentCard.changeOwner(placedCard.owner);
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
        this.board.display();
        
        const counts = this.board.countCardsByOwner();
        console.log('Cards on board:');
        console.log(`BLUE: ${counts.BLUE || 0}`);
        console.log(`RED: ${counts.RED || 0}`);
        console.log(`Turn: ${this.turnCount + 1}/9`);
    }
}

module.exports = Game;