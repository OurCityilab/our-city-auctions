// features/auction/core/negotiationEngine.ts

import type { 
  OccupantProfile, 
  NegotiationApproach,
  NegotiationOutcome,
  AgreementType
} from '../types/auction.types';

export interface NegotiationState {
  rounds: NegotiationRound[];
  currentRound: number;
  trustLevel: number;
  stressLevel: number;
  outcomeReached: boolean;
  finalOutcome?: NegotiationOutcome;
  approachesUsed: Record<NegotiationApproach, number>;
}

export interface NegotiationRound {
  roundNumber: number;
  occupantStatement: string;
  playerOptions: DialogueOption[];
  playerChoice?: DialogueOption;
  occupantResponse?: string;
  trustChange: number;
  stressChange: number;
  educationalNote?: string;
}

export interface DialogueOption {
  id: string;
  approach: NegotiationApproach;
  text: string;
  requirements?: {
    minTrust?: number;
    maxStress?: number;
  };
  disabled?: boolean;
  disabledReason?: string;
}

export interface NegotiationResult {
  response: string;
  nextRound?: NegotiationRound;
  outcome?: NegotiationOutcome;
  educationalNote?: string;
  trustChange: number;
  stressChange: number;
}

export class NegotiationEngine {
  private occupant: OccupantProfile;
  private state: NegotiationState;
  private dialogueTemplates: any;
  
  constructor(occupant: OccupantProfile) {
    this.occupant = occupant;
    this.state = {
      rounds: [],
      currentRound: 0,
      trustLevel: occupant.initialTrust || 5,
      stressLevel: 5, // Start at medium stress
      outcomeReached: false,
      approachesUsed: {
        EMPATHETIC: 0,
        BUSINESS: 0,
        AGGRESSIVE: 0,
        COLLABORATIVE: 0
      }
    };
    this.dialogueTemplates = this.getDialogueTemplates();
  }
  
  startNegotiation(): NegotiationRound {
    const openingStatement = this.generateOpeningStatement();
    const options = this.generateResponseOptions(0);
    
    const round: NegotiationRound = {
      roundNumber: 0,
      occupantStatement: openingStatement,
      playerOptions: options,
      trustChange: 0,
      stressChange: 0
    };
    
    this.state.rounds.push(round);
    return round;
  }
  
  processChoice(choiceId: string): NegotiationResult {
    const currentRound = this.state.rounds[this.state.currentRound];
    const choice = currentRound.playerOptions.find(o => o.id === choiceId);
    
    if (!choice) throw new Error('Invalid choice');
    
    // Track approach usage
    this.state.approachesUsed[choice.approach]++;
    
    // Calculate impact based on approach and occupant personality
    const impact = this.calculateImpact(choice.approach);
    
    // Update state
    this.state.trustLevel = Math.max(0, Math.min(10, this.state.trustLevel + impact.trustChange));
    this.state.stressLevel = Math.max(0, Math.min(10, this.state.stressLevel + impact.stressChange));
    
    currentRound.playerChoice = choice;
    currentRound.trustChange = impact.trustChange;
    currentRound.stressChange = impact.stressChange;
    
    // Generate occupant response and educational note
    const response = this.generateOccupantResponse(choice.approach);
    const educationalNote = this.generateEducationalNote(choice.approach, impact);
    
    currentRound.occupantResponse = response;
    currentRound.educationalNote = educationalNote;
    
    // Check if negotiation should end
    if (this.shouldEndNegotiation()) {
      const outcome = this.calculateOutcome();
      this.state.outcomeReached = true;
      this.state.finalOutcome = outcome;
      
      return { 
        response, 
        outcome, 
        educationalNote,
        trustChange: impact.trustChange,
        stressChange: impact.stressChange
      };
    }
    
    // Generate next round
    this.state.currentRound++;
    const nextRound = this.generateNextRound();
    this.state.rounds.push(nextRound);
    
    return { 
      response, 
      nextRound, 
      educationalNote,
      trustChange: impact.trustChange,
      stressChange: impact.stressChange
    };
  }
  
  getState(): NegotiationState {
    return { ...this.state };
  }
  
