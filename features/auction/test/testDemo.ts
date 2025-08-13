// features/auction/test/testDemo.ts

import { sessionManager } from '../classroom/sessionManager';
import { generateSeededProperties } from '../core/propertyGenerator';
import type { 
  ClassroomSession, 
  StudentState,
  AuctionProperty 
} from '../types/auction.types';

// ============================================================================
// Test Demo Script - Simulates a Complete Auction
// ============================================================================

console.log('🎮 WAYNE COUNTY AUCTION GAME - TEST DEMO');
console.log('==========================================\n');

/**
 * Main demo function - run this to test the entire system
 */
export async function runAuctionDemo() {
  try {
    // Step 1: Create a classroom session
    console.log('📍 STEP 1: Creating Classroom Session');
    const session = createTestSession();
    
    // Step 2: Add students
    console.log('\n📍 STEP 2: Adding Students');
    const students = addTestStudents(session);
    
    // Step 3: Preview Phase - Students research properties
    console.log('\n📍 STEP 3: PREVIEW PHASE - Research Period');
    await simulatePreviewPhase(session, students);
    
    // Step 4: Announcement Phase - Reveal opening bids
    console.log('\n📍 STEP 4: ANNOUNCEMENT PHASE - Revealing Bids');
    await simulateAnnouncementPhase(session);
    
    // Step 5: Banking Phase - Students withdraw cash
    console.log('\n📍 STEP 5: BANKING PHASE - Cash Withdrawals');
    await simulateBankingPhase(session, students);
    
    // Step 6: Bidding Phase - Live auction
    console.log('\n📍 STEP 6: BIDDING PHASE - Live Auction');
    await simulateBiddingPhase(session, students);
    
    // Step 7: Redemption Phase - Negotiations
    console.log('\n📍 STEP 7: REDEMPTION PHASE - Occupant Negotiations');
    await simulateRedemptionPhase(session);
    
    // Step 8: Complete - Show results
    console.log('\n📍 STEP 8: AUCTION COMPLETE - Final Results');
    showFinalResults(session);
    
    console.log('\n✅ Demo completed successfully!');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// ============================================================================
// Step 1: Create Session
// ============================================================================

function createTestSession(): ClassroomSession {
  console.log('  Creating session with code: DEMO');
  
  const session = sessionManager.createSession(
    'DEMO',
    'moderator_123',
    {
      phaseDurations: {
        PREVIEW: 5,      // 5 seconds for demo
        ANNOUNCEMENT: 3,
        BANKING: 3,
        BIDDING: 10,
        REDEMPTION: 5
      }
    }
  );
  
  console.log(`  ✓ Session created with ${session.properties.length} properties`);
  console.log(`  ✓ Seed: ${session.seed}`);
  
  // Show sample properties
  console.log('\n  Sample Properties:');
  session.properties.slice(0, 3).forEach(p => {
    console.log(`    • ${p.address}, ${p.city}`);
    console.log(`      Market Value: ${p.marketValue.toLocaleString()}`);
    console.log(`      Opening Bid: ${p.openingBid.toLocaleString()} (hidden)`);
    console.log(`      Status: ${p.occupancyStatus}`);
  });
  
  return session;
}

// ============================================================================
// Step 2: Add Students
// ============================================================================

function addTestStudents(session: ClassroomSession): StudentState[] {
  const studentNames = [
    'Alice Johnson',
    'Bob Smith',
    'Carol Williams',
    'David Brown',
    'Emma Davis'
  ];
  
  const students: StudentState[] = [];
  
  studentNames.forEach((name, i) => {
    const student = sessionManager.joinSession(
      session.code,
      `student_${i + 1}`,
      name
    );
    
    if (student) {
      students.push(student);
      console.log(`  ✓ Added student: ${name} (Paddle #${student.paddleNumber})`);
    }
  });
  
  return students;
}

// ============================================================================
// Step 3: Preview Phase
// ============================================================================

async function simulatePreviewPhase(
  session: ClassroomSession,
  students: StudentState[]
): Promise<void> {
  // Transition to preview phase
  sessionManager.transitionPhase(session.code, 'PREVIEW');
  console.log('  ✓ Transitioned to PREVIEW phase');
  
  // Simulate students researching properties
  console.log('\n  Students researching properties:');
  
  students.forEach(student => {
    // Each student researches 3-5 random properties
    const numToResearch = 3 + Math.floor(Math.random() * 3);
    const propertiesToResearch = session.properties
      .sort(() => Math.random() - 0.5)
      .slice(0, numToResearch);
    
    console.log(`\n    ${student.name}:`);
    propertiesToResearch.forEach(property => {
      // Simulate research
      property.researchedBy.add(student.id);
      student.researchCredits -= 2; // Spent 2 credits
      
      // Simulate discovering information
      if (property.occupancyStatus !== 'VACANT') {
        console.log(`      • Researched ${property.address}: Found ${property.occupancyStatus}`);
        if (property.occupant) {
          console.log(`        Occupant: ${property.occupant.name} (${property.occupant.archetype})`);
        }
      } else {
        console.log(`      • Researched ${property.address}: VACANT`);
      }
      
      // Check for hidden damage
      if (property.hiddenDamage) {
        console.log(`        ⚠️ Discovered hidden ${property.hiddenDamageType}: ${property.hiddenDamage.toLocaleString()}`);
      }
    });
    
    console.log(`      Credits remaining: ${student.researchCredits}/30`);
  });
  
  // Wait for phase to "complete"
  await delay(2000);
}

// ============================================================================
// Step 4: Announcement Phase
// ============================================================================

async function simulateAnnouncementPhase(session: ClassroomSession): Promise<void> {
  sessionManager.transitionPhase(session.code, 'ANNOUNCEMENT');
  console.log('  ✓ Transitioned to ANNOUNCEMENT phase');
  
  console.log('\n  Revealing opening bids for first 5 properties:');
  
  session.properties.slice(0, 5).forEach(property => {
    console.log(`    • ${property.address}, ${property.city}`);
    console.log(`      Opening Bid: ${property.openingBid.toLocaleString()}`);
    console.log(`      Market Value: ${property.marketValue.toLocaleString()}`);
    
    const ratio = (property.openingBid / property.marketValue * 100).toFixed(1);
    console.log(`      Bid/Value Ratio: ${ratio}%`);
  });
  
  await delay(2000);
}

// ============================================================================
// Step 5: Banking Phase
// ============================================================================

async function simulateBankingPhase(
  session: ClassroomSession,
  students: StudentState[]
): Promise<void> {
  sessionManager.transitionPhase(session.code, 'BANKING');
  console.log('  ✓ Transitioned to BANKING phase');
  
  console.log('\n  Students withdrawing cash:');
  
  students.forEach(student => {
    // Simulate cash withdrawal (random amounts)
    const withdrawal = 100000 + Math.floor(Math.random() * 200000);
    student.cashWithdrawn = withdrawal;
    student.cashAvailable = withdrawal;
    
    console.log(`    • ${student.name}: ${withdrawal.toLocaleString()}`);
  });
  
  await delay(2000);
}

// ============================================================================
// Step 6: Bidding Phase
// ============================================================================

async function simulateBiddingPhase(
  session: ClassroomSession,
  students: StudentState[]
): Promise<void> {
  sessionManager.transitionPhase(session.code, 'BIDDING');
  console.log('  ✓ Transitioned to BIDDING phase');
  
  // Simulate bidding on first 3 properties
  const propertiesToAuction = session.properties.slice(0, 3);
  
  for (const property of propertiesToAuction) {
    console.log(`\n  🔨 Auctioning: ${property.address}, ${property.city}`);
    console.log(`     Opening Bid: ${property.openingBid.toLocaleString()}`);
    
    // Simulate competitive bidding
    let currentBid = property.openingBid;
    let lastBidder: StudentState | null = null;
    let secondLastBidder: StudentState | null = null;
    
    // Random students bid
    for (let round = 0; round < 5; round++) {
      const bidder = students[Math.floor(Math.random() * students.length)];
      
      // Check if student has enough cash
      if (bidder.cashAvailable < currentBid + 1000) continue;
      
      currentBid += 1000 * (1 + Math.floor(Math.random() * 5));
      
      sessionManager.recordBid(
        session.code,
        property.id,
        bidder.id,
        currentBid
      );
      
      console.log(`     ${bidder.name} bids: ${currentBid.toLocaleString()}`);
      
      secondLastBidder = lastBidder;
      lastBidder = bidder;
      
      await delay(500);
    }
    
    // Finalize sale
    if (lastBidder) {
      console.log(`     Going once... twice... SOLD!`);
      console.log(`     Winner: ${lastBidder.name} at ${currentBid.toLocaleString()}`);
      
      sessionManager.finalizeSale(
        session.code,
        property.id,
        lastBidder.id,
        currentBid,
        true
      );
      
      lastBidder.cashAvailable -= currentBid;
      
      // Check for hidden damage reveal
      if (property.hiddenDamage) {
        const reveal = sessionManager.revealSecret(
          session.code,
          property.id,
          'HIDDEN_DAMAGE'
        );
        if (reveal) {
          console.log(`     📢 DRAMATIC REVEAL: ${reveal.message}`);
        }
      }
    }
  }
  
  await delay(2000);
}

// ============================================================================
// Step 7: Redemption Phase
// ============================================================================

async function simulateRedemptionPhase(session: ClassroomSession): Promise<void> {
  sessionManager.transitionPhase(session.code, 'REDEMPTION');
  console.log('  ✓ Transitioned to REDEMPTION phase');
  
  console.log('\n  Negotiation outcomes:');
  
  session.winners.forEach(winner => {
    const property = winner.property;
    
    if (property.occupant) {
      console.log(`\n    ${winner.winnerName} negotiating for ${property.address}:`);
      console.log(`      Occupant: ${property.occupant.name}`);
      console.log(`      Preferred outcome: ${property.occupant.preferredOutcome}`);
      
      // Simulate negotiation outcome
      const success = Math.random() > 0.5;
      if (success) {
        console.log(`      ✓ Negotiation successful - ${property.occupant.preferredOutcome}`);
      } else {
        console.log(`      ✗ Negotiation failed - will need to evict`);
      }
    }
  });
  
  await delay(2000);
}

// ============================================================================
// Step 8: Show Final Results
// ============================================================================

function showFinalResults(session: ClassroomSession): void {
  sessionManager.transitionPhase(session.code, 'COMPLETE');
  console.log('  ✓ Auction complete!');
  
  console.log('\n📊 FINAL RESULTS:');
  console.log('================\n');
  
  // Property distribution
  console.log('Properties Won:');
  session.students.forEach(student => {
    console.log(`  ${student.name}: ${student.propertiesWon.length} properties`);
    console.log(`    Total spent: ${student.totalSpent.toLocaleString()}`);
    console.log(`    Cash remaining: ${student.cashAvailable.toLocaleString()}`);
  });
  
  // Market events
  if (session.marketShocks.length > 0) {
    console.log('\nMarket Events:');
    session.marketShocks.forEach(event => {
      console.log(`  • ${event.title}: ${event.description}`);
    });
  }
  
  // Revealed secrets
  if (session.revealedSecrets.length > 0) {
    console.log('\nRevealed Secrets:');
    session.revealedSecrets.forEach(secret => {
      console.log(`  • Property ${secret.propertyId}: ${secret.message}`);
    });
  }
  
  // Summary statistics
  const totalBids = session.publicBids.length;
  const totalSales = session.winners.length;
  const totalValue = session.winners.reduce((sum, w) => sum + w.winningBid, 0);
  
  console.log('\n📈 Summary Statistics:');
  console.log(`  Total bids placed: ${totalBids}`);
  console.log(`  Properties sold: ${totalSales}`);
  console.log(`  Total transaction value: ${totalValue.toLocaleString()}`);
  
  // Calculate average bid/value ratio
  const avgRatio = session.winners.reduce((sum, w) => {
    return sum + (w.winningBid / w.property.marketValue);
  }, 0) / session.winners.length;
  
  console.log(`  Average bid/value ratio: ${(avgRatio * 100).toFixed(1)}%`);
}

// ============================================================================
// Helper Functions
// ============================================================================

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// Test Individual Components
// ============================================================================

export function testPropertyGenerator(): void {
  console.log('\n🏠 Testing Property Generator');
  console.log('==============================\n');
  
  const properties = generateSeededProperties(12345, 10);
  
  // Check distribution
  const cityCount: Record<string, number> = {};
  properties.forEach(p => {
    cityCount[p.city] = (cityCount[p.city] || 0) + 1;
  });
  
  console.log('City Distribution:');
  Object.entries(cityCount).forEach(([city, count]) => {
    console.log(`  ${city}: ${count} properties`);
  });
  
  // Check occupancy
  const occupied = properties.filter(p => p.occupancyStatus !== 'VACANT').length;
  console.log(`\nOccupancy: ${occupied}/${properties.length} occupied`);
  
  // Check hidden damage
  const damaged = properties.filter(p => p.hiddenDamage).length;
  console.log(`Hidden Damage: ${damaged}/${properties.length} properties`);
  
  // Show Detroit variance
  const detroitProps = properties.filter(p => p.city === 'Detroit');
  if (detroitProps.length > 0) {
    console.log('\nDetroit Properties (showing variance):');
    detroitProps.forEach(p => {
      console.log(`  ${p.address}: ${p.marketValue.toLocaleString()}`);
    });
  }
}

export function testSessionManager(): void {
  console.log('\n🎮 Testing Session Manager');
  console.log('==========================\n');
  
  // Create session
  const session = sessionManager.createSession('TEST', 'mod_test');
  console.log(`Created session: ${session.code}`);
  
  // Add students
  const student1 = sessionManager.joinSession('TEST', 's1', 'Test Student 1');
  const student2 = sessionManager.joinSession('TEST', 's2', 'Test Student 2');
  
  console.log(`Added students: ${student1?.name}, ${student2?.name}`);
  
  // Test phase transitions
  const phases: Array<any> = ['PREVIEW', 'ANNOUNCEMENT', 'BANKING', 'BIDDING', 'REDEMPTION', 'COMPLETE'];
  
  phases.forEach(phase => {
    const success = sessionManager.transitionPhase('TEST', phase);
    console.log(`Transition to ${phase}: ${success ? '✓' : '✗'}`);
  });
  
  // Test bid recording
  if (student1) {
    const bid = sessionManager.recordBid('TEST', 'prop_1', student1.id, 50000);
    console.log(`\nRecorded bid: ${bid ? '✓' : '✗'}`);
  }
}

// ============================================================================
// Run Tests
// ============================================================================

// Uncomment to run specific tests:
// testPropertyGenerator();
// testSessionManager();

// Run the full demo:
// runAuctionDemo();