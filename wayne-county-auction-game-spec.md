# Wayne County Auction Game - Technical Specification

## Game Overview
A educational real estate auction simulation game that mirrors Wayne County's mortgage foreclosure auction process, designed to teach property valuation and investment strategies.

## Core Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router)
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Hosting**: Vercel
- **Real-time**: Socket.io or Pusher for live auction updates
- **Auth**: NextAuth.js for player/moderator authentication
- **State Management**: Zustand or Redux Toolkit

### Database Schema

```prisma
// Property Model
model Property {
  id                String   @id @default(cuid())
  address           String
  city              String
  zipCode           String
  exteriorImageUrl  String
  
  // Financial Info
  openingBid        Float
  marketValue       Float
  outstandingDebt   Float
  hasEquity         Boolean
  ltv               Float
  
  // Property Details
  bedrooms          Int
  bathrooms         Float
  squareFeet        Int
  yearBuilt         Int
  propertyType      PropertyType
  
  // Status
  occupancyStatus   OccupancyStatus
  renovationLevel   RenovationLevel
  
  // Liens & Legal
  lenderName        String
  lawFirm           String
  hasSecondLien     Boolean
  secondLienAmount  Float?
  hasThirdLien      Boolean
  thirdLienAmount   Float?
  
  // Special Conditions
  redemptionStatus  RedemptionStatus
  hasRedemptionAgreement Boolean
  
  // Relations
  occupant          Occupant?
  bids              Bid[]
  playerAnalyses    PlayerAnalysis[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

// Occupant Model
model Occupant {
  id              String   @id @default(cuid())
  propertyId      String   @unique
  property        Property @relation(fields: [propertyId], references: [id])
  
  name            String
  isOwner         Boolean
  occupation      String
  annualIncome    Float
  creditScore     Int
  education       String
  familySize      Int
  
  // Engagement
  willingToNegotiate Boolean
  preferredOutcome   OccupantPreference
  responseRate       Float // Probability of responding to player contact
}

// Player Model
model Player {
  id              String   @id @default(cuid())
  name            String
  email           String   @unique
  
  // Game State
  availableCash   Float
  portfolio       Property[]
  bids            Bid[]
  analyses        PlayerAnalysis[]
  
  createdAt       DateTime @default(now())
}

// Bid Model
model Bid {
  id          String   @id @default(cuid())
  playerId    String
  player      Player   @relation(fields: [playerId], references: [id])
  propertyId  String
  property    Property @relation(fields: [propertyId], references: [id])
  
  amount      Float
  isWinning   Boolean  @default(false)
  hasProofOfFunds Boolean @default(false)
  
  createdAt   DateTime @default(now())
}

// PlayerAnalysis Model (Sell Sheet)
model PlayerAnalysis {
  id              String   @id @default(cuid())
  playerId        String
  player          Player   @relation(fields: [playerId], references: [id])
  propertyId      String
  property        Property @relation(fields: [propertyId], references: [id])
  
  // Player Estimates
  estimatedRenovationCost Float
  estimatedARV            Float // After Repair Value
  estimatedRentValue      Float
  comparableProperties    Json // Array of comp addresses and values
  
  // Investment Strategy
  strategy        InvestmentStrategy
  targetROI       Float
  maxBidAmount    Float
  
  notes           String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// Game Session Model
model GameSession {
  id              String   @id @default(cuid())
  moderatorId     String
  
  status          GameStatus
  currentPhase    GamePhase
  
  // Timing
  previewStartTime DateTime?
  auctionStartTime DateTime?
  bankingDuration  Int // minutes
  currentPropertyIndex Int @default(0)
  
  players         Json // Array of player IDs
  properties      Json // Array of property IDs for this session
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// Enums
enum PropertyType {
  SINGLE_FAMILY
  MULTI_FAMILY
  CONDO
  TOWNHOUSE
}

enum OccupancyStatus {
  VACANT
  OWNER_OCCUPIED
  TENANT_OCCUPIED
}

enum RenovationLevel {
  MOVE_IN_READY
  LIGHT_REHAB
  MODERATE_REHAB
  HEAVY_REHAB
  TEARDOWN
}

enum RedemptionStatus {
  NONE
  IN_NEGOTIATION
  AGREEMENT_IN_PLACE
}

enum OccupantPreference {
  STAY_AS_OWNER
  RENT_BACK
  RENT_TO_OWN
  RELOCATE
}

enum InvestmentStrategy {
  RENTAL
  FIX_AND_FLIP
  WHOLESALE
  OWNER_OCCUPANT
}

enum GameStatus {
  SETUP
  PREVIEW
  AUCTION_READING
  BANKING
  BIDDING
  COMPLETED
}

enum GamePhase {
  WAITING
  PREVIEW
  ANNOUNCEMENT
  BANKING
  BIDDING
  SETTLEMENT
}
```

## Game Flow & Phases

### 1. Preview Phase
- Players browse property database
- View exterior photos and basic info
- Attempt to contact occupants (probability-based)
- Fill out analysis sheets (mini proforma)
- Research comparables

### 2. Auction Reading Phase
- Moderator/system announces each property
- Displays: address, opening bid, lender, law firm
- Players take notes and finalize strategy

### 3. Banking Phase
- Timed period (5-20 minutes, moderator choice)
- Players withdraw virtual funds
- Must balance cash across desired properties

