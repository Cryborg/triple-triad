const Game = require('../src/Game');
const Card = require('../src/Card');

function testSameRule() {
    console.log('\n=== Test Same Rule ===');
    
    const game = new Game({ same: true });
    game.initialize();
    
    const card1 = new Card(5, 3, 7, 2, 'BLUE');
    const card2 = new Card(1, 5, 4, 8, 'RED');
    const card3 = new Card(6, 2, 9, 5, 'RED');
    
    game.board.placeCard(card2, 0, 1);
    game.board.placeCard(card3, 1, 0);
    
    console.log('Before Same rule test:');
    game.board.display();
    console.log(`Card at (0,1): ${card2.toString()} - Owner: ${card2.owner}`);
    console.log(`Card at (1,0): ${card3.toString()} - Owner: ${card3.owner}`);
    
    console.log(`\nPlacing BLUE card ${card1.toString()} at (1,1)`);
    console.log('Expected: Same rule should trigger (5-5 match with top and left)');
    
    game.board.placeCard(card1, 1, 1);
    game.resolveCaptures(card1, 1, 1);
    
    console.log('\nAfter Same rule:');
    game.board.display();
    console.log(`Card at (0,1): ${card2.toString()} - Owner: ${card2.owner}`);
    console.log(`Card at (1,0): ${card3.toString()} - Owner: ${card3.owner}`);
}

function testPlusRule() {
    console.log('\n=== Test Plus Rule ===');
    
    const game = new Game({ plus: true });
    game.initialize();
    
    const card1 = new Card(4, 6, 3, 2, 'BLUE');
    const card2 = new Card(2, 8, 1, 4, 'RED');
    const card3 = new Card(7, 1, 5, 6, 'RED');
    
    game.board.placeCard(card2, 0, 1);
    game.board.placeCard(card3, 1, 0);
    
    console.log('Before Plus rule test:');
    game.board.display();
    console.log(`Card at (0,1): ${card2.toString()} - Owner: ${card2.owner}`);
    console.log(`Card at (1,0): ${card3.toString()} - Owner: ${card3.owner}`);
    
    console.log(`\nPlacing BLUE card ${card1.toString()} at (1,1)`);
    console.log('Expected: Plus rule should trigger');
    console.log('Top: 4+1=5, Left: 2+6=8');
    
    game.board.placeCard(card1, 1, 1);
    game.resolveCaptures(card1, 1, 1);
    
    console.log('\nAfter Plus rule:');
    game.board.display();
    console.log(`Card at (0,1): ${card2.toString()} - Owner: ${card2.owner}`);
    console.log(`Card at (1,0): ${card3.toString()} - Owner: ${card3.owner}`);
}

function testSameWallRule() {
    console.log('\n=== Test Same Wall Rule ===');
    
    const game = new Game({ same: true, sameWall: true });
    game.initialize();
    
    const card1 = new Card(10, 5, 7, 2, 'BLUE');
    const card2 = new Card(1, 5, 4, 8, 'RED');
    
    game.board.placeCard(card2, 0, 1);
    
    console.log('Before Same Wall rule test:');
    game.board.display();
    console.log(`Card at (0,1): ${card2.toString()} - Owner: ${card2.owner}`);
    
    console.log(`\nPlacing BLUE card ${card1.toString()} at (0,0) (corner)`);
    console.log('Expected: Same Wall rule should trigger (A-10 against top/left walls + 5-5 match with right card)');
    
    game.board.placeCard(card1, 0, 0);
    game.resolveCaptures(card1, 0, 0);
    
    console.log('\nAfter Same Wall rule:');
    game.board.display();
    console.log(`Card at (0,1): ${card2.toString()} - Owner: ${card2.owner}`);
}

function testBasicCaptureStillWorks() {
    console.log('\n=== Test Basic Capture Still Works ===');
    
    const game = new Game({ same: true, plus: true });
    game.initialize();
    
    const card1 = new Card(8, 3, 7, 2, 'BLUE');
    const card2 = new Card(1, 5, 4, 6, 'RED');
    
    game.board.placeCard(card2, 0, 1);
    
    console.log('Before basic capture test:');
    game.board.display();
    console.log(`Card at (0,1): ${card2.toString()} - Owner: ${card2.owner}`);
    
    console.log(`\nPlacing BLUE card ${card1.toString()} at (1,1)`);
    console.log('Expected: Basic capture should work (8 > 4)');
    
    game.board.placeCard(card1, 1, 1);
    game.resolveCaptures(card1, 1, 1);
    
    console.log('\nAfter basic capture:');
    game.board.display();
    console.log(`Card at (0,1): ${card2.toString()} - Owner: ${card2.owner}`);
}

function testElementalWithNewRules() {
    console.log('\n=== Test Elemental + Same Rule ===');
    
    const game = new Game({ elemental: true, same: true });
    game.initialize();
    
    const card1 = new Card(5, 3, 7, 2, 'BLUE', 'Fire');
    const card2 = new Card(1, 5, 4, 8, 'RED', 'Ice');
    
    game.board.placeCard(card2, 0, 1);
    game.board.elementalSquares[1][1] = 'Fire';
    game.board.elementalSquares[0][1] = 'Ice';
    
    console.log('Before Elemental + Same test:');
    game.board.display(true);
    console.log(`Card at (0,1): ${card2.toString()} - Owner: ${card2.owner}`);
    
    console.log(`\nPlacing BLUE card ${card1.toString()} at (1,1) on Fire square`);
    console.log('Expected: Same rule uses original ranks (5-5), elemental affects basic capture only');
    
    game.board.placeCard(card1, 1, 1);
    game.resolveCaptures(card1, 1, 1);
    
    console.log('\nAfter Elemental + Same:');
    game.board.display(true);
    console.log(`Card at (0,1): ${card2.toString()} - Owner: ${card2.owner}`);
}

console.log('=== Triple Triad v0.4 Rule Tests ===');
testSameRule();
testPlusRule();
testSameWallRule();
testBasicCaptureStillWorks();
testElementalWithNewRules();
console.log('\n=== All tests completed ===');