// Firebase service layer for Mitché Platform
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  enableNetwork,
  disableNetwork,
  connectFirestoreEmulator
} from 'firebase/firestore';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  User as FirebaseUser
} from 'firebase/auth';
import { firebaseConfig } from '../firebase.config';
import { User, Request, CommunityEvent, Resource, Offering, Notification, TapestryThread, Role } from '../types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Enable offline persistence
import { enableIndexedDbPersistence } from 'firebase/firestore';

// Enable offline support
try {
  enableIndexedDbPersistence(db);
  console.log('Offline persistence enabled');
} catch (err: any) {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, offline persistence disabled');
  } else if (err.code === 'unimplemented') {
    console.warn('Browser doesn\'t support offline persistence');
  }
}

class FirebaseService {
  private authStateListeners: ((user: User | null) => void)[] = [];
  private requestsListeners: ((requests: Request[]) => void)[] = [];
  private eventsListeners: ((events: CommunityEvent[]) => void)[] = [];
  private resourcesListeners: ((resources: Resource[]) => void)[] = [];

  // Authentication Management
  async createUserWithEmailPassword(email: string, password: string, userData: Partial<User>) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Create user document in Firestore
      const newUser: User = {
        id: firebaseUser.uid,
        username: userData.username || email.split('@')[0],
        password: '', // Don't store password in Firestore
        symbolicName: userData.symbolicName || '',
        symbolicIcon: userData.symbolicIcon || '',
        role: userData.role || Role.Citizen,
        hopePoints: 0,
        hopePointsBreakdown: {},
        hasCompletedOnboarding: false,
        isVerified: userData.role === 'Admin',
        verificationStatus: userData.role === 'Admin' ? 'Approved' : 'NotRequested',
        commendations: { Kind: 0, Punctual: 0, Respectful: 0 },
        ...userData
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...newUser,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return { success: true, user: newUser };
    } catch (error: any) {
      console.error('Error creating user:', error);
      return { success: false, message: error.message };
    }
  }

  async signInWithEmailPassword(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = await this.getUser(userCredential.user.uid);
      return { success: true, user: userData };
    } catch (error: any) {
      console.error('Error signing in:', error);
      return { success: false, message: error.message };
    }
  }

  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      // Check if user already exists
      let existingUser = await this.getUser(firebaseUser.uid);
      
      if (!existingUser) {
        // Create new user document for Google sign-up
        const newUser: User = {
          id: firebaseUser.uid,
          username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          password: '', // Google auth doesn't use password
          symbolicName: '',
          symbolicIcon: '',
          role: Role.Citizen,
          hopePoints: 0,
          hopePointsBreakdown: {},
          hasCompletedOnboarding: false,
          isVerified: false,
          verificationStatus: 'NotRequested',
          joinDate: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          languagePreference: 'en',
          avatar: firebaseUser.photoURL || '',
        };
        
        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
        return { success: true, user: newUser };
      } else {
        // Update last active for existing user
        await updateDoc(doc(db, 'users', firebaseUser.uid), {
          lastActive: new Date().toISOString(),
          avatar: firebaseUser.photoURL || existingUser.avatar,
        });
        return { success: true, user: existingUser };
      }
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      return { success: false, message: error.message };
    }
  }

  async signOut() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      console.error('Error signing out:', error);
      return { success: false, message: error.message };
    }
  }

  // User Management
  async getUser(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<boolean> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...userData,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      return usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  // Requests Management with Real-time Updates
  async createRequest(requestData: Omit<Request, 'id'>): Promise<boolean> {
    try {
      const requestRef = doc(collection(db, 'requests'));
      await setDoc(requestRef, {
        ...requestData,
        id: requestRef.id,
        timestamp: new Date(),
        createdAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error creating request:', error);
      return false;
    }
  }

  async getRequests(): Promise<Request[]> {
    try {
      const requestsQuery = query(
        collection(db, 'requests'),
        orderBy('timestamp', 'desc')
      );
      const requestsSnapshot = await getDocs(requestsQuery);
      return requestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Request));
    } catch (error) {
      console.error('Error getting requests:', error);
      return [];
    }
  }

  // Real-time requests listener
  subscribeToRequests(callback: (requests: Request[]) => void): () => void {
    const requestsQuery = query(
      collection(db, 'requests'),
      orderBy('timestamp', 'desc')
    );
    
    return onSnapshot(requestsQuery, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      } as Request));
      callback(requests);
    }, (error) => {
      console.error('Error in requests subscription:', error);
    });
  }

  async updateRequest(requestId: string, updates: Partial<Request>): Promise<boolean> {
    try {
      await updateDoc(doc(db, 'requests', requestId), {
        ...updates,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error updating request:', error);
      return false;
    }
  }

  // Community Events Management
  async createEvent(eventData: Omit<CommunityEvent, 'id'>): Promise<boolean> {
    try {
      const eventRef = doc(collection(db, 'communityEvents'));
      await setDoc(eventRef, {
        ...eventData,
        id: eventRef.id,
        timestamp: new Date(),
        createdAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error creating event:', error);
      return false;
    }
  }

  subscribeToEvents(callback: (events: CommunityEvent[]) => void): () => void {
    const eventsQuery = query(
      collection(db, 'communityEvents'),
      orderBy('timestamp', 'desc')
    );
    
    return onSnapshot(eventsQuery, (snapshot) => {
      const events = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      } as CommunityEvent));
      callback(events);
    });
  }

  // Resources Management
  async createResource(resourceData: Omit<Resource, 'id'>): Promise<boolean> {
    try {
      const resourceRef = doc(collection(db, 'resources'));
      await setDoc(resourceRef, {
        ...resourceData,
        id: resourceRef.id,
        timestamp: new Date(),
        createdAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error creating resource:', error);
      return false;
    }
  }

  subscribeToResources(callback: (resources: Resource[]) => void): () => void {
    const resourcesQuery = query(
      collection(db, 'resources'),
      orderBy('timestamp', 'desc')
    );
    
    return onSnapshot(resourcesQuery, (snapshot) => {
      const resources = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      } as Resource));
      callback(resources);
    });
  }

  // Offerings Management
  async addOffering(offeringData: Offering): Promise<boolean> {
    try {
      const offeringRef = doc(collection(db, 'offerings'));
      await setDoc(offeringRef, {
        ...offeringData,
        id: offeringRef.id,
        timestamp: new Date(),
        createdAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error creating offering:', error);
      return false;
    }
  }

  subscribeToOfferings(callback: (offerings: Offering[]) => void): () => void {
    const offeringsQuery = query(
      collection(db, 'offerings'),
      orderBy('timestamp', 'desc')
    );
    
    return onSnapshot(offeringsQuery, (snapshot) => {
      const offerings = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      } as Offering));
      callback(offerings);
    });
  }

  async createOffering(offeringData: Omit<Offering, 'id'>): Promise<boolean> {
    try {
      const offeringRef = doc(collection(db, 'offerings'));
      await setDoc(offeringRef, {
        ...offeringData,
        id: offeringRef.id,
        timestamp: new Date(),
        createdAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error creating offering:', error);
      return false;
    }
  }

  async getOfferingsForRequest(requestId: string): Promise<Offering[]> {
    try {
      const offeringsQuery = query(
        collection(db, 'offerings'),
        where('requestId', '==', requestId),
        orderBy('timestamp', 'desc')
      );
      const offeringsSnapshot = await getDocs(offeringsQuery);
      return offeringsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      } as Offering));
    } catch (error) {
      console.error('Error getting offerings:', error);
      return [];
    }
  }

  // Notifications Management
  async createNotification(notificationData: Omit<Notification, 'id'>): Promise<boolean> {
    try {
      const notificationRef = doc(collection(db, 'notifications'));
      await setDoc(notificationRef, {
        ...notificationData,
        id: notificationRef.id,
        timestamp: new Date(),
        createdAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error creating notification:', error);
      return false;
    }
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      const notificationsSnapshot = await getDocs(notificationsQuery);
      return notificationsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      } as Notification));
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  async addNotification(notificationData: Notification): Promise<boolean> {
    try {
      const notificationRef = doc(collection(db, 'notifications'));
      await setDoc(notificationRef, {
        ...notificationData,
        id: notificationRef.id,
        timestamp: new Date(),
        createdAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error adding notification:', error);
      return false;
    }
  }

  subscribeToNotifications(callback: (notifications: Notification[]) => void): () => void {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      orderBy('timestamp', 'desc')
    );
    
    return onSnapshot(notificationsQuery, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      } as Notification));
      callback(notifications);
    });
  }

  async updateNotification(notificationId: string, updates: Partial<Notification>): Promise<boolean> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        ...updates,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error updating notification:', error);
      return false;
    }
  }

  // Tapestry Threads Management
  async addTapestryThread(threadData: TapestryThread): Promise<boolean> {
    try {
      const threadRef = doc(collection(db, 'tapestryThreads'));
      await setDoc(threadRef, {
        ...threadData,
        id: threadRef.id,
        timestamp: new Date(),
        createdAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error adding tapestry thread:', error);
      return false;
    }
  }

  subscribeToTapestryThreads(callback: (threads: TapestryThread[]) => void): () => void {
    const threadsQuery = query(
      collection(db, 'tapestryThreads'),
      orderBy('timestamp', 'desc')
    );
    
    return onSnapshot(threadsQuery, (snapshot) => {
      const threads = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      } as TapestryThread));
      callback(threads);
    });
  }

  async updateTapestryThread(threadId: string, updates: Partial<TapestryThread>): Promise<boolean> {
    try {
      const threadRef = doc(db, 'tapestryThreads', threadId);
      await updateDoc(threadRef, {
        ...updates,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error updating tapestry thread:', error);
      return false;
    }
  }

  // Community Events Management  
  async addCommunityEvent(eventData: CommunityEvent): Promise<boolean> {
    try {
      const eventRef = doc(collection(db, 'communityEvents'));
      await setDoc(eventRef, {
        ...eventData,
        id: eventRef.id,
        timestamp: new Date(),
        createdAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error adding community event:', error);
      return false;
    }
  }

  subscribeToCommunityEvents(callback: (events: CommunityEvent[]) => void): () => void {
    const eventsQuery = query(
      collection(db, 'communityEvents'),
      orderBy('timestamp', 'desc')
    );
    
    return onSnapshot(eventsQuery, (snapshot) => {
      const events = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      } as CommunityEvent));
      callback(events);
    });
  }

  // Resources Management
  async addResource(resourceData: Resource): Promise<boolean> {
    try {
      const resourceRef = doc(collection(db, 'resources'));
      await setDoc(resourceRef, {
        ...resourceData,
        id: resourceRef.id,
        timestamp: new Date(),
        createdAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error adding resource:', error);
      return false;
    }
  }

  // Requests Management
  async addRequest(requestData: Request): Promise<boolean> {
    try {
      const requestRef = doc(collection(db, 'requests'));
      await setDoc(requestRef, {
        ...requestData,
        id: requestRef.id,
        timestamp: new Date(),
        createdAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error adding request:', error);
      return false;
    }
  }

  // Migration from localStorage
  async migrateFromLocalStorage(): Promise<void> {
    try {
      console.log('Starting migration from localStorage to Firestore...');
      
      // Get existing data from localStorage
      const existingUsers = localStorage.getItem('mitcheUsers');
      const existingRequests = localStorage.getItem('requests');
      const existingEvents = localStorage.getItem('communityEvents');
      const existingResources = localStorage.getItem('resources');

      // Migrate users
      if (existingUsers) {
        const users = JSON.parse(existingUsers);
        for (const user of users) {
          await setDoc(doc(db, 'users', user.id), {
            ...user,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
        console.log(`Migrated ${users.length} users`);
      }

      // Migrate requests
      if (existingRequests) {
        const requests = JSON.parse(existingRequests);
        for (const request of requests) {
          await setDoc(doc(db, 'requests', request.id), {
            ...request,
            timestamp: new Date(request.timestamp),
            createdAt: new Date()
          });
        }
        console.log(`Migrated ${requests.length} requests`);
      }

      // Migrate events
      if (existingEvents) {
        const events = JSON.parse(existingEvents);
        for (const event of events) {
          await setDoc(doc(db, 'communityEvents', event.id), {
            ...event,
            timestamp: new Date(event.timestamp),
            createdAt: new Date()
          });
        }
        console.log(`Migrated ${events.length} events`);
      }

      // Migrate resources
      if (existingResources) {
        const resources = JSON.parse(existingResources);
        for (const resource of resources) {
          await setDoc(doc(db, 'resources', resource.id), {
            ...resource,
            timestamp: new Date(resource.timestamp),
            createdAt: new Date()
          });
        }
        console.log(`Migrated ${resources.length} resources`);
      }

      console.log('Migration completed successfully!');
    } catch (error) {
      console.error('Migration failed:', error);
    }
  }

  // Network status management
  async goOnline(): Promise<void> {
    await enableNetwork(db);
  }

  async goOffline(): Promise<void> {
    await disableNetwork(db);
  }

  // Auth state listener
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await this.getUser(firebaseUser.uid);
        callback(userData);
      } else {
        callback(null);
      }
    });
  }
}

export const firebaseService = new FirebaseService();
export default FirebaseService;