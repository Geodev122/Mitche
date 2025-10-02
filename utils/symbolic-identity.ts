// Symbolic Identity Management Utility
// Handles the distinction between login username and chosen symbolic identity

import { User } from '../types';

export interface SymbolicIdentity {
  name: string;
  icon: string;
}

export class SymbolicIdentityManager {
  
  /**
   * Get the display identity for a user (their chosen symbolic identity)
   */
  static getDisplayIdentity(user: User): SymbolicIdentity {
    return {
      name: user.symbolicName || user.username || 'Anonymous',
      icon: user.symbolicIcon || 'User'
    };
  }

  /**
   * Get the login identity for a user (their authentication username)
   */
  static getLoginIdentity(user: User): string {
    return user.username;
  }

  /**
   * Check if user has completed their symbolic identity setup
   */
  static hasSymbolicIdentity(user: User): boolean {
    return !!(user.symbolicName && user.symbolicIcon);
  }

  /**
   * Validate symbolic name (chosen identity name)
   */
  static validateSymbolicName(name: string): { valid: boolean; error?: string } {
    if (!name) {
      return { valid: false, error: 'Symbolic name is required' };
    }
    
    if (name.length < 2) {
      return { valid: false, error: 'Symbolic name must be at least 2 characters' };
    }
    
    if (name.length > 50) {
      return { valid: false, error: 'Symbolic name must be less than 50 characters' };
    }
    
    // Allow letters, numbers, underscores, and some unicode characters for multilingual support
    const validPattern = /^[\p{L}\p{N}_\s\-\.]+$/u;
    if (!validPattern.test(name)) {
      return { valid: false, error: 'Symbolic name contains invalid characters' };
    }
    
    return { valid: true };
  }

  /**
   * Get available symbolic icons
   */
  static getAvailableIcons(): string[] {
    return [
      'Star', 'Heart', 'Flower', 'Tree', 'Mountain', 'Sun', 'Moon', 'Lightning',
      'Flame', 'Leaf', 'Drop', 'Shield', 'Sword', 'Crown', 'Diamond', 'Crystal',
      'Feather', 'Wing', 'Eye', 'Hand', 'Dove', 'Eagle', 'Wolf', 'Lion',
      'Dragon', 'Phoenix', 'Butterfly', 'Rose', 'Lotus', 'Anchor', 'Key', 'Lock',
      'Bridge', 'Tower', 'Castle', 'Ship', 'Compass', 'Map', 'Book', 'Scroll',
      'Lantern', 'Candle', 'Bell', 'Music', 'Palette', 'Brush', 'Gear', 'Hammer',
      'Scale', 'Globe', 'Flag', 'Banner'
    ];
  }

  /**
   * Generate a suggested symbolic name based on user preferences
   */
  static generateSuggestedNames(basePreference?: string, language?: string): string[] {
    const suggestions: string[] = [];
    
    if (basePreference) {
      suggestions.push(
        `${basePreference}_Helper`,
        `${basePreference}_Hope`,
        `${basePreference}_Light`,
        `Bearer_${basePreference}`,
        `Voice_${basePreference}`
      );
    }
    
    // Add language-specific suggestions
    switch (language) {
      case 'ar':
        suggestions.push(
          'صوت_الأمل', 'نور_الخير', 'يد_العون', 'قلب_الرحمة', 'نجم_الهداية',
          'زهرة_الأمل', 'شمس_الخير', 'قمر_الرحمة', 'جسر_الحب', 'منارة_النور'
        );
        break;
      case 'fr':
        suggestions.push(
          'Porteur_Espoir', 'Voix_Lumière', 'Main_Aide', 'Cœur_Bonté', 'Étoile_Guide',
          'Fleur_Espoir', 'Soleil_Joie', 'Lune_Paix', 'Pont_Amour', 'Phare_Lumière'
        );
        break;
      default:
        suggestions.push(
          'Hope_Bearer', 'Light_Bringer', 'Gentle_Helper', 'Kind_Heart', 'Guiding_Star',
          'Silent_Guardian', 'Caring_Soul', 'Bright_Spirit', 'Warm_Presence', 'Peaceful_Mind'
        );
    }
    
    return suggestions.slice(0, 8); // Return up to 8 suggestions
  }

