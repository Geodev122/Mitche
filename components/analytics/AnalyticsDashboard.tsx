import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface AnalyticsDashboardProps {
  dateRange?: {
    start: string;
    end: string;
  };
}

interface AnalyticsSummary {
  totalEvents: number;
  eventsByType: { [key: string]: number };
  dailyBreakdown: { [key: string]: number };
}

const ChartIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const UsersIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const HeartIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ 
  dateRange = {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  }
}) => {
  const { user, enhancedFirebase } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDateRange, setSelectedDateRange] = useState(dateRange);

  useEffect(() => {
    loadAnalytics();
  }, [selectedDateRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await enhancedFirebase.getAnalyticsSummary(
        selectedDateRange.start,
        selectedDateRange.end
      );
      
      if (response.success && response.data) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const recordTestEvent = async () => {
    await enhancedFirebase.recordAnalytics('test_event', {
      userId: user?.id,
      timestamp: new Date().toISOString()
    });
    loadAnalytics(); // Refresh data
  };

  const getEventTypeDisplayName = (eventType: string) => {
    const typeMap: { [key: string]: string } = {
      'request_created': 'Requests Created',
      'offering_created': 'Offerings Created',
      'event_created': 'Events Created',
      'user_registered': 'New Users',
      'message_sent': 'Messages Sent',
      'rating_submitted': 'Ratings Given',
      'hope_points_awarded': 'Hope Points Awarded',
      'test_event': 'Test Events'
    };
    return typeMap[eventType] || eventType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getTopEventTypes = () => {
    if (!analytics?.eventsByType) return [];
    return Object.entries(analytics.eventsByType)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  const getRecentDays = () => {
    if (!analytics?.dailyBreakdown) return [];
    return Object.entries(analytics.dailyBreakdown)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 7);
  };

  if (!user) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Please log in to view analytics dashboard</p>
      </div>
    );
  }

  if (user.role !== 'Admin' && user.role !== 'NGO') {
    return (
      <div className="text-center p-8 bg-yellow-50 rounded-lg">
        <p className="text-yellow-700">Analytics dashboard is available for administrators and verified organizations</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
          Community Impact Analytics
        </h1>
        
        {/* Date Range Selector */}
        <div className="flex gap-3">
          <div>
            <label className="block text-sm text-gray-600">From</label>
            <input
              type="date"
              value={selectedDateRange.start}
              onChange={(e) => setSelectedDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">To</label>
            <input
              type="date"
              value={selectedDateRange.end}
              onChange={(e) => setSelectedDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading analytics...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <ChartIcon className="w-8 h-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics?.totalEvents || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <UsersIcon className="w-8 h-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Event Types</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Object.keys(analytics?.eventsByType || {}).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <HeartIcon className="w-8 h-8 text-red-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Daily Average</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round((analytics?.totalEvents || 0) / Math.max(Object.keys(analytics?.dailyBreakdown || {}).length, 1))}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <CalendarIcon className="w-8 h-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Active Days</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Object.keys(analytics?.dailyBreakdown || {}).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Event Types Chart */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Top Activity Types</h3>
              <div className="space-y-3">
                {getTopEventTypes().map(([eventType, count]) => (
                  <div key={eventType} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{getEventTypeDisplayName(eventType)}</span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${((count / (analytics?.totalEvents || 1)) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Activity Chart */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Daily Activity</h3>
              <div className="space-y-3">
                {getRecentDays().map(([date, count]) => {
                  const maxDailyCount = Math.max(...Object.values(analytics?.dailyBreakdown || {}));
                  return (
                    <div key={date} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{new Date(date).toLocaleDateString()}</span>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ 
                              width: `${((count / maxDailyCount) * 100)}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Test Actions (for development) */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Developer Tools</h3>
            <div className="flex gap-3">
              <button
                onClick={recordTestEvent}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Record Test Event
              </button>
              <button
                onClick={loadAnalytics}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Refresh Data
              </button>
            </div>
          </div>

          {/* Impact Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Community Impact Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {analytics?.eventsByType?.['request_created'] || 0}
                </p>
                <p className="text-sm text-gray-600">Help Requests</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {analytics?.eventsByType?.['offering_created'] || 0}
                </p>
                <p className="text-sm text-gray-600">Help Offered</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {analytics?.eventsByType?.['hope_points_awarded'] || 0}
                </p>
                <p className="text-sm text-gray-600">Hope Points Shared</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};