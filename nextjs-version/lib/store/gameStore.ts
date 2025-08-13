import { create } from 'zustand';
import seedrandom from 'seedrandom';

export type GamePhase = 'LOBBY' | 'PREVIEW' | 'ANNOUNCEMENT' | 'BANKING' | 'BIDDING' | 'REDEMPTION' | 'COMPLETE';

export interface Property {
  id: string;
  address: string;
  city: string;
  neighborhood: string;
  zipCode: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  yearBuilt: number;
  propertyType: 'SINGLE_FAMILY' | 'MULTI_FAMILY' | 'CONDO' | 'TOWNHOUSE';
  imageUrl: string;
  
  // Financial
  marketValue: number;
  openingBid: number;
  outstandingDebt: number;
  
  // Status
  occupancyStatus: 'VACANT' | 'OWNER_OCCUPIED' | 'TENANT_OCCUPIED';
  occupant?: {
    name: string;
    isOwner: boolean;
    income: number;
    creditScore: number;
    willingness: number; // 1-5 scale
    preferredOutcome: string;
  };
  
  // Hidden info (revealed through research)
  hiddenDamage?: number;
  hiddenDamageType?: string;
  renovationNeeded: 'LIGHT' | 'MODERATE' | 'HEAVY' | 'TEARDOWN';
  backTaxes?: number;
  codeViolations?: string[];
  
  // Auction state
  currentBid?: number;
  highestBidder?: string;
  researchedBy: Set<string>;
}

export interface Student {
  id: string;
  name: string;
  paddleNumber: number;
  cashAvailable: number;
  cashWithdrawn: number;
  researchCredits: number;
  propertiesWon: string[];
  totalSpent: number;
  priorityList: string[]; // Property IDs in order
  analyses: Map<string, PropertyAnalysis>;
}

export interface PropertyAnalysis {
  propertyId: string;
  estimatedARV: number;
  renovationCost: number;
  maxBid: number;
  strategy: 'FLIP' | 'RENTAL' | 'WHOLESALE';
  notes: string;
}

export interface Bid {
  id: string;
  propertyId: string;
  studentId: string;
  studentName: string;
  amount: number;
  timestamp: number;
  isWinning: boolean;
}

export interface GameSession {
  code: string;
  moderatorId: string;
  currentPhase: GamePhase;
  phaseStartTime: number;
  currentPropertyIndex: number;
  properties: Property[];
  students: Map<string, Student>;
  bids: Bid[];
  winners: Array<{
    propertyId: string;
    studentId: string;
    winningBid: number;
  }>;
  marketEvents: Array<{
    type: string;
    impact: number;
    affectedCities: string[];
  }>;
}

interface GameStore {
  // Session state
  session: GameSession | null;
  isModeratorView: boolean;
  currentStudentId: string | null;
  
  // Actions - Session Management
  createSession: (code: string, moderatorId: string) => void;
  joinSession: (code: string, studentName: string) => Student | null;
  
  // Actions - Phase Management
  transitionPhase: (phase: GamePhase) => void;
  
  // Actions - Student Actions
  withdrawCash: (studentId: string, amount: number) => void;
  researchProperty: (studentId: string, propertyId: string) => any;
  saveAnalysis: (studentId: string, propertyId: string, analysis: Partial<PropertyAnalysis>) => void;
  updatePriorityList: (studentId: string, propertyIds: string[]) => void;
  
  // Actions - Bidding
  placeBid: (propertyId: string, studentId: string, amount: number) => void;
  finalizeSale: (propertyId: string, winnerId: string, amount: number) => void;
  
  // Actions - Moderator
  revealOpeningBids: () => void;
  triggerMarketEvent: (type: string, impact: number, cities: string[]) => void;
  nextProperty: () => void;
  previousProperty: () => void;
  
  // Getters
  getCurrentStudent: () => Student | null;
  getCurrentProperty: () => Property | null;
  getPropertyBids: (propertyId: string) => Bid[];
}

