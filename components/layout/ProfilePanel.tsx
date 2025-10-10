import * as React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Card from '../ui/Card';
import SymbolIcon from '../ui/SymbolIcon';
import Constellation from '../ui/Constellation';
import { Award, ShieldCheck, LogOut, Download, Pencil, MapPin, QrCode, ScanLine, Bell, BellOff, Send, ChevronRight, X, Info, Camera, Zap } from 'lucide-react';
import { HopePointCategory, Role } from '../../types';
import { useTranslation } from 'react-i18next';
import Modal from '../ui/Modal';
import EditProfileModal from '../ui/EditProfileModal';
import AchievementsPanel from '../ui/AchievementsPanel';
import * as ReactRouterDOM from 'react-router-dom';
import { isPushSupported, subscribeUser, unsubscribeUser, getSubscription } from '../../utils/notifications';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import { CogIcon, ArrowLeftOnRectangleIcon, ChevronRightIcon, UserCircleIcon } from '@heroicons/react/24/outline';


interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface SettingsButtonProps {
    icon: React.ElementType;
    label: string;
    onClick?: () => void;
    isDestructive?: boolean;
    children?: React.ReactNode;
}

const SettingsButton: React.FC<SettingsButtonProps> = ({icon: Icon, label, onClick, isDestructive, children}) => (
    <ReactRouterDOM.Link to={onClick ? '#' : ''} onClick={onClick} className={`w-full flex items-center text-left p-3 rounded-md transition-colors ${
            isDestructive 
                ? 'text-red-600 hover:bg-red-50' 
                : 'text-gray-700 hover:bg-gray-100'
        }`}>
        <Icon className="w-5 h-5 mr-3" />
        <span className="flex-grow">{label}</span>
        {children || <ChevronRightIcon className="w-5 h-5 text-gray-400" />}
    </ReactRouterDOM.Link>
);

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfilePanel: React.FC<ProfilePanelProps> = ({ isOpen, onClose }) => {
  const { user, logout, signOutUser } = useAuth();
  const { t } = useTranslation();
  const navigate = ReactRouterDOM.useNavigate();
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [isAppInstalled, setIsAppInstalled] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = React.useState(false);
  
  const [isPushSupportedState, setIsPushSupportedState] = React.useState(false);
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [isSubscriptionLoading, setSubscriptionLoading] = React.useState(true);
  const [cameraStatus, setCameraStatus] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);

  React.useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) setIsAppInstalled(true);

    const beforeInstallHandler = (e: Event) => {
      e.preventDefault();
      if (!isStandalone) setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const appInstalledHandler = () => {
      setDeferredPrompt(null);
      setIsAppInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', beforeInstallHandler);
    window.addEventListener('appinstalled', appInstalledHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallHandler);
      window.removeEventListener('appinstalled', appInstalledHandler);
    };
  }, []);

    // Listen for global QR open events (dispatched from Header)
    React.useEffect(() => {
        const handler = () => setIsQrModalOpen(true);
        window.addEventListener('mitche.openQr' as any, handler as any);
        return () => window.removeEventListener('mitche.openQr' as any, handler as any);
    }, []);
  
  React.useEffect(() => {
    if (isPushSupported()) {
        setIsPushSupportedState(true);
        getSubscription().then(sub => {
            setIsSubscribed(!!sub);
            setSubscriptionLoading(false);
        });
    } else {
        setSubscriptionLoading(false);
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
  };
  
  const handleSubscriptionToggle = async () => {
    setSubscriptionLoading(true);
    if (isSubscribed) {
        await unsubscribeUser();
        setIsSubscribed(false);
    } else {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            await subscribeUser();
            setIsSubscribed(true);
        }
    }
    setSubscriptionLoading(false);
  };
  
  const handleCameraAccess = async () => {
    setCameraStatus(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraStatus({ message: t('constellation.cameraNotSupported'), type: 'error' });
        setTimeout(() => setCameraStatus(null), 4000);
        return;
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraStatus({ message: t('constellation.cameraAccessGranted'), type: 'success' });
        // Stop the stream tracks immediately after getting permission
        stream.getTracks().forEach(track => track.stop());
    } catch (err) {
        console.error("Camera access denied:", err);
        setCameraStatus({ message: t('constellation.cameraAccessDenied'), type: 'error' });
    }
     setTimeout(() => setCameraStatus(null), 4000);
  };

  const handleSendTestNotification = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'show-test-notification' });
    }
  }

  const handleNavigation = (path: string) => {
    onClose();
    navigate(path);
  }

    // Data context wiring for profile actions
    const { giveDailyPoint, sendEncouragement, communityEvents: allEvents, requests: allRequests } = useData();

    const handleGiveDailyPoint = async () => {
        if (!user) return;
        const res = await giveDailyPoint(user.id);
        if (res && res.success) {
            // show a small success toast via cameraStatus for now
            setCameraStatus({ message: t('scanner.success.giftSent', { name: res.receiverName || user.symbolicName }), type: 'success' });
            setTimeout(() => setCameraStatus(null), 3000);
        } else {
            setCameraStatus({ message: t(res.messageKey || 'scanner.error.server'), type: 'error' });
            setTimeout(() => setCameraStatus(null), 3000);
        }
    };

    const handleMotivate = async () => {
        if (!user) return;
        const message = t('profile.motivate.defaultMessage', 'Keep going — you are not alone!');
        const res = await sendEncouragement(user.id, message);
        if (res && res.success) {
            setCameraStatus({ message: t('profile.motivate.sent'), type: 'success' });
            setTimeout(() => setCameraStatus(null), 3000);
        } else {
            setCameraStatus({ message: t(res.messageKey || 'scanner.error.server'), type: 'error' });
            setTimeout(() => setCameraStatus(null), 3000);
        }
    };

  const handleLogout = async () => {
    try {
        await signOutUser();
        // Optional: redirect to login page or show a toast
    } catch (error) {
        console.error("Error signing out: ", error);
    }
};

  if (!user) return null;

  const isOrg = user.role === Role.NGO || user.role === Role.PublicWorker;
    const showAnalytics = [Role.Admin, Role.NGO, Role.PublicWorker].includes(user.role as Role);
  const showInstallButton = deferredPrompt && !isAppInstalled;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div 
        className={`fixed top-0 right-0 rtl:right-auto rtl:left-0 h-full w-full max-w-sm bg-[#FBF9F4] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full rtl:-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
            <header className="flex-shrink-0 p-4 border-b border-[#F1EADF] flex justify-between items-center">
                <h2 className="font-bold text-gray-700 text-lg flex items-center gap-2">
                    <SymbolIcon name={user.symbolicIcon} className="w-6 h-6 text-gray-600" />
                    {user.symbolicName}
                </h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200/50">
                    <X className="w-5 h-5 text-gray-600" />
                </button>
            </header>
            
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                <Card>
                    <div className="text-center">
                        <p className="text-sm bg-gray-100 text-gray-600 font-semibold inline-block px-3 py-1 rounded-full">{t(`roles.${user.role}`)}</p>
                        {user.isVerified && <p className="mt-2 text-xs font-bold text-blue-600 flex items-center justify-center gap-1"><ShieldCheck size={14}/> {t('verifiedOrg')}</p>}
                        
                        {(isOrg && user.verificationStatus !== 'Approved') && (
                            <div className={`mt-2 text-xs font-bold p-2 rounded-md flex items-center justify-center gap-1 ${user.verificationStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                               <Info size={14}/> {user.verificationStatus === 'Pending' ? t('profile.verificationPending') : t('profile.verificationRejected')}
                            </div>
                        )}

                        <div className="mt-4 text-sm text-gray-600 text-center space-y-2">
                            {user.location && (
                                <div className="flex items-center justify-center gap-1">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span>{user.location}</span>
                                </div>
                            )}
                            {user.bio && <p className="italic px-4">"{user.bio}"</p>}
                        </div>
                    </div>
                    {user.qrCodeUrl && (
                        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-center">
                            <button onClick={() => setIsQrModalOpen(true)} className="mt-3 p-2 rounded-full hover:bg-gray-200/50">
                                <QrCode className="w-6 h-6" />
                            </button>
                        </div>
                    )}
                </Card>

                                {/* Profile action CTAs: Give daily point and Motivate */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={handleGiveDailyPoint} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white rounded-lg font-bold hover:bg-opacity-90 transition-colors text-sm shadow-sm active:scale-95">
                                            <Send className="w-4 h-4" /> {t('profile.giveDaily', 'Give daily Hope Point')}
                                    </button>
                                    <button onClick={handleMotivate} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-opacity-90 transition-colors text-sm shadow-sm active:scale-95">
                                            <Zap className="w-4 h-4" /> {t('profile.motivate', 'Motivate')}
                                    </button>
                                </div>

                                {/* List user's events and requests */}
                                <Card>
                                    <h3 className="font-bold text-gray-700 mb-3">{t('profile.yourEvents', 'Your Events')}</h3>
                                    <div className="space-y-2">
                                        {allEvents.filter(e => e.organizerId === user.id).map(ev => (
                                            <div key={ev.id} className="p-2 border rounded flex justify-between items-center">
                                                <div>
                                                    <div className="font-medium">{ev.title}</div>
                                                    <div className="text-xs text-gray-500">{ev.region}</div>
                                                </div>
                                                <div>
                                                    <button onClick={() => handleNavigation(`/events/${ev.id}`)} className="px-2 py-1 bg-gray-100 rounded text-sm">{t('open', 'Open')}</button>
                                                </div>
                                            </div>
                                        ))}
                                        {allEvents.filter(e => e.organizerId === user.id).length === 0 && <div className="text-xs text-gray-500">{t('profile.noEvents', 'No events yet')}</div>}
                                    </div>
                                </Card>

                                <Card>
                                    <h3 className="font-bold text-gray-700 mb-3">{t('profile.yourRequests', 'Your Requests')}</h3>
                                    <div className="space-y-2">
                                        {allRequests.filter(r => r.userId === user.id).map(req => (
                                            <div key={req.id} className="p-2 border rounded flex justify-between items-center">
                                                <div>
                                                    <div className="font-medium">{req.title}</div>
                                                    <div className="text-xs text-gray-500">{req.region}</div>
                                                </div>
                                                <div>
                                                    <button onClick={() => handleNavigation(`/echoes/${req.id}`)} className="px-2 py-1 bg-gray-100 rounded text-sm">{t('open', 'Open')}</button>
                                                </div>
                                            </div>
                                        ))}
                                        {allRequests.filter(r => r.userId === user.id).length === 0 && <div className="text-xs text-gray-500">{t('profile.noRequests', 'No requests yet')}</div>}
                                    </div>
                                </Card>

                {user.commendations && Object.keys(user.commendations).length > 0 && (
                    <Card>
                        <h3 className="font-bold text-gray-700 mb-3">{t('commendations.title')}</h3>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(user.commendations).map(([type, count]) => (
                                <span key={type} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-50 to-white text-amber-700 text-sm font-semibold shadow-sm">
                                    <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                    {t(`commendations.types.${type}`)}
                                    <span className="ml-2 text-xs text-gray-600 bg-white rounded-full px-2 py-0.5">{count}</span>
                                </span>
                            ))}
                        </div>
                    </Card>
                )}
                {user.badges && user.badges.length > 0 && (
                    <Card>
                        <h3 className="font-bold text-gray-700 mb-3">{t('achievements.title', 'Accolades & Badges')}</h3>
                        <div className="flex flex-wrap gap-2">
                            {user.badges.map((b: string) => (
                                <div key={b} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-white to-amber-50 text-amber-700 text-sm font-semibold shadow-sm">
                                    <img src={`/badges/${b}.png`} alt={b} width={20} height={20} className="w-5 h-5 rounded-full" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                    {b}
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
                {/* Achievements list */}
                <AchievementsPanel />
                
                <button onClick={() => handleNavigation('/scanner')} className="w-full flex items-center justify-center py-3 px-4 bg-[#D4AF37] text-white rounded-lg font-bold hover:bg-opacity-90 transition-colors text-md shadow-sm active:scale-95">
                    <ScanLine className="w-5 h-5 mx-2" /> {t('constellation.scanToGiveHope')}
                </button>

                 <Card className="!p-2">
                    <div className="space-y-1">
                        <SettingsButton icon={Pencil} label={t('constellation.editProfile.title')} onClick={() => setIsEditModalOpen(true)} />
                        <SettingsButton icon={Award} label={t('constellation.awardNominations')} onClick={() => handleNavigation('/nomination')} />
                        <SettingsButton icon={ShieldCheck} label={t('constellation.privacySettings')} />
                        {/* Integrate Advanced Search into sidebar */}
                        <SettingsButton icon={MapPin} label={t('search.advanced', 'Advanced Search')} onClick={() => handleNavigation('/search')} />
                    </div>
                </Card>
                 <Card className="!p-2">
                    <div className="space-y-1">
                        {user.role === Role.Admin && (
                            <SettingsButton icon={ShieldCheck} label={t('nav.admin', 'Admin')} onClick={() => handleNavigation('/admin')} />
                        )}
                        {isPushSupportedState && (
                             <SettingsButton
                                icon={isSubscribed ? BellOff : Bell}
                                label={isSubscriptionLoading ? t('constellation.notifications.loading') : (isSubscribed ? t('constellation.notifications.disable') : t('constellation.notifications.enable'))}
                                onClick={handleSubscriptionToggle}
                             />
                        )}
                        {showInstallButton && <SettingsButton icon={Download} label={t('constellation.installApp')} onClick={handleInstallClick} />}
                        <SettingsButton icon={Camera} label={t('constellation.accessCamera')} onClick={handleCameraAccess}>
                            {cameraStatus && (
                                <div className={`mt-1 p-2 text-xs rounded-md text-center animate-fade-in-down ${cameraStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {cameraStatus.message}
                                </div>
                            )}
                        </SettingsButton>
                                {showAnalytics && (
                                    <SettingsButton icon={Zap} label={t('analytics.title', 'Analytics')} onClick={() => handleNavigation('/analytics')} />
                                )}
                                <SettingsButton icon={ArrowLeftOnRectangleIcon} label={t('profile.logout')} onClick={handleLogout} isDestructive />
                    </div>
                </Card>

                 <div className="pt-2">
                    <LanguageSwitcher />
                </div>
            </div>
        </div>
      </div>

      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} user={user} />
      <Modal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} title={t('constellation.qrCodeTitle')}>
        <div className="flex flex-col items-center justify-center p-4">
            {user.qrCodeUrl ? (
                <>
                    <img src={user.qrCodeUrl} alt={t('constellation.qrCodeTitle')} className="w-48 h-48" />
                    <p className="text-xs text-gray-500 mt-4">{t('constellation.qrCodeDesc', {name: user.symbolicName})}</p>
                </>
            ) : <p className="text-gray-500">{t('constellation.qrCodeMissing')}</p>}
        </div>
      </Modal>
    </>
  );
};

export default ProfilePanel;