// Database Migration: Symbolic Identity Cleanup
// Ensures proper distinction between login username and symbolic identity

import { collection, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../services/firebase';
import { SymbolicIdentityManager } from './symbolic-identity';

export interface MigrationResult {
  success: boolean;
  usersProcessed: number;
  requestsProcessed: number;
  errors: string[];
  warnings: string[];
}

export class SymbolicIdentityMigration {
  
  /**
   * Main migration function to clean up symbolic identity data
   */
  static async migrateSymbolicIdentities(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      usersProcessed: 0,
      requestsProcessed: 0,
      errors: [],
      warnings: []
    };

    try {
      console.log('Starting symbolic identity migration...');

      // Step 1: Migrate users collection
      const userResult = await this.migrateUsersCollection();
      result.usersProcessed = userResult.processed;
      result.errors.push(...userResult.errors);
      result.warnings.push(...userResult.warnings);

      // Step 2: Migrate requests collection
      const requestResult = await this.migrateRequestsCollection();
      result.requestsProcessed = requestResult.processed;
      result.errors.push(...requestResult.errors);
      result.warnings.push(...requestResult.warnings);

      // Step 3: Migrate other collections that reference symbolic identities
      await this.migrateOtherCollections();

      result.success = result.errors.length === 0;
      
      console.log('Symbolic identity migration completed', result);
      return result;

    } catch (error) {
      console.error('Migration failed:', error);
      result.errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }

  /**
   * Migrate users collection to ensure proper symbolic identity setup
   */
  private static async migrateUsersCollection(): Promise<{
    processed: number;
    errors: string[];
    warnings: string[];
  }> {
    const result: { processed: number; errors: string[]; warnings: string[] } = { 
      processed: 0, 
      errors: [], 
      warnings: [] 
    };

    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const batch = writeBatch(db);
      let batchCount = 0;

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const updates: any = {};
        let needsUpdate = false;

        // Ensure username exists (login identifier)
        if (!userData.username) {
          if (userData.email) {
            updates.username = userData.email.split('@')[0];
            needsUpdate = true;
            result.warnings.push(`Generated username for user ${userDoc.id}`);
          } else {
            updates.username = `user_${userDoc.id.substring(0, 8)}`;
            needsUpdate = true;
            result.warnings.push(`Generated fallback username for user ${userDoc.id}`);
          }
        }

        // Ensure symbolic identity exists
        if (!userData.symbolicName) {
          // Generate a symbolic name based on username or email
          const baseIdentity = userData.username || userData.email?.split('@')[0] || 'Helper';
          const suggestions = SymbolicIdentityManager.generateSuggestedNames(baseIdentity, 'en');
          updates.symbolicName = suggestions[0] || `${baseIdentity}_Helper`;
          needsUpdate = true;
          result.warnings.push(`Generated symbolic name for user ${userDoc.id}`);
        }

        if (!userData.symbolicIcon) {
          updates.symbolicIcon = 'Star'; // Default icon
          needsUpdate = true;
          result.warnings.push(`Set default symbolic icon for user ${userDoc.id}`);
        }

        // Validate existing symbolic name
        if (userData.symbolicName) {
          const validation = SymbolicIdentityManager.validateSymbolicName(userData.symbolicName);
          if (!validation.valid) {
            // Fix invalid symbolic name
            const cleanName = userData.symbolicName.replace(/[^\p{L}\p{N}_\s\-\.]/gu, '');
            updates.symbolicName = cleanName || `Helper_${userDoc.id.substring(0, 8)}`;
            needsUpdate = true;
            result.warnings.push(`Fixed invalid symbolic name for user ${userDoc.id}`);
          }
        }

        // Add timestamp if missing
        if (!userData.updatedAt) {
          updates.updatedAt = new Date();
          needsUpdate = true;
        }

        if (needsUpdate) {
          batch.update(doc(db, 'users', userDoc.id), updates);
          batchCount++;
          result.processed++;

          // Commit batch if it gets too large
          if (batchCount >= 500) {
            await batch.commit();
            batchCount = 0;
          }
        }
      }

      // Commit remaining updates
      if (batchCount > 0) {
        await batch.commit();
      }

    } catch (error) {
      result.errors.push(`Users migration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Migrate requests collection to ensure proper symbolic identity references
   */
  private static async migrateRequestsCollection(): Promise<{
    processed: number;
    errors: string[];
    warnings: string[];
  }> {
    const result: { processed: number; errors: string[]; warnings: string[] } = { 
      processed: 0, 
      errors: [], 
      warnings: [] 
    };

    try {
      const requestsSnapshot = await getDocs(collection(db, 'requests'));
      const usersSnapshot = await getDocs(collection(db, 'users'));
      
      // Create user lookup map
      const userMap = new Map();
      usersSnapshot.docs.forEach(doc => {
        userMap.set(doc.id, doc.data());
      });

      const batch = writeBatch(db);
      let batchCount = 0;

      for (const requestDoc of requestsSnapshot.docs) {
        const requestData = requestDoc.data();
        const updates: any = {};
        let needsUpdate = false;

        // Get the user who created this request
        const creator = userMap.get(requestData.userId);

        if (creator) {
          // Update symbolic identity fields if they don't match current user data
          if (requestData.userSymbolicName !== creator.symbolicName) {
            updates.userSymbolicName = creator.symbolicName;
            needsUpdate = true;
          }

          if (requestData.userSymbolicIcon !== creator.symbolicIcon) {
            updates.userSymbolicIcon = creator.symbolicIcon;
            needsUpdate = true;
          }

          // Add new enhanced fields for future compatibility
          if (!requestData.creatorSymbolicName) {
            updates.creatorSymbolicName = creator.symbolicName;
            needsUpdate = true;
          }

          if (!requestData.creatorSymbolicIcon) {
            updates.creatorSymbolicIcon = creator.symbolicIcon;
            needsUpdate = true;
          }
        } else {
          // Creator not found, use fallback values
          if (!requestData.userSymbolicName) {
            updates.userSymbolicName = 'Unknown Helper';
            needsUpdate = true;
            result.warnings.push(`Set fallback symbolic name for request ${requestDoc.id}`);
          }

          if (!requestData.userSymbolicIcon) {
            updates.userSymbolicIcon = 'Star';
            needsUpdate = true;
            result.warnings.push(`Set fallback symbolic icon for request ${requestDoc.id}`);
          }
        }

        if (needsUpdate) {
          batch.update(doc(db, 'requests', requestDoc.id), updates);
          batchCount++;
          result.processed++;

          // Commit batch if it gets too large
          if (batchCount >= 500) {
            await batch.commit();
            batchCount = 0;
          }
        }
      }

      // Commit remaining updates
      if (batchCount > 0) {
        await batch.commit();
      }

    } catch (error) {
      result.errors.push(`Requests migration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Migrate other collections that reference symbolic identities
   */
  private static async migrateOtherCollections(): Promise<void> {
    try {
      // Get users for reference
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const userMap = new Map();
      usersSnapshot.docs.forEach(doc => {
        userMap.set(doc.id, doc.data());
      });

      // Migrate community events
      await this.migrateCollectionWithOrganizerFields('communityEvents', userMap);
      
      // Migrate resources
      await this.migrateCollectionWithOrganizerFields('resources', userMap);
      
      // Migrate offerings
      await this.migrateCollectionWithOffererFields('offerings', userMap);

      // Migrate tapestry threads
      await this.migrateCollectionWithHonoreeFields('tapestryThreads', userMap);

    } catch (error) {
      console.error('Error migrating other collections:', error);
    }
  }

  /**
   * Helper method to migrate collections with organizer fields
   */
  private static async migrateCollectionWithOrganizerFields(
    collectionName: string, 
    userMap: Map<string, any>
  ): Promise<void> {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      const batch = writeBatch(db);
      let batchCount = 0;

      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        const updates: any = {};
        let needsUpdate = false;

        if (data.organizerId) {
          const organizer = userMap.get(data.organizerId);
          
          if (organizer) {
            if (data.organizerSymbolicName !== organizer.symbolicName) {
              updates.organizerSymbolicName = organizer.symbolicName;
              needsUpdate = true;
            }

            if (data.organizerSymbolicIcon !== organizer.symbolicIcon) {
              updates.organizerSymbolicIcon = organizer.symbolicIcon;
              needsUpdate = true;
            }
          }
        }

        if (needsUpdate) {
          batch.update(doc(db, collectionName, docSnapshot.id), updates);
          batchCount++;

          if (batchCount >= 500) {
            await batch.commit();
            batchCount = 0;
          }
        }
      }

      if (batchCount > 0) {
        await batch.commit();
      }

    } catch (error) {
      console.error(`Error migrating ${collectionName}:`, error);
    }
  }

  /**
   * Helper method to migrate collections with offerer fields
   */
  private static async migrateCollectionWithOffererFields(
    collectionName: string, 
    userMap: Map<string, any>
  ): Promise<void> {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      const batch = writeBatch(db);
      let batchCount = 0;

      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        const updates: any = {};
        let needsUpdate = false;

        if (data.userId) {
          const user = userMap.get(data.userId);
          
          if (user) {
            if (data.offererSymbolicName !== user.symbolicName) {
              updates.offererSymbolicName = user.symbolicName;
              needsUpdate = true;
            }

            if (data.offererSymbolicIcon !== user.symbolicIcon) {
              updates.offererSymbolicIcon = user.symbolicIcon;
              needsUpdate = true;
            }
          }
        }

        if (needsUpdate) {
          batch.update(doc(db, collectionName, docSnapshot.id), updates);
          batchCount++;

          if (batchCount >= 500) {
            await batch.commit();
            batchCount = 0;
          }
        }
      }

      if (batchCount > 0) {
        await batch.commit();
      }

    } catch (error) {
      console.error(`Error migrating ${collectionName}:`, error);
    }
  }

  /**
   * Helper method to migrate collections with honoree fields
   */
  private static async migrateCollectionWithHonoreeFields(
    collectionName: string, 
    userMap: Map<string, any>
  ): Promise<void> {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      const batch = writeBatch(db);
      let batchCount = 0;

      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        const updates: any = {};
        let needsUpdate = false;

        if (data.honoreeUserId) {
          const honoree = userMap.get(data.honoreeUserId);
          
          if (honoree) {
            if (data.honoreeSymbolicName !== honoree.symbolicName) {
              updates.honoreeSymbolicName = honoree.symbolicName;
              needsUpdate = true;
            }

            if (data.honoreeSymbolicIcon !== honoree.symbolicIcon) {
              updates.honoreeSymbolicIcon = honoree.symbolicIcon;
              needsUpdate = true;
            }
          }
        }

        if (needsUpdate) {
          batch.update(doc(db, collectionName, docSnapshot.id), updates);
          batchCount++;

          if (batchCount >= 500) {
            await batch.commit();
            batchCount = 0;
          }
        }
      }

      if (batchCount > 0) {
        await batch.commit();
      }

    } catch (error) {
      console.error(`Error migrating ${collectionName}:`, error);
    }
  }

  /**
   * Validate migration results
   */
  static async validateMigration(): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      // Check users collection
      const usersSnapshot = await getDocs(collection(db, 'users'));
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        
        if (!userData.username) {
          issues.push(`User ${userDoc.id} missing username`);
        }
        
        if (!userData.symbolicName) {
          issues.push(`User ${userDoc.id} missing symbolic name`);
        }
        
        if (!userData.symbolicIcon) {
          issues.push(`User ${userDoc.id} missing symbolic icon`);
        }

        if (userData.symbolicName) {
          const validation = SymbolicIdentityManager.validateSymbolicName(userData.symbolicName);
          if (!validation.valid) {
            issues.push(`User ${userDoc.id} has invalid symbolic name: ${validation.error}`);
          }
        }
      }

      // Check requests collection
      const requestsSnapshot = await getDocs(collection(db, 'requests'));
      for (const requestDoc of requestsSnapshot.docs) {
        const requestData = requestDoc.data();
        
        if (!requestData.userSymbolicName) {
          issues.push(`Request ${requestDoc.id} missing user symbolic name`);
        }
        
        if (!requestData.userSymbolicIcon) {
          issues.push(`Request ${requestDoc.id} missing user symbolic icon`);
        }
      }

    } catch (error) {
      issues.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }
}

export default SymbolicIdentityMigration;