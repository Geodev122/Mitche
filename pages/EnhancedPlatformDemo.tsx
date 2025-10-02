import React, { useState } from 'react';
import { useAuth } from '../context/AuthContextRoles';
import RoleSystemDemo from '../components/RoleSystemDemo';
import { PermissionManager } from '../utils/permissions';
import { PermissionType } from '../types-roles-enhanced';

const EnhancedPlatformDemo: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [activeFeature, setActiveFeature] = useState<'roles' | 'chat' | 'search' | 'rating' | 'analytics'>('roles');

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
            Enhanced Mitché Platform
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Please sign in to access the enhanced role-based features and platform capabilities.
          </p>
          <div className="text-center">
            <span className="inline-block text-4xl mb-4">🔒</span>
            <p className="text-sm text-gray-500">
              Authentication required for role-based access control
            </p>
          </div>
        </div>
      </div>
    );
  }

  const features = [
    {
      id: 'roles',
      name: 'Role System',
      icon: '👑',
      description: 'Hierarchical permissions and interactions',
      available: true
    },
    {
      id: 'chat',
      name: 'Real-time Chat',
      icon: '💬',
      description: 'Role-based messaging system',
      available: hasPermission(PermissionType.SEND_DIRECT_MESSAGES)
    },
    {
      id: 'search',
      name: 'Advanced Search',
      icon: '🔍',
      description: 'Geographic and semantic search',
      available: hasPermission(PermissionType.VIEW_BASIC_ANALYTICS) // Using existing permission
    },
    {
      id: 'rating',
      name: 'Rating System',
      icon: '⭐',
      description: 'Community rating and feedback',
      available: hasPermission(PermissionType.CREATE_REQUEST) // Basic permission for demo
    },
    {
      id: 'analytics',
      name: 'Analytics Dashboard',
      icon: '📊',
      description: 'Platform insights and metrics',
      available: hasPermission(PermissionType.VIEW_BASIC_ANALYTICS)
    }
  ];

  const activeFeatureData = features.find(f => f.id === activeFeature);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Enhanced Mitché Platform
              </h1>
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                Phase 1 + Enhanced Roles
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back</p>
                <p className="font-semibold text-gray-900">{user.symbolicName || user.username}</p>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                user.role === 'Admin' ? 'bg-red-500' :
                user.role === 'PublicWorker' ? 'bg-blue-500' :
                user.role === 'NGO' ? 'bg-green-500' : 'bg-gray-500'
              }`}>
                {user.role === 'Admin' ? '👑' :
                 user.role === 'PublicWorker' ? '🏛️' :
                 user.role === 'NGO' ? '🤝' : '👤'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Platform Features</h3>
              <nav className="space-y-2">
                {features.map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => setActiveFeature(feature.id as any)}
                    disabled={!feature.available}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeFeature === feature.id
                        ? 'bg-blue-50 border-2 border-blue-200 text-blue-700'
                        : feature.available
                        ? 'hover:bg-gray-50 border-2 border-transparent'
                        : 'opacity-50 cursor-not-allowed border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{feature.icon}</span>
                      <div>
                        <p className="font-medium">{feature.name}</p>
                        <p className="text-xs text-gray-500">{feature.description}</p>
                      </div>
                    </div>
                    {!feature.available && (
                      <p className="text-xs text-red-500 mt-1">Insufficient permissions</p>
                    )}
                  </button>
                ))}
              </nav>

              {/* User Info Panel */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-800 mb-3">Current Session</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role:</span>
                    <span className="font-medium">{user.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Verified:</span>
                    <span className="font-medium">
                      {user.isVerified ? '✅ Yes' : '⏳ Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hope Points:</span>
                    <span className="font-medium">{user.hopePoints || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Feature Header */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{activeFeatureData?.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold">{activeFeatureData?.name}</h2>
                    <p className="text-blue-100">{activeFeatureData?.description}</p>
                  </div>
                </div>
              </div>

              {/* Feature Content */}
              <div className="p-6">
                {activeFeature === 'roles' && <RoleSystemDemo />}
                
                {activeFeature === 'chat' && hasPermission(PermissionType.SEND_DIRECT_MESSAGES) && (
                  <div className="p-6 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Real-time Chat Interface</h3>
                    <p className="text-gray-600 mb-4">
                      Role-based messaging system with permissions for {user.role} users.
                    </p>
                    <div className="bg-white p-4 rounded border">
                      <p className="text-sm text-gray-500">Chat interface would be rendered here with role-appropriate features.</p>
                    </div>
                  </div>
                )}
                
                {activeFeature === 'search' && hasPermission(PermissionType.VIEW_BASIC_ANALYTICS) && (
                  <div className="p-6 bg-green-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Advanced Search</h3>
                    <p className="text-gray-600 mb-4">
                      Geographic and semantic search capabilities available to {user.role} users.
                    </p>
                    <div className="bg-white p-4 rounded border">
                      <p className="text-sm text-gray-500">Advanced search interface would be rendered here.</p>
                    </div>
                  </div>
                )}
                
                {activeFeature === 'rating' && hasPermission(PermissionType.CREATE_REQUEST) && (
                  <div className="p-6 bg-yellow-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Rating System</h3>
                    <p className="text-gray-600 mb-4">
                      Community rating and feedback system for {user.role} users.
                    </p>
                    <div className="bg-white p-4 rounded border">
                      <p className="text-sm text-gray-500">Rating system interface would be rendered here.</p>
                    </div>
                  </div>
                )}
                
                {activeFeature === 'analytics' && hasPermission(PermissionType.VIEW_BASIC_ANALYTICS) && (
                  <div className="p-6 bg-purple-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Analytics Dashboard</h3>
                    <p className="text-gray-600 mb-4">
                      Platform insights and metrics ({PermissionManager.getAnalyticsLevel(user)} level access).
                    </p>
                    <div className="bg-white p-4 rounded border">
                      <p className="text-sm text-gray-500">Analytics dashboard would be rendered here with {user.role}-appropriate data.</p>
                    </div>
                  </div>
                )}

                {/* Permission Denied Message */}
                {((activeFeature === 'chat' && !hasPermission(PermissionType.SEND_DIRECT_MESSAGES)) ||
                  (activeFeature === 'search' && !hasPermission(PermissionType.VIEW_BASIC_ANALYTICS)) ||
                  (activeFeature === 'rating' && !hasPermission(PermissionType.CREATE_REQUEST)) ||
                  (activeFeature === 'analytics' && !hasPermission(PermissionType.VIEW_BASIC_ANALYTICS))) && (
                  <div className="text-center py-12">
                    <span className="text-6xl mb-4 block">🔒</span>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Access Restricted</h3>
                    <p className="text-gray-600 mb-4">
                      Your current role ({user.role}) doesn't have permission to access this feature.
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-sm text-yellow-800">
                        <strong>Need access?</strong> Contact your administrator or complete verification 
                        requirements to unlock additional platform features.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              Enhanced Mitché Platform - Phase 1 Implementation with Advanced Role System
            </p>
            <p className="text-xs mt-1">
              Hierarchical permissions • Trust scoring • Real-time features • Analytics
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPlatformDemo;