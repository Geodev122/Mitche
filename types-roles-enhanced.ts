// Enhanced Role System Types for Mitché Platform
// This file defines comprehensive role-based permissions and interactions

import { Role, HopePointCategory } from './types';

// Enhanced Role System
export enum RoleLevel {
  Citizen = 1,
  NGO = 2,
  PublicWorker = 3,
  SuperAdmin = 4
}

export enum VerificationLevel {
  Unverified = 0,
  PendingVerification = 1,
  BasicVerified = 2,
  FullyVerified = 3,
  OfficiallyVerified = 4
}

export enum PermissionType {
  // Content Management
  CREATE_REQUEST = 'CREATE_REQUEST',
  CREATE_EVENT = 'CREATE_EVENT',
  CREATE_RESOURCE = 'CREATE_RESOURCE',
  MODERATE_CONTENT = 'MODERATE_CONTENT',
  
  // User Management
  VERIFY_USERS = 'VERIFY_USERS',
  SUSPEND_USERS = 'SUSPEND_USERS',
  DELETE_USERS = 'DELETE_USERS',
  
  // Analytics Access
  VIEW_BASIC_ANALYTICS = 'VIEW_BASIC_ANALYTICS',
  VIEW_PROGRAM_ANALYTICS = 'VIEW_PROGRAM_ANALYTICS',
  VIEW_REGIONAL_ANALYTICS = 'VIEW_REGIONAL_ANALYTICS',
  VIEW_FULL_ANALYTICS = 'VIEW_FULL_ANALYTICS',
  
  // Communication
  SEND_DIRECT_MESSAGES = 'SEND_DIRECT_MESSAGES',
  SEND_BULK_MESSAGES = 'SEND_BULK_MESSAGES',
  SEND_PLATFORM_ANNOUNCEMENTS = 'SEND_PLATFORM_ANNOUNCEMENTS',
  
  // Special Actions
  HANDLE_REPORTS = 'HANDLE_REPORTS',
  ESCALATE_ISSUES = 'ESCALATE_ISSUES',
  CREATE_POLICIES = 'CREATE_POLICIES',
  EMERGENCY_ACTIONS = 'EMERGENCY_ACTIONS'
}

// Role-based Permission Matrix
export const ROLE_PERMISSIONS: Record<Role, PermissionType[]> = {
  [Role.Citizen]: [
    PermissionType.CREATE_REQUEST,
    PermissionType.VIEW_BASIC_ANALYTICS,
    PermissionType.SEND_DIRECT_MESSAGES
  ],
  [Role.NGO]: [
    PermissionType.CREATE_REQUEST,
    PermissionType.CREATE_EVENT,
    PermissionType.CREATE_RESOURCE,
    PermissionType.VIEW_BASIC_ANALYTICS,
    PermissionType.VIEW_PROGRAM_ANALYTICS,
    PermissionType.SEND_DIRECT_MESSAGES,
    PermissionType.SEND_BULK_MESSAGES,
    PermissionType.ESCALATE_ISSUES
  ],
  [Role.PublicWorker]: [
    PermissionType.CREATE_REQUEST,
    PermissionType.CREATE_EVENT,
    PermissionType.CREATE_RESOURCE,
    PermissionType.MODERATE_CONTENT,
    PermissionType.VERIFY_USERS,
    PermissionType.VIEW_BASIC_ANALYTICS,
    PermissionType.VIEW_PROGRAM_ANALYTICS,
    PermissionType.VIEW_REGIONAL_ANALYTICS,
    PermissionType.SEND_DIRECT_MESSAGES,
    PermissionType.SEND_BULK_MESSAGES,
    PermissionType.HANDLE_REPORTS,
    PermissionType.ESCALATE_ISSUES,
    PermissionType.EMERGENCY_ACTIONS
  ],
  [Role.Admin]: [
    ...Object.values(PermissionType) // SuperAdmin has all permissions
  ]
};

// Enhanced User Role Interface
export interface EnhancedUserRole {
  role: Role;
  level: RoleLevel;
  verificationLevel: VerificationLevel;
  verificationDate?: Date;
  verifiedBy?: string;
  permissions: PermissionType[];
  specialPermissions?: PermissionType[]; // Temporary elevated permissions
  
  // Role-specific data
  organizationInfo?: OrganizationInfo;
  governmentInfo?: GovernmentInfo;
  adminInfo?: AdminInfo;
}

