// Debug utility for session management issues
export function debugSession() {
  if (typeof window !== 'undefined') {
    const gameStore = useGameStore()
    
    console.log('=== SESSION DEBUG INFO ===')
    console.log('Current session:', gameStore.session)
    console.log('Is Moderator View:', gameStore.isModeratorView)
    console.log('Current Student ID:', gameStore.currentStudentId)
    console.log('Current Student:', gameStore.currentStudent)
    
    // Check localStorage
    const currentSessionCode = localStorage.getItem('auction_current_session')
    console.log('Current session code in localStorage:', currentSessionCode)
    
    if (currentSessionCode) {
      const sessionData = localStorage.getItem(`auction_session_${currentSessionCode}`)
      console.log('Session data exists in localStorage:', !!sessionData)
      if (sessionData) {
        try {
          const parsed = JSON.parse(sessionData)
          console.log('Session phase:', parsed.currentPhase)
          console.log('Number of students:', parsed.students?.length || 0)
          console.log('Number of properties:', parsed.properties?.length || 0)
        } catch (e) {
          console.error('Failed to parse session data:', e)
        }
      }
    }
    
    // List all auction sessions in localStorage
    const allKeys = Object.keys(localStorage)
    const sessionKeys = allKeys.filter(key => key.startsWith('auction_session_'))
    console.log('All stored sessions:', sessionKeys.map(k => k.replace('auction_session_', '')))
    
    console.log('========================')
    
    return {
      session: gameStore.session,
      currentStudent: gameStore.currentStudent,
      storageData: {
        currentCode: currentSessionCode,
        allSessions: sessionKeys
      }
    }
  }
}

// Test session creation and joining
export function testSessionFlow(code = 'TEST123') {
  if (typeof window !== 'undefined') {
    const gameStore = useGameStore()
    
    console.log('=== TESTING SESSION FLOW ===')
    console.log(`Testing with code: ${code}`)
    
    // Step 1: Create session
    console.log('1. Creating session...')
    const session = gameStore.createSession(code, 'test_moderator')
    console.log('   Session created:', !!session)
    console.log('   Properties generated:', session?.properties?.length || 0)
    
    // Step 2: Try to load it
    console.log('2. Loading session...')
    const loaded = gameStore.loadSession(code)
    console.log('   Session loaded:', loaded)
    
    // Step 3: Join as student
    console.log('3. Joining as student...')
    const student = gameStore.joinSession(code, 'Test Student')
    console.log('   Student joined:', !!student)
    console.log('   Student ID:', student?.id)
    console.log('   Paddle number:', student?.paddleNumber)
    
    // Step 4: Check session state
    console.log('4. Final session state:')
    console.log('   Students in session:', gameStore.session?.students?.size || 0)
    console.log('   Current phase:', gameStore.session?.currentPhase)
    
    console.log('============================')
    
    return {
      success: !!session && loaded && !!student,
      session,
      student
    }
  }
}

// Fix for input field visibility
export function checkInputStyles() {
  if (typeof window !== 'undefined') {
    console.log('=== CHECKING INPUT STYLES ===')
    
    const inputs = document.querySelectorAll('input[type="text"]')
    inputs.forEach((input, index) => {
      const styles = window.getComputedStyle(input)
      console.log(`Input ${index + 1}:`)
      console.log('  Color:', styles.color)
      console.log('  Background:', styles.backgroundColor)
      console.log('  Opacity:', styles.opacity)
      console.log('  Visibility:', styles.visibility)
      console.log('  Display:', styles.display)
      console.log('  Font size:', styles.fontSize)
      
      // Check if text color matches background
      if (styles.color === styles.backgroundColor) {
        console.warn('  ⚠️ Text color matches background!')
      }
      
      // Check for transparent or invisible text
      if (styles.opacity === '0' || styles.visibility === 'hidden' || styles.display === 'none') {
        console.warn('  ⚠️ Input is invisible!')
      }
      
      // Check v-model binding
      const vueInstance = input.__vueParentComponent
      if (vueInstance) {
        console.log('  Vue binding detected ✓')
      } else {
        console.log('  No Vue binding detected')
      }
    })
    
    console.log('=============================')
  }
}

// Auto-fix common issues
export function autoFixSession(code = 'WAYNE-F24') {
  if (typeof window !== 'undefined') {
    const gameStore = useGameStore()
    
    console.log(`=== AUTO-FIXING SESSION ${code} ===`)
    
    // Check if session exists
    const exists = gameStore.loadSession(code)
    
    if (!exists) {
      console.log('Session does not exist, creating...')
      const session = gameStore.createSession(code, 'moderator_autofix')
      console.log('Session created:', !!session)
      console.log('Properties:', session?.properties?.length || 0)
      
      // Add a test student
      const student = gameStore.joinSession(code, 'Test Student')
      console.log('Test student added:', !!student)
      
      return { created: true, session, student }
    } else {
      console.log('Session already exists')
      console.log('Students:', gameStore.session?.students?.size || 0)
      console.log('Phase:', gameStore.session?.currentPhase)
      
      return { created: false, session: gameStore.session }
    }
  }
}