  private calculateImpact(approach: NegotiationApproach): {
    trustChange: number;
    stressChange: number;
  } {
    const personality = this.occupant;
    
    switch (approach) {
      case 'EMPATHETIC':
        // Empathy works especially well with emotional attachment
        const empathyBonus = personality.emotionalAttachment > 7 ? 1 : 0;
        return {
          trustChange: 2 + empathyBonus,
          stressChange: -2
        };
      
      case 'BUSINESS':
        // Business approach works better with practical people
        const businessBonus = personality.alternatives > 5 ? 1 : 0;
        const stressImpact = personality.financialDesperation > 7 ? 1 : -1;
        return {
          trustChange: 1 + businessBonus,
          stressChange: stressImpact
        };
      
      case 'AGGRESSIVE':
        // Aggressive approach almost always backfires
        const aggressivePenalty = this.state.trustLevel > 6 ? -1 : 0; // Worse if they trusted you
        return {
          trustChange: -3 + aggressivePenalty,
          stressChange: 3
        };
      
      case 'COLLABORATIVE':
        // Collaborative works well with established trust
        const collaborativeBonus = this.state.trustLevel > 5 ? 1 : 0;
        return {
          trustChange: 2 + collaborativeBonus,
          stressChange: -1
        };
      
      default:
        return { trustChange: 0, stressChange: 0 };
    }
  }
  
  private generateEducationalNote(approach: NegotiationApproach, impact: any): string {
    switch (approach) {
      case 'EMPATHETIC':
        if (impact.trustChange > 2) {
          return "🎯 Excellent! Showing genuine empathy builds strong trust and reduces stress.";
        }
        return "✅ Good approach. Empathy helps people feel understood and valued.";
      
      case 'BUSINESS':
        if (this.occupant.financialDesperation > 7) {
          return "💼 Professional approach works when people need practical solutions.";
        }
        return "⚖️ Business-focused approach maintains professional boundaries.";
      
      case 'AGGRESSIVE':
        return "⚠️ Aggressive tactics damage trust and increase stress. This rarely leads to good outcomes.";
      
      case 'COLLABORATIVE':
        if (this.state.trustLevel > 5) {
          return "🤝 Collaborative approach works well when trust is established.";
        }
        return "🔄 Collaboration requires some trust foundation to be effective.";
      
      default:
        return "";
    }
  }
  
  private shouldEndNegotiation(): boolean {
    // End if stress is too high
    if (this.state.stressLevel >= 9) {
      return true;
    }
    
    // End if trust is very high and stress is low (quick resolution)
    if (this.state.trustLevel >= 8 && this.state.stressLevel <= 3) {
      return true;
    }
    
    // End after maximum rounds
    if (this.state.currentRound >= 4) {
      return true;
    }
    
    // End if aggressive approach used too much
    if (this.state.approachesUsed.AGGRESSIVE >= 2) {
      return true;
    }
    
    return false;
  }
  
  private calculateOutcome(): NegotiationOutcome {
    // Calculate success score based on multiple factors
    const trustScore = this.state.trustLevel * 3;
    const stressScore = (10 - this.state.stressLevel) * 2;
    const emotionalScore = (10 - this.occupant.emotionalAttachment) * 1.5;
    const desperationScore = this.occupant.financialDesperation * 1.5;
    const alternativesScore = (10 - this.occupant.alternatives) * 1;
    
    const totalScore = trustScore + stressScore + emotionalScore + desperationScore + alternativesScore;
    const maxScore = 30 + 20 + 15 + 15 + 10; // 90
    const successRatio = totalScore / maxScore;
    
    const success = successRatio > 0.4; // 40% threshold for success
    
    if (!success) {
      const reason = this.getFailureReason();
      return {
        attemptId: 'attempt_' + Date.now(),
        success: false,
        reason,
        trustChange: -3,
        metrics: this.calculateMetrics(),
        educationalSummary: this.generateEducationalSummary(false, reason)
      };
    }
    
    // Determine agreement type based on success level and occupant preferences
    const agreementType = this.determineAgreementType(successRatio);
    const terms = this.generateAgreementTerms(agreementType);
    const futureROI = this.calculateFutureROI(agreementType);
    
    return {
      attemptId: 'attempt_' + Date.now(),
      success: true,
      agreement: {
        type: agreementType,
        terms,
        executionDate: new Date(),
        occupantSatisfaction: this.state.trustLevel,
        investorBenefit: this.calculateInvestorBenefit(agreementType)
      },
      trustChange: 2,
      futureROI,
      metrics: this.calculateMetrics(),
      educationalSummary: this.generateEducationalSummary(true, agreementType)
    };
  }
  
