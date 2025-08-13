// features/auction/classroom/sessionManager.ts

import type {
  ClassroomSession,
  GamePhase,
  StudentState,
  AuctionProperty,
  SessionSettings,
  BidRecord,
  WinnerRecord,
  MarketEvent,
  RevealedSecret,
  PhaseTransition
} from '../types/auction.types';
import { generateSeededProperties } from '../core/propertyGenerator';

// ============================================================================
// Session Configuration
// ============================================================================

const DEFAULT_SETTINGS: SessionSettings = {
  phaseDurations: {
    PREVIEW: 900,        // 15 minutes
    ANNOUNCEMENT: 300,   // 5 minutes
    BANKING: 600,        // 10 minutes
    BIDDING: 1800,       // 30 minutes
    REDEMPTION: 600      // 10 minutes
  },
  bidIncrement: 1000,
  enableAlliances: true,
  enableMarketShocks: true,
  enableDramaticReveals: true,
  difficultyLevel: 'PROFESSIONAL'
};

// Preset session configurations for different classroom scenarios
const PRESET_SESSIONS = {
  'WAYNE-F24': {
    name: 'Wayne County Fall 2024',
    seed: 12345,
    propertyCount: 50
  },
  'WAYNE-S25': {
    name: 'Wayne County Spring 2025',
    seed: 67890,
    propertyCount: 50
  },
  'DEMO': {
    name: 'Demo Session',
    seed: 11111,
    propertyCount: 20
  },
  'QUICK': {
    name: 'Quick Practice',
    seed: 99999,
    propertyCount: 10
  }
};

// ============================================================================
// Session Manager Class
// ============================================================================

export class SessionManager {
  private sessions: Map<string, ClassroomSession> = new Map();
  private phaseTimers: Map<string, NodeJS.Timeout> = new Map();
  
  constructor() {
    // Load sessions from localStorage on initialization
    this.loadSessionsFromStorage();
  }

  // ============================================================================
  // Session Creation & Management
  // ============================================================================

  /**
   * Create a new classroom session with a unique code
   */
  createSession(
    code: string,
    moderatorId: string,
    customSettings?: Partial<SessionSettings>
  ): ClassroomSession {
    // Check if this is a preset session
    const preset = PRESET_SESSIONS[code as keyof typeof PRESET_SESSIONS];
    
    const session: ClassroomSession = {
      code,
      name: preset?.name || `Session ${code}`,
      createdAt: new Date(),
      startTime: new Date(),
      seed: preset?.seed || Math.floor(Math.random() * 100000),
      propertyCount: preset?.propertyCount || 50,
      startingCredits: 30,
      maxWithdrawal: 500000,
      moderatorId,
      students: new Map(),
      currentPhase: 'LOBBY',
      phaseStartTime: new Date(),
      currentPropertyIndex: 0,
      properties: [],
      publicBids: [],
      winners: [],
      marketShocks: [],
      revealedSecrets: [],
      settings: { ...DEFAULT_SETTINGS, ...customSettings }
    };

    // Generate properties using seed
    session.properties = generateSeededProperties(session.seed, session.propertyCount);
    
    // Store session
    this.sessions.set(code, session);
    this.saveSessionToStorage(session);
    
    return session;
  }

  /**
   * Get an existing session by code
   */
  getSession(code: string): ClassroomSession | undefined {
    return this.sessions.get(code);
  }

  /**
   * Join a session as a student
   */
  joinSession(
    sessionCode: string,
    studentId: string,
    studentName: string
  ): StudentState | null {
    const session = this.sessions.get(sessionCode);
    if (!session || session.currentPhase !== 'LOBBY') {
      return null;
    }

    const studentState: StudentState = {
      id: studentId,
      name: studentName,
      paddleNumber: session.students.size + 1,
      researchCredits: session.startingCredits,
      cashWithdrawn: 0,
      cashAvailable: 0,
      researchHistory: [],
      draftBoard: [],
      confidenceRatings: new Map(),
      propertiesWon: [],
      totalSpent: 0,
      activeBids: new Map(),
      negotiationAttempts: [],
      negotiationOutcomes: [],
      sharedResearch: new Set(),
      metrics: {
        researchROI: 0,
        bidEfficiency: 0,
        valuationAccuracy: 0,
        timingScore: 0,
        informationArbitrage: 0,
        allianceValue: 0,
        negotiationSuccess: 0,
        confidenceCalibration: 0,
        conceptsMastered: [],
        strugglingAreas: [],
        improvementRate: 0,
        riskTolerance: 0,
        competitiveness: 0,
        collaborativeness: 0
      }
    };

    session.students.set(studentId, studentState);
    this.saveSessionToStorage(session);
    
    return studentState;
  }

