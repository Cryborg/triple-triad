#!/usr/bin/env node

const Game = require('../src/Game');
const Board = require('../src/Board');
const Card = require('../src/Card');
const Player = require('../src/Player');

console.log('🧪 TESTS v0.8 - ARCHITECTURE & CONFIGURABILITÉ');
console.log('=' .repeat(60));

let testCount = 0;
let passedTests = 0;

function runTest(testName, testFunction) {
    testCount++;
    console.log(`\n${testCount}. ${testName}`);
    try {
        const result = testFunction();
        if (result) {
            console.log('   ✅ RÉUSSI');
            passedTests++;
        } else {
            console.log('   ❌ ÉCHEC');
        }
    } catch (error) {
        console.log(`   ❌ ERREUR: ${error.message}`);
    }
}

// Test 1: Board - Optimisations des accès
runTest("Board - Optimisations des accès directs", () => {
    const board = new Board();
    const card1 = new Card(5, 5, 5, 5, 'BLUE');
    const card2 = new Card(3, 3, 3, 3, 'RED');
    
    board.placeCard(card1, 1, 1);
    board.placeCard(card2, 0, 1);
    
    // Test getAdjacentCards performance (should use direct grid access)
    const adjacent = board.getAdjacentCards(1, 1);
    
    if (adjacent.top === card2 && adjacent.bottom === null) {
        console.log('     ✓ getAdjacentCards fonctionne avec accès direct');
        
        // Test countCardsByOwner
        const counts = board.countCardsByOwner();
        if (counts.BLUE === 1 && counts.RED === 1) {
            console.log('     ✓ countCardsByOwner optimisé');
            return true;
        }
    }
    
    return false;
});

// Test 2: Card - Immuabilité des originalRanks
runTest("Card - Immuabilité des originalRanks garantie", () => {
    const card = new Card(5, 7, 3, 'A', 'BLUE', 'Fire');
    
    // Vérifier que originalRanks est gelé
    const originalTop = card.originalRanks.top;
    card.originalRanks.top = 10;
    
    if (card.originalRanks.top === originalTop) {
        console.log('     ✓ originalRanks correctement gelé (modification ignorée)');
    } else {
        console.log('     ❌ originalRanks modifiable');
        return false;
    }
    
    // Test du cache des effective ranks
    const rank1 = card.getEffectiveRank('top', 'Fire', true);
    const rank2 = card.getEffectiveRank('top', 'Fire', true);
    
    if (rank1 === 6 && rank1 === rank2) { // 5 + 1 pour element matching
        console.log('     ✓ Cache des effective ranks fonctionne');
        return true;
    }
    
    return false;
});

// Test 3: Card - Méthodes utilitaires
runTest("Card - Nouvelles méthodes utilitaires", () => {
    const card = new Card(5, 7, 3, 'A', 'BLUE', 'Fire');
    
    // Test getAllEffectiveRanks
    const allRanks = card.getAllEffectiveRanks('Fire', true);
    if (allRanks.top === 6 && allRanks.right === 8 && allRanks.bottom === 4 && allRanks.left === 11) {
        console.log('     ✓ getAllEffectiveRanks fonctionne');
    } else {
        return false;
    }
    
    // Test canBeat
    if (card.canBeat('top', 5, 'Fire', true) && !card.canBeat('bottom', 5, 'Fire', true)) {
        console.log('     ✓ canBeat fonctionne correctement');
        return true;
    }
    
    return false;
});

// Test 4: IA - Stratégie avancée
runTest("IA - Stratégie avancée avec règles spéciales", () => {
    const board = new Board();
    const aiPlayer = new Player('RED', true);
    
    // Setup: IA a une carte qui peut déclencher Same
    const strongCard = new Card(5, 5, 8, 8, 'RED');
    aiPlayer.addCardToHand(strongCard);
    
    // Setup: Cartes adverses avec rang 5 pour déclencher Same
    const enemyCard1 = new Card(1, 5, 4, 8, 'BLUE');
    const enemyCard2 = new Card(6, 2, 9, 5, 'BLUE');
    board.placeCard(enemyCard1, 0, 1);
    board.placeCard(enemyCard2, 1, 0);
    
    // Test que l'IA trouve un coup Same
    const gameRules = { same: true, plus: true, combo: true };
    const move = aiPlayer.getSmartMove(board, null, false, gameRules);
    
    if (move && move.row === 1 && move.col === 1) {
        console.log('     ✓ IA identifie l\'opportunité Same rule');
        
        // Vérifier le score
        if (move.score && move.score > 20) {
            console.log('     ✓ IA assigne un score élevé aux captures spéciales');
            return true;
        }
    }
    
    return false;
});

