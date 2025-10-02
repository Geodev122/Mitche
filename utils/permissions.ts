// Enhanced Permission System for Mitché Platform
// Centralized role-based access control and permission management

import { Role } from '../types';
import { 
  PermissionType, 
  RoleLevel, 
  VerificationLevel,
  EnhancedUserRole,
  InteractionAction,
  hasPermission,
  canInteract,
  calculateTrustScore,
  getHopePointMultiplier,
  ROLE_PERMISSIONS
} from '../types-roles-enhanced';

export class PermissionManager {
  
  /**
   * Check if a user has a specific permission
   */
  static hasPermission(user: any, permission: PermissionType): boolean {
    if (!user || !user.role) return false;
    
    // SuperAdmin has all permissions
    if (user.role === Role.Admin) return true;
    
    // Check role-based permissions
    const rolePermissions = ROLE_PERMISSIONS[user.role as Role] || [];
    if (rolePermissions.includes(permission)) return true;
    
    // Check special temporary permissions
    if (user.specialPermissions?.includes(permission)) return true;
    
    return false;
  }

  /**
   * Check if a user can perform an action on another user
   */
  static canInteractWith(
    fromUser: any, 
    toUser: any, 
    action: InteractionAction
  ): boolean {
    if (!fromUser || !toUser) return false;
    
    // SuperAdmin can interact with everyone
    if (fromUser.role === Role.Admin) return true;
    
    return canInteract(
      fromUser.role,
      toUser.role,
      action,
      fromUser.isVerified || false
    );
  }

  /**
   * Get all permissions for a user role
   */
  static getUserPermissions(user: any): PermissionType[] {
    if (!user || !user.role) return [];
    
    const rolePermissions = ROLE_PERMISSIONS[user.role as Role] || [];
    const specialPermissions = user.specialPermissions || [];
    
    return [...new Set([...rolePermissions, ...specialPermissions])];
  }

  /**
   * Check if user can access a specific route/feature
   */
  static canAccessRoute(user: any, routePermissions: PermissionType[]): boolean {
    if (!user || !routePermissions.length) return false;
    
    return routePermissions.some(permission => 
      this.hasPermission(user, permission)
    );
  }

  /**
   * Get role hierarchy level for comparison
   */
  static getRoleHierarchy(role: Role): number {
    switch (role) {
      case Role.Admin: return 4;
      case Role.PublicWorker: return 3;
      case Role.NGO: return 2;
      case Role.Citizen: return 1;
      default: return 0;
    }
  }

  /**
   * Check if user can moderate another user
   */
  static canModerate(moderator: any, target: any): boolean {
    if (!moderator || !target) return false;
    
    // SuperAdmin can moderate everyone
    if (moderator.role === Role.Admin) return true;
    
    // Public Workers can moderate Citizens and NGOs
    if (moderator.role === Role.PublicWorker) {
      return target.role === Role.Citizen || target.role === Role.NGO;
    }
    
    // Same role users cannot moderate each other (except admin)
    return false;
  }

  /**
   * Calculate user's effective hope point multiplier
   */
  static getEffectiveHopeMultiplier(user: any): number {
    if (!user || !user.role) return 1;
    
    return getHopePointMultiplier(user.role, user.isVerified || false);
  }

  /**
   * Check if user needs verification for their role
   */
  static needsVerification(user: any): boolean {
    if (!user || !user.role) return false;
    
    return (
      (user.role === Role.NGO || user.role === Role.PublicWorker) &&
      user.verificationStatus !== 'Approved'
    );
  }

  /**
   * Get verification requirements for a role
   */
  static getVerificationRequirements(role: Role): string[] {
    switch (role) {
      case Role.NGO:
        return [
          'Organization Registration Certificate',
          'Tax-Exempt Status Document',
          'Mission Statement',
          'Leadership Contact Information',
          'Recent Activity Report'
        ];
      case Role.PublicWorker:
        return [
          'Government Employee ID',
          'Department Authorization Letter',
          'Supervisor Contact Information',
          'Background Check Clearance',
          'Job Description'
        ];
      default:
        return [];
    }
  }

  /**
   * Check if user can create content of specific type
   */
  static canCreateContent(user: any, contentType: 'request' | 'event' | 'resource'): boolean {
    if (!user) return false;

    switch (contentType) {
      case 'request':
        return this.hasPermission(user, PermissionType.CREATE_REQUEST);
      case 'event':
        return this.hasPermission(user, PermissionType.CREATE_EVENT);
      case 'resource':
        return this.hasPermission(user, PermissionType.CREATE_RESOURCE) && 
               (user.isVerified || user.role === Role.Admin);
      default:
        return false;
    }
  }

  /**
   * Get available analytics level for user
   */
  static getAnalyticsLevel(user: any): 'none' | 'basic' | 'program' | 'regional' | 'full' {
    if (!user) return 'none';

    if (this.hasPermission(user, PermissionType.VIEW_FULL_ANALYTICS)) {
      return 'full';
    }
    if (this.hasPermission(user, PermissionType.VIEW_REGIONAL_ANALYTICS)) {
      return 'regional';
    }
    if (this.hasPermission(user, PermissionType.VIEW_PROGRAM_ANALYTICS)) {
      return 'program';
    }
    if (this.hasPermission(user, PermissionType.VIEW_BASIC_ANALYTICS)) {
      return 'basic';
    }
    
    return 'none';
  }

