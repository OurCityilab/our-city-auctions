// utils/underwritingCalculations.js

/**
 * Underwriting calculation utilities for property analysis
 * Includes LTV calculations, comps analysis, and maximum bid recommendations
 */

/**
 * Calculate Loan-to-Value ratio
 * @param {number} totalDebt - Total outstanding debt on property
 * @param {number} marketValue - Estimated market value
 * @returns {number} LTV percentage
 */
export function calculateLTV(totalDebt, marketValue) {
  if (!marketValue || marketValue === 0) return 0;
  return ((totalDebt / marketValue) * 100).toFixed(1);
}

/**
 * Calculate estimated equity
 * @param {number} marketValue - Estimated market value
 * @param {number} totalDebt - Total outstanding debt
 * @returns {number} Equity amount
 */
export function calculateEquity(marketValue, totalDebt) {
  return Math.max(0, marketValue - totalDebt);
}

/**
 * Get LTV risk assessment
 * @param {number} ltv - Loan-to-Value ratio
 * @returns {Object} Risk assessment with color and message
 */
export function getLTVAssessment(ltv) {
  if (ltv > 100) {
    return {
      risk: 'EXTREME',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      message: '⚠️ Property is underwater - debt exceeds value! Avoid unless strategic.',
      maxBidMultiplier: 0 // Don't bid
    };
  }
  if (ltv > 90) {
    return {
      risk: 'VERY_HIGH',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      message: '⚠️ Very high LTV - minimal equity, extreme caution advised',
      maxBidMultiplier: 0.3 // Very conservative
    };
  }
  if (ltv > 80) {
    return {
      risk: 'HIGH',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      message: '⚠️ High LTV - limited equity cushion, higher risk',
      maxBidMultiplier: 0.5
    };
  }
  if (ltv > 60) {
    return {
      risk: 'MODERATE',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      message: '✓ Moderate LTV - reasonable equity cushion',
      maxBidMultiplier: 0.7
    };
  }
  return {
    risk: 'LOW',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    message: '✓ Low LTV - significant equity, excellent opportunity!',
    maxBidMultiplier: 0.8
  };
}

/**
 * Calculate average price from comparables
 * @param {Array} comparables - Array of comparable sales
 * @returns {Object} Comps statistics
 */
export function analyzeComparables(comparables) {
  if (!comparables || comparables.length === 0) {
    return {
      average: 0,
      median: 0,
      min: 0,
      max: 0,
      avgPricePerSqft: 0,
      confidence: 'LOW'
    };
  }
  
  const prices = comparables.map(c => c.soldPrice);
  const pricesPerSqft = comparables.map(c => c.pricePerSqft);
  
  // Sort for median calculation
  prices.sort((a, b) => a - b);
  
  const average = prices.reduce((sum, p) => sum + p, 0) / prices.length;
  const median = prices[Math.floor(prices.length / 2)];
  const min = prices[0];
  const max = prices[prices.length - 1];
  const avgPricePerSqft = pricesPerSqft.reduce((sum, p) => sum + p, 0) / pricesPerSqft.length;
  
  // Determine confidence based on variance
  const variance = max - min;
  const variancePercent = (variance / average) * 100;
  let confidence;
  
  if (variancePercent < 15) {
    confidence = 'HIGH';
  } else if (variancePercent < 25) {
    confidence = 'MEDIUM';
  } else {
    confidence = 'LOW';
  }
  
  return {
    average: Math.round(average),
    median: Math.round(median),
    min,
    max,
    avgPricePerSqft: Math.round(avgPricePerSqft),
    confidence,
    variancePercent: variancePercent.toFixed(1)
  };
}

/**
 * Compare student's estimate to comps average
 * @param {number} studentEstimate - Student's market value estimate
 * @param {number} compsAverage - Average from comparables
 * @returns {Object} Accuracy assessment
 */
