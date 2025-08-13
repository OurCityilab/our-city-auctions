# Wayne County Auction Game - Startup Guide

## Quick Start (2 Minutes)

### For Instructors - Start a Session
1. Open browser and go to game URL
2. Click **"Create New Session"**
3. Note the **Session Code** (e.g., WAYNE-F24)
4. Open **Moderator Console** in one tab
5. Open **Projection Display** in another tab
6. Share session code with students

### For Students - Join a Session
1. Go to game URL on your device
2. Enter the **Session Code** from instructor
3. Enter your **Name**
4. Click **"Join as Student"**
5. Wait for instructor to begin

## Complete Setup Guide

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Deployment Options](#deployment-options)
3. [First-Time Setup](#first-time-setup)
4. [Running Your First Session](#running-your-first-session)
5. [Configuration Options](#configuration-options)
6. [Troubleshooting](#troubleshooting)
7. [Advanced Setup](#advanced-setup)

## System Requirements

### Minimum Requirements
- **Internet**: Stable connection (WiFi or Ethernet)
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Device**: Any device with a modern browser
- **Screen**: 1024x768 resolution or higher
- **JavaScript**: Must be enabled

### Recommended Setup
- **Instructor**: Laptop/desktop with dual monitors
- **Students**: Tablets or laptops
- **Classroom**: Projector or large display
- **Network**: Dedicated WiFi for class

### Optimal Configuration
```
Instructor Station:
├── Monitor 1: Moderator Console
├── Monitor 2: Extended to Projector
│   └── Projection Display (Public View)
└── Device: Instructor controls

Student Devices:
└── Individual tablets/laptops with game dashboard
```

## Deployment Options

### Option 1: Cloud Hosted (Recommended)
**URL**: `https://our-city-auctions.vercel.app`
- No installation required
- Always up-to-date
- Accessible from anywhere
- Automatic backups

### Option 2: Self-Hosted
For schools with specific requirements:

1. **Clone Repository**
```bash
git clone https://github.com/ourcityilab/our-city-auctions.git
cd our-city-auctions
```

2. **Install Dependencies**
```bash
npm install
```

3. **Run Locally**
```bash
npm run dev
# Access at http://localhost:3000
```

4. **Deploy to School Server**
```bash
npm run build
# Deploy .output folder to server
```

### Option 3: District Network
For IT administrators:
- Docker container available
- Can run on intranet
- No external internet required
- Contact for enterprise setup

## First-Time Setup

### Pre-Session Checklist

#### 1. Technical Verification (Day Before)
- [ ] Test game URL access
- [ ] Verify projector connection
- [ ] Check WiFi stability
- [ ] Test on student devices
- [ ] Ensure browser compatibility

#### 2. Content Preparation
- [ ] Review instructor guide
- [ ] Prepare session settings
- [ ] Print backup materials (optional)
- [ ] Prepare discussion questions
- [ ] Set learning objectives

#### 3. Classroom Setup (30 Minutes Before)
- [ ] Connect instructor computer to projector
- [ ] Open required browser tabs
- [ ] Test audio if using microphone
- [ ] Arrange student seating for visibility
- [ ] Write WiFi info on board

### Browser Setup

#### Instructor Browser Tabs
```
Tab 1: Game Home Page
  └── For creating session

Tab 2: Moderator Console
  └── URL: /moderator?code=YOUR_CODE
  └── Controls game phases

Tab 3: Projection Display  
  └── URL: /projection?code=YOUR_CODE
  └── Show on projector

Tab 4: Documentation (optional)
  └── Keep guide handy
```

#### Recommended Browser Settings
- Enable popups for game site
- Allow cookies and localStorage
- Disable battery saver mode
- Turn off browser extensions that might interfere

## Running Your First Session

### Step 1: Create Session (Instructor)

1. **Navigate to Game**
   - Go to: `https://our-city-auctions.vercel.app`

2. **Create New Session**
   ```
   Click: "Create New Session"
   
   Settings:
   - Session Name: "Period 3 Economics"
   - Property Count: 20 (for first time)
   - Difficulty: Rookie
   - Starting Cash: $100,000
   ```

3. **Note Session Code**
   - System generates: `WAYNE-F24`
   - Write on board for students
   - Code expires after 24 hours

### Step 2: Setup Displays

1. **Open Moderator Console**
   ```
   URL: /moderator?code=WAYNE-F24
   
   Features Visible:
   - Student roster
   - Phase controls
   - Property list
   - Bidding interface
   ```

2. **Open Projection Display**
   ```
   URL: /projection?code=WAYNE-F24
   
   Shows to Class:
   - Current phase
   - Timer
   - Session code
   - Live auction data
   ```

3. **Arrange Windows**
   - Moderator Console on instructor screen
   - Projection Display on projector/TV
   - Keep both visible during game

### Step 3: Student Onboarding

1. **Students Navigate to Game**
   - URL: `https://our-city-auctions.vercel.app`

2. **Join Process**
   ```
   Students Enter:
   - Session Code: WAYNE-F24
   - Name: "Jane Smith"
   - Click: "Join as Student"
   ```

3. **Verify Connection**
   - Check moderator console
   - All students should appear
   - Assign paddle numbers automatically

### Step 4: Run Game Phases

1. **Start from Lobby**
   - Confirm all students connected
   - Brief introduction
   - Click "Start Preview Phase"

2. **Monitor Progress**
   - Watch student activity
   - Answer questions
   - Add drama with events

3. **Complete Session**
   - Review results
   - Export data (optional)
   - Discuss outcomes

## Configuration Options

### Session Settings

#### Basic Settings
```javascript
{
  "sessionName": "Economics 101",
  "sessionCode": "AUTO_GENERATED",
  "maxStudents": 30,
  "propertyCount": 50,
  "startingCash": 100000,
  "researchCredits": 30
}
```

#### Difficulty Levels

| Level | Properties | Research Credits | Market Events | Hidden Damage |
|-------|-----------|-----------------|---------------|--------------|
| **Rookie** | 20 | 40 | Few | Rare |
| **Professional** | 50 | 30 | Moderate | Some |
| **Expert** | 100 | 25 | Many | Common |

#### Phase Timing Options
```javascript
{
  "phases": {
    "LOBBY": null,        // Manual start
    "PREVIEW": 900,       // 15 minutes
    "ANNOUNCEMENT": 300,  // 5 minutes
    "BANKING": 600,       // 10 minutes
    "BIDDING": 1800,      // 30 minutes
    "REDEMPTION": 600,    // 10 minutes
    "COMPLETE": null      // Manual end
  }
}
```

### Custom Property Sets

#### Create Custom Properties
```javascript
// In propertyGenerator.ts
const customProperties = [
  {
    address: "Custom Property 1",
    city: "YourCity",
    openingBid: 25000,
    marketValue: 50000,
    // ... other properties
  }
];
```

#### Import Real Data
- Upload CSV with property data
- Match format requirements
- System generates auction properties

### Market Events Configuration

#### Standard Events
```javascript
const marketEvents = [
  {
    id: "factory_closing",
    title: "Major Factory Closing",
    impact: -0.15, // -15% to area
    duration: 300,  // 5 minutes
    neighborhoods: ["Corktown", "Southwest"]
  },
  {
    id: "new_development",
    title: "Tech Campus Announced",
    impact: 0.25,  // +25% to area
    duration: 300,
    neighborhoods: ["Downtown", "Midtown"]
  }
];
```

## Troubleshooting

### Common Issues and Solutions

#### Students Can't Connect
```
Problem: "Session not found" error
Solutions:
1. Verify correct session code
2. Check case sensitivity (WAYNE-F24)
3. Ensure session is active
4. Try incognito/private browsing
5. Clear browser cache
```

#### Projection Display Blank
```
Problem: Nothing showing on projector
Solutions:
1. Refresh projection page (F5)
2. Check URL parameters (?code=YOUR_CODE)
3. Verify projector input source
4. Try duplicate vs. extend display
5. Check browser zoom level (100%)
```

#### Game Freezes Mid-Auction
```
Problem: Interface stops responding
Solutions:
1. DON'T close tabs - data is saved
2. Refresh moderator console
3. Students refresh their dashboards
4. Resume from current phase
5. Check internet connection
```

#### Bidding Not Registering
```
Problem: Bids not appearing
Solutions:
1. Ensure in BIDDING phase
2. Check student has withdrawn cash
3. Verify paddle number assigned
4. Try manual entry in console
5. Check for browser console errors
```

### Network Issues

#### Slow Performance
```bash
Diagnostics:
1. Check network speed: speedtest.net
2. Reduce concurrent users
3. Close unnecessary tabs
4. Disable video streaming on network
5. Use ethernet for instructor station
```

#### Firewall Blocking
```
Required Ports/Domains:
- HTTPS (443)
- WebSocket (WSS)
- Domain: *.vercel.app
- Domain: github.com (for updates)
```

### Browser-Specific Issues

#### Chrome
- Enable JavaScript
- Allow cookies
- Disable aggressive ad blockers

#### Safari
- Disable "Prevent Cross-Site Tracking"
- Allow website data storage

#### Firefox
- Set Enhanced Tracking Protection to "Standard"
- Enable DOM Storage

## Advanced Setup

### Multi-Session Management

#### Running Parallel Sessions
```javascript
// Create multiple sessions for different classes
Session 1: ECON-101 (Period 1)
Session 2: ECON-102 (Period 2)
Session 3: ECON-ADV (Advanced Class)
```

#### Session Templates
Save and reuse configurations:
```javascript
// Save template
const template = {
  name: "Standard 50-Property Auction",
  settings: { /* ... */ },
  marketEvents: [ /* ... */ ]
};

// Load template for new session
createSessionFromTemplate(template);
```

### Data Export and Analytics

#### Export Session Data
```javascript
// After session completes
exportSessionData({
  format: 'CSV',
  include: [
    'studentPerformance',
    'propertyResults',
    'bidHistory',
    'negotiationOutcomes'
  ]
});
```

#### Generate Reports
- Student performance metrics
- Property ROI analysis
- Bidding pattern analysis
- Learning objective achievement

### Integration Options

#### LMS Integration
```javascript
// Canvas/Blackboard/Moodle
const lmsConfig = {
  endpoint: 'your-lms-api',
  courseId: 'ECON-101',
  assignmentId: 'auction-simulation',
  gradePassback: true
};
```

#### Google Classroom
- Share session links via Classroom
- Post results to stream
- Create assignment with game

### Customization

#### School Branding
```css
/* Custom CSS */
:root {
  --primary-color: #yourSchoolColor;
  --logo-url: url('/your-school-logo.png');
}
```

#### Local Properties
Replace Wayne County with your city:
1. Update property generator
2. Change location names
3. Adjust market values
4. Customize neighborhoods

## Best Practices

### Pre-Session
✅ Test everything day before
✅ Have backup plan ready
✅ Prepare discussion questions
✅ Set clear objectives
✅ Brief students on rules

### During Session
✅ Keep energy high
✅ Monitor all students
✅ Use market events strategically
✅ Pause for teaching moments
✅ Encourage participation

### Post-Session
✅ Save session data
✅ Debrief thoroughly
✅ Connect to curriculum
✅ Assign reflection
✅ Plan follow-up

## Support Resources

### Documentation
- [Instructor Guide](./INSTRUCTOR_GUIDE.md)
- [Student Guide](./STUDENT_GUIDE.md)
- [API Documentation](./docs/api.md)

### Video Tutorials
- [First Session Setup](https://youtube.com/...)
- [Advanced Features](https://youtube.com/...)
- [Troubleshooting Common Issues](https://youtube.com/...)

### Community Support
- GitHub Issues: Bug reports and features
- Discord Server: Real-time help
- Email Support: support@ourcityauctions.edu

### Training Options
- Virtual instructor training (2 hours)
- Self-paced online course
- District-wide workshops available

## Quick Reference Card

### Essential URLs
```
Main Site: https://our-city-auctions.vercel.app
Moderator: /moderator?code=YOUR_CODE
Student: /student?code=YOUR_CODE&id=STUDENT_ID
Projection: /projection?code=YOUR_CODE
```

### Keyboard Shortcuts (Moderator)
```
Space: Next phase
P: Pause/Resume timer
M: Trigger market event
R: Reveal secret
1-9: Quick bid entry (paddle numbers)
Enter: Confirm bid
Tab: Next property
```

### Emergency Procedures
```
If System Crashes:
1. Stay calm - data is saved
2. Refresh all browsers
3. Resume from current phase
4. If unrecoverable, switch to paper backup

Paper Backup:
- Print property list
- Manual bid tracking
- Calculate results offline
- Enter data later
```

## Deployment Verification

### Launch Checklist
- [ ] Game loads at main URL
- [ ] Can create new session
- [ ] Session code generates
- [ ] Students can join
- [ ] All phases advance properly
- [ ] Bidding system works
- [ ] Results calculate correctly
- [ ] Data persists through refresh

### Performance Metrics
- Page load: <3 seconds
- Phase transitions: <1 second
- Bid registration: Instant
- Student capacity: 30+
- Concurrent sessions: Unlimited

---

*Ready to transform your classroom into a real estate trading floor? Let's start auctioning!* 🏠🔨