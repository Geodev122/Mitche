import * as React from 'react';
import { Bell, X, BookOpen, QrCode, Trophy, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Notification } from '../../types';
import * as ReactRouterDOM from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { timeSince } from '../../utils/time';
import SymbolIcon from '../ui/SymbolIcon';
import ResponsiveLogo from '../ui/ResponsiveLogo';
import ProfilePanel from './ProfilePanel';


import { useToast } from '../ui/Toast';

const Header: React.FC = () => {
    const { user } = useAuth();
    const { getNotificationsForUser, markAsRead, giveRitualPoint } = useData();
    const [showNotifications, setShowNotifications] = React.useState(false);
    const [isProfileOpen, setProfileOpen] = React.useState(false);
    const navigate = ReactRouterDOM.useNavigate();
    const { t } = useTranslation();
    const toast = useToast();

    if (!user) return null;

    const notifications = getNotificationsForUser(user.id);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleRitualClick = async () => {
        const today = new Date();
        const lastRitualDate = user.lastRitualTimestamp ? new Date(user.lastRitualTimestamp) : null;
        if (lastRitualDate && lastRitualDate.getUTCFullYear() === today.getUTCFullYear() && lastRitualDate.getUTCMonth() === today.getUTCMonth() && lastRitualDate.getUTCDate() === today.getUTCDate()) {
            toast.show(t('ritual.alreadyCompleted', 'You have already completed the daily ritual today.'), 'info');
            return;
        }

        try {
            const requestId = `ritual_${user.id}_${Date.now()}`;
            const res = await giveRitualPoint({ requestId });
            if (res.success) {
                toast.show(t('ritual.success', 'Daily ritual completed — Hope point awarded!'), 'success');
            } else {
                toast.show(t(res.messageKey || 'ritual.error', 'Unable to complete the ritual.'), 'error');
            }
        } catch (error) {
            console.error("Error completing ritual from header:", error);
            toast.show(t('ritual.error', 'Unable to complete the ritual.'), 'error');
        }
    };

    const handleBellClick = () => {
        setShowNotifications(true);
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }
        setShowNotifications(false);
        if (notification.type === 'Nomination') {
            navigate('/nomination');
        } else if (notification.requestId) {
            navigate(`/echoes/${notification.requestId}`);
        }
    };
    
    const getNotificationMessage = (n: Notification): string => {
        if (n.messageKey) {
            // FIX: Cast the result of the `t` function to a string to satisfy the function's return type.
            return t(n.messageKey, n.messageOptions) as string;
        }
        return n.message;
    }


    return (
        <>
            <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm z-20 p-2 sm:p-4 flex justify-between items-center border-b">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <ResponsiveLogo className="h-8 w-8" />
                    <span className="text-lg font-bold text-[#3A3A3A] hidden sm:inline">{t('appName')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <button onClick={handleBellClick} className="relative p-2 rounded-full hover:bg-gray-200/50">
                            <Bell className="w-6 h-6 text-gray-600" />
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center ring-2 ring-[#FBF9F4]">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    </div>
                                        {/* Show tapestry shortcut only for Citizen, NGO, Admin roles */}
                                        {(user.role === 'Citizen' || user.role === 'NGO' || user.role === 'Admin') && (
                                            <button onClick={() => navigate('/tapestry')} title={t('tapestry.menu', 'Tapestry')} className="p-2 rounded-full hover:bg-gray-200/50">
                                                <BookOpen className="w-6 h-6 text-gray-600" />
                                            </button>
                                        )}
                    {/* Ritual quick CTA */}
                    <button onClick={handleRitualClick} className="hidden sm:inline-flex items-center px-3 py-2 rounded-md bg-[var(--accent)] text-white text-sm">{t('nav.ritual', 'Daily Ritual')}</button>
                    <button onClick={() => {
                        // Open profile panel
                        setProfileOpen(true);
                    }} className="p-2 rounded-full hover:bg-gray-200/50">
                        <SymbolIcon name={user.symbolicIcon} className="w-6 h-6 text-gray-600" />
                    </button>
                    {/* Quick QR button: open profile panel and emit event to open QR modal */}
                    <button onClick={() => {
                        setProfileOpen(true);
                        // Dispatch an event that ProfilePanel listens for to open QR modal
                        window.dispatchEvent(new CustomEvent('mitche.openQr'));
                    }} title={t('constellation.showQrCode', 'Show QR')} className="p-2 rounded-full hover:bg-gray-200/50">
                        <QrCode className="w-6 h-6 text-gray-600" />
                    </button>
                </div>
            </header>
            {showNotifications && (
                 <div className="fixed inset-0 bg-black/50 z-50 flex flex-col justify-end" onClick={() => setShowNotifications(false)}>
                    <div 
                        className="bg-[#FBF9F4] rounded-t-2xl shadow-xl animate-slide-in-up flex flex-col h-[85vh] max-h-[600px]"
                        onClick={e => e.stopPropagation()}
                    >
                         <header className="flex-shrink-0 p-4 border-b border-[#F1EADF] flex justify-between items-center">
                            <h2 className="font-bold text-gray-700 text-lg">{t('notifications.title')}</h2>
                            <button onClick={() => setShowNotifications(false)} className="p-2 rounded-full hover:bg-gray-200/50">
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </header>
                        <div className="flex-grow overflow-y-auto">
                            {notifications.length > 0 ? (
                               <ul>
                                   {notifications.map(n => (
                                       <li key={n.id} onClick={() => handleNotificationClick(n)}
                                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${!n.isRead ? 'bg-amber-50' : ''}`}>
                                           <p className="text-sm text-gray-800">{getNotificationMessage(n)}</p>
                                           <p className="text-xs text-gray-400 mt-1">{timeSince(n.timestamp, t)}</p>
                                       </li>
                                   ))}
                               </ul>
                            ) : (
                                <div className="h-full flex flex-col justify-center items-center text-center text-gray-500 px-6">
                                    <Bell className="w-12 h-12 text-gray-300 mb-4" />
                                    <p className="font-semibold">{t('notifications.empty')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <ProfilePanel isOpen={isProfileOpen} onClose={() => setProfileOpen(false)} />
        </>
    );
};

export default Header;