  /**
   * Create a legacy mapping for backward compatibility
   */
  static createLegacyMapping(user: User): { 
    userSymbolicName: string; 
    userSymbolicIcon: string; 
  } {
    const identity = this.getDisplayIdentity(user);
    return {
      userSymbolicName: identity.name,
      userSymbolicIcon: identity.icon
    };
  }

  /**
   * Update user's symbolic identity
   */
  static createIdentityUpdate(
    symbolicName: string, 
    symbolicIcon: string
  ): { symbolicName: string; symbolicIcon: string; updatedAt: Date } {
    const nameValidation = this.validateSymbolicName(symbolicName);
    if (!nameValidation.valid) {
      throw new Error(nameValidation.error);
    }

    const availableIcons = this.getAvailableIcons();
    if (!availableIcons.includes(symbolicIcon)) {
      throw new Error('Invalid symbolic icon selected');
    }

    return {
      symbolicName: symbolicName.trim(),
      symbolicIcon,
      updatedAt: new Date()
    };
  }

  /**
   * Get identity for display in different contexts
   */
  static getContextualIdentity(
    user: User, 
    context: 'formal' | 'casual' | 'anonymous'
  ): SymbolicIdentity {
    const identity = this.getDisplayIdentity(user);
    
    switch (context) {
      case 'formal':
        // For formal contexts, might use real name if revealed
        return {
          name: user.realName || identity.name,
          icon: identity.icon
        };
      case 'anonymous':
        // For anonymous contexts, use generic placeholder
        return {
          name: 'Community Helper',
          icon: 'Star'
        };
      case 'casual':
      default:
        return identity;
    }
  }

  /**
   * Check if two symbolic identities are the same
   */
  static areIdentitiesEqual(identity1: SymbolicIdentity, identity2: SymbolicIdentity): boolean {
    return identity1.name === identity2.name && identity1.icon === identity2.icon;
  }

  /**
   * Get symbolic identity history for user (if tracking changes)
   */
  static getIdentityChangeHistory(user: User): Array<{
    name: string;
    icon: string;
    changedAt: Date;
    reason?: string;
  }> {
    // This would be implemented with a separate tracking system
    // For now, return current identity as single entry
    return [{
      name: user.symbolicName || 'Unknown',
      icon: user.symbolicIcon || 'User',
      changedAt: new Date(user.joinedAt || Date.now()),
      reason: 'Initial setup'
    }];
  }

  /**
   * Search users by symbolic name (partial matching)
   */
  static searchBySymbolicName(users: User[], searchTerm: string): User[] {
    if (!searchTerm) return users;
    
    const normalizedSearch = searchTerm.toLowerCase().trim();
    return users.filter(user => 
      user.symbolicName?.toLowerCase().includes(normalizedSearch)
    );
  }

  /**
   * Get users with similar symbolic names (for preventing confusion)
   */
  static findSimilarIdentities(users: User[], targetName: string): User[] {
    const normalizedTarget = targetName.toLowerCase().trim();
    
    return users.filter(user => {
      if (!user.symbolicName) return false;
      
      const normalizedUserName = user.symbolicName.toLowerCase().trim();
      
      // Exact match
      if (normalizedUserName === normalizedTarget) return true;
      
      // Very similar (edit distance <= 2)
      if (this.calculateEditDistance(normalizedUserName, normalizedTarget) <= 2) {
        return true;
      }
      
      return false;
    });
  }

  /**
   * Calculate edit distance between two strings (for similarity checking)
   */
  private static calculateEditDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }
}

export default SymbolicIdentityManager;