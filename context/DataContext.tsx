import React from 'react';
import { Request, Offering, RequestType, RequestMode, Notification, HopePointCategory, RequestStatus, TapestryThread, TapestryThreadColor, TapestryThreadPattern, User, CommunityEvent, CommunityEventType, Role, Resource, ResourceCategory, CommendationType } from '../types';
import { useAuth } from './AuthContext';
import { firebaseService } from '../services/firebase';
import i18n from '../i18n';

interface DataContextType {
  requests: Request[];
  offerings: Offering[];
  notifications: Notification[];
  tapestryThreads: TapestryThread[];
  communityEvents: CommunityEvent[];
  resources: Resource[];
  addRequest: (request: Omit<Request, 'id' | 'timestamp' | 'userId' | 'userSymbolicName' | 'userSymbolicIcon' | 'status' | 'helperId' | 'isConfirmedByRequester'| 'requesterCommended' | 'helperCommended'>, user: User) => Promise<void>;
  addOffering: (offering: Omit<Offering, 'id' | 'timestamp' | 'userId'>, userId: string) => Promise<void>;
  addCommunityEvent: (event: Omit<CommunityEvent, 'id' | 'timestamp' | 'organizerId' | 'organizerSymbolicName' | 'organizerSymbolicIcon' | 'organizerRole' | 'organizerIsVerified'>, user: User) => Promise<void>;
  addResource: (resource: Omit<Resource, 'id' | 'timestamp' | 'organizerId' | 'organizerSymbolicName' | 'organizerSymbolicIcon' | 'organizerIsVerified'>, user: User) => Promise<void>;
  initiateHelp: (requestId: string, helperId: string) => void;
  confirmReceipt: (requestId: string) => void;
  fulfillRequest: (requestId: string, helperId: string) => void;
  getNotificationsForUser: (userId: string) => Notification[];
  markAsRead: (notificationId: string) => void;
  acceptNomination: (userId: string, choice: 'Reveal' | 'Anonymous', details?: { realName: string, photoUrl?: string }) => void;
  echoThread: (threadId: string) => void;
  loading: boolean;
  giveDailyPoint: (receiverId: string) => Promise<{ success: boolean; messageKey: string; receiverName?: string }>;
  giveRitualPoint: (opts?: { prompt?: string; requestId?: string }) => Promise<{ success: boolean; messageKey: string }>; 
  getRequestById: (requestId: string) => Request | undefined;
  getOfferingsForRequest: (requestId: string) => Offering[];
  leaveCommendation: (requestId: string, fromRole: 'requester' | 'helper', commendations: CommendationType[]) => void;
  addTapestryThread: (thread: Omit<TapestryThread, 'id' | 'timestamp'>) => Promise<string | null>;
  recordHopePoints?: (actorId: string, receiverId: string, category: string, amount: number, reason?: string, depthMultiplier?: number) => Promise<{ success: boolean } | undefined>;
  getLeaderboard?: (opts?: { role?: string; startDate?: string; endDate?: string; depthBased?: boolean; limit?: number; }) => Promise<any[] | null>;
}

const DataContext = React.createContext<DataContextType | undefined>(undefined);

const MOCK_REQUESTS: Request[] = [
    {
        id: 'req_1',
        userId: 'user_123',
        userSymbolicName: 'Bearer_324',
        userSymbolicIcon: 'Star',
        title: 'بحاجة إلى دعم نفسي',
        description: 'أمر بفترة صعبة وأحتاج لمن أتحدث معه بسرية تامة. الشعور بالوحدة يقتلني.',
        type: RequestType.Emotional,
        mode: RequestMode.Loud,
        timestamp: new Date(Date.now() - 86400000 * 1),
        region: 'بيروت',
        status: RequestStatus.Open,
        isConfirmedByRequester: false,
        requesterCommended: false,
        helperCommended: false,
    },
    {
        id: 'req_2',
        userId: 'user_456',
        userSymbolicName: 'صوت_النور',
        userSymbolicIcon: 'Lantern',
        title: 'مساعدة في تأمين مأوى مؤقت',
        description: 'عائلتي فقدت منزلها وتحتاج إلى مكان آمن لبضعة أيام حتى نجد حلاً دائماً.',
        type: RequestType.Shelter,
        mode: RequestMode.Loud,
        timestamp: new Date(Date.now() - 86400000 * 2),
        region: 'طرابلس',
        status: RequestStatus.Fulfilled,
        helperId: 'user_789',
        isConfirmedByRequester: true,
        requesterCommended: false,
        helperCommended: false,
    },
     {
        id: 'req_3',
        userId: 'user_789',
        userSymbolicName: 'يد_العون',
        userSymbolicIcon: 'Flower',
        title: 'مساعدة في الحصول على دواء',
        description: 'والدتي بحاجة ماسة إلى دواء للقلب ولا أستطيع تحمل تكلفته هذا الشهر.',
        type: RequestType.Medical,
        mode: RequestMode.Silent,
        timestamp: new Date(Date.now() - 86400000 * 3),
        region: 'صيدا',
        status: RequestStatus.Pending,
        helperId: 'user_123',
        isConfirmedByRequester: false,
        requesterCommended: false,
        helperCommended: false,
    },
];

