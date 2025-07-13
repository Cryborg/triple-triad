const Game = require('../src/Game');
const Card = require('../src/Card');

function testComplexComboChain() {
    console.log('\n=== Test Complex Combo Chain ===');
    
    const game = new Game({ same: true, combo: true });
    game.initialize();
    
    const card1 = new Card(6, 8, 9, 3, 'BLUE');
    const card2 = new Card(1, 6, 4, 8, 'RED');
    const card3 = new Card(6, 2, 1, 5, 'RED');
    const card4 = new Card(3, 4, 1, 6, 'RED');
    const card5 = new Card(2, 3, 5, 1, 'RED');
    const card6 = new Card(4, 1, 2, 7, 'RED');
    const card7 = new Card(1, 5, 3, 2, 'RED');
    
    game.board.placeCard(card2, 0, 1);
    game.board.placeCard(card3, 1, 0);
    game.board.placeCard(card4, 2, 1);
    game.board.placeCard(card5, 1, 2);
    game.board.placeCard(card6, 0, 0);
    game.board.placeCard(card7, 2, 2);
    
    console.log('Before Complex Combo Chain:');
    game.board.display();
    console.log('Setup: Full board except center, designed for maximum combo propagation');
    
    console.log(`\nPlacing BLUE card ${card1.toString()} at (1,1)`);
    console.log('Expected: Same triggers (6-6 matches), then cascading combo captures');
    
    game.board.placeCard(card1, 1, 1);
    game.resolveCaptures(card1, 1, 1);
    
    console.log('\nAfter Complex Combo Chain:');
    game.board.display();
}

function testComboWithPlusAndSame() {
    console.log('\n=== Test Combo with Plus AND Same ===');
    
    const game = new Game({ same: true, plus: true, combo: true });
    game.initialize();
    
    const card1 = new Card(3, 4, 5, 6, 'BLUE');
    const card2 = new Card(2, 3, 3, 5, 'RED');
    const card3 = new Card(6, 1, 7, 2, 'RED');
    const card4 = new Card(1, 8, 2, 4, 'RED');
    const card5 = new Card(4, 2, 1, 1, 'RED');
    
    game.board.placeCard(card2, 0, 1);
    game.board.placeCard(card3, 1, 0);
    game.board.placeCard(card4, 2, 1);
    game.board.placeCard(card5, 1, 2);
    
    console.log('Before Plus+Same+Combo test:');
    game.board.display();
    console.log('Setup: Cards positioned to trigger both Same and Plus rules');
    
    console.log(`\nPlacing BLUE card ${card1.toString()} at (1,1)`);
    console.log('Expected: Both Same and Plus trigger, then combo propagates');
    
    game.board.placeCard(card1, 1, 1);
    game.resolveCaptures(card1, 1, 1);
    
    console.log('\nAfter Plus+Same+Combo:');
    game.board.display();
}

function testComboCircularPrevention() {
    console.log('\n=== Test Combo Circular Prevention ===');
    
    const game = new Game({ same: true, combo: true });
    game.initialize();
    
    const card1 = new Card(5, 8, 6, 7, 'BLUE');
    const card2 = new Card(2, 5, 4, 3, 'RED');
    const card3 = new Card(5, 1, 2, 8, 'RED');
    const card4 = new Card(4, 6, 1, 5, 'RED');
    
    game.board.placeCard(card2, 0, 1);
    game.board.placeCard(card3, 1, 0);
    game.board.placeCard(card4, 1, 2);
    
    console.log('Before Circular Prevention test:');
    game.board.display();
    console.log('Setup: Cards arranged in potential circular capture pattern');
    
    console.log(`\nPlacing BLUE card ${card1.toString()} at (1,1)`);
    console.log('Expected: Same triggers, combo prevents infinite loops');
    
    game.board.placeCard(card1, 1, 1);
    game.resolveCaptures(card1, 1, 1);
    
    console.log('\nAfter Circular Prevention:');
    game.board.display();
}