### 4. Bidding Phase
- Sequential property auctions
- Real-time competitive bidding
- Bid increments enforced

### 5. Settlement Phase
- Top 2 bidders verify funds
- Fallback to second bidder if first lacks funds
- Property transfers to winner

## Valuation Logic

### Opening Bid Calculation
```javascript
function calculateOpeningBid(property) {
  const basePrice = property.outstandingDebt;
  
  // Neighborhood factor (Detroit vs Suburbs)
  const neighborhoodMultiplier = getNeighborhoodMultiplier(property.zipCode);
  
  // Bank pricing bias
  const bankBias = property.city === 'Detroit' 
    ? randomBetween(0.7, 0.9)  // Banks may underprice Detroit
    : randomBetween(0.95, 1.1); // May overprice suburbs
  
  // Condition factor
  const conditionFactor = {
    'MOVE_IN_READY': 1.0,
    'LIGHT_REHAB': 0.95,
    'MODERATE_REHAB': 0.85,
    'HEAVY_REHAB': 0.7,
    'TEARDOWN': 0.5
  }[property.renovationLevel];
  
  return Math.round(basePrice * neighborhoodMultiplier * bankBias * conditionFactor);
}
```

### Property Value Variables
- **Hidden Variables** (revealed through research/occupant contact):
  - Actual renovation needs
  - Occupant cooperation likelihood
  - Hidden liens
  - Code violations
  - Back taxes

## Player Tools

### Sell Sheet (Mini Proforma)
```javascript
// Player Input Fields
{
  purchasePrice: number,
  estimatedRenovationCost: number,
  holdingCosts: number, // calculated helper
  comparables: [
    { address: string, soldPrice: number, sqft: number }
  ],
  
  // Strategy-specific fields
  strategy: 'rental' | 'flip' | 'wholesale',
  
  // Rental Strategy
  monthlyRent: number,
  annualExpenses: number,
  capRate: number, // calculated
  cashOnCashReturn: number, // calculated
  
  // Flip Strategy
  arv: number, // After Repair Value
  sellingCosts: number,
  profitMargin: number, // calculated
  
  // Decision Helper
  maxBid: number, // calculated based on target ROI
  goNoGo: boolean // calculated threshold
}
```

## API Endpoints

### Core Game APIs
```typescript
// Property APIs
GET    /api/properties          // List all properties (filtered by game session)
GET    /api/properties/:id      // Get property details
POST   /api/properties/:id/analyze // Save player analysis

// Occupant APIs
POST   /api/occupants/:id/contact // Attempt to contact (probability-based)
GET    /api/occupants/:id/info    // Get revealed information

// Game Session APIs
POST   /api/game/create         // Create new game session
POST   /api/game/:id/advance    // Advance to next phase
GET    /api/game/:id/status     // Get current game state

// Auction APIs
POST   /api/auction/bid         // Place a bid
GET    /api/auction/:propertyId/bids // Get current bids
POST   /api/auction/:propertyId/settle // Settle auction

// Banking APIs
POST   /api/bank/withdraw       // Withdraw funds
GET    /api/bank/balance        // Get player balance
```

## Frontend Components Structure

```
src/
├── app/
│   ├── game/
│   │   ├── preview/page.tsx
│   │   ├── auction/page.tsx
│   │   ├── banking/page.tsx
│   │   └── portfolio/page.tsx
│   ├── moderator/
│   │   ├── dashboard/page.tsx
│   │   └── controls/page.tsx
│   └── api/
│       └── [various API routes]
├── components/
│   ├── property/
│   │   ├── PropertyCard.tsx
│   │   ├── PropertyDetails.tsx
│   │   └── PropertyGallery.tsx
│   ├── auction/
│   │   ├── BidInterface.tsx
│   │   ├── AuctionTimer.tsx
│   │   └── BidHistory.tsx
│   ├── analysis/
│   │   ├── SellSheet.tsx
│   │   ├── ROICalculator.tsx
│   │   └── CompsSearch.tsx
│   └── shared/
│       ├── GamePhaseIndicator.tsx
│       └── PlayerDashboard.tsx
├── lib/
│   ├── game-engine/
│   │   ├── valuation.ts
│   │   ├── auction.ts
│   │   └── probability.ts
│   └── utils/
└── hooks/
    ├── useGameSession.ts
    ├── useAuction.ts
    └── usePropertyAnalysis.ts
```

## Integration with Our-City-Builders

### Shared Interfaces
```typescript
interface OCBProperty {
  id: string;
  address: string;
  value: number;
  owner: string;
  // ... other shared fields
}

interface GameAdapter {
  importProperty(property: OCBProperty): Property;
  exportProperty(property: Property): OCBProperty;
  syncGameState(): void;
}
```

## Future Enhancements (Modular Add-ons)

### Phase 2: Solo Mode
- AI bidders with different strategies
- Market simulation
- Practice scenarios

### Phase 3: Multiplayer Online
- Real-time competitive auctions
- League/tournament system
- Performance tracking

### Phase 4: Advanced Features
- Historical market data integration
- Real MLS comp data
- Financial partner matching
- Property management simulation post-purchase

## Security & Fair Play
- Server-side validation for all bids
- Hidden information encrypted until revealed
- Anti-cheating measures for timing
- Audit log for all transactions

## Performance Considerations
- Lazy load property images
- Paginate property lists
- Cache frequently accessed data
- Optimize real-time updates to affected players only