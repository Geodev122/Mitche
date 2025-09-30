import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Card from '../components/ui/Card';
import SymbolIcon from '../components/ui/SymbolIcon';
import { Award, ShieldCheck, LogOut, Download, MessageSquare, HeartHandshake, Building, Sunrise, Heart, PlusCircle, Handshake, CheckCircle, Pencil, MapPin, QrCode, ScanLine, Calendar, Bell, BellOff, Send, ChevronRight } from 'lucide-react';
import { HopePointCategory, RequestStatus, Role } from '../types';
import { useTranslation } from 'react-i18next';
import Modal from '../components/ui/Modal';
import EditProfileModal from '../components/ui/EditProfileModal';
import { useNavigate } from 'react-router-dom';
import { timeSince } from '../utils/time';
import { isPushSupported, subscribeUser, unsubscribeUser, getSubscription } from '../utils/notifications';


interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface ChartData {
  label: string;
  value: number;
  color: string;
}

const BarChart: React.FC<{ data: ChartData[]; max: number }> = ({ data, max }) => {
  return (
    <div className="w-full space-y-2">
      {data.map(item => (
        <div key={item.label} className="flex items-center">
          <div className="w-1/3 text-xs text-gray-500">{item.label}</div>
          <div className="w-2/3 bg-gray-200 rounded-full h-4">
            <div
              className={`${item.color} h-4 rounded-full flex items-center justify-end pr-2 text-white text-xs font-bold`}
              style={{ width: `${max > 0 ? (item.value / max) * 100 : 0}%` }}
              title={`${item.value} points`}
            >
              {item.value > 0 ? item.value : ''}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    isUnlocked: boolean;
}

interface Activity {
    type: 'create_request' | 'fulfill_request' | 'send_encouragement';
    timestamp: Date;
    description: string;
    icon: React.ElementType;
}

const SettingsButton: React.FC<{icon: React.ElementType, label: string, onClick?: () => void, isDestructive?: boolean}> = ({icon: Icon, label, onClick, isDestructive}) => (
    <button onClick={onClick} className={`w-full flex items-center justify-between text-left p-4 rounded-lg bg-white transition-colors duration-200 active:bg-gray-100 ${isDestructive ? 'text-red-600' : 'text-gray-700'}`}>
        <div className="flex items-center">
            <Icon className={`w-5 h-5 mr-3 rtl:mr-0 rtl:ml-3 ${isDestructive ? 'text-red-500' : 'text-gray-500'}`} />
            <span className="font-semibold">{label}</span>
        </div>
        {!isDestructive && <ChevronRight className="w-5 h-5 text-gray-400" />}
    </button>
);


const Constellation: React.FC = () => {
  const { user, logout } = useAuth();
  const { requests, offerings, tapestryThreads, communityEvents } = useData();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  
  const [isPushSupportedState, setIsPushSupportedState] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscriptionLoading, setSubscriptionLoading] = useState(true);

  useEffect(() => {
    // Check if the app is already running in standalone mode.
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setIsAppInstalled(true);
    }

    const beforeInstallHandler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      if (!isStandalone) {
        setDeferredPrompt(e as BeforeInstallPromptEvent);
      }
    };

    const appInstalledHandler = () => {
      // Hide the install prompt once the app is installed
      setDeferredPrompt(null);
      setIsAppInstalled(true);
      console.log('PWA was installed');
    };

    window.addEventListener('beforeinstallprompt', beforeInstallHandler);
    window.addEventListener('appinstalled', appInstalledHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallHandler);
      window.removeEventListener('appinstalled', appInstalledHandler);
    };
  }, []);
  
  // New useEffect for push notifications
  useEffect(() => {
    if (isPushSupported()) {
        setIsPushSupportedState(true);
        // Check initial subscription status
        getSubscription().then(sub => {
            if (sub) {
                setIsSubscribed(true);
            }
            setSubscriptionLoading(false);
        });
    } else {
        setSubscriptionLoading(false);
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the A2HS prompt');
    } else {
      console.log('User dismissed the A2HS prompt');
    }
    // The `appinstalled` event will be fired if the user accepts.
    // If dismissed, the button will remain available.
  };
  
  const handleSubscriptionToggle = async () => {
    setSubscriptionLoading(true);
    if (isSubscribed) {
        try {
            await unsubscribeUser();
            setIsSubscribed(false);
        } catch (error) {
            console.error('Failed to unsubscribe', error);
        }
    } else {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                await subscribeUser();
                setIsSubscribed(true);
            } else {
                console.warn('Notification permission denied.');
            }
        } catch (error) {
            console.error('Failed to subscribe', error);
        }
    }
    setSubscriptionLoading(false);
  };

  const handleSendTestNotification = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'show-test-notification' });
    } else {
        console.error("Service worker not active or not supported.");
    }
  }


  if (!user) return null;

  const isCitizen = user.role === Role.Citizen;
  const isOrg = user.role === Role.NGO || user.role === Role.PublicWorker;

  // --- DATA FOR WIDGETS ---
    const userRequests = requests.filter(r => r.userId === user.id);
    const userOfferings = offerings.filter(o => o.userId === user.id);
    const userHelpedRequests = requests.filter(r => r.helperId === user.id && r.status === RequestStatus.Fulfilled);
    const userTapestryThreads = tapestryThreads.filter(t => t.honoreeUserId === user.id);
    const userCreatedEvents = communityEvents.filter(e => e.organizerId === user.id);

  // --- ACHIEVEMENTS LOGIC ---
  const achievements: Achievement[] = [
    {
        id: 'first_echo',
        title: t('constellation.achievements.firstEcho.title'),
        description: t('constellation.achievements.firstEcho.description'),
        icon: MessageSquare,
        isUnlocked: userRequests.length > 0,
    },
    {
        id: 'first_offering',
        title: t('constellation.achievements.firstOffering.title'),
        description: t('constellation.achievements.firstOffering.description'),
        icon: HeartHandshake,
        isUnlocked: userOfferings.length > 0 || userHelpedRequests.length > 0,
    },
    {
        id: 'compassionate_voice',
        title: t('constellation.achievements.compassionateVoice.title'),
        description: t('constellation.achievements.compassionateVoice.description'),
        icon: Heart,
        isUnlocked: userOfferings.filter(o => o.type === 'Encouragement').length >= 3,
    },
    {
        id: 'community_pillar',
        title: t('constellation.achievements.communityPillar.title'),
        description: t('constellation.achievements.communityPillar.description'),
        icon: Building,
        isUnlocked: userHelpedRequests.length >= 2,
    },
    {
        id: 'beacon_of_hope',
        title: t('constellation.achievements.beaconOfHope.title'),
        description: t('constellation.achievements.beaconOfHope.description'),
        icon: Sunrise,
        isUnlocked: userTapestryThreads.some(t => t.echoes >= 10),
    },
  ];

  // --- RECENT ACTIVITY LOGIC ---
  const allActivities: Activity[] = [
    ...userRequests.map(r => ({
        type: 'create_request' as const,
        timestamp: r.timestamp,
        description: t('constellation.activity.createdRequest', { title: r.title.substring(0, 30) }),
        icon: PlusCircle,
    })),
    ...userHelpedRequests.map(r => ({
        type: 'fulfill_request' as const,
        timestamp: r.timestamp,
        description: t('constellation.activity.helpedRequest', { title: r.title.substring(0, 30) }),
        icon: Handshake,
    })),
    ...userOfferings.filter(o => o.type === 'Encouragement').map(o => {
        const relatedRequest = requests.find(r => r.id === o.requestId);
        return {
            type: 'send_encouragement' as const,
            timestamp: o.timestamp,
            description: t('constellation.activity.sentEncouragement', { title: relatedRequest?.title.substring(0, 30) || t('constellation.activity.aRequest') }),
            icon: Heart,
        };
    }),
  ];
  const recentActivities = allActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 3);

  // --- BAR CHART LOGIC ---
  const breakdown = user.hopePointsBreakdown || {};
  const chartData: ChartData[] = [
    { label: t(`hopePointCategories.${HopePointCategory.CommunityBuilder}`), value: breakdown[HopePointCategory.CommunityBuilder] || 0, color: 'bg-emerald-400' },
    { label: t(`hopePointCategories.${HopePointCategory.SilentHero}`), value: breakdown[HopePointCategory.SilentHero] || 0, color: 'bg-sky-400' },
    { label: t(`hopePointCategories.${HopePointCategory.VoiceOfCompassion}`), value: breakdown[HopePointCategory.VoiceOfCompassion] || 0, color: 'bg-amber-400' },
    { label: t(`hopePointCategories.${HopePointCategory.CommunityGift}`), value: breakdown[HopePointCategory.CommunityGift] || 0, color: 'bg-purple-400' },
  ];
  const maxPoints = Math.max(...chartData.map(d => d.value), 1);

  const showInstallButton = deferredPrompt && !isAppInstalled;

  return (
    <div className="p-4 pb-24 space-y-6">
        <Card className="relative pt-12">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white border-4 border-[#D4AF37] rounded-full flex items-center justify-center shadow-lg">
                <SymbolIcon name={user.symbolicIcon} className="w-12 h-12 text-[#D4AF37]" />
            </div>
            <div className="text-center">
                 <div className="flex items-center justify-center gap-2">
                    <h1 className="text-3xl font-bold text-gray-800">{user.symbolicName}</h1>
                </div>
                <p className="text-sm bg-gray-100 text-gray-600 font-semibold inline-block px-3 py-1 rounded-full mt-2">{t(`roles.${user.role}`)}</p>
                
                 <div className="mt-4 text-sm text-gray-600 text-center space-y-2">
                    {user.location && (
                        <div className="flex items-center justify-center gap-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{user.location}</span>
                        </div>
                    )}
                    {user.bio && (
                        <p className="italic px-4">"{user.bio}"</p>
                    )}
                </div>
            </div>
            <div className="mt-4 pt-4 border-t flex justify-around text-center">
                 <div>
                    <p className="text-sm text-gray-500">{t('constellation.totalHopePoints')}</p>
                    <p className="text-3xl font-bold text-[#D4AF37] my-1">{user.hopePoints}</p>
                 </div>
                 {user.qrCodeUrl && (
                    <div className="border-l my-[-1rem] mx-2"></div>
                 )}
                 {user.qrCodeUrl && (
                     <div>
                        <p className="text-sm text-gray-500">{t('constellation.showQrCode')}</p>
                        <button onClick={() => setIsQrModalOpen(true)} className="inline-flex items-center justify-center gap-2 text-3xl my-1 p-2 rounded-full text-[#D4AF37] bg-amber-50 hover:bg-amber-100 transition-colors">
                            <QrCode className="w-6 h-6" />
                        </button>
                    </div>
                 )}
            </div>
        </Card>
      
      {isCitizen && (
        <Card>
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t('constellation.accolades.title')}</h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 text-center">
              {achievements.map(ach => (
                  <div key={ach.id} className="flex flex-col items-center" title={ach.description}>
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all duration-300 transform ${ach.isUnlocked ? 'bg-gradient-to-br from-yellow-100 to-amber-200 border-yellow-400 shadow-md scale-105' : 'bg-gray-100 border-gray-200'}`}>
                          <ach.icon className={`w-8 h-8 ${ach.isUnlocked ? 'text-amber-600' : 'text-gray-400'}`} />
                      </div>
                      <p className={`mt-2 text-xs font-semibold ${ach.isUnlocked ? 'text-gray-700' : 'text-gray-500'}`}>{ach.title}</p>
                  </div>
              ))}
          </div>
        </Card>
      )}
      
      {isCitizen && (
        <Card>
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t('constellation.activity.title')}</h2>
          {recentActivities.length > 0 ? (
              <ul className="space-y-4">
                  {recentActivities.map((act, index) => (
                      <li key={index} className="flex items-start space-x-3 rtl:space-x-reverse">
                          <div className="flex-shrink-0 pt-1">
                              <act.icon className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                              <p className="text-sm text-gray-700">{act.description}...</p>
                              <p className="text-xs text-gray-400">{timeSince(act.timestamp, t)}</p>
                          </div>
                      </li>
                  ))}
              </ul>
          ) : (
              <p className="text-sm text-center text-gray-500 py-4">{t('constellation.activity.noActivity')}</p>
          )}
        </Card>
      )}

      {isOrg && (
         <Card>
            <h2 className="text-xl font-bold text-gray-800 mb-4">{t('constellation.yourEvents')}</h2>
            {userCreatedEvents.length > 0 ? (
                <ul className="space-y-4">
                    {userCreatedEvents.slice(0, 3).map((event) => (
                        <li key={event.id} className="flex items-start space-x-3 rtl:space-x-reverse">
                            <div className="flex-shrink-0 pt-1">
                                <Calendar className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-700">{event.title}</p>
                                <p className="text-xs text-gray-400">{timeSince(event.timestamp, t)}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-center text-gray-500 py-4">{t('constellation.noEvents')}</p>
            )}
         </Card>
      )}

      <Card>
        <h2 className="text-xl font-bold text-gray-800 mb-4">{t('constellation.breakdownTitle')}</h2>
        <BarChart data={chartData} max={maxPoints} />
      </Card>
      
      <button onClick={() => navigate('/scanner')} className="w-full flex items-center justify-center py-3 px-4 bg-[#D4AF37] text-white rounded-lg font-bold hover:bg-opacity-90 transition-colors text-lg shadow-md active:scale-95">
        <ScanLine className="w-6 h-6 mx-2" /> {t('constellation.scanToGiveHope')}
      </button>

      <Card className="!p-2">
        <div className="space-y-2">
            <SettingsButton icon={Pencil} label={t('constellation.editProfile.title')} onClick={() => setIsEditModalOpen(true)} />
            <SettingsButton icon={Award} label={t('constellation.awardNominations')} />
            <SettingsButton icon={ShieldCheck} label={t('constellation.privacySettings')} />
            {isPushSupportedState && (
                <div className="flex gap-2">
                    <button
                        onClick={handleSubscriptionToggle}
                        disabled={isSubscriptionLoading}
                        className="w-full flex items-center justify-between text-left p-4 rounded-lg bg-white transition-colors duration-200 active:bg-gray-100 text-gray-700 disabled:opacity-50"
                    >
                         <div className="flex items-center">
                            {isSubscribed ? <BellOff className="w-5 h-5 mr-3 rtl:mr-0 rtl:ml-3 text-gray-500" /> : <Bell className="w-5 h-5 mr-3 rtl:mr-0 rtl:ml-3 text-gray-500" />}
                            <span className="font-semibold">
                                {isSubscriptionLoading ? t('constellation.notifications.loading') : (isSubscribed ? t('constellation.notifications.disable') : t('constellation.notifications.enable'))}
                            </span>
                        </div>
                    </button>
                    {isSubscribed && (
                        <button
                            onClick={handleSendTestNotification}
                            className="flex-shrink-0 flex items-center justify-center p-4 bg-white rounded-lg text-green-700 hover:bg-gray-50 active:bg-gray-100"
                            title={t('constellation.notifications.testTitle')}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    )}
                </div>
            )}
             {showInstallButton && (
              <SettingsButton icon={Download} label={t('constellation.installApp')} onClick={handleInstallClick} />
            )}
             <SettingsButton icon={LogOut} label={t('constellation.logout')} onClick={logout} isDestructive />
        </div>
      </Card>
      
      <EditProfileModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
      />
      <Modal 
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        title={t('constellation.qrCodeTitle')}
      >
        <div className="flex flex-col items-center justify-center p-4">
            {user.qrCodeUrl ? (
                <>
                    <img src={user.qrCodeUrl} alt={t('constellation.qrCodeTitle')} className="w-48 h-48" />
                    <p className="text-xs text-gray-500 mt-4">{t('constellation.qrCodeDesc', {name: user.symbolicName})}</p>
                </>
            ) : (
                <p className="text-gray-500">{t('constellation.qrCodeMissing')}</p>
            )}
        </div>
      </Modal>

    </div>
  );
};

export default Constellation;
