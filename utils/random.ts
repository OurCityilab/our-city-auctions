// utils/random.ts
// Wrapper for seedrandom to handle import issues

let seedrandomLib: any;

// Dynamic import to handle different module systems
export async function getSeedrandom() {
  if (!seedrandomLib) {
    try {
      // Try ES module import first
      const module = await import('seedrandom');
      seedrandomLib = module.default || module;
    } catch (e) {
      // Fallback to require for CommonJS
      seedrandomLib = require('seedrandom');
    }
  }
  return seedrandomLib;
}

// Synchronous version for immediate use
export function createSeededRandom(seed: string) {
  // Use a simple deterministic random for initial load
  // This will be replaced with real seedrandom when available
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Simple linear congruential generator
  let localSeed = Math.abs(hash);
  
  return function() {
    localSeed = (localSeed * 1103515245 + 12345) & 0x7fffffff;
    return localSeed / 0x7fffffff;
  };
}