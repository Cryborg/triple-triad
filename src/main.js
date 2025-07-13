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

async function playGame(rules = { open: false, random: false }) {
    const game = new Game(rules);
    game.initialize();

    while (!game.isGameOver()) {
        const aiPlayed = game.playTurn();
        
        if (!aiPlayed) {
            try {
                const cardIndex = await question('Select card index (0-4): ');
                const position = await question('Select position (row,col): ');
                
                const [row, col] = position.split(',').map(n => parseInt(n.trim()));
                
                if (!game.makeMove(parseInt(cardIndex), row, col)) {
                    console.log('Please try again.');
                    continue;
                }
            } catch (error) {
                console.log('Invalid input. Please try again.');
                continue;
            }
        }

        game.displayGameState();
    }

    const winner = game.getWinner();
    if (winner === 'DRAW') {
        console.log('\n=== Game Over - It\'s a DRAW! ===');
    } else {
        console.log(`\n=== Game Over - ${winner} WINS! ===`);
    }

    rl.close();
}

async function startMenu() {
    console.log('\n=== Triple Triad v0.3 ===');
    console.log('1. Play against AI (No rules)');
    console.log('2. Play against AI (Random rule)');
    console.log('3. Play against AI (Open rule)');
    console.log('4. Play against AI (Elemental rule)');
    console.log('5. Play against AI (Open + Random)');
    console.log('6. Play against AI (Elemental + Random)');
    console.log('7. Play against AI (All rules)');
    console.log('8. Instructions');
    console.log('9. Exit');
    
    const choice = await question('\nSelect option: ');
    
    switch (choice) {
        case '1':
            await playGame({ open: false, random: false });
            break;
        case '2':
            await playGame({ open: false, random: true });
            break;
        case '3':
            await playGame({ open: true, random: false });
            break;
        case '4':
            await playGame({ open: false, random: false, elemental: true });
            break;
        case '5':
            await playGame({ open: true, random: true, elemental: false });
            break;
        case '6':
            await playGame({ open: false, random: true, elemental: true });
            break;
        case '7':
            await playGame({ open: true, random: true, elemental: true });
            break;
        case '8':
            console.log('\n=== Instructions ===');
            console.log('1. Each player has 5 cards with 4 ranks (top, right, bottom, left)');
            console.log('2. Ranks go from 1-10 (A = 10)');
            console.log('3. Place cards on a 3x3 grid');
            console.log('4. Capture opponent cards by having higher rank on touching sides');
            console.log('5. Player with most cards at the end wins');
            console.log('\nRules:');
            console.log('- Open: Both players can see each other\'s hands');
            console.log('- Random: Starting hands are chosen randomly from collection');
            console.log('- Elemental: Cards and board squares have elements that modify ranks');
            console.log('  * Matching element: +1 to all ranks');
            console.log('  * Different element: -1 to all ranks (minimum 0)');
            console.log('\nPosition format: row,col (0,0 is top-left)');
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