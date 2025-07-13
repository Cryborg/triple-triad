#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

const tests = [
    { name: 'AI vs AI (toutes règles v0.3)', file: 'test-ai-vs-ai.js', version: 'v0.3' },
    { name: 'Nouvelles règles v0.4', file: 'test-v0-4.js', version: 'v0.4' },
    { name: 'Tests avancés v0.4', file: 'test-v0-4-extended.js', version: 'v0.4' },
    { name: 'Tests Plus rule détaillés', file: 'test-perfect-plus-same.js', version: 'v0.4' },
    { name: 'Règle Combo v0.5', file: 'test-v0-5.js', version: 'v0.5' },
    { name: 'Tests avancés Combo v0.5', file: 'test-v0-5-advanced.js', version: 'v0.5' }
];

async function runTest(testFile, testName) {
    return new Promise((resolve) => {
        console.log(`\n${'='.repeat(80)}`);
        console.log(`🧪 LANCEMENT: ${testName}`);
        console.log(`📄 Fichier: ${testFile}`);
        console.log(`${'='.repeat(80)}\n`);

        const child = spawn('node', [testFile], {
            cwd: path.join(__dirname),
            stdio: 'inherit'
        });

        child.on('close', (code) => {
            const status = code === 0 ? '✅ RÉUSSI' : '❌ ÉCHEC';
            console.log(`\n${'-'.repeat(40)}`);
            console.log(`📊 ${testName}: ${status}`);
            console.log(`${'-'.repeat(40)}\n`);
            resolve({ name: testName, success: code === 0 });
        });
    });
}

async function runAllTests() {
    console.log('🚀 TRIPLE TRIAD - SUITE DE TESTS COMPLÈTE 🚀\n');
    console.log(`Lancement de ${tests.length} suites de tests...\n`);

    const results = [];
    
    for (const test of tests) {
        const result = await runTest(test.file, test.name);
        results.push(result);
    }

    // Rapport final
    console.log('\n' + '='.repeat(80));
    console.log('📋 RAPPORT FINAL GLOBAL');
    console.log('='.repeat(80));
    
    const successful = results.filter(r => r.success).length;
    const total = results.length;
    
    console.log(`Tests exécutés: ${total}`);
    console.log(`Tests réussis: ${successful}`);
    console.log(`Taux de réussite: ${((successful/total) * 100).toFixed(1)}%\n`);
    
    console.log('📊 Détail par suite:');
    results.forEach(result => {
        const icon = result.success ? '✅' : '❌';
        console.log(`${icon} ${result.name}`);
    });
    
    if (successful === total) {
        console.log('\n🎉 SUCCÈS TOTAL ! Tous les tests sont passés !');
        console.log('Triple Triad v0.5 est entièrement fonctionnel ! 🎯');
    } else {
        console.log(`\n⚠️  ${total - successful} test(s) ont échoué.`);
    }
    
    // Récapitulatif par version
    console.log('\n' + '='.repeat(80));
    console.log('📊 RÉCAPITULATIF PAR VERSION');
    console.log('='.repeat(80));
    
    const versionSummary = {};
    results.forEach(result => {
        const test = tests.find(t => t.name === result.name);
        const version = test ? test.version : 'unknown';
        
        if (!versionSummary[version]) {
            versionSummary[version] = { total: 0, passed: 0, failed: 0, tests: [] };
        }
        
        versionSummary[version].total++;
        versionSummary[version].tests.push({
            name: result.name,
            success: result.success
        });
        
        if (result.success) {
            versionSummary[version].passed++;
        } else {
            versionSummary[version].failed++;
        }
    });
    
    // Affichage par version
    const sortedVersions = Object.keys(versionSummary).sort();
    
    sortedVersions.forEach(version => {
        const summary = versionSummary[version];
        const statusIcon = summary.failed === 0 ? '✅' : '❌';
        const percentage = ((summary.passed / summary.total) * 100).toFixed(1);
        
        console.log(`\n${statusIcon} ${version.toUpperCase()} - ${summary.passed}/${summary.total} tests réussis (${percentage}%)`);
        
        // Détail des tests pour cette version
        summary.tests.forEach(test => {
            const testIcon = test.success ? '  ✅' : '  ❌';
            console.log(`${testIcon} ${test.name}`);
        });
    });
    
    // Statut global par version
    console.log('\n' + '-'.repeat(80));
    console.log('🏆 STATUT GLOBAL PAR VERSION:');
    
    const versionStatus = {
        'v0.3': { name: 'v0.3 - Règles de base + Elemental', features: ['Open', 'Random', 'Elemental'] },
        'v0.4': { name: 'v0.4 - Règles spéciales', features: ['Same', 'Plus', 'Same Wall'] },
        'v0.5': { name: 'v0.5 - Règle Combo', features: ['Combo (chaînes de captures)'] }
    };
    
    sortedVersions.forEach(version => {
        const summary = versionSummary[version];
        const versionInfo = versionStatus[version];
        const statusIcon = summary.failed === 0 ? '✅' : '❌';
        const status = summary.failed === 0 ? 'FONCTIONNELLE' : 'PROBLÈMES DÉTECTÉS';
        
        if (versionInfo) {
            console.log(`${statusIcon} ${versionInfo.name}: ${status}`);
            console.log(`   Fonctionnalités: ${versionInfo.features.join(', ')}`);
            console.log(`   Tests: ${summary.passed}/${summary.total} réussis`);
        }
    });
    
    console.log('\n' + '='.repeat(80));
}

// Gestion des arguments
const args = process.argv.slice(2);
if (args.length > 0) {
    const requestedTest = args[0];
    const test = tests.find(t => 
        t.file.includes(requestedTest) || 
        t.name.toLowerCase().includes(requestedTest.toLowerCase())
    );
    
    if (test) {
        console.log(`🎯 Lancement du test spécifique: ${test.name}\n`);
        runTest(test.file, test.name);
    } else {
        console.log('❌ Test non trouvé. Tests disponibles:');
        tests.forEach((t, i) => console.log(`  ${i+1}. ${t.name} (${t.file})`));
        console.log('\nUsage: node run-all-tests.js [nom-du-test]');
    }
} else {
    runAllTests();
}