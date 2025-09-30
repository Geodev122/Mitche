import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Request, Offering, RequestType, RequestMode, Notification, HopePointCategory, RequestStatus, TapestryThread, TapestryThreadColor, TapestryThreadPattern, User } from '../types';
import { useAuth } from './AuthContext';

interface DataContextType {
  requests: Request[];
  offerings: Offering[];
  notifications: Notification[];
  tapestryThreads: TapestryThread[];
  addRequest: (request: Omit<Request, 'id' | 'timestamp' | 'userId' | 'userSymbolicName' | 'userSymbolicIcon' | 'status' | 'helperId' | 'isConfirmedByRequester'>, user: User) => void;
  addOffering: (offering: Omit<Offering, 'id' | 'timestamp' | 'userId'>, userId: string) => void;
  initiateHelp: (requestId: string, helperId: string) => void;
  confirmReceipt: (requestId: string) => void;
  fulfillRequest: (requestId: string, helperId: string) => void;
  getNotificationsForUser: (userId: string) => Notification[];
  markAsRead: (notificationId: string) => void;
  acceptNomination: (userId: string, choice: 'Reveal' | 'Anonymous', details?: { realName: string, photoUrl?: string }) => void;
  echoThread: (threadId: string) => void;
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const MOCK_REQUESTS: Request[] = [
    {
        id: 'req_4',
        userId: 'user_ngo_1',
        userSymbolicName: 'بناة_الغد',
        userSymbolicIcon: 'Lantern',
        title: 'فرصة تطوع لتنظيف الشاطئ',
        description: 'ندعوكم للمشاركة في حملة تنظيف شاطئ الرملة البيضاء يوم السبت القادم. معاً نعيد لبيروت رونقها. نوفر الأدوات والمياه للمشاركين.',
        type: RequestType.Volunteering,
        mode: RequestMode.Loud,
        timestamp: new Date(Date.now() - 86400000 * 0.5),
        region: 'بيروت',
        status: RequestStatus.Open,
        isConfirmedByRequester: false,
    },
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
    },
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


export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [tapestryThreads, setTapestryThreads] = useState<TapestryThread[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, addHopePoints, updateUser } = useAuth();


  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setRequests(MOCK_REQUESTS);
      setTapestryThreads(MOCK_THREADS);
      setLoading(false);
    }, 1000);
  }, []);
  
  useEffect(() => {
     if (user && !user.nominationStatus) {
        const nominationNotification: Notification = {
            id: `notif_nomination_${user.id}`,
            userId: user.id,
            message: "لقد وصل نورك إلى المعبد. تم ترشيحك لجائزة حامل الأمل. هل تود أن تخطو إلى الأمام، أم تبقى نجماً صامتاً؟",
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
  }, [user]);

  const addRequest = (requestData: Omit<Request, 'id' | 'timestamp' | 'userId' | 'userSymbolicName' | 'userSymbolicIcon' | 'status' | 'helperId' | 'isConfirmedByRequester'>, user: User) => {
    const newRequest: Request = {
        ...requestData,
        id: `req_${Date.now()}`,
        timestamp: new Date(),
        userId: user.id,
        userSymbolicName: user.symbolicName,
        userSymbolicIcon: user.symbolicIcon,
        status: RequestStatus.Open,
        isConfirmedByRequester: false,
    };
    setRequests(prev => [newRequest, ...prev]);
  };

  const addOffering = (offeringData: Omit<Offering, 'id' | 'timestamp' | 'userId'>, userId: string) => {
    const newOffering: Offering = {
        ...offeringData,
        id: `offering_${Date.now()}`,
        timestamp: new Date(),
        userId
    };
    setOfferings(prev => [newOffering, ...prev]);

    if (offeringData.type === 'Encouragement') {
      addHopePoints(offeringData.pointsEarned, HopePointCategory.VoiceOfCompassion);
    }

    const request = requests.find(r => r.id === offeringData.requestId);
    if (request && request.userId !== userId) {
        const newNotification: Notification = {
            id: `notif_${Date.now()}`,
            userId: request.userId,
            requestId: request.id,
            message: `رسالة تشجيع جديدة على طلبك "${request.title.substring(0, 20)}..."`,
            timestamp: new Date(),
            isRead: false,
            type: 'Generic'
        };
        setNotifications(prev => [newNotification, ...prev]);
    }
  };

  const initiateHelp = (requestId: string, helperId: string) => {
      setRequests(prev => prev.map(r => r.id === requestId ? {...r, status: RequestStatus.Pending, helperId: helperId} : r));
      const request = requests.find(r => r.id === requestId);
      const helper = user; // Assuming current user is the helper
      if(request && helper) {
        const isVolunteering = request.type === RequestType.Volunteering;
        const newNotification: Notification = {
            id: `notif_${Date.now()}_help_offer`,
            userId: request.userId,
            requestId: request.id,
            message: isVolunteering
                ? `المستخدم "${helper.symbolicName}" يود المشاركة في فرصتك التطوعية "${request.title.substring(0, 20)}...".`
                : `مستخدم "${helper.symbolicName}" بدأ بمساعدتك في طلبك "${request.title.substring(0, 20)}...".`,
            timestamp: new Date(),
            isRead: false,
            type: 'Generic',
        };
        setNotifications(prev => [newNotification, ...prev]);
      }
  };

  const confirmReceipt = (requestId: string) => {
      setRequests(prev => prev.map(r => r.id === requestId ? {...r, isConfirmedByRequester: true} : r));
      const request = requests.find(r => r.id === requestId);
      if(request && request.helperId) {
        const isVolunteering = request.type === RequestType.Volunteering;
        const newNotification: Notification = {
            id: `notif_${Date.now()}_help_confirm`,
            userId: request.helperId,
            requestId: request.id,
            message: isVolunteering
                ? `صاحب فرصة التطوع "${request.title.substring(0, 20)}..." أكد مشاركتك. يمكنك الآن المطالبة بنقاط المساهمة.`
                : `صاحب الطلب "${request.title.substring(0, 20)}..." أكد استلام المساعدة. يمكنك الآن المطالبة بنقاط الأمل.`,
            timestamp: new Date(),
            isRead: false,
            type: 'Generic',
        };
        setNotifications(prev => [newNotification, ...prev]);
      }
  };

  const fulfillRequest = (requestId: string, helperId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request || !request.isConfirmedByRequester) return;

    setRequests(prev => prev.map(r => r.id === requestId ? {...r, status: RequestStatus.Fulfilled} : r));
    
    const isVolunteering = request.type === RequestType.Volunteering;
    let category = request.mode === RequestMode.Loud ? HopePointCategory.CommunityBuilder : HopePointCategory.SilentHero;
    if (isVolunteering) {
        category = HopePointCategory.CommunityBuilder;
    }
    
    const pointsForHelp = 10;
    addHopePoints(pointsForHelp, category);

    if (request.userId !== helperId) {
         const newNotification: Notification = {
            id: `notif_${Date.now()}_fulfill`,
            userId: request.userId,
            requestId: request.id,
            message: isVolunteering
                ? `تم إتمام المشاركة في "${request.title.substring(0, 20)}...". شكراً لك على إتاحة هذه الفرصة.`
                : `تمت تلبية طلبك "${request.title.substring(0, 20)}..."! شكراً للمستخدم الذي ساعدك.`,
            timestamp: new Date(),
            isRead: false,
            type: 'Generic',
        };
        setNotifications(prev => [newNotification, ...prev]);
    }
  };
  
    const getNotificationsForUser = (userId: string) => {
        return notifications.filter(n => n.userId === userId).sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
    };

    const markAsRead = (notificationId: string) => {
        setNotifications(prev => prev.map(n => n.id === notificationId ? {...n, isRead: true} : n));
    };
    
    const acceptNomination = (userId: string, choice: 'Reveal' | 'Anonymous', details?: { realName: string, photoUrl?: string }) => {
        if (choice === 'Reveal' && details && user) {
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
                 story: "قصة أمل جديدة، كُشفت للعالم من خلال الشجاعة والرحمة.",
                 color: TapestryThreadColor.Gold, // Hope Bearer award
                 pattern: TapestryThreadPattern.Lines,
                 rippleTag: 5,
                 echoes: 0,
                 timestamp: new Date(),
            };
            setTapestryThreads(prev => [newThread, ...prev]);
        } else if (user) {
            updateUser({ nominationStatus: 'AcceptedAnonymous' });
            const newThread: TapestryThread = {
                 id: `thread_${Date.now()}`,
                 honoreeUserId: userId,
                 honoreeSymbolicName: user.symbolicName,
                 honoreeSymbolicIcon: user.symbolicIcon,
                 isAnonymous: true,
                 story: "وهج نجم صامت، شعر به الكثيرون، وعرفه القليلون. شهادة على القوة الهادئة.",
                 color: TapestryThreadColor.Blue, // Silent Hero
                 pattern: TapestryThreadPattern.Spirals,
                 rippleTag: 3,
                 echoes: 0,
                 timestamp: new Date(),
            };
            setTapestryThreads(prev => [newThread, ...prev]);
        }
    };

    const echoThread = (threadId: string) => {
        setTapestryThreads(prev => prev.map(t => t.id === threadId ? { ...t, echoes: t.echoes + 1 } : t));
    };


  return (
    <DataContext.Provider value={{ requests, offerings, addRequest, addOffering, fulfillRequest, notifications, getNotificationsForUser, markAsRead, loading, tapestryThreads, acceptNomination, echoThread, initiateHelp, confirmReceipt }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};