#!/usr/bin/env node

const Game = require('../src/Game');
const Board = require('../src/Board');
const Card = require('../src/Card');
const Player = require('../src/Player');

console.log('🧪 TESTS v0.7 - AMÉLIORATIONS QUALITÉ & ROBUSTESSE');
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

// Test 1: Board - Validation des positions améliorée
runTest("Board - Validation des positions avec isPositionOccupied", () => {
    const board = new Board();
    
    // Test position valide vide
    if (!board.isPositionOccupied(1, 1)) {
        console.log('     ✓ Position vide correctement détectée');
    } else {
        return false;
    }
    
    // Placer une carte
    const card = new Card(5, 5, 5, 5, 'BLUE');
    board.placeCard(card, 1, 1);
    
    // Test position occupée
    if (board.isPositionOccupied(1, 1)) {
        console.log('     ✓ Position occupée correctement détectée');
    } else {
        return false;
    }
    
    // Test position invalide
    if (!board.isPositionOccupied(-1, 5)) {
        console.log('     ✓ Position invalide correctement gérée');
    } else {
        return false;
    }
    
    return true;
});

// Test 2: Board - Gestion d'erreurs dans placeCard
runTest("Board - Gestion d'erreurs robuste dans placeCard", () => {
    const board = new Board();
    const card = new Card(5, 5, 5, 5, 'BLUE');
    
    // Test placement hors limites
    try {
        board.placeCard(card, -1, 0);
        return false; // Ne devrait pas arriver
    } catch (error) {
        if (error.message.includes('out of bounds')) {
            console.log('     ✓ Erreur position hors limites détectée');
        } else {
            return false;
        }
    }
    
    // Placer une carte normalement
    board.placeCard(card, 1, 1);
    
    // Test placement sur position occupée
    try {
        const card2 = new Card(3, 3, 3, 3, 'RED');
        board.placeCard(card2, 1, 1);
        return false; // Ne devrait pas arriver
    } catch (error) {
        if (error.message.includes('already occupied')) {
            console.log('     ✓ Erreur position occupée détectée');
        } else {
            return false;
        }
    }
    
    // Test placement carte null
    try {
        board.placeCard(null, 0, 0);
        return false; // Ne devrait pas arriver
    } catch (error) {
        if (error.message.includes('null or undefined')) {
            console.log('     ✓ Erreur carte null détectée');
        } else {
            return false;
        }
    }
    
    return true;
});

// Test 3: Board - Affichage amélioré avec couleurs
runTest("Board - Affichage amélioré avec score", () => {
    const board = new Board();
    const blueCard = new Card(5, 5, 5, 5, 'Player1');
    const redCard = new Card(3, 3, 3, 3, 'Player2');
    
    board.placeCard(blueCard, 0, 0);
    board.placeCard(redCard, 2, 2);
    
    // Capturer la sortie console (simulation)
    const originalLog = console.log;
    let output = '';
    console.log = (msg) => { output += msg + '\n'; };
    
    board.display();
    
    console.log = originalLog;
    
    // Vérifier que l'affichage contient les éléments attendus
    if (output.includes('Score:') && output.includes('Player1') && output.includes('Player2')) {
        console.log('     ✓ Affichage contient le score des joueurs');
        return true;
    }
    
    return false;
});

// Test 4: Card - Gestion correcte des rangs 'A'
runTest("Card - Gestion correcte des rangs 'A' comme 10", () => {
    const card = new Card('A', 5, 'A', 3, 'BLUE');
    
    // Vérifier normalisation interne
    if (card.getOriginalRank('top') === 10 && card.getOriginalRank('bottom') === 10) {
        console.log('     ✓ Rang A normalisé à 10 en interne');
    } else {
        return false;
    }
    
    // Vérifier affichage toString
    const cardString = card.toString();
    if (cardString.includes('A') && cardString.includes('5') && cardString.includes('3')) {
        console.log('     ✓ toString affiche A au lieu de 10');
        return true;
    }
    
    return false;
});

// Test 5: Player - Collection management robuste
runTest("Player - Gestion robuste des collections", () => {
    const player = new Player('TEST', false);
    const card = new Card(5, 5, 5, 5, 'TEST');
    
    // Test ajout normal
    const added = player.addCardToCollection(card);
    if (added) {
        console.log('     ✓ Ajout normal réussi');
    } else {
        return false;
    }
    
    // Test ajout duplicate (doit échouer)
    const addedDuplicate = player.addCardToCollection(card);
    if (!addedDuplicate) {
        console.log('     ✓ Ajout duplicate correctement refusé');
    } else {
        return false;
    }
    
    // Test suppression normale
    const removed = player.removeCardFromCollection(card);
    if (removed) {
        console.log('     ✓ Suppression normale réussie');
    } else {
        return false;
    }
    
    // Test suppression carte inexistante
    const removedAgain = player.removeCardFromCollection(card);
    if (!removedAgain) {
        console.log('     ✓ Suppression carte inexistante correctement gérée');
    } else {
        return false;
    }
    
    // Test avec null
    try {
        player.addCardToCollection(null);
        return false; // Ne devrait pas arriver
    } catch (error) {
        if (error.message.includes('null or undefined')) {
            console.log('     ✓ Gestion null correcte');
        } else {
            return false;
        }
    }
    
    return true;
});