  // ============================================================================
  // Phase Management
  // ============================================================================

  /**
   * Transition to the next phase
   */
  transitionPhase(sessionCode: string, nextPhase: GamePhase): boolean {
    const session = this.sessions.get(sessionCode);
    if (!session) return false;

    // Validate transition
    if (!this.isValidTransition(session.currentPhase, nextPhase)) {
      return false;
    }

    // Execute phase exit logic
    this.executePhaseExit(session);

    // Update phase
    const previousPhase = session.currentPhase;
    session.currentPhase = nextPhase;
    session.phaseStartTime = new Date();

    // Execute phase entry logic
    this.executePhaseEntry(session);

    // Start phase timer if applicable
    this.startPhaseTimer(session);

    // Log transition
    const transition: PhaseTransition = {
      from: previousPhase,
      to: nextPhase,
      timestamp: new Date(),
      triggeredBy: session.moderatorId
    };

    // Save state
    this.saveSessionToStorage(session);
    
    return true;
  }

  /**
   * Check if a phase transition is valid
   */
  private isValidTransition(from: GamePhase, to: GamePhase): boolean {
    const validTransitions: Record<GamePhase, GamePhase[]> = {
      'LOBBY': ['PREVIEW'],
      'PREVIEW': ['ANNOUNCEMENT'],
      'ANNOUNCEMENT': ['BANKING'],
      'BANKING': ['BIDDING'],
      'BIDDING': ['REDEMPTION'],
      'REDEMPTION': ['COMPLETE'],
      'COMPLETE': ['LOBBY']
    };

    return validTransitions[from]?.includes(to) || false;
  }

  /**
   * Execute logic when exiting a phase
   */
  private executePhaseExit(session: ClassroomSession): void {
    switch (session.currentPhase) {
      case 'LOBBY':
        // Lock student list
        console.log(`Session ${session.code}: Locking student list with ${session.students.size} students`);
        break;
      
      case 'PREVIEW':
        // Lock research
        session.students.forEach(student => {
          console.log(`Student ${student.name}: Used ${30 - student.researchCredits} research credits`);
        });
        break;
      
      case 'ANNOUNCEMENT':
        // Lock draft boards
        console.log(`Session ${session.code}: Draft boards locked`);
        break;
      
      case 'BANKING':
        // Lock withdrawals
        session.students.forEach(student => {
          console.log(`Student ${student.name}: Withdrew ${student.cashWithdrawn.toLocaleString()}`);
        });
        break;
      
      case 'BIDDING':
        // Finalize sales
        console.log(`Session ${session.code}: ${session.winners.length} properties sold`);
        break;
    }
  }

  /**
   * Execute logic when entering a phase
   */
  private executePhaseEntry(session: ClassroomSession): void {
    switch (session.currentPhase) {
      case 'PREVIEW':
        // Enable research, hide opening bids
        session.properties.forEach(property => {
          // Opening bids remain hidden until announcement
        });
        break;
      
      case 'ANNOUNCEMENT':
        // Reveal opening bids
        console.log(`Session ${session.code}: Revealing opening bids for ${session.properties.length} properties`);
        break;
      
      case 'BANKING':
        // Enable withdrawals
        console.log(`Session ${session.code}: Banking window open`);
        break;
      
      case 'BIDDING':
        // Start auction sequence
        session.currentPropertyIndex = 0;
        console.log(`Session ${session.code}: Starting auction`);
        break;
      
      case 'REDEMPTION':
        // Enable negotiations
        console.log(`Session ${session.code}: Redemption period begins`);
        break;
      
      case 'COMPLETE':
        // Calculate final metrics
        this.calculateFinalMetrics(session);
        break;
    }
  }

