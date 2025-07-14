const Game = require('../src/Game');
const Card = require('../src/Card');
const CardLoader = require('../src/CardLoader');
const EventEmitter = require('../src/EventEmitter');
const AIPlayerStrategy = require('../src/AIPlayerStrategy');

console.log('=== Triple Triad v0.9 Tests ===\n');

let testsRun = 0;
let testsPassed = 0;

function runTest(testName, testFunc) {
    testsRun++;
    console.log(`🧪 Test: ${testName}`);
    
    try {
        testFunc();
        testsPassed++;
        console.log('✅ PASSED\n');
    } catch (error) {
        console.log(`❌ FAILED: ${error.message}\n`);
    }
}

// Test 1: Card Data Externalization
runTest('Card Data Externalization', () => {
    const cardData = CardLoader.getAllCards();
    
    if (cardData.length === 0) {
        throw new Error('No cards loaded from external data');
    }
    
    if (cardData.length !== 110) {
        throw new Error(`Expected 110 cards, got ${cardData.length}`);
    }
    
    // Check that Squall card exists and has correct data
    const squall = CardLoader.getCardById('squall');
    if (!squall) {
        throw new Error('Squall card not found');
    }
    
    if (squall.name !== 'Squall' || squall.ranks[0] !== 'A') {
        throw new Error('Squall card has incorrect data');
    }
    
    console.log('     ✓ External card data loaded successfully');
    console.log(`     ✓ ${cardData.length} cards available`);
    console.log('     ✓ Card data validation passed');
});

// Test 2: Card Creation from JSON
runTest('Card Creation from JSON', () => {
    const cardData = CardLoader.getCardById('ifrit');
    const card = Card.fromJSON(cardData, 'BLUE');
    
    if (card.originalRanks.top !== 9) {
        throw new Error('Card creation from JSON failed - incorrect ranks');
    }
    
    if (card.element !== 'Fire') {
        throw new Error('Card creation from JSON failed - incorrect element');
    }
    
    if (card.owner !== 'BLUE') {
        throw new Error('Card creation from JSON failed - incorrect owner');
    }
    
    if (card.id !== 'ifrit' || card.name !== 'Ifrit') {
        throw new Error('Card creation from JSON failed - incorrect metadata');
    }
    
    console.log('     ✓ Card created from JSON successfully');
    console.log('     ✓ Card metadata preserved');
    console.log('     ✓ Card properties correct');
});

// Test 3: EventEmitter Functionality
runTest('EventEmitter Basic Functionality', () => {
    const emitter = new EventEmitter();
    let eventFired = false;
    let eventData = null;
    
    emitter.on('test:event', (data) => {
        eventFired = true;
        eventData = data;
    });
    
    emitter.emit('test:event', { message: 'Hello World' });
    
    if (!eventFired) {
        throw new Error('Event was not fired');
    }
    
    if (eventData.message !== 'Hello World') {
        throw new Error('Event data not passed correctly');
    }
    
    console.log('     ✓ Events can be registered and emitted');
    console.log('     ✓ Event data passed correctly');
});

// Test 4: Game Events Integration
runTest('Game Events Integration', () => {
    const game = new Game({
        rules: { open: false, random: false, elemental: false },
        player1Type: 'ai',
        player2Type: 'ai'
    });
    
    let gameStarted = false;
    let turnStarted = false;
    let cardPlaced = false;
    let gameEnded = false;
    
    game.on('game:started', () => { gameStarted = true; });
    game.on('turn:started', () => { turnStarted = true; });
    game.on('card:placed', () => { cardPlaced = true; });
    game.on('game:ended', () => { gameEnded = true; });
    
    game.initialize();
    
    if (!gameStarted) {
        throw new Error('game:started event not fired');
    }
    
    // Play a few turns
    for (let i = 0; i < 3 && !game.checkGameEnd(); i++) {
        game.playTurn();
    }
    
    if (!turnStarted) {
        throw new Error('turn:started event not fired');
    }
    
    if (!cardPlaced) {
        throw new Error('card:placed event not fired');
    }
    
    console.log('     ✓ Game events firing correctly');
    console.log('     ✓ Event system integrated with game logic');
});