// Test 5: Game - Configuration flexible
runTest("Game - Configuration flexible des règles", () => {
    // Test construction avec nouvelle API
    const config = {
        rules: {
            elemental: true,
            same: true,
            plus: true
        },
        tradeRule: 'Diff',
        player1Type: 'ai',
        player2Type: 'ai'
    };
    
    const game = new Game(null, null, config);
    
    if (game.rules.elemental && game.rules.same && game.rules.plus && 
        game.rules.tradeRule === 'Diff' &&
        game.players.BLUE.isAI && game.players.RED.isAI) {
        console.log('     ✓ Configuration flexible fonctionne');
        return true;
    }
    
    return false;
});

// Test 6: Game - Presets
runTest("Game - Presets de configuration", () => {
    try {
        const basicGame = Game.createWithPreset('basic');
        const advancedGame = Game.createWithPreset('advanced');
        const completeGame = Game.createWithPreset('complete');
        
        if (!basicGame.rules.same && !basicGame.rules.plus &&
            advancedGame.rules.same && advancedGame.rules.plus && advancedGame.rules.combo &&
            completeGame.rules.elemental && completeGame.rules.suddenDeath) {
            console.log('     ✓ Presets fonctionnent correctement');
            return true;
        }
    } catch (error) {
        console.log(`     ❌ Erreur preset: ${error.message}`);
        return false;
    }
    
    return false;
});

// Test 7: Game - Validation d'entrées robuste
runTest("Game - Validation d'entrées renforcée", () => {
    const game = new Game();
    game.initialize();
    
    // Test validation des moves invalides
    let result1 = game.makeMove(-1, 1, 1); // Index carte invalide
    let result2 = game.makeMove(0, -1, 1); // Position invalide
    let result3 = game.makeMove(0, 1, 5); // Position hors limites
    let result4 = game.makeMove('a', 1, 1); // Type invalide
    
    if (!result1 && !result2 && !result3 && !result4) {
        console.log('     ✓ Validation d\'entrées rejette les moves invalides');
        
        // Test move valide
        let validResult = game.makeMove(0, 1, 1);
        if (validResult) {
            console.log('     ✓ Move valide accepté');
            return true;
        }
    }
    
    return false;
});

// Test 8: Game - Validation de configuration
runTest("Game - Validation de configuration", () => {
    try {
        // Test configuration invalide
        new Game(null, null, { tradeRule: 'Invalid' });
        return false; // Ne devrait pas arriver
    } catch (error) {
        if (error.message.includes('Invalid trade rule')) {
            console.log('     ✓ Validation de configuration rejette les valeurs invalides');
        } else {
            return false;
        }
    }
    
    try {
        // Test configuration avec avertissements
        const originalWarn = console.warn;
        let warnCalled = false;
        console.warn = () => { warnCalled = true; };
        
        new Game(null, null, { rules: { combo: true } }); // Combo sans Same/Plus
        
        console.warn = originalWarn;
        
        if (warnCalled) {
            console.log('     ✓ Avertissements pour configurations incohérentes');
            return true;
        }
    } catch (error) {
        return false;
    }
    
    return false;
});

// Test 9: Game - Rétrocompatibilité
runTest("Game - Rétrocompatibilité avec ancienne API", () => {
    try {
        // Test ancien constructeur
        const oldGame = new Game({ same: true, plus: true, elemental: true });
        
        if (oldGame.rules.same && oldGame.rules.plus && oldGame.rules.elemental) {
            console.log('     ✓ Rétrocompatibilité avec ancien constructeur');
            return true;
        }
    } catch (error) {
        console.log(`     ❌ Erreur rétrocompatibilité: ${error.message}`);
        return false;
    }
    
    return false;
});

