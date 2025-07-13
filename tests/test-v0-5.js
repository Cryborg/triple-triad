const Game = require('../src/Game');
const Card = require('../src/Card');

function testSimpleCombo() {
    console.log('\n=== Test Simple Combo ===');
    
    const game = new Game({ same: true, combo: true });
    game.initialize();
    
    const card1 = new Card(5, 3, 7, 2, 'BLUE');
    const card2 = new Card(1, 5, 4, 8, 'RED');
    const card3 = new Card(6, 2, 9, 5, 'RED');
    const card4 = new Card(3, 4, 1, 6, 'RED');
    
    game.board.placeCard(card2, 0, 1);
    game.board.placeCard(card3, 1, 0);
    game.board.placeCard(card4, 2, 1);
    
    console.log('Before Simple Combo test:');
    game.board.display();
    console.log(`Top (0,1): ${card2.toString()} - Owner: ${card2.owner}`);
    console.log(`Left (1,0): ${card3.toString()} - Owner: ${card3.owner}`);
    console.log(`Bottom (2,1): ${card4.toString()} - Owner: ${card4.owner}`);
    
    console.log(`\nPlacing BLUE card ${card1.toString()} at (1,1)`);
    console.log('Expected: Same rule triggers (5-5 match), then combo should capture bottom card (7 > 1)');
    
    game.board.placeCard(card1, 1, 1);
    game.resolveCaptures(card1, 1, 1);
    
    console.log('\nAfter Simple Combo:');
    game.board.display();
    console.log(`Top (0,1): ${card2.toString()} - Owner: ${card2.owner}`);
    console.log(`Left (1,0): ${card3.toString()} - Owner: ${card3.owner}`);
    console.log(`Bottom (2,1): ${card4.toString()} - Owner: ${card4.owner}`);
}

function testComboChain() {
    console.log('\n=== Test Combo Chain ===');
    
    const game = new Game({ plus: true, combo: true });
    game.initialize();
    
    const card1 = new Card(4, 6, 8, 2, 'BLUE');
    const card2 = new Card(2, 8, 1, 4, 'RED');
    const card3 = new Card(7, 1, 5, 6, 'RED');
    const card4 = new Card(1, 9, 2, 3, 'RED');
    const card5 = new Card(3, 2, 4, 1, 'RED');
    
    game.board.placeCard(card2, 0, 1);
    game.board.placeCard(card3, 1, 0);
    game.board.placeCard(card4, 0, 0);
    game.board.placeCard(card5, 2, 0);
    
    console.log('Before Combo Chain test:');
    game.board.display();
    console.log('Setup: RED cards positioned for chain reaction');
    
    console.log(`\nPlacing BLUE card ${card1.toString()} at (1,1)`);
    console.log('Expected: Plus rule captures adjacent cards, then combo chain propagates');
    
    game.board.placeCard(card1, 1, 1);
    game.resolveCaptures(card1, 1, 1);
    
    console.log('\nAfter Combo Chain:');
    game.board.display();
}

function testComboBranching() {
    console.log('\n=== Test Combo Branching ===');
    
    const game = new Game({ same: true, combo: true });
    game.initialize();
    
    const card1 = new Card(6, 6, 6, 6, 'BLUE');
    const card2 = new Card(1, 6, 4, 8, 'RED');
    const card3 = new Card(6, 2, 9, 5, 'RED');
    const card4 = new Card(3, 4, 1, 6, 'RED');
    const card5 = new Card(7, 8, 2, 3, 'RED');
    const card6 = new Card(2, 1, 5, 4, 'RED');
    
    game.board.placeCard(card2, 0, 1);
    game.board.placeCard(card3, 1, 0);
    game.board.placeCard(card4, 1, 2);
    game.board.placeCard(card5, 0, 0);
    game.board.placeCard(card6, 0, 2);
    
    console.log('Before Combo Branching test:');
    game.board.display();
    console.log('Setup: Multiple RED cards around center for branching combo');
    
    console.log(`\nPlacing BLUE card ${card1.toString()} at (1,1)`);
    console.log('Expected: Same rule captures multiple cards, each triggers more combos');
    
    game.board.placeCard(card1, 1, 1);
    game.resolveCaptures(card1, 1, 1);
    
    console.log('\nAfter Combo Branching:');
    game.board.display();
}

