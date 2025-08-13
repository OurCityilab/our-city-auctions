'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, DollarSign, Home, Briefcase, Calculator, ChevronUp, ChevronDown, Save, Clock } from 'lucide-react';
import { useGameStore, type Property, type PropertyAnalysis } from '@/lib/store/gameStore';

function StudentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionCode = searchParams.get('code') || '';
  const playerName = searchParams.get('name') || '';
  
  // Game store
  const { 
    session, 
    joinSession, 
    getCurrentStudent,
    researchProperty,
    saveAnalysis,
    updatePriorityList,
    withdrawCash,
    placeBid
  } = useGameStore();
  
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [analysisData, setAnalysisData] = useState<Partial<PropertyAnalysis>>({});
  const [researchResults, setResearchResults] = useState<any>({});
  const [priorityList, setPriorityList] = useState<string[]>([]);
  const [draggedProperty, setDraggedProperty] = useState<string | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState(100000);
  const [bidAmount, setBidAmount] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const student = getCurrentStudent();

  // Join session on mount
  useEffect(() => {
    if (sessionCode && playerName && !student) {
      const newStudent = joinSession(sessionCode, playerName);
      if (!newStudent) {
        alert('Invalid session code!');
        router.push('/');
      }
    }
  }, [sessionCode, playerName]);

  // Update timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (session?.currentPhase === 'PREVIEW') {
        const elapsed = Date.now() - session.phaseStartTime;
        const remaining = Math.max(0, 1800 - Math.floor(elapsed / 1000)); // 30 min preview
        setTimeRemaining(remaining);
      } else if (session?.currentPhase === 'BANKING') {
        const elapsed = Date.now() - session.phaseStartTime;
        const remaining = Math.max(0, 300 - Math.floor(elapsed / 1000)); // 5 min banking
        setTimeRemaining(remaining);
      } else {
        setTimeRemaining(0);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [session]);

  if (!session || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Joining session...</p>
        </div>
      </div>
    );
  }

  const handleResearch = (property: Property) => {
    if (student.researchCredits < 2) {
      alert('Not enough research credits!');
      return;
    }
    
    const results = researchProperty(student.id, property.id);
    if (results) {
      setResearchResults({ ...researchResults, [property.id]: results });
    }
  };

  const handleSaveAnalysis = () => {
    if (selectedProperty && analysisData) {
      saveAnalysis(student.id, selectedProperty.id, analysisData);
      alert('Analysis saved!');
    }
  };

  const handleDragStart = (e: React.DragEvent, propertyId: string) => {
    setDraggedProperty(propertyId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedProperty) {
      const newList = [...priorityList];
      const draggedIndex = newList.indexOf(draggedProperty);
      
      if (draggedIndex !== -1) {
        newList.splice(draggedIndex, 1);
      }
      newList.splice(index, 0, draggedProperty);
      setPriorityList(newList);
      updatePriorityList(student.id, newList);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const visibleProperties = session.currentPhase === 'PREVIEW' || 
                           session.currentPhase === 'ANNOUNCEMENT' ||
                           session.currentPhase === 'BIDDING'
                           ? session.properties : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {student.name} (Paddle #{student.paddleNumber})
              </h1>
              <p className="text-sm text-gray-600">Session: {session.code} | Phase: {session.currentPhase}</p>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Cash Available</p>
                <p className="text-lg font-bold text-green-600">${student.cashAvailable.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Research Credits</p>
                <p className="text-lg font-bold text-blue-600">{student.researchCredits}/30</p>
              </div>
              {timeRemaining > 0 && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Time Remaining</p>
                  <p className="text-lg font-bold flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatTime(timeRemaining)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Property Research Center</h2>

        {/* Banking Phase */}
        {session.currentPhase === 'BANKING' && (
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">🏦 Banking Window Open!</h3>
            <p className="mb-4">Withdraw cash for bidding. You cannot withdraw more once bidding starts!</p>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Withdrawal Amount</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  max={500000}
                  step={10000}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <button
                onClick={() => withdrawCash(student.id, withdrawAmount)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Withdraw Cash
              </button>
            </div>
          </div>
        )}

        {/* Priority List Builder */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-3">Priority List Builder</h3>
          <p className="text-sm text-gray-600 mb-4">Drag properties here to create your priority list</p>
          
          <div className="space-y-2 min-h-[100px] border-2 border-dashed border-gray-300 rounded-lg p-4">
            {priorityList.length === 0 ? (
              <p className="text-center text-gray-400">Drag properties here to create your priority list</p>
            ) : (
              priorityList.map((propId, index) => {
                const prop = session.properties.find(p => p.id === propId);
                return prop ? (
                  <div
                    key={propId}
                    draggable
                    onDragStart={(e) => handleDragStart(e, propId)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    className="bg-blue-50 p-3 rounded cursor-move hover:bg-blue-100"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">#{index + 1} - {prop.address}, {prop.city}</span>
                      {session.currentPhase === 'ANNOUNCEMENT' && (
                        <span className="text-green-600 font-bold">
                          Opening: ${prop.openingBid.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                ) : null;
              })
            )}
          </div>
          
          <div className="mt-2 text-sm text-gray-600">
            Properties Selected: {priorityList.length} | 
            Total Max Bids: ${student.analyses.size > 0 
              ? Array.from(student.analyses.values()).reduce((sum, a) => sum + (a.maxBid || 0), 0).toLocaleString()
              : '0'}
          </div>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleProperties.map(property => {
            const research = researchResults[property.id];
            const analysis = student.analyses.get(property.id);
            const isInPriorityList = priorityList.includes(property.id);
            
            return (
              <div
                key={property.id}
                draggable={session.currentPhase === 'PREVIEW'}
                onDragStart={(e) => handleDragStart(e, property.id)}
                className={`bg-white rounded-lg shadow-md overflow-hidden ${
                  isInPriorityList ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="relative">
                  <img
                    src={property.imageUrl}
                    alt={property.address}
                    className="w-full h-48 object-cover"
                  />
                  {isInPriorityList && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-sm font-bold">
                      #{priorityList.indexOf(property.id) + 1}
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-lg">{property.address}</h3>
                  <p className="text-gray-600">{property.city}, {property.neighborhood}</p>
                  
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span>{property.bedrooms}BR / {property.bathrooms}BA / {property.squareFeet} sqft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Built:</span>
                      <span>{property.yearBuilt}</span>
                    </div>
                    
                    {/* Show opening bid during announcement/bidding */}
                    {(session.currentPhase === 'ANNOUNCEMENT' || session.currentPhase === 'BIDDING') && (
                      <div className="flex justify-between font-semibold pt-2 border-t">
                        <span>Opening Bid:</span>
                        <span className="text-green-600">${property.openingBid.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {/* Show research results */}
                    {research && (
                      <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
                        <p className="font-semibold">Research Results:</p>
                        <p>Status: {research.occupancyStatus}</p>
                        {research.occupant && (
                          <p>Occupant: {research.occupant.name}</p>
                        )}
                        {research.hiddenDamage && (
                          <p className="text-red-600">⚠️ {research.hiddenDamageType}: ${research.hiddenDamage.toLocaleString()}</p>
                        )}
                      </div>
                    )}
                    
                    {/* Show saved analysis */}
                    {analysis && (
                      <div className="mt-2 p-2 bg-green-50 rounded text-xs">
                        <p className="font-semibold">Your Analysis:</p>
                        <p>Max Bid: ${analysis.maxBid?.toLocaleString() || 'N/A'}</p>
                        <p>Strategy: {analysis.strategy || 'N/A'}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    {session.currentPhase === 'PREVIEW' && (
                      <>
                        <button
                          onClick={() => handleResearch(property)}
                          disabled={student.researchCredits < 2 || property.researchedBy.has(student.id)}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 text-sm flex items-center justify-center"
                        >
                          <Search className="h-4 w-4 mr-1" />
                          {property.researchedBy.has(student.id) ? 'Researched' : 'Research (2)'}
                        </button>
                        <button
                          onClick={() => setSelectedProperty(property)}
                          className="flex-1 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm flex items-center justify-center"
                        >
                          <Calculator className="h-4 w-4 mr-1" />
                          Analyze
                        </button>
                      </>
                    )}
                    
                    {session.currentPhase === 'BIDDING' && (
                      <button
                        onClick={() => {
                          const amount = prompt(`Enter bid amount (min: ${property.openingBid.toLocaleString()})`);
                          if (amount) {
                            placeBid(property.id, student.id, Number(amount));
                          }
                        }}
                        className="w-full px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-bold"
                      >
                        Place Bid
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Analysis Panel */}
        {selectedProperty && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto">
              <h2 className="text-xl font-bold mb-4">
                Property Analysis: {selectedProperty.address}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Property Details</h3>
                  <div className="space-y-1 text-sm bg-gray-50 p-3 rounded">
                    <p><strong>Market Value:</strong> ${selectedProperty.marketValue.toLocaleString()}</p>
                    <p><strong>Type:</strong> {selectedProperty.propertyType}</p>
                    <p><strong>Size:</strong> {selectedProperty.squareFeet} sqft</p>
                    <p><strong>Bedrooms:</strong> {selectedProperty.bedrooms}</p>
                    <p><strong>Bathrooms:</strong> {selectedProperty.bathrooms}</p>
                    <p><strong>Year Built:</strong> {selectedProperty.yearBuilt}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Your Valuation</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm">Estimated ARV</label>
                      <input
                        type="number"
                        value={analysisData.estimatedARV || ''}
                        onChange={(e) => setAnalysisData({...analysisData, estimatedARV: Number(e.target.value)})}
                        className="w-full px-3 py-2 border rounded"
                        placeholder="After Repair Value"
                      />
                    </div>
                    <div>
                      <label className="text-sm">Renovation Cost</label>
                      <input
                        type="number"
                        value={analysisData.renovationCost || ''}
                        onChange={(e) => setAnalysisData({...analysisData, renovationCost: Number(e.target.value)})}
                        className="w-full px-3 py-2 border rounded"
                        placeholder="Estimated renovation cost"
                      />
                    </div>
                    <div>
                      <label className="text-sm">Max Bid</label>
                      <input
                        type="number"
                        value={analysisData.maxBid || ''}
                        onChange={(e) => setAnalysisData({...analysisData, maxBid: Number(e.target.value)})}
                        className="w-full px-3 py-2 border rounded"
                        placeholder="Your maximum bid"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Investment Strategy</h3>
                <div className="space-y-2">
                  {['FLIP', 'RENTAL', 'WHOLESALE'].map(strategy => (
                    <label key={strategy} className="flex items-center">
                      <input
                        type="radio"
                        name="strategy"
                        value={strategy}
                        checked={analysisData.strategy === strategy}
                        onChange={(e) => setAnalysisData({...analysisData, strategy: e.target.value as any})}
                        className="mr-2"
                      />
                      {strategy === 'FLIP' ? 'Fix & Flip' : strategy === 'RENTAL' ? 'Buy & Hold (Rental)' : 'Wholesale'}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="mt-4">
                <label className="text-sm font-semibold">Notes</label>
                <textarea
                  value={analysisData.notes || ''}
                  onChange={(e) => setAnalysisData({...analysisData, notes: e.target.value})}
                  className="w-full px-3 py-2 border rounded"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>
              
              <div className="mt-6 flex gap-2">
                <button
                  onClick={handleSaveAnalysis}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Analysis
                </button>
                <button
                  onClick={() => {
                    setSelectedProperty(null);
                    setAnalysisData({});
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Properties Won */}
        {student.propertiesWon.length > 0 && (
          <div className="mt-8 bg-green-50 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Properties Won</h3>
            <div className="space-y-2">
              {student.propertiesWon.map(propId => {
                const prop = session.properties.find(p => p.id === propId);
                const winner = session.winners.find(w => w.propertyId === propId);
                return prop && winner ? (
                  <div key={propId} className="bg-white p-3 rounded">
                    <div className="flex justify-between">
                      <span className="font-medium">{prop.address}, {prop.city}</span>
                      <span className="text-green-600 font-bold">
                        Won at: ${winner.winningBid.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Negotiation Panel for Redemption Phase */}
        {session.currentPhase === 'REDEMPTION' && student.propertiesWon.length > 0 && (
          <div className="mt-8 bg-purple-50 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Redemption Period - Occupant Negotiations</h3>
            <p className="text-sm text-gray-600 mb-4">
              Negotiate with occupants to determine the best exit strategy for your properties.
            </p>
            {student.propertiesWon.map(propId => {
              const prop = session.properties.find(p => p.id === propId);
              return prop && prop.occupant ? (
                <div key={propId} className="bg-white p-4 rounded mb-3">
                  <h4 className="font-bold">{prop.address}</h4>
                  <p className="text-sm">Occupant: {prop.occupant.name}</p>
                  <p className="text-sm">Status: {prop.occupancyStatus}</p>
                  <p className="text-sm">Cooperation Level: {prop.occupant.willingness}/5</p>
                  <p className="text-sm">Preferred Outcome: {prop.occupant.preferredOutcome}</p>
                </div>
              ) : null;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StudentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <StudentContent />
    </Suspense>
  );
}