// stores/studentStore.js
import { defineStore } from 'pinia'
import { useGameStore } from './gameStore'

export const useStudentStore = defineStore('student', {
  state: () => ({
    currentStudent: null,
    researchResults: new Map(), // propertyId -> research data
    draftBoard: [], // Priority list of properties
    propertyAnalyses: new Map(), // propertyId -> analysis
    selectedProperty: null,
    filters: {
      city: '',
      status: '',
      priceRange: 'all'
    },
    sortBy: 'address',
    withdrawAmount: 100000, // Default withdrawal amount
    bidAmount: 0,
    // Manual bid tracking for bidding phase
    manualBids: new Map(), // propertyId -> { won: boolean, amount: number, confirmed: boolean }
    // Redemption phase data
    propertyStrategies: new Map(), // propertyId -> { strategy, negotiation }
    portfolioSummary: null,
    redemptionTimeRemaining: 600 // 10 minutes in seconds
  }),

  getters: {
    filteredProperties: (state) => {
      const gameStore = useGameStore()
      if (!gameStore.session) return []
      
      let properties = [...gameStore.session.properties]
      
      // Apply filters
      if (state.filters.city) {
        properties = properties.filter(p => p.city === state.filters.city)
      }
      
      if (state.filters.status === 'researched') {
        properties = properties.filter(p => 
          state.researchResults.has(p.id) || (p.researchedBy && p.researchedBy.has(state.currentStudent?.id))
        )
      } else if (state.filters.status === 'not-researched') {
        properties = properties.filter(p => 
          !state.researchResults.has(p.id) && (!p.researchedBy || !p.researchedBy.has(state.currentStudent?.id))
        )
      }
      
      if (state.filters.priceRange === 'low') {
        properties = properties.filter(p => p.openingBid < 50000)
      } else if (state.filters.priceRange === 'medium') {
        properties = properties.filter(p => p.openingBid >= 50000 && p.openingBid < 150000)
      } else if (state.filters.priceRange === 'high') {
        properties = properties.filter(p => p.openingBid >= 150000)
      }
      
      // Apply sorting
      properties.sort((a, b) => {
        switch (state.sortBy) {
          case 'city':
            return a.city.localeCompare(b.city)
          case 'openingBid':
            return (a.openingBid || 0) - (b.openingBid || 0)
          case 'address':
          default:
            return a.address.localeCompare(b.address)
        }
      })
      
      return properties
    },
    
    totalDraftBoardValue: (state) => {
      return state.draftBoard.reduce((sum, item) => sum + (item.maxBid || 0), 0)
    },
    
    researchCreditsRemaining: (state) => {
      return state.currentStudent?.researchCredits || 0
    },
    
    cashAvailable: (state) => {
      return state.currentStudent?.cashAvailable || 0
    },
    
    propertiesWon: (state) => {
      const gameStore = useGameStore()
      if (!gameStore.session || !state.currentStudent) return []
      
      return gameStore.session.properties.filter(p => 
        state.currentStudent.propertiesWon?.includes(p.id)
      )
    }
  },

  actions: {
    initializeStudent(student) {
      this.currentStudent = student
      this.researchResults = new Map()
      this.draftBoard = []
      this.propertyAnalyses = new Map()
      
      // Load any saved data from localStorage
      this.loadStudentData()
    },
    
    performResearch(propertyId, level = 1) {
      const gameStore = useGameStore()
      if (!this.currentStudent) return null
      
      const researchData = gameStore.researchProperty(this.currentStudent.id, propertyId, level)
      
      if (researchData) {
        // Store research results locally
        const existingData = this.researchResults.get(propertyId) || {}
        this.researchResults.set(propertyId, {
          ...existingData,
          ...researchData,
          lastUpdated: Date.now()
        })
        
        // Update current student reference
        this.currentStudent = gameStore.currentStudent
        this.saveStudentData()
      }
      
      return researchData
    },
    
    attemptOccupantContact(propertyId) {
      const gameStore = useGameStore()
      if (!gameStore.session || !this.currentStudent) return false
      
      const property = gameStore.session.properties.find(p => p.id === propertyId)
      if (!property || !property.occupant) return false
      
      // Use occupant's response rate (30-70% based on their profile)
      const responseRate = property.occupant.responseRate || 0.5
      const contactSuccessful = Math.random() < responseRate
      
      if (contactSuccessful) {
        // Perform level 3 research - this reveals occupant details
        const researchData = this.performResearch(propertyId, 3)
        
        // Add success message to research data
        if (researchData) {
          researchData.contactSuccessful = true
          researchData.contactMessage = `Successfully contacted ${property.occupant.name}. They are willing to discuss their situation.`
        }
        
        return researchData
      } else {
        // Still costs 1 credit for the attempt
        if (this.currentStudent.researchCredits >= 1) {
          // Deduct credit through gameStore
          const gameStore = useGameStore()
          gameStore.researchProperty(this.currentStudent.id, propertyId, 3)
          
          // Return failure message
          return {
            contactSuccessful: false,
            contactMessage: `Unable to reach ${property.occupant.name}. They may not be available or willing to speak.`,
            creditsDeducted: 1
          }
        }
        return null
      }
    },
    
    savePropertyAnalysis(propertyId, analysis) {
      this.propertyAnalyses.set(propertyId, {
        ...analysis,
        savedAt: Date.now()
      })
      
      // Also save to game store
      const gameStore = useGameStore()
      gameStore.saveAnalysis(this.currentStudent.id, propertyId, analysis)
      
      this.saveStudentData()
    },
    
    addToDraftBoard(property, estimatedBid, maxBid) {
      const existingIndex = this.draftBoard.findIndex(item => item.propertyId === property.id)
      
      if (existingIndex >= 0) {
        // Update existing entry
        this.draftBoard[existingIndex] = {
          ...this.draftBoard[existingIndex],
          estimatedBid,
          maxBid,
          updatedAt: Date.now()
        }
      } else {
        // Add new entry
        this.draftBoard.push({
          propertyId: property.id,
          property,
          estimatedBid,
          maxBid,
          priority: this.draftBoard.length + 1,
          addedAt: Date.now()
        })
      }
      
      this.updatePriorityList()
      this.saveStudentData()
    },
    
    removeFromDraftBoard(propertyId) {
      this.draftBoard = this.draftBoard.filter(item => item.propertyId !== propertyId)
      this.updatePriorityList()
      this.saveStudentData()
    },
    
    reorderDraftBoard(fromIndex, toIndex) {
      const item = this.draftBoard[fromIndex]
      this.draftBoard.splice(fromIndex, 1)
      this.draftBoard.splice(toIndex, 0, item)
      this.updatePriorityList()
      this.saveStudentData()
    },
    
    updatePriorityList() {
      const gameStore = useGameStore()
      if (!this.currentStudent) return
      
      const propertyIds = this.draftBoard.map(item => item.propertyId)
      gameStore.updatePriorityList(this.currentStudent.id, propertyIds)
    },
    
    withdrawCash(amount) {
      const gameStore = useGameStore()
      if (!this.currentStudent) return false
      
      const success = gameStore.withdrawCash(this.currentStudent.id, amount)
      if (success) {
        this.currentStudent = gameStore.currentStudent
        this.saveStudentData()
      }
      
      return success
    },
    
    placeBid(propertyId, amount) {
      const gameStore = useGameStore()
      if (!this.currentStudent) return false
      
      const success = gameStore.placeBid(propertyId, this.currentStudent.id, amount)
      if (success) {
        this.currentStudent = gameStore.currentStudent
        this.saveStudentData()
      }
      
      return success
    },
    
    // Manual bid tracking methods for the new bidding system
    recordManualWin(propertyId, amount) {
      const gameStore = useGameStore()
      if (!this.currentStudent) return false
      
      // Record in manual bids map
      this.manualBids.set(propertyId, {
        won: true,
        amount: amount,
        confirmed: true
      })
      
      // Update student's won properties
      if (!this.currentStudent.propertiesWon) {
        this.currentStudent.propertiesWon = []
      }
      if (!this.currentStudent.propertiesWon.includes(propertyId)) {
        this.currentStudent.propertiesWon.push(propertyId)
      }
      
      // Update cash available
      this.currentStudent.cashAvailable = Math.max(0, this.currentStudent.cashAvailable - amount)
      
      // Save to game store
      gameStore.recordManualBid(this.currentStudent.id, propertyId, amount, true)
      
      this.saveStudentData()
      return true
    },
    
    recordManualLoss(propertyId) {
      // Record in manual bids map
      this.manualBids.set(propertyId, {
        won: false,
        amount: 0,
        confirmed: true
      })
      
      // Remove from won properties if it was there
      if (this.currentStudent.propertiesWon) {
        this.currentStudent.propertiesWon = this.currentStudent.propertiesWon.filter(id => id !== propertyId)
      }
      
      this.saveStudentData()
      return true
    },
    
    getManualBids() {
      return this.manualBids
    },
    
    setSelectedProperty(property) {
      this.selectedProperty = property
    },
    
    setFilter(filterType, value) {
      this.filters[filterType] = value
    },
    
    setSortBy(sortBy) {
      this.sortBy = sortBy
    },
    
    saveStudentData() {
      if (!this.currentStudent) return
      
      const data = {
        studentId: this.currentStudent.id,
        researchResults: Array.from(this.researchResults.entries()),
        draftBoard: this.draftBoard,
        propertyAnalyses: Array.from(this.propertyAnalyses.entries()),
        filters: this.filters,
        sortBy: this.sortBy,
        manualBids: Array.from(this.manualBids.entries()),
        propertyStrategies: Array.from(this.propertyStrategies.entries()),
        portfolioSummary: this.portfolioSummary
      }
      
      localStorage.setItem(`student_data_${this.currentStudent.id}`, JSON.stringify(data))
    },
    
    loadStudentData() {
      if (!this.currentStudent) return
      
      const stored = localStorage.getItem(`student_data_${this.currentStudent.id}`)
      if (stored) {
        const data = JSON.parse(stored)
        this.researchResults = new Map(data.researchResults || [])
        this.draftBoard = data.draftBoard || []
        this.propertyAnalyses = new Map(data.propertyAnalyses || [])
        this.filters = data.filters || this.filters
        this.sortBy = data.sortBy || this.sortBy
        this.manualBids = new Map(data.manualBids || [])
        this.propertyStrategies = new Map(data.propertyStrategies || [])
        this.portfolioSummary = data.portfolioSummary || null
      }
    },
    
    // Redemption Phase Methods
    setExitStrategy(propertyId, strategy) {
      const gameStore = useGameStore()
      if (!this.currentStudent) return false
      
      // Update local state
      if (!this.propertyStrategies.has(propertyId)) {
        this.propertyStrategies.set(propertyId, {})
      }
      this.propertyStrategies.get(propertyId).strategy = strategy
      
      // Update game store
      const success = gameStore.setPropertyExitStrategy(propertyId, this.currentStudent.id, strategy)
      if (success) {
        this.saveStudentData()
      }
      
      return success
    },
    
    setNegotiationOutcome(propertyId, outcome) {
      const gameStore = useGameStore()
      if (!this.currentStudent) return false
      
      // Update local state
      if (!this.propertyStrategies.has(propertyId)) {
        this.propertyStrategies.set(propertyId, {})
      }
      this.propertyStrategies.get(propertyId).negotiationOutcome = outcome
      
      // Update game store
      const success = gameStore.setPropertyNegotiationOutcome(propertyId, this.currentStudent.id, outcome)
      if (success) {
        this.saveStudentData()
      }
      
      return success
    },
    
    savePortfolio() {
      const gameStore = useGameStore()
      if (!this.currentStudent) return false
      
      const success = gameStore.saveStudentPortfolio(this.currentStudent.id)
      if (success) {
        // Calculate and save portfolio summary
        const wonProperties = gameStore.getCurrentStudentWonProperties()
        this.portfolioSummary = {
          timestamp: Date.now(),
          propertyCount: wonProperties.length,
          totalInvested: wonProperties.reduce((sum, p) => sum + p.winningBid, 0),
          cashRemaining: this.currentStudent.cashAvailable
        }
        this.saveStudentData()
      }
      
      return success
    },
    
    startRedemptionTimer() {
      this.redemptionTimeRemaining = 600 // Reset to 10 minutes
    },
    
    decrementRedemptionTimer() {
      if (this.redemptionTimeRemaining > 0) {
        this.redemptionTimeRemaining--
      }
    },
    
    clearStudentData() {
      this.currentStudent = null
      this.researchResults = new Map()
      this.draftBoard = []
      this.propertyAnalyses = new Map()
      this.selectedProperty = null
      this.filters = {
        city: '',
        status: '',
        priceRange: 'all'
      }
      this.sortBy = 'address'
      this.propertyStrategies = new Map()
      this.portfolioSummary = null
    }
  }
})