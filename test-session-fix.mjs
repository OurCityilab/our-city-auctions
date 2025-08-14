#!/usr/bin/env node

// Test script to verify session creation and joining
import puppeteer from 'puppeteer';

console.log('Testing Wayne County Auction Game Session Fix...\n');

async function testSessionFix() {
  const browser = await puppeteer.launch({
    headless: false, // Set to true for CI/automated testing
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      if (msg.type() === 'log') {
        console.log('Browser console:', msg.text());
      }
    });

    console.log('1. Opening landing page...');
    await page.goto('http://localhost:3009');
    await page.waitForSelector('h1');
    
    // Test 1: Check if input fields accept text
    console.log('\n2. Testing input fields...');
    
    // Type in the join code field
    const joinCodeInput = await page.$('input[placeholder="Session code"]');
    await joinCodeInput.click();
    await joinCodeInput.type('WAYNE-F24');
    
    // Check if text is visible
    const joinCodeValue = await page.evaluate(() => {
      const input = document.querySelector('input[placeholder="Session code"]');
      return input ? input.value : null;
    });
    console.log('   Join code field value:', joinCodeValue);
    
    // Type in the student name field
    const nameInput = await page.$('input[placeholder="Your name"]');
    await nameInput.click();
    await nameInput.type('Test Student');
    
    // Check if text is visible
    const nameValue = await page.evaluate(() => {
      const input = document.querySelector('input[placeholder="Your name"]');
      return input ? input.value : null;
    });
    console.log('   Name field value:', nameValue);
    
    // Test 2: Try to join session
    console.log('\n3. Attempting to join WAYNE-F24 session...');
    
    // Click join button
    const joinButton = await page.$('button:has-text("Join as Student")');
    await joinButton.click();
    
    // Wait for navigation or error
    await page.waitForTimeout(2000);
    
    // Check current URL
    const currentUrl = page.url();
    console.log('   Current URL:', currentUrl);
    
    // Check for error message
    const errorMessage = await page.evaluate(() => {
      const errorDiv = document.querySelector('.bg-red-50');
      return errorDiv ? errorDiv.textContent : null;
    });
    
    if (errorMessage) {
      console.log('   Error displayed:', errorMessage);
    } else if (currentUrl.includes('/student')) {
      console.log('   ✓ Successfully navigated to student page!');
      
      // Check if student dashboard loaded
      await page.waitForTimeout(2000);
      const dashboardExists = await page.evaluate(() => {
        return document.querySelector('.student-dashboard') !== null ||
               document.querySelector('[class*="StudentDashboard"]') !== null;
      });
      console.log('   Student dashboard loaded:', dashboardExists ? '✓' : '✗');
    }
    
    // Test 3: Check session in localStorage
    console.log('\n4. Checking session storage...');
    const sessionData = await page.evaluate(() => {
      const currentSession = localStorage.getItem('auction_current_session');
      const sessionKeys = Object.keys(localStorage).filter(k => k.startsWith('auction_session_'));
      return {
        currentSession,
        allSessions: sessionKeys.map(k => k.replace('auction_session_', ''))
      };
    });
    console.log('   Current session code:', sessionData.currentSession);
    console.log('   All stored sessions:', sessionData.allSessions);
    
    // Test 4: Run debug functions
    console.log('\n5. Running debug utilities...');
    const debugResult = await page.evaluate(() => {
      // Check if debug functions are available
      if (typeof debugSession === 'function') {
        return debugSession();
      }
      return 'Debug function not available';
    });
    console.log('   Debug result:', debugResult);
    
    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
testSessionFix().catch(console.error);