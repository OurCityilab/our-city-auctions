// server/api/test-systems.ts
// API endpoint to test game systems

import { generateSeededProperties } from '../../features/auction/core/propertyGenerator';

export default defineEventHandler(async (event) => {
  const testResults = {
    timestamp: new Date().toISOString(),
    tests: {
      propertyGeneration: false,
      comparableSales: false,
      occupantSystem: false,
      researchSystem: false,
      contactSystem: false
    },
    details: {
      properties: [] as any[],
      comparables: {
        counts: [] as number[],
        ageRanges: [] as any[],
        passed: false,
        message: ''
      },
      occupants: {
        count: 0,
        percentage: 0,
        responseRates: [] as number[],
        passed: false,
        message: ''
      },
      errors: [] as string[]
    },
    summary: {
      totalTests: 5,
      passed: 0,
      failed: 0,
      status: 'PENDING'
    }
  };

  try {
    // Test 1: Property Generation
    console.log('Testing property generation...');
    const properties = generateSeededProperties(12345, 10);
    
    if (properties && properties.length === 10) {
      testResults.tests.propertyGeneration = true;
      testResults.details.properties = properties.slice(0, 3).map(p => ({
        id: p.id,
        address: p.address,
        city: p.city,
        marketValue: p.marketValue,
        openingBid: p.openingBid,
        comparablesCount: p.comparables?.length || 0,
        hasOccupant: !!p.occupant
      }));
    }

    // Test 2: Comparable Sales
    console.log('Testing comparable sales...');
    const compCounts = properties.map(p => p.comparables?.length || 0);
    const allHaveComps = compCounts.every(count => count >= 3 && count <= 6);
    
    if (allHaveComps) {
      testResults.tests.comparableSales = true;
      testResults.details.comparables.passed = true;
      testResults.details.comparables.message = `All properties have 3-6 comparables`;
    } else {
      testResults.details.comparables.message = `Some properties have incorrect comp counts: ${compCounts.join(', ')}`;
    }
    
    testResults.details.comparables.counts = compCounts;
    
    // Check age ranges for first property's comps
    if (properties[0].comparables) {
      const ages = properties[0].comparables.map(c => c.daysAgo);
      const validAges = ages.every(age => age >= 7 && age <= 365);
      
      if (validAges) {
        testResults.details.comparables.ageRanges = ages;
        testResults.details.comparables.message += ` | Age ranges valid (7-365 days)`;
      } else {
        testResults.details.comparables.message += ` | Invalid age ranges: ${ages.join(', ')}`;
      }
    }

    // Test 3: Occupant System
    console.log('Testing occupant system...');
    const occupiedProperties = properties.filter(p => p.occupant);
    const occupancyRate = (occupiedProperties.length / properties.length) * 100;
    
    testResults.details.occupants.count = occupiedProperties.length;
    testResults.details.occupants.percentage = Math.round(occupancyRate);
    
    if (occupiedProperties.length > 0) {
      // Check occupant fields
      const firstOccupant = occupiedProperties[0].occupant;
      const hasRequiredFields = firstOccupant.name && 
                                firstOccupant.archetype && 
                                firstOccupant.responseRate !== undefined &&
                                firstOccupant.preferredOutcome;
      
      // Check response rates
      const responseRates = occupiedProperties.map(p => p.occupant.responseRate);
      const validRates = responseRates.every(rate => rate >= 0.3 && rate <= 0.7);
      
      testResults.details.occupants.responseRates = responseRates.map(r => Math.round(r * 100));
      
      if (hasRequiredFields && validRates) {
        testResults.tests.occupantSystem = true;
        testResults.details.occupants.passed = true;
        testResults.details.occupants.message = `${occupiedProperties.length}/${properties.length} occupied (${Math.round(occupancyRate)}%) | Response rates: 30-70%`;
      } else {
        testResults.details.occupants.message = `Missing fields or invalid response rates`;
      }
    }

    // Test 4: Research System
    console.log('Testing research system...');
    // Check if properties have research-related fields
    const hasResearchFields = properties[0].hasOwnProperty('researchedBy') &&
                              properties[0].hasOwnProperty('outstandingDebt') &&
                              properties[0].hasOwnProperty('comparables');
    
    if (hasResearchFields) {
      testResults.tests.researchSystem = true;
    }

    // Test 5: Contact System
    console.log('Testing contact system...');
    // Verify occupants have contact-related fields
    if (occupiedProperties.length > 0) {
      const occupant = occupiedProperties[0].occupant;
      const hasContactFields = occupant.hasOwnProperty('responseRate') &&
                               occupant.hasOwnProperty('monthlyIncome') &&
                               occupant.hasOwnProperty('creditScore');
      
      if (hasContactFields) {
        testResults.tests.contactSystem = true;
      }
    }

  } catch (error: any) {
    testResults.details.errors.push(error.message || 'Unknown error');
    console.error('Test error:', error);
  }

  // Calculate summary
  testResults.summary.passed = Object.values(testResults.tests).filter(t => t).length;
  testResults.summary.failed = testResults.summary.totalTests - testResults.summary.passed;
  testResults.summary.status = testResults.summary.failed === 0 ? 'SUCCESS' : 
                               testResults.summary.passed === 0 ? 'FAILURE' : 'PARTIAL';

  return testResults;
});