import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Card from '../components/ui/Card';
import { Users, MessageSquare, Calendar, Shield, ShieldCheck, Check, X, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { User, VerificationStatus } from '../types';
import SymbolIcon from '../components/ui/SymbolIcon';

const StatCard: React.FC<{ icon: React.ElementType, value: number, label: string }> = ({ icon: Icon, value, label }) => (
    <Card className="flex items-center p-4">
        <div className="p-3 bg-gray-100 rounded-full mr-4 rtl:mr-0 rtl:ml-4">
            <Icon className="w-6 h-6 text-[#D4AF37]" />
        </div>
        <div>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
        </div>
    </Card>
);

const VerificationStatusBadge: React.FC<{ status?: VerificationStatus }> = ({ status }) => {
    const { t } = useTranslation();
    if (!status || status === 'NotRequested') return null;

    const styles = {
        Pending: 'bg-yellow-100 text-yellow-700',
        Approved: 'bg-green-100 text-green-700',
        Rejected: 'bg-red-100 text-red-700',
    };
    
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
            {t(`verificationStatus.${status}`)}
        </span>
    );
};


const UserRow: React.FC<{ user: User }> = ({ user }) => {
    const { t } = useTranslation();
    return (
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border gap-2">
            <div className="flex items-center space-x-3 rtl:space-x-reverse flex-grow min-w-0">
                <SymbolIcon name={user.symbolicIcon} className="w-8 h-8 text-gray-500 flex-shrink-0" />
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-gray-800 truncate" title={user.symbolicName}>{user.symbolicName}</p>
                        {user.isVerified && <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0" title={t('verifiedOrg') as string} />}
                    </div>
                    <p className="text-xs text-gray-500 truncate" title={user.username}>@{user.username} - {t(`roles.${user.role}`)}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 text-right">
                 <div className="w-12">
                    <p className="font-bold text-sm text-amber-600">{user.hopePoints}</p>
                    <p className="text-xs text-gray-500">{t('leaderboard.points')}</p>
                </div>
                <div className="w-24">
                    <VerificationStatusBadge status={user.verificationStatus} />
                </div>
            </div>
        </div>
    );
};


const AdminDashboard: React.FC = () => {
    const { getAllUsers, user, updateVerificationStatus } = useAuth();
    const { requests, communityEvents, loading } = useData();
    const { t } = useTranslation();
    const [users, setUsers] = React.useState<User[]>([]);

    const refreshUsers = React.useCallback(() => {
        setUsers(getAllUsers());
    }, [getAllUsers]);

    React.useEffect(() => {
        refreshUsers();
    }, [refreshUsers]);

    const handleVerificationAction = (userId: string, status: 'Approved' | 'Rejected') => {
        updateVerificationStatus(userId, status);
        refreshUsers();
    };
    
    const pendingUsers = users.filter(u => u.verificationStatus === 'Pending');

    return (
        <div className="p-4 pb-24 space-y-6">
            <header className="my-6">
                 <div className="text-center">
                    <Shield className="w-12 h-12 mx-auto text-[#3A3A3A] mb-2"/>
                    <h1 className="text-3xl font-bold text-gray-800">{t('admin.title')}</h1>
                    <p className="text-md text-gray-500 mt-1">{t('admin.subtitle')}</p>
                </div>
                <p className="text-center text-lg text-gray-600 mt-4">{t('sanctuary.welcome', { name: user?.symbolicName })}</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                    <p>{t('admin.loading')}</p>
                ) : (
                    <>
                        <StatCard icon={Users} value={users.length} label={t('admin.totalUsers')} />
                        <StatCard icon={MessageSquare} value={requests.length} label={t('admin.totalRequests')} />
                        <StatCard icon={Calendar} value={communityEvents.length} label={t('admin.totalEvents')} />
                    </>
                )}
            </div>

            <Card>
                <h2 className="text-xl font-bold text-gray-800 mb-4">{t('admin.verificationRequests')}</h2>
                {pendingUsers.length > 0 ? (
                    <div className="space-y-2">
                        {pendingUsers.map(u => (
                             <div key={u.id} className="flex items-center justify-between p-3 bg-amber-50/50 rounded-lg border border-amber-200">
                                <div className="flex items-center space-x-3 rtl:space-x-reverse min-w-0">
                                    <SymbolIcon name={u.symbolicIcon} className="w-8 h-8 text-amber-700 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="font-semibold text-gray-800 truncate">{u.symbolicName}</p>
                                        <p className="text-xs text-gray-500 truncate">@{u.username} - {t(`roles.${u.role}`)}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                     <button onClick={() => handleVerificationAction(u.id, 'Rejected')} className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors" title={t('admin.reject') as string}>
                                        <X size={16} />
                                     </button>
                                     <button onClick={() => handleVerificationAction(u.id, 'Approved')} className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors" title={t('admin.approve') as string}>
                                        <Check size={16} />
                                     </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-6">
                        <Clock className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                        <p>{t('admin.noPendingRequests')}</p>
                    </div>
                )}
            </Card>
            
             <Card>
                <h2 className="text-xl font-bold text-gray-800 mb-4">{t('admin.userManagement')}</h2>
                <div className="space-y-2">
                    {users.map(u => <UserRow key={u.id} user={u} />)}
                </div>
            </Card>

        </div>
    );
};

export default AdminDashboard;
