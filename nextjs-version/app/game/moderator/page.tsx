'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Users, Play, Pause, SkipForward, DollarSign, Home, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { useGameStore, type GamePhase } from '@/lib/store/gameStore';

function ModeratorContent() {
  const searchParams = useSearchParams();
  const sessionCode = searchParams.get('code') || 'DEMO01';
  
  const {
    session,
    createSession,
    transitionPhase,
    placeBid,
    finalizeSale,
    triggerMarketEvent,
    nextProperty,
    previousProperty,
    getCurrentProperty,
    getPropertyBids
  } = useGameStore();

  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [bidAmount, setBidAmount] = useState(0);
  const [showHotkeys, setShowHotkeys] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Initialize session
  useEffect(() => {
    if (!session) {
      createSession(sessionCode, 'moderator_' + Date.now());
    }
  }, []);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (session) {
        const elapsed = Date.now() - session.phaseStartTime;
        const phaseDurations: Record<GamePhase, number> = {
          LOBBY: 0,
          PREVIEW: 1800, // 30 minutes
          ANNOUNCEMENT: 600, // 10 minutes
          BANKING: 300, // 5 minutes
          BIDDING: 3600, // 60 minutes
          REDEMPTION: 900, // 15 minutes
          COMPLETE: 0
        };
        const duration = phaseDurations[session.currentPhase];
        const remaining = Math.max(0, duration - Math.floor(elapsed / 1000));
        setTimeRemaining(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Initializing session...</p>
        </div>
      </div>
    );
  }

  const phases: GamePhase[] = ['LOBBY', 'PREVIEW', 'ANNOUNCEMENT', 'BANKING', 'BIDDING', 'REDEMPTION', 'COMPLETE'];
  const currentProperty = getCurrentProperty();
  const currentPropertyBids = currentProperty ? getPropertyBids(currentProperty.id) : [];
  const students = Array.from(session.students.values());

  const phaseColors = {
    LOBBY: 'bg-gray-500',
    PREVIEW: 'bg-blue-500',
    ANNOUNCEMENT: 'bg-purple-500',
    BANKING: 'bg-green-500',
    BIDDING: 'bg-red-500',
    REDEMPTION: 'bg-yellow-500',
    COMPLETE: 'bg-gray-700',
  };

  const canTransitionTo = (phase: GamePhase) => {
    const currentIndex = phases.indexOf(session.currentPhase);
    const targetIndex = phases.indexOf(phase);
    return targetIndex === currentIndex + 1;
  };

  const handleQuickBid = () => {
    if (selectedStudent && bidAmount && currentProperty) {
      placeBid(currentProperty.id, selectedStudent, bidAmount);
      setBidAmount(0);
      setSelectedStudent('');
    }
  };

  const handleFinalizeSale = () => {
    if (currentProperty && currentPropertyBids.length > 0) {
      const topBid = currentPropertyBids[0];
      finalizeSale(currentProperty.id, topBid.studentId, topBid.amount);
      nextProperty();
      setPendingVerification(false);
    }
  };

  const handleMarketEvent = (type: string) => {
    const events = {
      'FACTORY_CLOSING': {
        impact: -20,
        cities: ['Detroit', 'Warren', 'Taylor'],
        message: 'Major factory announces closure - property values drop in affected areas!'
      },
      'NEW_DEVELOPMENT': {
        impact: 15,
        cities: ['Novi', 'Troy', 'Livonia'],
        message: 'New tech campus announced - surrounding property values increase!'
      },
      'CRIME_WAVE': {
        impact: -15,
        cities: ['Detroit'],
        message: 'Crime spike reported - Detroit property values affected!'
      }
    };

    const event = events[type as keyof typeof events];
    if (event) {
      triggerMarketEvent(type, event.impact, event.cities);
      alert(event.message);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      switch(e.key.toLowerCase()) {
        case 'g': 
          setPendingVerification(true);
          break;
        case 's':
          if (pendingVerification) handleFinalizeSale();
          break;
        case 'n':
          nextProperty();
          break;
        case 'p':
          previousProperty();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [pendingVerification]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-900 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Moderator Console</h1>
            <p className="text-blue-200">
              Session Code: <span className="font-mono text-xl bg-blue-800 px-2 py-1 rounded">{session.code}</span>
              {' | '}Phase: <span className={`px-2 py-1 rounded ${phaseColors[session.currentPhase]}`}>{session.currentPhase}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xl font-mono">
              Time Remaining: {formatTime(timeRemaining)}
            </div>
            <button 
              onClick={() => setShowHotkeys(!showHotkeys)}
              className="px-4 py-2 bg-blue-700 rounded hover:bg-blue-600"
            >
              Hotkeys: {showHotkeys ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </header>

      {/* Hotkey Guide */}
      {showHotkeys && (
        <div className="bg-yellow-50 border-b-2 border-yellow-400 p-3">
          <div className="flex flex-wrap gap-4 text-sm">
            <span><kbd>1-30</kbd> = Student</span>
            <span><kbd>Enter</kbd> = Record Bid</span>
            <span><kbd>G</kbd> = Going Once</span>
            <span><kbd>S</kbd> = Sold</span>
            <span><kbd>N</kbd> = Next Property</span>
            <span><kbd>P</kbd> = Previous</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Phase Control */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Phase Control</h2>
          <div className="flex gap-2 mb-4">
            {phases.map((phase) => (
              <button
                key={phase}
                onClick={() => transitionPhase(phase)}
                disabled={!canTransitionTo(phase) && phase !== session.currentPhase}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  session.currentPhase === phase 
                    ? phaseColors[phase] + ' text-white'
                    : canTransitionTo(phase)
                    ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {phase}
              </button>
            ))}
          </div>
          
          {/* Phase Progress Bar */}
          <div className="flex gap-1">
            {phases.map((phase, index) => (
              <div
                key={phase}
                className={`flex-1 h-2 rounded ${
                  phases.indexOf(session.currentPhase) >= index 
                    ? phaseColors[phase] 
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Current Property (During Bidding) */}
        {session.currentPhase === 'BIDDING' && currentProperty && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold">
                  Property #{session.currentPropertyIndex + 1}: {currentProperty.address}
                </h2>
                <p className="text-gray-600">
                  {currentProperty.city}, {currentProperty.neighborhood}
                </p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span>{currentProperty.bedrooms}BR / {currentProperty.bathrooms}BA</span>
                  <span>{currentProperty.squareFeet} sqft</span>
                  <span>Built {currentProperty.yearBuilt}</span>
                  <span className="font-semibold text-blue-600">
                    Market Value: ${currentProperty.marketValue.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">
                  Opening: ${currentProperty.openingBid.toLocaleString()}
                </div>
                {currentPropertyBids.length > 0 && (
                  <div className="text-xl mt-2">
                    Current: ${currentPropertyBids[0].amount.toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Bid Entry */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Quick Bid Entry</h3>
              <div className="flex gap-4">
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg"
                >
                  <option value="">Select Student...</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      #{student.paddleNumber} - {student.name} (${student.cashAvailable.toLocaleString()})
                    </option>
                  ))}
                </select>
                
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(Number(e.target.value))}
                  placeholder="Bid amount"
                  className="flex-1 px-4 py-2 border rounded-lg"
                />
                
                <button
                  onClick={handleQuickBid}
                  disabled={!selectedStudent || !bidAmount}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                >
                  RECORD BID (Enter)
                </button>
              </div>

              {/* Quick Amount Buttons */}
              <div className="flex gap-2 mt-2">
                {[1000, 5000, 10000, 25000].map(increment => (
                  <button
                    key={increment}
                    onClick={() => setBidAmount((currentPropertyBids[0]?.amount || currentProperty.openingBid) + increment)}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                  >
                    +${(increment/1000)}k
                  </button>
                ))}
              </div>

              {/* Auction Control */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setPendingVerification(true)}
                  className="flex-1 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-bold"
                >
                  GOING ONCE (G)
                </button>
                <button
                  onClick={() => setPendingVerification(true)}
                  className="flex-1 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-bold"
                >
                  GOING TWICE (W)
                </button>
                <button
                  onClick={handleFinalizeSale}
                  disabled={currentPropertyBids.length === 0}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold disabled:bg-gray-400"
                >
                  SOLD! (S)
                </button>
              </div>
            </div>

            {/* Current Property Bids */}
            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold mb-3">Current Property Bids</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {currentPropertyBids.length === 0 ? (
                  <p className="text-center text-gray-400">No bids yet</p>
                ) : (
                  currentPropertyBids.map((bid, index) => (
                    <div
                      key={bid.id}
                      className={`flex justify-between p-2 rounded ${
                        index === 0 ? 'bg-green-50 border border-green-300' : 'bg-gray-50'
                      }`}
                    >
                      <span className="font-medium">{bid.studentName}</span>
                      <span className="font-mono">${bid.amount.toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Verification Panel */}
            {pendingVerification && currentPropertyBids.length > 0 && (
              <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
                <h3 className="font-semibold mb-3">⚠️ Verify Cash & Finalize</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Winner: {currentPropertyBids[0].studentName}</span>
                    <div className="flex gap-2">
                      <span className="font-mono text-lg">${currentPropertyBids[0].amount.toLocaleString()}</span>
                      <button
                        onClick={handleFinalizeSale}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        ✓ Confirm Sale
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Students Grid */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Students ({students.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map(student => (
              <div key={student.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">#{student.paddleNumber} {student.name}</p>
                    <p className="text-sm text-gray-600">
                      Research Credits: {student.researchCredits}/30
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono">${student.cashAvailable.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">
                      {student.propertiesWon.length} {student.propertiesWon.length === 1 ? 'property' : 'properties'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Events */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Market Events</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button
              onClick={() => handleMarketEvent('FACTORY_CLOSING')}
              className="flex items-center p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              <TrendingDown className="h-5 w-5 mr-2 text-red-600" />
              <div className="text-left">
                <p className="font-medium">Factory Closing</p>
                <p className="text-xs text-gray-600">-20% Detroit area</p>
              </div>
            </button>
            <button
              onClick={() => handleMarketEvent('NEW_DEVELOPMENT')}
              className="flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              <div className="text-left">
                <p className="font-medium">New Development</p>
                <p className="text-xs text-gray-600">+15% Suburbs</p>
              </div>
            </button>
            <button
              onClick={() => handleMarketEvent('CRIME_WAVE')}
              className="flex items-center p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
            >
              <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
              <div className="text-left">
                <p className="font-medium">Crime Wave</p>
                <p className="text-xs text-gray-600">-15% Detroit</p>
              </div>
            </button>
          </div>
          
          {/* Market Event History */}
          {session.marketEvents.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="text-sm font-semibold mb-2">Event History</h3>
              <div className="space-y-1">
                {session.marketEvents.map((event, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    {event.type.replace('_', ' ')}: {event.impact > 0 ? '+' : ''}{event.impact}% in {event.affectedCities.join(', ')}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Properties Sold */}
        {session.winners.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Properties Sold ({session.winners.length})</h2>
            <div className="space-y-2">
              {session.winners.map((winner, index) => {
                const property = session.properties.find(p => p.id === winner.propertyId);
                const student = session.students.get(winner.studentId);
                return property && student ? (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{property.address}, {property.city}</p>
                      <p className="text-sm text-gray-600">Won by: {student.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold">${winner.winningBid.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">
                        {((winner.winningBid / property.marketValue) * 100).toFixed(1)}% of market
                      </p>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ModeratorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <ModeratorContent />
    </Suspense>
  );
}