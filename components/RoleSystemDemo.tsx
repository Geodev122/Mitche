import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContextRoles';
import { PermissionManager, UIPermissionManager } from '../utils/permissions';
import { PermissionType } from '../types-roles-enhanced';
import { Role } from '../types';

interface RoleSystemDemoProps {
  className?: string;
}

const RoleSystemDemo: React.FC<RoleSystemDemoProps> = ({ className = '' }) => {
  const { user, hasPermission, canModerate, getUserTrustScore, getHopeMultiplier, getDashboardFeatures } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'permissions' | 'interactions' | 'dashboard'>('overview');

  if (!user) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Enhanced Role System</h2>
        <p className="text-gray-600">Please sign in to see role-based features.</p>
      </div>
    );
  }

  const trustScore = getUserTrustScore();
  const hopeMultiplier = getHopeMultiplier();
  const dashboardFeatures = getDashboardFeatures();
  const userPermissions = PermissionManager.getUserPermissions(user);
  const roleHierarchy = PermissionManager.getRoleHierarchy(user.role);
  const maxUploadSize = PermissionManager.getMaxUploadSize(user);
  const rateLimits = PermissionManager.getRateLimits(user);
  const analyticsLevel = PermissionManager.getAnalyticsLevel(user);

  const getRoleColor = (role: Role): string => {
    switch (role) {
      case Role.Admin: return 'bg-red-100 text-red-800 border-red-200';
      case Role.PublicWorker: return 'bg-blue-100 text-blue-800 border-blue-200';
      case Role.NGO: return 'bg-green-100 text-green-800 border-green-200';
      case Role.Citizen: return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: Role): string => {
    switch (role) {
      case Role.Admin: return '👑';
      case Role.PublicWorker: return '🏛️';
      case Role.NGO: return '🤝';
      case Role.Citizen: return '👤';
      default: return '❓';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Role Status Card */}
      <div className={`p-4 rounded-lg border-2 ${getRoleColor(user.role)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getRoleIcon(user.role)}</span>
            <div>
              <h3 className="font-bold text-lg">{user.role}</h3>
              <p className="text-sm opacity-75">
                {user.isVerified ? '✅ Verified' : '⏳ Pending Verification'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">Hierarchy Level</p>
            <p className="text-2xl font-bold">{roleHierarchy}/4</p>
          </div>
        </div>
      </div>

      {/* Trust & Activity Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800">Trust Score</h4>
          <p className="text-2xl font-bold text-blue-600">{trustScore}</p>
          <p className="text-xs text-blue-600">Base: 50 + Role: {(roleHierarchy-1)*25} + Verification: {user.isVerified ? 50 : 0}</p>
        </div>
        
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg">
          <h4 className="font-semibold text-amber-800">Hope Multiplier</h4>
          <p className="text-2xl font-bold text-amber-600">{hopeMultiplier}x</p>
          <p className="text-xs text-amber-600">Points earned per action</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
          <h4 className="font-semibold text-green-800">Hope Points</h4>
          <p className="text-2xl font-bold text-green-600">{user.hopePoints || 0}</p>
          <p className="text-xs text-green-600">Community contribution</p>
        </div>
      </div>

      {/* System Limits */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-3">System Limits</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Max Upload Size:</span>
            <span className="font-semibold ml-2">{maxUploadSize}MB</span>
          </div>
          <div>
            <span className="text-gray-600">API Rate Limit:</span>
            <span className="font-semibold ml-2">{rateLimits.requests}/min</span>
          </div>
          <div>
            <span className="text-gray-600">Analytics Level:</span>
            <span className="font-semibold ml-2 capitalize">{analyticsLevel}</span>
          </div>
          <div>
            <span className="text-gray-600">Permissions:</span>
            <span className="font-semibold ml-2">{userPermissions.length}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPermissions = () => (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-800">Your Permissions ({userPermissions.length})</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {Object.values(PermissionType).map((permission) => (
          <div
            key={permission}
            className={`p-3 rounded-lg border ${
              hasPermission(permission)
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-gray-50 border-gray-200 text-gray-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {permission.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
              </span>
              <span className="text-xs">
                {hasPermission(permission) ? '✅' : '❌'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderInteractions = () => (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-800">Role Interaction Matrix</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">Can Interact With</th>
              <th className="border border-gray-300 p-2">Citizen</th>
              <th className="border border-gray-300 p-2">NGO</th>
              <th className="border border-gray-300 p-2">Public Worker</th>
              <th className="border border-gray-300 p-2">SuperAdmin</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(Role).map((role) => (
              <tr key={role}>
                <td className={`border border-gray-300 p-2 font-medium ${getRoleColor(role)}`}>
                  {getRoleIcon(role)} {role}
                </td>
                {Object.values(Role).map((targetRole) => {
                  const canInteract = PermissionManager.canInteractWith(
                    { role, isVerified: true },
                    { role: targetRole, isVerified: true },
                    'MESSAGE' as any
                  );
                  const canModerateTarget = PermissionManager.canModerate(
                    { role, isVerified: true },
                    { role: targetRole, isVerified: true }
                  );
                  
                  return (
                    <td key={targetRole} className="border border-gray-300 p-2 text-center">
                      {canModerateTarget ? '👮‍♂️' : canInteract ? '💬' : '❌'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-gray-600 space-y-1">
        <p>💬 = Can message/interact</p>
        <p>👮‍♂️ = Can moderate (includes interaction)</p>
        <p>❌ = Limited/No interaction</p>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-800">Available Dashboard Features</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {dashboardFeatures.map((feature) => (
          <div key={feature} className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <span className="text-sm font-medium text-blue-800">
              {feature.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
        ))}
      </div>
      
      {/* Action Buttons Available */}
      <div className="mt-6">
        <h5 className="font-semibold text-gray-800 mb-3">Available Actions</h5>
        <div className="space-y-2">
          {['request', 'event', 'user', 'content'].map((context) => {
            const actions = UIPermissionManager.getAvailableActions(user, context as any);
            return (
              <div key={context} className="bg-gray-50 p-3 rounded-lg">
                <span className="font-medium text-gray-700 capitalize">{context} Actions:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {actions.map((action) => (
                    <span
                      key={action}
                      className="bg-white px-2 py-1 rounded text-xs border text-gray-600"
                    >
                      {action.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-800">Enhanced Role System</h2>
        <p className="text-gray-600">Comprehensive role-based access control and permission management</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'permissions', label: 'Permissions', icon: '🔐' },
            { id: 'interactions', label: 'Interactions', icon: '🤝' },
            { id: 'dashboard', label: 'Dashboard', icon: '📋' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'permissions' && renderPermissions()}
        {activeTab === 'interactions' && renderInteractions()}
        {activeTab === 'dashboard' && renderDashboard()}
      </div>
    </div>
  );
};

export default RoleSystemDemo;