function testComboPreventsDuplicates() {
    console.log('\n=== Test Combo Prevents Duplicate Captures ===');
    
    const game = new Game({ same: true, combo: true });
    game.initialize();
    
    const card1 = new Card(5, 3, 7, 2, 'BLUE');
    const card2 = new Card(1, 5, 4, 8, 'RED');
    const card3 = new Card(6, 2, 9, 5, 'RED');
    
    game.board.placeCard(card2, 0, 1);
    game.board.placeCard(card3, 1, 0);
    
    console.log('Before Duplicate Prevention test:');
    game.board.display();
    console.log('Setup: Only 2 cards to ensure no duplicates can occur');
    
    console.log(`\nPlacing BLUE card ${card1.toString()} at (1,1)`);
    console.log('Expected: Same rule captures once, combo should not re-capture');
    
    game.board.placeCard(card1, 1, 1);
    game.resolveCaptures(card1, 1, 1);
    
    console.log('\nAfter Duplicate Prevention test:');
    game.board.display();
}

function testComboWithElemental() {
    console.log('\n=== Test Combo with Elemental ===');
    
    const game = new Game({ same: true, combo: true, elemental: true });
    game.initialize();
    
    const card1 = new Card(5, 3, 7, 2, 'BLUE', 'Fire');
    const card2 = new Card(1, 5, 4, 8, 'RED', 'Ice');
    const card3 = new Card(6, 2, 9, 5, 'RED', 'Water');
    const card4 = new Card(3, 4, 1, 6, 'RED', 'Earth');
    
    game.board.placeCard(card2, 0, 1);
    game.board.placeCard(card3, 1, 0);
    game.board.placeCard(card4, 2, 1);
    
    game.board.elementalSquares[1][1] = 'Fire';
    game.board.elementalSquares[2][1] = 'Earth';
    
    console.log('Before Combo + Elemental test:');
    game.board.display(true);
    console.log('Setup: Elemental squares affect combo calculations');
    
    console.log(`\nPlacing BLUE Fire card ${card1.toString()} at (1,1) on Fire square`);
    console.log('Expected: Same uses original ranks, combo uses effective ranks');
    
    game.board.placeCard(card1, 1, 1);
    game.resolveCaptures(card1, 1, 1);
    
    console.log('\nAfter Combo + Elemental:');
    game.board.display(true);
}

function testComboDoesNotTriggerSamePlus() {
    console.log('\n=== Test Combo Does Not Trigger Same/Plus ===');
    
    const game = new Game({ same: true, plus: true, combo: true });
    game.initialize();
    
    const card1 = new Card(5, 3, 7, 2, 'BLUE');
    const card2 = new Card(1, 5, 4, 8, 'RED');
    const card3 = new Card(6, 2, 9, 5, 'RED');
    const card4 = new Card(5, 4, 5, 6, 'RED');
    
    game.board.placeCard(card2, 0, 1);
    game.board.placeCard(card3, 1, 0);
    game.board.placeCard(card4, 2, 1);
    
    console.log('Before Same/Plus Prevention test:');
    game.board.display();
    console.log('Setup: Cards arranged so combo capture could theoretically trigger Same');
    console.log(`Bottom card has 5s that could match, but combo should only do basic capture`);
    
    console.log(`\nPlacing BLUE card ${card1.toString()} at (1,1)`);
    console.log('Expected: Same triggers initially, combo captures are basic only');
    
    game.board.placeCard(card1, 1, 1);
    game.resolveCaptures(card1, 1, 1);
    
    console.log('\nAfter Same/Plus Prevention test:');
    game.board.display();
}

function testComboWithNoSpecialRules() {
    console.log('\n=== Test Combo Requires Same/Plus ===');
    
    const game = new Game({ combo: true });
    game.initialize();
    
    const card1 = new Card(8, 3, 7, 2, 'BLUE');
    const card2 = new Card(1, 5, 4, 8, 'RED');
    
    game.board.placeCard(card2, 0, 1);
    
    console.log('Before Combo Without Same/Plus test:');
    game.board.display();
    console.log('Setup: Combo rule active but no Same/Plus rules');
    
    console.log(`\nPlacing BLUE card ${card1.toString()} at (1,1)`);
    console.log('Expected: Only basic capture, no combo since no Same/Plus triggered');
    
    game.board.placeCard(card1, 1, 1);
    game.resolveCaptures(card1, 1, 1);
    
    console.log('\nAfter Combo Without Same/Plus test:');
    game.board.display();
}

console.log('=== Triple Triad v0.5 Combo Rule Tests ===');
testSimpleCombo();
testComboChain();
testComboBranching();
testComboPreventsDuplicates();
testComboWithElemental();
testComboDoesNotTriggerSamePlus();
testComboWithNoSpecialRules();
console.log('\n=== All v0.5 tests completed ===');