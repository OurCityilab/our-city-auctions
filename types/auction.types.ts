// /types/auction.types.ts

// ============================================================================
// Core Property Types
// ============================================================================

export type CityName = 
  | 'Detroit' 
  | 'Taylor' 
  | 'Royal Oak' 
  | 'Redford' 
  | 'Warren' 
  | 'Livonia' 
  | 'Novi' 
  | 'Northville';

export type OccupancyStatus = 
  | 'VACANT' 
  | 'OWNER_OCCUPIED' 
  | 'TENANT_OCCUPIED';

export type RenovationLevel = 
  | 'MOVE_IN_READY' 
  | 'LIGHT_REHAB' 
  | 'MODERATE_REHAB' 
  | 'HEAVY_REHAB' 
  | 'TEARDOWN';

export type PropertyType = 
  | 'SINGLE_FAMILY' 
  | 'CONDO' 
  | 'MULTI_FAMILY' 
  | 'VACANT_LOT';

export interface CityConfig {
  name: CityName;
  weight: number;
  minValue: number;
  maxValue: number;
  variance: number;
  hasBlockVariance?: boolean;
  typicalOccupancy: number;
}

export interface AuctionProperty {
  // Core Identity
  id: string;
  address: string;
  city: CityName;
  neighborhood: string;
  zipCode: string;
  imageUrl: string;
  
  // Property Details
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  yearBuilt: number;
  lotSize: number; // in square feet
  
  // Valuation (deterministic from seed)
  marketValue: number;
  openingBid: number;
  outstandingDebt: number;
  
  // Hidden Information (revealed through research or post-auction)
  hiddenDamage?: number;
  hiddenDamageType?: 'FOUNDATION' | 'ROOF' | 'PLUMBING' | 'ELECTRICAL' | 'MOLD' | 'STRUCTURAL';
  codeViolations?: number;
  environmentalIssue?: boolean;
  
  // Status
  occupancyStatus: OccupancyStatus;
  renovationLevel: RenovationLevel;
  redemptionStatus: 'NONE' | 'IN_NEGOTIATION' | 'AGREEMENT_REACHED';
  redemptionDeadline?: Date;
  
  // Liens
  primaryLien: number;
  secondaryLien?: number;
  tertiaryLien?: number;
  taxLien?: number;
  lenderName?: string;
  hasSecondLien?: boolean;
  hasThirdLien?: boolean;
  firstLienAmount?: number;
  secondLienAmount?: number;
  thirdLienAmount?: number;
  
  // Occupant (if occupied)
  occupant?: OccupantProfile;
  
  // Comparables and market analysis
  comparables?: any[];
  actualMarketValue?: number;
  studentMarketValue?: number | null;
  studentLTV?: number | null;
  studentEquityEstimate?: number | null;
  
  // Research Tracking
  researchedBy: Set<string>; // Student IDs who researched
  discoveredInfo: Map<string, DiscoveredInfo>;
}

// ============================================================================
// Occupant Types
// ============================================================================

export type OccupantArchetype = 
  | 'recentWidow' 
  | 'jobLossEngineer' 
  | 'elderlyCouple' 
  | 'youngFamily' 
  | 'investorBurnout'
  | 'absenteeLandlord';

export type PreferredOutcome = 
  | 'STAY_AS_OWNER' 
  | 'RENT_BACK' 
  | 'RENT_TO_OWN' 
  | 'RELOCATE' 
  | 'CASH_FOR_KEYS';

export type AgreementType = PreferredOutcome;

export type NegotiationApproach = 
  | 'EMPATHETIC' 
  | 'BUSINESS' 
  | 'AGGRESSIVE' 
  | 'COLLABORATIVE';

export interface OccupantProfile {
  id: string;
  name: string;
  archetype: OccupantArchetype;
  
  // Negotiation Factors (0-10)
  emotionalAttachment: number;
  financialDesperation: number;
  alternatives: number;
  initialTrust: number;
  
  // Demographics
  age: number;
  occupation: string;
  familySize: number;
  monthsDelinquent: number;
  
  // Financial
  monthlyIncome: number;
  creditScore: number;
  savingsAvailable: number;
  
  // Story & Preferences
  story: string;
  responseRate: number; // 0.3-0.7 chance of responding to contact
  preferredOutcome: PreferredOutcome;
  minimumCashForKeys?: number;
  maximumRent?: number;
}

// ============================================================================
// Research & Discovery Types
// ============================================================================

export type ResearchType = 
  | 'quickPeek' 
  | 'publicRecords' 
  | 'deepDive' 
  | 'occupantContact';

