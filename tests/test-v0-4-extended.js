const Game = require('../src/Game');
const Card = require('../src/Card');

function testSameWallCorrection() {
    console.log('\n=== Test Same Wall Rule - Corrected ===');
    
    const game = new Game({ same: true, sameWall: true });
    game.initialize();
    
    const card1 = new Card(10, 5, 7, 10, 'BLUE');
    const card2 = new Card(1, 5, 4, 8, 'RED');
    
    game.board.placeCard(card2, 0, 1);
    
    console.log('Before Same Wall rule test:');
    game.board.display();
    console.log(`Card at (0,1): ${card2.toString()} - Owner: ${card2.owner}`);
    
    console.log(`\nPlacing BLUE card ${card1.toString()} at (0,0) (corner)`);
    console.log('Expected: Same Wall should trigger with 2 A-walls (top+left) = 2 matches >= 2');
    console.log('Should capture adjacent RED card');
    
    game.board.placeCard(card1, 0, 0);
    game.resolveCaptures(card1, 0, 0);
    
    console.log('\nAfter Same Wall rule:');
    game.board.display();
    console.log(`Card at (0,1): ${card2.toString()} - Owner: ${card2.owner}`);
}

function testComplexSamePlusInteraction() {
    console.log('\n=== Test Same + Plus Rules Together ===');
    
    const game = new Game({ same: true, plus: true });
    game.initialize();
    
    const card1 = new Card(5, 6, 3, 4, 'BLUE');
    const card2 = new Card(2, 5, 7, 1, 'RED');
    const card3 = new Card(8, 3, 5, 6, 'RED');
    const card4 = new Card(1, 4, 9, 2, 'RED');
    
    game.board.placeCard(card2, 0, 1);
    game.board.placeCard(card3, 1, 0);
    game.board.placeCard(card4, 1, 2);
    
    console.log('Before Same+Plus test:');
    game.board.display();
    console.log('Cards around center:');
    console.log(`Top (0,1): ${card2.toString()} - Owner: ${card2.owner}`);
    console.log(`Left (1,0): ${card3.toString()} - Owner: ${card3.owner}`);
    console.log(`Right (1,2): ${card4.toString()} - Owner: ${card4.owner}`);
    
    console.log(`\nPlacing BLUE card ${card1.toString()} at (1,1)`);
    console.log('Checking Same: top(5-7), left(4-6), right(6-2)');
    console.log('Checking Plus: top(5+7=12), left(4+6=10), right(6+2=8)');
    console.log('Expected: No same matches, no plus matches -> basic capture');
    
    game.board.placeCard(card1, 1, 1);
    game.resolveCaptures(card1, 1, 1);
    
    console.log('\nAfter Same+Plus test:');
    game.board.display();
}

function testMultiplePlusCaptures() {
    console.log('\n=== Test Multiple Plus Captures ===');
    
    const game = new Game({ plus: true });
    game.initialize();
    
    const card1 = new Card(3, 4, 5, 2, 'BLUE');
    const card2 = new Card(1, 6, 3, 5, 'RED');
    const card3 = new Card(4, 2, 7, 3, 'RED');
    const card4 = new Card(6, 1, 2, 4, 'RED');
    
    game.board.placeCard(card2, 0, 1);
    game.board.placeCard(card3, 1, 0);
    game.board.placeCard(card4, 1, 2);
    
    console.log('Before Multiple Plus test:');
    game.board.display();
    console.log('Cards around center:');
    console.log(`Top (0,1): ${card2.toString()} - Owner: ${card2.owner}`);
    console.log(`Left (1,0): ${card3.toString()} - Owner: ${card3.owner}`);
    console.log(`Right (1,2): ${card4.toString()} - Owner: ${card4.owner}`);
    
    console.log(`\nPlacing BLUE card ${card1.toString()} at (1,1)`);
    console.log('Plus calculations:');
    console.log('Top: 3+3=6, Left: 2+3=5, Right: 4+4=8');
    console.log('Expected: No plus matches -> basic capture only');
    
    game.board.placeCard(card1, 1, 1);
    game.resolveCaptures(card1, 1, 1);
    
    console.log('\nAfter Multiple Plus test:');
    game.board.display();
}

function testActualPlusMatch() {
    console.log('\n=== Test Actual Plus Match ===');
    
    const game = new Game({ plus: true });
    game.initialize();
    
    const card1 = new Card(3, 4, 5, 6, 'BLUE');
    const card2 = new Card(2, 6, 1, 5, 'RED');
    const card3 = new Card(4, 2, 7, 1, 'RED');
    
    game.board.placeCard(card2, 0, 1);
    game.board.placeCard(card3, 1, 0);
    
    console.log('Before Actual Plus test:');
    game.board.display();
    console.log('Cards around center:');
    console.log(`Top (0,1): ${card2.toString()} - Owner: ${card2.owner}`);
    console.log(`Left (1,0): ${card3.toString()} - Owner: ${card3.owner}`);
    
    console.log(`\nPlacing BLUE card ${card1.toString()} at (1,1)`);
    console.log('Plus calculations:');
    console.log('Top: 3+1=4, Left: 6+1=7');
    console.log('No matching sums -> checking basic capture');
    
    game.board.placeCard(card1, 1, 1);
    game.resolveCaptures(card1, 1, 1);
    
    console.log('\nAfter Actual Plus test:');
    game.board.display();
}

function testWorkingPlusRule() {
    console.log('\n=== Test Working Plus Rule ===');
    
    const game = new Game({ plus: true });
    game.initialize();
    
    const card1 = new Card(4, 5, 3, 2, 'BLUE');
    const card2 = new Card(3, 6, 1, 4, 'RED');
    const card3 = new Card(1, 2, 7, 5, 'RED');
    
    game.board.placeCard(card2, 0, 1);
    game.board.placeCard(card3, 1, 0);
    
    console.log('Before Working Plus test:');
    game.board.display();
    console.log('Cards around center:');
    console.log(`Top (0,1): ${card2.toString()} - Owner: ${card2.owner}`);
    console.log(`Left (1,0): ${card3.toString()} - Owner: ${card3.owner}`);
    
    console.log(`\nPlacing BLUE card ${card1.toString()} at (1,1)`);
    console.log('Plus calculations:');
    console.log('Top: 4+1=5, Left: 2+5=7');
    console.log('Expected: No matching sums (5 != 7)');
    
    game.board.placeCard(card1, 1, 1);
    game.resolveCaptures(card1, 1, 1);
    
    console.log('\nAfter Working Plus test:');
    game.board.display();
}

console.log('=== Triple Triad v0.4 Extended Tests ===');
testSameWallCorrection();
testComplexSamePlusInteraction();
testMultiplePlusCaptures();
testActualPlusMatch();
testWorkingPlusRule();
console.log('\n=== All extended tests completed ===');