#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

const tests = [
    { name: 'AI vs AI (toutes règles v0.3)', file: 'test-ai-vs-ai.js' },
    { name: 'Nouvelles règles v0.4', file: 'test-v0-4.js' },
    { name: 'Tests avancés v0.4', file: 'test-v0-4-extended.js' },
    { name: 'Tests Plus rule détaillés', file: 'test-perfect-plus-same.js' }
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
        console.log('Triple Triad v0.4 est entièrement fonctionnel ! 🎯');
    } else {
        console.log(`\n⚠️  ${total - successful} test(s) ont échoué.`);
    }
    
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