export interface ResearchOption {
  id: ResearchType;
  name: string;
  cost: number; // in credits
  reveals: string[];
  description: string;
  successRate?: number; // For occupant contact
  requiresOccupancy?: boolean;
}

export interface DiscoveredInfo {
  studentId: string;
  timestamp: Date;
  researchType: ResearchType;
  dataRevealed: Record<string, any>;
  creditsSpent: number;
  sharedWithAlliance: boolean;
}

export interface ResearchAction {
  propertyId: string;
  studentId: string;
  researchType: ResearchType;
  timestamp: Date;
  success: boolean;
  creditsSpent: number;
  informationGained: string[];
}

// ============================================================================
// Session & Game State Types
// ============================================================================

export type GamePhase = 
  | 'LOBBY' 
  | 'PREVIEW' 
  | 'ANNOUNCEMENT' 
  | 'BANKING' 
  | 'BIDDING' 
  | 'REDEMPTION' 
  | 'COMPLETE';

export interface ClassroomSession {
  // Session Identity
  code: string; // "WAYNE-F24"
  name: string;
  createdAt: Date;
  startTime: Date;
  
  // Configuration
  seed: number; // Deterministic generation
  propertyCount: number;
  startingCredits: number;
  maxWithdrawal: number;
  
  // Participants
  moderatorId: string;
  students: Map<string, StudentState>;
  
  // Game State
  currentPhase: GamePhase;
  phaseStartTime: Date;
  currentPropertyIndex: number;
  properties: AuctionProperty[];
  
  // Auction Records
  publicBids: BidRecord[];
  winners: WinnerRecord[];
  
  // Events
  marketShocks: MarketEvent[];
  revealedSecrets: RevealedSecret[];
  
  // Settings
  settings: SessionSettings;
}

export interface SessionSettings {
  phaseDurations: {
    PREVIEW: number; // seconds
    ANNOUNCEMENT: number;
    BANKING: number;
    BIDDING: number;
    REDEMPTION: number;
  };
  bidIncrement: number;
  enableAlliances: boolean;
  enableMarketShocks: boolean;
  enableDramaticReveals: boolean;
  difficultyLevel: 'ROOKIE' | 'PROFESSIONAL' | 'EXPERT';
}

// ============================================================================
// Student & Player Types
// ============================================================================

export interface StudentState {
  // Identity
  id: string;
  name: string;
  email?: string;
  paddleNumber: number;
  seatNumber?: number;
  
  // Resources
  researchCredits: number;
  cashWithdrawn: number;
  cashAvailable: number;
  
  // Research & Analysis
  researchHistory: ResearchAction[];
  draftBoard: DraftPick[];
  confidenceRatings: Map<string, number>; // propertyId -> 1-5
  
  // Bidding
  propertiesWon: string[];
  totalSpent: number;
  activeBids: Map<string, number>; // propertyId -> current bid
  
  // Negotiation
  negotiationAttempts: NegotiationAttempt[];
  negotiationOutcomes: NegotiationOutcome[];
  
  // Alliance
  allianceId?: string;
  sharedResearch: Set<string>; // Property IDs
  
  // Performance Metrics
  metrics: StudentMetrics;
}

export interface DraftPick {
  rank: number;
  propertyId: string;
  property: AuctionProperty;
  maxBid: number;
  confidence: number; // 1-5
  strategy: 'FLIP' | 'RENTAL' | 'WHOLESALE';
  notes: string;
}

export interface Alliance {
  id: string;
  name: string;
  members: string[]; // Student IDs
  sharedCredits: number;
  sharedProperties: Set<string>;
  formed: Date;
}

// ============================================================================
// Bidding & Auction Types
// ============================================================================

export interface BidRecord {
  id: string;
  propertyId: string;
  studentId: string;
  studentName: string;
  amount: number;
  timestamp: Date;
  isWinning: boolean;
  verified: boolean;
}

export interface WinnerRecord {
  propertyId: string;
  property: AuctionProperty;
  winnerId: string;
  winnerName: string;
  winningBid: number;
  secondBidderId?: string;
  secondBid?: number;
  cashVerified: boolean;
  timestamp: Date;
}

// ============================================================================
// Negotiation Types
// ============================================================================

export interface NegotiationAttempt {
  propertyId: string;
  studentId: string;
  occupantId: string;
  approach: NegotiationApproach;
  timestamp: Date;
}

export interface NegotiationApproach {
  type: 'EMPATHETIC' | 'BUSINESS' | 'AGGRESSIVE' | 'COLLABORATIVE';
  offer: NegotiationOffer;
  trustBuilding: string[];
}

