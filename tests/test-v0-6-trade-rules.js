const Game = require('../src/Game');
const Card = require('../src/Card');

function testOneTradeRule() {
    console.log('\n=== Test One Trade Rule ===');
    
    const game = new Game({ tradeRule: 'One' });
    game.initialize();
    
    // Setup winner scenario (BLUE wins 6-3)
    game.board = new (require('../src/Board'))();
    game.players.BLUE.clearHand();
    game.players.RED.clearHand();
    
    // Create initial collections
    const blueCollection = [
        new Card(5, 5, 5, 5, 'BLUE'),
        new Card(6, 6, 6, 6, 'BLUE')
    ];
    const redCollection = [
        new Card(8, 8, 8, 8, 'RED'),
        new Card(9, 9, 9, 9, 'RED'),
        new Card(7, 7, 7, 7, 'RED')
    ];
    
    blueCollection.forEach(card => game.players.BLUE.addCardToCollection(card));
    redCollection.forEach(card => game.players.RED.addCardToCollection(card));
    
    // Setup board for BLUE victory
    const boardBlue1 = new Card(5, 5, 5, 5, 'BLUE');
    const boardBlue2 = new Card(6, 6, 6, 6, 'BLUE');
    const boardBlue3 = new Card(7, 7, 7, 7, 'BLUE');
    const boardRed1 = new Card(8, 8, 8, 8, 'RED');
    
    game.board.placeCard(boardBlue1, 0, 0);
    game.board.placeCard(boardBlue2, 0, 1);
    game.board.placeCard(boardBlue3, 1, 0);
    game.board.placeCard(boardRed1, 1, 1);
    
    game.turnCount = 9;
    
    console.log('Before One rule:');
    console.log(`BLUE collection: ${game.players.BLUE.collection.length} cards`);
    console.log(`RED collection: ${game.players.RED.collection.length} cards`);
    
    if (game.checkGameEnd()) {
        const result = game.determineWinner();
        console.log(`Result: ${result.result}, Winner: ${result.winner}`);
        
        console.log('\nAfter One rule:');
        console.log(`BLUE collection: ${game.players.BLUE.collection.length} cards`);
        console.log(`RED collection: ${game.players.RED.collection.length} cards`);
        console.log('Expected: BLUE gains 1 card from RED');
    }
}

function testDiffTradeRule() {
    console.log('\n=== Test Diff Trade Rule ===');
    
    const game = new Game({ tradeRule: 'Diff' });
    game.initialize();
    
    // Setup winner scenario (BLUE wins 7-2, diff = 5)
    game.board = new (require('../src/Board'))();
    game.players.BLUE.clearHand();
    game.players.RED.clearHand();
    
    // Create collections
    const redCollection = [
        new Card(8, 8, 8, 8, 'RED'),
        new Card(9, 9, 9, 9, 'RED'),
        new Card(7, 7, 7, 7, 'RED'),
        new Card(6, 6, 6, 6, 'RED'),
        new Card(5, 5, 5, 5, 'RED')
    ];
    
    redCollection.forEach(card => game.players.RED.addCardToCollection(card));
    
    // Setup board for BLUE massive victory (7-2)
    const blueCards = [
        new Card(5, 5, 5, 5, 'BLUE'),
        new Card(6, 6, 6, 6, 'BLUE'),
        new Card(7, 7, 7, 7, 'BLUE'),
        new Card(8, 8, 8, 8, 'BLUE'),
        new Card(9, 9, 9, 9, 'BLUE'),
        new Card(4, 4, 4, 4, 'BLUE'),
        new Card(3, 3, 3, 3, 'BLUE')
    ];
    const redCards = [
        new Card(1, 1, 1, 1, 'RED'),
        new Card(2, 2, 2, 2, 'RED')
    ];
    
    // Place first 9 cards on board
    let cardIndex = 0;
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            if (cardIndex < 7) {
                game.board.placeCard(blueCards[cardIndex], row, col);
            } else {
                game.board.placeCard(redCards[cardIndex - 7], row, col);
            }
            cardIndex++;
        }
    }
    
    game.turnCount = 9;
    
    console.log('Before Diff rule:');
    console.log(`BLUE collection: ${game.players.BLUE.collection.length} cards`);
    console.log(`RED collection: ${game.players.RED.collection.length} cards`);
    
    if (game.checkGameEnd()) {
        const result = game.determineWinner();
        console.log(`Result: ${result.result}, Winner: ${result.winner}`);
        
        console.log('\nAfter Diff rule:');
        console.log(`BLUE collection: ${game.players.BLUE.collection.length} cards`);
        console.log(`RED collection: ${game.players.RED.collection.length} cards`);
        console.log('Expected: BLUE gains 5 cards from RED (7-2=5)');
    }
}

