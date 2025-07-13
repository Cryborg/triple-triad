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

async function playGame() {
    const game = new Game();
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
    console.log('\n=== Triple Triad v0.1 ===');
    console.log('1. Play against AI');
    console.log('2. Instructions');
    console.log('3. Exit');
    
    const choice = await question('\nSelect option: ');
    
    switch (choice) {
        case '1':
            await playGame();
            break;
        case '2':
            console.log('\n=== Instructions ===');
            console.log('1. Each player has 5 cards with 4 ranks (top, right, bottom, left)');
            console.log('2. Ranks go from 1-10 (A = 10)');
            console.log('3. Place cards on a 3x3 grid');
            console.log('4. Capture opponent cards by having higher rank on touching sides');
            console.log('5. Player with most cards at the end wins');
            console.log('\nPosition format: row,col (0,0 is top-left)');
            await startMenu();
            break;
        case '3':
            console.log('Thanks for playing!');
            rl.close();
            break;
        default:
            console.log('Invalid option');
            await startMenu();
    }
}

startMenu().catch(console.error);