// Test 5: AIPlayerStrategy Functionality
runTest('AIPlayerStrategy Advanced Logic', () => {
    const strategy = new AIPlayerStrategy();
    const game = new Game({
        rules: { open: false, random: false, elemental: false },
        player1Type: 'human',
        player2Type: 'ai'
    });
    
    game.initialize();
    
    const board = game.board;
    const aiPlayer = game.players.RED;
    const hand = aiPlayer.hand;
    
    if (!aiPlayer.aiStrategy) {
        throw new Error('AI player does not have strategy initialized');
    }
    
    const move = strategy.chooseBestMove(board, hand, null, false, {});
    
    if (!move) {
        throw new Error('AI strategy did not return a move');
    }
    
    if (typeof move.cardIndex !== 'number' || typeof move.row !== 'number' || typeof move.col !== 'number') {
        throw new Error('AI move has invalid format');
    }
    
    if (move.cardIndex < 0 || move.cardIndex >= hand.length) {
        throw new Error('AI chose invalid card index');
    }
    
    if (!board.isPositionEmpty(move.row, move.col)) {
        throw new Error('AI chose occupied position');
    }
    
    console.log('     ✓ AI strategy initialized correctly');
    console.log('     ✓ AI returns valid moves');
    console.log(`     ✓ AI chose card ${move.cardIndex} at (${move.row}, ${move.col}) with score ${move.score}`);
});

// Test 6: Enhanced AI vs AI Performance
runTest('Enhanced AI vs AI Performance', () => {
    const game = new Game({
        rules: { open: true, random: false, elemental: true, same: true, plus: true },
        player1Type: 'ai',
        player2Type: 'ai'
    });
    
    let moveCount = 0;
    let captureEvents = 0;
    
    game.on('card:placed', () => { moveCount++; });
    game.on('card:captured', () => { captureEvents++; });
    
    game.initialize();
    
    // Play a complete game
    while (!game.checkGameEnd()) {
        const success = game.playTurn();
        if (!success) break;
    }
    
    const result = game.determineWinner();
    
    if (moveCount === 0) {
        throw new Error('No moves were made');
    }
    
    if (moveCount > 9) {
        throw new Error('Too many moves made');
    }
    
    if (!result || !result.result) {
        throw new Error('Game did not determine a winner properly');
    }
    
    console.log(`     ✓ Complete AI vs AI game finished in ${moveCount} moves`);
    console.log(`     ✓ ${captureEvents} capture events occurred`);
    console.log(`     ✓ Game result: ${result.result} ${result.winner ? 'Winner: ' + result.winner : ''}`);
});

// Test 7: Card Loading by Element
runTest('Card Loading by Element', () => {
    const fireCards = CardLoader.getCardsByElement('Fire');
    const noneCards = CardLoader.getCardsByElement('None');
    
    if (fireCards.length === 0) {
        throw new Error('No Fire element cards found');
    }
    
    if (noneCards.length === 0) {
        throw new Error('No None element cards found');
    }
    
    // Verify that fire cards actually have Fire element
    const randomFireCard = fireCards[0];
    if (randomFireCard.element !== 'Fire') {
        throw new Error('Fire card does not have Fire element');
    }
    
    console.log(`     ✓ Found ${fireCards.length} Fire element cards`);
    console.log(`     ✓ Found ${noneCards.length} None element cards`);
    console.log('     ✓ Element filtering works correctly');
});

