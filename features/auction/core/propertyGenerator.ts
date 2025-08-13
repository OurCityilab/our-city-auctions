// features/auction/core/propertyGenerator.ts

import { createSeededRandom } from '~/utils/random';
import type { 
  AuctionProperty, 
  CityName, 
  CityConfig, 
  OccupantProfile,
  OccupancyStatus,
  RenovationLevel,
  PropertyType,
  OccupantArchetype,
  PreferredOutcome
} from '../types/auction.types';

// ============================================================================
// City Configuration & Distribution
// ============================================================================

const CITY_CONFIGS: CityConfig[] = [
  {
    name: 'Detroit',
    weight: 0.35,
    minValue: 5000,
    maxValue: 350000,
    variance: 0.8,
    hasBlockVariance: true, // Special Detroit rule
    typicalOccupancy: 0.65
  },
  {
    name: 'Taylor',
    weight: 0.12,
    minValue: 80000,
    maxValue: 200000,
    variance: 0.2,
    typicalOccupancy: 0.7
  },
  {
    name: 'Redford',
    weight: 0.10,
    minValue: 70000,
    maxValue: 180000,
    variance: 0.25,
    typicalOccupancy: 0.68
  },
  {
    name: 'Warren',
    weight: 0.10,
    minValue: 90000,
    maxValue: 250000,
    variance: 0.2,
    typicalOccupancy: 0.72
  },
  {
    name: 'Livonia',
    weight: 0.10,
    minValue: 150000,
    maxValue: 350000,
    variance: 0.15,
    typicalOccupancy: 0.75
  },
  {
    name: 'Royal Oak',
    weight: 0.08,
    minValue: 200000,
    maxValue: 500000,
    variance: 0.15,
    typicalOccupancy: 0.78
  },
  {
    name: 'Novi',
    weight: 0.08,
    minValue: 250000,
    maxValue: 600000,
    variance: 0.1,
    typicalOccupancy: 0.8
  },
  {
    name: 'Northville',
    weight: 0.07,
    minValue: 300000,
    maxValue: 600000,
    variance: 0.1,
    typicalOccupancy: 0.82
  }
];

// Detroit neighborhoods for realistic addresses
const DETROIT_NEIGHBORHOODS = [
  'Midtown', 'Corktown', 'Southwest', 'East English Village', 
  'Indian Village', 'Boston Edison', 'Grandmont', 'Bagley',
  'Brightmoor', 'Chandler Park', 'Jefferson Chalmers', 'Woodbridge'
];

const SUBURB_NEIGHBORHOODS = [
  'Downtown', 'North Side', 'South End', 'West District',
  'Heritage Park', 'Old Town', 'Riverside', 'Maple Heights'
];

// Street name components for address generation
const STREET_NAMES = [
  'Main', 'Oak', 'Maple', 'Washington', 'Jefferson', 'Michigan',
  'Grand River', 'Woodward', 'Gratiot', 'McNichols', 'Seven Mile',
  'Eight Mile', 'Telegraph', 'Livernois', 'Wyoming', 'Greenfield'
];

const STREET_TYPES = ['St', 'Ave', 'Blvd', 'Dr', 'Rd', 'Ln', 'Way', 'Ct'];

// ============================================================================
// Occupant Archetypes
// ============================================================================