// Property generator with Detroit-specific data
function generateProperties(seed: number = Date.now()): Property[] {
  const rng = seedrandom(seed.toString());
  
  const neighborhoods = {
    'Detroit': ['Midtown', 'Downtown', 'Corktown', 'Southwest', 'East Side', 'West Side'],
    'Warren': ['North Warren', 'South Warren', 'Warren Woods'],
    'Livonia': ['North Livonia', 'Central Livonia', 'South Livonia'],
    'Dearborn': ['East Dearborn', 'West Dearborn'],
    'Troy': ['North Troy', 'Big Beaver', 'Somerset'],
    'Southfield': ['North Southfield', 'Providence', 'Civic Center'],
    'Taylor': ['North Taylor', 'Heritage Park', 'Lakes of Taylor'],
    'Novi': ['North Novi', 'Twelve Oaks', 'Town Center']
  };
  
  const properties: Property[] = [];
  let idCounter = 1;
  
  // Generate diverse property mix
  Object.entries(neighborhoods).forEach(([city, hoods]) => {
    hoods.forEach(neighborhood => {
      // Generate 2-3 properties per neighborhood
      const numProps = 2 + Math.floor(rng() * 2);
      
      for (let i = 0; i < numProps; i++) {
        const baseValue = city === 'Detroit' 
          ? 15000 + rng() * 135000  // $15k-150k high variance
          : city === 'Warren' || city === 'Taylor'
          ? 80000 + rng() * 100000  // $80k-180k
          : city === 'Livonia' || city === 'Southfield'
          ? 150000 + rng() * 200000 // $150k-350k
          : 250000 + rng() * 350000; // $250k-600k for Novi/Troy
        
        const debt = baseValue * (0.6 + rng() * 0.6); // 60-120% of value
        const openingBid = debt * (city === 'Detroit' ? 0.3 + rng() * 0.4 : 0.5 + rng() * 0.45);
        
        const occupancyRoll = rng();
        const occupancyStatus = occupancyRoll < 0.3 ? 'VACANT' : 
                               occupancyRoll < 0.7 ? 'OWNER_OCCUPIED' : 'TENANT_OCCUPIED';
        
        const property: Property = {
          id: `prop_${idCounter++}`,
          address: `${1000 + Math.floor(rng() * 8999)} ${['Main', 'Oak', 'Elm', 'Maple', 'Cedar', 'Pine', 'Washington', 'Lincoln'][Math.floor(rng() * 8)]} ${['St', 'Ave', 'Dr', 'Rd', 'Blvd'][Math.floor(rng() * 5)]}`,
          city,
          neighborhood,
          zipCode: `48${100 + Math.floor(rng() * 200)}`,
          bedrooms: 2 + Math.floor(rng() * 3),
          bathrooms: 1 + Math.floor(rng() * 2.5) * 0.5,
          squareFeet: 900 + Math.floor(rng() * 2100),
          yearBuilt: 1920 + Math.floor(rng() * 100),
          propertyType: rng() < 0.7 ? 'SINGLE_FAMILY' : rng() < 0.9 ? 'MULTI_FAMILY' : 'CONDO',
          imageUrl: `https://source.unsplash.com/400x300/?house,${city}`,
          marketValue: Math.round(baseValue),
          openingBid: Math.round(openingBid),
          outstandingDebt: Math.round(debt),
          occupancyStatus,
          renovationNeeded: rng() < 0.3 ? 'LIGHT' : rng() < 0.7 ? 'MODERATE' : 'HEAVY',
          researchedBy: new Set(),
        };
        
        // Add occupant if occupied
        if (occupancyStatus !== 'VACANT') {
          property.occupant = {
            name: `${['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa'][Math.floor(rng() * 6)]} ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][Math.floor(rng() * 5)]}`,
            isOwner: occupancyStatus === 'OWNER_OCCUPIED',
            income: 20000 + Math.floor(rng() * 60000),
            creditScore: 450 + Math.floor(rng() * 300),
            willingness: 1 + Math.floor(rng() * 5),
            preferredOutcome: ['STAY', 'RENT_BACK', 'SELL', 'RELOCATE'][Math.floor(rng() * 4)]
          };
        }
        
        // Add hidden damage randomly
        if (rng() < 0.25) {
          property.hiddenDamage = 5000 + Math.floor(rng() * 25000);
          property.hiddenDamageType = ['Foundation', 'Roof', 'Plumbing', 'Electrical', 'Mold'][Math.floor(rng() * 5)];
        }
        
        properties.push(property);
      }
    });
  });
  
  return properties.slice(0, 50); // Limit to 50 properties
}

