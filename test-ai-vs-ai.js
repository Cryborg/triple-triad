const Card = require('./Card');
const Board = require('./Board');
const Player = require('./Player');
const Game = require('./Game');

class TestGame extends Game {
    constructor() {
        super();
        this.violations = [];
        this.moveHistory = [];
    }

    initialize() {
        console.log('=== Test: AI vs AI avec vérifications ===\n');
        
        this.players = {
            BLUE: new Player('BLUE', true),
            RED: new Player('RED', true)
        };
        
        this.distributeCards();
        this.currentPlayer = Math.random() < 0.5 ? 'BLUE' : 'RED';
        
        console.log(`Test: Vérification de l'initialisation...`);
        this.verifyInitialState();
        console.log(`✓ Initialisation correcte`);
        console.log(`✓ ${this.currentPlayer} commence la partie\n`);
    }

    verifyInitialState() {
        if (this.players.BLUE.hand.length !== 5) {
            this.violations.push(`BLUE n'a pas 5 cartes (${this.players.BLUE.hand.length})`);
        }
        if (this.players.RED.hand.length !== 5) {
            this.violations.push(`RED n'a pas 5 cartes (${this.players.RED.hand.length})`);
        }
        
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (this.board.grid[row][col] !== null) {
                    this.violations.push(`Le plateau n'est pas vide à l'initialisation`);
                }
            }
        }
        
        const allCards = [...this.players.BLUE.hand, ...this.players.RED.hand];
        allCards.forEach((card, index) => {
            if (!card.ranks || typeof card.ranks !== 'object') {
                this.violations.push(`Carte ${index} mal formée`);
            }
            ['top', 'right', 'bottom', 'left'].forEach(side => {
                const rank = card.getRank(side);
                if (rank < 1 || rank > 10) {
                    this.violations.push(`Carte ${index} a un rang invalide: ${rank}`);
                }
            });
        });
    }

    playTurn() {
        const turnNumber = this.turnCount + 1;
        const player = this.players[this.currentPlayer];
        const cardsBeforeTurn = player.hand.length;
        const boardStateBeforeTurn = this.getBoardState();
        
        console.log(`\n--- Tour ${turnNumber} - ${this.currentPlayer} ---`);
        console.log(`Cartes en main: ${cardsBeforeTurn}`);
        
        const move = player.getSmartMove(this.board);
        
        if (!move) {
            this.violations.push(`${this.currentPlayer} n'a pas pu générer de coup au tour ${turnNumber}`);
            return false;
        }
        
        const card = player.getCard(move.cardIndex);
        console.log(`Joue: ${card.toString()} en position (${move.row}, ${move.col})`);
        
        this.verifyMoveValidity(move, turnNumber);
        
        const capturesBeforeMove = this.countPotentialCaptures(card, move.row, move.col);
        
        if (!this.makeMove(move.cardIndex, move.row, move.col)) {
            this.violations.push(`Échec du coup au tour ${turnNumber}`);
            return false;
        }
        
        this.moveHistory.push({
            turn: turnNumber,
            player: this.currentPlayer,
            card: card.toString(),
            position: { row: move.row, col: move.col },
            captures: capturesBeforeMove
        });
        
        this.verifyPostMoveState(player, cardsBeforeTurn, boardStateBeforeTurn, turnNumber);
        
        return true;
    }

    verifyMoveValidity(move, turnNumber) {
        if (move.row < 0 || move.row > 2 || move.col < 0 || move.col > 2) {
            this.violations.push(`Position invalide (${move.row}, ${move.col}) au tour ${turnNumber}`);
        }
        
        if (!this.board.isPositionEmpty(move.row, move.col)) {
            this.violations.push(`Position déjà occupée (${move.row}, ${move.col}) au tour ${turnNumber}`);
        }
    }

    verifyPostMoveState(player, cardsBeforeTurn, boardStateBeforeTurn, turnNumber) {
        if (player.hand.length !== cardsBeforeTurn - 1) {
            this.violations.push(`Nombre de cartes incorrect après le tour ${turnNumber}`);
        }
        
        let placedCards = 0;
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (this.board.grid[row][col] !== null) {
                    placedCards++;
                }
            }
        }
        
        if (placedCards !== turnNumber) {
            this.violations.push(`Nombre de cartes sur le plateau incorrect: ${placedCards} au lieu de ${turnNumber}`);
        }
        
        const totalCards = this.players.BLUE.hand.length + this.players.RED.hand.length + placedCards;
        if (totalCards !== 10) {
            this.violations.push(`Nombre total de cartes incorrect: ${totalCards} au tour ${turnNumber}`);
        }
    }

    countPotentialCaptures(card, row, col) {
        const adjacent = this.board.getAdjacentCards(row, col);
        let captures = 0;

        const comparisons = [
            { side: 'top', adjacentCard: adjacent.top, cardSide: 'bottom' },
            { side: 'right', adjacentCard: adjacent.right, cardSide: 'left' },
            { side: 'bottom', adjacentCard: adjacent.bottom, cardSide: 'top' },
            { side: 'left', adjacentCard: adjacent.left, cardSide: 'right' }
        ];

        for (const { side, adjacentCard, cardSide } of comparisons) {
            if (adjacentCard && adjacentCard.owner !== card.owner) {
                if (card.getRank(side) > adjacentCard.getRank(cardSide)) {
                    captures++;
                }
            }
        }

        return captures;
    }

    getBoardState() {
        const state = [];
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const card = this.board.grid[row][col];
                if (card) {
                    state.push({ row, col, owner: card.owner });
                }
            }
        }
        return state;
    }

    captureAdjacentCards(placedCard, row, col) {
        const capturesBefore = this.board.countCardsByOwner();
        super.captureAdjacentCards(placedCard, row, col);
        const capturesAfter = this.board.countCardsByOwner();
        
        const blueChange = (capturesAfter.BLUE || 0) - (capturesBefore.BLUE || 0);
        const redChange = (capturesAfter.RED || 0) - (capturesBefore.RED || 0);
        
        if (Math.abs(blueChange) !== Math.abs(redChange)) {
            this.violations.push(`Incohérence dans les captures: BLUE ${blueChange}, RED ${redChange}`);
        }
    }

    displayFinalReport() {
        console.log('\n=== Rapport Final ===');
        console.log(`Tours joués: ${this.turnCount}`);
        
        if (this.violations.length > 0) {
            console.log('\n❌ Violations détectées:');
            this.violations.forEach(v => console.log(`  - ${v}`));
        } else {
            console.log('\n✓ Aucune violation des règles détectée');
        }
        
        console.log('\n=== Historique des coups ===');
        this.moveHistory.forEach(move => {
            console.log(`Tour ${move.turn}: ${move.player} joue ${move.card} en (${move.position.row},${move.position.col})`);
        });
    }
}

async function runTest() {
    const game = new TestGame();
    game.initialize();
    
    let turnCount = 0;
    while (!game.isGameOver() && turnCount < 10) {
        if (!game.playTurn()) {
            console.error('Erreur lors du tour');
            break;
        }
        
        game.board.display();
        
        const counts = game.board.countCardsByOwner();
        console.log(`Cartes sur le plateau - BLUE: ${counts.BLUE || 0}, RED: ${counts.RED || 0}`);
        
        turnCount++;
    }
    
    if (game.isGameOver()) {
        const winner = game.getWinner();
        if (winner === 'DRAW') {
            console.log('\n=== Match nul! ===');
        } else {
            console.log(`\n=== ${winner} gagne! ===`);
        }
    }
    
    game.displayFinalReport();
}

runTest().catch(console.error);