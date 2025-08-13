# Wayne County Auction Game

An educational real estate auction simulation game that mirrors Wayne County's mortgage foreclosure auction process, designed to teach students property valuation, underwriting, and strategic bidding.

## 🚀 Live Demo
**[https://our-city-auctions.vercel.app](https://our-city-auctions.vercel.app)**

## 🎯 Game Overview

Our City Auctions mirrors the Wayne County mortgage foreclosure auction process, designed to teach students:
- Property valuation and underwriting fundamentals
- Understanding liens, redemption rights, and legal processes
- Strategic bidding and game theory applications
- Social impact awareness of foreclosure processes
- ROI calculations for rental, retail, and owner-occupant scenarios

## 🏛️ Architecture

### Classroom-Optimized Design
- **Synchronized Single-Player**: Students research individually but bid in live classroom auction
- **Physical/Digital Hybrid**: Digital research tools + verbal bidding managed by moderator
- **Deterministic Properties**: Same property set for all students using seeded generation
- **Offline Resilient**: Core functionality works without internet connection

### Key Features
- **50 Realistic Properties**: Detroit-area properties with accurate market dynamics
- **Multi-Tier Research System**: Credits-based information discovery
- **Live Bidding Interface**: Moderator-controlled auction with projection display
- **Occupant Negotiations**: Post-auction relationship simulation
- **Educational Analytics**: Comprehensive performance tracking and learning insights

## 🎮 Game Flow

1. **Preview Phase (15 min)**: Research properties, build draft board
2. **Announcement (5 min)**: Opening bids revealed, strategy adjustment
3. **Banking (10 min)**: Withdraw virtual cash for bidding
4. **Live Auction (30 min)**: Verbal bidding with moderator entry
5. **Redemption (10 min)**: Digital negotiation with occupants

## 🚀 Quick Start

### Live Deployment
Visit **[our-city-auctions.vercel.app](https://our-city-auctions.vercel.app)** to:
- Create or join auction sessions
- Access moderator console
- Use student dashboard  
- Display projection view

### 📱 Access Points
- **Landing Page**: `/` - Create or join sessions
- **Moderator Console**: `/moderator?code=SESSION_CODE`
- **Student Dashboard**: `/student?code=SESSION_CODE&id=STUDENT_ID`
- **Projection Display**: `/projection?code=SESSION_CODE`

### 🎮 Demo Sessions
- **DEMO** - 20 properties for testing
- **WAYNE-F24** - Fall 2024 session (50 properties)
- **WAYNE-S25** - Spring 2025 session (50 properties)
- **QUICK** - 10 properties for quick games

### Local Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test
```

### 🏫 Classroom Setup
1. **Moderator** opens `/moderator` on main computer
2. **Projection** displays `/projection` on classroom screen  
3. **Students** access `/student` on individual devices
4. **Session codes** keep everyone synchronized

## 📁 Project Structure

```
our-city-auctions/
├── types/                    # TypeScript definitions
├── utils/                    # Core game logic
├── components/               # Vue components
│   ├── student/             # Student interface components
│   ├── moderator/           # Moderator dashboard
│   ├── projection/          # Public display
│   └── analytics/           # Performance tracking
├── stores/                  # Pinia state management
├── pages/                   # Nuxt pages
└── assets/                  # Static assets
```

## 🎓 Educational Objectives

### Learning Outcomes
- **Property Valuation**: Understand factors affecting real estate value
- **Financial Analysis**: Calculate ROI for different investment strategies
- **Risk Assessment**: Evaluate hidden costs and market factors
- **Negotiation Skills**: Practice occupant relationship management
- **Strategic Thinking**: Balance information costs vs. potential gains

### Assessment Metrics
- Research efficiency (value per credit spent)
- Bidding discipline (staying within calculated limits)
- Valuation accuracy (predicted vs. actual outcomes)
- Negotiation success (occupant agreement rates)

## 🔧 Configuration

### Session Settings
- Property count (default: 50)
- Research credits (default: 30)
- Phase durations
- Difficulty level (Rookie/Professional/Expert)
- Market events and dramatic reveals

### Market Dynamics
- Detroit: High variance, block-level differences
- Suburbs: More stable, predictable patterns
- Hidden damage: 15% chance, $5K-$150K impact
- Occupancy: 60% occupied properties

## 📊 Analytics & Reporting

### Individual Metrics
- Research ROI
- Bid efficiency
- Information arbitrage score
- Confidence calibration

### Classroom Analytics
- Participation rates
- Common mistakes analysis
- Competitive dynamics
- Learning objective achievement

## 🤝 Integration

### Our-City-Builders Platform
- Portfolio integration for won properties
- Shared authentication system
- Common neighborhood/market data
- Progressive skill building

### Standalone Operation
- Independent session management
- Local data persistence
- Offline-capable core features
- Self-contained educational experience

## 📝 License

Educational use license - See LICENSE file for details.

## 🚀 Deployment Instructions

### GitHub Setup
1. Create repository: `https://github.com/ourcityilab/our-city-auctions`
2. Push code: `git push -u origin main`

### Vercel Deployment  
1. Import GitHub repo to Vercel
2. Framework Preset: **Nuxt.js**
3. Build Command: `npm run build`
4. Output Directory: `.output`
5. Environment Variables:
   ```
   NUXT_PUBLIC_APP_URL=https://our-city-auctions.vercel.app
   NUXT_PUBLIC_SESSION_STORAGE_PREFIX=oca_
   NODE_ENV=production
   ```

### Verification Checklist
- ✅ Landing page loads at root URL
- ✅ Moderator console accessible at `/moderator`
- ✅ Student dashboard accessible at `/student`
- ✅ Projection display accessible at `/projection`
- ✅ Test demo runs successfully
- ✅ Session persistence works across page refreshes
- ✅ All components render properly
- ✅ Responsive design works on tablets/phones

## 🏗️ Tech Stack
- **Frontend**: Nuxt 3, Vue 3, TypeScript
- **Styling**: Tailwind CSS
- **State**: Pinia/Composables
- **Deployment**: Vercel
- **Storage**: localStorage (offline-capable)

## 🤝 Contributing
This is an educational project. Contributions that enhance the learning experience are welcome!

## 📄 License
MIT License - Free for educational use

## 🙏 Acknowledgments
Designed for Wayne County community education on real estate investment and auction processes.