const MOCK_OFFERINGS: Offering[] = [
    {
        id: 'offering_1',
        userId: 'user_789', // يد_العون
        requestId: 'req_1', // بحاجة إلى دعم نفسي
        type: 'Encouragement',
        message: 'أنت لست وحدك. القوة تكمن في طلب المساعدة. أتمنى لك السلام والطمأنينة.',
        timestamp: new Date(Date.now() - 86400000 * 0.5),
        pointsEarned: 3,
    },
    {
        id: 'offering_2',
        userId: 'user_123', // Bearer_324
        requestId: 'req_3', // مساعدة في الحصول على دواء
        type: 'Encouragement',
        message: 'أتمنى لوالدتك الشفاء العاجل. لا تفقد الأمل، فالخير موجود.',
        timestamp: new Date(Date.now() - 86400000 * 2.5),
        pointsEarned: 3,
    }
];

const MOCK_EVENTS: CommunityEvent[] = [
    {
        id: 'evt_1',
        organizerId: 'user_ngo_1',
        organizerSymbolicName: 'بناة_الغد',
        organizerSymbolicIcon: 'Lantern',
        organizerRole: Role.NGO,
        title: 'فرصة تطوع لتنظيف الشاطئ',
        description: 'ندعوكم للمشاركة في حملة تنظيف شاطئ الرملة البيضاء يوم السبت القادم. معاً نعيد لبيروت رونقها. نوفر الأدوات والمياه للمشاركين.',
        type: CommunityEventType.Volunteer,
        timestamp: new Date(Date.now() - 86400000 * 0.5),
        region: 'بيروت',
        organizerIsVerified: true,
    }
];

const MOCK_RESOURCES: Resource[] = [
    {
        id: 'res_1',
        organizerId: 'user_ngo_1',
        organizerSymbolicName: 'بناة_الغد',
        organizerSymbolicIcon: 'Lantern',
        organizerIsVerified: true,
        title: 'مطبخ مجتمعي أسبوعي',
        description: 'نقدم وجبات ساخنة ومغذية كل يوم ثلاثاء وخميس للمحتاجين. لا حاجة للتسجيل المسبق.',
        category: ResourceCategory.Food,
        region: 'بيروت',
        schedule: 'الثلاثاء والخميس، 12:00 ظهراً - 2:00 عصراً',
        contactInfo: 'اتصل على 01-555-123 لمزيد من المعلومات',
        timestamp: new Date(Date.now() - 86400000 * 7),
    },
     {
        id: 'res_2',
        organizerId: 'user_gov_1',
        organizerSymbolicName: 'دعم_وطن',
        organizerSymbolicIcon: 'Anchor',
        organizerIsVerified: true,
        title: 'استشارات قانونية مجانية',
        description: 'يقدم محامون متطوعون استشارات قانونية مجانية في قضايا الأحوال الشخصية والعمل أول جمعة من كل شهر.',
        category: ResourceCategory.Legal,
        region: 'كل المحافظات',
        schedule: 'أول جمعة من كل شهر، 9:00 صباحاً - 1:00 ظهراً',
        contactInfo: 'احجز موعدك عبر موقعنا الإلكتروني',
        timestamp: new Date(Date.now() - 86400000 * 14),
    }
];


const MOCK_THREADS: TapestryThread[] = [
  {
    id: 'thread_1',
    honoreeUserId: 'user_456',
    honoreeSymbolicName: 'صوت_النور',
    honoreeSymbolicIcon: 'Lantern',
    isAnonymous: true,
    story: 'عندما فقدت الأمل، وجدت هنا صوتاً يفهمني. لم أكن أبحث عن حلول، بل عن قلب يسمع. شكراً لـ "صوت_النور" على كلماته التي كانت كالشمعة في عتمتي.',
    color: TapestryThreadColor.Amber,
    pattern: TapestryThreadPattern.Spirals,
    rippleTag: 1,
    echoes: 15,
    timestamp: new Date(Date.now() - 86400000 * 5),
  },
   {
    id: 'thread_2',
    honoreeUserId: 'user_789',
    honoreeSymbolicName: 'يد_العون',
    honoreeSymbolicIcon: 'Flower',
    honoreeRealName: 'فاطمة ك.',
    honoreePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop',
    isAnonymous: false,
    story: 'لم أتردد لحظة في تقديم المساعدة. الدواء لم يكن مجرد علاج، بل كان رسالة حب وأمل. كلنا عائلة واحدة في هذا الوطن.',
    color: TapestryThreadColor.Gold,
    pattern: TapestryThreadPattern.Lines,
    rippleTag: 3,
    echoes: 28,
    timestamp: new Date(Date.now() - 86400000 * 10),
  },
];