export function assessEstimateAccuracy(studentEstimate, compsAverage) {
  if (!studentEstimate || !compsAverage) {
    return {
      percentDiff: 0,
      accuracy: 'UNKNOWN',
      message: 'Enter an estimate to see accuracy'
    };
  }
  
  const percentDiff = ((studentEstimate - compsAverage) / compsAverage) * 100;
  const absDiff = Math.abs(percentDiff);
  
  if (absDiff <= 5) {
    return {
      percentDiff: percentDiff.toFixed(1),
      accuracy: 'EXCELLENT',
      color: 'text-green-600',
      message: `Excellent! Within ${absDiff.toFixed(1)}% of comps average`
    };
  }
  if (absDiff <= 10) {
    return {
      percentDiff: percentDiff.toFixed(1),
      accuracy: 'GOOD',
      color: 'text-blue-600',
      message: `Good estimate, ${absDiff.toFixed(1)}% ${percentDiff > 0 ? 'above' : 'below'} comps`
    };
  }
  if (absDiff <= 20) {
    return {
      percentDiff: percentDiff.toFixed(1),
      accuracy: 'FAIR',
      color: 'text-yellow-600',
      message: `Fair estimate, ${absDiff.toFixed(1)}% ${percentDiff > 0 ? 'above' : 'below'} comps`
    };
  }
  return {
    percentDiff: percentDiff.toFixed(1),
    accuracy: 'POOR',
    color: 'text-red-600',
    message: `Review comps - ${absDiff.toFixed(1)}% ${percentDiff > 0 ? 'above' : 'below'} average`
  };
}

/**
 * Calculate maximum profitable bid
 * @param {Object} params - Calculation parameters
 * @returns {Object} Maximum bid recommendation
 */
export function calculateMaxBid(params) {
  const {
    marketValue,
    renovationCost = 0,
    targetProfit = 0.2, // 20% default
    transactionCosts = 0.1, // 10% default
    holdingCosts = 0.06, // 6% for 6 months
    ltv = 0
  } = params;
  
  if (!marketValue || marketValue === 0) {
    return {
      maxBid: 0,
      breakdown: {},
      recommendation: 'Need market value estimate'
    };
  }
  
  // Get LTV-based risk adjustment
  const ltvAssessment = getLTVAssessment(ltv);
  const riskMultiplier = ltvAssessment.maxBidMultiplier;
  
  // Calculate costs
  const targetProfitAmount = marketValue * targetProfit;
  const transactionCostAmount = marketValue * transactionCosts;
  const holdingCostAmount = marketValue * holdingCosts;
  
  // Maximum bid calculation
  const maxBidBeforeRisk = marketValue - targetProfitAmount - renovationCost - 
                           transactionCostAmount - holdingCostAmount;
  const maxBid = Math.max(0, Math.floor(maxBidBeforeRisk * riskMultiplier));
  
  // Determine recommendation
  let recommendation;
  if (maxBid <= 0) {
    recommendation = 'DO NOT BID - No profit potential at any price';
  } else if (riskMultiplier < 0.5) {
    recommendation = `CAUTION - High risk property, max bid: $${maxBid.toLocaleString()}`;
  } else {
    recommendation = `Recommended max bid: $${maxBid.toLocaleString()}`;
  }
  
  return {
    maxBid,
    maxBidBeforeRisk: Math.floor(maxBidBeforeRisk),
    riskMultiplier,
    breakdown: {
      marketValue,
      targetProfit: targetProfitAmount,
      renovationCost,
      transactionCosts: transactionCostAmount,
      holdingCosts: holdingCostAmount
    },
    recommendation,
    ltvRisk: ltvAssessment.risk
  };
}

/**
 * Calculate total debt from all liens
 * @param {Object} property - Property object with lien information
 * @returns {number} Total outstanding debt
 */
export function calculateTotalDebt(property) {
  const firstLien = property.firstLienAmount || property.primaryLien || 0;
  const secondLien = property.secondLienAmount || property.secondaryLien || 0;
  const thirdLien = property.thirdLienAmount || property.taxLien || 0;
  
  return firstLien + secondLien + thirdLien;
}

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Calculate price per square foot
 * @param {number} price - Property price
 * @param {number} sqft - Square footage
 * @returns {number} Price per square foot
 */
export function calculatePricePerSqft(price, sqft) {
  if (!sqft || sqft === 0) return 0;
  return Math.round(price / sqft);
}