  /**
   * Start a timer for the current phase
   */
  private startPhaseTimer(session: ClassroomSession): void {
    const duration = session.settings.phaseDurations[session.currentPhase];
    if (!duration) return;

    // Clear existing timer if any
    const existingTimer = this.phaseTimers.get(session.code);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      console.log(`Session ${session.code}: Phase ${session.currentPhase} timer expired`);
      // In production, this might auto-advance or notify the moderator
    }, duration * 1000);

    this.phaseTimers.set(session.code, timer);
  }

  /**
   * Get remaining time in current phase
   */
  getPhaseTimeRemaining(sessionCode: string): number {
    const session = this.sessions.get(sessionCode);
    if (!session) return 0;

    const duration = session.settings.phaseDurations[session.currentPhase];
    if (!duration) return -1; // No timer for this phase

    const elapsed = Date.now() - session.phaseStartTime.getTime();
    const remaining = (duration * 1000) - elapsed;
    
    return Math.max(0, Math.floor(remaining / 1000));
  }

  // ============================================================================
  // Bidding Management
  // ============================================================================

  /**
   * Record a bid from the moderator
   */
  recordBid(
    sessionCode: string,
    propertyId: string,
    studentId: string,
    amount: number
  ): BidRecord | null {
    const session = this.sessions.get(sessionCode);
    if (!session || session.currentPhase !== 'BIDDING') {
      return null;
    }

    const student = session.students.get(studentId);
    if (!student) return null;

    const bid: BidRecord = {
      id: `bid_${Date.now()}`,
      propertyId,
      studentId,
      studentName: student.name,
      amount,
      timestamp: new Date(),
      isWinning: true, // Will be updated as more bids come in
      verified: false
    };

    // Mark previous bids as not winning
    session.publicBids
      .filter(b => b.propertyId === propertyId)
      .forEach(b => b.isWinning = false);

    session.publicBids.push(bid);
    student.activeBids.set(propertyId, amount);
    
    this.saveSessionToStorage(session);
    
    return bid;
  }

  /**
   * Finalize a property sale
   */
  finalizeSale(
    sessionCode: string,
    propertyId: string,
    winnerId: string,
    winningBid: number,
    cashVerified: boolean
  ): WinnerRecord | null {
    const session = this.sessions.get(sessionCode);
    if (!session) return null;

    const property = session.properties.find(p => p.id === propertyId);
    const winner = session.students.get(winnerId);
    
    if (!property || !winner) return null;

    // Find second highest bidder
    const propertyBids = session.publicBids
      .filter(b => b.propertyId === propertyId)
      .sort((a, b) => b.amount - a.amount);
    
    const secondBid = propertyBids[1];

    const winnerRecord: WinnerRecord = {
      propertyId,
      property,
      winnerId,
      winnerName: winner.name,
      winningBid,
      secondBidderId: secondBid?.studentId,
      secondBid: secondBid?.amount,
      cashVerified,
      timestamp: new Date()
    };

    session.winners.push(winnerRecord);
    winner.propertiesWon.push(propertyId);
    winner.totalSpent += winningBid;
    
    // Move to next property
    session.currentPropertyIndex++;
    
    this.saveSessionToStorage(session);
    
    return winnerRecord;
  }

  // ============================================================================
  // Market Events & Reveals
  // ============================================================================

  /**
   * Trigger a market shock event
   */
  triggerMarketShock(
    sessionCode: string,
    type: MarketEvent['type'],
    affectedCities: string[],
    valueImpact: number
  ): MarketEvent | null {
    const session = this.sessions.get(sessionCode);
    if (!session || !session.settings.enableMarketShocks) {
      return null;
    }

    const event: MarketEvent = {
      id: `event_${Date.now()}`,
      type,
      title: this.getMarketEventTitle(type),
      description: this.getMarketEventDescription(type, affectedCities, valueImpact),
      affectedCities: affectedCities as any,
      valueImpact,
      timestamp: new Date(),
      duration: 30 // Display for 30 seconds
    };

    session.marketShocks.push(event);
    
    // Apply impact to affected properties
    session.properties
      .filter(p => affectedCities.includes(p.city))
      .forEach(p => {
        p.marketValue = Math.floor(p.marketValue * (1 + valueImpact / 100));
      });
    
    this.saveSessionToStorage(session);
    
    return event;
  }

  /**
   * Reveal a property secret
   */
  revealSecret(
    sessionCode: string,
    propertyId: string,
    type: RevealedSecret['type']
  ): RevealedSecret | null {
    const session = this.sessions.get(sessionCode);
    if (!session || !session.settings.enableDramaticReveals) {
      return null;
    }

    const property = session.properties.find(p => p.id === propertyId);
    if (!property) return null;

    let message = '';
    let impactAmount = 0;

    switch (type) {
      case 'HIDDEN_DAMAGE':
        if (property.hiddenDamage) {
          message = `⚠️ HIDDEN ${property.hiddenDamageType}: ${property.hiddenDamage.toLocaleString()}!`;
          impactAmount = property.hiddenDamage;
        }
        break;
      
      case 'OCCUPANT_STORY':
        if (property.occupant) {
          message = `👥 OCCUPANT: ${property.occupant.story}`;
        }
        break;
      
      case 'REDEMPTION_STATUS':
        message = `📋 REDEMPTION: ${property.redemptionStatus}`;
        break;
    }

    const secret: RevealedSecret = {
      propertyId,
      type,
      message,
      impactAmount,
      revealedAt: new Date(),
      revealedBy: session.moderatorId
    };

    session.revealedSecrets.push(secret);
    this.saveSessionToStorage(session);
    
    return secret;
  }

  // ============================================================================
  // Metrics & Analytics
  // ============================================================================

  /**
   * Calculate final metrics for all students
   */
  private calculateFinalMetrics(session: ClassroomSession): void {
    session.students.forEach((student, studentId) => {
      // Research ROI
      const researchCost = (30 - student.researchCredits);
      const propertiesResearched = session.properties.filter(p => 
        p.researchedBy.has(studentId)
      ).length;
      student.metrics.researchROI = propertiesResearched > 0 ? 
        (student.propertiesWon.length / propertiesResearched) * 100 : 0;

      // Bid Efficiency
      student.metrics.bidEfficiency = student.totalSpent > 0 ?
        (student.propertiesWon.length / (student.totalSpent / 1000)) : 0;

      // Confidence Calibration
      const confidenceSum = Array.from(student.confidenceRatings.values())
        .reduce((sum, conf) => sum + conf, 0);
      const avgConfidence = student.confidenceRatings.size > 0 ?
        confidenceSum / student.confidenceRatings.size : 0;
      
      const actualSuccess = student.propertiesWon.length / student.activeBids.size;
      student.metrics.confidenceCalibration = 100 - Math.abs((avgConfidence / 5) - actualSuccess) * 100;
    });

    this.saveSessionToStorage(session);
  }

  // ============================================================================
  // Storage Management
  // ============================================================================

  /**
   * Save session to localStorage
   */
  private saveSessionToStorage(session: ClassroomSession): void {
    try {
      // Convert Maps to arrays for JSON serialization
      const serializable = {
        ...session,
        students: Array.from(session.students.entries()),
        properties: session.properties.map(p => ({
          ...p,
          researchedBy: Array.from(p.researchedBy),
          discoveredInfo: Array.from(p.discoveredInfo.entries())
        }))
      };
      
      localStorage.setItem(
        `auction_session_${session.code}`,
        JSON.stringify(serializable)
      );
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  /**
   * Load sessions from localStorage
   */
  private loadSessionsFromStorage(): void {
    try {
      const keys = Object.keys(localStorage).filter(k => 
        k.startsWith('auction_session_')
      );
      
      keys.forEach(key => {
        const data = localStorage.getItem(key);
        if (!data) return;
        
        const parsed = JSON.parse(data);
        
        // Reconstruct Maps from arrays
        const session: ClassroomSession = {
          ...parsed,
          students: new Map(parsed.students),
          properties: parsed.properties.map((p: any) => ({
            ...p,
            researchedBy: new Set(p.researchedBy),
            discoveredInfo: new Map(p.discoveredInfo)
          })),
          createdAt: new Date(parsed.createdAt),
          startTime: new Date(parsed.startTime),
          phaseStartTime: new Date(parsed.phaseStartTime)
        };
        
        this.sessions.set(session.code, session);
      });
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  }

  /**
   * Clear old sessions (older than 24 hours)
   */
  clearOldSessions(): void {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    this.sessions.forEach((session, code) => {
      if (session.createdAt.getTime() < oneDayAgo) {
        this.sessions.delete(code);
        localStorage.removeItem(`auction_session_${code}`);
      }
    });
  }

  // ============================================================================
  // Helper Functions
  // ============================================================================

  private getMarketEventTitle(type: MarketEvent['type']): string {
    const titles = {
      'FACTORY_CLOSING': '🏭 Factory Closure Announced',
      'NEW_DEVELOPMENT': '🏗️ New Development Project',
      'CRIME_SPIKE': '🚨 Crime Rate Increase',
      'SCHOOL_IMPROVEMENT': '🎓 School Rating Improvement'
    };
    return titles[type];
  }

  private getMarketEventDescription(
    type: MarketEvent['type'],
    cities: string[],
    impact: number
  ): string {
    const cityList = cities.join(', ');
    const changeText = impact > 0 ? `+${impact}%` : `${impact}%`;
    
    const descriptions = {
      'FACTORY_CLOSING': `Major employer closing in ${cityList}. Property values ${changeText}`,
      'NEW_DEVELOPMENT': `New commercial development announced in ${cityList}. Values ${changeText}`,
      'CRIME_SPIKE': `Crime rates increased in ${cityList}. Property values ${changeText}`,
      'SCHOOL_IMPROVEMENT': `School ratings improved in ${cityList}. Values ${changeText}`
    };
    
    return descriptions[type];
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const sessionManager = new SessionManager();