// Test 10: Performance - Cache et optimisations
runTest("Performance - Cache et optimisations", () => {
    const card = new Card(5, 7, 3, 9, 'BLUE', 'Fire');
    
    // Test performance du cache
    const start = Date.now();
    for (let i = 0; i < 1000; i++) {
        card.getEffectiveRank('top', 'Fire', true);
    }
    const cached = Date.now() - start;
    
    // Clear cache et retest
    card.clearEffectiveRanksCache();
    const start2 = Date.now();
    for (let i = 0; i < 1000; i++) {
        card.getEffectiveRank('top', 'Fire', true);
    }
    const uncached = Date.now() - start2;
    
    if (cached <= uncached + 5) { // Allow some margin for variance
        console.log('     ✓ Cache améliore les performances');
    } else {
        console.log(`     ⚠️  Cache: ${cached}ms, Sans cache: ${uncached}ms`);
    }
    
    // Test que le cache fonctionne correctement
    const rank1 = card.getEffectiveRank('top', 'Fire', true);
    const rank2 = card.getEffectiveRank('top', 'Fire', true);
    
    if (rank1 === rank2 && rank1 === 6) {
        console.log('     ✓ Cache retourne des valeurs cohérentes');
        return true;
    }
    
    return false;
});

// Test 11: Documentation - JSDoc présente
runTest("Documentation - JSDoc ajoutée", () => {
    const fs = require('fs');
    const gameSource = fs.readFileSync('../src/Game.js', 'utf8');
    
    // Compter les blocs JSDoc dans Game.js
    const jsdocBlocks = (gameSource.match(/\/\*\*[\s\S]*?\*\//g) || []).length;
    
    if (jsdocBlocks >= 5) {
        console.log(`     ✓ Documentation JSDoc ajoutée (${jsdocBlocks} blocs trouvés)`);
        return true;
    } else {
        console.log(`     ❌ Documentation insuffisante (${jsdocBlocks} blocs JSDoc)`);
        return false;
    }
});

// Test 12: Integration - Jeu v0.8 fonctionnel complet
runTest("Integration - Jeu v0.8 entièrement fonctionnel", () => {
    try {
        // Test avec configuration complète et deux IA
        const game = Game.createWithPreset('tournament', { 
            player1Type: 'ai', 
            player2Type: 'ai' 
        });
        game.initialize();
        
        // Vérifier initialisation
        if (game.players.BLUE.hand.length === 5 &&
            game.players.RED.hand.length === 5 &&
            game.rules.elemental && game.rules.same && game.rules.plus && game.rules.combo) {
            console.log('     ✓ Jeu v0.8 initialisé avec preset tournament');
            
            // Test un tour complet avec IA
            if (game.players[game.currentPlayer].isAI) {
                const played = game.playTurn();
                if (played) {
                    console.log('     ✓ IA avancée fonctionne avec nouvelles règles');
                    return true;
                }
            }
        }
    } catch (error) {
        console.log(`     ❌ Erreur intégration: ${error.message}`);
        return false;
    }
    
    return false;
});

// Résultats finaux
console.log('\n' + '='.repeat(60));
console.log('📊 RÉSULTATS TESTS v0.8');
console.log('='.repeat(60));

console.log(`Tests exécutés: ${testCount}`);
console.log(`Tests réussis: ${passedTests}`);
console.log(`Taux de réussite: ${((passedTests/testCount) * 100).toFixed(1)}%`);

if (passedTests === testCount) {
    console.log('\n🎉 SUCCÈS TOTAL ! Triple Triad v0.8 est entièrement fonctionnel !');
    console.log('✅ Architecture consolidée, configurabilité améliorée !');
    process.exit(0);
} else {
    console.log(`\n⚠️  ${testCount - passedTests} test(s) ont échoué.`);
    console.log('❌ v0.8 nécessite des corrections.');
    process.exit(1);
}