const OCCUPANT_ARCHETYPES = [
  {
    archetype: 'recentWidow' as OccupantArchetype,
    emotionalAttachment: 10,
    financialDesperation: 7,
    alternatives: 3,
    story: 'Lost spouse 6 months ago, house full of memories',
    typicalIncome: [25000, 45000],
    typicalCredit: [580, 650],
    preferredOutcomes: ['STAY_AS_OWNER', 'RENT_BACK'] as PreferredOutcome[]
  },
  {
    archetype: 'jobLossEngineer' as OccupantArchetype,
    emotionalAttachment: 5,
    financialDesperation: 8,
    alternatives: 6,
    story: 'Auto industry layoff, high income potential if rehired',
    typicalIncome: [0, 15000], // Currently unemployed
    typicalCredit: [620, 720],
    preferredOutcomes: ['RENT_TO_OWN', 'RELOCATE'] as PreferredOutcome[]
  },
  {
    archetype: 'elderlyCouple' as OccupantArchetype,
    emotionalAttachment: 9,
    financialDesperation: 5,
    alternatives: 2,
    story: 'Fixed income, lived here 40 years, need stability',
    typicalIncome: [35000, 55000],
    typicalCredit: [650, 750],
    preferredOutcomes: ['RENT_BACK', 'STAY_AS_OWNER'] as PreferredOutcome[]
  },
  {
    archetype: 'youngFamily' as OccupantArchetype,
    emotionalAttachment: 7,
    financialDesperation: 9,
    alternatives: 4,
    story: 'First-time buyers underwater, two young kids',
    typicalIncome: [45000, 75000],
    typicalCredit: [550, 650],
    preferredOutcomes: ['RELOCATE', 'CASH_FOR_KEYS'] as PreferredOutcome[]
  },
  {
    archetype: 'investorBurnout' as OccupantArchetype,
    emotionalAttachment: 2,
    financialDesperation: 6,
    alternatives: 8,
    story: 'Another investor who overextended, ready to move on',
    typicalIncome: [40000, 90000],
    typicalCredit: [600, 700],
    preferredOutcomes: ['CASH_FOR_KEYS', 'RELOCATE'] as PreferredOutcome[]
  },
  {
    archetype: 'absenteeLandlord' as OccupantArchetype,
    emotionalAttachment: 1,
    financialDesperation: 4,
    alternatives: 9,
    story: 'Out-of-state owner, tenant stopped paying',
    typicalIncome: [60000, 120000],
    typicalCredit: [680, 780],
    preferredOutcomes: ['CASH_FOR_KEYS'] as PreferredOutcome[]
  }
];

// ============================================================================
// Main Property Generator
// ============================================================================

export function generateSeededProperties(seed: number, count: number = 50): AuctionProperty[] {
  const rng = createSeededRandom(seed.toString());
  const properties: AuctionProperty[] = [];
  
  for (let i = 0; i < count; i++) {
    const cityConfig = selectCityByWeight(rng);
    const property = generateProperty(i, cityConfig, rng);
    
    // Apply special Detroit variance
    if (cityConfig.hasBlockVariance) {
      applyDetroitVariance(property, rng);
    }
    
    // Generate opening bid based on market value and bank strategy
    property.openingBid = calculateOpeningBid(property, cityConfig, rng);
    
    // Add hidden issues (15% chance)
    if (rng() < 0.15) {
      addHiddenDamage(property, rng);
    }
    
    // Add occupant based on city's typical occupancy rate
    if (rng() < cityConfig.typicalOccupancy) {
      property.occupant = generateOccupant(property, rng);
      property.occupancyStatus = property.occupant.archetype === 'absenteeLandlord' 
        ? 'TENANT_OCCUPIED' 
        : 'OWNER_OCCUPIED';
    } else {
      property.occupancyStatus = 'VACANT';
    }
    
    properties.push(property);
  }
  
  return properties;
}

// ============================================================================
// Comparable Sales Generation
// ============================================================================