// Test 6: Player - IA améliorée avec priorités
runTest("Player - IA avec priorité capture > blocage > aléatoire", () => {
    const board = new Board();
    const aiPlayer = new Player('RED', true);
    
    // Setup: AI a une carte forte
    const strongCard = new Card(9, 9, 9, 9, 'RED');
    aiPlayer.addCardToHand(strongCard);
    
    // Setup: Adversaire a une carte faible sur le plateau
    const weakCard = new Card(1, 1, 1, 1, 'BLUE');
    board.placeCard(weakCard, 1, 1);
    
    // Test que l'IA trouve un coup de capture
    const move = aiPlayer.getSmartMove(board, null, false);
    
    if (move) {
        // Vérifier que le coup peut capturer
        const card = aiPlayer.getCard(move.cardIndex);
        const captures = aiPlayer.countPotentialCaptures(board, card, move.row, move.col, false);
        
        if (captures > 0) {
            console.log('     ✓ IA trouve un coup de capture quand possible');
            return true;
        }
    }
    
    return false;
});

// Test 7: Game - Messages console améliorés
runTest("Game - Messages console avec émojis et détails", () => {
    const game = new Game({ same: true, plus: true });
    
    // Capturer la sortie console
    const originalLog = console.log;
    let output = '';
    console.log = (msg) => { output += msg + '\n'; };
    
    game.initialize();
    
    console.log = originalLog;
    
    // Vérifier que l'initialisation contient des améliorations v0.7
    if (output.includes('v0.7') && output.includes('Active Rules:')) {
        console.log('     ✓ Messages d\'initialisation améliorés');
        return true;
    }
    
    return false;
});

// Test 8: Game - Gestion cohérente des règles
runTest("Game - Gestion cohérente des règles via this.rules", () => {
    const customRules = {
        open: true,
        random: true,
        elemental: true,
        same: true,
        plus: true,
        sameWall: true,
        combo: true,
        suddenDeath: true,
        tradeRule: 'All'
    };
    
    const game = new Game(customRules);
    
    // Vérifier que toutes les règles sont correctement stockées
    if (game.rules.open === true &&
        game.rules.same === true &&
        game.rules.combo === true &&
        game.rules.tradeRule === 'All') {
        console.log('     ✓ Règles personnalisées correctement appliquées');
        return true;
    }
    
    return false;
});

// Test 9: Integration - Formatage des règles actives
runTest("Game - Formatage des règles actives", () => {
    const game = new Game({
        open: true,
        same: true,
        combo: true
    });
    
    const formatted = game.formatActiveRules();
    
    if (formatted.includes('Open') && 
        formatted.includes('Same') && 
        formatted.includes('Combo') &&
        !formatted.includes('Random')) {
        console.log('     ✓ Formatage des règles actives correct');
        return true;
    }
    
    return false;
});

// Test 10: Intégration complète - Jeu v0.7 fonctionnel
runTest("Intégration - Jeu v0.7 entièrement fonctionnel", () => {
    const game = new Game({
        elemental: true,
        same: true,
        plus: true,
        combo: true
    });
    
    try {
        game.initialize();
        
        // Vérifier que le jeu est prêt
        if (game.players.BLUE.hand.length === 5 &&
            game.players.RED.hand.length === 5 &&
            game.currentPlayer !== null) {
            console.log('     ✓ Jeu v0.7 initialisé correctement');
            
            // S'assurer qu'on teste un joueur IA
            if (game.players[game.currentPlayer].isAI) {
                const played = game.playTurn();
                if (played) {
                    console.log('     ✓ Tour IA fonctionne correctement');
                    return true;
                }
            } else {
                // Si c'est un joueur humain, simuler un tour
                const humanPlayer = game.players[game.currentPlayer];
                const board = game.board;
                const emptyPositions = board.getEmptyPositions();
                
                if (humanPlayer.hand.length > 0 && emptyPositions.length > 0) {
                    console.log('     ✓ Joueur humain prêt à jouer');
                    console.log('     ✓ Plateau et main correctement configurés');
                    return true;
                }
            }
        }
    } catch (error) {
        console.log(`     ❌ Erreur lors de l'initialisation: ${error.message}`);
        return false;
    }
    
    return false;
});

// Résultats finaux
console.log('\n' + '='.repeat(60));
console.log('📊 RÉSULTATS TESTS v0.7');
console.log('='.repeat(60));

console.log(`Tests exécutés: ${testCount}`);
console.log(`Tests réussis: ${passedTests}`);
console.log(`Taux de réussite: ${((passedTests/testCount) * 100).toFixed(1)}%`);

if (passedTests === testCount) {
    console.log('\n🎉 SUCCÈS TOTAL ! Toutes les améliorations v0.7 fonctionnent !');
    console.log('✅ Robustesse, qualité du code et UX améliorées !');
    process.exit(0);
} else {
    console.log(`\n⚠️  ${testCount - passedTests} test(s) ont échoué.`);
    console.log('❌ Des améliorations v0.7 nécessitent des corrections.');
    process.exit(1);
}