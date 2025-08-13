# CLAUDE.md - Wayne County Auction Game AI Assistant Guide

## 🎯 Project Mission
Educational real estate auction simulation mirroring Wayne County's foreclosure process. Teaches property valuation, underwriting, and strategic bidding through hands-on classroom gameplay.

## ⚡ Quick Reference
- **Live Site**: https://our-city-auctions.vercel.app
- **Framework**: Nuxt 3 (Vue 3) - NOT Next.js
- **State**: Pinia stores + composables
- **Styling**: Tailwind CSS + Nuxt UI
- **Deployment**: Vercel
- **Sessions**: 50 properties, seeded generation

## 🚨 CRITICAL RULES - NEVER CHANGE

### Core Mechanics
- **50 properties** auto-generated per session
- **Phase progression** controlled by moderator only
- **Session codes** for classroom synchronization  
- **30 research credits** total (2 per property)
- **$500k max** cash withdrawal
- **Deterministic** property generation via seed

### File Structure (MUST MAINTAIN)
```
our-city-auctions/
├── pages/               # Nuxt pages (NOT app directory)
│   ├── index.vue       # Landing page
│   ├── moderator.vue   # Moderator console
│   ├── student.vue     # Student dashboard
│   └── projection.vue  # Classroom display
├── components/         # Vue components
├── stores/            # Pinia state management
├── utils/             # Core game logic
└── types/             # TypeScript definitions
```

### Educational Priorities
1. Learning value > complex features
2. Moderator control > automation
3. Reliability > cutting-edge tech
4. Clear feedback > subtle design

## 🎮 Game Flow

### Phases (Moderator Controlled)
1. **LOBBY** → Students join with code
2. **PREVIEW** → Research properties (15-30 min)
3. **ANNOUNCEMENT** → Opening bids revealed (5 min)
4. **BANKING** → Withdraw cash (10-20 min)
5. **BIDDING** → Live auctions (30-60 min)
6. **REDEMPTION** → Occupant negotiations (10-15 min)
7. **COMPLETE** → Results & analytics

## 🏗️ Technical Architecture

### Current Stack
- **Frontend**: Nuxt 3.13, Vue 3.4, TypeScript
- **State**: Pinia stores in `/stores`
- **Components**: Vue SFCs in `/components`
- **Styling**: Tailwind CSS + @nuxt/ui
- **Random**: seedrandom for deterministic generation
- **Storage**: localStorage for offline capability

### Key Components
```typescript
// Property Generation - utils/propertyGenerator.ts
generateProperties(seed: string, count: number = 50)

// Session Management - stores/gameStore.ts
useGameStore() // Main game state
useStudentStore() // Student-specific state
useModeratorStore() // Moderator controls

// Core Types - types/auction.types.ts
Property, Student, GamePhase, Bid, Occupant
```

## 📁 Component Organization

### Pages
- `/` - Landing page with session creation/join
- `/moderator?code=SESSION` - Full moderator console
- `/student?code=SESSION&id=ID` - Student dashboard
- `/projection?code=SESSION` - Classroom display
- `/negotiation` - Occupant negotiation interface

### Key Components
```
components/
├── student/
│   ├── StudentDashboard.vue    # Main student interface
│   ├── PropertyResearch.vue    # Research modal
│   └── DraftBoard.vue          # Priority list
├── moderator/
│   ├── ModeratorConsole.vue   # Control panel
│   ├── AuctionControl.vue     # Bidding management
│   └── PhaseManager.vue       # Phase progression
└── projection/
    └── ProjectionDisplay.vue   # Public display
```

## 🔧 Common Development Tasks

### Running Locally
```bash
npm install          # Install dependencies
npm run dev         # Start dev server (port 3000)
npm run build       # Build for production
npm test            # Run functionality tests
```

### Testing Commands
```bash
node test-property-generator.js  # Test property generation
node run-test-demo.mjs          # Run full demo flow
node test-app-functionality.mjs # Test core features
```

### Adding Features
1. Check existing patterns in similar components
2. Use Pinia stores for shared state
3. Follow Vue 3 Composition API patterns
4. Maintain TypeScript types in `/types`
5. Test with multiple concurrent users

## 🐛 Known Issues & Solutions

### State Sync
- Use Pinia's `$subscribe` for reactive updates
- Poll localStorage for cross-tab sync
- Implement optimistic UI updates

### Performance
- Limit property lists to 10-15 per page
- Use `v-memo` for expensive list renders
- Lazy load property images

### Common Errors
```bash
# Hydration mismatch
- Check for client-only components
- Use <ClientOnly> wrapper when needed

# Module not found
- Clear .nuxt directory: rm -rf .nuxt
- Reinstall: npm install

# Type errors
- Run: npx nuxi typecheck
```

## 📊 Property System

### Generation Rules
```typescript
// Value ranges by location
Detroit: $15k - $150k
Inner suburbs: $80k - $180k  
Middle suburbs: $150k - $350k
Outer suburbs: $250k - $600k

// Opening bid calculation
openingBid = debt × locationMultiplier × bankStrategy × condition
```

### Hidden Variables
- Occupancy status (60% occupied)
- Hidden damage (15% chance, $5k-150k)
- Back taxes and violations
- Redemption agreements

## 🚀 Deployment

### Vercel Settings
```
Framework: Nuxt.js
Build: npm run build
Output: .output
Node: 18.x
```

### Environment Variables
```
NUXT_PUBLIC_APP_URL=https://our-city-auctions.vercel.app
NUXT_PUBLIC_SESSION_STORAGE_PREFIX=oca_
NODE_ENV=production
```

### Pre-Deploy Checklist
- [ ] Test with 3+ concurrent users
- [ ] Verify all phases transition
- [ ] Check property generation (50 properties)
- [ ] Test research credit deduction
- [ ] Verify bid recording
- [ ] Test on tablets/phones
- [ ] Run `npm run build` locally

## 🎯 Success Metrics

### Code Quality
- TypeScript strict mode enabled
- No console errors in production
- Sub-3 second page loads
- Works offline after first load

### Educational Goals
- 70%+ property research rate
- 80%+ draft board completion
- 60%+ positive ROI on purchases
- 90%+ student participation

## 💡 Best Practices

### When Making Changes
1. **Preserve educational value** - Every feature teaches something
2. **Test multiplayer** - Always test with multiple users
3. **Maintain simplicity** - Teachers need to understand it
4. **Document hotkeys** - Moderators rely on keyboard shortcuts
5. **Keep offline-capable** - Schools have unreliable internet

### Code Style
- Use Vue 3 Composition API
- TypeScript for all new code
- Tailwind utility classes
- Descriptive component names
- Clear error messages for users

## 🔗 Resources
- [Nuxt 3 Docs](https://nuxt.com)
- [Vue 3 Guide](https://vuejs.org)
- [Pinia Docs](https://pinia.vuejs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Project Repo](https://github.com/OurCityilab/our-city-auctions)

## 📝 Notes for AI Assistants

This is an **educational tool** for teaching real estate investment. Prioritize:
1. **Learning outcomes** over technical complexity
2. **Teacher control** over automation
3. **Clear feedback** over subtle UX
4. **Reliability** over performance optimization
5. **Accessibility** for non-technical users

The codebase uses **Nuxt 3** (not Next.js). Follow Vue 3 patterns, use Pinia for state, and maintain the existing file structure. Test with multiple users to ensure classroom functionality.

When debugging, check:
- Browser console for client errors
- Network tab for API/data issues
- Vue DevTools for component state
- localStorage for session data

Remember: This game shapes how students understand property investment. Code quality directly impacts educational outcomes.