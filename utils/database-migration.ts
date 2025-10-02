// Database Migration Scripts for Enhanced Mitché Platform
// This file contains scripts to migrate existing data to the new enhanced schema

import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  setDoc, 
  writeBatch, 
  serverTimestamp,
  addDoc 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { 
  User, 
  Request, 
  Offering, 
  CommunityEvent, 
  Resource, 
  Notification,
  Role,
  RequestType,
  RequestMode,
  RequestStatus,
  CommunityEventType,
  ResourceCategory
} from '../types-enhanced';

export class DatabaseMigration {
  
  // === MIGRATION METHODS ===
  
  async migrateAllCollections(): Promise<void> {
    console.log('Starting database migration...');
    
    try {
      await this.migrateUsers();
      await this.migrateRequests();
      await this.migrateOfferings();
      await this.migrateCommunityEvents();
      await this.migrateResources();
      await this.migrateNotifications();
      await this.createInitialSystemSettings();
      await this.createInitialAchievements();
      
      console.log('Database migration completed successfully!');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }
  
  // Migrate Users Collection
  async migrateUsers(): Promise<void> {
    console.log('Migrating users...');
    
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const batch = writeBatch(db);
    
    usersSnapshot.docs.forEach((userDoc) => {
      const userData = userDoc.data() as any;

      const migratedUser: any = {
        // Core fields (already exist)
        id: userData.id || userDoc.id,
        username: userData.username,
        symbolicName: userData.symbolicName || '',
        symbolicIcon: userData.symbolicIcon || '',
        role: userData.role as Role || Role.Citizen,
        
        // Enhanced fields
        email: userData.email || '',
        displayName: userData.displayName,
        isVerified: userData.isVerified || false,
        verificationStatus: userData.verificationStatus || 'NotRequested',
        bio: userData.bio || '',
        location: userData.location || '',
        avatar: userData.avatar || userData.photoUrl || '',
        phoneNumber: userData.phoneNumber,
        preferredLanguage: userData.languagePreference || userData.preferredLanguage || 'en',
        
        // Hope Points & Gamification
        hopePoints: userData.hopePoints || 0,
        hopePointsBreakdown: userData.hopePointsBreakdown || {},
        commendations: userData.commendations || { Kind: 0, Punctual: 0, Respectful: 0 },
        level: this.calculateUserLevel(userData.hopePoints || 0),
        badges: userData.badges || [],
        
        // Settings with defaults
        notificationSettings: userData.notificationSettings || {
          email: true,
          push: true,
          types: ['Request', 'Offering', 'Event', 'Achievement']
        },
        privacySettings: userData.privacySettings || {
          showProfile: true,
          allowDirectMessages: true,
          showHopePoints: true
        },
        
        // Analytics
        lastActive: userData.lastActive || new Date().toISOString(),
        joinDate: userData.joinDate || userData.createdAt || new Date().toISOString(),
        activityStreakDays: userData.activityStreakDays || 0,
        totalRequestsCreated: userData.totalRequestsCreated || 0,
        totalOfferingsGiven: userData.totalOfferingsGiven || 0,
        totalEventsOrganized: userData.totalEventsOrganized || 0,
        
        // Onboarding
        hasCompletedOnboarding: userData.hasCompletedOnboarding !== false,
        onboardingStep: userData.onboardingStep,
        
        // Reveal Protocol
        nominationStatus: userData.nominationStatus,
        realName: userData.realName,
        publicProfile: userData.publicProfile,
        
        // Security
        reportCount: userData.reportCount || 0,
        isSuspended: userData.isSuspended || false,
        suspensionReason: userData.suspensionReason,
        suspensionExpiry: userData.suspensionExpiry,
        
        // Timestamps
        updatedAt: serverTimestamp()
      };
      
      batch.update(userDoc.ref, migratedUser as any);
    });
    
    await batch.commit();
    console.log(`Migrated ${usersSnapshot.size} users`);
  }
  
  // Migrate Requests Collection
  async migrateRequests(): Promise<void> {
    console.log('Migrating requests...');
    
    const requestsSnapshot = await getDocs(collection(db, 'requests'));
    const batch = writeBatch(db);
    
    requestsSnapshot.docs.forEach((requestDoc) => {
      const requestData = requestDoc.data() as any;
      
  const migratedRequest: any = {
        id: requestData.id || requestDoc.id,
        createdBy: requestData.userId || requestData.createdBy,
        title: requestData.title,
        description: requestData.description,
        type: requestData.type as RequestType,
        urgency: requestData.urgency || 'Medium',
        mode: requestData.mode as RequestMode,
        
        // Location
        location: {
          region: requestData.region || requestData.location?.region || '',
          coordinates: requestData.location?.coordinates,
          address: requestData.location?.address
        },
        
        deadline: requestData.deadline,
        status: requestData.status as RequestStatus,
        assignedHelper: requestData.helperId || requestData.assignedHelper,
        
        // Creator Info
        creatorSymbolicName: requestData.userSymbolicName || requestData.creatorSymbolicName || '',
        creatorSymbolicIcon: requestData.userSymbolicIcon || requestData.creatorSymbolicIcon || '',
        
        // Analytics
        views: requestData.views || 0,
        saves: requestData.saves || 0,
        offeringsCount: requestData.offeringsCount || 0,
        
        // Verification
        isVerified: requestData.isVerified || false,
        flagCount: requestData.flagCount || 0,
        isFlagged: requestData.isFlagged || false,
        
        // Media
        images: requestData.images || [],
        documents: requestData.documents || [],
        
        // Feedback
        completionDate: requestData.completionDate,
        satisfactionRating: requestData.satisfactionRating,
        feedback: requestData.feedback,
        
        // Legacy fields for compatibility
        userId: requestData.userId,
        userSymbolicName: requestData.userSymbolicName,
        userSymbolicIcon: requestData.userSymbolicIcon,
        timestamp: requestData.timestamp,
        region: requestData.region,
        helperId: requestData.helperId,
        isConfirmedByRequester: requestData.isConfirmedByRequester,
        requesterCommended: requestData.requesterCommended,
        helperCommended: requestData.helperCommended,
        
        updatedAt: serverTimestamp()
      };
      
      batch.update(requestDoc.ref, migratedRequest as any);
    });
    
    await batch.commit();
    console.log(`Migrated ${requestsSnapshot.size} requests`);
  }
  
  // Migrate Offerings Collection
  async migrateOfferings(): Promise<void> {
    console.log('Migrating offerings...');
    
    const offeringsSnapshot = await getDocs(collection(db, 'offerings'));
    const batch = writeBatch(db);
    
    offeringsSnapshot.docs.forEach((offeringDoc) => {
      const offeringData = offeringDoc.data() as any;
      
  const migratedOffering: any = {
        id: offeringData.id || offeringDoc.id,
        requestId: offeringData.requestId,
        offeredBy: offeringData.userId || offeringData.offeredBy,
        type: offeringData.type || 'Help',
        message: offeringData.message,
        amount: offeringData.amount,
        resources: offeringData.resources || [],
        
        status: offeringData.status || 'Pending',
        isSelected: offeringData.isSelected || false,
        
        contactMethod: offeringData.contactMethod || 'In-App',
        availableFrom: offeringData.availableFrom || offeringData.timestamp,
        availableTo: offeringData.availableTo,
        
        rating: offeringData.rating,
        feedback: offeringData.feedback,
        
        pointsEarned: offeringData.pointsEarned || offeringData.hopePointsEarned || 0,
        badgeEarned: offeringData.badgeEarned,
        
        // Legacy fields
        userId: offeringData.userId,
        timestamp: offeringData.timestamp,
        hopePointsEarned: offeringData.hopePointsEarned,
        
        updatedAt: serverTimestamp()
      };
      
      batch.update(offeringDoc.ref, migratedOffering as any);
    });
    
    await batch.commit();
    console.log(`Migrated ${offeringsSnapshot.size} offerings`);
  }
  
  // Migrate Community Events
  async migrateCommunityEvents(): Promise<void> {
    console.log('Migrating community events...');
    
    const eventsSnapshot = await getDocs(collection(db, 'communityEvents'));
    const batch = writeBatch(db);
    
    eventsSnapshot.docs.forEach((eventDoc) => {
      const eventData = eventDoc.data() as any;
      
  const migratedEvent: any = {
        id: eventData.id || eventDoc.id,
        organizerId: eventData.organizerId,
        title: eventData.title,
        description: eventData.description,
        type: eventData.type as CommunityEventType,
        category: eventData.category || 'Social',
        
        startDate: eventData.startDate || eventData.timestamp,
        endDate: eventData.endDate,
        
        location: {
          region: eventData.region || eventData.location?.region || '',
          address: eventData.location?.address || '',
          coordinates: eventData.location?.coordinates,
          venue: eventData.location?.venue
        },
        
        isVirtual: eventData.isVirtual || false,
        virtualLink: eventData.virtualLink,
        
        maxParticipants: eventData.maxParticipants,
        currentParticipants: eventData.currentParticipants || 0,
        registrationRequired: eventData.registrationRequired || false,
        registrationDeadline: eventData.registrationDeadline,
        participants: eventData.participants || [],
        waitlist: eventData.waitlist || [],
        
        requirements: eventData.requirements || [],
        ageRestriction: eventData.ageRestriction,
        tags: eventData.tags || [],
        
        organizerSymbolicName: eventData.organizerSymbolicName,
        organizerSymbolicIcon: eventData.organizerSymbolicIcon,
        organizerRole: eventData.organizerRole,
        organizerIsVerified: eventData.organizerIsVerified || false,
        coOrganizers: eventData.coOrganizers || [],
        
        status: eventData.status || 'Published',
        approvalStatus: eventData.approvalStatus || 'Approved',
        
        views: eventData.views || 0,
        saves: eventData.saves || 0,
        shares: eventData.shares || 0,
        
        images: eventData.images || [],
        videos: eventData.videos || [],
        documents: eventData.documents || [],
        
        feedback: eventData.feedback,
        impactReport: eventData.impactReport,
        
        // Legacy fields
        timestamp: eventData.timestamp,
        region: eventData.region,
        
        updatedAt: serverTimestamp()
      };
      
      batch.update(eventDoc.ref, migratedEvent as any);
    });
    
    await batch.commit();
    console.log(`Migrated ${eventsSnapshot.size} community events`);
  }
  
  // Migrate Resources
  async migrateResources(): Promise<void> {
    console.log('Migrating resources...');
    
    const resourcesSnapshot = await getDocs(collection(db, 'resources'));
    const batch = writeBatch(db);
    
    resourcesSnapshot.docs.forEach((resourceDoc) => {
      const resourceData = resourceDoc.data() as any;
      
  const migratedResource: any = {
        id: resourceData.id || resourceDoc.id,
        createdBy: resourceData.organizerId || resourceData.createdBy,
        title: resourceData.title,
        description: resourceData.description,
        category: resourceData.category as ResourceCategory,
        subCategory: resourceData.subCategory,
        
        providerName: resourceData.providerName || resourceData.title,
        providerType: resourceData.providerType || 'Community',
        
        contactInfo: {
          phone: resourceData.contactInfo?.phone || resourceData.contactPhone,
          email: resourceData.contactInfo?.email || resourceData.contactEmail,
          website: resourceData.contactInfo?.website || resourceData.contactWebsite,
          address: resourceData.contactInfo?.address || resourceData.address
        },
        
        schedule: {
          hours: resourceData.schedule?.hours || resourceData.schedule || '9 AM - 5 PM',
          days: resourceData.schedule?.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          specialNotes: resourceData.schedule?.specialNotes
        },
        
        isAlwaysAvailable: resourceData.isAlwaysAvailable || false,
        capacity: resourceData.capacity,
        
        location: {
          region: resourceData.region || resourceData.location?.region || '',
          address: resourceData.address || resourceData.location?.address || '',
          coordinates: resourceData.location?.coordinates
        },
        
        eligibilityCriteria: resourceData.eligibilityCriteria || [],
        documentsRequired: resourceData.documentsRequired || [],
        ageRestrictions: resourceData.ageRestrictions,
        cost: resourceData.cost || 'Free',
        costDetails: resourceData.costDetails,
        
        languagesSupported: resourceData.languagesSupported || ['English'],
        
        verificationStatus: resourceData.verificationStatus || 'Not Verified',
        lastVerifiedDate: resourceData.lastVerifiedDate,
        reviews: resourceData.reviews || { count: 0, averageRating: 0 },
        
        views: resourceData.views || 0,
        clicks: resourceData.clicks || 0,
        saves: resourceData.saves || 0,
        reports: resourceData.reports || 0,
        
        // Creator info
        organizerId: resourceData.organizerId,
        organizerSymbolicName: resourceData.organizerSymbolicName,
        organizerSymbolicIcon: resourceData.organizerSymbolicIcon,
        organizerIsVerified: resourceData.organizerIsVerified || false,
        creatorSymbolicName: resourceData.organizerSymbolicName || '',
        creatorSymbolicIcon: resourceData.organizerSymbolicIcon || '',
        creatorIsVerified: resourceData.organizerIsVerified || false,
        
        images: resourceData.images || [],
        brochures: resourceData.brochures || [],
        
        // Legacy fields
        region: resourceData.region,
        timestamp: resourceData.timestamp,
        
        updatedAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      };
      
      batch.update(resourceDoc.ref, migratedResource as any);
    });
    
    await batch.commit();
    console.log(`Migrated ${resourcesSnapshot.size} resources`);
  }
  
  // Migrate Notifications
  async migrateNotifications(): Promise<void> {
    console.log('Migrating notifications...');
    
    const notificationsSnapshot = await getDocs(collection(db, 'notifications'));
    const batch = writeBatch(db);
    
    notificationsSnapshot.docs.forEach((notificationDoc) => {
      const notificationData = notificationDoc.data() as any;
      
      const migratedNotification: Partial<Notification> = {
        id: notificationData.id || notificationDoc.id,
        recipientId: notificationData.userId || notificationData.recipientId,
        type: notificationData.type || 'System',
        title: notificationData.title || 'Notification',
        message: notificationData.message,
        
        messageKey: notificationData.messageKey,
        messageOptions: notificationData.messageOptions,
        
        relatedId: notificationData.requestId || notificationData.relatedId,
        relatedType: notificationData.requestId ? 'Request' : notificationData.relatedType,
        actionUrl: notificationData.actionUrl,
        
        isRead: notificationData.isRead || false,
        priority: notificationData.priority || 'Normal',
        
        channels: notificationData.channels || ['app'],
        deliveryStatus: notificationData.deliveryStatus || 'Sent',
        
        scheduledFor: notificationData.scheduledFor,
        expiresAt: notificationData.expiresAt,
        
        // Legacy fields
        userId: notificationData.userId,
        requestId: notificationData.requestId,
        timestamp: notificationData.timestamp,
        
        readAt: notificationData.readAt
      };
      
      batch.update(notificationDoc.ref, migratedNotification);
    });
    
    await batch.commit();
    console.log(`Migrated ${notificationsSnapshot.size} notifications`);
  }
  
  // Create Initial System Settings
  async createInitialSystemSettings(): Promise<void> {
    console.log('Creating initial system settings...');
    
    const settings = [
      {
        id: 'app_version',
        value: '2.0.0',
        type: 'string',
        description: 'Current application version',
        isPublic: true
      },
      {
        id: 'maintenance_mode',
        value: false,
        type: 'boolean',
        description: 'Whether the app is in maintenance mode',
        isPublic: true
      },
      {
        id: 'max_hope_points_per_day',
        value: 100,
        type: 'number',
        description: 'Maximum hope points a user can earn per day',
        isPublic: false
      },
      {
        id: 'supported_languages',
        value: ['en', 'ar', 'fr'],
        type: 'array',
        description: 'Supported application languages',
        isPublic: true
      },
      {
        id: 'feature_flags',
        value: {
          chatEnabled: true,
          tapestryEnabled: true,
          achievementsEnabled: true,
          geolocationEnabled: true
        },
        type: 'object',
        description: 'Feature flags for the application',
        isPublic: true
      }
    ];
    
    const batch = writeBatch(db);
    
    for (const setting of settings) {
      const settingRef = doc(db, 'systemSettings', setting.id);
      batch.set(settingRef, {
        ...setting,
        lastModifiedBy: 'system',
        updatedAt: serverTimestamp()
      });
    }
    
    await batch.commit();
    console.log(`Created ${settings.length} system settings`);
  }
  
  // Create Initial Achievements
  async createInitialAchievements(): Promise<void> {
    console.log('Creating initial achievements...');
    
    const achievements = [
      {
        id: 'first_request',
        name: 'First Echo',
        description: 'Create your first request for help',
        icon: '🔊',
        criteria: { type: 'requests', value: 1, timeframe: 'allTime' },
        hopePointsReward: 10,
        category: 'Helper',
        rarity: 'Common',
        isActive: true,
        isHidden: false
      },
      {
        id: 'first_offering',
        name: 'First Light',
        description: 'Make your first offering to help someone',
        icon: '💡',
        criteria: { type: 'offerings', value: 1, timeframe: 'allTime' },
        hopePointsReward: 15,
        category: 'Helper',
        rarity: 'Common',
        isActive: true,
        isHidden: false
      },
      {
        id: 'community_builder',
        name: 'Community Builder',
        description: 'Organize your first community event',
        icon: '🏗️',
        criteria: { type: 'events', value: 1, timeframe: 'allTime' },
        hopePointsReward: 25,
        category: 'Community',
        rarity: 'Rare',
        isActive: true,
        isHidden: false
      },
      {
        id: 'hope_collector',
        name: 'Hope Collector',
        description: 'Earn 1000 hope points',
        icon: '⭐',
        criteria: { type: 'hopePoints', value: 1000, timeframe: 'allTime' },
        hopePointsReward: 50,
        category: 'Dedication',
        rarity: 'Epic',
        isActive: true,
        isHidden: false
      },
      {
        id: 'silent_hero',
        name: 'Silent Hero',
        description: 'Help 10 people through silent requests',
        icon: '🦸',
        criteria: { type: 'combo', value: 10, timeframe: 'allTime' },
        hopePointsReward: 100,
        category: 'Special',
        rarity: 'Legendary',
        isActive: true,
        isHidden: false
      }
    ];
    
    const batch = writeBatch(db);
    
    for (const achievement of achievements) {
      const achievementRef = doc(db, 'achievements', achievement.id);
      batch.set(achievementRef, {
        ...achievement,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    await batch.commit();
    console.log(`Created ${achievements.length} achievements`);
  }
  
  // === UTILITY METHODS ===
  
  private calculateUserLevel(hopePoints: number): number {
    if (hopePoints < 100) return 1;
    if (hopePoints < 500) return 2;
    if (hopePoints < 1000) return 3;
    if (hopePoints < 2500) return 4;
    if (hopePoints < 5000) return 5;
    return Math.floor(hopePoints / 1000) + 5;
  }
  
  // Backup existing data before migration
  async backupCollection(collectionName: string): Promise<void> {
    console.log(`Backing up ${collectionName}...`);
    
    const snapshot = await getDocs(collection(db, collectionName));
    const backupData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Store backup in a backup collection
    const backupRef = doc(db, 'backups', `${collectionName}_${Date.now()}`);
    await setDoc(backupRef, {
      collection: collectionName,
      data: backupData,
      timestamp: serverTimestamp(),
      count: backupData.length
    });
    
    console.log(`Backed up ${backupData.length} documents from ${collectionName}`);
  }
  
  // Validate migration results
  async validateMigration(): Promise<void> {
    console.log('Validating migration...');
    
    const collections = ['users', 'requests', 'offerings', 'communityEvents', 'resources', 'notifications'];
    
    for (const collectionName of collections) {
      const snapshot = await getDocs(collection(db, collectionName));
      console.log(`${collectionName}: ${snapshot.size} documents`);
      
      // Check for required fields
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (!data.createdAt && !data.updatedAt) {
          console.warn(`Document ${doc.id} in ${collectionName} missing timestamps`);
        }
      });
    }
    
    console.log('Migration validation completed');
  }
  
  // Rollback migration (restore from backup)
  async rollbackMigration(backupTimestamp: string): Promise<void> {
    console.log(`Rolling back migration to backup ${backupTimestamp}...`);
    
    const backupsSnapshot = await getDocs(
      collection(db, 'backups')
    );
    
    const relevantBackups = backupsSnapshot.docs.filter(doc => 
      doc.id.includes(backupTimestamp)
    );
    
    for (const backupDoc of relevantBackups) {
      const backupData = backupDoc.data();
      const collectionName = backupData.collection;
      const documents = backupData.data;
      
      console.log(`Restoring ${collectionName}...`);
      
      const batch = writeBatch(db);
      documents.forEach((docData: any) => {
        const docRef = doc(db, collectionName, docData.id);
        batch.set(docRef, docData);
      });
      
      await batch.commit();
      console.log(`Restored ${documents.length} documents to ${collectionName}`);
    }
    
    console.log('Rollback completed');
  }
}

export const databaseMigration = new DatabaseMigration();