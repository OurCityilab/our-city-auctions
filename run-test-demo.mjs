// run-test-demo.mjs
// Simple script to run the auction demo and component tests

import { runAuctionDemo, testPropertyGenerator, testSessionManager } from './features/auction/test/testDemo.js';

console.log('🎮 OUR CITY AUCTIONS - TEST SUITE');
console.log('==================================\n');

async function runAllTests() {
  try {
    // Test 1: Property Generator
    console.log('🔧 RUNNING COMPONENT TESTS\n');
    testPropertyGenerator();
    
    // Test 2: Session Manager
    testSessionManager();
    
    // Test 3: Full Demo
    console.log('\n\n🎭 RUNNING FULL AUCTION DEMO\n');
    await runAuctionDemo();
    
    console.log('\n\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('====================================');
    console.log('\nThe auction system is ready for classroom use.');
    console.log('Next steps:');
    console.log('• Build the Moderator Console for auction control');
    console.log('• Create Student Dashboard for research interface');
    console.log('• Add Projection Display for classroom viewing');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    process.exit(1);
  }
}

// Run the tests
runAllTests();