export interface OrganizationInfo {
  organizationName: string;
  organizationType: 'NGO' | 'Charity' | 'Foundation' | 'Community Group';
  registrationNumber?: string;
  websiteUrl?: string;
  contactEmail: string;
  contactPhone?: string;
  missionStatement: string;
  serviceAreas: string[];
  verificationDocuments: string[];
  supervisorContact?: {
    name: string;
    email: string;
    phone?: string;
  };
}

export interface GovernmentInfo {
  department: string;
  position: string;
  employeeId: string;
  region: string;
  supervisorName: string;
  supervisorEmail: string;
  verificationDocuments: string[];
  securityClearanceLevel?: 'Basic' | 'Intermediate' | 'High';
  authorizedActions: string[];
}

export interface AdminInfo {
  adminLevel: 'Platform' | 'Regional' | 'Department';
  assignedBy: string;
  assignmentDate: Date;
  adminPermissions: PermissionType[];
  securityCredentials: {
    twoFactorEnabled: boolean;
    lastSecurityCheck: Date;
    accessLevel: 'Limited' | 'Full' | 'Emergency';
  };
}

// Enhanced Hope Point Categories by Role
export const ROLE_HOPE_CATEGORIES: Record<Role, HopePointCategory[]> = {
  [Role.Citizen]: [
    HopePointCategory.SilentHero,
    HopePointCategory.VoiceOfCompassion
  ],
  [Role.NGO]: [
    HopePointCategory.CommunityBuilder,
    HopePointCategory.VoiceOfCompassion,
    'ProgramImpact' as HopePointCategory
  ],
  [Role.PublicWorker]: [
    HopePointCategory.CommunityBuilder,
    'ServiceExcellence' as HopePointCategory,
    'PolicyImpact' as HopePointCategory
  ],
  [Role.Admin]: [
    'PlatformLeadership' as HopePointCategory,
    'CommunityGuidance' as HopePointCategory,
    HopePointCategory.CommunityBuilder
  ]
};

// Role Interaction Rules
export interface RoleInteraction {
  fromRole: Role;
  toRole: Role;
  allowedActions: InteractionAction[];
  restrictions?: string[];
  requiresVerification?: boolean;
}

export enum InteractionAction {
  SEND_MESSAGE = 'SEND_MESSAGE',
  CREATE_EVENT_TOGETHER = 'CREATE_EVENT_TOGETHER',
  SHARE_RESOURCES = 'SHARE_RESOURCES',
  COLLABORATE_ON_PROGRAM = 'COLLABORATE_ON_PROGRAM',
  REQUEST_VERIFICATION = 'REQUEST_VERIFICATION',
  ESCALATE_REPORT = 'ESCALATE_REPORT',
  PROVIDE_OVERSIGHT = 'PROVIDE_OVERSIGHT',
  MODERATE_CONTENT = 'MODERATE_CONTENT'
}

export const ROLE_INTERACTIONS: RoleInteraction[] = [
  // Citizen interactions
  {
    fromRole: Role.Citizen,
    toRole: Role.NGO,
    allowedActions: [
      InteractionAction.SEND_MESSAGE,
      InteractionAction.SHARE_RESOURCES
    ]
  },
  {
    fromRole: Role.Citizen,
    toRole: Role.PublicWorker,
    allowedActions: [
      InteractionAction.SEND_MESSAGE,
      InteractionAction.SHARE_RESOURCES,
      InteractionAction.ESCALATE_REPORT
    ]
  },
  
  // NGO interactions
  {
    fromRole: Role.NGO,
    toRole: Role.PublicWorker,
    allowedActions: [
      InteractionAction.SEND_MESSAGE,
      InteractionAction.CREATE_EVENT_TOGETHER,
      InteractionAction.COLLABORATE_ON_PROGRAM,
      InteractionAction.SHARE_RESOURCES
    ],
    requiresVerification: true
  },
  {
    fromRole: Role.NGO,
    toRole: Role.Admin,
    allowedActions: [
      InteractionAction.REQUEST_VERIFICATION,
      InteractionAction.ESCALATE_REPORT
    ]
  },
  
  // Public Worker interactions
  {
    fromRole: Role.PublicWorker,
    toRole: Role.Admin,
    allowedActions: [
      InteractionAction.ESCALATE_REPORT,
      InteractionAction.REQUEST_VERIFICATION
    ]
  },
  
  // Admin interactions (SuperAdmin can interact with everyone)
  {
    fromRole: Role.Admin,
    toRole: Role.Citizen,
    allowedActions: [
      InteractionAction.SEND_MESSAGE,
      InteractionAction.MODERATE_CONTENT,
      InteractionAction.PROVIDE_OVERSIGHT
    ]
  },
  {
    fromRole: Role.Admin,
    toRole: Role.NGO,
    allowedActions: [
      InteractionAction.SEND_MESSAGE,
      InteractionAction.MODERATE_CONTENT,
      InteractionAction.PROVIDE_OVERSIGHT,
      InteractionAction.REQUEST_VERIFICATION
    ]
  },
  {
    fromRole: Role.Admin,
    toRole: Role.PublicWorker,
    allowedActions: [
      InteractionAction.SEND_MESSAGE,
      InteractionAction.MODERATE_CONTENT,
      InteractionAction.PROVIDE_OVERSIGHT,
      InteractionAction.REQUEST_VERIFICATION
    ]
  }
];

