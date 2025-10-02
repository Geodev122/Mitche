// Enhanced Firebase Service for Mitché Platform
// This file extends the existing Firebase service with new collections and features

import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  onSnapshot,
  collection,
  addDoc,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  writeBatch,
  runTransaction
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { 
  Conversation, 
  Message, 
  TapestryThread, 
  Report, 
  Achievement, 
  UserAchievement,
  Analytics,
  SystemSetting,
  PaginatedResponse,
  SearchFilters,
  ApiResponse
} from '../types-enhanced';

export class EnhancedFirebaseService {
  
  // === CONVERSATION MANAGEMENT ===
  
  async createConversation(conversationData: Partial<Conversation>): Promise<ApiResponse<Conversation>> {
    try {
      const conversationRef = await addDoc(collection(db, 'conversations'), {
        ...conversationData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastActivity: serverTimestamp(),
        isActive: true,
        isArchived: false
      });
      
      const newConversation = await getDoc(conversationRef);
      return { 
        success: true, 
        data: { id: conversationRef.id, ...newConversation.data() } as Conversation 
      };
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      return { success: false, message: error.message };
    }
  }
  
  async sendMessage(conversationId: string, messageData: Partial<Message>): Promise<ApiResponse<Message>> {
    try {
      const messageRef = await addDoc(
        collection(db, 'conversations', conversationId, 'messages'), 
        {
          ...messageData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isDelivered: true
        }
      );
      
      // Update conversation last activity
      await updateDoc(doc(db, 'conversations', conversationId), {
        lastActivity: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      const newMessage = await getDoc(messageRef);
      return { 
        success: true, 
        data: { id: messageRef.id, ...newMessage.data() } as Message 
      };
    } catch (error: any) {
      console.error('Error sending message:', error);
      return { success: false, message: error.message };
    }
  }
  
  subscribeToConversationMessages(
    conversationId: string, 
    callback: (messages: Message[]) => void
  ): () => void {
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      callback(messages);
    });
  }
  
