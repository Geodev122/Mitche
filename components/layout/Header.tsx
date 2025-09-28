import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Notification } from '../../types';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
    const { user } = useAuth();
    const { getNotificationsForUser, markAsRead } = useData();
    const [showNotifications, setShowNotifications] = useState(false);
    const navigate = useNavigate();

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
    
    const timeSince = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return `منذ ${Math.floor(interval)} سنة`;
        interval = seconds / 2592000;
        if (interval > 1) return `منذ ${Math.floor(interval)} شهر`;
        interval = seconds / 86400;
        if (interval > 1) return `منذ ${Math.floor(interval)} يوم`;
        interval = seconds / 3600;
        if (interval > 1) return `منذ ${Math.floor(interval)} ساعة`;
        interval = seconds / 60;
        if (interval > 1) return `منذ ${Math.floor(interval)} دقيقة`;
        return `منذ ${Math.floor(seconds)} ثانية`;
    };

    return (
        <header className="sticky top-0 bg-[#FBF9F4]/80 backdrop-blur-sm z-20 p-4 flex justify-between items-center border-b border-[#F1EADF]">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <img src="/awardlogo.png" alt="Mitché Logo" className="h-8 w-8" />
                <span className="text-lg font-bold text-[#3A3A3A]">Mitché</span>
            </div>
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
                    <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-[#F1EADF] overflow-hidden animate-fade-in-down">
                        <div className="p-3 font-bold text-gray-700 border-b">الإشعارات</div>
                        {notifications.length > 0 ? (
                           <ul className="max-h-96 overflow-y-auto">
                               {notifications.map(n => (
                                   <li key={n.id} onClick={() => handleNotificationClick(n)}
                                    className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${!n.isRead ? 'bg-amber-50' : ''}`}>
                                       <p className="text-sm text-gray-800">{n.message}</p>
                                       <p className="text-xs text-gray-400 mt-1">{timeSince(n.timestamp)}</p>
                                   </li>
                               ))}
                           </ul>
                        ) : (
                            <p className="p-4 text-sm text-center text-gray-500">لا توجد إشعارات جديدة.</p>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;