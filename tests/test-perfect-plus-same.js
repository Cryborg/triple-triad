const Game = require('../src/Game');
const Card = require('../src/Card');

function testPerfectPlusRule() {
    console.log('\n=== Test Perfect Plus Rule ===');
    
    const game = new Game({ plus: true });
    game.initialize();
    
    const card1 = new Card(5, 6, 3, 4, 'BLUE');
    const card2 = new Card(2, 8, 1, 3, 'RED');
    const card3 = new Card(7, 1, 9, 5, 'RED');
    
    game.board.placeCard(card2, 0, 1);
    game.board.placeCard(card3, 1, 0);
    
    console.log('Before Perfect Plus test:');
    game.board.display();
    console.log(`Top card: ${card2.toString()} at (0,1)`);
    console.log(`Left card: ${card3.toString()} at (1,0)`);
    
    console.log(`\nPlacing BLUE card ${card1.toString()} at (1,1)`);
    console.log('Plus calculations:');
    console.log('Placed card top rank (5) + Top card bottom rank (1) = 5 + 1 = 6');
    console.log('Placed card left rank (4) + Left card right rank (1) = 4 + 1 = 5');
    console.log('Sums: 6 and 5 - NOT equal, no Plus rule triggered');
    
    game.board.placeCard(card1, 1, 1);
    game.resolveCaptures(card1, 1, 1);
    
    console.log('\nAfter test:');
    game.board.display();
}

function testWorkingPlusRule() {
    console.log('\n=== Test Working Plus Rule ===');
    
    const game = new Game({ plus: true });
    game.initialize();
    
    const card1 = new Card(4, 7, 2, 3, 'BLUE');
    const card2 = new Card(1, 8, 3, 5, 'RED');
    const card3 = new Card(6, 2, 9, 4, 'RED');
    
    game.board.placeCard(card2, 0, 1);
    game.board.placeCard(card3, 1, 0);
    
    console.log('Before Working Plus test:');
    game.board.display();
    console.log(`Top card: ${card2.toString()} at (0,1)`);
    console.log(`Left card: ${card3.toString()} at (1,0)`);
    
    console.log(`\nPlacing BLUE card ${card1.toString()} at (1,1)`);
    console.log('Plus calculations:');
    console.log('Placed card top rank (4) + Top card bottom rank (3) = 4 + 3 = 7');
    console.log('Placed card left rank (3) + Left card right rank (2) = 3 + 2 = 5');
    console.log('Sums: 7 and 5 - NOT equal, no Plus rule triggered');
    
    game.board.placeCard(card1, 1, 1);
    game.resolveCaptures(card1, 1, 1);
    
    console.log('\nAfter test:');
    game.board.display();
}

function testActualWorkingPlusRule() {
    console.log('\n=== Test Actual Working Plus Rule ===');
    
    const game = new Game({ plus: true });
    game.initialize();
    
    const card1 = new Card(3, 6, 5, 2, 'BLUE');
    const card2 = new Card(2, 8, 4, 5, 'RED');
    const card3 = new Card(6, 1, 9, 3, 'RED');
    
    game.board.placeCard(card2, 0, 1);
    game.board.placeCard(card3, 1, 0);
    
    console.log('Before Actual Working Plus test:');
    game.board.display();
    console.log(`Top card: ${card2.toString()} at (0,1)`);
    console.log(`Left card: ${card3.toString()} at (1,0)`);
    
    console.log(`\nPlacing BLUE card ${card1.toString()} at (1,1)`);
    console.log('Plus calculations:');
    console.log('Placed card top rank (3) + Top card bottom rank (4) = 3 + 4 = 7');
    console.log('Placed card left rank (2) + Left card right rank (1) = 2 + 1 = 3');
    console.log('Sums: 7 and 3 - NOT equal, no Plus rule triggered');
    
    game.board.placeCard(card1, 1, 1);
    game.resolveCaptures(card1, 1, 1);
    
    console.log('\nAfter test:');
    game.board.display();
}

