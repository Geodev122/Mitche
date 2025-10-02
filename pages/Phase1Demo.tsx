import React, { useState } from 'react';
import { ChatInterface } from '../components/chat/ChatInterface';
import { AdvancedSearch } from '../components/search/AdvancedSearch';
import { RatingSystem } from '../components/rating/RatingSystem';
import { AnalyticsDashboard } from '../components/analytics/AnalyticsDashboard';
import { ConversationType } from '../types-enhanced';
import { useAuth } from '../context/AuthContext';

type TabType = 'chat' | 'search' | 'rating' | 'analytics';

export const Phase1Demo: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchType, setSearchType] = useState<'requests' | 'offerings'>('requests');

  const handleSearchResults = (results: any[]) => {
    setSearchResults(results);
  };

  const tabs = [
    { id: 'search' as TabType, name: 'Advanced Search', icon: '🔍' },
    { id: 'chat' as TabType, name: 'Chat System', icon: '💬' },
    { id: 'rating' as TabType, name: 'Rating System', icon: '⭐' },
    { id: 'analytics' as TabType, name: 'Analytics', icon: '📊' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Mitché Platform - Phase 1 Features
            </h1>
            <p className="mt-2 text-gray-600">
              Experience our enhanced community platform with real-time chat, advanced search, rating system, and analytics
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'search' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Advanced Search & Discovery</h2>
              <p className="text-gray-600 mb-6">
                Find help requests and offerings with powerful filtering, geographic search, and sorting options.
              </p>
              
              {/* Search Type Toggle */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setSearchType('requests')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    searchType === 'requests'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Search Requests
                </button>
                <button
                  onClick={() => setSearchType('offerings')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    searchType === 'offerings'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Search Offerings
                </button>
              </div>
            </div>

            <AdvancedSearch
              onSearch={handleSearchResults}
              searchType={searchType}
            />

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Search Results ({searchResults.length} found)
                </h3>
                <div className="grid gap-4">
                  {searchResults.slice(0, 5).map((result, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {result.title || result.description?.substring(0, 50) + '...' || 'Untitled'}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Type: {result.type} | Status: {result.status}
                          </p>
                          {result.urgency && (
                            <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                              result.urgency === 'Critical' ? 'bg-red-100 text-red-800' :
                              result.urgency === 'High' ? 'bg-orange-100 text-orange-800' :
                              result.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {result.urgency} Priority
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setActiveTab('chat')}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Chat
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Real-Time Chat System</h2>
              <p className="text-gray-600 mb-6">
                Connect with community members through secure, real-time messaging with support for reactions, file sharing, and threaded conversations.
              </p>
            </div>

            <ChatInterface
              type={ConversationType.DirectMessage}
              participantIds={[]}
            />

            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Chat Features:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Real-time message delivery and read receipts</li>
                <li>• Message reactions and threading</li>
                <li>• File and image sharing</li>
                <li>• Conversation archiving and search</li>
                <li>• Anonymous and symbolic identity support</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'rating' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Trust & Rating System</h2>
              <p className="text-gray-600 mb-6">
                Build community trust through peer feedback and ratings for users, requests, offerings, and events.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Rating Example */}
              <div>
                <h3 className="text-lg font-medium mb-4">Rate a Helper</h3>
                <RatingSystem
                  targetId="sample-user-1"
                  targetType="user"
                  targetName="Silent Guardian"
                  currentRating={{ average: 4.3, count: 12 }}
                  showReviewForm={true}
                />
              </div>

              {/* Request Rating Example */}
              <div>
                <h3 className="text-lg font-medium mb-4">Rate a Request</h3>
                <RatingSystem
                  targetId="sample-request-1"
                  targetType="request"
                  targetName="Emergency Food Assistance"
                  currentRating={{ average: 4.8, count: 6 }}
                  showReviewForm={false}
                />
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">Rating System Features:</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Anonymous rating submission</li>
                <li>• Optional written reviews</li>
                <li>• Aggregate rating calculations</li>
                <li>• Trust score integration</li>
                <li>• Spam and abuse protection</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Community Impact Analytics</h2>
              <p className="text-gray-600 mb-6">
                Track community engagement, measure impact, and gain insights into platform usage and effectiveness.
              </p>
            </div>

            <AnalyticsDashboard />

            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-medium text-purple-900 mb-2">Analytics Features:</h3>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Real-time activity tracking</li>
                <li>• Community impact metrics</li>
                <li>• User engagement analysis</li>
                <li>• Geographic distribution data</li>
                <li>• Trend analysis and forecasting</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Phase 1 Complete ✅
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Your Mitché platform now features enterprise-grade chat functionality, advanced search capabilities, 
              comprehensive rating systems, and detailed analytics - all built on a scalable Firebase infrastructure 
              ready for millions of users.
            </p>
            <div className="mt-6 flex justify-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">4</div>
                <div className="text-sm text-gray-600">Core Features</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">13</div>
                <div className="text-sm text-gray-600">Database Collections</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">40+</div>
                <div className="text-sm text-gray-600">Performance Indexes</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};