function testComboWithElementalAdvanced() {
    console.log('\n=== Test Advanced Combo with Elemental ===');
    
    const game = new Game({ plus: true, combo: true, elemental: true });
    game.initialize();
    
    const card1 = new Card(4, 5, 6, 3, 'BLUE', 'Fire');
    const card2 = new Card(2, 4, 1, 6, 'RED', 'Ice');
    const card3 = new Card(6, 2, 8, 5, 'RED', 'Fire');
    const card4 = new Card(3, 7, 2, 4, 'RED', 'Water');
    const card5 = new Card(1, 3, 4, 2, 'RED', 'Earth');
    
    game.board.placeCard(card2, 0, 1);
    game.board.placeCard(card3, 1, 0);
    game.board.placeCard(card4, 2, 1);
    game.board.placeCard(card5, 1, 2);
    
    game.board.elementalSquares[1][1] = 'Fire';
    game.board.elementalSquares[0][1] = 'Ice';
    game.board.elementalSquares[1][0] = 'Water';
    game.board.elementalSquares[2][1] = 'Earth';
    
    console.log('Before Advanced Elemental Combo:');
    game.board.display(true);
    console.log('Setup: Complex elemental interactions with combo chains');
    
    console.log(`\nPlacing BLUE Fire card ${card1.toString()} at Fire center`);
    console.log('Expected: Plus with elemental modifiers, then elemental-aware combos');
    
    game.board.placeCard(card1, 1, 1);
    game.resolveCaptures(card1, 1, 1);
    
    console.log('\nAfter Advanced Elemental Combo:');
    game.board.display(true);
}

function testComboDoesNotChainSpecialRules() {
    console.log('\n=== Test Combo Does Not Chain Special Rules ===');
    
    const game = new Game({ same: true, plus: true, combo: true });
    game.initialize();
    
    const card1 = new Card(5, 3, 7, 2, 'BLUE');
    const card2 = new Card(1, 5, 4, 8, 'RED');
    const card3 = new Card(5, 2, 9, 5, 'RED');
    const card4 = new Card(3, 4, 1, 5, 'RED');
    const card5 = new Card(7, 1, 5, 2, 'RED');
    
    game.board.placeCard(card2, 0, 1);
    game.board.placeCard(card3, 1, 0);
    game.board.placeCard(card4, 2, 1);
    game.board.placeCard(card5, 0, 0);
    
    console.log('Before Special Rules Chain Prevention:');
    game.board.display();
    console.log('Setup: Cards with matching ranks that could trigger Same if recursive');
    console.log('Note: Multiple 5s present but combo should NOT trigger new Same rules');
    
    console.log(`\nPlacing BLUE card ${card1.toString()} at (1,1)`);
    console.log('Expected: Initial Same triggers, combo uses basic capture only');
    
    game.board.placeCard(card1, 1, 1);
    game.resolveCaptures(card1, 1, 1);
    
    console.log('\nAfter Special Rules Chain Prevention:');
    game.board.display();
    console.log('Verification: No secondary Same/Plus should have been triggered by combo');
}

function testComboStopsWhenNoValidTargets() {
    console.log('\n=== Test Combo Stops When No Valid Targets ===');
    
    const game = new Game({ same: true, combo: true });
    game.initialize();
    
    const card1 = new Card(5, 9, 8, 7, 'BLUE');
    const card2 = new Card(1, 5, 4, 8, 'RED');
    const card3 = new Card(5, 2, 9, 6, 'RED');
    const card4 = new Card(10, 10, 10, 10, 'RED');
    
    game.board.placeCard(card2, 0, 1);
    game.board.placeCard(card3, 1, 0);
    game.board.placeCard(card4, 2, 1);
    
    console.log('Before Combo Termination test:');
    game.board.display();
    console.log('Setup: Bottom card has max ranks (A=10) - should be uncapturable by combo');
    
    console.log(`\nPlacing BLUE card ${card1.toString()} at (1,1)`);
    console.log('Expected: Same captures adjacent cards, combo tries but fails on bottom card');
    
    game.board.placeCard(card1, 1, 1);
    game.resolveCaptures(card1, 1, 1);
    
    console.log('\nAfter Combo Termination:');
    game.board.display();
    console.log('Bottom card should remain RED (uncapturable)');
}

console.log('=== Triple Triad v0.5 Advanced Combo Tests ===');
testComplexComboChain();
testComboWithPlusAndSame();
testComboCircularPrevention();
testComboWithElementalAdvanced();
testComboDoesNotChainSpecialRules();
testComboStopsWhenNoValidTargets();
console.log('\n=== All advanced v0.5 tests completed ===');