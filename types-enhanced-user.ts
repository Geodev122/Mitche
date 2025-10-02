import { Role, RequestType, CommendationType, VerificationStatus } from './types';

// Enhanced User interface with role system
export interface EnhancedUser {
  id: string;
  
  // Basic profile
  username: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  symbolicName: string;
  symbolicIcon: string;
  bio?: string;
  location?: string;
  qrCodeUrl?: string;
  
  // Role and permissions
  role: Role;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  specialPermissions?: string[];
  trustScore: number;
  
  // Hope Points and Activity
  hopePoints: number;
  hopePointsBreakdown: {
    SilentHero?: number;
    VoiceOfCompassion?: number;
    CommunityBuilder?: number;
    CommunityGift?: number;
  };
  
  // Statistics
  stats: {
    helpRequestsCreated: number;
    helpOffered: number;
    eventsJoined: number;
    resourcesShared: number;
    rating: number;
    reviewCount: number;
  };
  
  // Timestamps
  joinedAt: Date;
  lastActiveAt: Date;
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
  lastPointGivenTimestamp?: number;
  
  // Settings and preferences
  settings: {
    notifications: boolean;
    privacy: 'public' | 'friends' | 'private';
    language: string;
  };
  preferredLanguages: string[];
  
  // Role-specific information
  departmentInfo?: {
    department: string;
    position: string;
    supervisor: string;
    contact: string;
  };
  
  organizationInfo?: {
    name: string;
    type: string;
    registrationNumber: string;
    taxId: string;
    website?: string;
    contact: string;
  };
  
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
  };
  
  // Activity tracking
  locationHistory: Array<{
    region: string;
    timestamp: Date;
    activity: string;
  }>;
  
  interactionHistory: Array<{
    type: 'help_request' | 'help_offer' | 'event_join' | 'resource_share';
    targetId: string;
    timestamp: Date;
    outcome: 'completed' | 'cancelled' | 'pending';
  }>;
  
  // Legacy fields for backward compatibility
  password?: string;
  hasCompletedOnboarding?: boolean;
  nominationStatus?: 'Nominated' | 'AcceptedReveal' | 'AcceptedAnonymous';
  realName?: string;
  commendations?: {
    [key in CommendationType]?: number;
  };
}

// Type guard to check if user has enhanced properties
export function isEnhancedUser(user: any): user is EnhancedUser {
  return user && 
         typeof user.trustScore === 'number' &&
         user.stats &&
         user.settings &&
         Array.isArray(user.preferredLanguages);
}

// Migration utility to convert legacy User to EnhancedUser
export function migrateToEnhancedUser(legacyUser: any): EnhancedUser {
  const now = new Date();
  
  return {
    id: legacyUser.id,
    username: legacyUser.username || 'Unknown',
    displayName: legacyUser.displayName || legacyUser.realName || legacyUser.username,
    email: legacyUser.email || '',
    photoURL: legacyUser.photoUrl || legacyUser.photoURL || '',
    symbolicName: legacyUser.symbolicName || '',
    symbolicIcon: legacyUser.symbolicIcon || '',
    bio: legacyUser.bio || '',
    location: legacyUser.location || '',
    qrCodeUrl: legacyUser.qrCodeUrl || '',
    
    role: legacyUser.role || Role.Citizen,
    isVerified: legacyUser.isVerified || false,
    verificationStatus: legacyUser.verificationStatus || 'NotRequested',
    specialPermissions: legacyUser.specialPermissions || [],
    trustScore: legacyUser.trustScore || 50, // Base trust score
    
    hopePoints: legacyUser.hopePoints || 0,
    hopePointsBreakdown: legacyUser.hopePointsBreakdown || {},
    
    stats: {
      helpRequestsCreated: legacyUser.stats?.helpRequestsCreated || 0,
      helpOffered: legacyUser.stats?.helpOffered || 0,
      eventsJoined: legacyUser.stats?.eventsJoined || 0,
      resourcesShared: legacyUser.stats?.resourcesShared || 0,
      rating: legacyUser.stats?.rating || 0,
      reviewCount: legacyUser.stats?.reviewCount || 0
    },
    
    joinedAt: legacyUser.joinedAt ? new Date(legacyUser.joinedAt) : now,
    lastActiveAt: legacyUser.lastActiveAt ? new Date(legacyUser.lastActiveAt) : now,
    lastLoginAt: legacyUser.lastLoginAt ? new Date(legacyUser.lastLoginAt) : now,
    createdAt: legacyUser.createdAt ? new Date(legacyUser.createdAt) : now,
    updatedAt: legacyUser.updatedAt ? new Date(legacyUser.updatedAt) : now,
    lastPointGivenTimestamp: legacyUser.lastPointGivenTimestamp,
    
    settings: legacyUser.settings || {
      notifications: true,
      privacy: 'public',
      language: 'en'
    },
    preferredLanguages: legacyUser.preferredLanguages || ['en'],
    
    departmentInfo: legacyUser.departmentInfo,
    organizationInfo: legacyUser.organizationInfo,
    emergencyContact: legacyUser.emergencyContact,
    
    locationHistory: legacyUser.locationHistory || [],
    interactionHistory: legacyUser.interactionHistory || [],
    
    // Legacy fields
    password: legacyUser.password,
    hasCompletedOnboarding: legacyUser.hasCompletedOnboarding,
    nominationStatus: legacyUser.nominationStatus,
    realName: legacyUser.realName,
    commendations: legacyUser.commendations
  };
}

export default EnhancedUser;