export interface NegotiationOffer {
  type: PreferredOutcome;
  cashAmount?: number;
  monthlyRent?: number;
  rentToOwnTerms?: {
    downPayment: number;
    monthlyPayment: number;
    purchasePrice: number;
    term: number; // months
  };
  relocationAssistance?: number;
  timeline: number; // days
}

export interface NegotiationOutcome {
  attemptId: string;
  success: boolean;
  agreement?: Agreement;
  trustChange: number;
  reason?: string;
  alternativeOptions?: string[];
  futureROI?: number;
}

export interface Agreement {
  type: PreferredOutcome;
  terms: Record<string, any>;
  executionDate: Date;
  occupantSatisfaction: number; // 1-10
}

// ============================================================================
// Market Events & Reveals
// ============================================================================

export interface MarketEvent {
  id: string;
  type: 'FACTORY_CLOSING' | 'NEW_DEVELOPMENT' | 'CRIME_SPIKE' | 'SCHOOL_IMPROVEMENT';
  title: string;
  description: string;
  affectedCities: CityName[];
  valueImpact: number; // percentage change
  timestamp: Date;
  duration: number; // seconds it displays
}

export interface RevealedSecret {
  propertyId: string;
  type: 'HIDDEN_DAMAGE' | 'OCCUPANT_STORY' | 'REDEMPTION_STATUS' | 'MARKET_SHIFT';
  message: string;
  impactAmount?: number;
  revealedAt: Date;
  revealedBy: string; // moderatorId
}

// ============================================================================
// Analytics & Metrics
// ============================================================================

export interface StudentMetrics {
  // Core Performance
  researchROI: number; // Value gained per credit spent
  bidEfficiency: number; // Properties won per $1000 bid
  valuationAccuracy: number; // Predicted vs actual values
  timingScore: number; // Early vs late bidding success
  
  // Advanced Metrics
  informationArbitrage: number; // Profit from info asymmetry
  allianceValue: number; // Benefit from partnerships
  negotiationSuccess: number; // Occupant deal success rate
  confidenceCalibration: number; // Confidence vs actual performance
  
  // Learning Outcomes
  conceptsMastered: string[];
  strugglingAreas: string[];
  improvementRate: number;
  
  // Behavioral
  riskTolerance: number;
  competitiveness: number;
  collaborativeness: number;
}

export interface ClassroomMetrics {
  // Participation
  participationRate: number;
  activeResearchers: number;
  activeBidders: number;
  
  // Competition
  averageBidsPerProperty: number;
  bidVariance: number;
  winnerConcentration: number; // How many students won most properties
  
  // Learning
  researchUtilization: number;
  draftBoardCompletion: number;
  strategicBidding: number; // % who stayed within max bids
  
  // Mistakes
  emotionalBidding: number;
  ignoredProperties: string[];
  cashManagementErrors: number;
}

// ============================================================================
// Printable Assets
// ============================================================================

export interface CashCard {
  denomination: number;
  color: string;
  studentName: string;
  sessionCode: string;
  serialNumber: string;
}

export interface BidPaddle {
  paddleNumber: number;
  studentName: string;
  studentId: string;
  sessionCode: string;
  qrCode: string;
  color: string;
}

// ============================================================================
// Helper Types
// ============================================================================

export interface CityConfig {
  name: CityName;
  weight: number; // Distribution probability
  minValue: number;
  maxValue: number;
  variance: number; // Price variance within city
  hasBlockVariance?: boolean; // Detroit special rule
  typicalOccupancy: number; // % occupied
}

export interface PhaseTransition {
  from: GamePhase;
  to: GamePhase;
  timestamp: Date;
  triggeredBy: string;
}

export interface ErrorLog {
  timestamp: Date;
  studentId?: string;
  error: string;
  context: Record<string, any>;
  resolved: boolean;
}

// ============================================================================
// Negotiation Types
// ============================================================================

export interface NegotiationOutcome {
  attemptId: string;
  success: boolean;
  agreement?: NegotiationAgreement;
  reason?: string; // If failed
  trustChange: number;
  futureROI?: number;
  metrics?: NegotiationMetrics;
  educationalSummary?: string;
}

export interface NegotiationAgreement {
  type: AgreementType;
  terms: Record<string, any>;
  executionDate: Date;
  occupantSatisfaction: number; // 0-10
  investorBenefit: number; // 0-10
}

export interface NegotiationMetrics {
  approachesUsed: Record<NegotiationApproach, number>;
  finalTrustLevel: number;
  finalStressLevel: number;
  roundsCompleted: number;
  empathyScore: number;
  aggressionScore: number;
}

export interface NegotiationAttempt {
  propertyId: string;
  studentId: string;
  startTime: Date;
  endTime?: Date;
  outcome?: NegotiationOutcome;
  inProgress: boolean;
}