export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [requests, setRequests] = React.useState<Request[]>([]);
  const [offerings, setOfferings] = React.useState<Offering[]>([]);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [tapestryThreads, setTapestryThreads] = React.useState<TapestryThread[]>([]);
  const [communityEvents, setCommunityEvents] = React.useState<CommunityEvent[]>([]);
  const [resources, setResources] = React.useState<Resource[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { user, addHopePoints, updateUser, getUserById, updateAnyUser, isFirebaseEnabled } = useAuth();

  // Firebase real-time listeners
  React.useEffect(() => {
    if (isFirebaseEnabled) {
      console.log('🔥 Initializing Firebase real-time data connections...');
      const unsubscribes: (() => void)[] = [];

      // Subscribe to requests
      const unsubscribeRequests = firebaseService.subscribeToRequests((firebaseRequests) => {
        console.log('📝 Received requests from Firebase:', firebaseRequests.length);
        setRequests(firebaseRequests);
      });
      unsubscribes.push(unsubscribeRequests);

      // Subscribe to community events
      const unsubscribeEvents = firebaseService.subscribeToEvents((firebaseEvents) => {
        console.log('🎉 Received events from Firebase:', firebaseEvents.length);
        setCommunityEvents(firebaseEvents);
      });
      unsubscribes.push(unsubscribeEvents);

      // Subscribe to resources
      const unsubscribeResources = firebaseService.subscribeToResources((firebaseResources) => {
        console.log('📚 Received resources from Firebase:', firebaseResources.length);
        setResources(firebaseResources);
      });
      unsubscribes.push(unsubscribeResources);

      // Subscribe to offerings
      const unsubscribeOfferings = firebaseService.subscribeToOfferings((firebaseOfferings) => {
        console.log('🤝 Received offerings from Firebase:', firebaseOfferings.length);
        setOfferings(firebaseOfferings);
      });
      unsubscribes.push(unsubscribeOfferings);

      // Subscribe to tapestry threads
      const unsubscribeThreads = firebaseService.subscribeToTapestryThreads((firebaseThreads) => {
        console.log('🧵 Received tapestry threads from Firebase:', firebaseThreads.length);
        setTapestryThreads(firebaseThreads);
      });
      unsubscribes.push(unsubscribeThreads);

      // Subscribe to notifications for current user
      if (user) {
        const unsubscribeNotifications = firebaseService.subscribeToNotifications((firebaseNotifications) => {
          const userNotifications = firebaseNotifications.filter(n => n.userId === user.id);
          console.log('🔔 Received notifications from Firebase:', userNotifications.length);
          setNotifications(userNotifications);
        });
        unsubscribes.push(unsubscribeNotifications);
      }

      setLoading(false);

      // Cleanup function
      return () => {
        console.log('🧹 Cleaning up Firebase listeners...');
        unsubscribes.forEach(unsubscribe => unsubscribe());
      };
    } else {
      // Fallback to mock data when Firebase is not available
      console.log('📦 Using mock data (Firebase not available)');
      setTimeout(() => {
        setRequests(MOCK_REQUESTS);
        setOfferings(MOCK_OFFERINGS);
        setTapestryThreads(MOCK_THREADS);
        setCommunityEvents(MOCK_EVENTS);
        setResources(MOCK_RESOURCES);
        setLoading(false);
      }, 1000);
    }
  }, [isFirebaseEnabled, user]);
  
  React.useEffect(() => {
     if (user && !user.nominationStatus) {
        const nominationNotification: Notification = {
            id: `notif_nomination_${user.id}`,
            userId: user.id,
            message: "DEPRECATED", // No longer used, will be translated from key
            messageKey: 'notifications.nomination',
            timestamp: new Date(),
            isRead: false,
            type: 'Nomination',
        };
        setNotifications(prev => {
            if (prev.find(n => n.id === nominationNotification.id)) return prev;
            return [nominationNotification, ...prev];
        });
        updateUser({ nominationStatus: 'Nominated' });
    }
  }, [user, updateUser]);

  const addRequest = async (requestData: Omit<Request, 'id' | 'timestamp' | 'userId' | 'userSymbolicName' | 'userSymbolicIcon' | 'status' | 'helperId' | 'isConfirmedByRequester' | 'requesterCommended' | 'helperCommended'>, user: User) => {
    const newRequest: Omit<Request, 'id'> = {
        ...requestData,
        timestamp: new Date(),
        userId: user.id,
        userSymbolicName: user.symbolicName,
        userSymbolicIcon: user.symbolicIcon,
        status: RequestStatus.Open,
        isConfirmedByRequester: false,
        requesterCommended: false,
        helperCommended: false,
    };

    if (isFirebaseEnabled) {
      console.log('🔥 Creating request in Firebase...');
      const success = await firebaseService.createRequest(newRequest as any);
      if (success) {
        console.log('✅ Request created successfully in Firebase');
        // Firebase listener will update the state automatically
      } else {
        console.error('❌ Failed to create request in Firebase');
      }
    } else {
      // Fallback to local state
      const localRequest: Request = { ...newRequest, id: `req_${Date.now()}` };
      setRequests(prev => [localRequest, ...prev]);
    }
  };

  const addCommunityEvent = async (eventData: Omit<CommunityEvent, 'id' | 'timestamp' | 'organizerId' | 'organizerSymbolicName' | 'organizerSymbolicIcon' | 'organizerRole' | 'organizerIsVerified'>, user: User) => {
    const newEvent: Omit<CommunityEvent, 'id'> = {
        ...eventData,
        timestamp: new Date(),
        organizerId: user.id,
        organizerSymbolicName: user.symbolicName,
        organizerSymbolicIcon: user.symbolicIcon,
        organizerRole: user.role,
        organizerIsVerified: user.isVerified,
    };

    if (isFirebaseEnabled) {
      console.log('🔥 Creating event in Firebase...');
      const success = await firebaseService.createEvent(newEvent);
      if (success) {
        console.log('✅ Event created successfully in Firebase');
        // Firebase listener will update the state automatically
      } else {
        console.error('❌ Failed to create event in Firebase');
      }
    } else {
      // Fallback to local state
      const localEvent: CommunityEvent = { ...newEvent, id: `evt_${Date.now()}` };
      setCommunityEvents(prev => [localEvent, ...prev]);
    }
  };

  const addResource = async (resourceData: Omit<Resource, 'id' | 'timestamp' | 'organizerId' | 'organizerSymbolicName' | 'organizerSymbolicIcon' | 'organizerIsVerified'>, user: User) => {
    const newResource: Omit<Resource, 'id'> = {
      ...resourceData,
      timestamp: new Date(),
      organizerId: user.id,
      organizerSymbolicName: user.symbolicName,
      organizerSymbolicIcon: user.symbolicIcon,
      organizerIsVerified: user.isVerified,
    };

    if (isFirebaseEnabled) {
      console.log('🔥 Creating resource in Firebase...');
      const success = await firebaseService.createResource(newResource as any);
      if (success) {
        console.log('✅ Resource created successfully in Firebase');
      } else {
        console.error('❌ Failed to create resource in Firebase');
      }
    } else {
      // Fallback to local state
      const localResource: Resource = { ...newResource, id: `res_${Date.now()}` };
      setResources(prev => [localResource, ...prev]);
    }
  };

  const addOffering = async (offeringData: Omit<Offering, 'id' | 'timestamp' | 'userId'>, userId: string) => {
    const newOffering: Omit<Offering, 'id'> = {
        ...offeringData,
        timestamp: new Date(),
        userId
    };

    if (isFirebaseEnabled) {
      console.log('🔥 Creating offering in Firebase...');
      const success = await firebaseService.createOffering(newOffering as any);
      if (success) {
        console.log('✅ Offering created successfully in Firebase');
      } else {
        console.error('❌ Failed to create offering in Firebase');
      }
    } else {
      // Fallback to local state
      const localOffering: Offering = { ...newOffering, id: `offering_${Date.now()}` };
      setOfferings(prev => [localOffering, ...prev]);
    }

    if (offeringData.type === 'Encouragement') {
      addHopePoints(offeringData.pointsEarned, HopePointCategory.VoiceOfCompassion);
    }

    const request = requests.find(r => r.id === offeringData.requestId);
    if (request && request.userId !== userId) {
        const newNotification: Notification = {
            id: `notif_${Date.now()}`,
            userId: request.userId,
            requestId: request.id,
            message: "DEPRECATED",
            messageKey: 'notifications.encouragement',
            messageOptions: { title: request.title.substring(0, 20) },
            timestamp: new Date(),
            isRead: false,
            type: 'Generic'
        };
        if (isFirebaseEnabled) {
          await firebaseService.createNotification(newNotification as any);
        } else {
          setNotifications(prev => [newNotification, ...prev]);
        }
    }
  };

  const addTapestryThread = async (threadData: Omit<TapestryThread, 'id' | 'timestamp'>): Promise<string | null> => {
    const newThread: Omit<TapestryThread, 'id'> = {
      ...threadData,
      timestamp: new Date(),
    };

    if (isFirebaseEnabled) {
      try {
        const createdId = await firebaseService.addTapestryThread(newThread as any);
        return createdId;
      } catch (err) {
        console.error('Error adding tapestry thread to Firebase:', err);
        return null;
      }
    } else {
      const localThread: TapestryThread = { ...newThread, id: `thread_${Date.now()}` } as TapestryThread;
      setTapestryThreads(prev => [localThread, ...prev]);
      return localThread.id;
    }
  };

  const initiateHelp = (requestId: string, helperId: string) => {
      // Update request status via Firebase if available
      const request = requests.find(r => r.id === requestId);
      const helper = user; // current user
      if (isFirebaseEnabled) {
        firebaseService.updateRequest(requestId, { status: RequestStatus.Pending, helperId });
        if (request && helper) {
          const newNotification: Notification = {
            id: `notif_${Date.now()}_help_offer`,
            userId: request.userId,
            requestId: request.id,
            message: "DEPRECATED",
            messageKey: 'notifications.helpOffer',
            messageOptions: { name: helper.symbolicName, title: request.title.substring(0, 20) },
            timestamp: new Date(),
            isRead: false,
            type: 'Generic',
          };
          firebaseService.createNotification(newNotification as any);
        }
      } else {
        setRequests(prev => prev.map(r => r.id === requestId ? {...r, status: RequestStatus.Pending, helperId: helperId} : r));
        if(request && helper) {
          const newNotification: Notification = {
            id: `notif_${Date.now()}_help_offer`,
            userId: request.userId,
            requestId: request.id,
            message: "DEPRECATED",
            messageKey: 'notifications.helpOffer',
            messageOptions: { name: helper.symbolicName, title: request.title.substring(0, 20) },
            timestamp: new Date(),
            isRead: false,
            type: 'Generic',
          };
          setNotifications(prev => [newNotification, ...prev]);
        }
      }
  };

  const confirmReceipt = (requestId: string) => {
      const request = requests.find(r => r.id === requestId);
      if (isFirebaseEnabled) {
        firebaseService.updateRequest(requestId, { isConfirmedByRequester: true });
        if (request && request.helperId) {
          const newNotification: Notification = {
            id: `notif_${Date.now()}_help_confirm`,
            userId: request.helperId,
            requestId: request.id,
            message: "DEPRECATED",
            messageKey: 'notifications.receiptConfirm',
            messageOptions: { title: request.title.substring(0, 20) },
            timestamp: new Date(),
            isRead: false,
            type: 'Generic',
          };
          firebaseService.createNotification(newNotification as any);
        }
      } else {
        setRequests(prev => prev.map(r => r.id === requestId ? {...r, isConfirmedByRequester: true} : r));
        if(request && request.helperId) {
          const newNotification: Notification = {
            id: `notif_${Date.now()}_help_confirm`,
            userId: request.helperId,
            requestId: request.id,
            message: "DEPRECATED",
            messageKey: 'notifications.receiptConfirm',
            messageOptions: { title: request.title.substring(0, 20) },
            timestamp: new Date(),
            isRead: false,
            type: 'Generic',
          };
          setNotifications(prev => [newNotification, ...prev]);
        }
      }
  };

  const fulfillRequest = async (requestId: string, helperId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (isFirebaseEnabled) {
      await firebaseService.updateRequest(requestId, { status: RequestStatus.Fulfilled, helperId });
      if (request && request.userId !== helperId) {
        const newNotification: Notification = {
          id: `notif_${Date.now()}_fulfill`,
          userId: request.userId,
          requestId: request.id,
          message: "DEPRECATED",
          messageKey: 'notifications.fulfillment',
          messageOptions: { title: request.title.substring(0, 20) },
          timestamp: new Date(),
          isRead: false,
          type: 'Generic',
        };
        await firebaseService.createNotification(newNotification as any);
      }
    } else {
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: RequestStatus.Fulfilled, helperId } : r));
      if (request && request.userId !== helperId) {
        const newNotification: Notification = {
          id: `notif_${Date.now()}_fulfill`,
          userId: request.userId,
          requestId: request.id,
          message: "DEPRECATED",
          messageKey: 'notifications.fulfillment',
          messageOptions: { title: request.title.substring(0, 20) },
          timestamp: new Date(),
          isRead: false,
          type: 'Generic',
        };
        setNotifications(prev => [newNotification, ...prev]);
      }
    }
  };
    const getNotificationsForUser = (userId: string) => {
    const local = notifications.filter(n => n.userId === userId).sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
    if (local.length > 0) return local;

    if (isFirebaseEnabled) {
      (async () => {
        try {
          const remote = await firebaseService.getUserNotifications(userId);
          if (remote && remote.length) {
            setNotifications(remote as Notification[]);
          }
        } catch (err) {
          console.error('Error fetching notifications for user:', err);
        }
      })();
    }

    return local;
    };

    const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? {...n, isRead: true} : n));
    if (isFirebaseEnabled) {
      firebaseService.updateNotification(notificationId, { isRead: true });
    }
    };
    
    const acceptNomination = (userId: string, choice: 'Reveal' | 'Anonymous', details?: { realName: string, photoUrl?: string }) => {
        if (!user) return;

        if (choice === 'Reveal' && details) {
            // Update nomination status for current user
            if (isFirebaseEnabled) {
              // Update user in Firestore and add tapestry thread remotely
              firebaseService.updateUser(user.id, {
                nominationStatus: 'AcceptedReveal',
                realName: details.realName,
                photoUrl: details.photoUrl
              });

              const newThread: TapestryThread = {
                id: `thread_${Date.now()}`,
                honoreeUserId: userId,
                honoreeSymbolicName: user.symbolicName,
                honoreeSymbolicIcon: user.symbolicIcon,
                honoreeRealName: details.realName,
                honoreePhotoUrl: details.photoUrl,
                isAnonymous: false,
                story: i18n.t('tapestry.story.revealed'),
                color: TapestryThreadColor.Gold,
                pattern: TapestryThreadPattern.Lines,
                rippleTag: 5,
                echoes: 0,
                timestamp: new Date(),
              };
              firebaseService.addTapestryThread(newThread as any);
            } else {
              updateUser({
                nominationStatus: 'AcceptedReveal',
                realName: details.realName,
                photoUrl: details.photoUrl
              });
              const newThread: TapestryThread = {
                id: `thread_${Date.now()}`,
                honoreeUserId: userId,
                honoreeSymbolicName: user.symbolicName,
                honoreeSymbolicIcon: user.symbolicIcon,
                honoreeRealName: details.realName,
                honoreePhotoUrl: details.photoUrl,
                isAnonymous: false,
                story: i18n.t('tapestry.story.revealed'),
                color: TapestryThreadColor.Gold,
                pattern: TapestryThreadPattern.Lines,
                rippleTag: 5,
                echoes: 0,
                timestamp: new Date(),
              };
              setTapestryThreads(prev => [newThread, ...prev]);
            }
        } else {
            // Anonymous acceptance
            if (isFirebaseEnabled) {
              firebaseService.updateUser(user.id, { nominationStatus: 'AcceptedAnonymous' });
              const newThread: TapestryThread = {
                id: `thread_${Date.now()}`,
                honoreeUserId: userId,
                honoreeSymbolicName: user.symbolicName,
                honoreeSymbolicIcon: user.symbolicIcon,
                isAnonymous: true,
                story: i18n.t('tapestry.story.anonymous'),
                color: TapestryThreadColor.Blue,
                pattern: TapestryThreadPattern.Spirals,
                rippleTag: 3,
                echoes: 0,
                timestamp: new Date(),
              };
              firebaseService.addTapestryThread(newThread as any);
            } else {
              updateUser({ nominationStatus: 'AcceptedAnonymous' });
              const newThread: TapestryThread = {
                id: `thread_${Date.now()}`,
                honoreeUserId: userId,
                honoreeSymbolicName: user.symbolicName,
                honoreeSymbolicIcon: user.symbolicIcon,
                isAnonymous: true,
                story: i18n.t('tapestry.story.anonymous'),
                color: TapestryThreadColor.Blue,
                pattern: TapestryThreadPattern.Spirals,
                rippleTag: 3,
                echoes: 0,
                timestamp: new Date(),
              };
              setTapestryThreads(prev => [newThread, ...prev]);
            }
        }
    };

    const echoThread = (threadId: string) => {
        const thread = tapestryThreads.find(t => t.id === threadId);
        if (!thread) return;

        const newCount = thread.echoes + 1;

        // Optimistic local update
        setTapestryThreads(prev => prev.map(t => t.id === threadId ? { ...t, echoes: newCount } : t));

        if (isFirebaseEnabled) {
          firebaseService.updateTapestryThread(threadId, { echoes: newCount });
        }
    };

    const giveDailyPoint = async (receiverId: string): Promise<{ success: boolean; messageKey: string; receiverName?: string }> => {
        if (!user) {
            return { success: false, messageKey: 'scanner.error.notLoggedIn' };
        }
        if (user.id === receiverId) {
            return { success: false, messageKey: 'scanner.error.selfGift' };
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (user.lastPointGivenTimestamp && user.lastPointGivenTimestamp >= today.getTime()) {
            return { success: false, messageKey: 'scanner.error.alreadyGiven' };
        }

        // In Firebase mode, fetch receiver remotely
        let receiver = getUserById(receiverId);
        if (isFirebaseEnabled) {
          try {
            const remote = await firebaseService.getUser(receiverId);
            if (remote) receiver = remote as User;
          } catch (err) {
            console.error('Error fetching receiver:', err);
          }
        }

        if (!receiver) {
          return { success: false, messageKey: 'scanner.error.userNotFound' };
        }

        // Prepare updates
        const receiverUpdatedPartial = {
          hopePoints: (receiver.hopePoints || 0) + 1,
          hopePointsBreakdown: {
            ...(receiver.hopePointsBreakdown || {}),
            [HopePointCategory.CommunityGift]: ((receiver.hopePointsBreakdown && receiver.hopePointsBreakdown[HopePointCategory.CommunityGift]) || 0) + 1
          }
        } as Partial<User>;

        const giverUpdatedPartial = {
          hopePoints: (user.hopePoints || 0) + 1,
          hopePointsBreakdown: {
            ...(user.hopePointsBreakdown || {}),
            [HopePointCategory.CommunityGift]: ((user.hopePointsBreakdown && user.hopePointsBreakdown[HopePointCategory.CommunityGift]) || 0) + 1
          },
          lastPointGivenTimestamp: Date.now()
        } as Partial<User>;

        // Apply updates
        if (isFirebaseEnabled) {
          try {
            await firebaseService.updateUser(receiverId, receiverUpdatedPartial);
            await firebaseService.updateUser(user.id, giverUpdatedPartial);
            // Add notification to receiver
            const newNotification: Notification = {
              id: `notif_${Date.now()}_gift`,
              userId: receiverId,
              message: 'DEPRECATED',
              messageKey: 'notifications.dailyGift',
              timestamp: new Date(),
              isRead: false,
              type: 'Generic'
            };

            
            await firebaseService.createNotification(newNotification as any);
            // Optimistically update local auth state via updateUser from context
            updateUser(giverUpdatedPartial);
            return { success: true, messageKey: 'scanner.success.giftSent', receiverName: receiver.symbolicName };
          } catch (err) {
            console.error('Error applying daily point via Firebase:', err);
            return { success: false, messageKey: 'scanner.error.server' };
          }
        } else {
          // local fallback
          const updatedReceiver = {
            ...receiver,
            hopePoints: (receiver.hopePoints || 0) + 1,
            hopePointsBreakdown: {
              ...(receiver.hopePointsBreakdown || {}),
              [HopePointCategory.CommunityGift]: ((receiver.hopePointsBreakdown && receiver.hopePointsBreakdown[HopePointCategory.CommunityGift]) || 0) + 1
            }
          };
          updateAnyUser(updatedReceiver as User);

          const updatedGiver = {
            ...user,
            hopePoints: (user.hopePoints || 0) + 1,
            hopePointsBreakdown: {
              ...(user.hopePointsBreakdown || {}),
              [HopePointCategory.CommunityGift]: ((user.hopePointsBreakdown && user.hopePointsBreakdown[HopePointCategory.CommunityGift]) || 0) + 1
            },
            lastPointGivenTimestamp: Date.now()
          } as Partial<User>;
          updateUser(updatedGiver);

          return { success: true, messageKey: 'scanner.success.giftSent', receiverName: receiver.symbolicName };
        }
    };

    const getRequestById = (requestId: string): Request | undefined => {
    const local = requests.find(r => r.id === requestId);
    if (local) return local;

    // If Firebase is enabled but we don't have the request locally yet, fetch once
    if (isFirebaseEnabled) {
      (async () => {
        try {
          const remote = await firebaseService.getRequests();
          if (remote && remote.length) {
            setRequests(remote);
          }
        } catch (err) {
          console.error('Error fetching request by id:', err);
        }
      })();
    }

    return undefined;
    };

    const getOfferingsForRequest = (requestId: string): Offering[] => {
    const local = offerings.filter(o => o.requestId === requestId).sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
    if (local.length > 0) return local;

    // If Firebase is enabled and we don't have offerings locally, fetch them once
    if (isFirebaseEnabled) {
      (async () => {
        try {
          const remoteOfferings = await firebaseService.getOfferingsForRequest(requestId);
          if (remoteOfferings && remoteOfferings.length) {
            // Merge remote offerings into state
            setOfferings(prev => {
              const existingIds = new Set(prev.map(p => p.id));
              const merged = [...prev];
              remoteOfferings.forEach(o => {
                if (!existingIds.has(o.id)) merged.push(o as Offering);
              });
              return merged.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
            });
          }
        } catch (err) {
          console.error('Error fetching offerings for request:', err);
        }
      })();
    }

    return local;
    };
    
    const leaveCommendation = (requestId: string, fromRole: 'requester' | 'helper', commendations: CommendationType[]) => {
        const request = requests.find(r => r.id === requestId);
        if (!request) return;

        const toUserId = fromRole === 'requester' ? request.helperId : request.userId;
        if (!toUserId) return;
        
        if (isFirebaseEnabled) {
          (async () => {
            try {
              // Fetch target user remotely
              const remoteUser = await firebaseService.getUser(toUserId);
              if (!remoteUser) return;

              const updatedCommendations = { ...(remoteUser.commendations || {}) };
              commendations.forEach(c => {
                updatedCommendations[c] = (updatedCommendations[c] || 0) + 1;
              });

              await firebaseService.updateUser(toUserId, { commendations: updatedCommendations } as any);

              // Update request flags
              if (fromRole === 'requester') {
                await firebaseService.updateRequest(requestId, { requesterCommended: true });
              } else {
                await firebaseService.updateRequest(requestId, { helperCommended: true });
              }
            } catch (err) {
              console.error('Error leaving commendation via Firebase:', err);
            }
          })();
        } else {
          const toUser = getUserById(toUserId);
          if (!toUser) return;
          
          const updatedCommendations = { ...toUser.commendations };
          commendations.forEach(c => {
              updatedCommendations[c] = (updatedCommendations[c] || 0) + 1;
          });

          updateAnyUser({ ...toUser, commendations: updatedCommendations });

          setRequests(prev => prev.map(r => {
              if (r.id === requestId) {
                  return {
                      ...r,
                      ...(fromRole === 'requester' && { requesterCommended: true }),
                      ...(fromRole === 'helper' && { helperCommended: true }),
                  };
              }
              return r;
          }));
        }
    };

  // Hope points ledger wrappers (provider scope)
  const recordHopePoints = async (actorId: string, receiverId: string, category: string, amount: number, reason?: string, depthMultiplier = 1) => {
    if (!isFirebaseEnabled) return { success: false };
    try {
      const { enhancedFirebaseService } = await import('../services/firebase-enhanced');
      const res = await enhancedFirebaseService.recordHopePoints(actorId, receiverId, category, amount, reason, depthMultiplier);
      return { success: res.success };
    } catch (err) {
      console.error('Error recording hope points wrapper', err);
      return { success: false };
    }
  };

  // Give a ritual-only point to the current user (performer) and record analytics
  const giveRitualPoint = async (opts?: { prompt?: string }): Promise<{ success: boolean; messageKey: string }> => {
    if (!user) return { success: false, messageKey: 'scanner.error.notLoggedIn' };
    try {
      // enforce once-per-day
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (user.lastRitualTimestamp && user.lastRitualTimestamp >= today.getTime()) {
        return { success: false, messageKey: 'scanner.error.alreadyGiven' };
      }

      // Update user locally and remotely
      const updated = {
        hopePoints: (user.hopePoints || 0) + 1,
        hopePointsBreakdown: {
          ...(user.hopePointsBreakdown || {}),
          [HopePointCategory.Ritual]: ((user.hopePointsBreakdown && user.hopePointsBreakdown[HopePointCategory.Ritual]) || 0) + 1
        },
        lastRitualTimestamp: Date.now()
      } as Partial<typeof user>;

      // Build analytics payload with optional context
      const analyticsPayload: any = {
        userId: user.id,
        timestamp: new Date().toISOString(),
        prompt: opts?.prompt || undefined,
        locale: (typeof navigator !== 'undefined' && navigator.language) ? navigator.language : (user.preferredLanguage || 'en'),
        userAgent: typeof navigator !== 'undefined' ? (navigator.userAgent || '') : '',
      };

      // If we can dynamically import the DailyRitual prompt text (not required), leave undefined — UI will pass prompt via enhanced call if needed

      if (isFirebaseEnabled) {
        try {
          // Use callable function to authoritatively award ritual (server enforces once-per-day UTC)
          const { getFunctions, httpsCallable } = await import('firebase/functions');
          const functions = getFunctions();
          const fn = httpsCallable(functions, 'awardRitual');
          const payload = { prompt: opts?.prompt };
          const res = await fn(payload);
          const data = res && (res.data as any);
          if (data && data.success) {
            // Update local user state with returned totals if present
            if (data.newHopePoints || data.newBreakdown) {
              const updatedFromServer: Partial<typeof user> = {} as any;
              if (typeof data.newHopePoints === 'number') updatedFromServer.hopePoints = data.newHopePoints;
              if (data.newBreakdown) updatedFromServer.hopePointsBreakdown = data.newBreakdown;
              updatedFromServer.lastRitualTimestamp = Date.now();
              updateUser(updatedFromServer);
            } else {
              // Fallback optimistic update
              updateUser(updated);
            }
            return { success: true, messageKey: 'ritual.success' };
          } else {
            // If function responded with standard structured error, surface friendly message
            console.warn('awardRitual returned unexpected payload', data);
            return { success: false, messageKey: 'ritual.error' };
          }
        } catch (err: any) {
          // If callable returns a HttpsError with code 'failed-precondition' and message 'already-completed', map to user-facing text
          const code = err?.code || err?.status || null;
          if (code === 'failed-precondition' || code === 'already-completed') {
            return { success: false, messageKey: 'scanner.error.alreadyGiven' };
          }
          console.error('Failed to call awardRitual:', err);
          return { success: false, messageKey: 'ritual.error' };
        }
      }

      // local fallback
      updateUser(updated);
      return { success: true, messageKey: 'ritual.success' };
    } catch (err) {
      console.error('Error giving ritual point', err);
      return { success: false, messageKey: 'ritual.error' };
    }
  };

  const getLeaderboard = async (opts?: { role?: string; startDate?: string; endDate?: string; depthBased?: boolean; limit?: number; }) => {
    if (!isFirebaseEnabled) return null;
    try {
      const { enhancedFirebaseService } = await import('../services/firebase-enhanced');
      // First, try to read pre-aggregated global document for fast leaderboard
      try {
        if (typeof enhancedFirebaseService.getPreaggregatedGlobal === 'function') {
          const aggRes = await enhancedFirebaseService.getPreaggregatedGlobal();
          if (aggRes && aggRes.success && Array.isArray(aggRes.data)) {
            return aggRes.data.slice(0, opts?.limit || 100);
          }
        }
      } catch (innerErr) {
        // ignore and fall back to ledger aggregation
      }

      const res = await enhancedFirebaseService.getLeaderboard(opts);
      if (res && res.success) return res.data as any[] || [];
      return null;
    } catch (err) {
      console.error('Error fetching leaderboard', err);
      return null;
    }
  };


  return (
    <DataContext.Provider value={{ requests, offerings, addRequest, addOffering, fulfillRequest, notifications, getNotificationsForUser, markAsRead, loading, tapestryThreads, acceptNomination, echoThread, initiateHelp, confirmReceipt, giveDailyPoint, giveRitualPoint, communityEvents, addCommunityEvent, getRequestById, getOfferingsForRequest, resources, addResource, leaveCommendation, addTapestryThread, recordHopePoints, getLeaderboard }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = React.useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};