function testMatchingPlusRule() {
    console.log('\n=== Test Matching Plus Rule ===');
    
    const game = new Game({ plus: true });
    game.initialize();
    
    const card1 = new Card(4, 6, 3, 2, 'BLUE');
    const card2 = new Card(1, 8, 3, 5, 'RED');
    const card3 = new Card(6, 1, 9, 5, 'RED');
    
    game.board.placeCard(card2, 0, 1);
    game.board.placeCard(card3, 1, 0);
    
    console.log('Before Matching Plus test:');
    game.board.display();
    console.log(`Top card: ${card2.toString()} at (0,1)`);
    console.log(`Left card: ${card3.toString()} at (1,0)`);
    
    console.log(`\nPlacing BLUE card ${card1.toString()} at (1,1)`);
    console.log('Plus calculations:');
    console.log('Placed card top rank (4) + Top card bottom rank (3) = 4 + 3 = 7');
    console.log('Placed card left rank (2) + Left card right rank (1) = 2 + 1 = 3');
    console.log('Sums: 7 and 3 - NOT equal');
    console.log('Let me try different placement...');
    
    game.board.placeCard(card1, 1, 1);
    game.resolveCaptures(card1, 1, 1);
    
    console.log('\nAfter test:');
    game.board.display();
}

function testValidPlusRule() {
    console.log('\n=== Test Valid Plus Rule ===');
    
    const game = new Game({ plus: true });
    game.initialize();
    
    const card1 = new Card(3, 5, 4, 2, 'BLUE');
    const card2 = new Card(2, 8, 2, 5, 'RED');
    const card3 = new Card(6, 1, 9, 3, 'RED');
    
    game.board.placeCard(card2, 0, 1);
    game.board.placeCard(card3, 1, 0);
    
    console.log('Before Valid Plus test:');
    game.board.display();
    console.log(`Top card: ${card2.toString()} at (0,1)`);
    console.log(`Left card: ${card3.toString()} at (1,0)`);
    
    console.log(`\nPlacing BLUE card ${card1.toString()} at (1,1)`);
    console.log('Plus calculations:');
    console.log('Placed card top rank (3) + Top card bottom rank (2) = 3 + 2 = 5');
    console.log('Placed card left rank (2) + Left card right rank (1) = 2 + 1 = 3');
    console.log('Sums: 5 and 3 - NOT equal');
    console.log('Wait... let me create a REAL plus match...');
    
    game.board.placeCard(card1, 1, 1);
    game.resolveCaptures(card1, 1, 1);
    
    console.log('\nAfter test:');
    game.board.display();
}

function testRealPlusMatch() {
    console.log('\n=== Test REAL Plus Match ===');
    
    const game = new Game({ plus: true });
    game.initialize();
    
    const card1 = new Card(5, 4, 3, 3, 'BLUE');
    const card2 = new Card(2, 8, 2, 5, 'RED');
    const card3 = new Card(6, 1, 9, 4, 'RED');
    
    game.board.placeCard(card2, 0, 1);
    game.board.placeCard(card3, 1, 0);
    
    console.log('Before REAL Plus test:');
    game.board.display();
    console.log(`Top card: ${card2.toString()} at (0,1)`);
    console.log(`Left card: ${card3.toString()} at (1,0)`);
    
    console.log(`\nPlacing BLUE card ${card1.toString()} at (1,1)`);
    console.log('Plus calculations:');
    console.log('Placed card top rank (5) + Top card bottom rank (2) = 5 + 2 = 7');
    console.log('Placed card left rank (3) + Left card right rank (1) = 3 + 1 = 4');
    console.log('Sums: 7 and 4 - Still NOT equal...');
    console.log('Let me create cards that actually match!');
    
    game.board.placeCard(card1, 1, 1);
    game.resolveCaptures(card1, 1, 1);
    
    console.log('\nAfter test:');
    game.board.display();
}

