// stores/gameStore.js
import { defineStore } from 'pinia'
import { generateSeededProperties } from '~/features/auction/core/propertyGenerator'

// Phase access codes that moderator shares with students
const PHASE_CODES = {
  PREVIEW: '', // No code needed - default start
  ANNOUNCEMENT: 'REVEAL24',
  BANKING: 'BANK500',
  BIDDING: 'BID2024',
  REDEMPTION: 'NEGOTIATE',
  COMPLETE: 'FINAL'
}

export const useGameStore = defineStore('game', {
  state: () => ({
    session: null,
    isModeratorView: false,
    currentStudentId: null,
    phaseStartTime: null,
    unlockedPhases: ['PREVIEW'], // Students start with PREVIEW unlocked
    studentPhase: 'PREVIEW', // Track student's current phase separately
    devMode: false, // Enable for testing
    phaseTimers: {
      PREVIEW: 1800, // 30 minutes
      ANNOUNCEMENT: 300, // 5 minutes
      BANKING: 600, // 10 minutes
      BIDDING: 3600, // 60 minutes
      REDEMPTION: 900, // 15 minutes
    },
    studentPortfolios: new Map(), // Track final portfolios
    propertyStrategies: new Map(), // propertyId -> { studentId, strategy, negotiation }
  }),

  getters: {
    currentStudent: (state) => {
      if (!state.session || !state.currentStudentId) return null
      return state.session.students.get(state.currentStudentId)
    },
    
    currentProperty: (state) => {
      if (!state.session) return null
      return state.session.properties[state.session.currentPropertyIndex]
    },
    
    phaseTimeRemaining: (state) => {
      if (!state.session || !state.phaseStartTime) return 0
      const elapsed = Date.now() - state.phaseStartTime
      const duration = state.phaseTimers[state.session.currentPhase] * 1000
      return Math.max(0, Math.floor((duration - elapsed) / 1000))
    },
    
    studentsArray: (state) => {
      if (!state.session) return []
      return Array.from(state.session.students.values())
    },
    
    phaseCodes: () => PHASE_CODES,
    
    isPhaseUnlocked: (state) => (phase) => {
      if (state.devMode) return true
      return state.unlockedPhases.includes(phase)
    }
  },

  actions: {
    createSession(code, moderatorId) {
      // Generate 50 properties using the existing property generator
      const properties = generateSeededProperties(code, 50)
      
      this.session = {
        code,
        moderatorId,
        currentPhase: 'LOBBY',
        currentPropertyIndex: 0,
        properties,
        students: new Map(),
        bids: [],
        winners: [],
        marketEvents: [],
        researchRecords: new Map(), // Track who researched what
        createdAt: Date.now()
      }
      
      this.isModeratorView = true
      this.phaseStartTime = Date.now()
      this.saveToLocalStorage()
      
      return this.session
    },
    
    loadSession(code) {
      const stored = localStorage.getItem(`auction_session_${code}`)
      if (stored) {
        const data = JSON.parse(stored)
        // Reconstruct Maps from arrays
        this.session = {
          ...data,
          students: new Map(data.students || []),
          researchRecords: new Map(data.researchRecords || []),
          properties: data.properties.map(p => ({
            ...p,
            researchedBy: new Set(p.researchedBy || [])
          }))
        }
        // Restore redemption phase data
        this.propertyStrategies = new Map(data.propertyStrategies || [])
        this.studentPortfolios = new Map(data.studentPortfolios || [])
        return true
      }
      return false
    },
    
    joinSession(code, studentName) {
      if (!this.session || this.session.code !== code) {
        // Try to load from localStorage
        if (!this.loadSession(code)) {
          return null
        }
      }
      
      const studentId = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const paddleNumber = this.session.students.size + 1
      
      const student = {
        id: studentId,
        name: studentName,
        paddleNumber,
        cashAvailable: 100000, // Start with $100k
        cashWithdrawn: 0,
        researchCredits: 30,
        propertiesWon: [],
        totalSpent: 0,
        priorityList: [],
        analyses: new Map(),
        joinedAt: Date.now()
      }
      
      this.session.students.set(studentId, student)
      this.currentStudentId = studentId
      this.isModeratorView = false
      this.saveToLocalStorage()
      
      return student
    },
    
    transitionPhase(newPhase) {
      if (!this.session) return
      
      const phases = ['LOBBY', 'PREVIEW', 'ANNOUNCEMENT', 'BANKING', 'BIDDING', 'REDEMPTION', 'COMPLETE']
      const currentIndex = phases.indexOf(this.session.currentPhase)
      const newIndex = phases.indexOf(newPhase)
      
      // Allow progression to next phase or moderator override
      if (newIndex === currentIndex + 1 || this.isModeratorView) {
        this.session.currentPhase = newPhase
        this.phaseStartTime = Date.now()
        
        // If moving to ANNOUNCEMENT, reveal opening bids
        if (newPhase === 'ANNOUNCEMENT') {
          this.revealOpeningBids()
        }
        
        this.saveToLocalStorage()
        return true
      }
      
      return false
    },
    
    revealOpeningBids() {
      // Opening bids are already set in properties, just mark as revealed
      if (this.session) {
        this.session.openingBidsRevealed = true
        this.saveToLocalStorage()
      }
    },
    
    withdrawCash(studentId, amount) {
      if (!this.session) return false
      
      const student = this.session.students.get(studentId)
      if (!student) return false
      
      // Max withdrawal is $500k total
      const maxWithdrawal = 500000
      const availableToWithdraw = Math.min(maxWithdrawal - student.cashWithdrawn, amount)
      
      if (availableToWithdraw > 0) {
        student.cashWithdrawn += availableToWithdraw
        student.cashAvailable = 100000 + student.cashWithdrawn // Initial + withdrawn
        this.session.students.set(studentId, student)
        this.saveToLocalStorage()
        return true
      }
      
      return false
    },
    
    researchProperty(studentId, propertyId, level = 1) {
      if (!this.session) return null
      
      const student = this.session.students.get(studentId)
      const property = this.session.properties.find(p => p.id === propertyId)
      
      if (!student || !property) return null
      
      // Check if student has research credits (2 credits per research)
      const creditCost = level === 3 ? 1 : 2 // Contact attempt costs 1, research costs 2
      if (student.researchCredits < creditCost) return null
      
      // Deduct credits
      student.researchCredits -= creditCost
      
      // Track research
      if (!property.researchedBy) {
        property.researchedBy = new Set()
      }
      property.researchedBy.add(studentId)
      
      // Update research level
      property.researchLevel = Math.max(property.researchLevel || 0, level)
      
      // Return revealed information based on level
      const researchData = {
        level,
        propertyId,
        studentId,
        timestamp: Date.now()
      }
      
      if (level >= 1) {
        researchData.occupancyStatus = property.occupancyStatus
        researchData.occupant = property.occupant
        researchData.hasSecondLien = property.backTaxes > 0
        researchData.secondLienAmount = property.backTaxes
      }
      
      if (level >= 2) {
        researchData.renovationNeeded = property.renovationLevel
        researchData.hiddenDamage = property.hiddenDamage
        researchData.hiddenDamageType = property.hiddenDamageType
        researchData.outstandingDebt = property.outstandingDebt
        researchData.redemptionAgreement = property.redemptionAgreement
      }
      
      if (level >= 3 && property.occupant) {
        // Contact successful - reveal more details
        researchData.occupantDetails = {
          ...property.occupant,
          willingToNegotiate: property.occupant.willingToNegotiate,
          preferredOutcome: property.occupant.preferredOutcome
        }
        researchData.marketValue = property.marketValue
      }
      
      // Store research record
      if (!this.session.researchRecords.has(propertyId)) {
        this.session.researchRecords.set(propertyId, [])
      }
      this.session.researchRecords.get(propertyId).push(researchData)
      
      this.session.students.set(studentId, student)
      this.saveToLocalStorage()
      
      return researchData
    },
    
    saveAnalysis(studentId, propertyId, analysis) {
      if (!this.session) return
      
      const student = this.session.students.get(studentId)
      if (!student) return
      
      if (!student.analyses) {
        student.analyses = new Map()
      }
      
      student.analyses.set(propertyId, {
        ...analysis,
        propertyId,
        savedAt: Date.now()
      })
      
      this.session.students.set(studentId, student)
      this.saveToLocalStorage()
    },
    
    updatePriorityList(studentId, propertyIds) {
      if (!this.session) return
      
      const student = this.session.students.get(studentId)
      if (!student) return
      
      student.priorityList = propertyIds
      this.session.students.set(studentId, student)
      this.saveToLocalStorage()
    },
    
    placeBid(propertyId, studentId, amount) {
      if (!this.session) return false
      
      const student = this.session.students.get(studentId)
      const property = this.session.properties.find(p => p.id === propertyId)
      
      if (!student || !property) return false
      
      // Check if student has enough cash
      if (student.cashAvailable < amount) return false
      
      const bid = {
        id: `bid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        propertyId,
        studentId,
        studentName: student.name,
        paddleNumber: student.paddleNumber,
        amount,
        timestamp: Date.now(),
        isWinning: true
      }
      
      // Mark previous bids as not winning
      this.session.bids.forEach(b => {
        if (b.propertyId === propertyId) {
          b.isWinning = false
        }
      })
      
      this.session.bids.push(bid)
      
      // Update property's current bid
      property.currentBid = amount
      property.highestBidder = studentId
      
      this.saveToLocalStorage()
      return true
    },
    
    finalizeSale(propertyId, winnerId, amount) {
      if (!this.session) return false
      
      const student = this.session.students.get(winnerId)
      const property = this.session.properties.find(p => p.id === propertyId)
      
      if (!student || !property) return false
      
      // Deduct cash from student
      student.cashAvailable -= amount
      student.totalSpent += amount
      student.propertiesWon.push(propertyId)
      
      // Record winner
      this.session.winners.push({
        propertyId,
        studentId: winnerId,
        winningBid: amount,
        timestamp: Date.now()
      })
      
      // Mark property as sold
      property.soldTo = winnerId
      property.soldFor = amount
      
      this.session.students.set(winnerId, student)
      this.saveToLocalStorage()
      return true
    },
    
    nextProperty() {
      if (!this.session) return
      
      const maxIndex = this.session.properties.length - 1
      if (this.session.currentPropertyIndex < maxIndex) {
        this.session.currentPropertyIndex++
        this.saveToLocalStorage()
      }
    },
    
    previousProperty() {
      if (!this.session) return
      
      if (this.session.currentPropertyIndex > 0) {
        this.session.currentPropertyIndex--
        this.saveToLocalStorage()
      }
    },
    
    triggerMarketEvent(type, impact, cities) {
      if (!this.session) return
      
      // Apply impact to affected properties
      this.session.properties.forEach(property => {
        if (cities.includes(property.city)) {
          property.marketValue = Math.round(property.marketValue * (1 + impact / 100))
        }
      })
      
      // Record event
      this.session.marketEvents.push({
        type,
        impact,
        affectedCities: cities,
        timestamp: Date.now()
      })
      
      this.saveToLocalStorage()
    },
    
    getPropertyBids(propertyId) {
      if (!this.session) return []
      
      return this.session.bids
        .filter(b => b.propertyId === propertyId)
        .sort((a, b) => b.amount - a.amount)
    },
    
    getPropertyResearch(propertyId) {
      if (!this.session || !this.session.researchRecords) return []
      return this.session.researchRecords.get(propertyId) || []
    },
    
    saveToLocalStorage() {
      if (!this.session) return
      
      // Convert Maps to arrays for JSON serialization
      const sessionData = {
        ...this.session,
        students: Array.from(this.session.students.entries()),
        researchRecords: Array.from(this.session.researchRecords?.entries() || []),
        properties: this.session.properties.map(p => ({
          ...p,
          researchedBy: p.researchedBy ? Array.from(p.researchedBy) : [],
          analyses: p.analyses ? Array.from(p.analyses.entries()) : []
        })),
        propertyStrategies: Array.from(this.propertyStrategies.entries()),
        studentPortfolios: Array.from(this.studentPortfolios.entries())
      }
      
      localStorage.setItem(`auction_session_${this.session.code}`, JSON.stringify(sessionData))
      
      // Also save current session code for quick access
      localStorage.setItem('auction_current_session', this.session.code)
    },
    
    clearSession() {
      if (this.session) {
        localStorage.removeItem(`auction_session_${this.session.code}`)
      }
      this.session = null
      this.currentStudentId = null
      this.isModeratorView = false
      this.phaseStartTime = null
      this.unlockedPhases = ['PREVIEW']
      this.studentPhase = 'PREVIEW'
    },
    
    // New actions for phase code system
    unlockPhase(code) {
      // Find which phase this code unlocks
      const phase = Object.entries(PHASE_CODES).find(([p, c]) => c === code)?.[0]
      
      if (phase && !this.unlockedPhases.includes(phase)) {
        this.unlockedPhases.push(phase)
        this.studentPhase = phase
        this.saveToLocalStorage()
        return { success: true, phase }
      }
      
      return { success: false, phase: null }
    },
    
    setStudentPhase(phase) {
      if (this.isPhaseUnlocked(phase)) {
        this.studentPhase = phase
        this.saveToLocalStorage()
        return true
      }
      return false
    },
    
    toggleDevMode() {
      this.devMode = !this.devMode
      if (this.devMode) {
        // Unlock all phases in dev mode
        this.unlockedPhases = ['PREVIEW', 'ANNOUNCEMENT', 'BANKING', 'BIDDING', 'REDEMPTION', 'COMPLETE']
      } else {
        // Reset to default
        this.unlockedPhases = ['PREVIEW']
      }
      this.saveToLocalStorage()
    },
    
    getPhaseCode(phase) {
      return PHASE_CODES[phase] || ''
    },
    
    // Redemption Phase Methods
    setPropertyExitStrategy(propertyId, studentId, strategy) {
      if (!this.propertyStrategies.has(propertyId)) {
        this.propertyStrategies.set(propertyId, {})
      }
      
      const propertyStrategy = this.propertyStrategies.get(propertyId)
      propertyStrategy.studentId = studentId
      propertyStrategy.strategy = strategy
      propertyStrategy.timestamp = Date.now()
      
      this.saveToLocalStorage()
      return true
    },
    
    setPropertyNegotiationOutcome(propertyId, studentId, outcome) {
      if (!this.propertyStrategies.has(propertyId)) {
        this.propertyStrategies.set(propertyId, {})
      }
      
      const propertyStrategy = this.propertyStrategies.get(propertyId)
      propertyStrategy.negotiationOutcome = outcome
      propertyStrategy.negotiationTimestamp = Date.now()
      
      this.saveToLocalStorage()
      return true
    },
    
    getCurrentStudentWonProperties() {
      if (!this.session || !this.currentStudentId) return []
      
      // Get properties won by current student with their winning bid amounts
      return this.session.winners
        .filter(w => w.studentId === this.currentStudentId)
        .map(winner => {
          const property = this.session.properties.find(p => p.id === winner.propertyId)
          const strategy = this.propertyStrategies.get(winner.propertyId) || {}
          
          return {
            ...property,
            winningBid: winner.winningBid,
            exitStrategy: strategy.strategy || null,
            negotiationOutcome: strategy.negotiationOutcome || null
          }
        })
    },
    
    getStudentWonProperties(studentId) {
      if (!this.session) return []
      
      return this.session.winners
        .filter(w => w.studentId === studentId)
        .map(winner => {
          const property = this.session.properties.find(p => p.id === winner.propertyId)
          const strategy = this.propertyStrategies.get(winner.propertyId) || {}
          
          return {
            ...property,
            winningBid: winner.winningBid,
            exitStrategy: strategy.strategy || null,
            negotiationOutcome: strategy.negotiationOutcome || null
          }
        })
    },
    
    saveStudentPortfolio(studentId) {
      const student = this.session?.students.get(studentId)
      if (!student) return false
      
      const wonProperties = this.getStudentWonProperties(studentId)
      
      // Calculate portfolio metrics
      const portfolio = {
        studentId,
        studentName: student.name,
        timestamp: Date.now(),
        properties: wonProperties,
        cashRemaining: student.cashAvailable,
        totalInvested: wonProperties.reduce((sum, p) => sum + p.winningBid, 0),
        propertyCount: wonProperties.length
      }
      
      this.studentPortfolios.set(studentId, portfolio)
      
      // Also save to localStorage with session code
      const portfolioKey = `portfolio_${this.session.code}_${studentId}`
      localStorage.setItem(portfolioKey, JSON.stringify(portfolio))
      
      this.saveToLocalStorage()
      return true
    },
    
    getAllStudentPortfolios() {
      if (!this.session) return []
      
      const portfolios = []
      this.session.students.forEach((student, studentId) => {
        const wonProperties = this.getStudentWonProperties(studentId)
        if (wonProperties.length > 0) {
          portfolios.push({
            studentId,
            studentName: student.name,
            properties: wonProperties,
            totalInvested: wonProperties.reduce((sum, p) => sum + p.winningBid, 0),
            propertyCount: wonProperties.length
          })
        }
      })
      
      return portfolios
    }
  }
})