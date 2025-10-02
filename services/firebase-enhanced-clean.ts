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
      
      const createdConversation = {
        id: conversationRef.id,
        ...conversationData,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastActivity: new Date(),
        isActive: true,
        isArchived: false
      } as Conversation;
      
      return { success: true, data: createdConversation };
    } catch (error) {
      console.error('Error creating conversation:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  
  async updateConversation(conversationId: string, updates: Partial<Conversation>): Promise<ApiResponse<void>> {
    try {
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating conversation:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  
  async getUserConversations(userId: string): Promise<ApiResponse<Conversation[]>> {
    try {
      const conversationsQuery = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', userId),
        where('isActive', '==', true),
        orderBy('lastActivity', 'desc')
      );
      
      const snapshot = await getDocs(conversationsQuery);
      const conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Conversation[];
      
      return { success: true, data: conversations };
    } catch (error) {
      console.error('Error getting user conversations:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  
  subscribeToMessages(conversationId: string, onUpdate: (messages: Message[]) => void): (() => void) | undefined {
    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'asc')
      );
      
      return onSnapshot(messagesQuery, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Message[];
        onUpdate(messages);
      });
    } catch (error) {
      console.error('Error subscribing to messages:', error);
      return undefined;
    }
  }
  
  async sendMessage(messageData: Partial<Message>, conversationId: string): Promise<ApiResponse<Message>> {
    try {
      const messageRef = await addDoc(collection(db, 'messages'), {
        ...messageData,
        conversationId,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        deliveryStatus: {
          status: 'delivered',
          timestamp: serverTimestamp()
        }
      });
      
      const createdMessage = {
        id: messageRef.id,
        ...messageData,
        conversationId,
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      } as Message;
      
      return { success: true, data: createdMessage };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  
  async markMessagesAsRead(conversationId: string, userId: string): Promise<ApiResponse<void>> {
    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        where('senderId', '!=', userId)
      );
      
      const snapshot = await getDocs(messagesQuery);
      const batch = writeBatch(db);
      
      snapshot.docs.forEach(doc => {
        const messageRef = doc.ref;
        batch.update(messageRef, {
          [`readBy.${userId}`]: serverTimestamp(),
          'deliveryStatus.status': 'read',
          'deliveryStatus.timestamp': serverTimestamp()
        });
      });
      
      await batch.commit();
      return { success: true };
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  
  async addReaction(messageId: string, userId: string, emoji: string): Promise<ApiResponse<void>> {
    try {
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, {
        [`reactions.${emoji}`]: arrayUnion(userId),
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error adding reaction:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // === SEARCH FUNCTIONALITY ===
  
  async searchRequests(filters: SearchFilters): Promise<ApiResponse<any[]>> {
    try {
      let requestsQuery = query(collection(db, 'requests'));

      // Apply filters
      if (filters.type) {
        requestsQuery = query(requestsQuery, where('type', '==', filters.type));
      }
      
      if (filters.status) {
        requestsQuery = query(requestsQuery, where('status', '==', filters.status));
      }
      
      if (filters.urgency) {
        requestsQuery = query(requestsQuery, where('urgency', '==', filters.urgency));
      }
      
      if (filters.location) {
        // Geographic search implementation would go here
        // For now, we'll search by location string
        requestsQuery = query(requestsQuery, where('location', '>=', filters.location), where('location', '<=', filters.location + '\uf8ff'));
      }
      
      // Apply sorting
      if (filters.sortBy) {
        const direction = filters.sortOrder === 'desc' ? 'desc' : 'asc';
        requestsQuery = query(requestsQuery, orderBy(filters.sortBy, direction));
      } else {
        requestsQuery = query(requestsQuery, orderBy('createdAt', 'desc'));
      }
      
      // Apply pagination
      if (filters.limit) {
        requestsQuery = query(requestsQuery, limit(filters.limit));
      }
      
      const snapshot = await getDocs(requestsQuery);
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { success: true, data: requests };
    } catch (error) {
      console.error('Error searching requests:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async searchOfferings(filters: SearchFilters): Promise<ApiResponse<any[]>> {
    try {
      let offeringsQuery = query(collection(db, 'offerings'));

      // Apply filters similar to requests
      if (filters.type) {
        offeringsQuery = query(offeringsQuery, where('type', '==', filters.type));
      }
      
      if (filters.status) {
        offeringsQuery = query(offeringsQuery, where('status', '==', filters.status));
      }
      
      if (filters.location) {
        offeringsQuery = query(offeringsQuery, where('location', '>=', filters.location), where('location', '<=', filters.location + '\uf8ff'));
      }
      
      // Apply sorting and pagination
      if (filters.sortBy) {
        const direction = filters.sortOrder === 'desc' ? 'desc' : 'asc';
        offeringsQuery = query(offeringsQuery, orderBy(filters.sortBy, direction));
      } else {
        offeringsQuery = query(offeringsQuery, orderBy('createdAt', 'desc'));
      }
      
      if (filters.limit) {
        offeringsQuery = query(offeringsQuery, limit(filters.limit));
      }
      
      const snapshot = await getDocs(offeringsQuery);
      const offerings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { success: true, data: offerings };
    } catch (error) {
      console.error('Error searching offerings:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // === RATING SYSTEM ===
  
  async addRating(targetId: string, targetType: 'user' | 'request' | 'offering' | 'event', rating: number, review?: string, userId?: string): Promise<ApiResponse<void>> {
    try {
      const ratingData = {
        targetId,
        targetType,
        rating,
        review: review || '',
        userId: userId || 'anonymous',
        timestamp: serverTimestamp()
      };
      
      await addDoc(collection(db, 'ratings'), ratingData);
      
      // Update average rating on target document
      await this.updateAverageRating(targetId, targetType);
      
      return { success: true };
    } catch (error) {
      console.error('Error adding rating:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  
  private async updateAverageRating(targetId: string, targetType: string): Promise<void> {
    try {
      const ratingsQuery = query(
        collection(db, 'ratings'),
        where('targetId', '==', targetId),
        where('targetType', '==', targetType)
      );
      
      const snapshot = await getDocs(ratingsQuery);
      const ratings = snapshot.docs.map(doc => doc.data().rating);
      
      if (ratings.length > 0) {
        const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
        const ratingCount = ratings.length;
        
        // Update the target document with new average
        const targetCollection = targetType === 'user' ? 'users' : `${targetType}s`;
        const targetRef = doc(db, targetCollection, targetId);
        
        await updateDoc(targetRef, {
          'rating.average': averageRating,
          'rating.count': ratingCount,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating average rating:', error);
    }
  }

  // === ANALYTICS ===
  
  async recordAnalytics(eventType: string, data: any): Promise<ApiResponse<void>> {
    try {
      const analyticsData = {
        eventType,
        data,
        timestamp: serverTimestamp(),
        date: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
      };
      
      await addDoc(collection(db, 'analytics'), analyticsData);
      return { success: true };
    } catch (error) {
      console.error('Error recording analytics:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  
  async getAnalyticsSummary(startDate: string, endDate: string): Promise<ApiResponse<any>> {
    try {
      const analyticsQuery = query(
        collection(db, 'analytics'),
        where('date', '>=', startDate),
        where('date', '<=', endDate)
      );
      
      const snapshot = await getDocs(analyticsQuery);
      const events = snapshot.docs.map(doc => doc.data());
      
      // Process analytics data
      const summary = {
        totalEvents: events.length,
        eventsByType: {} as any,
        dailyBreakdown: {} as any
      };
      
      events.forEach(event => {
        // Count by type
        summary.eventsByType[event.eventType] = (summary.eventsByType[event.eventType] || 0) + 1;
        
        // Count by date
        summary.dailyBreakdown[event.date] = (summary.dailyBreakdown[event.date] || 0) + 1;
      });
      
      return { success: true, data: summary };
    } catch (error) {
      console.error('Error getting analytics summary:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}