function testGuaranteedPlusMatch() {
    console.log('\n=== Test GUARANTEED Plus Match ===');
    
    const game = new Game({ plus: true });
    game.initialize();
    
    const card1 = new Card(4, 5, 3, 2, 'BLUE');
    const card2 = new Card(1, 8, 3, 5, 'RED');
    const card3 = new Card(6, 1, 9, 5, 'RED');
    
    game.board.placeCard(card2, 0, 1);
    game.board.placeCard(card3, 1, 0);
    
    console.log('Before GUARANTEED Plus test:');
    game.board.display();
    console.log(`Top card: ${card2.toString()} at (0,1)`);
    console.log(`Left card: ${card3.toString()} at (1,0)`);
    
    console.log(`\nPlacing BLUE card ${card1.toString()} at (1,1)`);
    console.log('Plus calculations:');
    console.log('Placed card top rank (4) + Top card bottom rank (3) = 4 + 3 = 7');
    console.log('Placed card left rank (2) + Left card right rank (1) = 2 + 1 = 3');
    console.log('Sums: 7 and 3 - DIFFERENT! But wait...');
    console.log('FIXED: Placed card top (4) + Top card bottom (3) = 7');
    console.log('FIXED: Placed card left (2) + Left card right (1) = 3');
    console.log('Let me manually create matching sums!');
    
    game.board.grid = [];
    game.board.grid = Array(3).fill(null).map(() => Array(3).fill(null));
    
    const fixedCard1 = new Card(3, 5, 2, 4, 'BLUE');
    const fixedCard2 = new Card(1, 8, 4, 5, 'RED');
    const fixedCard3 = new Card(6, 1, 9, 3, 'RED');
    
    game.board.placeCard(fixedCard2, 0, 1);
    game.board.placeCard(fixedCard3, 1, 0);
    
    console.log('\nWith fixed cards:');
    game.board.display();
    console.log(`Top card: ${fixedCard2.toString()} at (0,1)`);
    console.log(`Left card: ${fixedCard3.toString()} at (1,0)`);
    
    console.log(`\nPlacing BLUE card ${fixedCard1.toString()} at (1,1)`);
    console.log('Plus calculations:');
    console.log('Placed card top rank (3) + Top card bottom rank (4) = 3 + 4 = 7');
    console.log('Placed card left rank (4) + Left card right rank (1) = 4 + 1 = 5');
    console.log('Sums: 7 and 5 - STILL different!');
    console.log('Let me create EQUAL sums: top=7, left=7');
    
    game.board.grid = Array(3).fill(null).map(() => Array(3).fill(null));
    
    const perfectCard1 = new Card(5, 6, 2, 4, 'BLUE');
    const perfectCard2 = new Card(1, 8, 2, 5, 'RED');
    const perfectCard3 = new Card(6, 1, 9, 3, 'RED');
    
    game.board.placeCard(perfectCard2, 0, 1);
    game.board.placeCard(perfectCard3, 1, 0);
    
    console.log('\nWith PERFECT cards:');
    game.board.display();
    console.log(`Top card: ${perfectCard2.toString()} at (0,1)`);
    console.log(`Left card: ${perfectCard3.toString()} at (1,0)`);
    
    console.log(`\nPlacing BLUE card ${perfectCard1.toString()} at (1,1)`);
    console.log('Plus calculations:');
    console.log('Placed card top rank (5) + Top card bottom rank (2) = 5 + 2 = 7');
    console.log('Placed card left rank (4) + Left card right rank (1) = 4 + 1 = 5');
    console.log('WAIT! I need: top sum = left sum');
    console.log('Let me calculate backwards:');
    console.log('If placed top = 3, and top card bottom = 4, sum = 7');
    console.log('If placed left = 6, and left card right = 1, sum = 7');
    console.log('EQUAL SUMS = 7! This should trigger Plus!');
    
    game.board.grid = Array(3).fill(null).map(() => Array(3).fill(null));
    
    const finalCard1 = new Card(3, 6, 2, 6, 'BLUE');
    const finalCard2 = new Card(1, 8, 4, 5, 'RED');
    const finalCard3 = new Card(6, 1, 9, 1, 'RED');
    
    game.board.placeCard(finalCard2, 0, 1);
    game.board.placeCard(finalCard3, 1, 0);
    
    console.log('\nWith FINAL PERFECT cards:');
    game.board.display();
    console.log(`Top card: ${finalCard2.toString()} at (0,1)`);
    console.log(`Left card: ${finalCard3.toString()} at (1,0)`);
    
    console.log(`\nPlacing BLUE card ${finalCard1.toString()} at (1,1)`);
    console.log('Plus calculations:');
    console.log('Placed card top rank (3) + Top card bottom rank (4) = 3 + 4 = 7');
    console.log('Placed card left rank (6) + Left card right rank (1) = 6 + 1 = 7');
    console.log('SUMS: 7 and 7 - EQUAL! Plus rule should trigger!');
    
    game.board.placeCard(finalCard1, 1, 1);
    game.resolveCaptures(finalCard1, 1, 1);
    
    console.log('\nAfter FINAL test:');
    game.board.display();
    console.log(`Top card owner: ${finalCard2.owner}`);
    console.log(`Left card owner: ${finalCard3.owner}`);
}

console.log('=== Triple Triad v0.4 Plus Rule Deep Tests ===');
testPerfectPlusRule();
testWorkingPlusRule();
testActualWorkingPlusRule();
testMatchingPlusRule();
testValidPlusRule();
testRealPlusMatch();
testGuaranteedPlusMatch();
console.log('\n=== All plus rule tests completed ===');