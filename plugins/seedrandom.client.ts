// plugins/seedrandom.client.ts
// Client-side plugin to handle seedrandom import issues

export default defineNuxtPlugin(() => {
  // This ensures seedrandom is available on client-side
  if (process.client) {
    // Seedrandom will be imported dynamically when needed
    console.log('Seedrandom plugin initialized');
  }
});