  private getFailureReason(): string {
    if (this.state.stressLevel >= 9) {
      return "Negotiation failed due to high stress levels. The occupant felt pressured and refused to cooperate.";
    }
    
    if (this.state.approachesUsed.AGGRESSIVE >= 2) {
      return "Aggressive tactics destroyed trust. The occupant will now resist and may require legal eviction.";
    }
    
    if (this.state.trustLevel <= 2) {
      return "Failed to build sufficient trust. The occupant doesn't believe you have their best interests in mind.";
    }
    
    return "Unable to find mutually acceptable terms. Will need to pursue formal eviction process.";
  }
  
  private determineAgreementType(successRatio: number): AgreementType {
    // Higher success enables better outcomes for both parties
    if (successRatio > 0.8) {
      // Excellent negotiation - can achieve occupant's preferred outcome
      return this.occupant.preferredOutcome || 'RENT_BACK';
    } else if (successRatio > 0.6) {
      // Good negotiation - compromise solution
      if (this.occupant.preferredOutcome === 'STAY_AS_OWNER') {
        return 'RENT_TO_OWN';
      }
      return this.occupant.preferredOutcome || 'RENT_BACK';
    } else {
      // Minimal success - basic cash for keys
      return 'CASH_FOR_KEYS';
    }
  }
  
  private generateAgreementTerms(type: AgreementType): Record<string, any> {
    switch (type) {
      case 'STAY_AS_OWNER':
        return {
          arrangement: 'Investor helps occupant cure default',
          monthlySupportPayment: 500,
          ownershipRetained: true,
          duration: 'Permanent'
        };
      
      case 'RENT_BACK':
        return {
          monthlyRent: this.occupant.maximumRent || 1200,
          leaseTerm: 12,
          securityDeposit: 1000,
          petPolicy: 'Allowed',
          renewalOption: true
        };
      
      case 'CASH_FOR_KEYS':
        return {
          payment: this.occupant.minimumCashForKeys || 5000,
          moveOutDays: 30,
          condition: 'Broom clean',
          movingAssistance: this.state.trustLevel > 6 ? 'Provided' : 'None'
        };
      
      case 'RENT_TO_OWN':
        return {
          downPayment: 5000,
          monthlyPayment: 1500,
          purchasePrice: 150000,
          termMonths: 36,
          creditTowardsOwnership: '50% of payments'
        };
      
      default:
        return {};
    }
  }
  
  private calculateFutureROI(agreementType: AgreementType): number {
    // ROI varies based on agreement type
    switch (agreementType) {
      case 'STAY_AS_OWNER': return 0; // No ROI, but good deed
      case 'RENT_BACK': return 8.5; // Standard rental cap rate
      case 'RENT_TO_OWN': return 12; // Higher due to sale premium
      case 'CASH_FOR_KEYS': return 15; // Can renovate and flip
      default: return 0;
    }
  }
  
  private calculateInvestorBenefit(agreementType: AgreementType): number {
    // 1-10 scale of investor benefit
    switch (agreementType) {
      case 'STAY_AS_OWNER': return 2; // Low financial benefit, high social impact
      case 'RENT_BACK': return 7; // Good steady income
      case 'RENT_TO_OWN': return 9; // High profit potential
      case 'CASH_FOR_KEYS': return 8; // Quick turnaround potential
      default: return 5;
    }
  }
  
  private calculateMetrics() {
    return {
      approachesUsed: { ...this.state.approachesUsed },
      finalTrustLevel: this.state.trustLevel,
      finalStressLevel: this.state.stressLevel,
      roundsCompleted: this.state.currentRound + 1,
      empathyScore: this.state.approachesUsed.EMPATHETIC + this.state.approachesUsed.COLLABORATIVE,
      aggressionScore: this.state.approachesUsed.AGGRESSIVE
    };
  }
  