function testDirectTradeRule() {
    console.log('\n=== Test Direct Trade Rule ===');
    
    const game = new Game({ tradeRule: 'Direct' });
    game.initialize();
    
    // Setup collections (initially empty to see the effect)
    game.players.BLUE.collection = [];
    game.players.RED.collection = [];
    
    // Setup board scenario
    game.board = new (require('../src/Board'))();
    game.players.BLUE.clearHand();
    game.players.RED.clearHand();
    
    // Create specific cards for board
    const blueCards = [
        new Card(5, 5, 5, 5, 'BLUE', 'Fire'),
        new Card(6, 6, 6, 6, 'BLUE', 'Ice'),
        new Card(7, 7, 7, 7, 'BLUE')
    ];
    const redCards = [
        new Card(8, 8, 8, 8, 'RED', 'Thunder'),
        new Card(9, 9, 9, 9, 'RED')
    ];
    
    // Place cards on board
    game.board.placeCard(blueCards[0], 0, 0);
    game.board.placeCard(blueCards[1], 0, 1);
    game.board.placeCard(blueCards[2], 1, 0);
    game.board.placeCard(redCards[0], 1, 1);
    game.board.placeCard(redCards[1], 2, 0);
    
    game.turnCount = 9;
    
    console.log('Before Direct rule:');
    console.log(`BLUE collection: ${game.players.BLUE.collection.length} cards`);
    console.log(`RED collection: ${game.players.RED.collection.length} cards`);
    console.log('Board state:');
    game.board.display();
    
    if (game.checkGameEnd()) {
        const result = game.determineWinner();
        console.log(`Result: ${result.result}, Winner: ${result.winner}`);
        
        console.log('\nAfter Direct rule:');
        console.log(`BLUE collection: ${game.players.BLUE.collection.length} cards`);
        console.log(`RED collection: ${game.players.RED.collection.length} cards`);
        console.log('Expected: Both players gain copies of cards they controlled on board');
    }
}

function testAllTradeRule() {
    console.log('\n=== Test All Trade Rule ===');
    
    const game = new Game({ tradeRule: 'All' });
    game.initialize();
    
    // Setup collections
    const blueCollection = [
        new Card(5, 5, 5, 5, 'BLUE'),
        new Card(6, 6, 6, 6, 'BLUE')
    ];
    const redCollection = [
        new Card(8, 8, 8, 8, 'RED'),
        new Card(9, 9, 9, 9, 'RED'),
        new Card(7, 7, 7, 7, 'RED'),
        new Card(4, 4, 4, 4, 'RED')
    ];
    
    blueCollection.forEach(card => game.players.BLUE.addCardToCollection(card));
    redCollection.forEach(card => game.players.RED.addCardToCollection(card));
    
    // Setup board for BLUE victory
    game.board = new (require('../src/Board'))();
    game.players.BLUE.clearHand();
    game.players.RED.clearHand();
    
    const boardCards = [
        new Card(5, 5, 5, 5, 'BLUE'),
        new Card(6, 6, 6, 6, 'BLUE'),
        new Card(7, 7, 7, 7, 'BLUE'),
        new Card(8, 8, 8, 8, 'BLUE'),
        new Card(9, 9, 9, 9, 'BLUE'),
        new Card(1, 1, 1, 1, 'RED')
    ];
    
    let cardIndex = 0;
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            if (cardIndex < boardCards.length) {
                game.board.placeCard(boardCards[cardIndex], row, col);
                cardIndex++;
            }
        }
    }
    
    game.turnCount = 9;
    
    console.log('Before All rule:');
    console.log(`BLUE collection: ${game.players.BLUE.collection.length} cards`);
    console.log(`RED collection: ${game.players.RED.collection.length} cards`);
    
    if (game.checkGameEnd()) {
        const result = game.determineWinner();
        console.log(`Result: ${result.result}, Winner: ${result.winner}`);
        
        console.log('\nAfter All rule:');
        console.log(`BLUE collection: ${game.players.BLUE.collection.length} cards`);
        console.log(`RED collection: ${game.players.RED.collection.length} cards`);
        console.log('Expected: BLUE takes all RED cards (winner takes all)');
    }
}

function testTradeRuleWithNoCollection() {
    console.log('\n=== Test Trade Rule With No Collection ===');
    
    const game = new Game({ tradeRule: 'One' });
    game.initialize();
    
    // Clear collections
    game.players.BLUE.collection = [];
    game.players.RED.collection = [];
    
    // Setup board for BLUE victory
    game.board = new (require('../src/Board'))();
    game.players.BLUE.clearHand();
    game.players.RED.clearHand();
    
    const blueCard = new Card(9, 9, 9, 9, 'BLUE');
    const redCard = new Card(1, 1, 1, 1, 'RED');
    
    game.board.placeCard(blueCard, 0, 0);
    game.board.placeCard(redCard, 0, 1);
    
    game.turnCount = 9;
    
    console.log('Before trade rule (empty collections):');
    console.log(`BLUE collection: ${game.players.BLUE.collection.length} cards`);
    console.log(`RED collection: ${game.players.RED.collection.length} cards`);
    
    if (game.checkGameEnd()) {
        const result = game.determineWinner();
        console.log(`Result: ${result.result}, Winner: ${result.winner}`);
        
        console.log('\nAfter trade rule:');
        console.log(`BLUE collection: ${game.players.BLUE.collection.length} cards`);
        console.log(`RED collection: ${game.players.RED.collection.length} cards`);
        console.log('Expected: No cards traded (RED has empty collection)');
    }
}

console.log('=== Triple Triad v0.6 Trade Rules Tests ===');
testOneTradeRule();
testDiffTradeRule();
testDirectTradeRule();
testAllTradeRule();
testTradeRuleWithNoCollection();
console.log('\n=== All v0.6 trade rules tests completed ===');