// utils/profitCalculations.js

/**
 * Profit calculation utilities for the Redemption phase
 * Calculates ROI based on different exit strategies
 */

/**
 * Get renovation cost based on property condition
 * @param {Object} property - The property object
 * @returns {number} Estimated renovation cost
 */
export function getRenovationCost(property) {
  const costs = {
    'MOVE_IN_READY': 5000,
    'LIGHT_REHAB': 15000,
    'MODERATE_REHAB': 35000,
    'HEAVY_REHAB': 60000,
    'TEARDOWN': 100000
  }
  
  // Add hidden damage costs if discovered
  let baseCost = costs[property.renovationLevel] || 25000
  if (property.hiddenDamage) {
    baseCost += property.hiddenDamage
  }
  
  return baseCost
}

/**
 * Calculate profit for Fix & Flip strategy
 * @param {Object} property - The property with winningBid
 * @returns {Object} Profit breakdown
 */
export function calculateFlipProfit(property) {
  const purchasePrice = property.winningBid || 0
  const renovationCost = getRenovationCost(property)
  const holdingCosts = purchasePrice * 0.06 // 6 months at 1% per month
  const sellingCosts = property.marketValue * 0.08 // 8% (realtor + closing)
  
  const totalInvestment = purchasePrice + renovationCost + holdingCosts
  const netProceeds = property.marketValue - sellingCosts
  const profit = netProceeds - totalInvestment
  const roi = totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0
  
  return {
    purchasePrice,
    renovationCost,
    holdingCosts,
    sellingCosts,
    totalInvestment,
    afterRepairValue: property.marketValue,
    netProceeds,
    profit,
    roi: roi.toFixed(1)
  }
}

/**
 * Calculate ROI for Buy & Hold rental strategy
 * @param {Object} property - The property with winningBid
 * @returns {Object} First year rental ROI
 */
export function calculateRentalROI(property) {
  const purchasePrice = property.winningBid || 0
  const renovationCost = getRenovationCost(property)
  
  // Use 1% rule for monthly rent estimation
  const monthlyRent = property.marketValue * 0.01
  const annualRent = monthlyRent * 12
  
  // Operating expenses (40% rule)
  const operatingExpenses = annualRent * 0.4
  const netOperatingIncome = annualRent - operatingExpenses
  
  const totalInvestment = purchasePrice + renovationCost
  const cashOnCashReturn = totalInvestment > 0 ? (netOperatingIncome / totalInvestment) * 100 : 0
  
  return {
    purchasePrice,
    renovationCost,
    totalInvestment,
    monthlyRent: Math.round(monthlyRent),
    annualRent: Math.round(annualRent),
    operatingExpenses: Math.round(operatingExpenses),
    netOperatingIncome: Math.round(netOperatingIncome),
    profit: netOperatingIncome, // First year NOI
    roi: cashOnCashReturn.toFixed(1)
  }
}

/**
 * Calculate profit for wholesale assignment
 * @param {Object} property - The property with winningBid
 * @returns {Object} Wholesale profit breakdown
 */
export function calculateWholesaleProfit(property) {
  const purchasePrice = property.winningBid || 0
  
  // Wholesale to another investor at 10% markup
  const wholesalePrice = purchasePrice * 1.1
  const assignmentFee = purchasePrice * 0.02 // 2% assignment fee
  
  const profit = wholesalePrice - purchasePrice - assignmentFee
  const roi = purchasePrice > 0 ? (profit / purchasePrice) * 100 : 0
  
  return {
    purchasePrice,
    wholesalePrice: Math.round(wholesalePrice),
    assignmentFee: Math.round(assignmentFee),
    profit: Math.round(profit),
    roi: roi.toFixed(1)
  }
}

/**
 * Get negotiation cost/benefit
 * @param {string} negotiationType - Type of negotiation outcome
 * @returns {Object} Cost or income from negotiation
 */