  private generateEducationalSummary(success: boolean, outcome: string): string {
    if (!success) {
      return `Negotiation failed: ${outcome}\n\nKey Learning: ${this.getKeyLearning()}`;
    }
    
    return `Successful negotiation achieved: ${outcome}\n\nKey Learning: ${this.getKeyLearning()}`;
  }
  
  private getKeyLearning(): string {
    const empathyCount = this.state.approachesUsed.EMPATHETIC + this.state.approachesUsed.COLLABORATIVE;
    const aggressionCount = this.state.approachesUsed.AGGRESSIVE;
    
    if (aggressionCount >= 2) {
      return "Aggressive tactics typically backfire in negotiations. Building trust and reducing stress leads to better outcomes for everyone.";
    }
    
    if (empathyCount >= 3) {
      return "Empathetic and collaborative approaches build trust, leading to win-win solutions that benefit both parties long-term.";
    }
    
    if (this.state.trustLevel >= 7) {
      return "High trust enables creative solutions that might not be possible in adversarial negotiations.";
    }
    
    return "Successful negotiations balance empathy with practical business needs. Understanding the other party's perspective is crucial.";
  }
  
  private generateOpeningStatement(): string {
    const templates = this.dialogueTemplates[this.occupant.archetype];
    return templates?.opening || "I know why you're here. This is about the house, isn't it?";
  }
  
  private generateOccupantResponse(approach: NegotiationApproach): string {
    const templates = this.dialogueTemplates[this.occupant.archetype];
    const responses = templates?.responses || {};
    
    // Modify response based on current state
    let baseResponse = responses[approach] || "I'm not sure what to say to that.";
    
    if (this.state.stressLevel > 7) {
      baseResponse += " I'm feeling really overwhelmed right now.";
    } else if (this.state.trustLevel > 7) {
      baseResponse += " I appreciate that you're trying to help.";
    }
    
    return baseResponse;
  }
  
  private generateResponseOptions(roundNumber: number): DialogueOption[] {
    const baseOptions: DialogueOption[] = [
      {
        id: 'empathetic_1',
        approach: 'EMPATHETIC',
        text: 'I understand this must be incredibly difficult for you. Can you tell me what would help you most right now?'
      },
      {
        id: 'business_1',
        approach: 'BUSINESS',
        text: 'Let\'s review your situation and see what practical options we have available.'
      },
      {
        id: 'collaborative_1',
        approach: 'COLLABORATIVE',
        text: 'I\'d like to find a solution that works for both of us. What are your main concerns?'
      },
      {
        id: 'aggressive_1',
        approach: 'AGGRESSIVE',
        text: 'The foreclosure is final. You need to accept that and make plans to leave.'
      }
    ];
    
    // Disable options based on current state
    baseOptions.forEach(option => {
      if (option.approach === 'AGGRESSIVE' && this.state.trustLevel > 6) {
        option.disabled = true;
        option.disabledReason = 'This would damage the trust you\'ve built';
      }
      
      if (option.approach === 'COLLABORATIVE' && this.state.trustLevel < 3) {
        option.disabled = true;
        option.disabledReason = 'Need more trust for collaborative approach';
      }
    });
    
    return baseOptions;
  }
  
  private generateNextRound(): NegotiationRound {
    const statement = this.generateProgressStatement();
    const options = this.generateProgressOptions();
    
    return {
      roundNumber: this.state.currentRound,
      occupantStatement: statement,
      playerOptions: options,
      trustChange: 0,
      stressChange: 0
    };
  }
  
  private generateProgressStatement(): string {
    if (this.state.stressLevel > 7) {
      return "This is all happening so fast. I don't know if I can trust anyone anymore.";
    }
    
    if (this.state.trustLevel > 6) {
      return "You seem different from what I expected. Maybe we can work something out.";
    }
    
    if (this.state.approachesUsed.AGGRESSIVE > 0) {
      return "I don't appreciate being threatened. If you want to talk, show some respect.";
    }
    
    return "What exactly are you proposing? I need to understand my options.";
  }
  
