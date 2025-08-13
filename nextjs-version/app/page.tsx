'use client';

import { useState, useEffect } from 'react';
import { Home, Users, PlayCircle, BookOpen } from 'lucide-react';
import { useGameStore } from '@/lib/store/gameStore';

export default function HomePage() {
  const [sessionCode, setSessionCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  
  const { createSession, session } = useGameStore();

  const handleJoinSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionCode && playerName) {
      // Navigate to student view
      window.location.href = `/game/student?code=${sessionCode}&name=${encodeURIComponent(playerName)}`;
    }
  };

  const handleCreateSession = () => {
    setIsCreatingSession(true);
    // Generate a random session code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    createSession(code, 'moderator_' + Date.now());
    // Navigate to moderator view
    setTimeout(() => {
      window.location.href = `/game/moderator?code=${code}`;
    }, 500);
  };

  // For demo purposes, create a default session
  useEffect(() => {
    if (!session) {
      createSession('WAYNE-F24', 'demo_moderator');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Home className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Wayne County Auction Game</h1>
                <p className="text-sm text-gray-600">Learn Real Estate Investment Through Simulation</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Join Session Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <Users className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold">Join a Session</h2>
            </div>
            
            <form onSubmit={handleJoinSession} className="space-y-4">
              <div>
                <label htmlFor="sessionCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Session Code
                </label>
                <input
                  type="text"
                  id="sessionCode"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={6}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <PlayCircle className="h-5 w-5 mr-2" />
                Join as Student
              </button>
            </form>
          </div>

          {/* Create Session Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <BookOpen className="h-6 w-6 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold">Moderator Access</h2>
            </div>
            
            <p className="text-gray-600 mb-6">
              Start a new auction session as a moderator. You'll control the game phases, 
              manage the auction, and see all student activities.
            </p>
            
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 font-medium">Demo Session Available!</p>
              <p className="text-sm text-blue-700">
                Use code <span className="font-mono font-bold">WAYNE-F24</span> to join the demo session as a student.
              </p>
            </div>
            
            <button
              onClick={handleCreateSession}
              disabled={isCreatingSession}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              {isCreatingSession ? 'Creating Session...' : 'Create New Session'}
            </button>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Quick Start:</strong> Click to create a session, share the code with students, 
                and guide them through the auction phases.
              </p>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="font-semibold text-lg mb-2">🏠 50+ Properties</h3>
            <p className="text-gray-600 text-sm">
              Real Detroit-area properties with accurate valuations and neighborhood data.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="font-semibold text-lg mb-2">📊 Live Bidding</h3>
            <p className="text-gray-600 text-sm">
              Experience real-time competitive auctions with strategic decision-making.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="font-semibold text-lg mb-2">🎯 Learn by Doing</h3>
            <p className="text-gray-600 text-sm">
              Master property valuation, underwriting, and investment strategies.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}