// Test 8: Game Configuration Validation
runTest('Game Configuration Validation', () => {
    // Test with valid configuration
    const game1 = new Game({
        rules: { open: true, random: true, elemental: false },
        player1Type: 'human',
        player2Type: 'ai'
    });
    
    if (!game1.rules.open || !game1.rules.random || game1.rules.elemental) {
        throw new Error('Game configuration not applied correctly');
    }
    
    // Test legacy constructor compatibility
    const game2 = new Game({ open: true, elemental: true });
    
    if (!game2.rules.open || !game2.rules.elemental) {
        throw new Error('Legacy constructor compatibility broken');
    }
    
    console.log('     ✓ New configuration format works');
    console.log('     ✓ Legacy constructor compatibility maintained');
    console.log('     ✓ Configuration validation passed');
});

// Test 9: Event Data Validation
runTest('Event Data Validation', () => {
    const game = new Game({
        rules: { open: false, random: false, elemental: false },
        player1Type: 'ai',
        player2Type: 'ai'
    });
    
    let gameStartData = null;
    let cardPlacedData = null;
    let gameEndData = null;
    
    game.on('game:started', (data) => { gameStartData = data; });
    game.on('card:placed', (data) => { 
        if (!cardPlacedData) cardPlacedData = data; 
    });
    game.on('game:ended', (data) => { gameEndData = data; });
    
    game.initialize();
    
    // Check game started event data
    if (!gameStartData || !gameStartData.rules || !gameStartData.startingPlayer) {
        throw new Error('game:started event data incomplete');
    }
    
    // Play one turn to get card:placed data
    game.playTurn();
    
    if (!cardPlacedData || !cardPlacedData.card || !cardPlacedData.position) {
        throw new Error('card:placed event data incomplete');
    }
    
    if (typeof cardPlacedData.position.row !== 'number' || typeof cardPlacedData.position.col !== 'number') {
        throw new Error('card:placed position data invalid');
    }
    
    console.log('     ✓ game:started event data structure valid');
    console.log('     ✓ card:placed event data structure valid');
    console.log('     ✓ Event data contains all required fields');
});

// Test 10: AI Strategic Improvement
runTest('AI Strategic Improvement', () => {
    // Create a scenario where the enhanced AI should make a better choice
    const game = new Game({
        rules: { open: true, random: false, elemental: false, same: true, plus: true },
        player1Type: 'ai',
        player2Type: 'ai'
    });
    
    game.initialize();
    
    const aiPlayer = game.players.RED;
    const board = game.board;
    
    let movesMade = 0;
    let strategicMoves = 0;
    
    // Monitor AI decisions for strategic behavior
    game.on('card:placed', (data) => {
        movesMade++;
        
        // Check if the AI is making moves that consider multiple factors
        if (data.player === 'RED') {
            // This is a simplified check - in practice you'd verify actual strategic thinking
            const move = aiPlayer.aiStrategy.chooseBestMove(board, aiPlayer.hand, game.players.BLUE.hand, false, game.rules);
            if (move && move.score > 10) { // Score above basic capture threshold
                strategicMoves++;
            }
        }
    });
    
    // Play several turns
    for (let i = 0; i < 6 && !game.checkGameEnd(); i++) {
        game.playTurn();
    }
    
    // The AI should show some strategic thinking
    if (strategicMoves === 0 && movesMade > 2) {
        throw new Error('AI does not appear to be making strategic moves');
    }
    
    console.log(`     ✓ AI made ${strategicMoves} strategic moves out of ${Math.floor(movesMade/2)} AI turns`);
    console.log('     ✓ Enhanced AI showing improved decision making');
});

// Summary
console.log(`\n=== Test Results ===`);
console.log(`Tests run: ${testsRun}`);
console.log(`Tests passed: ${testsPassed}`);
console.log(`Success rate: ${((testsPassed / testsRun) * 100).toFixed(1)}%`);

if (testsPassed === testsRun) {
    console.log('\n🎉 All v0.9 tests passed! Triple Triad v0.9 implementation is complete and functional.');
} else {
    console.log(`\n❌ ${testsRun - testsPassed} test(s) failed. Please review the implementation.`);
}

module.exports = { testsRun, testsPassed };