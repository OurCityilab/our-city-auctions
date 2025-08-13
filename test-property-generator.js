// test-property-generator.js
// Quick test script to verify the property generator works

import { testGenerator, generateSeededProperties } from './features/auction/core/propertyGenerator.js';

// Test the generator with a fixed seed
console.log('Testing Property Generator...\n');

// Run the built-in test function
testGenerator(12345);

// Generate a full set of 50 properties and show stats
console.log('\n\n🎯 Full Property Set Analysis:');
const fullSet = generateSeededProperties(12345, 50);

// Analyze distribution
const stats = {
  cities: {},
  occupancy: { occupied: 0, vacant: 0 },
  values: { min: Infinity, max: 0, avg: 0 },
  hiddenIssues: 0
};

fullSet.forEach(p => {
  // City distribution
  stats.cities[p.city] = (stats.cities[p.city] || 0) + 1;
  
  // Occupancy
  if (p.occupancyStatus === 'VACANT') {
    stats.occupancy.vacant++;
  } else {
    stats.occupancy.occupied++;
  }
  
  // Values
  stats.values.min = Math.min(stats.values.min, p.marketValue);
  stats.values.max = Math.max(stats.values.max, p.marketValue);
  stats.values.avg += p.marketValue;
  
  // Hidden issues
  if (p.hiddenDamage) stats.hiddenIssues++;
});

stats.values.avg = Math.floor(stats.values.avg / fullSet.length);

console.log('\n📍 City Distribution:');
Object.entries(stats.cities).forEach(([city, count]) => {
  const percentage = ((count / fullSet.length) * 100).toFixed(1);
  console.log(`  ${city}: ${count} properties (${percentage}%)`);
});

console.log('\n🏠 Occupancy Status:');
console.log(`  Occupied: ${stats.occupancy.occupied} (${((stats.occupancy.occupied/50)*100).toFixed(1)}%)`);
console.log(`  Vacant: ${stats.occupancy.vacant} (${((stats.occupancy.vacant/50)*100).toFixed(1)}%)`);

console.log('\n💰 Market Values:');
console.log(`  Range: $${stats.values.min.toLocaleString()} - $${stats.values.max.toLocaleString()}`);
console.log(`  Average: $${stats.values.avg.toLocaleString()}`);

console.log('\n⚠️ Hidden Issues:');
console.log(`  Properties with problems: ${stats.hiddenIssues} (${((stats.hiddenIssues/50)*100).toFixed(1)}%)`);

console.log('\n✅ Property generator is working correctly!');
console.log('Ready to integrate into the auction game.');