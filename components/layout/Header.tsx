import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Notification } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import { timeSince } from '../../utils/time';

const Header: React.FC = () => {
    const { user } = useAuth();
    const { getNotificationsForUser, markAsRead } = useData();
    const [showNotifications, setShowNotifications] = useState(false);
    const navigate = useNavigate();
    const { t } = useTranslation();

    if (!user) return null;

    const notifications = getNotificationsForUser(user.id);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleBellClick = () => {
        setShowNotifications(!showNotifications);
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }
        setShowNotifications(false);
        if (notification.type === 'Nomination') {
            navigate('/nomination');
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
        <header className="sticky top-0 bg-[#FBF9F4]/80 backdrop-blur-sm z-20 p-2 sm:p-4 flex justify-between items-center border-b border-[#F1EADF] relative">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <img src="/awardlogo.png" alt="Mitché Logo" className="h-8 w-8" />
                <span className="text-lg font-bold text-[#3A3A3A] hidden sm:inline">{t('appName')}</span>
            </div>
            <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <div className="relative">
                    <button onClick={handleBellClick} className="relative p-2 rounded-full hover:bg-gray-200/50">
                        <Bell className="w-6 h-6 text-gray-600" />
                        {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center ring-2 ring-[#FBF9F4]">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                    {showNotifications && (
                        <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-80 max-w-[calc(100vw-1rem)] bg-white rounded-lg shadow-xl border border-[#F1EADF] overflow-hidden animate-fade-in-down z-50">
                            {/* Arrow pointer */}
                            <div className="absolute -top-2 right-4 rtl:right-auto rtl:left-4 w-4 h-4 bg-white border-l border-t border-[#F1EADF] transform rotate-45"></div>
                            <div className="p-3 font-bold text-gray-700 border-b">{t('notifications.title')}</div>
                            {notifications.length > 0 ? (
                               <ul className="max-h-96 overflow-y-auto">
                                   {notifications.map(n => (
                                       <li key={n.id} onClick={() => handleNotificationClick(n)}
                                        className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${!n.isRead ? 'bg-amber-50' : ''}`}>
                                           <p className="text-sm text-gray-800">{getNotificationMessage(n)}</p>
                                           <p className="text-xs text-gray-400 mt-1">{timeSince(n.timestamp, t)}</p>
                                       </li>
                                   ))}
                               </ul>
                            ) : (
                                <p className="p-4 text-sm text-center text-gray-500">{t('notifications.empty')}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {/* Overlay to close notifications when clicking outside */}
            {showNotifications && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowNotifications(false)}
                ></div>
            )}
        </header>
    );
};

export default Header;