export function getNegotiationImpact(negotiationType) {
  const impacts = {
    'CASH_FOR_KEYS': { cost: 4000, income: 0, description: 'Cash for Keys payment' },
    'EVICTION': { cost: 7500, income: 0, description: 'Eviction costs' },
    'RENT_BACK': { cost: 0, income: 1200, description: 'Monthly rent income' },
    'LAND_CONTRACT': { multiplier: 1.15, description: '15% premium on sale' },
    'QUICK_MOVE': { cost: 0, income: 0, description: 'No additional cost' }
  }
  
  return impacts[negotiationType] || { cost: 0, income: 0 }
}

/**
 * Calculate overall property profit based on exit strategy
 * @param {Object} property - Property with winningBid, exitStrategy, and negotiationOutcome
 * @returns {Object} Complete profit calculation
 */
export function calculatePropertyProfit(property) {
  if (!property.exitStrategy) {
    return { profit: 0, roi: '0.0' }
  }
  
  let calculation
  
  switch (property.exitStrategy) {
    case 'FLIP':
      calculation = calculateFlipProfit(property)
      break
    case 'RENTAL':
      calculation = calculateRentalROI(property)
      break
    case 'WHOLESALE':
      calculation = calculateWholesaleProfit(property)
      break
    default:
      return { profit: 0, roi: '0.0' }
  }
  
  // Apply negotiation impact if applicable
  if (property.negotiationOutcome && property.occupant) {
    const impact = getNegotiationImpact(property.negotiationOutcome)
    
    if (impact.cost) {
      calculation.profit -= impact.cost
      calculation.negotiationCost = impact.cost
    }
    
    if (impact.income) {
      calculation.profit += impact.income * 12 // Annual income
      calculation.additionalIncome = impact.income * 12
    }
    
    if (impact.multiplier && property.exitStrategy === 'FLIP') {
      const bonus = property.marketValue * (impact.multiplier - 1)
      calculation.profit += bonus
      calculation.landContractBonus = bonus
    }
    
    // Recalculate ROI
    if (calculation.totalInvestment > 0) {
      calculation.roi = ((calculation.profit / calculation.totalInvestment) * 100).toFixed(1)
    }
  }
  
  return calculation
}

/**
 * Get performance grade based on overall ROI
 * @param {number} roi - Overall return on investment percentage
 * @returns {string} Letter grade
 */
export function getPerformanceGrade(roi) {
  if (roi >= 25) return 'A+'
  if (roi >= 20) return 'A'
  if (roi >= 15) return 'B+'
  if (roi >= 10) return 'B'
  if (roi >= 5) return 'C+'
  if (roi >= 0) return 'C'
  if (roi >= -5) return 'D'
  return 'F'
}

/**
 * Get performance feedback message
 * @param {number} roi - Overall return on investment percentage
 * @returns {string} Feedback message
 */
export function getPerformanceFeedback(roi) {
  if (roi >= 25) return 'Outstanding performance! You are a master investor!'
  if (roi >= 15) return 'Great job! Strong returns on your investments.'
  if (roi >= 5) return 'Good work! Positive returns achieved.'
  if (roi >= 0) return 'Break-even performance. Room for improvement.'
  return 'Learning experience. Review your strategy for next time.'
}

/**
 * Calculate portfolio summary
 * @param {Array} properties - Array of properties with exit strategies
 * @returns {Object} Portfolio metrics
 */
export function calculatePortfolioSummary(properties) {
  let totalInvested = 0
  let totalProfit = 0
  let totalMarketValue = 0
  
  properties.forEach(property => {
    const calc = calculatePropertyProfit(property)
    totalInvested += (property.winningBid || 0) + getRenovationCost(property)
    totalProfit += calc.profit || 0
    totalMarketValue += property.marketValue || 0
  })
  
  const overallROI = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0
  
  return {
    propertyCount: properties.length,
    totalInvested,
    totalProfit,
    totalMarketValue,
    overallROI: overallROI.toFixed(1),
    grade: getPerformanceGrade(overallROI),
    feedback: getPerformanceFeedback(overallROI)
  }
}