export const useGameStore = create<GameStore>((set, get) => ({
  session: null,
  isModeratorView: false,
  currentStudentId: null,
  
  createSession: (code, moderatorId) => {
    const properties = generateProperties();
    
    set({
      session: {
        code,
        moderatorId,
        currentPhase: 'LOBBY',
        phaseStartTime: Date.now(),
        currentPropertyIndex: 0,
        properties,
        students: new Map(),
        bids: [],
        winners: [],
        marketEvents: [],
      },
      isModeratorView: true,
    });
  },
  
  joinSession: (code, studentName) => {
    const { session } = get();
    if (!session || session.code !== code) return null;
    
    const studentId = `student_${Date.now()}`;
    const paddleNumber = session.students.size + 1;
    
    const student: Student = {
      id: studentId,
      name: studentName,
      paddleNumber,
      cashAvailable: 100000,
      cashWithdrawn: 0,
      researchCredits: 30,
      propertiesWon: [],
      totalSpent: 0,
      priorityList: [],
      analyses: new Map(),
    };
    
    set(state => ({
      session: state.session ? {
        ...state.session,
        students: new Map(state.session.students).set(studentId, student),
      } : null,
      currentStudentId: studentId,
      isModeratorView: false,
    }));
    
    return student;
  },
  
  transitionPhase: (phase) => {
    set(state => ({
      session: state.session ? {
        ...state.session,
        currentPhase: phase,
        phaseStartTime: Date.now(),
      } : null,
    }));
  },
  
  withdrawCash: (studentId, amount) => {
    set(state => {
      if (!state.session) return state;
      
      const student = state.session.students.get(studentId);
      if (!student) return state;
      
      student.cashWithdrawn = amount;
      student.cashAvailable = amount;
      
      return {
        session: {
          ...state.session,
          students: new Map(state.session.students).set(studentId, student),
        },
      };
    });
  },
  
  researchProperty: (studentId, propertyId) => {
    const { session } = get();
    if (!session) return null;
    
    const student = session.students.get(studentId);
    const property = session.properties.find(p => p.id === propertyId);
    
    if (!student || !property || student.researchCredits < 2) return null;
    
    // Deduct credits
    student.researchCredits -= 2;
    property.researchedBy.add(studentId);
    
    // Return revealed information
    const research = {
      occupancyStatus: property.occupancyStatus,
      occupant: property.occupant,
      renovationNeeded: property.renovationNeeded,
      backTaxes: property.backTaxes,
      hiddenDamage: property.hiddenDamage,
      hiddenDamageType: property.hiddenDamageType,
    };
    
    set(state => ({
      session: state.session ? {
        ...state.session,
        students: new Map(state.session.students).set(studentId, student),
      } : null,
    }));
    
    return research;
  },
  
  saveAnalysis: (studentId, propertyId, analysis) => {
    set(state => {
      if (!state.session) return state;
      
      const student = state.session.students.get(studentId);
      if (!student) return state;
      
      const existingAnalysis = student.analyses.get(propertyId) || { propertyId } as PropertyAnalysis;
      const updatedAnalysis = { ...existingAnalysis, ...analysis };
      student.analyses.set(propertyId, updatedAnalysis);
      
      return {
        session: {
          ...state.session,
          students: new Map(state.session.students).set(studentId, student),
        },
      };
    });
  },
  
  updatePriorityList: (studentId, propertyIds) => {
    set(state => {
      if (!state.session) return state;
      
      const student = state.session.students.get(studentId);
      if (!student) return state;
      
      student.priorityList = propertyIds;
      
      return {
        session: {
          ...state.session,
          students: new Map(state.session.students).set(studentId, student),
        },
      };
    });
  },
  
  placeBid: (propertyId, studentId, amount) => {
    set(state => {
      if (!state.session) return state;
      
      const student = state.session.students.get(studentId);
      if (!student || student.cashAvailable < amount) return state;
      
      const bid: Bid = {
        id: `bid_${Date.now()}`,
        propertyId,
        studentId,
        studentName: student.name,
        amount,
        timestamp: Date.now(),
        isWinning: true,
      };
      
      // Mark previous bids as not winning
      const updatedBids = state.session.bids.map(b => 
        b.propertyId === propertyId ? { ...b, isWinning: false } : b
      );
      
      return {
        session: {
          ...state.session,
          bids: [...updatedBids, bid],
        },
      };
    });
  },
  
  finalizeSale: (propertyId, winnerId, amount) => {
    set(state => {
      if (!state.session) return state;
      
      const student = state.session.students.get(winnerId);
      if (!student) return state;
      
      student.cashAvailable -= amount;
      student.totalSpent += amount;
      student.propertiesWon.push(propertyId);
      
      return {
        session: {
          ...state.session,
          students: new Map(state.session.students).set(winnerId, student),
          winners: [...state.session.winners, { propertyId, studentId: winnerId, winningBid: amount }],
        },
      };
    });
  },
  
  revealOpeningBids: () => {
    // Opening bids are already set, this just transitions to announcement phase
    set(state => ({
      session: state.session ? {
        ...state.session,
        currentPhase: 'ANNOUNCEMENT',
      } : null,
    }));
  },
  
  triggerMarketEvent: (type, impact, cities) => {
    set(state => {
      if (!state.session) return state;
      
      // Apply impact to affected properties
      const updatedProperties = state.session.properties.map(p => {
        if (cities.includes(p.city)) {
          return {
            ...p,
            marketValue: Math.round(p.marketValue * (1 + impact / 100)),
          };
        }
        return p;
      });
      
      return {
        session: {
          ...state.session,
          properties: updatedProperties,
          marketEvents: [...state.session.marketEvents, { type, impact, affectedCities: cities }],
        },
      };
    });
  },
  
  nextProperty: () => {
    set(state => ({
      session: state.session ? {
        ...state.session,
        currentPropertyIndex: Math.min(
          state.session.currentPropertyIndex + 1,
          state.session.properties.length - 1
        ),
      } : null,
    }));
  },
  
  previousProperty: () => {
    set(state => ({
      session: state.session ? {
        ...state.session,
        currentPropertyIndex: Math.max(state.session.currentPropertyIndex - 1, 0),
      } : null,
    }));
  },
  
  getCurrentStudent: () => {
    const { session, currentStudentId } = get();
    if (!session || !currentStudentId) return null;
    return session.students.get(currentStudentId) || null;
  },
  
  getCurrentProperty: () => {
    const { session } = get();
    if (!session) return null;
    return session.properties[session.currentPropertyIndex] || null;
  },
  
  getPropertyBids: (propertyId) => {
    const { session } = get();
    if (!session) return [];
    return session.bids
      .filter(b => b.propertyId === propertyId)
      .sort((a, b) => b.amount - a.amount);
  },
}))