function generateComparables(property: any, cityConfig: CityConfig, rng: any): any[] {
  // Generate 3-6 comps per appraisal standards
  const numComps = 3 + Math.floor(rng() * 4); // 3-6 comps
  const comps = [];
  const basePrice = property.marketValue;
  
  // Age distribution weights (more recent = more relevant)
  const ageWeights = [
    { min: 7, max: 30, weight: 0.4 },    // 1 week - 1 month (40% chance)
    { min: 31, max: 90, weight: 0.3 },   // 1-3 months (30% chance)
    { min: 91, max: 180, weight: 0.2 },  // 3-6 months (20% chance)
    { min: 181, max: 365, weight: 0.1 }  // 6-12 months (10% chance)
  ];
  
  for (let i = 0; i < numComps; i++) {
    // Select age range based on weights
    const random = rng();
    let cumWeight = 0;
    let ageRange = ageWeights[0];
    for (const range of ageWeights) {
      cumWeight += range.weight;
      if (random < cumWeight) {
        ageRange = range;
        break;
      }
    }
    
    const daysAgo = ageRange.min + Math.floor(rng() * (ageRange.max - ageRange.min));
    
    // Market appreciation (roughly 5% per year)
    const dailyAppreciation = 0.05 / 365;
    const appreciationFactor = 1 - (daysAgo * dailyAppreciation);
    
    // Similar characteristics (within 20% variation) - apples to apples
    const sqftVariation = 0.8 + rng() * 0.4; // 80% to 120%
    const compSqft = Math.floor(property.squareFeet * sqftVariation);
    
    // Price variation based on market conditions and comp quality
    const priceVariation = 0.85 + rng() * 0.3; // 85% to 115%
    const soldPrice = Math.floor(basePrice * appreciationFactor * priceVariation);
    
    // Generate comp address (nearby streets)
    const streetNumber = Math.floor(1000 + rng() * 8999);
    const streetName = STREET_NAMES[Math.floor(rng() * STREET_NAMES.length)];
    const streetType = STREET_TYPES[Math.floor(rng() * STREET_TYPES.length)];
    
    // Determine condition and adjustment
    const conditionOptions = [
      { condition: 'SIMILAR', weight: 0.5, adjustment: 0 },
      { condition: 'SUPERIOR', weight: 0.25, adjustment: -0.05 },
      { condition: 'INFERIOR', weight: 0.25, adjustment: 0.05 }
    ];
    
    const condRandom = rng();
    let cumCondWeight = 0;
    let selectedCondition = conditionOptions[0];
    for (const opt of conditionOptions) {
      cumCondWeight += opt.weight;
      if (condRandom < cumCondWeight) {
        selectedCondition = opt;
        break;
      }
    }
    
    const comp = {
      id: `comp-${property.id}-${i}`,
      address: `${streetNumber} ${streetName} ${streetType}`,
      distance: (0.1 + rng() * 1.9).toFixed(1), // 0.1 to 2 miles
      daysAgo: daysAgo,
      dateString: getDateString(daysAgo),
      
      // Similar characteristics
      bedrooms: property.bedrooms + (rng() > 0.7 ? Math.floor(rng() * 2) - 1 : 0),
      bathrooms: property.bathrooms + (rng() > 0.8 ? 0.5 : 0),
      squareFeet: compSqft,
      yearBuilt: property.yearBuilt + Math.floor(rng() * 20) - 10,
      
      // Pricing
      soldPrice: soldPrice,
      pricePerSqft: Math.floor(soldPrice / compSqft),
      
      // Condition and adjustments
      condition: selectedCondition.condition,
      suggestedAdjustment: selectedCondition.adjustment,
      adjustmentReason: selectedCondition.condition === 'SUPERIOR' 
        ? 'Comp has updated kitchen/bath' 
        : selectedCondition.condition === 'INFERIOR'
        ? 'Comp needs updates'
        : null
    };
    
    comps.push(comp);
  }
  
  // Sort by distance first, then by date (closest and newest are best)
  return comps.sort((a, b) => {
    const distDiff = parseFloat(a.distance) - parseFloat(b.distance);
    if (Math.abs(distDiff) > 0.5) {
      return distDiff;
    }
    return a.daysAgo - b.daysAgo;
  });
}

// Helper function to convert days to readable string
function getDateString(daysAgo: number): string {
  if (daysAgo <= 7) return '1 week ago';
  if (daysAgo <= 14) return '2 weeks ago';
  if (daysAgo <= 30) return '1 month ago';
  if (daysAgo <= 60) return '2 months ago';
  if (daysAgo <= 90) return '3 months ago';
  if (daysAgo <= 180) return '6 months ago';
  if (daysAgo <= 270) return '9 months ago';
  return '12 months ago';
}

// ============================================================================
// Property Generation Functions
// ============================================================================

function selectCityByWeight(rng: any): CityConfig {
  const roll = rng();
  let cumulative = 0;
  
  for (const config of CITY_CONFIGS) {
    cumulative += config.weight;
    if (roll <= cumulative) {
      return config;
    }
  }
  
  return CITY_CONFIGS[CITY_CONFIGS.length - 1];
}

