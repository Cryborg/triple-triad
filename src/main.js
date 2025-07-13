const Game = require('./Game');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function playGame(rules = { open: false, random: false, elemental: false, same: false, plus: false, sameWall: false, combo: false, suddenDeath: false, tradeRule: 'One' }) {
    let game = new Game(rules);
    game.initialize();

    // Main game loop with Sudden Death support
    while (true) {
        // Start a new game round
        game.start();
        
        // Play turns until game ends
        while (!game.checkGameEnd()) {
            const aiPlayed = game.playTurn();
            
            if (!aiPlayed) {
                // Human player turn
                try {
                    const cardIndex = await question('Select card index (0-4): ');
                    const position = await question('Select position (row,col): ');
                    
                    const [row, col] = position.split(',').map(n => parseInt(n.trim()));
                    
                    if (!game.makeMove(parseInt(cardIndex), row, col)) {
                        console.log('❌ Invalid move. Please try again.');
                        continue;
                    }
                } catch (error) {
                    console.log('❌ Invalid input. Please try again.');
                    continue;
                }
            }
        }
        
        // Determine the winner and handle the result
        const result = game.determineWinner();
        
        if (result === 'SUDDEN_DEATH_CONTINUE') {
            console.log('\n🔄 Sudden Death continues...\n');
            // Game has been reinitialized, continue the loop
            continue;
        } else if (result === 'WINNER_DETERMINED') {
            // Winner found, game over
            break;
        } else if (result === 'DRAW' || result === 'FINAL_DRAW') {
            // Final draw, game over
            break;
        }
    }

    console.log('\n🎮 Game session complete!');
}

async function customRulesConfiguration() {
    console.log('\n=== Custom Rules Configuration ===');
    
    const rules = {
        open: false,
        random: false,
        elemental: false,
        same: false,
        plus: false,
        sameWall: false,
        combo: false,
        suddenDeath: false,
        tradeRule: 'One'
    };
    
    console.log('Configure each rule (y/n):');
    
    rules.open = (await question('Open (both hands visible): ')) === 'y';
    rules.random = (await question('Random (random starting hands): ')) === 'y';
    rules.elemental = (await question('Elemental (element effects): ')) === 'y';
    rules.same = (await question('Same (equal rank capture): ')) === 'y';
    rules.plus = (await question('Plus (sum equality capture): ')) === 'y';
    rules.sameWall = (await question('Same Wall (walls count as A): ')) === 'y';
    
    if (rules.same || rules.plus) {
        rules.combo = (await question('Combo (chain captures): ')) === 'y';
    }
    
    rules.suddenDeath = (await question('Sudden Death (tie-breaker): ')) === 'y';
    
    console.log('\nSelect trade rule:');
    console.log('1. One (winner takes 1 card)');
    console.log('2. Diff (cards equal to score difference)');
    console.log('3. Direct (winner takes captured cards)');
    console.log('4. All (winner takes all loser cards)');
    
    const tradeChoice = await question('Trade rule (1-4): ');
    switch (tradeChoice) {
        case '1': rules.tradeRule = 'One'; break;
        case '2': rules.tradeRule = 'Diff'; break;
        case '3': rules.tradeRule = 'Direct'; break;
        case '4': rules.tradeRule = 'All'; break;
        default: rules.tradeRule = 'One'; break;
    }
    
    console.log('\n🎯 Starting game with custom rules...');
    await playGame(rules);
}

async function startMenu() {
    console.log('\n=== Triple Triad v0.8 ===');
    console.log('1. Play against AI (Basic rules only)');
    console.log('2. Play against AI (Open + Random)');
    console.log('3. Play against AI (Elemental)');
    console.log('4. Play against AI (Same + Plus)');
    console.log('5. Play against AI (Same + Plus + Combo)');
    console.log('6. Play against AI (All rules + Sudden Death)');
    console.log('7. Custom rules configuration');
    console.log('8. Instructions');
    console.log('9. Exit');
    
    const choice = await question('\nSelect option: ');
    
    switch (choice) {
        case '1':
            await playGame();
            break;
        case '2':
            await playGame({ open: true, random: true });
            break;
        case '3':
            await playGame({ elemental: true });
            break;
        case '4':
            await playGame({ same: true, plus: true });
            break;
        case '5':
            await playGame({ same: true, plus: true, combo: true });
            break;
        case '6':
            await playGame({ 
                open: true, 
                random: true, 
                elemental: true, 
                same: true, 
                plus: true, 
                sameWall: true, 
                combo: true, 
                suddenDeath: true, 
                tradeRule: 'All' 
            });
            break;
        case '7':
            await customRulesConfiguration();
            break;
        case '8':
            console.log('\n=== Instructions ===');
            console.log('🎯 Basic Gameplay:');
            console.log('1. Each player has 5 cards with 4 ranks (top, right, bottom, left)');
            console.log('2. Ranks go from 1-10 (A = 10)');
            console.log('3. Place cards on a 3x3 grid');
            console.log('4. Capture opponent cards by having higher rank on touching sides');
            console.log('5. Player with most cards at the end wins');
            console.log('\n⚡ Special Rules:');
            console.log('- Open: Both players can see each other\'s hands');
            console.log('- Random: Starting hands are chosen randomly from collection');
            console.log('- Elemental: Cards and board squares have elements that modify ranks');
            console.log('  * Matching element: +1 to all ranks');
            console.log('  * Different element: -1 to all ranks (minimum 0)');
            console.log('- Same: If 2+ sides have equal ranks, capture all adjacent cards');
            console.log('- Plus: If sum of opposite sides are equal, capture all adjacent cards');
            console.log('- Same Wall: Walls count as rank A (10) for Same rule');
            console.log('- Combo: Captured cards can capture other cards in a chain');
            console.log('- Sudden Death: If tied, play again with cards from board + 1 random');
            console.log('\n🔄 Trade Rules (after game):');
            console.log('- One: Winner takes 1 random card from loser');
            console.log('- Diff: Each player takes cards equal to difference in score');
            console.log('- Direct: Winner takes all cards they captured during game');
            console.log('- All: Winner takes all of loser\'s cards');
            console.log('\n📍 Position format: row,col (0,0 is top-left)');
            await startMenu();
            break;
        case '9':
            console.log('Thanks for playing!');
            rl.close();
            break;
        default:
            console.log('Invalid option');
            await startMenu();
    }
}

startMenu().catch(console.error);