// Trust Score Calculation
export interface TrustScore {
  baseScore: number;
  roleBonus: number;
  verificationBonus: number;
  communityRating: number;
  totalScore: number;
  lastUpdated: Date;
}

export function calculateTrustScore(
  role: Role,
  verificationLevel: VerificationLevel,
  communityRating: number,
  baseScore: number = 50
): TrustScore {
  const roleBonus = getRoleLevel(role) * 25;
  const verificationBonus = verificationLevel * 50;
  const ratingBonus = communityRating * 20;
  
  const totalScore = Math.min(baseScore + roleBonus + verificationBonus + ratingBonus, 1000);
  
  return {
    baseScore,
    roleBonus,
    verificationBonus,
    communityRating: ratingBonus,
    totalScore,
    lastUpdated: new Date()
  };
}

export function getRoleLevel(role: Role): RoleLevel {
  switch (role) {
    case Role.Citizen: return RoleLevel.Citizen;
    case Role.NGO: return RoleLevel.NGO;
    case Role.PublicWorker: return RoleLevel.PublicWorker;
    case Role.Admin: return RoleLevel.SuperAdmin;
    default: return RoleLevel.Citizen;
  }
}

export function hasPermission(userRole: Role, permission: PermissionType): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
}

export function canInteract(
  fromRole: Role,
  toRole: Role,
  action: InteractionAction,
  isVerified: boolean = false
): boolean {
  const interaction = ROLE_INTERACTIONS.find(
    i => i.fromRole === fromRole && i.toRole === toRole
  );
  
  if (!interaction) return false;
  if (!interaction.allowedActions.includes(action)) return false;
  if (interaction.requiresVerification && !isVerified) return false;
  
  return true;
}

// Role-based Hope Point Multipliers
export const ROLE_HOPE_MULTIPLIERS: Record<Role, number> = {
  [Role.Citizen]: 1.0,
  [Role.NGO]: 1.5, // 2.0 when verified
  [Role.PublicWorker]: 2.0,
  [Role.Admin]: 3.0
};

export function getHopePointMultiplier(role: Role, isVerified: boolean): number {
  const baseMultiplier = ROLE_HOPE_MULTIPLIERS[role];
  
  // NGOs get additional bonus when verified
  if (role === Role.NGO && isVerified) {
    return 2.0;
  }
  
  return baseMultiplier;
}

// Verification Requirements
export interface VerificationRequirement {
  role: Role;
  requiredDocuments: string[];
  verificationSteps: string[];
  reviewerRole: Role;
  autoApprove?: boolean;
}

export const VERIFICATION_REQUIREMENTS: VerificationRequirement[] = [
  {
    role: Role.NGO,
    requiredDocuments: [
      'Organization Registration Certificate',
      'Tax-Exempt Status Document',
      'Mission Statement',
      'Leadership Contact Information',
      'Recent Activity Report'
    ],
    verificationSteps: [
      'Document Review',
      'Background Check',
      'Reference Verification',
      'SuperAdmin Approval'
    ],
    reviewerRole: Role.Admin
  },
  {
    role: Role.PublicWorker,
    requiredDocuments: [
      'Government Employee ID',
      'Department Authorization Letter',
      'Supervisor Contact Information',
      'Background Check Clearance',
      'Job Description'
    ],
    verificationSteps: [
      'Identity Verification',
      'Employment Verification',
      'Security Clearance Check',
      'SuperAdmin Approval'
    ],
    reviewerRole: Role.Admin
  }
];