function generateProperty(index: number, cityConfig: CityConfig, rng: any): AuctionProperty {
  const baseValue = cityConfig.minValue + rng() * (cityConfig.maxValue - cityConfig.minValue);
  const marketValue = Math.floor(baseValue * (1 + (rng() - 0.5) * cityConfig.variance));
  
  // Generate property details based on value
  const bedrooms = marketValue < 50000 ? 2 : marketValue < 150000 ? 3 : marketValue < 300000 ? 4 : 5;
  const bathrooms = Math.floor(bedrooms * 0.75);
  const squareFeet = Math.floor(bedrooms * 400 + rng() * 800);
  const yearBuilt = Math.floor(1920 + rng() * 80); // 1920-2000
  
  // Generate address
  const streetNumber = Math.floor(1000 + rng() * 8999);
  const streetName = STREET_NAMES[Math.floor(rng() * STREET_NAMES.length)];
  const streetType = STREET_TYPES[Math.floor(rng() * STREET_TYPES.length)];
  const address = `${streetNumber} ${streetName} ${streetType}`;
  
  // Select neighborhood
  const neighborhoods = cityConfig.name === 'Detroit' ? DETROIT_NEIGHBORHOODS : SUBURB_NEIGHBORHOODS;
  const neighborhood = neighborhoods[Math.floor(rng() * neighborhoods.length)];
  
  // Generate ZIP code (Detroit area: 48201-48235)
  const zipCode = cityConfig.name === 'Detroit' 
    ? `4820${Math.floor(1 + rng() * 35)}`
    : `4810${Math.floor(1 + rng() * 99)}`;
  
  // Calculate liens with more detail
  const ltvRatio = 0.6 + rng() * 0.4; // 60-100% of value
  const primaryLien = Math.floor(marketValue * ltvRatio * 0.8); // 80% of debt is first lien
  const hasSecondary = rng() < 0.3;
  const secondaryLien = hasSecondary ? Math.floor(marketValue * ltvRatio * 0.15) : undefined;
  const hasTax = rng() < 0.2;
  const taxLien = hasTax ? Math.floor(2000 + rng() * 15000) : undefined;
  
  // Generate lender name for first lien
  const lenderNames = ['Wells Fargo', 'Bank of America', 'Chase', 'Quicken Loans', 'Flagstar Bank', 'Huntington Bank'];
  const lenderName = lenderNames[Math.floor(rng() * lenderNames.length)];
  
  // Calculate total debt
  const outstandingDebt = primaryLien + (secondaryLien || 0) + (taxLien || 0);
  
  // Determine renovation level based on value and age
  const renovationLevel = determineRenovationLevel(marketValue, yearBuilt, rng);
  
  // Property type (mostly single family)
  const propertyType: PropertyType = rng() < 0.85 ? 'SINGLE_FAMILY' : 
                                     rng() < 0.95 ? 'MULTI_FAMILY' : 'CONDO';
  
  // Generate property object first for comparables
  const property = {
    id: `prop_${index + 1}`,
    address,
    city: cityConfig.name,
    neighborhood,
    zipCode,
    imageUrl: `/images/properties/default_${cityConfig.name.toLowerCase()}.jpg`,
    propertyType,
    bedrooms,
    bathrooms,
    squareFeet,
    yearBuilt,
    lotSize: squareFeet * (2 + rng() * 3), // 2-5x house size
    marketValue,
    openingBid: 0, // Set later
    outstandingDebt,
    occupancyStatus: 'VACANT', // Set later
    renovationLevel,
    redemptionStatus: rng() < 0.1 ? 'IN_NEGOTIATION' : 'NONE',
    // Enhanced lien information
    primaryLien,
    secondaryLien,
    taxLien,
    lenderName,
    hasSecondLien: hasSecondary,
    hasThirdLien: hasTax,
    firstLienAmount: primaryLien,
    secondLienAmount: secondaryLien || 0,
    thirdLienAmount: taxLien || 0,
    // Comparables and analysis fields
    comparables: [], // Will be set after property creation
    actualMarketValue: marketValue, // Hidden true value
    studentMarketValue: null,
    studentLTV: null,
    studentEquityEstimate: null,
    // Research tracking
    researchedBy: new Set(),
    discoveredInfo: new Map()
  };
  
  // Generate comparables based on this property
  property.comparables = generateComparables(property, cityConfig, rng);
  
  return property;
}

function determineRenovationLevel(value: number, yearBuilt: number, rng: any): RenovationLevel {
  const age = new Date().getFullYear() - yearBuilt;
  const ageScore = age / 100; // 0-1 scale
  const valueScore = value < 50000 ? 0.8 : value < 150000 ? 0.5 : 0.2;
  const combinedScore = (ageScore + valueScore) / 2 + (rng() - 0.5) * 0.3;
  
  if (combinedScore < 0.2) return 'MOVE_IN_READY';
  if (combinedScore < 0.4) return 'LIGHT_REHAB';
  if (combinedScore < 0.6) return 'MODERATE_REHAB';
  if (combinedScore < 0.8) return 'HEAVY_REHAB';
  return 'TEARDOWN';
}

// ============================================================================
// Detroit Special Variance
// ============================================================================

