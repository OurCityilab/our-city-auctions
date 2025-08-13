// stores/moderatorStore.js
import { defineStore } from 'pinia'
import { useGameStore } from './gameStore'

export const useModeratorStore = defineStore('moderator', {
  state: () => ({
    isModeratorView: false,
    currentPropertyIndex: 0,
    pendingVerification: false,
    selectedStudentForBid: null,
    quickBidAmount: 0,
    hotkeysEnabled: true,
    auctionSpeed: 'normal', // 'slow', 'normal', 'fast'
    announcementIndex: 0,
    showTimer: true,
    autoAdvanceProperties: false,
    marketEventQueue: []
  }),

  getters: {
    currentProperty: (state) => {
      const gameStore = useGameStore()
      if (!gameStore.session) return null
      return gameStore.session.properties[state.currentPropertyIndex]
    },
    
    currentPropertyBids: (state) => {
      const gameStore = useGameStore()
      if (!gameStore.session || !state.currentProperty) return []
      return gameStore.getPropertyBids(state.currentProperty.id)
    },
    
    topBid: (state) => {
      const bids = state.currentPropertyBids
      return bids.length > 0 ? bids[0] : null
    },
    
    canTransitionToPhase: () => {
      return (targetPhase) => {
        const gameStore = useGameStore()
        if (!gameStore.session) return false
        
        const phases = ['LOBBY', 'PREVIEW', 'ANNOUNCEMENT', 'BANKING', 'BIDDING', 'REDEMPTION', 'COMPLETE']
        const currentIndex = phases.indexOf(gameStore.session.currentPhase)
        const targetIndex = phases.indexOf(targetPhase)
        
        // Can always go to next phase or go back if moderator
        return targetIndex === currentIndex + 1 || gameStore.isModeratorView
      }
    }
  },

  actions: {
    initializeModerator() {
      this.isModeratorView = true
      const gameStore = useGameStore()
      gameStore.isModeratorView = true
      this.loadModeratorSettings()
    },
    
    transitionToPhase(phase) {
      const gameStore = useGameStore()
      const success = gameStore.transitionPhase(phase)
      
      if (success) {
        // Reset certain states on phase change
        if (phase === 'BIDDING') {
          this.currentPropertyIndex = 0
          this.pendingVerification = false
        }
        
        this.saveModeratorSettings()
      }
      
      return success
    },
    
    // Quick bid entry for moderator
    selectStudentForBid(studentId) {
      this.selectedStudentForBid = studentId
    },
    
    setQuickBidAmount(amount) {
      this.quickBidAmount = amount
    },
    
    recordQuickBid() {
      if (!this.selectedStudentForBid || !this.quickBidAmount || !this.currentProperty) {
        return false
      }
      
      const gameStore = useGameStore()
      const success = gameStore.placeBid(
        this.currentProperty.id,
        this.selectedStudentForBid,
        this.quickBidAmount
      )
      
      if (success) {
        // Auto-increment bid for next entry
        this.quickBidAmount += 1000
        this.saveModeratorSettings()
      }
      
      return success
    },
    
    // Auction control
    goingOnce() {
      this.pendingVerification = true
      console.log('Going once...')
      
      // Could add sound effect or visual indicator
      if (this.autoAdvanceProperties) {
        setTimeout(() => this.goingTwice(), 2000)
      }
    },
    
    goingTwice() {
      if (!this.pendingVerification) return
      console.log('Going twice...')
      
      if (this.autoAdvanceProperties) {
        setTimeout(() => this.sold(), 2000)
      }
    },
    
    sold() {
      if (!this.topBid || !this.currentProperty) return false
      
      const gameStore = useGameStore()
      const success = gameStore.finalizeSale(
        this.currentProperty.id,
        this.topBid.studentId,
        this.topBid.amount
      )
      
      if (success) {
        this.pendingVerification = false
        
        // Auto-advance to next property
        if (this.autoAdvanceProperties) {
          setTimeout(() => this.nextProperty(), 1500)
        }
        
        this.saveModeratorSettings()
      }
      
      return success
    },
    
    cancelSale() {
      this.pendingVerification = false
    },
    
    nextProperty() {
      const gameStore = useGameStore()
      if (!gameStore.session) return
      
      const maxIndex = gameStore.session.properties.length - 1
      if (this.currentPropertyIndex < maxIndex) {
        this.currentPropertyIndex++
        gameStore.session.currentPropertyIndex = this.currentPropertyIndex
        this.pendingVerification = false
        gameStore.saveToLocalStorage()
        this.saveModeratorSettings()
      } else {
        // All properties done, move to next phase
        this.transitionToPhase('REDEMPTION')
      }
    },
    
    previousProperty() {
      if (this.currentPropertyIndex > 0) {
        this.currentPropertyIndex--
        const gameStore = useGameStore()
        if (gameStore.session) {
          gameStore.session.currentPropertyIndex = this.currentPropertyIndex
          gameStore.saveToLocalStorage()
        }
        this.pendingVerification = false
        this.saveModeratorSettings()
      }
    },
    
    jumpToProperty(index) {
      const gameStore = useGameStore()
      if (!gameStore.session) return
      
      const maxIndex = gameStore.session.properties.length - 1
      if (index >= 0 && index <= maxIndex) {
        this.currentPropertyIndex = index
        gameStore.session.currentPropertyIndex = index
        this.pendingVerification = false
        gameStore.saveToLocalStorage()
        this.saveModeratorSettings()
      }
    },
    
    // Market events
    triggerMarketEvent(type) {
      const events = {
        'FACTORY_CLOSING': {
          impact: -20,
          cities: ['Detroit', 'Warren', 'Taylor'],
          message: 'Major factory announces closure - property values drop in affected areas!'
        },
        'NEW_DEVELOPMENT': {
          impact: 15,
          cities: ['Novi', 'Northville', 'Livonia'],
          message: 'New tech campus announced - surrounding property values increase!'
        },
        'CRIME_REDUCTION': {
          impact: 10,
          cities: ['Detroit', 'Redford'],
          message: 'Crime rates drop significantly - property values stabilize!'
        },
        'SCHOOL_IMPROVEMENT': {
          impact: 12,
          cities: ['Royal Oak', 'Livonia', 'Novi'],
          message: 'School districts receive excellence awards - family home values rise!'
        },
        'INFRASTRUCTURE': {
          impact: 8,
          cities: ['Warren', 'Taylor', 'Redford'],
          message: 'Major infrastructure improvements announced - accessibility improves!'
        }
      }
      
      const event = events[type]
      if (!event) return
      
      const gameStore = useGameStore()
      gameStore.triggerMarketEvent(type, event.impact, event.cities)
      
      // Add to queue for display
      this.marketEventQueue.push({
        ...event,
        type,
        timestamp: Date.now()
      })
      
      // Remove from queue after 5 seconds
      setTimeout(() => {
        this.marketEventQueue = this.marketEventQueue.filter(e => e.type !== type)
      }, 5000)
      
      this.saveModeratorSettings()
      
      return event.message
    },
    
    // Settings
    toggleHotkeys() {
      this.hotkeysEnabled = !this.hotkeysEnabled
      this.saveModeratorSettings()
    },
    
    setAuctionSpeed(speed) {
      this.auctionSpeed = speed
      this.saveModeratorSettings()
    },
    
    toggleTimer() {
      this.showTimer = !this.showTimer
      this.saveModeratorSettings()
    },
    
    toggleAutoAdvance() {
      this.autoAdvanceProperties = !this.autoAdvanceProperties
      this.saveModeratorSettings()
    },
    
    // Keyboard shortcuts
    handleHotkey(event) {
      if (!this.hotkeysEnabled) return
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
      
      const key = event.key.toLowerCase()
      const gameStore = useGameStore()
      
      switch(key) {
        case 'g':
          this.goingOnce()
          break
        case 'w':
          this.goingTwice()
          break
        case 's':
          this.sold()
          break
        case 'n':
          this.nextProperty()
          break
        case 'p':
          this.previousProperty()
          break
        case 'enter':
          if (this.selectedStudentForBid && this.quickBidAmount) {
            this.recordQuickBid()
          }
          break
        case 'escape':
          this.cancelSale()
          break
        // Number keys for quick student selection
        default:
          if (key >= '1' && key <= '9') {
            const paddleNumber = parseInt(key)
            const student = gameStore.studentsArray.find(s => s.paddleNumber === paddleNumber)
            if (student) {
              this.selectStudentForBid(student.id)
            }
          }
      }
    },
    
    saveModeratorSettings() {
      const settings = {
        hotkeysEnabled: this.hotkeysEnabled,
        auctionSpeed: this.auctionSpeed,
        showTimer: this.showTimer,
        autoAdvanceProperties: this.autoAdvanceProperties,
        currentPropertyIndex: this.currentPropertyIndex
      }
      
      localStorage.setItem('moderator_settings', JSON.stringify(settings))
    },
    
    loadModeratorSettings() {
      const stored = localStorage.getItem('moderator_settings')
      if (stored) {
        const settings = JSON.parse(stored)
        this.hotkeysEnabled = settings.hotkeysEnabled ?? true
        this.auctionSpeed = settings.auctionSpeed || 'normal'
        this.showTimer = settings.showTimer ?? true
        this.autoAdvanceProperties = settings.autoAdvanceProperties ?? false
        this.currentPropertyIndex = settings.currentPropertyIndex || 0
      }
    },
    
    clearModeratorData() {
      this.isModeratorView = false
      this.currentPropertyIndex = 0
      this.pendingVerification = false
      this.selectedStudentForBid = null
      this.quickBidAmount = 0
      this.marketEventQueue = []
      localStorage.removeItem('moderator_settings')
    }
  }
})