  /**
   * Check if user can send bulk messages
   */
  static canSendBulkMessages(user: any, targetAudience: 'event' | 'platform' | 'department'): boolean {
    if (!user) return false;

    switch (targetAudience) {
      case 'event':
        // NGOs and above can send to event participants
        return this.getRoleHierarchy(user.role) >= 2;
      case 'department':
        // Public Workers can send to their department
        return user.role === Role.PublicWorker && user.isVerified;
      case 'platform':
        // Only SuperAdmin can send platform-wide messages
        return user.role === Role.Admin;
      default:
        return false;
    }
  }

  /**
   * Get role-specific dashboard features
   */
  static getDashboardFeatures(user: any): string[] {
    if (!user) return [];

    const features: string[] = ['basic_stats', 'personal_activity'];

    switch (user.role) {
      case Role.Admin:
        features.push(
          'user_management',
          'content_moderation',
          'platform_analytics',
          'system_settings',
          'verification_queue',
          'emergency_controls'
        );
        break;
      
      case Role.PublicWorker:
        features.push(
          'regional_analytics',
          'content_moderation',
          'citizen_feedback',
          'policy_insights',
          'ngo_oversight'
        );
        if (user.isVerified) {
          features.push('official_announcements', 'emergency_alerts');
        }
        break;
      
      case Role.NGO:
        features.push(
          'program_management',
          'event_analytics',
          'volunteer_coordination'
        );
        if (user.isVerified) {
          features.push(
            'partnership_requests',
            'resource_certification',
            'impact_reporting'
          );
        }
        break;
      
      case Role.Citizen:
        features.push(
          'community_feed',
          'help_requests',
          'local_events'
        );
        break;
    }

    return features;
  }

  /**
   * Check if user can escalate issues
   */
  static canEscalate(user: any, issueType: 'content' | 'user' | 'policy'): boolean {
    if (!user) return false;

    switch (issueType) {
      case 'content':
        return this.getRoleHierarchy(user.role) >= 2; // NGO and above
      case 'user':
        return this.getRoleHierarchy(user.role) >= 3; // Public Worker and above
      case 'policy':
        return user.role === Role.Admin; // SuperAdmin only
      default:
        return false;
    }
  }

  /**
   * Get maximum file upload size based on role
   */
  static getMaxUploadSize(user: any): number {
    if (!user) return 1; // 1MB for anonymous

    switch (user.role) {
      case Role.Admin: return 100; // 100MB
      case Role.PublicWorker: return 50; // 50MB
      case Role.NGO: return user.isVerified ? 25 : 10; // 25MB verified, 10MB unverified
      case Role.Citizen: return 5; // 5MB
      default: return 1;
    }
  }

  /**
   * Get rate limits for API calls
   */
  static getRateLimits(user: any): { requests: number; window: number } {
    if (!user) return { requests: 10, window: 60 }; // 10 requests per minute

    switch (user.role) {
      case Role.Admin: 
        return { requests: 1000, window: 60 }; // 1000/min
      case Role.PublicWorker: 
        return { requests: 500, window: 60 }; // 500/min
      case Role.NGO: 
        return { requests: user.isVerified ? 200 : 100, window: 60 }; // 200/min verified, 100/min unverified
      case Role.Citizen: 
        return { requests: 50, window: 60 }; // 50/min
      default: 
        return { requests: 10, window: 60 };
    }
  }
}

// Role-based UI Component Access Control
export class UIPermissionManager {
  
  /**
   * Check if user should see admin menu items
   */
  static showAdminMenu(user: any): boolean {
    return user?.role === Role.Admin;
  }

  /**
   * Check if user should see moderation tools
   */
  static showModerationTools(user: any): boolean {
    return PermissionManager.hasPermission(user, PermissionType.MODERATE_CONTENT);
  }

  /**
   * Check if user should see verification badge
   */
  static showVerificationBadge(user: any): boolean {
    return user?.isVerified && (user.role === Role.NGO || user.role === Role.PublicWorker);
  }

  /**
   * Get role-specific UI theme/styling
   */
  static getRoleTheme(user: any): string {
    if (!user) return 'default';

    switch (user.role) {
      case Role.Admin: return 'admin-theme';
      case Role.PublicWorker: return 'official-theme';
      case Role.NGO: return user.isVerified ? 'verified-ngo-theme' : 'ngo-theme';
      case Role.Citizen: return 'citizen-theme';
      default: return 'default';
    }
  }

  /**
   * Get available action buttons for user
   */
  static getAvailableActions(user: any, context: 'request' | 'event' | 'user' | 'content'): string[] {
    const actions: string[] = [];

    if (!user) return actions;

    switch (context) {
      case 'request':
        actions.push('view', 'offer_help');
        if (PermissionManager.hasPermission(user, PermissionType.CREATE_REQUEST)) {
          actions.push('create');
        }
        if (PermissionManager.hasPermission(user, PermissionType.MODERATE_CONTENT)) {
          actions.push('moderate', 'flag');
        }
        break;

      case 'event':
        actions.push('view', 'join');
        if (PermissionManager.hasPermission(user, PermissionType.CREATE_EVENT)) {
          actions.push('create');
        }
        break;

      case 'user':
        actions.push('view_profile', 'message');
        if (PermissionManager.hasPermission(user, PermissionType.VERIFY_USERS)) {
          actions.push('verify');
        }
        if (PermissionManager.hasPermission(user, PermissionType.SUSPEND_USERS)) {
          actions.push('suspend');
        }
        break;

      case 'content':
        actions.push('view', 'report');
        if (PermissionManager.hasPermission(user, PermissionType.MODERATE_CONTENT)) {
          actions.push('edit', 'delete', 'moderate');
        }
        break;
    }

    return actions;
  }
}

export default PermissionManager;