function applyDetroitVariance(property: AuctionProperty, rng: any): void {
  // Properties on same block can vary 10x in value
  const isGoodBlock = rng() > 0.5;
  const blockMultiplier = isGoodBlock ? (2 + rng() * 2) : (0.2 + rng() * 0.3);
  
  property.marketValue = Math.floor(property.marketValue * blockMultiplier);
  
  // Adjust primary lien accordingly
  property.primaryLien = Math.floor(property.primaryLien * blockMultiplier);
  
  // Detroit properties more likely to have issues
  if (!isGoodBlock && rng() < 0.3) {
    property.codeViolations = Math.floor(5000 + rng() * 20000);
  }
}

// ============================================================================
// Opening Bid Calculation
// ============================================================================

function calculateOpeningBid(property: AuctionProperty, cityConfig: CityConfig, rng: any): number {
  const bankStrategy = rng();
  
  if (property.city === 'Detroit') {
    // Banks uncertain about Detroit values
    if (bankStrategy < 0.3) {
      // Bank dumps it
      return Math.floor(property.marketValue * (0.1 + rng() * 0.15));
    } else if (bankStrategy < 0.7) {
      // Moderate attempt
      return Math.floor(property.marketValue * (0.3 + rng() * 0.25));
    } else {
      // Optimistic
      return Math.floor(property.marketValue * (0.5 + rng() * 0.25));
    }
  } else {
    // Suburbs - more predictable
    const baseRatio = 0.5 + (cityConfig.minValue / 600000) * 0.3; // Higher value cities = higher ratios
    return Math.floor(property.marketValue * (baseRatio + (rng() - 0.5) * 0.2));
  }
}

// ============================================================================
// Hidden Damage Generation
// ============================================================================

function addHiddenDamage(property: AuctionProperty, rng: any): void {
  const damageTypes = ['FOUNDATION', 'ROOF', 'PLUMBING', 'ELECTRICAL', 'MOLD', 'STRUCTURAL'] as const;
  const damageType = damageTypes[Math.floor(rng() * damageTypes.length)];
  
  // Damage amount based on property value
  const minDamage = property.marketValue * 0.1;
  const maxDamage = Math.min(property.marketValue * 0.5, 150000);
  
  property.hiddenDamage = Math.floor(minDamage + rng() * (maxDamage - minDamage));
  property.hiddenDamageType = damageType;
}

// ============================================================================
// Occupant Generation
// ============================================================================

function generateOccupant(property: AuctionProperty, rng: any): OccupantProfile {
  const archetype = OCCUPANT_ARCHETYPES[Math.floor(rng() * OCCUPANT_ARCHETYPES.length)];
  
  // Generate name
  const firstNames = ['James', 'Maria', 'Robert', 'Patricia', 'Michael', 'Jennifer', 
                      'David', 'Elizabeth', 'William', 'Barbara'];
  const lastNames = ['Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 
                     'Davis', 'Rodriguez', 'Martinez', 'Anderson'];
  
  const name = `${firstNames[Math.floor(rng() * firstNames.length)]} ${lastNames[Math.floor(rng() * lastNames.length)]}`;
  
  // Generate demographics based on archetype
  const age = archetype.archetype === 'elderlyCouple' ? 65 + Math.floor(rng() * 20) :
              archetype.archetype === 'youngFamily' ? 28 + Math.floor(rng() * 12) :
              35 + Math.floor(rng() * 30);
  
  const familySize = archetype.archetype === 'youngFamily' ? 3 + Math.floor(rng() * 3) :
                     archetype.archetype === 'elderlyCouple' ? 2 :
                     archetype.archetype === 'recentWidow' ? 1 :
                     1 + Math.floor(rng() * 4);
  
  // Generate financial details
  const monthlyIncome = Math.floor(
    archetype.typicalIncome[0] + rng() * (archetype.typicalIncome[1] - archetype.typicalIncome[0])
  ) / 12;
  
  const creditScore = Math.floor(
    archetype.typicalCredit[0] + rng() * (archetype.typicalCredit[1] - archetype.typicalCredit[0])
  );
  
  // Select preferred outcome
  const preferredOutcome = archetype.preferredOutcomes[
    Math.floor(rng() * archetype.preferredOutcomes.length)
  ];
  
  // Generate occupation based on archetype
  const occupations = {
    jobLossEngineer: ['Former Auto Engineer', 'Ex-Manufacturing Manager', 'Laid-off Designer'],
    elderlyCouple: ['Retired Teacher', 'Retired Factory Worker', 'Social Security'],
    youngFamily: ['Retail Manager', 'Nurse', 'Construction Worker'],
    recentWidow: ['Part-time Clerk', 'Administrative Assistant', 'Substitute Teacher'],
    investorBurnout: ['Property Manager', 'Real Estate Agent', 'Small Business Owner'],
    absenteeLandlord: ['Remote Investor', 'Out-of-State Owner', 'Corporate Employee']
  };
  
  const occupationList = occupations[archetype.archetype] || ['Employed'];
  const occupation = occupationList[Math.floor(rng() * occupationList.length)];
  
  return {
    id: `occ_${property.id}`,
    name,
    archetype: archetype.archetype,
    emotionalAttachment: archetype.emotionalAttachment + Math.floor((rng() - 0.5) * 2),
    financialDesperation: archetype.financialDesperation + Math.floor((rng() - 0.5) * 2),
    alternatives: archetype.alternatives + Math.floor((rng() - 0.5) * 2),
    initialTrust: 3 + Math.floor(rng() * 5),
    age,
    occupation,
    familySize,
    monthsDelinquent: 3 + Math.floor(rng() * 9),
    monthlyIncome,
    creditScore,
    savingsAvailable: Math.floor(rng() * 5000),
    story: archetype.story,
    responseRate: 0.3 + rng() * 0.4,
    preferredOutcome,
    minimumCashForKeys: preferredOutcome === 'CASH_FOR_KEYS' ? 
      Math.floor(3000 + rng() * 7000) : undefined,
    maximumRent: preferredOutcome === 'RENT_BACK' ? 
      Math.floor(monthlyIncome * 0.3) : undefined
  };
}