  private generateProgressOptions(): DialogueOption[] {
    // Generate context-appropriate options based on current state
    return [
      {
        id: `empathetic_${this.state.currentRound}`,
        approach: 'EMPATHETIC',
        text: 'I can see you\'re struggling with this. Let me help you understand your rights and options.'
      },
      {
        id: `business_${this.state.currentRound}`,
        approach: 'BUSINESS',
        text: 'Here are the specific terms I can offer. Let\'s see if any of these work for you.'
      },
      {
        id: `collaborative_${this.state.currentRound}`,
        approach: 'COLLABORATIVE',
        text: 'What if we could create a plan that gives you time and me a reasonable return?'
      },
      {
        id: `aggressive_${this.state.currentRound}`,
        approach: 'AGGRESSIVE',
        text: 'I\'m trying to be reasonable here, but you need to be realistic about your situation.'
      }
    ];
  }
  
  private getDialogueTemplates(): any {
    return {
      recentWidow: {
        opening: "I know why you're here. This house... it's all I have left of him. I can't lose it too.",
        responses: {
          EMPATHETIC: "Thank you for understanding. No one else has even tried to listen.",
          BUSINESS: "I appreciate you being straightforward. I need to know my options.",
          AGGRESSIVE: "How dare you! Have you no compassion for what I've been through?",
          COLLABORATIVE: "I... I hope you mean that. I just want to keep some piece of my life together."
        }
      },
      youngFamily: {
        opening: "Please, we have nowhere else to go. The kids don't understand why strangers keep coming to the house.",
        responses: {
          EMPATHETIC: "Finally, someone who gets it. We're not deadbeats - we just hit some bad luck.",
          BUSINESS: "Okay, so what are you thinking? We can't afford much, but maybe something works.",
          AGGRESSIVE: "You want to throw children out on the street? What kind of person are you?",
          COLLABORATIVE: "If you really mean that, then yes, let's figure something out together."
        }
      },
      elderlyRetiree: {
        opening: "I've lived here for 30 years. Built this neighborhood. Now nobody cares about us old folks.",
        responses: {
          EMPATHETIC: "Thank you, dear. Most people just see an old woman in the way.",
          BUSINESS: "Well, at least you're being honest about it. That's more than most.",
          AGGRESSIVE: "I've dealt with bullies before, young person. You don't scare me.",
          COLLABORATIVE: "Now that sounds reasonable. I've got some ideas if you're willing to listen."
        }
      },
      medicalBankruptcy: {
        opening: "The cancer treatments cost everything. Insurance didn't cover half of it. We never asked for this.",
        responses: {
          EMPATHETIC: "It means everything to hear someone say that. We feel so ashamed.",
          BUSINESS: "I understand. Medical debt is different. Let's see what we can work out.",
          AGGRESSIVE: "We're fighting for our lives and you want to kick us while we're down?",
          COLLABORATIVE: "Yes, please. We need someone who understands this isn't our fault."
        }
      },
      jobLoss: {
        opening: "I was at that job for 15 years. They said 'restructuring' but really meant 'you're too old and expensive.'",
        responses: {
          EMPATHETIC: "Thank you. Everyone acts like it was something I did wrong.",
          BUSINESS: "Fair enough. I've been looking for work, but it's tough out there.",
          AGGRESSIVE: "Easy for you to say. You probably never worried about losing everything.",
          COLLABORATIVE: "I'd like that. I'm willing to work with someone who's reasonable."
        }
      },
      studentDebt: {
        opening: "The degree was supposed to help me get ahead. Instead, I'm drowning in debt and can't find decent work.",
        responses: {
          EMPATHETIC: "Nobody told me this could happen. I did everything I was supposed to do.",
          BUSINESS: "I get it. Numbers are numbers. What kind of deal are we talking about?",
          AGGRESSIVE: "Great, another person who thinks I'm just irresponsible. This is hopeless.",
          COLLABORATIVE: "Seriously? Someone who actually wants to help instead of judge?"
        }
      }
    };
  }
}