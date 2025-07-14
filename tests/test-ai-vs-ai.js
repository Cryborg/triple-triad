const Game = require('../src/Game');

class TestGame extends Game {
    constructor(rules, testName) {
        // v0.8 compatibility: convert rules to config format
        const config = {
            rules: rules,
            player1Type: 'ai',
            player2Type: 'ai'
        };
        super(null, null, config);
        this.violations = [];
        this.moveHistory = [];
        this.testName = testName;
        this.detailedLogs = [];
    }

    log(message, level = 'INFO') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${level}] [${this.testName}] ${message}`;
        this.detailedLogs.push(logEntry);
        if (level === 'ERROR' || level === 'WARN') {
            console.log(logEntry);
        }
    }

    initialize() {
        this.log(`Initialisation du test avec règles: ${JSON.stringify(this.rules)}`);
        
        // Call parent initialize which handles everything
        super.initialize();
        
        // Just do our verification
        this.log('Vérification de l\'état initial...');
        this.verifyInitialState();
        
        if (this.violations.length === 0) {
            this.log('✓ Initialisation correcte');
        } else {
            this.log(`✗ Erreurs d'initialisation: ${this.violations.length}`, 'ERROR');
        }
        
        this.log(`${this.currentPlayer} commence la partie`);
    }

    verifyInitialState() {
        this.log('Vérification du nombre de cartes en main...');
        if (this.players.BLUE.hand.length !== 5) {
            const violation = `BLUE n'a pas 5 cartes (${this.players.BLUE.hand.length})`;
            this.violations.push(violation);
            this.log(violation, 'ERROR');
        }
        if (this.players.RED.hand.length !== 5) {
            const violation = `RED n'a pas 5 cartes (${this.players.RED.hand.length})`;
            this.violations.push(violation);
            this.log(violation, 'ERROR');
        }
        
        this.log('Vérification que le plateau est vide...');
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (this.board.grid[row][col] !== null) {
                    const violation = `Le plateau n'est pas vide à l'initialisation (${row}, ${col})`;
                    this.violations.push(violation);
                    this.log(violation, 'ERROR');
                }
            }
        }
        
        this.log('Vérification de la validité des cartes...');
        const allCards = [...this.players.BLUE.hand, ...this.players.RED.hand];
        allCards.forEach((card, index) => {
            const player = index < 5 ? 'BLUE' : 'RED';
            this.log(`Vérification carte ${index} (${player}): ${card.toString()}`);
            
            if (!card.originalRanks || typeof card.originalRanks !== 'object') {
                const violation = `Carte ${index} (${player}) mal formée - pas d'originalRanks`;
                this.violations.push(violation);
                this.log(violation, 'ERROR');
            }
            
            if (!card.element) {
                const violation = `Carte ${index} (${player}) sans élément défini`;
                this.violations.push(violation);
                this.log(violation, 'ERROR');
            }
            
            ['top', 'right', 'bottom', 'left'].forEach(side => {
                const rank = card.getOriginalRank(side);
                if (rank < 1 || rank > 10) {
                    const violation = `Carte ${index} (${player}) a un rang invalide: ${side}=${rank}`;
                    this.violations.push(violation);
                    this.log(violation, 'ERROR');
                }
            });
        });
        
        if (this.rules.elemental) {
            this.log('Vérification des cases élémentaires...');
            let elementalSquareCount = 0;
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    const element = this.board.getSquareElement(row, col);
                    if (element !== 'None') {
                        elementalSquareCount++;
                        this.log(`Case élémentaire (${row},${col}): ${element}`);
                    }
                }
            }
            if (elementalSquareCount === 0) {
                const violation = 'Aucune case élémentaire alors que la règle est active';
                this.violations.push(violation);
                this.log(violation, 'ERROR');
            } else {
                this.log(`${elementalSquareCount} case(s) élémentaire(s) trouvée(s)`);
            }
        }
        
        this.log(`Vérification initiale terminée: ${this.violations.length} violations trouvées`);
    }

    playTurn() {
        const turnNumber = this.turnCount + 1;
        const player = this.players[this.currentPlayer];
        const cardsBeforeTurn = player.hand.length;
        const boardStateBeforeTurn = this.getBoardState();
        
        this.log(`=== Tour ${turnNumber} - ${this.currentPlayer} ===`);
        this.log(`Cartes en main avant le tour: ${cardsBeforeTurn}`);
        
        // Log des cartes en main
        player.hand.forEach((card, index) => {
            this.log(`Main ${this.currentPlayer}[${index}]: ${card.toString()}`);
        });
        
        const move = player.getSmartMove(this.board, null, this.rules.elemental);
        
        if (!move) {
            const violation = `${this.currentPlayer} n'a pas pu générer de coup au tour ${turnNumber}`;
            this.violations.push(violation);
            this.log(violation, 'ERROR');
            return false;
        }
        
        const card = player.getCard(move.cardIndex);
        this.log(`${this.currentPlayer} joue carte[${move.cardIndex}]: ${card.toString()} en position (${move.row}, ${move.col})`);
        
        // Log des informations élémentaires si applicable
        if (this.rules.elemental) {
            const squareElement = this.board.getSquareElement(move.row, move.col);
            this.log(`Élément carte: ${card.element}, Élément case: ${squareElement}`);
            
            if (squareElement !== 'None') {
                ['top', 'right', 'bottom', 'left'].forEach(side => {
                    const originalRank = card.getOriginalRank(side);
                    const effectiveRank = card.getEffectiveRank(side, squareElement, true);
                    if (originalRank !== effectiveRank) {
                        this.log(`Rang ${side}: ${originalRank} → ${effectiveRank} (élément ${card.element} vs ${squareElement})`);
                    }
                });
            }
        }
        
        this.verifyMoveValidity(move, turnNumber);
        
        const capturesBeforeMove = this.countPotentialCaptures(card, move.row, move.col);
        this.log(`Captures potentielles calculées: ${capturesBeforeMove}`);
        
        // Log de l'état du plateau avant le coup
        this.logBoardState('avant le coup');
        
        if (!this.makeMove(move.cardIndex, move.row, move.col)) {
            const violation = `Échec du coup au tour ${turnNumber}`;
            this.violations.push(violation);
            this.log(violation, 'ERROR');
            return false;
        }
        
        // Log de l'état du plateau après le coup
        this.logBoardState('après le coup');
        
        this.moveHistory.push({
            turn: turnNumber,
            player: this.currentPlayer,
            card: card.toString(),
            element: card.element,
            position: { row: move.row, col: move.col },
            captures: capturesBeforeMove,
            squareElement: this.board.getSquareElement(move.row, move.col)
        });
        
        this.verifyPostMoveState(player, cardsBeforeTurn, boardStateBeforeTurn, turnNumber);
        
        this.log(`Tour ${turnNumber} terminé avec succès`);
        return true;
    }

    verifyMoveValidity(move, turnNumber) {
        this.log(`Vérification validité du coup: (${move.row}, ${move.col})`);
        
        if (move.row < 0 || move.row > 2 || move.col < 0 || move.col > 2) {
            const violation = `Position invalide (${move.row}, ${move.col}) au tour ${turnNumber}`;
            this.violations.push(violation);
            this.log(violation, 'ERROR');
        }
        
        if (!this.board.isPositionEmpty(move.row, move.col)) {
            const violation = `Position déjà occupée (${move.row}, ${move.col}) au tour ${turnNumber}`;
            this.violations.push(violation);
            this.log(violation, 'ERROR');
        } else {
            this.log(`Position (${move.row}, ${move.col}) valide et libre`);
        }
    }

    logBoardState(moment) {
        this.log(`État du plateau ${moment}:`);
        for (let row = 0; row < 3; row++) {
            let rowString = '';
            for (let col = 0; col < 3; col++) {
                const card = this.board.getCard(row, col);
                if (card) {
                    rowString += `[${card.owner[0]}:${card.element[0] || 'N'}] `;
                } else {
                    const element = this.board.getSquareElement(row, col);
                    rowString += `[${element === 'None' ? 'Empty' : element[0]}] `;
                }
            }
            this.log(`Plateau row ${row}: ${rowString}`);
        }
        
        const counts = this.board.countCardsByOwner();
        this.log(`Décompte ${moment}: BLUE=${counts.BLUE || 0}, RED=${counts.RED || 0}`);
    }

    verifyPostMoveState(player, cardsBeforeTurn, boardStateBeforeTurn, turnNumber) {
        this.log(`Vérification post-coup tour ${turnNumber}`);
        
        const cardsAfterTurn = player.hand.length;
        this.log(`Cartes en main: ${cardsBeforeTurn} → ${cardsAfterTurn}`);
        
        if (cardsAfterTurn !== cardsBeforeTurn - 1) {
            const violation = `Nombre de cartes incorrect après le tour ${turnNumber}: ${cardsAfterTurn} au lieu de ${cardsBeforeTurn - 1}`;
            this.violations.push(violation);
            this.log(violation, 'ERROR');
        }
        
        let placedCards = 0;
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (this.board.grid[row][col] !== null) {
                    placedCards++;
                }
            }
        }
        
        this.log(`Cartes sur le plateau: ${placedCards}, attendu: ${turnNumber}`);
        
        if (placedCards !== turnNumber) {
            const violation = `Nombre de cartes sur le plateau incorrect: ${placedCards} au lieu de ${turnNumber}`;
            this.violations.push(violation);
            this.log(violation, 'ERROR');
        }
        
        const totalCards = this.players.BLUE.hand.length + this.players.RED.hand.length + placedCards;
        this.log(`Total cartes: BLUE(${this.players.BLUE.hand.length}) + RED(${this.players.RED.hand.length}) + Plateau(${placedCards}) = ${totalCards}`);
        
        if (totalCards !== 10) {
            const violation = `Nombre total de cartes incorrect: ${totalCards} au tour ${turnNumber}`;
            this.violations.push(violation);
            this.log(violation, 'ERROR');
        }
    }

    countPotentialCaptures(card, row, col) {
        const adjacent = this.board.getAdjacentCards(row, col);
        let captures = 0;

        const adjacentPositions = {
            top: { row: row - 1, col },
            right: { row, col: col + 1 },
            bottom: { row: row + 1, col },
            left: { row, col: col - 1 }
        };

        const placedSquareElement = this.board.getSquareElement(row, col);

        const comparisons = [
            { side: 'top', adjacentCard: adjacent.top, cardSide: 'bottom', adjacentPos: adjacentPositions.top },
            { side: 'right', adjacentCard: adjacent.right, cardSide: 'left', adjacentPos: adjacentPositions.right },
            { side: 'bottom', adjacentCard: adjacent.bottom, cardSide: 'top', adjacentPos: adjacentPositions.bottom },
            { side: 'left', adjacentCard: adjacent.left, cardSide: 'right', adjacentPos: adjacentPositions.left }
        ];

        this.log(`Calcul captures pour carte ${card.toString()} en (${row},${col})`);

        for (const { side, adjacentCard, cardSide, adjacentPos } of comparisons) {
            if (adjacentCard && adjacentCard.owner !== card.owner) {
                let cardRank, adjacentRank;
                
                if (this.rules.elemental) {
                    const adjacentSquareElement = this.board.getSquareElement(adjacentPos.row, adjacentPos.col);
                    cardRank = card.getEffectiveRank(side, placedSquareElement, true);
                    adjacentRank = adjacentCard.getEffectiveRank(cardSide, adjacentSquareElement, true);
                    this.log(`Comparaison ${side}: ${cardRank}(effectif) vs ${adjacentRank}(effectif) - carte adverse ${adjacentCard.toString()}`);
                } else {
                    cardRank = card.getRank(side);
                    adjacentRank = adjacentCard.getRank(cardSide);
                    this.log(`Comparaison ${side}: ${cardRank} vs ${adjacentRank} - carte adverse ${adjacentCard.toString()}`);
                }
                
                if (cardRank > adjacentRank) {
                    captures++;
                    this.log(`Capture détectée côté ${side}: ${cardRank} > ${adjacentRank}`);
                }
            } else if (adjacentCard) {
                this.log(`Pas de capture côté ${side}: même propriétaire`);
            } else {
                this.log(`Pas de carte adjacente côté ${side}`);
            }
        }

        this.log(`Total captures calculées: ${captures}`);
        return captures;
    }

    getBoardState() {
        const state = [];
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const card = this.board.grid[row][col];
                if (card) {
                    state.push({ row, col, owner: card.owner });
                }
            }
        }
        return state;
    }

    resolveCaptures(placedCard, row, col) {
        this.log(`Début capture adjacentes pour ${placedCard.toString()} en (${row},${col})`);
        const capturesBefore = this.board.countCardsByOwner();
        this.log(`Décompte avant captures: BLUE=${capturesBefore.BLUE || 0}, RED=${capturesBefore.RED || 0}`);
        
        super.resolveCaptures(placedCard, row, col);
        
        const capturesAfter = this.board.countCardsByOwner();
        this.log(`Décompte après captures: BLUE=${capturesAfter.BLUE || 0}, RED=${capturesAfter.RED || 0}`);
        
        const blueChange = (capturesAfter.BLUE || 0) - (capturesBefore.BLUE || 0);
        const redChange = (capturesAfter.RED || 0) - (capturesBefore.RED || 0);
        
        this.log(`Changements: BLUE=${blueChange}, RED=${redChange}`);
        
        if (Math.abs(blueChange) !== Math.abs(redChange)) {
            const violation = `Incohérence dans les captures: BLUE ${blueChange}, RED ${redChange}`;
            this.violations.push(violation);
            this.log(violation, 'ERROR');
        }
    }

    getWinner() {
        const counts = this.board.countCardsByOwner();
        const blueScore = (counts.BLUE || 0) + this.players.BLUE.hand.length;
        const redScore = (counts.RED || 0) + this.players.RED.hand.length;
        
        if (blueScore > redScore) return 'BLUE';
        if (redScore > blueScore) return 'RED';
        return 'DRAW';
    }

    displayFinalReport() {
        console.log(`\n=== Rapport Final ${this.testName} ===`);
        console.log(`Tours joués: ${this.turnCount}`);
        console.log(`Règles: ${JSON.stringify(this.rules)}`);
        
        if (this.violations.length > 0) {
            console.log('\n❌ Violations détectées:');
            this.violations.forEach(v => console.log(`  - ${v}`));
        } else {
            console.log('\n✓ Aucune violation des règles détectée');
        }
        
        console.log('\n=== Historique des coups ===');
        this.moveHistory.forEach(move => {
            let moveStr = `Tour ${move.turn}: ${move.player} joue ${move.card}`;
            if (move.element && move.element !== 'None') {
                moveStr += ` (${move.element})`;
            }
            moveStr += ` en (${move.position.row},${move.position.col})`;
            if (move.squareElement && move.squareElement !== 'None') {
                moveStr += ` sur case ${move.squareElement}`;
            }
            console.log(moveStr);
        });
        
        return this.violations.length === 0;
    }

    saveDetailedLogs(filename) {
        const fs = require('fs');
        const logContent = this.detailedLogs.join('\n');
        fs.writeFileSync(filename, logContent);
        console.log(`Logs détaillés sauvegardés dans ${filename}`);
    }
}