// ============================================================================
// Export Additional Utilities
// ============================================================================

export function getPropertyImage(property: AuctionProperty): string {
  // In production, this would return actual image URLs
  // For now, return placeholder based on city and condition
  const condition = property.renovationLevel === 'MOVE_IN_READY' ? 'good' :
                   property.renovationLevel === 'TEARDOWN' ? 'poor' : 'fair';
  
  return `/api/placeholder/400/300?text=${property.city}_${condition}`;
}

export function calculateTotalLiens(property: AuctionProperty): number {
  return property.primaryLien + 
         (property.secondaryLien || 0) + 
         (property.taxLien || 0);
}

export function estimateRenovationCost(property: AuctionProperty): number {
  const costPerSqFt = {
    'MOVE_IN_READY': 5,
    'LIGHT_REHAB': 15,
    'MODERATE_REHAB': 35,
    'HEAVY_REHAB': 60,
    'TEARDOWN': 100
  };
  
  return Math.floor(property.squareFeet * costPerSqFt[property.renovationLevel]);
}

export function estimateMonthlyRent(property: AuctionProperty): number {
  // Rough rent estimation based on city and bedrooms
  const baseRent = {
    'Detroit': 600,
    'Taylor': 900,
    'Redford': 850,
    'Warren': 950,
    'Livonia': 1200,
    'Royal Oak': 1400,
    'Novi': 1600,
    'Northville': 1800
  };
  
  const cityBase = baseRent[property.city];
  const bedroomMultiplier = 1 + (property.bedrooms - 2) * 0.25;
  
  return Math.floor(cityBase * bedroomMultiplier);
}

// ============================================================================
// Testing Function - Remove in Production
// ============================================================================

export function testGenerator(seed: number = 12345): void {
  console.log('🏠 Generating test properties with seed:', seed);
  const properties = generateSeededProperties(seed, 10);
  
  console.log('\n📊 Distribution:');
  const cityCount = properties.reduce((acc, p) => {
    acc[p.city] = (acc[p.city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  Object.entries(cityCount).forEach(([city, count]) => {
    console.log(`  ${city}: ${count} properties`);
  });
  
  console.log('\n🏘️ Sample Properties:');
  properties.slice(0, 3).forEach(p => {
    console.log(`  ${p.address}, ${p.city}`);
    console.log(`    Market Value: ${p.marketValue.toLocaleString()}`);
    console.log(`    Opening Bid: ${p.openingBid.toLocaleString()}`);
    console.log(`    Status: ${p.occupancyStatus}`);
    if (p.occupant) {
      console.log(`    Occupant: ${p.occupant.name} (${p.occupant.archetype})`);
    }
    if (p.hiddenDamage) {
      console.log(`    ⚠️ Hidden ${p.hiddenDamageType}: ${p.hiddenDamage.toLocaleString()}`);
    }
  });
}