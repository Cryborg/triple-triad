const Game = require('../src/Game');
const Card = require('../src/Card');

function testBasicSuddenDeath() {
    console.log('\n=== Test Basic Sudden Death ===');
    
    const game = new Game({ suddenDeath: true, tradeRule: 'One' });
    game.initialize();
    
    // Setup for a draw scenario
    const blueCard1 = new Card(5, 5, 5, 5, 'BLUE');
    const blueCard2 = new Card(6, 6, 6, 6, 'BLUE');
    const redCard1 = new Card(7, 7, 7, 7, 'RED');
    const redCard2 = new Card(8, 8, 8, 8, 'RED');
    
    // Clear hands and add specific cards
    game.players.BLUE.clearHand();
    game.players.RED.clearHand();
    
    game.players.BLUE.addCardToHand(blueCard1);
    game.players.BLUE.addCardToHand(blueCard2);
    game.players.RED.addCardToHand(redCard1);
    game.players.RED.addCardToHand(redCard2);
    
    // Place cards to create a 4-4 draw (5 cards each including unplayed card)
    game.board.placeCard(blueCard1, 0, 0);
    game.board.placeCard(redCard1, 0, 1);
    game.board.placeCard(blueCard2, 1, 0);
    game.board.placeCard(redCard2, 1, 1);
    
    // Simulate turn count
    game.turnCount = 9;
    
    console.log('Before sudden death check:');
    game.board.display();
    
    // Check if game end triggers sudden death
    if (game.checkGameEnd()) {
        const result = game.determineWinner();
        console.log(`Result: ${result.result}`);
        
        if (result.result === 'SUDDEN_DEATH_CONTINUE') {
            console.log(`Sudden Death Counter: ${game.suddenDeathCounter}`);
            console.log('New hands after sudden death:');
            console.log(`BLUE: ${game.players.BLUE.hand.length} cards`);
            console.log(`RED: ${game.players.RED.hand.length} cards`);
        }
    }
}

function testMultipleSuddenDeaths() {
    console.log('\n=== Test Multiple Sudden Deaths ===');
    
    const game = new Game({ suddenDeath: true, tradeRule: 'One' });
    game.initialize();
    
    // Simulate 5 consecutive draws
    for (let i = 1; i <= 6; i++) {
        console.log(`\nSimulating draw ${i}:`);
        
        // Reset board and hands
        game.board = new (require('../src/Board'))();
        game.players.BLUE.clearHand();
        game.players.RED.clearHand();
        
        // Add equal cards for draw scenario
        const blueCard = new Card(5, 5, 5, 5, 'BLUE');
        const redCard = new Card(6, 6, 6, 6, 'RED');
        
        game.players.BLUE.addCardToHand(blueCard);
        game.players.RED.addCardToHand(redCard);
        
        // Place for 4-4 draw
        game.board.placeCard(blueCard, 0, 0);
        game.board.placeCard(redCard, 0, 1);
        
        game.turnCount = 9;
        
        if (game.checkGameEnd()) {
            const result = game.determineWinner();
            console.log(`Draw ${i}: ${result.result}, Counter: ${game.suddenDeathCounter}`);
            
            if (result.result === 'FINAL_DRAW') {
                console.log('Final draw reached after 5 sudden deaths!');
                break;
            }
        }
    }
}

function testSuddenDeathPreventsDraw() {
    console.log('\n=== Test Sudden Death Prevents Normal Draw ===');
    
    const gameNormal = new Game({ suddenDeath: false });
    const gameSudden = new Game({ suddenDeath: true });
    
    gameNormal.initialize();
    gameSudden.initialize();
    
    // Setup identical draw scenarios
    const setupDraw = (game) => {
        game.board = new (require('../src/Board'))();
        game.players.BLUE.clearHand();
        game.players.RED.clearHand();
        
        const blueCard = new Card(5, 5, 5, 5, 'BLUE');
        const redCard = new Card(6, 6, 6, 6, 'RED');
        
        game.players.BLUE.addCardToHand(blueCard);
        game.players.RED.addCardToHand(redCard);
        
        game.board.placeCard(blueCard, 0, 0);
        game.board.placeCard(redCard, 0, 1);
        
        game.turnCount = 9;
    };
    
    setupDraw(gameNormal);
    setupDraw(gameSudden);
    
    console.log('Normal game (no sudden death):');
    if (gameNormal.checkGameEnd()) {
        const result = gameNormal.determineWinner();
        console.log(`Result: ${result.result}`);
    }
    
    console.log('\nGame with sudden death:');
    if (gameSudden.checkGameEnd()) {
        const result = gameSudden.determineWinner();
        console.log(`Result: ${result.result}`);
    }
}

function testSuddenDeathHandComposition() {
    console.log('\n=== Test Sudden Death Hand Composition ===');
    
    const game = new Game({ suddenDeath: true });
    game.initialize();
    
    // Clear initial hands
    game.players.BLUE.clearHand();
    game.players.RED.clearHand();
    
    // Create specific cards for controlled test
    const blueCard1 = new Card(5, 3, 7, 2, 'BLUE');
    const blueCard2 = new Card(8, 4, 6, 1, 'BLUE');
    const redCard1 = new Card(2, 8, 1, 6, 'RED');
    const redCard2 = new Card(7, 1, 9, 3, 'RED');
    const redCard3 = new Card(4, 5, 2, 8, 'RED');
    
    // Add to hands
    game.players.BLUE.addCardToHand(blueCard1);
    game.players.BLUE.addCardToHand(blueCard2);
    game.players.RED.addCardToHand(redCard1);
    game.players.RED.addCardToHand(redCard2);
    game.players.RED.addCardToHand(redCard3);
    
    // Place cards on board (BLUE captures RED card)
    game.board.placeCard(blueCard1, 1, 1);  // BLUE controls
    game.board.placeCard(redCard1, 0, 1);   // RED controls initially
    redCard1.changeOwner('BLUE');           // Simulate capture by BLUE
    game.board.placeCard(redCard2, 2, 1);   // RED controls
    
    console.log('Before sudden death:');
    console.log(`BLUE hand: ${game.players.BLUE.hand.length} cards`);
    console.log(`RED hand: ${game.players.RED.hand.length} cards`);
    console.log('Board state:');
    game.board.display();
    
    console.log('\nCards controlled by each player:');
    const blueControlled = game.players.BLUE.getCardsControlledOnBoard(game.board);
    const redControlled = game.players.RED.getCardsControlledOnBoard(game.board);
    console.log(`BLUE controls ${blueControlled.length} cards on board`);
    console.log(`RED controls ${redControlled.length} cards on board`);
    
    // Trigger sudden death
    game.turnCount = 9;
    if (game.checkGameEnd()) {
        const result = game.determineWinner();
        if (result.result === 'SUDDEN_DEATH_CONTINUE') {
            console.log('\nAfter sudden death initialization:');
            console.log(`BLUE new hand: ${game.players.BLUE.hand.length} cards`);
            console.log(`RED new hand: ${game.players.RED.hand.length} cards`);
            console.log('Expected: BLUE should have 3 cards (2 controlled + 1 unplayed)');
            console.log('Expected: RED should have 2 cards (1 controlled + 1 unplayed)');
        }
    }
}

console.log('=== Triple Triad v0.6 Sudden Death Tests ===');
testBasicSuddenDeath();
testMultipleSuddenDeaths();
testSuddenDeathPreventsDraw();
testSuddenDeathHandComposition();
console.log('\n=== All v0.6 sudden death tests completed ===');