async function runComprehensiveTests() {
    console.log('=== Tests Compréhensifs Triple Triad - Toutes Combinaisons ===\n');
    
    const testConfigurations = [
        { name: 'Aucune règle', rules: { open: false, random: false, elemental: false } },
        { name: 'Open seulement', rules: { open: true, random: false, elemental: false } },
        { name: 'Random seulement', rules: { open: false, random: true, elemental: false } },
        { name: 'Elemental seulement', rules: { open: false, random: false, elemental: true } },
        { name: 'Open + Random', rules: { open: true, random: true, elemental: false } },
        { name: 'Open + Elemental', rules: { open: true, random: false, elemental: true } },
        { name: 'Random + Elemental', rules: { open: false, random: true, elemental: true } },
        { name: 'Toutes les règles', rules: { open: true, random: true, elemental: true } }
    ];
    
    const results = [];
    let totalTests = 0;
    let passedTests = 0;
    
    for (const config of testConfigurations) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`🧪 TEST: ${config.name}`);
        console.log(`Règles: ${JSON.stringify(config.rules)}`);
        console.log(`${'='.repeat(60)}`);
        
        const game = new TestGame(config.rules, config.name);
        
        try {
            game.initialize();
            
            let turnCount = 0;
            let gameCompleted = false;
            
            while (!game.checkGameEnd() && turnCount < 10) {
                if (!game.playTurn()) {
                    console.error(`❌ Erreur lors du tour ${turnCount + 1}`);
                    break;
                }
                
                // Affichage minimal pour ne pas encombrer
                if (turnCount % 3 === 0 || turnCount === 8) {
                    const counts = game.board.countCardsByOwner();
                    console.log(`📊 Tour ${turnCount + 1}/9 - BLUE: ${counts.BLUE || 0}, RED: ${counts.RED || 0}`);
                }
                
                turnCount++;
            }
            
            if (game.checkGameEnd()) {
                gameCompleted = true;
                const winner = game.getWinner();
                console.log(`🏆 ${winner === 'DRAW' ? 'Match nul' : winner + ' gagne'}`);
            }
            
            const testPassed = game.displayFinalReport();
            
            // Sauvegarde des logs détaillés
            const logFilename = `logs_${config.name.replace(/\s+/g, '_').toLowerCase()}.txt`;
            game.saveDetailedLogs(logFilename);
            
            results.push({
                name: config.name,
                rules: config.rules,
                passed: testPassed,
                completed: gameCompleted,
                violations: game.violations.length,
                turns: game.turnCount
            });
            
            totalTests++;
            if (testPassed) {
                passedTests++;
                console.log(`✅ Test "${config.name}" RÉUSSI`);
            } else {
                console.log(`❌ Test "${config.name}" ÉCHOUÉ (${game.violations.length} violations)`);
            }
            
        } catch (error) {
            console.error(`💥 Erreur critique dans le test "${config.name}":`, error);
            results.push({
                name: config.name,
                rules: config.rules,
                passed: false,
                completed: false,
                violations: -1,
                error: error.message
            });
            totalTests++;
        }
    }
    
    // Rapport final global
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📋 RAPPORT FINAL GLOBAL`);
    console.log(`${'='.repeat(80)}`);
    console.log(`Tests exécutés: ${totalTests}`);
    console.log(`Tests réussis: ${passedTests}`);
    console.log(`Taux de réussite: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    console.log(`\n📊 Détail par test:`);
    results.forEach(result => {
        const status = result.passed ? '✅' : '❌';
        const violations = result.violations >= 0 ? `${result.violations} violations` : 'Erreur critique';
        console.log(`${status} ${result.name}: ${violations} (${result.turns || 0} tours)`);
    });
    
    if (passedTests === totalTests) {
        console.log(`\n🎉 SUCCÈS TOTAL ! Tous les tests sont passés !`);
        console.log(`Triple Triad v0.3 est entièrement fonctionnel avec toutes les combinaisons de règles.`);
    } else {
        console.log(`\n⚠️  ${totalTests - passedTests} test(s) ont échoué. Vérification nécessaire.`);
    }
    
    return passedTests === totalTests;
}

runComprehensiveTests().catch(console.error);