  async getUserConversations(userId: string): Promise<ApiResponse<Conversation[]>> {
    try {
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', userId),
        where('isActive', '==', true),
        orderBy('lastActivity', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Conversation[];
      
      return { success: true, data: conversations };
    } catch (error: any) {
      console.error('Error getting user conversations:', error);
      return { success: false, message: error.message };
    }
  }
  
  // === TAPESTRY THREAD MANAGEMENT ===
  
  async createTapestryThread(threadData: Partial<TapestryThread>): Promise<ApiResponse<TapestryThread>> {
    try {
      const threadRef = await addDoc(collection(db, 'tapestryThreads'), {
        ...threadData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        approvalStatus: 'Pending',
        views: 0,
        likes: 0,
        shares: 0
      });
      
      // Send notification to nominated user
      await this.createNotification({
        recipientId: threadData.honoreeId!,
        type: 'System',
        title: 'You\'ve been nominated for the Hope Tapestry!',
        message: 'Someone has recognized your contribution to the community.',
        relatedId: threadRef.id,
        relatedType: 'TapestryThread'
      });
      
      const newThread = await getDoc(threadRef);
      return { 
        success: true, 
        data: { id: threadRef.id, ...newThread.data() } as TapestryThread 
      };
    } catch (error: any) {
      console.error('Error creating tapestry thread:', error);
      return { success: false, message: error.message };
    }
  }
  
  async approveTapestryThread(threadId: string, adminId: string): Promise<ApiResponse<void>> {
    try {
      await updateDoc(doc(db, 'tapestryThreads', threadId), {
        approvalStatus: 'Approved',
        reviewedBy: adminId,
        approvedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Award hope points to nominee
      const threadDoc = await getDoc(doc(db, 'tapestryThreads', threadId));
      const threadData = threadDoc.data() as TapestryThread;
      
      await this.awardHopePoints(threadData.honoreeId, 100, threadData.category);
      
      return { success: true };
    } catch (error: any) {
      console.error('Error approving tapestry thread:', error);
      return { success: false, message: error.message };
    }
  }
  
  async getApprovedTapestryThreads(limit: number = 20): Promise<ApiResponse<TapestryThread[]>> {
    try {
      const q = query(
        collection(db, 'tapestryThreads'),
        where('approvalStatus', '==', 'Approved'),
        orderBy('approvedAt', 'desc'),
        limit(limit)
      );
      
      const snapshot = await getDocs(q);
      const threads = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TapestryThread[];
      
      return { success: true, data: threads };
    } catch (error: any) {
      console.error('Error getting tapestry threads:', error);
      return { success: false, message: error.message };
    }
  }
  
  // === REPORTING SYSTEM ===
  
  async createReport(reportData: Partial<Report>): Promise<ApiResponse<Report>> {
    try {
      const reportRef = await addDoc(collection(db, 'reports'), {
        ...reportData,
        createdAt: serverTimestamp(),
        status: 'Open'
      });
      
      // Increment report count on reported content
      await this.incrementReportCount(reportData.reportedContent!.type, reportData.reportedContent!.id);
      
      const newReport = await getDoc(reportRef);
      return { 
        success: true, 
        data: { id: reportRef.id, ...newReport.data() } as Report 
      };
    } catch (error: any) {
      console.error('Error creating report:', error);
      return { success: false, message: error.message };
    }
  }
  
  private async incrementReportCount(contentType: string, contentId: string): Promise<void> {
    const collectionName = this.getCollectionNameFromType(contentType);
    if (collectionName) {
      await updateDoc(doc(db, collectionName, contentId), {
        reportCount: increment(1),
        isFlagged: true
      });
    }
  }
  
  private getCollectionNameFromType(contentType: string): string | null {
    switch (contentType) {
      case 'User': return 'users';
      case 'Request': return 'requests';
      case 'Event': return 'communityEvents';
      case 'Resource': return 'resources';
      default: return null;
    }
  }
  
  // === ACHIEVEMENT SYSTEM ===
  
  async checkAndAwardAchievements(userId: string, actionType: string, actionData?: any): Promise<void> {
    try {
      // Get user's current achievements
      const userAchievementsQuery = query(
        collection(db, 'userAchievements'),
        where('userId', '==', userId),
        where('isCompleted', '==', false)
      );
      
      const userAchievementsSnapshot = await getDocs(userAchievementsQuery);
      const userAchievements = userAchievementsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserAchievement[];
      
      // Get all active achievements
      const achievementsQuery = query(
        collection(db, 'achievements'),
        where('isActive', '==', true)
      );
      
      const achievementsSnapshot = await getDocs(achievementsQuery);
      const achievements = achievementsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Achievement[];
      
      // Check each achievement
      for (const achievement of achievements) {
        const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);
        
        if (this.shouldProgressAchievement(achievement, actionType)) {
          const progress = await this.calculateProgress(userId, achievement);
          
          if (userAchievement) {
            // Update existing progress
            await updateDoc(doc(db, 'userAchievements', userAchievement.id), {
              currentProgress: progress,
              isCompleted: progress >= achievement.criteria.value,
              completedAt: progress >= achievement.criteria.value ? serverTimestamp() : null,
              updatedAt: serverTimestamp()
            });
            
            if (progress >= achievement.criteria.value) {
              await this.awardAchievement(userId, achievement);
            }
          } else {
            // Create new achievement progress
            await addDoc(collection(db, 'userAchievements'), {
              userId,
              achievementId: achievement.id,
              currentProgress: progress,
              targetProgress: achievement.criteria.value,
              isCompleted: progress >= achievement.criteria.value,
              completedAt: progress >= achievement.criteria.value ? serverTimestamp() : null,
              notificationSent: false,
              earnedContext: actionType,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            
            if (progress >= achievement.criteria.value) {
              await this.awardAchievement(userId, achievement);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }
  
  private shouldProgressAchievement(achievement: Achievement, actionType: string): boolean {
    switch (achievement.criteria.type) {
      case 'requests': return actionType === 'request_created';
      case 'offerings': return actionType === 'offering_created';
      case 'events': return actionType === 'event_created';
      case 'hopePoints': return actionType === 'hope_points_awarded';
      default: return false;
    }
  }
  
  private async calculateProgress(userId: string, achievement: Achievement): Promise<number> {
    switch (achievement.criteria.type) {
      case 'requests':
        return await this.countUserDocuments('requests', userId, 'createdBy');
      case 'offerings':
        return await this.countUserDocuments('offerings', userId, 'offeredBy');
      case 'events':
        return await this.countUserDocuments('communityEvents', userId, 'organizerId');
      case 'hopePoints':
        const userDoc = await getDoc(doc(db, 'users', userId));
        return userDoc.data()?.hopePoints || 0;
      default:
        return 0;
    }
  }
  
  private async countUserDocuments(collectionName: string, userId: string, userField: string): Promise<number> {
    const q = query(
      collection(db, collectionName),
      where(userField, '==', userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  }
  
  private async awardAchievement(userId: string, achievement: Achievement): Promise<void> {
    // Award hope points
    await this.awardHopePoints(userId, achievement.hopePointsReward, 'CommunityGift');
    
    // Send notification
    await this.createNotification({
      recipientId: userId,
      type: 'Achievement',
      title: 'Achievement Unlocked!',
      message: `You've earned the "${achievement.name}" achievement!`,
      priority: 'High'
    });
    
    // Add badge to user
    await updateDoc(doc(db, 'users', userId), {
      badges: arrayUnion(achievement.id)
    });
  }
  
  // === ANALYTICS ===
  
  async recordAnalytics(analyticsData: Partial<Analytics>): Promise<void> {
    try {
      await addDoc(collection(db, 'analytics'), {
        ...analyticsData,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error recording analytics:', error);
    }
  }
  
  async getDailyAnalytics(date: string): Promise<ApiResponse<Analytics>> {
    try {
      const q = query(
        collection(db, 'analytics'),
        where('type', '==', 'daily'),
        where('date', '==', date)
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return { success: false, message: 'No analytics found for this date' };
      }
      
      const analytics = snapshot.docs[0].data() as Analytics;
      return { success: true, data: analytics };
    } catch (error: any) {
      console.error('Error getting daily analytics:', error);
      return { success: false, message: error.message };
    }
  }
  
  // === SYSTEM SETTINGS ===
  
  async getSystemSetting(settingId: string): Promise<ApiResponse<SystemSetting>> {
    try {
      const settingDoc = await getDoc(doc(db, 'systemSettings', settingId));
      if (!settingDoc.exists()) {
        return { success: false, message: 'Setting not found' };
      }
      
      const setting = { id: settingDoc.id, ...settingDoc.data() } as SystemSetting;
      return { success: true, data: setting };
    } catch (error: any) {
      console.error('Error getting system setting:', error);
      return { success: false, message: error.message };
    }
  }
  
  async updateSystemSetting(settingId: string, value: any, adminId: string): Promise<ApiResponse<void>> {
    try {
      await updateDoc(doc(db, 'systemSettings', settingId), {
        value,
        lastModifiedBy: adminId,
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error updating system setting:', error);
      return { success: false, message: error.message };
    }
  }
  
  // === UTILITY METHODS ===
  
  async createNotification(notificationData: any): Promise<void> {
    try {
      await addDoc(collection(db, 'notifications'), {
        ...notificationData,
        isRead: false,
        priority: notificationData.priority || 'Normal',
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }
  
  async awardHopePoints(userId: string, points: number, category: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Update user's total hope points
      const userRef = doc(db, 'users', userId);
      batch.update(userRef, {
        hopePoints: increment(points),
        [`hopePointsBreakdown.${category}`]: increment(points),
        updatedAt: serverTimestamp()
      });
      
      // Record analytics
      const analyticsRef = doc(collection(db, 'analytics'));
      batch.set(analyticsRef, {
        type: 'event',
        eventType: 'hope_points_awarded',
        userId,
        eventData: { points, category },
        createdAt: serverTimestamp()
      });
      
      await batch.commit();
      
      // Check for achievements
      await this.checkAndAwardAchievements(userId, 'hope_points_awarded', { points, category });
    } catch (error) {
      console.error('Error awarding hope points:', error);
    }
  }
  
  async searchContent(searchTerm: string, filters?: SearchFilters): Promise<ApiResponse<any[]>> {
    try {
      // This is a simplified search - in production, you'd use Algolia or similar
      const results: any[] = [];
      
      // Search requests
      let requestsQuery = collection(db, 'requests');
      if (filters?.type?.length) {
        requestsQuery = query(requestsQuery, where('type', 'in', filters.type));
      }
      if (filters?.region?.length) {
        requestsQuery = query(requestsQuery, where('location.region', 'in', filters.region));
      }
      
      const requestsSnapshot = await getDocs(requestsQuery);
      const requests = requestsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(req => 
          req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      results.push(...requests.map(r => ({ ...r, type: 'request' })));
      
      return { success: true, data: results };
    } catch (error: any) {
      console.error('Error searching content:', error);
      return { success: false, message: error.message };
    }
  }
  
  async getPaginatedRequests(
    page: number = 1, 
    limit: number = 20, 
    filters?: SearchFilters
  ): Promise<ApiResponse<PaginatedResponse<any>>> {
    try {
      let q = query(
        collection(db, 'requests'),
        orderBy('createdAt', 'desc')
      );
      
      // Apply filters
      if (filters?.type?.length) {
        q = query(q, where('type', 'in', filters.type));
      }
      if (filters?.status?.length) {
        q = query(q, where('status', 'in', filters.status));
      }
      
      // Add pagination
      const offset = (page - 1) * limit;
      if (offset > 0) {
        // This is simplified - in production, you'd use cursor-based pagination
        q = query(q, limit(limit));
      } else {
        q = query(q, limit(limit));
      }
      
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return {
        success: true,
        data: {
          items,
          total: snapshot.size, // This would need a separate count query
          page,
          limit,
          hasMore: snapshot.size === limit
        }
      };
    } catch (error: any) {
      console.error('Error getting paginated requests:', error);
      return { success: false, message: error.message };
    }
  }
  
  // === BATCH OPERATIONS ===
  
  async batchUpdateUserLevels(): Promise<void> {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const batch = writeBatch(db);
      
      usersSnapshot.docs.forEach(userDoc => {
        const userData = userDoc.data();
        const level = this.calculateUserLevel(userData.hopePoints || 0);
        
        if (userData.level !== level) {
          batch.update(userDoc.ref, { 
            level,
            updatedAt: serverTimestamp()
          });
        }
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error batch updating user levels:', error);
    }
  }
  
  private calculateUserLevel(hopePoints: number): number {
    if (hopePoints < 100) return 1;
    if (hopePoints < 500) return 2;
    if (hopePoints < 1000) return 3;
    if (hopePoints < 2500) return 4;
    if (hopePoints < 5000) return 5;
    return Math.floor(hopePoints / 1000) + 5;
  }
}

export const enhancedFirebaseService = new EnhancedFirebaseService();